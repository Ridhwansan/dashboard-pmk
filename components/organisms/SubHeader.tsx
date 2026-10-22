'use client';

import React from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { LayerType, Layer1ViewMode, PillarId } from '@/types/dashboard';
import { DASHBOARD_META } from '@/data/dashboardData';
import { Calendar } from 'lucide-react';

interface SubHeaderProps {
  currentLayer?: LayerType;
  selectedPillar?: PillarId;
  viewMode?: Layer1ViewMode;
  onViewModeChange?: (mode: Layer1ViewMode) => void;
  onNavigateHome?: () => void;
}

export const SubHeader: React.FC<SubHeaderProps> = ({
  currentLayer: propCurrentLayer,
  selectedPillar: propSelectedPillar,
}) => {
  const pathname = usePathname() || '';
  const searchParams = useSearchParams();
  const currentView = searchParams.get('view');
  const pillarParam = (searchParams.get('pillar') as PillarId) || null;

  const isIkhtisarActive =
    currentView === 'ikhtisar' || pathname.startsWith('/dashboard/pilar');
  const isProfilWilayahActive = currentView === 'profil-wilayah';

  const getPillarTitle = (id: PillarId) => {
    switch (id) {
      case 'pendidikan':
        return 'Pendidikan';
      case 'kesehatan':
        return 'Kesehatan';
      case 'bencana':
        return 'Ketahanan Bencana';
      case 'kemiskinan':
        return 'Penurunan Kemiskinan';
      default:
        return 'Pilar';
    }
  };

  const getPageTitle = () => {
    if (pathname.startsWith('/dashboard/master-data')) {
      return 'Master Data DTSEN';
    }
    if (isIkhtisarActive) {
      const activePillarName = getPillarTitle(pillarParam || propSelectedPillar || 'pendidikan');
      return `Ikhtisar Indikator Program Prioritas — ${activePillarName}`;
    }
    if (isProfilWilayahActive) {
      return 'Profil Wilayah & Pemetaan Geospasial';
    }
    return 'Pusat Pemantauan Program Prioritas Nasional';
  };

  return (
    <div className="w-full bg-white text-slate-900 px-4 lg:px-8 py-3 border-b border-slate-200/80">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
        {/* Left Side: Clean Title */}
        <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-snug">
          {getPageTitle()}
        </h1>

        {/* Right Side: Clean Cutoff Date without redundant buttons */}
        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium select-none shrink-0">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          <span className="tabular-nums">Pembaruan: {DASHBOARD_META.cutoffDate}</span>
        </div>
      </div>
    </div>
  );
};
