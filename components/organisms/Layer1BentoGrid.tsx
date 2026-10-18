'use client';

import React from 'react';
import { CardBesar2 } from '@/components/organisms/CardBesar2';
import { PillarCard } from '@/components/organisms/PillarCard';
import { IndonesiaMap } from '@/components/organisms/IndonesiaMap';
import { PILLARS_DATA } from '@/data/dashboardData';
import { Layer1ViewMode, PillarId } from '@/types/dashboard';

interface Layer1BentoGridProps {
  viewMode?: Layer1ViewMode;
  onSelectPillar(pillarId: PillarId): void;
}

export const Layer1BentoGrid: React.FC<Layer1BentoGridProps> = ({
  onSelectPillar,
}) => {
  return (
    <div className="w-full">
      {/* PRIMARY EXECUTIVE STATION: Peta Geospasial & Agregat Nasional Pilar */}
      <section aria-label="Peta Geospasial dan Agregat Nasional">
        <IndonesiaMap onSelectPillar={(id) => onSelectPillar(id as PillarId)} />
      </section>
    </div>
  );
};
