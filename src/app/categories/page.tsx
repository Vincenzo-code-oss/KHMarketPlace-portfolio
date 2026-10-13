import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getCategories } from '@/lib/data';

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="container-shell py-12">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Explore KHMarket</p>
      <h1 className="mt-2 text-3xl font-black text-slate-900">Browse categories</h1>
      <p className="mt-3 max-w-2xl text-slate-600">Find products from sellers across Cambodia.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {categories.map((category) => (
          <Link key={category.id} href={`/search?category=${encodeURIComponent(category.slug)}`} className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md">
            <span className="flex items-center gap-4">
              <span className="text-3xl" aria-hidden="true">{category.icon ?? '📦'}</span>
              <span className="font-semibold text-slate-800">{category.name}</span>
            </span>
            <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-teal-600" />
          </Link>
        ))}
      </div>
    </div>
  );
}
