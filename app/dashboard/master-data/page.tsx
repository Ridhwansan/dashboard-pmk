'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Layer3MasterData } from '@/components/organisms/Layer3MasterData';

export default function MasterDataPage() {
  const router = useRouter();

  return (
    <Layer3MasterData
      onBackToHome={() => router.push('/dashboard/eksekutif')}
    />
  );
}
