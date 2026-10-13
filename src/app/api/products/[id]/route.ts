import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/session';
import { productSchema } from '@/lib/product-schema';

async function getOwnedProduct(id: string, userId: string, isAdmin: boolean) {
  return prisma.product.findFirst({
    where: { id, ...(isAdmin ? {} : { sellerId: userId }) },
    include: { images: true },
  });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  const { id } = await params;
  const existing = await getOwnedProduct(id, user.id, user.role === 'ADMIN');
  if (!existing) return NextResponse.json({ error: 'Product not found.' }, { status: 404 });

  const body = await request.json().catch(() => null);
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const category = await prisma.category.findUnique({ where: { id: parsed.data.categoryId }, select: { id: true } });
  if (!category) return NextResponse.json({ error: 'Choose a valid product category.' }, { status: 400 });

  const { images, ...productData } = parsed.data;
  const product = await prisma.$transaction(async (transaction) => {
    if (images) {
      await transaction.productImage.deleteMany({ where: { productId: id } });
    }
    return transaction.product.update({
      where: { id },
      data: {
        ...productData,
        district: productData.district || null,
        phone: productData.phone || null,
        ...(images ? { images: { create: images.map((url) => ({ url })) } } : {}),
      },
      include: { images: true },
    });
  });
  return NextResponse.json(product);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  const { id } = await params;
  const product = await getOwnedProduct(id, user.id, user.role === 'ADMIN');
  if (!product) return NextResponse.json({ error: 'Product not found.' }, { status: 404 });

  const hasOrders = await prisma.orderItem.count({ where: { productId: id } });
  if (hasOrders) {
    await prisma.product.update({ where: { id }, data: { isActive: false } });
  } else {
    await prisma.product.delete({ where: { id } });
  }
  return NextResponse.json({ deleted: true });
}
