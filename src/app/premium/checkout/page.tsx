import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAuthenticatedUser, hasActivePremium } from '@/lib/session';
import { PremiumCheckoutForm } from './PremiumCheckoutForm';

export default async function PremiumCheckoutPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect('/login?next=%2Fpremium%2Fcheckout');
  if (hasActivePremium(user)) {
    return (
      <div className="container-shell py-12">
        <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-soft">
          <h1 className="text-2xl font-black text-slate-900">Premium is already active</h1>
          <Link href="/sell" className="mt-5 inline-flex rounded-xl bg-primary px-5 py-3 font-semibold text-white">Start selling</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-shell py-12">
      <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Demo checkout</p>
        <h1 className="mt-2 text-3xl font-black text-slate-900">Premium Membership</h1>
        <div className="mt-4 flex items-baseline justify-between border-b border-slate-100 pb-5">
          <span className="font-medium text-slate-600">1 month</span>
          <span className="text-2xl font-black text-slate-900">$5.99</span>
        </div>
        <div className="mt-6"><PremiumCheckoutForm /></div>
      </div>
    </div>
  );
}
