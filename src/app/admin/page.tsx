import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { requireUserRole } from '@/lib/session';
import { AdminProductActions, AdminUserActions } from './AdminActions';

export default async function AdminPage() {
  await requireUserRole('ADMIN', '/admin');
  const [users, products, reports] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, username: true, email: true, role: true, membership: true, premiumStatus: true, premiumEndDate: true, isVerified: true, createdAt: true },
    }),
    prisma.product.findMany({
      include: { seller: { select: { name: true, username: true } }, category: true, images: { take: 1 } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.report.count(),
  ]);
  const premiumUsers = users.filter((user) => user.membership === 'PREMIUM' && user.premiumStatus === 'ACTIVE' && (!user.premiumEndDate || user.premiumEndDate > new Date()));

  return (
    <div className="container-shell space-y-8 py-8">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.2em] text-primary">Admin</p>
        <h1 className="text-3xl font-black text-slate-900">Marketplace management</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[['Users', users.length], ['Premium users', premiumUsers.length], ['Products', products.length], ['Reports', reports]].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            <div className="text-sm text-slate-500">{label}</div>
            <div className="mt-2 text-2xl font-black text-slate-900">{value}</div>
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-xl font-bold text-slate-900">All users</h2>
          <p className="mt-1 text-sm text-slate-500">Manage Premium access and account verification.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600"><tr><th className="px-5 py-3">User</th><th className="px-5 py-3">Role</th><th className="px-5 py-3">Membership</th><th className="px-5 py-3">Joined</th><th className="px-5 py-3">Actions</th></tr></thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-slate-200">
                  <td className="px-5 py-4"><div className="font-semibold text-slate-900">{user.name} <span className="text-xs font-normal text-slate-500">@{user.username}</span></div><div className="text-xs text-slate-500">{user.email}</div></td>
                  <td className="px-5 py-4 text-slate-600">{user.role}</td>
                  <td className="px-5 py-4"><span className={user.membership === 'PREMIUM' && user.premiumStatus === 'ACTIVE' && (!user.premiumEndDate || user.premiumEndDate > new Date()) ? 'rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800' : 'rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600'}>{user.membership === 'PREMIUM' && user.premiumStatus === 'ACTIVE' && (!user.premiumEndDate || user.premiumEndDate > new Date()) ? 'PREMIUM' : 'FREE'}</span></td>
                  <td className="px-5 py-4 text-slate-600">{user.createdAt.toLocaleDateString()}</td>
                  <td className="px-5 py-4"><AdminUserActions userId={user.id} membership={user.membership} isVerified={user.isVerified} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-xl font-bold text-slate-900">Premium users</h2>
          <p className="mt-1 text-sm text-slate-500">Accounts with an active Premium membership.</p>
        </div>
        {premiumUsers.length ? (
          <div className="divide-y divide-slate-100">
            {premiumUsers.map((user) => <div key={user.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"><div><div className="font-semibold text-slate-900">{user.name}</div><div className="text-sm text-slate-500">{user.email}</div></div><div className="text-sm text-slate-600">Renews/expires {user.premiumEndDate?.toLocaleDateString() ?? 'not set'}</div></div>)}
          </div>
        ) : <p className="p-5 text-sm text-slate-500">No active Premium memberships.</p>}
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-xl font-bold text-slate-900">All products</h2>
          <p className="mt-1 text-sm text-slate-500">Remove inappropriate listings from the marketplace.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600"><tr><th className="px-5 py-3">Product</th><th className="px-5 py-3">Seller</th><th className="px-5 py-3">Price</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Action</th></tr></thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t border-slate-200">
                  <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="relative h-12 w-12 overflow-hidden rounded-lg bg-slate-100"><Image src={product.images[0]?.url ?? 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80'} alt={product.title} fill sizes="48px" unoptimized={product.images[0]?.url.startsWith('data:')} className="object-cover" /></div><div><div className="font-semibold text-slate-900">{product.title}</div><div className="text-xs text-slate-500">{product.category.name}</div></div></div></td>
                  <td className="px-5 py-4 text-slate-600">{product.seller.name} (@{product.seller.username})</td>
                  <td className="px-5 py-4 font-semibold text-primary">${product.price.toFixed(2)}</td>
                  <td className="px-5 py-4 text-slate-600">{product.isActive ? 'Active' : 'Removed'}</td>
                  <td className="px-5 py-4"><AdminProductActions productId={product.id} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
