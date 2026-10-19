'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
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

  // Determine current layer and selected pillar from pathname if available
  let currentLayer: LayerType = propCurrentLayer || 'layer1';
  let selectedPillar: PillarId = propSelectedPillar || 'pendidikan';

  if (pathname.startsWith('/dashboard/pilar')) {
    currentLayer = 'layer2';
    const segment = pathname.split('/')[3] as PillarId;
    if (segment) selectedPillar = segment;
  } else if (pathname.startsWith('/dashboard/master-data')) {
    currentLayer = 'layer3';
  } else if (pathname.startsWith('/dashboard/eksekutif')) {
    currentLayer = 'layer1';
  }

  const getPillarTitle = (id: PillarId) => {
    switch (id) {
      case 'pendidikan':
        return 'Pilar Pendidikan';
      case 'kesehatan':
        return 'Pilar Kesehatan';
      case 'bencana':
        return 'Pilar Ketahanan Bencana';
      case 'kemiskinan':
        return 'Pilar Penurunan Kemiskinan';
      default:
        return 'Detail Pilar';
    }
  };

  const getPageTitle = () => {
    if (currentLayer === 'layer1') {
      return 'Monitoring Program Kerja Prioritas Nasional';
    }
    if (currentLayer === 'layer2') {
      return getPillarTitle(selectedPillar);
    }
    return 'Master Data DTSEN';
  };

  return (
    <div className="w-full bg-white text-slate-900 px-4 lg:px-8 pt-5 sm:pt-6 pb-2.5 border-b border-slate-200/80">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
        {/* Left Side: Clean Title (No Breadcrumbs) */}
        <div className="flex items-center gap-3">
          <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-snug">
            {getPageTitle()}
          </h1>
        </div>

        {/* Right Side: Clean Cutoff Date */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 font-medium select-none">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span className="tabular-nums">Pembaruan: {DASHBOARD_META.cutoffDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
