import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const subscriptionSchema = z.object({
  email: z.string().trim().email().max(254),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = subscriptionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  await prisma.$executeRaw`
    INSERT INTO "NewsletterSubscription" ("id", "email")
    VALUES (${randomUUID()}, ${email})
    ON CONFLICT ("email") DO UPDATE SET "isActive" = TRUE
  `;

  return NextResponse.json({ message: 'You are subscribed to KHMarket updates.' });
}
