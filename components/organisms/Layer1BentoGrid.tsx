'use client';

import React from 'react';
import { CardBesar2 } from '@/components/organisms/CardBesar2';
import { PillarCard } from '@/components/organisms/PillarCard';
import { IndonesiaMap } from '@/components/organisms/IndonesiaMap';
import { PILLARS_DATA } from '@/data/dashboardData';
import { Layer1ViewMode, PillarId } from '@/types/dashboard';

interface Layer1BentoGridProps {
  viewMode: Layer1ViewMode;
  onSelectPillar(pillarId: PillarId): void;
}

export const Layer1BentoGrid: React.FC<Layer1BentoGridProps> = ({
  viewMode,
  onSelectPillar,
}) => {
  if (viewMode === 'map') {
    return (
      <div className="w-full">
        <IndonesiaMap onSelectPillar={(id) => onSelectPillar(id as PillarId)} />
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* Empat Pilar Utama Pembangunan Manusia & Kebudayaan */}
      <section aria-labelledby="pillars-heading">
        <div className="mb-4 px-0.5">
          <h2 id="pillars-heading" className="text-base md:text-lg font-bold tracking-tight text-slate-900">
            Empat Pilar Pembangunan Manusia & Kebudayaan
          </h2>
          <p className="text-xs text-slate-500 font-normal mt-0.5">
            Fokus Pengawalan Program Prioritas Nasional (PKPN) RPJMN 2025–2029
          </p>
        </div>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
          <PillarCard
            data={PILLARS_DATA.pendidikan}
            onSelect={onSelectPillar}
          />
          <PillarCard
            data={PILLARS_DATA.kesehatan}
            onSelect={onSelectPillar}
          />
          <PillarCard
            data={PILLARS_DATA.bencana}
            onSelect={onSelectPillar}
          />
          <PillarCard
            data={PILLARS_DATA.kemiskinan}
            onSelect={onSelectPillar}
          />
        </div>
      </section>

      {/* Pusat Kendali Isu Kritis, Orkestrasi & Trajektori RPJMN */}
      <CardBesar2 />
    </div>
  );
};
