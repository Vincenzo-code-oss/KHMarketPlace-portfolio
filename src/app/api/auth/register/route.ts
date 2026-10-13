import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { setAuthCookie } from '@/lib/session';

const registerSchema = z.object({
  name: z.string().min(2),
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid registration payload.' }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const username = parsed.data.username.trim().toLowerCase();

  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });

  if (existingUser) {
    const error = existingUser.email === email
      ? 'An account with this email already exists.'
      : 'This username is already taken.';
    return NextResponse.json({ error }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      username,
      email,
      passwordHash,
      role: 'USER',
    },
  });

  const response = NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, username: user.username, role: user.role } }, { status: 201 });
  await setAuthCookie(response, user.id);
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
