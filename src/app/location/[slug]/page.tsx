import Link from 'next/link';
import { ProductCard } from '@/components/ui/ProductCard';
import { prisma } from '@/lib/prisma';

export default async function LocationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const label = slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

  const products = await prisma.product.findMany({
    where: { province: { contains: label } },
    include: { category: true, seller: { select: { name: true, avatar: true, username: true } }, images: { take: 1 } },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="container-shell py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-primary">Locations</p>
          <h1 className="text-3xl font-black text-slate-900">{label}</h1>
        </div>
        <Link href="/search" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
          Browse all
        </Link>
      </div>

      {products.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">No products currently listed in {label}.</div>
      )}
    </div>
  );
}
