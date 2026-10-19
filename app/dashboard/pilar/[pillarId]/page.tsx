'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Layer2PillarDetail } from '@/components/organisms/Layer2PillarDetail';
import { PillarId } from '@/types/dashboard';

const VALID_PILLARS: PillarId[] = ['pendidikan', 'kesehatan', 'bencana', 'kemiskinan'];

export default function PilarDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawPillarId = (params?.pillarId as string) || '';
  const pillarId: PillarId = VALID_PILLARS.includes(rawPillarId as PillarId)
    ? (rawPillarId as PillarId)
    : 'pendidikan';

  return (
    <Layer2PillarDetail
      pillarId={pillarId}
      onBackToHome={() => router.push('/dashboard/eksekutif')}
    />
  );
}
