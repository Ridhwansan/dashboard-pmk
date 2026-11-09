import { NextResponse } from 'next/server';
import { resetCards } from '@/lib/db';
import { getCurrentUser, isAdmin } from '@/lib/auth';

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user || !isAdmin(user)) {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya administrator yang dapat mereset data CMS.' },
        { status: 403 }
      );
    }

    const cards = await resetCards();
    return NextResponse.json({
      success: true,
      message: 'Semua kartu berhasil direset ke data awal resmi PMK',
      count: cards.length,
      data: cards,
    });
  } catch (error) {
    console.error('API POST /api/cards/reset error:', error);
    return NextResponse.json({ error: 'Gagal mereset data CMS' }, { status: 500 });
  }
}

