import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { ProductCardProps } from '@/components/ui/ProductCard';

export type ProductSort = 'newest' | 'oldest' | 'price-asc' | 'price-desc' | 'views' | 'likes';

type CategoryResult = { id: string; name: string; slug: string; icon: string | null; createdAt: Date };
type HomeProduct = ProductCardProps['product'];

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export async function getCategories(): Promise<CategoryResult[]> {
  return prisma.category.findMany({ orderBy: { name: 'asc' } });
}

export async function getHomePageData(): Promise<{
  categories: CategoryResult[];
  featuredProducts: HomeProduct[];
  recentProducts: HomeProduct[];
  popularProducts: HomeProduct[];
}> {
  const [categories, featuredProducts, recentProducts, popularProducts] = await Promise.all([
    getCategories(),
    prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      include: { category: true, seller: { select: { name: true, avatar: true, username: true, membership: true, premiumStatus: true, premiumEndDate: true } }, images: { take: 1 } },
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),
    prisma.product.findMany({
      where: { isActive: true },
      include: { category: true, seller: { select: { name: true, avatar: true, username: true, membership: true, premiumStatus: true, premiumEndDate: true } }, images: { take: 1 } },
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),
    prisma.product.findMany({
      where: { isActive: true },
      include: { category: true, seller: { select: { name: true, avatar: true, username: true, membership: true, premiumStatus: true, premiumEndDate: true } }, images: { take: 1 } },
      orderBy: { views: 'desc' },
      take: 8,
    }),
  ]);

  return { categories, featuredProducts, recentProducts, popularProducts };
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      seller: {
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true,
          province: true,
          district: true,
          role: true,
          isVerified: true,
          email: true,
          phone: true,
          membership: true,
          premiumStatus: true,
          premiumEndDate: true,
        },
      },
      images: true,
    },
  });
}

export async function getProducts({
  q,
  category,
  province,
  minPrice,
  maxPrice,
  sort = 'newest',
}: {
  q?: string;
  category?: string;
  province?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: ProductSort;
} = {}) {
  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(q
      ? {
          OR: [
            { title: { contains: q } },
            { description: { contains: q } },
          ],
        }
      : {}),
    ...(category ? { category: { slug: category } } : {}),
    ...(province ? { province: { contains: province } } : {}),
    ...(minPrice || maxPrice
      ? {
          price: {
            gte: minPrice ?? 0,
            ...(maxPrice ? { lte: maxPrice } : {}),
          },
        }
      : {}),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === 'price-asc'
      ? { price: 'asc' }
      : sort === 'price-desc'
        ? { price: 'desc' }
        : sort === 'views'
          ? { views: 'desc' }
          : sort === 'oldest'
            ? { createdAt: 'asc' }
            : { createdAt: 'desc' };

  return prisma.product.findMany({
    where,
    orderBy,
    include: {
      category: true,
      seller: { select: { name: true, avatar: true, username: true, membership: true, premiumStatus: true, premiumEndDate: true } },
      images: { take: 1 },
    },
    take: 60,
  });
}

export async function getFavoriteCount(productId: string) {
  return prisma.favorite.count({ where: { productId } });
}

export async function getSellerDashboard(userId: string) {
  const [listings, totalViews, favorites, revenue] = await Promise.all([
    prisma.product.findMany({
      where: { sellerId: userId },
      include: { images: { take: 1 }, category: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.aggregate({
      _sum: { views: true },
      where: { sellerId: userId },
    }),
    prisma.favorite.count({ where: { product: { sellerId: userId } } }),
    prisma.orderItem.aggregate({
      _sum: { price: true },
      where: { product: { sellerId: userId } },
    }),
  ]);

  return {
    listings,
    totalViews: totalViews._sum.views ?? 0,
    favorites,
    revenue: revenue._sum.price ?? 0,
  };
}
