'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Layer1BentoGrid } from '@/components/organisms/Layer1BentoGrid';
import { PillarId } from '@/types/dashboard';

export default function EksekutifPage() {
  const router = useRouter();

  const handleSelectPillar = (pillarId: PillarId) => {
    router.push(`/dashboard/pilar/${pillarId}`);
  };

  return <Layer1BentoGrid onSelectPillar={handleSelectPillar} />;
}
