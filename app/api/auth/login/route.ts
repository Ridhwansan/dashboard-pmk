import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { authenticateCredentials, signSession, AUTH_COOKIE_NAME } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username dan password wajib diisi' },
        { status: 400 }
      );
    }

    const user = await authenticateCredentials(username, password);

    if (!user) {
      return NextResponse.json(
        { error: 'Username atau password salah' },
        { status: 401 }
      );
    }

    const token = signSession(user);
    const cookieStore = await cookies();

    // Set HTTP-only secure cookie
    cookieStore.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return NextResponse.json({
      success: true,
      user,
      message: 'Login berhasil',
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server saat proses login' },
      { status: 500 }
    );
  }
}

