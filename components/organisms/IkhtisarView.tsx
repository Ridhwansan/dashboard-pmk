'use client';

import React, { useState } from 'react';
import { PillarId } from '@/types/dashboard';
import { PendidikanDetailView } from './PendidikanDetailView';
import { KesehatanDetailView } from './KesehatanDetailView';
import { BencanaDetailView } from './BencanaDetailView';
import { KemiskinanDetailView } from './KemiskinanDetailView';
import {
  GraduationCap,
  HeartPulse,
  ShieldAlert,
  TrendingDown,
} from 'lucide-react';
import { ExecutivePdfButton } from '@/components/molecules/ExecutivePdfButton';

interface IkhtisarViewProps {
  initialPillar?: PillarId;
  onBackToLanding: () => void;
  onSwitchToProfilWilayah: () => void;
  onPillarChange?: (pillarId: PillarId) => void;
}

interface PillarTabItem {
  id: PillarId;
  label: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  activeBg: string;
  inactiveIconColor: string;
  brandColor: string;
}

const PILLAR_TABS: PillarTabItem[] = [
  {
    id: 'pendidikan',
    label: 'Pendidikan',
    icon: GraduationCap,
    activeBg: 'bg-blue-600 text-white shadow-sm',
    inactiveIconColor: 'text-blue-600',
    brandColor: '#2563eb',
  },
  {
    id: 'kesehatan',
    label: 'Kesehatan',
    icon: HeartPulse,
    activeBg: 'bg-emerald-600 text-white shadow-sm',
    inactiveIconColor: 'text-emerald-600',
    brandColor: '#059669',
  },
  {
    id: 'bencana',
    label: 'Kebencanaan',
    icon: ShieldAlert,
    activeBg: 'bg-pillar-bencana text-white shadow-sm',
    inactiveIconColor: 'text-pillar-bencana',
    brandColor: '#7a4b27',
  },
  {
    id: 'kemiskinan',
    label: 'Penurunan Kemiskinan',
    icon: TrendingDown,
    activeBg: 'bg-rose-600 text-white shadow-sm',
    inactiveIconColor: 'text-rose-600',
    brandColor: '#e11d48',
  },
];

export const IkhtisarView: React.FC<IkhtisarViewProps> = ({
  initialPillar = 'pendidikan',
  onBackToLanding,
  onPillarChange,
}) => {
  const [activePillar, setActivePillar] = useState<PillarId>(initialPillar);
  const [selectedCategory, setSelectedCategory] = useState<string>('PKPN');
  const [isDetailActive, setIsDetailActive] = useState<boolean>(false);

  const CATEGORY_OPTIONS = [
    { id: 'Semua', label: 'Semua', disabled: false },
    { id: 'PKPN', label: 'PKPN', disabled: false },
    { id: 'Isu Strategis', label: 'Isu Strategis', disabled: false },
    { id: 'RPJMN', label: 'RPJMN', disabled: false },
  ];

  const handleTabChange = (pillarId: PillarId) => {
    setActivePillar(pillarId);
    setIsDetailActive(false);
    onPillarChange?.(pillarId);
  };

  const handleTabKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = (index + 1) % PILLAR_TABS.length;
      handleTabChange(PILLAR_TABS[nextIndex].id);
      const nextTabEl = document.getElementById(`tab-${PILLAR_TABS[nextIndex].id}`);
      nextTabEl?.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = (index - 1 + PILLAR_TABS.length) % PILLAR_TABS.length;
      handleTabChange(PILLAR_TABS[prevIndex].id);
      const prevTabEl = document.getElementById(`tab-${PILLAR_TABS[prevIndex].id}`);
      prevTabEl?.focus();
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-150">
      {/* 1. TOP HEADER: Single Card containing Context, Download PDF, 4 Pillar Tabs, and Sub-filters Underneath (Hidden when viewing program detail) */}
      {!isDetailActive && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-4">
          {/* Top Row: Title on Left, Unduh Ringkasan PDF on Right */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight">
                  Ikhtisar 4 Pilar Prioritas PMK
                </h2>
                <p className="text-sm text-slate-500 font-normal">
                  Pemantauan kinerja target dan realisasi
                </p>
              </div>
            </div>

            {/* Unduh Ringkasan PDF stays at the top right of this card */}
            <div className="self-end sm:self-auto shrink-0">
              <ExecutivePdfButton currentPillar={activePillar} />
            </div>
          </div>

          {/* Bottom Row: Menu pilihan pilar di bawah judul ikhtisar sebagai tombol rapi */}
          <div className="border-t border-slate-100 pt-3.5">
            <nav
              role="tablist"
              aria-label="Pilih Tab Pilar"
              className="flex items-center gap-2.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden max-w-full"
            >
              {PILLAR_TABS.map((tab, index) => {
                const isActive = activePillar === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    id={`tab-${tab.id}`}
                    type="button"
                    role="tab"
                    tabIndex={isActive ? 0 : -1}
                    aria-selected={isActive}
                    aria-controls={`panel-${tab.id}`}
                    onClick={() => handleTabChange(tab.id)}
                    onKeyDown={(e) => handleTabKeyDown(e, index)}
                    style={
                      isActive
                        ? { backgroundColor: tab.brandColor, color: '#ffffff', borderColor: tab.brandColor }
                        : undefined
                    }
                    className={`min-h-[44px] h-[44px] inline-flex items-center gap-2.5 px-4.5 sm:px-5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-400 focus-visible:outline-hidden ${
                      isActive
                        ? `${tab.activeBg} font-bold shadow-2xs`
                        : 'bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50 border border-slate-200/90 shadow-2xs'
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 transition-colors ${
                        isActive ? 'text-white' : tab.inactiveIconColor
                      }`}
                      style={!isActive ? { color: tab.brandColor } : { color: '#ffffff' }}
                    />
                    <span
                      className={isActive ? 'text-white' : 'text-slate-800'}
                      style={isActive ? { color: '#ffffff' } : undefined}
                    >
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* 2. TAB CONTENT: Render each pillar page with category and category changer inside hero banner */}
      <div
        id={`panel-${activePillar}`}
        role="tabpanel"
        aria-labelledby={`tab-${activePillar}`}
        className="w-full focus-visible:outline-hidden"
      >
        {activePillar === 'pendidikan' && (
          <PendidikanDetailView
            onBackToHome={onBackToLanding}
            category={selectedCategory}
            onCategoryChange={setSelectedCategory}
            onDetailOpenChange={setIsDetailActive}
          />
        )}
        {activePillar === 'kesehatan' && (
          <KesehatanDetailView
            onBackToHome={onBackToLanding}
            category={selectedCategory}
            onCategoryChange={setSelectedCategory}
            onDetailOpenChange={setIsDetailActive}
          />
        )}
        {activePillar === 'bencana' && (
          <BencanaDetailView
            onBackToHome={onBackToLanding}
            category={selectedCategory}
            onCategoryChange={setSelectedCategory}
            onDetailOpenChange={setIsDetailActive}
          />
        )}
        {activePillar === 'kemiskinan' && (
          <KemiskinanDetailView
            onBackToHome={onBackToLanding}
            category={selectedCategory}
            onCategoryChange={setSelectedCategory}
            onDetailOpenChange={setIsDetailActive}
          />
        )}
      </div>
    </div>
  );
};
