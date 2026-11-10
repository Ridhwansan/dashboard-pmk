import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, isAdmin, UserRole } from '@/lib/auth';

const VALID_ROLES: UserRole[] = ['ADMIN', 'MENKO', 'ESELON_1', 'ESELON_2', 'USER'];

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user || !isAdmin(user)) {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya administrator yang dapat mengubah data pengguna.' },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();
    const { name, email, role, password } = body;

    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan.' }, { status: 404 });
    }

    const updateData: {
      name?: string;
      email?: string | null;
      role?: UserRole;
      password?: string;
    } = {};

    if (name && typeof name === 'string' && name.trim()) {
      updateData.name = name.trim();
    }

    if (email !== undefined) {
      const cleanEmail = email && typeof email === 'string' ? email.trim().toLowerCase() : null;
      if (cleanEmail) {
        // Check uniqueness
        const conflict = await prisma.user.findFirst({
          where: {
            email: cleanEmail,
            NOT: { id },
          },
        });
        if (conflict) {
          return NextResponse.json({ error: 'Email sudah digunakan pengguna lain.' }, { status: 409 });
        }
      }
      updateData.email = cleanEmail;
    }

    if (role && VALID_ROLES.includes(role)) {
      updateData.role = role as UserRole;
    }

    if (password && typeof password === 'string' && password.trim().length >= 6) {
      updateData.password = password.trim();
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('API PUT /api/users/[id] error:', error);
    return NextResponse.json({ error: 'Gagal memperbarui data pengguna' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user || !isAdmin(user)) {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya administrator yang dapat menghapus pengguna.' },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    // Prevent deleting self
    if (user.id === id) {
      return NextResponse.json(
        { error: 'Anda tidak dapat menghapus akun Anda sendiri saat sedang aktif.' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan.' }, { status: 404 });
    }

    // Prevent deleting the primary admin account
    if (existing.username === 'admin') {
      return NextResponse.json(
        { error: 'Akun administrator utama sistem tidak boleh dihapus.' },
        { status: 400 }
      );
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Akun pengguna berhasil dihapus' });
  } catch (error) {
    console.error('API DELETE /api/users/[id] error:', error);
    return NextResponse.json({ error: 'Gagal menghapus pengguna' }, { status: 500 });
  }
}

