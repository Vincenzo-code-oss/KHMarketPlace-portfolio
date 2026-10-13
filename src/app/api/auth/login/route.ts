import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { setAuthCookie } from '@/lib/session';

const loginSchema = z.object({
  email: z.string().trim().optional(),
  password: z.string().optional(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid login request.' }, { status: 400 });
  }

  const identifier = parsed.data.email?.toLowerCase() ?? '';
  const password = parsed.data.password ?? '';
  if (!identifier) return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
  if (!password) return NextResponse.json({ error: 'Password is required.' }, { status: 400 });
  if (identifier.includes('@') && !z.string().email().safeParse(identifier).success) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }

  const user =
    (await prisma.user.findUnique({ where: { email: identifier } })) ??
    (await prisma.user.findUnique({ where: { username: identifier } }));
  if (!user || !user.passwordHash) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  const response = NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, username: user.username, role: user.role } });
  await setAuthCookie(response, user.id);
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
