import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME } from '@/lib/auth';

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(AUTH_COOKIE_NAME);
    return NextResponse.json({ success: true, message: 'Logout berhasil' });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Gagal logout' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(AUTH_COOKIE_NAME);
    return NextResponse.json({ success: true, message: 'Logout berhasil' });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Gagal logout' }, { status: 500 });
  }
}

