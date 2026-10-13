import { requireAuthenticatedUser } from '@/lib/session';

export default async function CheckoutPage() {
  await requireAuthenticatedUser('/checkout');
  return (
    <div className="container-shell py-8">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.2em] text-primary">Checkout</p>
        <h1 className="text-3xl font-black text-slate-900">Complete your order</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Full name</label>
              <input className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" defaultValue="Sovann Sokhom" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Phone number</label>
              <input className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" defaultValue="012 345 678" />
            </div>
          </div>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Province</label>
              <input className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" defaultValue="Phnom Penh" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">District</label>
              <input className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" defaultValue="Daun Penh" />
            </div>
          </div>
          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium text-slate-700">Address</label>
            <textarea rows={4} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" defaultValue="Street 123, Boeng Keng Kang" />
          </div>
        </div>

        <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="text-xl font-bold text-slate-900">Payment method</h2>
          <div className="mt-4 space-y-3">
            <label className="flex items-center justify-between rounded-xl border border-slate-200 p-3"><span>KHQR</span><input type="radio" name="payment" /></label>
            <label className="flex items-center justify-between rounded-xl border border-slate-200 p-3"><span>Cash on Delivery</span><input type="radio" name="payment" /></label>
            <label className="flex items-center justify-between rounded-xl border border-slate-200 p-3"><span>Online payment</span><input type="radio" name="payment" /></label>
          </div>
          <button className="mt-6 w-full rounded-xl bg-primary px-4 py-3 font-semibold text-white">Place order</button>
        </aside>
      </div>
    </div>
  );
}
