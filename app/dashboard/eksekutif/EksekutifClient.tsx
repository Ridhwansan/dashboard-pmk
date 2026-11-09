'use client';

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LandingChoiceSection } from '@/components/organisms/LandingChoiceSection';
import { IkhtisarView } from '@/components/organisms/IkhtisarView';
import { IndonesiaMap } from '@/components/organisms/IndonesiaMap';
import { useAuth } from '@/lib/useAuth';
import { PillarId } from '@/types/dashboard';
import { Loader2 } from 'lucide-react';

export function EksekutifClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const view = searchParams.get('view');
  const pillarParam = (searchParams.get('pillar') as PillarId) || 'pendidikan';

  // Guard: Redirect to /login if unauthenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] text-slate-400 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-sm font-semibold">Memverifikasi hak akses eksekutif...</p>
      </div>
    );
  }

  const handleSelectIkhtisar = (targetPillar: PillarId = 'pendidikan') => {
    router.push(`/dashboard/eksekutif?view=ikhtisar&pillar=${targetPillar}`);
  };

  const handleSelectProfilWilayah = () => {
    router.push('/dashboard/eksekutif?view=profil-wilayah');
  };

  const handleBackToLanding = () => {
    router.push('/dashboard/eksekutif');
  };

  // View: Ikhtisar 4 Pilar
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

  // View: PKPN Wilayah
  if (view === 'profil-wilayah') {
    return (
      <IndonesiaMap
        initialPillar={pillarParam}
        onBackToLanding={handleBackToLanding}
        onSwitchToIkhtisar={() => handleSelectIkhtisar('pendidikan')}
      />
    );
  }

  // Default: Landing Choice Section (Halaman Pilihan)
  return (
    <LandingChoiceSection
      onSelectIkhtisar={() => handleSelectIkhtisar('pendidikan')}
      onSelectProfilWilayah={handleSelectProfilWilayah}
    />
  );
}
