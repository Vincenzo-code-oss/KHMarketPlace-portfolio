import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/session';

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    include: { product: true },
  });

  return NextResponse.json({ favorites });
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const productId = typeof body?.productId === 'string' ? body.productId : '';
  if (!productId) return NextResponse.json({ error: 'Product is required.' }, { status: 400 });

  const existing = await prisma.favorite.findUnique({
    where: { userId_productId: { userId: user.id, productId } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return NextResponse.json({ favorited: false });
  }

  const favorite = await prisma.favorite.create({
    data: { userId: user.id, productId },
  });

  return NextResponse.json({ favorited: true, favorite });
}
