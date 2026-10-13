import Link from 'next/link';
import { BadgeCheck, Heart, MapPin, Trash2 } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { requireAuthenticatedUser } from '@/lib/session';

export default async function FavoritesPage() {
  const user = await requireAuthenticatedUser('/favorites');

  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    include: {
      product: {
        include: {
          images: { take: 1 },
          seller: { select: { name: true, membership: true, premiumStatus: true, premiumEndDate: true } },
        },
      },
    },
  });

  return (
    <div className="container-shell py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-primary">Saved</p>
          <h1 className="text-3xl font-black text-slate-900">My favorites</h1>
        </div>
        <div className="rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-primary">{favorites.length} items</div>
      </div>

      {favorites.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {favorites.map((favorite) => (
            <div key={favorite.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
              <div className="relative h-52">
                <img src={favorite.product.images[0]?.url ?? 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1200&q=80'} alt={favorite.product.title} className="h-full w-full object-cover" />
              </div>
              <div className="p-4">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <Link href={`/products/${favorite.product.slug}`} className="font-bold text-slate-900 hover:text-primary">
                    {favorite.product.title}
                  </Link>
                  <button className="rounded-full bg-slate-100 p-2 text-slate-600"><Trash2 className="h-4 w-4" /></button>
                </div>
                <div className="text-xl font-black text-primary">${favorite.product.price.toFixed(2)}</div>
                <div className="mt-2 flex items-center gap-2 text-sm text-slate-500"><MapPin className="h-4 w-4 text-primary" /> {favorite.product.province}</div>
                <div className="mt-3 flex items-center gap-1 text-sm text-slate-600">
                  Seller: {favorite.product.seller.name}
                  {favorite.product.seller.membership === 'PREMIUM'
                    && favorite.product.seller.premiumStatus === 'ACTIVE'
                    && (!favorite.product.seller.premiumEndDate || favorite.product.seller.premiumEndDate > new Date())
                    ? <BadgeCheck aria-label="Premium seller" className="h-4 w-4 text-amber-600" />
                    : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-16 text-center text-slate-500">
          <Heart className="mx-auto mb-4 h-10 w-10 text-primary" />
          No favorites yet. Start saving items you love.
        </div>
      )}
    </div>
  );
}
