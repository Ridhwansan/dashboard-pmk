import { NextResponse } from 'next/server';
import { getUsersList, createNewUser } from '@/lib/db';
import { getCurrentUser, isAdmin, UserRole } from '@/lib/auth';

const VALID_ROLES: UserRole[] = ['ADMIN', 'MENKO', 'ESELON_1', 'ESELON_2', 'USER'];

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (user && !isAdmin(user)) {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya administrator yang dapat melihat daftar pengguna.' },
        { status: 403 }
      );
    }
    if (!user && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Sesi login telah berakhir. Silakan login kembali.' },
        { status: 401 }
      );
    }

    const users = await getUsersList();
    return NextResponse.json({ success: true, count: users.length, data: users });
  } catch (error) {
    console.error('API GET /api/users error:', error);
    return NextResponse.json({ error: 'Gagal mengambil daftar pengguna' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (user && !isAdmin(user)) {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya administrator yang dapat membuat akun pengguna.' },
        { status: 403 }
      );
    }
    if (!user && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Sesi login telah berakhir. Silakan login kembali.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { username, name, email, password, role } = body;

    if (!username || !name || !password || !role) {
      return NextResponse.json(
        { error: 'Username, Nama Lengkap, Password, dan Role wajib diisi.' },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase();
    if (!/^[a-z0-9_.-]+$/.test(cleanUsername)) {
      return NextResponse.json(
        { error: 'Username hanya boleh berisi huruf kecil, angka, titik, strip, dan underscore.' },
        { status: 400 }
      );
    }

    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json(
        { error: `Role tidak valid. Pilihan role: ${VALID_ROLES.join(', ')}` },
        { status: 400 }
      );
    }

    const cleanEmail = email && typeof email === 'string' ? email.trim().toLowerCase() : null;

    // Check existing username / email
    const existingList = await getUsersList();
    const conflict = existingList.find(
      (u) =>
        u.username.toLowerCase() === cleanUsername ||
        (cleanEmail && u.email && u.email.toLowerCase() === cleanEmail)
    );

    if (conflict) {
      return NextResponse.json(
        { error: 'Username atau email sudah digunakan oleh akun lain.' },
        { status: 409 }
      );
    }

    const newUser = await createNewUser({
      username: cleanUsername,
      name: name.trim(),
      email: cleanEmail,
      password: password.trim(),
      role: role as UserRole,
    });

    return NextResponse.json({ success: true, data: newUser }, { status: 201 });
  } catch (error) {
    console.error('API POST /api/users error:', error);
    return NextResponse.json({ error: 'Gagal membuat pengguna baru' }, { status: 500 });
  }
}
