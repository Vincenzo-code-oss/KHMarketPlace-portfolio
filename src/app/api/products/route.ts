import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser, hasActivePremium } from '@/lib/session';
import { productSchema } from '@/lib/product-schema';

export async function GET() {
  const products = await prisma.product.findMany({
    include: {
      category: true,
      seller: { select: { name: true, avatar: true, username: true, membership: true, premiumStatus: true, premiumEndDate: true } },
      images: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  if (!hasActivePremium(user)) {
    return NextResponse.json({ error: 'An active Premium membership is required to add products.' }, { status: 403 });
  }

  const data = await request.json().catch(() => null);
  const parsed = productSchema.safeParse(data);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const category = await prisma.category.findUnique({ where: { id: parsed.data.categoryId }, select: { id: true } });
  if (!category) return NextResponse.json({ error: 'Choose a valid product category.' }, { status: 400 });

  const product = await prisma.product.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      price: parsed.data.price,
      categoryId: parsed.data.categoryId,
      province: parsed.data.province,
      district: parsed.data.district || null,
      condition: parsed.data.condition,
      phone: parsed.data.phone || null,
      sellerId: user.id,
      slug: `${parsed.data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'product'}-${crypto.randomUUID()}`,
      images: {
        create: parsed.data.images?.length
          ? parsed.data.images.map((url) => ({ url }))
          : [{ url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80' }],
      },
    },
    include: { images: true },
  });

  return NextResponse.json(product, { status: 201 });
}
