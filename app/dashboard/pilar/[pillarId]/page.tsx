import React, { Suspense } from 'react';
import { PillarId } from '@/types/dashboard';
import { PilarDetailClient } from './PilarDetailClient';

const VALID_PILLARS: PillarId[] = ['pendidikan', 'kesehatan', 'bencana', 'kemiskinan'];

export function generateStaticParams() {
  return VALID_PILLARS.map((pillarId) => ({
    pillarId,
  }));
}

export default async function PilarDetailPage({
  params,
}: {
  params: Promise<{ pillarId: string }>;
}) {
  const { pillarId: rawPillarId } = await params;
  const pillarId: PillarId = VALID_PILLARS.includes(rawPillarId as PillarId)
    ? (rawPillarId as PillarId)
    : 'pendidikan';

  return (
    <Suspense fallback={<div className="py-12 text-center text-slate-500">Memuat rincian pilar...</div>}>
      <PilarDetailClient pillarId={pillarId} />
    </Suspense>
  );
}
