import Link from 'next/link';
import { BadgeCheck, Check } from 'lucide-react';
import { getAuthenticatedUser, hasActivePremium } from '@/lib/session';

const benefits = [
  'Sell products on KHMarket',
  'Add unlimited product listings',
  'Upload product images',
  'Edit your listings',
  'Delete your listings',
  'Premium seller badge',
  'Access to My Products',
];

export default async function PremiumPage() {
  const user = await getAuthenticatedUser();
  const active = user ? hasActivePremium(user) : false;

  return (
    <div className="container-shell py-12">
      <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-orange-200 bg-white shadow-soft">
        <div className="bg-slate-900 px-8 py-10 text-center text-white">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-orange-300"><BadgeCheck className="h-8 w-8" /></div>
          <p className="mt-4 text-sm font-semibold uppercase tracking-[0.2em] text-orange-200">KHMarket seller plan</p>
          <h1 className="mt-2 text-4xl font-black">Premium Membership</h1>
          <p className="mt-3 text-slate-300">Everything you need to grow your marketplace business.</p>
          <div className="mt-5 text-4xl font-black">$5.99 <span className="text-lg font-medium text-slate-300">/ month</span></div>
        </div>
        <div className="p-8 sm:p-10">
          <h2 className="text-xl font-bold text-slate-900">Premium benefits</h2>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2">
            {benefits.map((benefit) => <li key={benefit} className="flex items-center gap-3 text-slate-700"><Check className="h-5 w-5 shrink-0 text-green-600" />{benefit}</li>)}
          </ul>
          <div className="mt-8 text-center">
            {active ? (
              <div className="rounded-xl bg-green-50 px-5 py-4 font-semibold text-green-800">Your Premium membership is active.</div>
            ) : (
              <Link href={user ? '/premium/checkout' : '/login?next=%2Fpremium%2Fcheckout'} className="inline-flex rounded-xl bg-primary px-8 py-3 font-semibold text-white shadow-sm">
                Upgrade Now
              </Link>
            )}
            <p className="mt-3 text-xs text-slate-500">Demo checkout only. No real payment is processed.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
