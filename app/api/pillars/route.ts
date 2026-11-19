import { NextResponse } from 'next/server';
import { getPillars, createPillar } from '@/lib/db';

export async function GET() {
  try {
    const pillars = await getPillars();
    return NextResponse.json(
      { success: true, count: pillars.length, data: pillars },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (error) {
    console.error('API GET /api/pillars error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data pilar' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Nama pilar wajib diisi.' },
        { status: 400 }
      );
    }

    const newPillar = await createPillar({
      id: body.id,
      name: body.name,
      description: body.description,
      order: body.order,
    });

    return NextResponse.json({ success: true, data: newPillar }, { status: 201 });
  } catch (error) {
    console.error('API POST /api/pillars error:', error);
    const msg = error instanceof Error ? error.message : 'Gagal membuat pilar baru.';
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}
