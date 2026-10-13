import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';

const SESSION_COOKIE = 'khmarket_session';
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;

function hashSessionToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value ?? '';
  if (!token) return null;

  const tokenHash = hashSessionToken(token);
  const sessions = await prisma.$queryRaw<Array<{
    userId: string;
    expiresAt: Date | string;
    id: string;
    name: string;
    email: string;
    username: string;
    role: string;
    avatar: string | null;
    isVerified: boolean;
    membership: string;
    premiumStatus: string;
    premiumStartDate: Date | string | null;
    premiumEndDate: Date | string | null;
  }>>`
    SELECT s."userId", s."expiresAt", u."id", u."name", u."email", u."username", u."role", u."avatar", u."isVerified",
      u."membership", u."premiumStatus", u."premiumStartDate", u."premiumEndDate"
    FROM "AuthSession" AS s
    INNER JOIN "User" AS u ON u."id" = s."userId"
    WHERE s."tokenHash" = ${tokenHash}
    LIMIT 1
  `;
  const session = sessions[0];
  if (!session) return null;

  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    await prisma.$executeRaw`DELETE FROM "AuthSession" WHERE "tokenHash" = ${tokenHash}`;
    return null;
  }

  const premiumEndDate = session.premiumEndDate ? new Date(session.premiumEndDate) : null;
  let premiumStatus = session.premiumStatus;
  if (
    session.membership === 'PREMIUM'
    && premiumStatus === 'ACTIVE'
    && premiumEndDate
    && premiumEndDate.getTime() <= Date.now()
  ) {
    await prisma.user.update({ where: { id: session.id }, data: { premiumStatus: 'EXPIRED' } });
    premiumStatus = 'EXPIRED';
  }

  return {
    id: session.id,
    name: session.name,
    email: session.email,
    username: session.username,
    role: session.role as Role,
    avatar: session.avatar,
    isVerified: session.isVerified,
    membership: session.membership,
    premiumStatus,
    premiumStartDate: session.premiumStartDate ? new Date(session.premiumStartDate).toISOString() : null,
    premiumEndDate: premiumEndDate?.toISOString() ?? null,
  };
}

export function getNextPremiumEndDate(start: Date) {
  const end = new Date(start);
  const day = end.getDate();
  end.setDate(1);
  end.setMonth(end.getMonth() + 1);
  end.setDate(Math.min(day, new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate()));
  return end;
}

export function hasActivePremium(user: {
  membership: string;
  premiumStatus: string;
  premiumEndDate: string | Date | null;
}) {
  return user.membership === 'PREMIUM'
    && user.premiumStatus === 'ACTIVE'
    && (!user.premiumEndDate || new Date(user.premiumEndDate).getTime() > Date.now());
}

export async function requireAuthenticatedUser(returnTo = '/') {
  const user = await getAuthenticatedUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  return user;
}

export async function requireUserRole(role: 'SELLER' | 'ADMIN', returnTo = '/') {
  const user = await requireAuthenticatedUser(returnTo);
  if (user.role !== role) redirect('/');
  return user;
}

export function getSessionCookieName() {
  return SESSION_COOKIE;
}

export async function setAuthCookie(response: NextResponse, userId: string) {
  const cookieStore = await cookies();
  const previousToken = cookieStore.get(SESSION_COOKIE)?.value;
  if (previousToken) {
    await prisma.$executeRaw`DELETE FROM "AuthSession" WHERE "tokenHash" = ${hashSessionToken(previousToken)}`;
  }

  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + SESSION_DURATION_SECONDS * 1000);
  const tokenHash = hashSessionToken(token);

  await prisma.$executeRaw`
    INSERT INTO "AuthSession" ("id", "tokenHash", "userId", "expiresAt")
    VALUES (${randomUUID()}, ${tokenHash}, ${userId}, ${expiresAt.toISOString()})
  `;

  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_DURATION_SECONDS,
    expires: expiresAt,
  });
}

export async function clearAuthCookie(response: NextResponse, token = '') {
  if (token) {
    await prisma.$executeRaw`DELETE FROM "AuthSession" WHERE "tokenHash" = ${hashSessionToken(token)}`;
  }

  response.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });
}
