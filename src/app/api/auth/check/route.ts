import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function GET() {
  const isAuthenticated = await getSession();

  if (!isAuthenticated) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true });
}
