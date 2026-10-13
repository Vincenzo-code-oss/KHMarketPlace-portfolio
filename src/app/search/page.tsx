import Link from 'next/link';
import { SlidersHorizontal } from 'lucide-react';
import { ProductCard } from '@/components/ui/ProductCard';
import { getCategories, getProducts } from '@/lib/data';

export default async function SearchPage({ searchParams }: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = (await searchParams) ?? {};
  const q = typeof params.q === 'string' ? params.q : '';
  const category = typeof params.category === 'string' ? params.category : '';
  const province = typeof params.province === 'string' ? params.province : '';
  const sort = typeof params.sort === 'string' ? params.sort : 'newest';

  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({ q, category, province, sort: sort as any }),
  ]);

  return (
    <div className="container-shell py-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-primary">Marketplace</p>
          <h1 className="text-3xl font-black text-slate-900">Search listings</h1>
        </div>
        <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
          <span className="inline-flex items-center gap-2"><SlidersHorizontal className="h-4 w-4" /> Filters</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px,1fr]">
        <aside className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <div>
            <div className="mb-3 font-semibold text-slate-900">Category</div>
            <div className="space-y-2 text-sm text-slate-600">
              {categories.map((category) => (
                <Link key={category.id} href={`/search?category=${category.slug}`} className="block rounded-lg px-3 py-2 hover:bg-slate-50">
                  {category.name}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-3 font-semibold text-slate-900">Location</div>
            <div className="space-y-2 text-sm text-slate-600">
              {['Phnom Penh', 'Siem Reap', 'Battambang', 'Sihanoukville', 'Kandal'].map((location) => (
                <Link key={location} href={`/search?province=${location}`} className="block rounded-lg px-3 py-2 hover:bg-slate-50">
                  {location}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        <div>
          <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm text-slate-500">Showing results</div>
                <div className="text-xl font-bold text-slate-900">{products.length} listings</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">Sort by</span>
                <select className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none">
                  <option value="newest">Newest</option>
                  <option value="price-asc">Price low to high</option>
                  <option value="price-desc">Price high to low</option>
                  <option value="views">Most viewed</option>
                </select>
              </div>
            </div>
          </div>

          {products.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
              No listings match your filters right now.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
