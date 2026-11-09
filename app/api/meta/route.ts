import { NextResponse } from 'next/server';
import { getDashboardMetadata } from '@/lib/db';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, isAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const meta = await getDashboardMetadata();
    return NextResponse.json({ success: true, data: meta });
  } catch (error) {
    console.error('API GET /api/meta error:', error);
    return NextResponse.json({ error: 'Gagal mengambil metadata dashboard' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !isAdmin(user)) {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya administrator yang dapat memperbarui metadata.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const updated = await prisma.dashboardMeta.upsert({
      where: { id: 'default' },
      update: {
        title: body.title,
        subtitle: body.subtitle,
        cutoffDate: body.cutoffDate,
        ministerTitle: body.ministerTitle,
      },
      create: {
        id: 'default',
        title: body.title,
        subtitle: body.subtitle,
        cutoffDate: body.cutoffDate,
        ministerTitle: body.ministerTitle,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('API PUT /api/meta error:', error);
    return NextResponse.json({ error: 'Gagal memperbarui metadata' }, { status: 500 });
  }
}

