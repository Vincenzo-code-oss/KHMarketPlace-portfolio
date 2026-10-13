export default function CartPage() {
  const items = [
    { name: 'Gaming Chair', price: 199, quantity: 1 },
    { name: 'MacBook Air M3', price: 1299, quantity: 1 },
  ];

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="container-shell py-8">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.2em] text-primary">Cart</p>
        <h1 className="text-3xl font-black text-slate-900">Your shopping cart</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.name} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
              <div>
                <div className="font-semibold text-slate-900">{item.name}</div>
                <div className="text-sm text-slate-500">Qty {item.quantity}</div>
              </div>
              <div className="text-lg font-bold text-primary">${item.price}</div>
            </div>
          ))}
        </div>

        <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
          <div className="text-lg font-bold text-slate-900">Order summary</div>
          <div className="mt-4 space-y-2 text-sm text-slate-600">
            <div className="flex justify-between"><span>Subtotal</span><span>${total}</span></div>
            <div className="flex justify-between"><span>Delivery</span><span>$15</span></div>
            <div className="flex justify-between text-lg font-bold text-slate-900"><span>Total</span><span>${total + 15}</span></div>
          </div>
          <a href="/checkout" className="mt-5 block rounded-xl bg-primary px-4 py-3 text-center font-semibold text-white">Checkout</a>
        </aside>
      </div>
    </div>
  );
}
