import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser, getNextPremiumEndDate } from '@/lib/session';

const checkoutSchema = z.object({
  paymentMethod: z.enum(['ABA_PAY', 'WING', 'CARD']),
});

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Choose a valid payment method.' }, { status: 400 });

  const now = new Date();
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      membership: 'PREMIUM',
      premiumStatus: 'ACTIVE',
      premiumStartDate: now,
      premiumEndDate: getNextPremiumEndDate(now),
    },
    select: { membership: true, premiumStatus: true, premiumStartDate: true, premiumEndDate: true },
  });

  return NextResponse.json({ success: true, user: updatedUser, paymentMethod: parsed.data.paymentMethod });
}
