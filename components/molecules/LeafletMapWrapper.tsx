'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { WilayahData } from '@/data/wilayahData';
import { MapPillarId } from '@/data/mapIndicators';

const DynamicBlindMap = dynamic(
  () =>
    import('./LeafletBlindMap').then((mod) => mod.LeafletBlindMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[500px] lg:min-h-[580px] xl:min-h-[620px] rounded-2xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-500 shadow-2xs">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div>
        <span className="text-xs font-semibold text-slate-700">
          Memuat Peta Spasial Indonesia (OpenStreetMap)...
        </span>
      </div>
    ),
  }
);

interface LeafletMapWrapperProps {
  selectedWilayah: WilayahData;
  availableBoundaries: WilayahData[];
  onSelectWilayah: (wilayah: WilayahData) => void;
  onResetNasional: () => void;
  selectedPillar?: MapPillarId | null;
  selectedIndicator?: string | null;
}

export const LeafletMapWrapper: React.FC<LeafletMapWrapperProps> = (props) => {
  return <DynamicBlindMap {...props} />;
};
