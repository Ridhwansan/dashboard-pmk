import React from 'react';
import { Breadcrumb } from '@/components/molecules/Breadcrumb';
import { SegmentedControl } from '@/components/molecules/SegmentedControl';
import { LayerType, Layer1ViewMode, PillarId } from '@/types/dashboard';
import { DASHBOARD_META } from '@/data/dashboardData';
import { Calendar } from 'lucide-react';

interface SubHeaderProps {
  currentLayer: LayerType;
  selectedPillar: PillarId;
  viewMode: Layer1ViewMode;
  onViewModeChange: (mode: Layer1ViewMode) => void;
  onNavigateHome: () => void;
}

export const SubHeader: React.FC<SubHeaderProps> = ({
  currentLayer,
  selectedPillar,
  viewMode,
  onViewModeChange,
  onNavigateHome,
}) => {
  return (
    <div className="w-full bg-white text-slate-900 px-4 lg:px-8 py-3 border-b border-slate-200/90">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-3">
        {/* Left Side: Filter Switcher (Layer 1) or Breadcrumb (Layer 2 / Layer 3) */}
        <div className="flex items-center gap-3">
          {currentLayer === 'layer1' ? (
            <SegmentedControl value={viewMode} onChange={onViewModeChange} />
          ) : (
            <Breadcrumb
              currentLayer={currentLayer}
              selectedPillar={selectedPillar}
              viewMode={viewMode}
              onNavigateHome={onNavigateHome}
            />
          )}
        </div>

        {/* Right Side: Clean Cutoff Date */}
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 font-medium select-none">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span className="tabular-nums">Pembaruan: {DASHBOARD_META.cutoffDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
