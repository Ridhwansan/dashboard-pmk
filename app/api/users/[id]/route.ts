import { NextResponse } from 'next/server';
import { updateExistingUser, deleteExistingUser, getUsersList } from '@/lib/db';
import { getCurrentUser, isAdmin, UserRole } from '@/lib/auth';

const VALID_ROLES: UserRole[] = ['ADMIN', 'MENKO', 'ESELON_1', 'ESELON_2', 'USER'];

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (user && !isAdmin(user)) {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya administrator yang dapat mengubah data pengguna.' },
        { status: 403 }
      );
    }
    if (!user && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Sesi login telah berakhir. Silakan login kembali.' },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();
    const { name, email, role, password } = body;

    const existingList = await getUsersList();
    const targetUser = existingList.find((u) => u.id === id);
    if (!targetUser) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan.' }, { status: 404 });
    }

    const cleanEmail = email !== undefined ? (email && typeof email === 'string' ? email.trim().toLowerCase() : null) : undefined;
    if (cleanEmail) {
      const conflict = existingList.find((u) => u.email && u.email.toLowerCase() === cleanEmail && u.id !== id);
      if (conflict) {
        return NextResponse.json({ error: 'Email sudah digunakan pengguna lain.' }, { status: 409 });
      }
    }

    const updated = await updateExistingUser(id, {
      name: name && typeof name === 'string' ? name.trim() : undefined,
      email: cleanEmail,
      role: role && VALID_ROLES.includes(role) ? (role as UserRole) : undefined,
      password: password && typeof password === 'string' && password.trim().length >= 6 ? password.trim() : undefined,
    });

    if (!updated) {
      return NextResponse.json({ error: 'Gagal memperbarui pengguna.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('API PUT /api/users/[id] error:', error);
    return NextResponse.json({ error: 'Gagal memperbarui data pengguna' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (user && !isAdmin(user)) {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya administrator yang dapat menghapus pengguna.' },
        { status: 403 }
      );
    }
    if (!user && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Sesi login telah berakhir. Silakan login kembali.' },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    // Prevent deleting self
    if (user && user.id === id) {
      return NextResponse.json(
        { error: 'Anda tidak dapat menghapus akun Anda sendiri saat sedang aktif.' },
        { status: 400 }
      );
    }

    const existingList = await getUsersList();
    const existing = existingList.find((u) => u.id === id);
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

    const ok = await deleteExistingUser(id);
    if (!ok) {
      return NextResponse.json({ error: 'Pengguna gagal dihapus dari sistem' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Akun pengguna berhasil dihapus' });
  } catch (error) {
    console.error('API DELETE /api/users/[id] error:', error);
    return NextResponse.json({ error: 'Gagal menghapus pengguna' }, { status: 500 });
  }
}
