import Link from 'next/link';
import { redirect } from 'next/navigation';
import { BadgeCheck, ArrowRight } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser, hasActivePremium } from '@/lib/session';
import { ProductForm } from './ProductForm';

export default async function SellPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect('/login?next=%2Fsell');

  if (!hasActivePremium(user)) {
    return (
      <div className="container-shell py-12">
        <div className="mx-auto max-w-2xl rounded-3xl border border-orange-200 bg-white p-8 text-center shadow-soft sm:p-12">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-primary"><BadgeCheck className="h-7 w-7" /></div>
          <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-primary">Premium membership</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">Upgrade to Premium to sell your products on KHMarket.</h1>
          <p className="mx-auto mt-4 max-w-lg text-slate-600">Create listings, upload product photos, and manage everything from My Products.</p>
          <Link href="/premium" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white">
            Upgrade to Premium <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  return (
    <div className="container-shell py-8">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.2em] text-primary">Premium seller center</p>
        <h1 className="text-3xl font-black text-slate-900">Create a new listing</h1>
      </div>
      <ProductForm categories={categories} />
    </div>
  );
}
