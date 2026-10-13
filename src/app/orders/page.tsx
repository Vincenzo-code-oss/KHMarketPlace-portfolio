import { prisma } from '@/lib/prisma';
import { requireAuthenticatedUser } from '@/lib/session';

export default async function OrdersPage() {
  const buyer = await requireAuthenticatedUser('/orders');
  const orders = await prisma.order.findMany({
    where: { buyerId: buyer.id },
    include: {
      orderItems: {
        include: {
          product: {
            include: {
              images: {
                take: 1,
              },
            },
          },
        },
      },
    },
  });

  return (
    <div className="container-shell py-8">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.2em] text-primary">Orders</p>
        <h1 className="text-3xl font-black text-slate-900">My purchases</h1>
      </div>

      <div className="space-y-5">
        {orders.length > 0 ? (
          orders.map((order) => (
            <div key={order.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-500">Order #{order.id.slice(0, 8)}</div>
                  <div className="text-xl font-bold text-slate-900">Status: {order.status}</div>
                </div>
                <div className="text-xl font-black text-primary">${order.total.toFixed(2)}</div>
              </div>

              {order.orderItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between border-t border-slate-200 py-3">
                  <div className="flex items-center gap-3">
                    <img src={item.product.images[0]?.url ?? 'https://images.unsplash.com/photo-1580910051074-3e8b0f8c3c2a?auto=format&fit=crop&w=600&q=80'} alt={item.product.title} className="h-14 w-14 rounded-xl object-cover" />
                    <div>
                      <div className="font-semibold text-slate-900">{item.product.title}</div>
                      <div className="text-sm text-slate-500">Quantity: {item.quantity}</div>
                    </div>
                  </div>
                  <div className="font-semibold text-primary">${item.price}</div>
                </div>
              ))}
            </div>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">No orders yet.</div>
        )}
      </div>
    </div>
  );
}
