import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCardById, updateCard } from '@/lib/db';
import { getProgramDetailData } from '@/data/programDetailData';
import { getCurrentUser, isAdmin } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    // 1. Try to fetch from database via Prisma / fallback
    const card = await getCardById(id);

    // 2. Fetch baseline program detail
    const baselineDetail = getProgramDetailData(id, card?.title, card?.pillarId);

    if (!card) {
      if (baselineDetail) {
        return NextResponse.json({ success: true, data: baselineDetail });
      }
      return NextResponse.json({ error: 'Program tidak ditemukan' }, { status: 404 });
    }

    // Merge database record with detail structure
    const mergedData = {
      ...baselineDetail,
      title: card.title,
      pillarId: card.pillarId,
      category: card.category,
      unit: card.unit || baselineDetail.unit,
      currentValue: card.value,
      target2026: card.target,
      status: card.status,
      subtext: card.subtext || baselineDetail.subtext,
      description: card.description || baselineDetail.description,
      picKementerian: card.picKementerian || baselineDetail.picKementerian,
      kendalaList: card.kendalaList || baselineDetail.kendalaList,
      monthlyData: card.monthlyData || baselineDetail.monthlyData,
      annualTargets: card.annualTargets || (baselineDetail as unknown as { annualTargets?: unknown }).annualTargets,
      updateLogs: card.updateLogs || baselineDetail.updateLogs,
    };

    return NextResponse.json({ success: true, data: mergedData });
  } catch (error) {
    console.error('API GET /api/programs/[id] error:', error);
    return NextResponse.json({ error: 'Gagal memuat detail program' }, { status: 500 });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user || !isAdmin(user)) {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya administrator yang dapat memperbarui detail program.' },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();

    const updated = await updateCard(id, {
      description: body.description,
      picKementerian: body.picKementerian,
      kendalaList: body.kendalaList,
      monthlyData: body.monthlyData,
      annualTargets: body.annualTargets,
      updateLogs: body.updateLogs,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('API PUT /api/programs/[id] error:', error);
    return NextResponse.json({ error: 'Gagal memperbarui detail program di database' }, { status: 500 });
  }
}

