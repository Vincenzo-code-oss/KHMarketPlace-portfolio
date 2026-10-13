import Image from 'next/image';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser, hasActivePremium } from '@/lib/session';
import { redirect } from 'next/navigation';
import { ProductActions } from './ProductActions';

export default async function MyProductsPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect('/login?next=%2Fmy-products');
  const listings = await prisma.product.findMany({
    where: { sellerId: user.id },
    include: { images: { take: 1 }, category: true },
    orderBy: { createdAt: 'desc' },
  });
  const premium = hasActivePremium(user);

  return (
    <div className="container-shell py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-primary">Seller center</p>
          <h1 className="text-3xl font-black text-slate-900">My Products</h1>
          <p className="mt-1 text-sm text-slate-500">{listings.length} listing{listings.length === 1 ? '' : 's'} · {premium ? 'Premium membership active' : 'Free membership'}</p>
        </div>
        {premium ? (
          <Link href="/sell" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 font-semibold text-white"><Plus className="h-4 w-4" /> Add Product</Link>
        ) : (
          <Link href="/premium" className="rounded-xl bg-primary px-4 py-3 font-semibold text-white">Upgrade to Premium</Link>
        )}
      </div>

      {listings.length ? (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600"><tr><th className="px-5 py-3">Product</th><th className="px-5 py-3">Price</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Actions</th></tr></thead>
              <tbody>
                {listings.map((item) => (
                  <tr key={item.id} className="border-t border-slate-200">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-slate-100">
                          <Image src={item.images[0]?.url ?? 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80'} alt={item.title} fill sizes="48px" unoptimized={item.images[0]?.url.startsWith('data:')} className="object-cover" />
                        </div>
                        <div><div className="font-semibold text-slate-900">{item.title}</div><div className="text-xs text-slate-500">{item.category.name}</div></div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-primary">${item.price.toFixed(2)}</td>
                    <td className="px-5 py-4 text-slate-600">{item.isActive ? 'Active' : 'Removed'}</td>
                    <td className="px-5 py-4"><ProductActions productId={item.id} isActive={item.isActive} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-14 text-center text-slate-500">You have no product listings yet.</div>
      )}
    </div>
  );
}
