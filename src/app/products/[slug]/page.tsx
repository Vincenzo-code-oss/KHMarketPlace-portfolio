import Image from 'next/image';
import Link from 'next/link';
import { BadgeCheck, Heart, MapPin, MessageSquareText, ShieldCheck, Share2, Star } from 'lucide-react';
import { ProductCard } from '@/components/ui/ProductCard';
import { getProductBySlug, getProducts } from '@/lib/data';

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return <div className="container-shell py-20 text-center text-slate-500">Product not found.</div>;
  }

  const relatedProducts = await getProducts({ category: product.category.slug, sort: 'newest' });
  const khrPrice = product.price * 4100;
  const sellerIsPremium = product.seller.membership === 'PREMIUM'
    && product.seller.premiumStatus === 'ACTIVE'
    && (!product.seller.premiumEndDate || product.seller.premiumEndDate > new Date());

  return (
    <div className="container-shell py-8">
      <div className="grid gap-8 lg:grid-cols-[1.3fr,0.7fr]">
        <div>
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-soft">
            <div className="relative h-[420px] overflow-hidden rounded-2xl">
              <Image
                src={product.images[0]?.url ?? 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80'}
                alt={product.title}
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                unoptimized={product.images[0]?.url.startsWith('data:')}
                className="object-cover"
              />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {product.images.slice(0, 3).map((image) => (
                <div key={image.id} className="relative h-28 overflow-hidden rounded-xl border border-slate-200">
                  <Image src={image.url} alt={product.title} fill sizes="(max-width: 1024px) 33vw, 20vw" unoptimized={image.url.startsWith('data:')} className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
            <div className="mb-3 flex items-center justify-between">
              <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">{product.category.name}</span>
              <button className="rounded-full border border-slate-200 p-2 text-slate-600"><Heart className="h-4 w-4" /></button>
            </div>
            <h1 className="text-3xl font-black text-slate-900">{product.title}</h1>
            <div className="mt-3 flex items-center gap-3 text-sm text-slate-500">
              <span className="font-medium text-slate-700">Condition: {product.condition}</span>
              <span>•</span>
              <span>{product.views} views</span>
            </div>

            <div className="mt-5 space-y-3">
              <div className="text-3xl font-black text-primary">${product.price.toFixed(2)}</div>
              <div className="text-lg font-semibold text-slate-700">៛{khrPrice.toLocaleString()} KHR</div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/checkout" className="rounded-xl bg-primary px-5 py-3 font-semibold text-white">Buy now</Link>
              <Link href="/messages" className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 font-semibold text-slate-700">Message seller</Link>
              <button className="rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-700"><Share2 className="mr-2 inline-block h-4 w-4" />Share</button>
            </div>

            <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <div className="mb-2 flex items-center gap-2 text-slate-900"><MapPin className="h-4 w-4 text-primary" /> {product.province}, {product.district ?? 'City center'}</div>
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-green-600" /> Verified seller</div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 font-black text-slate-700">
                {product.seller.name[0]}
              </div>
              <div>
                <div className="flex items-center gap-2 font-semibold text-slate-900">
                  {product.seller.name}
                  {sellerIsPremium ? <BadgeCheck aria-label="Premium seller" className="h-4 w-4 text-amber-600" /> : null}
                  {product.seller.isVerified ? <ShieldCheck className="h-4 w-4 text-green-600" /> : null}
                </div>
                <div className="text-sm text-slate-500">@{product.seller.username}</div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-amber-500">
              <Star className="h-4 w-4 fill-current" />
              <span className="font-semibold text-slate-900">4.9</span>
              <span className="text-sm text-slate-500">(180 reviews)</span>
            </div>

            <div className="mt-4 flex gap-3">
              <Link href="/messages" className="flex-1 rounded-xl bg-slate-900 px-4 py-3 text-center font-semibold text-white">
                <MessageSquareText className="mr-2 inline-block h-4 w-4" />Message
              </Link>
              <a href={`tel:${product.seller.phone ?? '00000000'}`} className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-center font-semibold text-slate-700">
                Call seller
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="text-2xl font-bold text-slate-900">Description</h2>
        <p className="mt-4 leading-7 text-slate-600">{product.description}</p>
      </div>

      <div className="mt-12">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Related products</h2>
          <Link href="/search" className="text-sm font-semibold text-primary">Explore all</Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {relatedProducts.slice(0, 4).map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
