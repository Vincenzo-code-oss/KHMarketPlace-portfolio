import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { clearAuthCookie, getAuthenticatedUser } from '@/lib/session';

export async function GET() {
  const user = await getAuthenticatedUser();
  const response = NextResponse.json({ user }, { headers: { 'Cache-Control': 'no-store' } });
  if (!user) {
    const cookieStore = await cookies();
    await clearAuthCookie(response, cookieStore.get('khmarket_session')?.value ?? '');
  }
  return response;
}
