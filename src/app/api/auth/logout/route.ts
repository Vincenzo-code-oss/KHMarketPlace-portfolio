import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { clearAuthCookie } from '@/lib/session';

export async function POST() {
  const response = NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } });
  const cookieStore = await cookies();
  await clearAuthCookie(response, cookieStore.get('khmarket_session')?.value ?? '');
  return response;
}
