import { NextResponse } from 'next/server';
import { updatePillar, deletePillar } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await updatePillar(id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Pilar tidak ditemukan.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('API PUT /api/pillars/[id] error:', error);
    const msg = error instanceof Error ? error.message : 'Gagal memperbarui pilar.';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const result = await deletePillar(id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message || 'Gagal menghapus pilar.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, message: 'Pilar berhasil dihapus.' });
  } catch (error) {
    console.error('API DELETE /api/pillars/[id] error:', error);
    const msg = error instanceof Error ? error.message : 'Gagal menghapus pilar.';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
