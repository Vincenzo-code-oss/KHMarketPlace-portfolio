import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/session';

const messageSchema = z.object({
  receiverId: z.string().min(1),
  content: z.string().min(1),
  productId: z.string().optional(),
});

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  const messages = await prisma.message.findMany({
    where: { OR: [{ senderId: user.id }, { receiverId: user.id }] },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  return NextResponse.json(messages);
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  const data = await request.json().catch(() => null);
  const parsed = messageSchema.safeParse(data);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid message payload.' }, { status: 400 });
  }

  const message = await prisma.message.create({ data: { ...parsed.data, senderId: user.id } });
  return NextResponse.json(message, { status: 201 });
}
