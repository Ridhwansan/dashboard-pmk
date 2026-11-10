import { NextResponse } from 'next/server';
import { updatePdfSettings, getCards } from '@/lib/db';

export async function GET() {
  try {
    const cards = await getCards({ onlyActive: false });
    const settings: Record<string, boolean> = {};
    cards.forEach((c) => {
      settings[c.id] = c.includeInPdf !== false;
    });
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('API GET /api/cards/pdf-settings error:', error);
    return NextResponse.json({ error: 'Gagal mengambil pengaturan PDF' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const settings: Record<string, boolean> = body.settings || {};

    if (typeof settings !== 'object' || Object.keys(settings).length === 0) {
      return NextResponse.json(
        { error: 'Format pengaturan tidak valid. Membutuhkan objek settings { [id]: boolean }.' },
        { status: 400 }
      );
    }

    const result = await updatePdfSettings(settings);

    return NextResponse.json({
      success: true,
      message: 'Pengaturan unduh ringkasan PDF berhasil diterapkan.',
      count: result.count,
    });
  } catch (error) {
    console.error('API POST /api/cards/pdf-settings error:', error);
    return NextResponse.json({ error: 'Gagal menerapkan pengaturan PDF' }, { status: 500 });
  }
}
