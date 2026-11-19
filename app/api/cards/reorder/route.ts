import { NextResponse } from 'next/server';
import { updateCard, getCards } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const items = body?.items;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Format data tidak valid. Diperlukan array items dengan id dan order.' },
        { status: 400 }
      );
    }

    // Update each card's order
    for (const item of items) {
      if (item.id && typeof item.order === 'number') {
        await updateCard(item.id, { order: item.order });
      }
    }

    const updatedCards = await getCards();

    return NextResponse.json({
      success: true,
      message: 'Urutan kartu berhasil diperbarui',
      data: updatedCards,
    });
  } catch (error) {
    console.error('API POST /api/cards/reorder error:', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui urutan kartu indikator' },
      { status: 500 }
    );
  }
}
