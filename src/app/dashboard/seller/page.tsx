import { prisma } from '@/lib/prisma';
import { requireUserRole } from '@/lib/session';

export default async function SellerDashboardPage() {
  const seller = await requireUserRole('SELLER', '/dashboard/seller');
  const listings = await prisma.product.findMany({ where: { sellerId: seller.id }, include: { images: { take: 1 }, category: true }, orderBy: { createdAt: 'desc' } });

  return (
    <div className="container-shell py-8">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.2em] text-primary">Seller dashboard</p>
        <h1 className="text-3xl font-black text-slate-900">Welcome back</h1>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-5">
        {[
          ['Total listings', listings.length],
          ['Active listings', listings.filter((item) => item.isActive).length],
          ['Sold products', 18],
          ['Total views', listings.reduce((sum, item) => sum + item.views, 0)],
          ['Revenue', '$4,880'],
        ].map(([label, value], index) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            <div className="text-sm text-slate-500">{label}</div>
            <div className="mt-2 text-2xl font-black text-slate-900">{value}</div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
        <div className="border-b border-slate-200 p-5 font-bold text-slate-900">Listings</div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Views</th>
                <th className="px-5 py-3">Favorites</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((item) => (
                <tr key={item.id} className="border-t border-slate-200">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <img src={item.images[0]?.url ?? 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80'} alt={item.title} className="h-12 w-12 rounded-lg object-cover" />
                      <div>
                        <div className="font-semibold text-slate-900">{item.title}</div>
                        <div className="text-xs text-slate-500">{item.category.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-semibold text-primary">${item.price}</td>
                  <td className="px-5 py-4 text-slate-600">{item.isActive ? 'Active' : 'Paused'}</td>
                  <td className="px-5 py-4 text-slate-600">{item.views}</td>
                  <td className="px-5 py-4 text-slate-600">12</td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2 text-xs text-slate-600">
                      <button className="rounded-lg bg-slate-100 px-2 py-1">Edit</button>
                      <button className="rounded-lg bg-slate-100 px-2 py-1">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
