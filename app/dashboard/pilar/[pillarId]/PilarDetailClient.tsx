'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Layer2PillarDetail } from '@/components/organisms/Layer2PillarDetail';
import { PillarId } from '@/types/dashboard';

export function PilarDetailClient({ pillarId }: { pillarId: PillarId }) {
  const router = useRouter();

  return (
    <Layer2PillarDetail
      pillarId={pillarId}
      onBackToHome={() => router.push('/dashboard/eksekutif')}
    />
  );
}
