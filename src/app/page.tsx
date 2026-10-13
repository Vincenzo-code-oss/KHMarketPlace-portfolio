import Link from 'next/link';
import { ArrowRight, MapPinned, Search, Sparkles } from 'lucide-react';
import { ProductCard, type ProductCardProps } from '@/components/ui/ProductCard';
import { getHomePageData } from '@/lib/data';

type HomeCategory = Awaited<ReturnType<typeof getHomePageData>>['categories'][number];
type HomeProduct = ProductCardProps['product'];

export default async function HomePage() {
  const { categories, featuredProducts, recentProducts, popularProducts } = await getHomePageData();

  return (
    <div className="pb-20">
      <section className="container-shell py-8 md:py-12">
        <div className="rounded-[32px] bg-slate-900 px-6 py-8 text-white shadow-soft md:px-10 md:py-12">
          <div className="grid gap-8 lg:grid-cols-[1.3fr,0.7fr] lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-orange-100">
                <Sparkles className="h-4 w-4 text-orange-300" />
                Trusted marketplace in Cambodia
              </div>
              <h1 className="max-w-xl text-4xl font-black tracking-tight md:text-5xl">
                Find anything in Cambodia.
              </h1>
              <p className="mt-4 max-w-lg text-base text-slate-300">
                Buy and sell everything from phones and cars to home furniture and clothing across your province.
              </p>

              <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 sm:flex-row">
                <div className="flex flex-1 items-center gap-2 rounded-xl bg-white px-4 py-3 text-slate-600">
                  <Search className="h-5 w-5 text-slate-400" />
                  <input
                    aria-label="Search products"
                    className="w-full border-0 bg-transparent text-sm outline-none placeholder:text-slate-400"
                    placeholder="Search phones, computers, clothes, cars..."
                  />
                </div>
                <select className="rounded-xl bg-white px-3 py-3 text-sm text-slate-700 outline-none">
                  <option>Phnom Penh</option>
                  <option>Siem Reap</option>
                  <option>Battambang</option>
                  <option>Kampong Cham</option>
                  <option>Sihanoukville</option>
                  <option>Kandal</option>
                </select>
                <Link href="/search" className="rounded-xl bg-primary px-5 py-3 text-center text-sm font-semibold text-white">
                  Search
                </Link>
              </div>
            </div>

            <div className="rounded-3xl bg-white/5 p-4 backdrop-blur-sm">
              <div className="rounded-2xl bg-white p-5 text-slate-900">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-500">Live market</span>
                  <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">+24% this week</span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <div className="font-semibold">iPhone 15 Pro Max</div>
                      <div className="mt-1 flex items-center gap-1 text-xs text-slate-500"><MapPinned className="h-3 w-3 text-primary" /> Phnom Penh</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary">$1,200</div>
                      <div className="text-xs text-slate-500">New</div>
                    </div>
                  </div>
                  <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <div className="font-semibold">Gaming PC RTX 4070</div>
                      <div className="mt-1 flex items-center gap-1 text-xs text-slate-500"><MapPinned className="h-3 w-3 text-primary" /> Siem Reap</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary">$1,650</div>
                      <div className="text-xs text-slate-500">Like New</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600">Daily orders</span>
                    <span className="text-xl font-black text-slate-900">3,240</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="categories" className="container-shell py-10">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Popular categories</h2>
          <Link href="/search" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category: HomeCategory) => (
            <Link key={category.id} href={`/search?category=${category.slug}`} className="card-surface flex items-center justify-between hover:border-primary/60 hover:bg-orange-50">
              <div>
                <div className="text-3xl">{category.icon ?? '📦'}</div>
                <div className="mt-3 font-semibold text-slate-900">{category.name}</div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>
          ))}
        </div>
      </section>

      <section id="featured" className="container-shell py-4">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Featured products</h2>
          <Link href="/search" className="text-sm font-semibold text-primary">Explore marketplace</Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {featuredProducts.map((product: HomeProduct) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section id="new-arrivals" className="container-shell py-10">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Recently added</h2>
          <Link href="/search?sort=newest" className="text-sm font-semibold text-primary">See more</Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {recentProducts.map((product: HomeProduct) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section id="popular" className="container-shell py-4">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Popular today</h2>
          <Link href="/search?sort=views" className="text-sm font-semibold text-primary">Trending picks</Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {popularProducts.map((product: HomeProduct) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
