import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, isAdmin, UserRole } from '@/lib/auth';

const VALID_ROLES: UserRole[] = ['ADMIN', 'MENKO', 'ESELON_1', 'ESELON_2', 'USER'];

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !isAdmin(user)) {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya administrator yang dapat melihat daftar pengguna.' },
        { status: 403 }
      );
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ success: true, count: users.length, data: users });
  } catch (error) {
    console.error('API GET /api/users error:', error);
    return NextResponse.json({ error: 'Gagal mengambil daftar pengguna' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !isAdmin(user)) {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya administrator yang dapat membuat akun pengguna.' },
        { status: 403 }
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

    // Check existing username
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { username: cleanUsername },
          ...(email ? [{ email: email.trim().toLowerCase() }] : []),
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Username atau email sudah digunakan oleh akun lain.' },
        { status: 409 }
      );
    }

    const newUser = await prisma.user.create({
      data: {
        username: cleanUsername,
        name: name.trim(),
        email: email ? email.trim().toLowerCase() : null,
        password: password.trim(),
        role: role as UserRole,
      },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, data: newUser }, { status: 201 });
  } catch (error) {
    console.error('API POST /api/users error:', error);
    return NextResponse.json({ error: 'Gagal membuat pengguna baru' }, { status: 500 });
  }
}

