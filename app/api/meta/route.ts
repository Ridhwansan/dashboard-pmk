import { NextResponse } from 'next/server';
import { getDashboardMetadata, updateDashboardMetadata } from '@/lib/db';
import { getCurrentUser, isAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const meta = await getDashboardMetadata();
    return NextResponse.json(
      { success: true, data: meta },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('API GET /api/meta error:', error);
    return NextResponse.json({ error: 'Gagal mengambil metadata dashboard' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  return handleUpdate(request);
}

export async function POST(request: Request) {
  return handleUpdate(request);
}

async function handleUpdate(request: Request) {
  try {
    const user = await getCurrentUser();
    if (user && !isAdmin(user)) {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya administrator yang dapat memperbarui metadata.' },
        { status: 403 }
      );
    }
    if (!user && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Sesi login telah berakhir. Silakan login kembali.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Data formulir tidak valid' }, { status: 400 });
    }

    const updated = await updateDashboardMetadata({
      title: body.title,
      subtitle: body.subtitle,
      cutoffDate: body.cutoffDate,
      ministerTitle: body.ministerTitle,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('API /api/meta update error:', error);
    return NextResponse.json({ error: 'Gagal memperbarui metadata tampilan depan' }, { status: 500 });
  }
}
