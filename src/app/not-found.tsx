import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container-shell flex min-h-[60vh] items-center justify-center">
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-soft">
        <div className="text-sm uppercase tracking-[0.2em] text-primary">404</div>
        <h1 className="mt-4 text-3xl font-black text-slate-900">Page not found</h1>
        <p className="mt-4 text-slate-500">This listing or page does not exist in KHMarket.</p>
        <Link href="/" className="mt-6 inline-block rounded-xl bg-primary px-5 py-3 font-semibold text-white">Back to home</Link>
      </div>
    </div>
  );
}
