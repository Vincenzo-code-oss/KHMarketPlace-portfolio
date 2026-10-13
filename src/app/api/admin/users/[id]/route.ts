import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser, getNextPremiumEndDate } from '@/lib/session';

const updateSchema = z.object({
  membership: z.enum(['FREE', 'PREMIUM']).optional(),
  isVerified: z.boolean().optional(),
}).refine((data) => data.membership !== undefined || data.isVerified !== undefined);

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAuthenticatedUser();
  if (!admin) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  if (admin.role !== 'ADMIN') return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid user update.' }, { status: 400 });

  const data: Prisma.UserUpdateInput = { ...parsed.data };
  if (parsed.data.membership === 'PREMIUM') {
    const start = new Date();
    data.premiumStatus = 'ACTIVE';
    data.premiumStartDate = start;
    data.premiumEndDate = getNextPremiumEndDate(start);
  } else if (parsed.data.membership === 'FREE') {
    data.premiumStatus = 'NONE';
    data.premiumStartDate = null;
    data.premiumEndDate = null;
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, membership: true, premiumStatus: true, isVerified: true },
    });
    return NextResponse.json({ user });
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }
    throw error;
  }
}
