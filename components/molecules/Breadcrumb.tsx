'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { LayerType, PillarId } from '@/types/dashboard';

interface BreadcrumbProps {
  currentLayer: LayerType;
  selectedPillar: PillarId;
  viewMode?: 'cards' | 'map';
  onNavigateHome?: () => void;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  currentLayer,
  selectedPillar,
  onNavigateHome,
}) => {
  const getPillarTitle = (id: PillarId) => {
    switch (id) {
      case 'pendidikan':
        return 'Pilar Pendidikan';
      case 'kesehatan':
        return 'Pilar Kesehatan';
      case 'bencana':
        return 'Pilar Kebencanaan';
      case 'kemiskinan':
        return 'Pilar Penurunan Kemiskinan';
    }
  };

  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold select-none flex-wrap">
      <Link
        href="/dashboard/eksekutif"
        onClick={() => onNavigateHome?.()}
        className="hover:text-slate-900 transition-colors cursor-pointer hover:underline underline-offset-4"
      >
        Layer 1
      </Link>

      <ChevronRight className="h-3.5 w-3.5 text-slate-500 shrink-0" />

      {currentLayer === 'layer1' && (
        <>
          <span className="text-slate-700">Super Eksekutif</span>
          <ChevronRight className="h-3.5 w-3.5 text-slate-500 shrink-0" />
          <span className="text-slate-900 font-bold">
            Peta Spasial &amp; Capaian Nasional
          </span>
        </>
      )}

      {currentLayer === 'layer2' && (
        <>
          <Link
            href="/dashboard/pilar"
            onClick={() => onNavigateHome?.()}
            className="hover:text-slate-900 transition-colors cursor-pointer hover:underline underline-offset-4"
          >
            Pemantauan PKPN
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-500 shrink-0" />
          <span className="text-slate-900 font-bold">{getPillarTitle(selectedPillar)}</span>
        </>
      )}

      {currentLayer === 'layer3' && (
        <>
          <span className="text-slate-700">Asisten Deputi</span>
          <ChevronRight className="h-3.5 w-3.5 text-slate-500 shrink-0" />
          <span className="text-slate-900 font-bold">Master Data DTSEN</span>
        </>
      )}
    </nav>
  );
};
