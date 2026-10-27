'use client';

import React, { useState, useMemo } from 'react';
import {
  ChevronRight,
  BarChart3,
} from 'lucide-react';
import { PillarData } from '@/types/dashboard';
import { ProgramDetailPageView } from './ProgramDetailPageView';
import { getProgramDetailData, getKendalaListByPillar } from '@/data/programDetailData';
import { PillarKendalaList } from '@/components/molecules/PillarKendalaList';

interface PendidikanDetailViewProps {
  onBackToHome: () => void;
  pillar: PillarData;
  category?: string;
}

interface WidgetCardItem {
  id: string;
  chipLabel?: string;
  title: string;
  value?: string;
  unit?: string;
  status?: string;
  target?: string;
  percent?: number;
  subtext?: string;
  isMilestone?: boolean;
  milestoneContent?: string;
}

export const PendidikanDetailView: React.FC<PendidikanDetailViewProps> = ({
  category = 'PKPN',
}) => {
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [activeKendalaId, setActiveKendalaId] = useState<string | number | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'indikator' | 'kendala'>('indikator');

  const kendalaCount = useMemo(() => {
    return getKendalaListByPillar('pendidikan').length;
  }, []);

  // If a program detail is selected, render it as its own full page
  if (selectedProgramId) {
    const programDetail = getProgramDetailData(selectedProgramId, undefined, 'pendidikan');
    return (
      <ProgramDetailPageView
        program={programDetail}
        onBack={() => {
          setSelectedProgramId(null);
          setActiveKendalaId(undefined);
        }}
        category={category}
        initialSection={activeKendalaId ? 'kendala' : 'overview'}
        highlightKendalaId={activeKendalaId}
      />
    );
  }

  // 6 Priority Program Widgets matching Gambar 1 verbatim
  const widgetCards: WidgetCardItem[] = [
    {
      id: 'revitalisasi_satdik',
      chipLabel: 'PKPN',
      title: 'Revitalisasi Satuan Pendidikan',
      value: '36.669',
      unit: 'Satuan Pendidikan',
      status: 'Realisasi 2026',
      target: 'Target 2026: 80.282 Satuan Pendidikan',
      percent: 45.7,
    },
    {
      id: 'snt_operasional',
      chipLabel: 'PKPN',
      title: 'Sekolah Nasional Terintegrasi (SNT)',
      value: '17',
      unit: 'Sekolah',
      status: 'Realisasi 2026',
      target: 'Target 2026: 35 Sekolah',
      percent: 48.6,
    },
    {
      id: 'sug_baru',
      chipLabel: 'PKPN',
      title: 'Sekolah Unggul Garuda Baru',
      value: '3',
      unit: 'Sekolah',
      status: 'Realisasi 2026',
      target: 'Target 2026: 4 Sekolah',
      percent: 75,
    },
    {
      id: 'sug_transformasi',
      chipLabel: 'PKPN',
      title: 'Sekolah Unggul Garuda Transformasi',
      value: '42',
      unit: 'Sekolah',
      status: 'Realisasi 2025: 12 Sekolah; Realisasi 2026: 30 Sekolah',
      target: 'Target 2026: 30 Sekolah',
      percent: 100,
    },
    {
      id: 'digitalisasi_pendidikan',
      chipLabel: 'PKPN',
      title: 'Digitalisasi Pendidikan',
      value: '727.436',
      unit: 'Unit',
      status: 'Realisasi 2026 (Berproses Disalurkan ke 316.535 Sekolah)',
      target: 'Target 2026: Penyaluran Perangkat TIK',
      percent: 100,
    },
    {
      id: 'studio_guru',
      chipLabel: 'PKPN',
      title: 'Studio Guru',
      isMilestone: true,
      milestoneContent: '1 Studio Pusat + 110 Konten Pembelajaran, Launching 25 November 2026',
      target: 'Target 2026: Studio Guru Beroperasi Penuh',
    },
  ];

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-150">
      {/* 1. Header Card: Photographic Banner with Gradient Overlay & High Contrast (Centered Vertically) */}
      <div className="relative overflow-hidden rounded-3xl min-h-[140px] sm:min-h-[160px] border border-slate-200/90 shadow-xs flex flex-col justify-center p-6 sm:p-8 group bg-slate-900">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
          style={{ backgroundImage: `url('/images/banners/header-pendidikan.jpg')` }}
        />
        {/* Multi-stop Gradient Overlay for Legibility & Contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/85 to-blue-950/45 backdrop-blur-[0.5px]" />
        
        {/* Ambient Subtle Accent Light */}
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 space-y-1.5 max-w-2xl">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight drop-shadow-xs">
            {category === 'PKPN' ? 'PKPN Pendidikan' : 'Pendidikan'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 font-medium drop-shadow-xs">
            Target dan Capaian Kinerja Program
          </p>
        </div>
      </div>

      {/* 2. Tab Navigation: Indikator vs Kendala (Consistent Segmented Button Style - Numbers Removed) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="inline-flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => setActiveTab('indikator')}
            className={`h-9 px-4 rounded-lg text-xs sm:text-sm font-bold transition-all duration-150 cursor-pointer ${
              activeTab === 'indikator'
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <span>Indikator</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('kendala')}
            className={`h-9 px-4 rounded-lg text-xs sm:text-sm font-bold transition-all duration-150 cursor-pointer ${
              activeTab === 'kendala'
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <span>Kendala</span>
          </button>
        </div>

        <div className="text-xs font-semibold text-slate-400">
          {activeTab === 'indikator'
            ? `Menampilkan ${widgetCards.length} indikator program`
            : `${kendalaCount} isu kendala terdata`}
        </div>
      </div>

      {/* 3. Tab Content */}
      {activeTab === 'kendala' ? (
        <PillarKendalaList
          pillarId="pendidikan"
          pillarTitle="Pendidikan"
          themeColor="blue"
          onSelectProgram={(programId, kendalaId) => {
            setSelectedProgramId(programId);
            setActiveKendalaId(kendalaId);
          }}
        />
      ) : (
        /* Grid of Separated Widget Cards (Dynamic spacing, zero overlapping) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {widgetCards.map((card) => {
            return (
              <div
                key={card.id}
                onClick={() => setSelectedProgramId(card.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedProgramId(card.id);
                  }
                }}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-lg hover:border-blue-400 p-6 sm:p-7 flex flex-col justify-between group transition-all duration-200 cursor-pointer select-none"
              >
                <div>
                  {/* Header Widget */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-900 transition-colors leading-snug">
                      {card.title}
                    </h3>
                  </div>

                  {/* Metric Display: Big Number or Milestone Description */}
                  {card.isMilestone ? (
                    <div className="mb-4 min-h-[44px] flex items-center">
                      <p className="text-sm sm:text-[15px] font-bold text-slate-900 leading-snug">
                        {card.milestoneContent}
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-baseline flex-wrap gap-x-2 gap-y-1 mb-4 min-h-[44px]">
                      <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tabular-nums tracking-tight">
                        {card.value}
                      </span>
                      {card.unit && (
                        <span className="text-xs sm:text-sm font-semibold text-slate-600">
                          {card.unit}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Status, Progress Bar, & Helper Target (Clean, Non-box, High Contrast) */}
                  <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
                    {/* Simplified Status Label (e.g. "Realisasi 2026") */}
                    {card.status && (
                      <p className="text-xs font-semibold text-slate-800 leading-snug">
                        {card.status}
                      </p>
                    )}

                    {/* Progress Bar with Directly Aligned Percentage */}
                    {card.percent !== undefined && (
                      <div className="flex items-center gap-2.5 pt-0.5">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(100, card.percent)}%` }}
                          />
                        </div>
                        <span className="text-xs font-extrabold text-blue-700 tabular-nums shrink-0">
                          {card.percent}%
                        </span>
                      </div>
                    )}

                    {/* Target as Small Helper Text Right Below Progress Bar (No Gray Box!) */}
                    {card.target && (
                      <p className="text-[11.5px] text-slate-600 font-medium leading-relaxed pt-0.5">
                        {card.target}
                      </p>
                    )}

                    {/* Subtext if present */}
                    {card.subtext && (
                      <p className="text-[11px] text-slate-500 font-normal leading-normal">
                        {card.subtext}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action: Detail Program Button Affordance */}
                <div className="mt-5 pt-3.5 border-t border-slate-100">
                  <div className="w-full py-2.5 px-3 rounded-xl bg-slate-50 group-hover:bg-blue-50 text-slate-700 group-hover:text-blue-700 border border-slate-200/80 group-hover:border-blue-200 text-xs font-bold transition-all duration-150 flex items-center justify-between pointer-events-none">
                    <span className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-blue-600" />
                      <span>Lihat Detail Program</span>
                    </span>
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
