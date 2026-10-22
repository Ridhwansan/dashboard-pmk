'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LandingChoiceSection } from '@/components/organisms/LandingChoiceSection';
import { IkhtisarView } from '@/components/organisms/IkhtisarView';
import { IndonesiaMap } from '@/components/organisms/IndonesiaMap';
import { PillarId } from '@/types/dashboard';

export function EksekutifClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const view = searchParams.get('view');
  const pillarParam = (searchParams.get('pillar') as PillarId) || 'pendidikan';

  const handleSelectIkhtisar = (targetPillar: PillarId = 'pendidikan') => {
    router.push(`/dashboard/eksekutif?view=ikhtisar&pillar=${targetPillar}`);
  };

  const handleSelectProfilWilayah = () => {
    router.push('/dashboard/eksekutif?view=profil-wilayah');
  };

  const handleBackToLanding = () => {
    router.push('/dashboard/eksekutif');
  };

  if (view === 'ikhtisar') {
    return (
      <IkhtisarView
        initialPillar={pillarParam}
        onBackToLanding={handleBackToLanding}
        onSwitchToProfilWilayah={handleSelectProfilWilayah}
        onPillarChange={(p) => {
          router.replace(`/dashboard/eksekutif?view=ikhtisar&pillar=${p}`, { scroll: false });
        }}
      />
    );
  }

  if (view === 'profil-wilayah') {
    return (
      <IndonesiaMap
        initialPillar={pillarParam}
        onBackToLanding={handleBackToLanding}
        onSwitchToIkhtisar={() => handleSelectIkhtisar('pendidikan')}
      />
    );
  }

  // Default when opening: 2 Choice Cards
  return (
    <LandingChoiceSection
      onSelectIkhtisar={() => handleSelectIkhtisar('pendidikan')}
      onSelectProfilWilayah={handleSelectProfilWilayah}
    />
  );
}
