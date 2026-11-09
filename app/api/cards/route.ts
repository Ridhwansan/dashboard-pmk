import { NextResponse } from 'next/server';
import { getCards, createCard } from '@/lib/db';
import { getCurrentUser, isAdmin } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pillarId = searchParams.get('pillarId') || undefined;
    const category = searchParams.get('category') || undefined;
    const all = searchParams.get('all') === 'true';

    const cards = await getCards({
      pillarId,
      category,
      onlyActive: !all,
    });

    return NextResponse.json({ success: true, count: cards.length, data: cards });
  } catch (error) {
    console.error('API GET /api/cards error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data kartu pilar' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !isAdmin(user)) {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya administrator yang dapat menambah kartu pilar.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    if (!body.title || !body.pillarId) {
      return NextResponse.json(
        { error: 'Judul dan pilar wajib diisi.' },
        { status: 400 }
      );
    }

    const newCard = await createCard({
      slug: body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
      pillarId: body.pillarId,
      category: body.category || 'PKPN',
      title: body.title,
      value: body.value || '—',
      unit: body.unit || '',
      status: body.status || 'Realisasi 2026',
      target: body.target || 'Target: Belum Ditetapkan',
      percent: body.percent !== undefined ? body.percent : undefined,
      subtext: body.subtext || '',
      description: body.description || '',
      picKementerian: body.picKementerian || '',
      order: typeof body.order === 'number' ? body.order : 99,
      isActive: body.isActive !== undefined ? body.isActive : true,
      isMilestone: body.isMilestone || false,
      milestoneContent: body.milestoneContent || '',
    });

    return NextResponse.json({ success: true, data: newCard }, { status: 201 });
  } catch (error) {
    console.error('API POST /api/cards error:', error);
    return NextResponse.json({ error: 'Gagal membuat kartu pilar baru' }, { status: 500 });
  }
}

