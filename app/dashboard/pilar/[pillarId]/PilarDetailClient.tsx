'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { IkhtisarView } from '@/components/organisms/IkhtisarView';
import { PillarId } from '@/types/dashboard';

export function PilarDetailClient({ pillarId }: { pillarId: PillarId }) {
  const router = useRouter();

  return (
    <IkhtisarView
      initialPillar={pillarId}
      onBackToLanding={() => router.push('/dashboard/eksekutif')}
      onSwitchToProfilWilayah={() => router.push('/dashboard/eksekutif?view=profil-wilayah')}
      onPillarChange={(p) => router.push(`/dashboard/pilar/${p}`)}
    />
  );
}
