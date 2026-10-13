import Link from 'next/link';
import { BadgeCheck } from 'lucide-react';
import { getAuthenticatedUser, hasActivePremium } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect('/login?next=%2Fprofile');
  const premium = hasActivePremium(user);

  return (
    <div className="container-shell py-10">
      <div className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Your account</p>
        <h1 className="mt-2 text-3xl font-black text-slate-900">Profile</h1>
        <dl className="mt-8 grid gap-5 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-slate-500">Name</dt>
            <dd className="mt-1 font-semibold text-slate-900">{user.name}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Username</dt>
            <dd className="mt-1 font-semibold text-slate-900">@{user.username}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Email</dt>
            <dd className="mt-1 font-semibold text-slate-900">{user.email}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Membership</dt>
            <dd className="mt-1 flex items-center gap-2 font-semibold text-slate-900">
              <span className={premium ? 'rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-800' : 'rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600'}>{premium ? 'PREMIUM' : 'FREE'}</span>
              {premium ? <BadgeCheck className="h-4 w-4 text-amber-600" /> : null}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Account role</dt>
            <dd className="mt-1 font-semibold text-slate-900">{user.role}</dd>
          </div>
          {premium && user.premiumEndDate ? <div><dt className="text-sm text-slate-500">Premium expires</dt><dd className="mt-1 font-semibold text-slate-900">{new Date(user.premiumEndDate).toLocaleDateString()}</dd></div> : null}
          <div>
            <dt className="text-sm text-slate-500">Listings</dt>
            <dd className="mt-1 font-semibold"><Link href="/my-products" className="text-primary hover:underline">My Products</Link></dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
