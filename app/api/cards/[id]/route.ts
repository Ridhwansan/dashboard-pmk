import { NextResponse } from 'next/server';
import { getCardById, updateCard, deleteCard } from '@/lib/db';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const card = await getCardById(id);
    if (!card) {
      return NextResponse.json({ error: 'Kartu tidak ditemukan' }, { status: 404 });
    }
    const noCacheHeaders = {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    };

    return NextResponse.json({ success: true, data: card }, { headers: noCacheHeaders });
  } catch (error) {
    console.error('API GET /api/cards/[id] error:', error);
    return NextResponse.json({ error: 'Gagal mengambil detail kartu' }, { status: 500 });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const updated = await updateCard(id, body);
    if (!updated) {
      return NextResponse.json({ error: 'Kartu tidak ditemukan untuk diperbarui' }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, data: updated },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (error) {
    console.error('API PUT /api/cards/[id] error:', error);
    return NextResponse.json({ error: 'Gagal memperbarui kartu' }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const updated = await updateCard(id, body);
    if (!updated) {
      return NextResponse.json({ error: 'Kartu tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, data: updated },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (error) {
    console.error('API PATCH /api/cards/[id] error:', error);
    return NextResponse.json({ error: 'Gagal mengubah status kartu' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const ok = await deleteCard(id);
    if (!ok) {
      return NextResponse.json({ error: 'Kartu tidak ditemukan atau gagal dihapus' }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, message: 'Kartu berhasil dihapus' },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (error) {
    console.error('API DELETE /api/cards/[id] error:', error);
    return NextResponse.json({ error: 'Gagal menghapus kartu' }, { status: 500 });
  }
}

