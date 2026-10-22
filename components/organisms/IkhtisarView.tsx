'use client';

import React, { useState } from 'react';
import { PillarId } from '@/types/dashboard';
import { PILLARS_DATA } from '@/data/dashboardData';
import { PendidikanDetailView } from './PendidikanDetailView';
import { KesehatanDetailView } from './KesehatanDetailView';
import { BencanaDetailView } from './BencanaDetailView';
import { KemiskinanDetailView } from './KemiskinanDetailView';
import {
  GraduationCap,
  HeartPulse,
  ShieldAlert,
  TrendingDown,
  BarChart3,
} from 'lucide-react';

interface IkhtisarViewProps {
  initialPillar?: PillarId;
  onBackToLanding: () => void;
  onSwitchToProfilWilayah: () => void;
  onPillarChange?: (pillarId: PillarId) => void;
}

interface PillarTabItem {
  id: PillarId;
  label: string;
  icon: React.ReactNode;
  activeColor: string;
}

const PILLAR_TABS: PillarTabItem[] = [
  {
    id: 'pendidikan',
    label: 'Pendidikan',
    icon: <GraduationCap className="h-4 w-4 text-blue-600" />,
    activeColor: 'bg-blue-600 text-white shadow-2xs',
  },
  {
    id: 'kesehatan',
    label: 'Kesehatan',
    icon: <HeartPulse className="h-4 w-4 text-emerald-600" />,
    activeColor: 'bg-emerald-600 text-white shadow-2xs',
  },
  {
    id: 'bencana',
    label: 'Kebencanaan',
    icon: <ShieldAlert className="h-4 w-4 text-[#7a4b27]" />,
    activeColor: 'bg-[#7a4b27] text-white shadow-2xs',
  },
  {
    id: 'kemiskinan',
    label: 'Penurunan Kemiskinan',
    icon: <TrendingDown className="h-4 w-4 text-rose-600" />,
    activeColor: 'bg-rose-600 text-white shadow-2xs',
  },
];

export const IkhtisarView: React.FC<IkhtisarViewProps> = ({
  initialPillar = 'pendidikan',
  onBackToLanding,
  onPillarChange,
}) => {
  const [activePillar, setActivePillar] = useState<PillarId>(initialPillar);

  const handleTabChange = (pillarId: PillarId) => {
    setActivePillar(pillarId);
    onPillarChange?.(pillarId);
  };

  const currentPillarData = PILLARS_DATA[activePillar];

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-150">
      {/* 1. TOP HEADER: Clean Context Indicator & 4 Pillar Tabs with Consistent Sizing */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Section Context (Redundant duplicate 'Pilihan Menu' button removed) */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/90 flex items-center justify-center text-blue-700 shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-tight">
              Ikhtisar 4 Pilar Prioritas PMK
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Pemantauan kinerja target dan realisasi program lintas kementerian
            </p>
          </div>
        </div>

        {/* Right: Clean, Well-Spaced 4 Pillar Tabs with consistent h-[40px] height */}
        <nav
          aria-label="Pilih Tab Pilar"
          className="h-[48px] flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 overflow-x-auto self-start md:self-auto max-w-full shadow-2xs"
        >
          {PILLAR_TABS.map((tab) => {
            const isActive = activePillar === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`h-[40px] inline-flex items-center gap-2 px-4 sm:px-5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? `${tab.activeColor} font-extrabold shadow-2xs`
                    : 'text-slate-700 hover:text-slate-900 hover:bg-white/70'
                }`}
              >
                <span className={isActive ? 'brightness-200 contrast-200' : ''}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* 2. TAB CONTENT: Render each pillar page as-is */}
      <div className="w-full">
        {activePillar === 'pendidikan' && (
          <PendidikanDetailView
            onBackToHome={onBackToLanding}
            pillar={currentPillarData}
          />
        )}
        {activePillar === 'kesehatan' && (
          <KesehatanDetailView
            onBackToHome={onBackToLanding}
            pillar={currentPillarData}
          />
        )}
        {activePillar === 'bencana' && (
          <BencanaDetailView
            onBackToHome={onBackToLanding}
            pillar={currentPillarData}
          />
        )}
        {activePillar === 'kemiskinan' && (
          <KemiskinanDetailView
            onBackToHome={onBackToLanding}
            pillar={currentPillarData}
          />
        )}
      </div>
    </div>
  );
};
