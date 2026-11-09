import { NextResponse } from 'next/server';
import { getBencanaData } from '@/lib/db';

export async function GET() {
  try {
    const data = await getBencanaData();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('API GET /api/bencana error:', error);
    return NextResponse.json({ error: 'Gagal memuat data kebencanaan dari database' }, { status: 500 });
  }
}

