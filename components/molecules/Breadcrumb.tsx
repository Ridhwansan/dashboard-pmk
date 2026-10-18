import React from 'react';
import { ChevronRight } from 'lucide-react';
import { LayerType, PillarId } from '@/types/dashboard';

interface BreadcrumbProps {
  currentLayer: LayerType;
  selectedPillar: PillarId;
  viewMode?: 'cards' | 'map';
  onNavigateHome: () => void;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  currentLayer,
  selectedPillar,
  viewMode = 'cards',
  onNavigateHome,
}) => {
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
    }
  };

  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold select-none flex-wrap">
      <button
        onClick={onNavigateHome}
        className="hover:text-slate-900 transition-colors cursor-pointer hover:underline underline-offset-4"
      >
        Layer 1
      </button>

      <ChevronRight className="h-3.5 w-3.5 text-slate-500 shrink-0" />

      {currentLayer === 'layer1' && (
        <>
          <span className="text-slate-700">Super Eksekutif</span>
          <ChevronRight className="h-3.5 w-3.5 text-slate-500 shrink-0" />
          <span className="text-slate-900 font-bold">
            {viewMode === 'cards' ? 'Ringkasan Nasional' : 'Peta Wilayah Indonesia'}
          </span>
        </>
      )}

      {currentLayer === 'layer2' && (
        <>
          <button
            onClick={onNavigateHome}
            className="hover:text-slate-900 transition-colors cursor-pointer hover:underline underline-offset-4"
          >
            Pemantauan PKPN
          </button>
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
