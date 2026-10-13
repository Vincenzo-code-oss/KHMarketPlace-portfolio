import Image from 'next/image';
import Link from 'next/link';
import { BadgeCheck, Heart, MapPin, Star } from 'lucide-react';

export type ProductCardProps = {
  product: {
    id: string;
    slug: string;
    title: string;
    price: number;
    province: string;
    condition: string;
    createdAt: Date;
    views: number;
    category?: { name: string } | null;
    seller?: {
      name: string;
      avatar?: string | null;
      username?: string;
      membership?: string;
      premiumStatus?: string;
      premiumEndDate?: Date | string | null;
    } | null;
    images?: { url: string }[];
  };
};

export function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.images?.[0]?.url ?? 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80';
  const sellerIsPremium = product.seller?.membership === 'PREMIUM'
    && product.seller.premiumStatus === 'ACTIVE'
    && (!product.seller.premiumEndDate || new Date(product.seller.premiumEndDate).getTime() > Date.now());

  return (
    <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative h-56 overflow-hidden">
        <Link href={`/products/${product.slug}`} className="relative block h-full w-full">
          <Image
            src={imageUrl}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
            unoptimized={imageUrl.startsWith('data:')}
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        </Link>
        <button className="absolute right-3 top-3 rounded-full bg-white/80 p-2 text-slate-700 shadow">
          <Heart className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link href={`/products/${product.slug}`} className="font-semibold text-slate-900 hover:text-primary">
              {product.title}
            </Link>
            <div className="mt-1 text-xs text-slate-500">{product.category?.name ?? 'Marketplace'}</div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-primary">${product.price.toFixed(2)}</div>
            <div className="text-[10px] text-slate-500">{product.condition}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-600">
          <MapPin className="h-4 w-4 text-primary" />
          {product.province}
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 font-medium text-slate-700">
              {product.seller?.name?.[0] ?? 'S'}
            </div>
            <div>
              <div className="flex items-center gap-1 font-medium text-slate-800">
                {product.seller?.name ?? 'Seller'}
                {sellerIsPremium ? <BadgeCheck aria-label="Premium seller" className="h-3.5 w-3.5 text-amber-600" /> : null}
              </div>
              <div className="text-[11px] text-slate-500">{product.views} views</div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="h-4 w-4 fill-current" />
            <span className="text-xs">4.8</span>
          </div>
        </div>
      </div>
    </div>
  );
}
