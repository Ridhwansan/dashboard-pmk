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

interface BencanaDetailViewProps {
  onBackToHome: () => void;
  pillar: PillarData;
  category?: string;
}

interface WidgetCardItem {
  id: string;
  chipLabel?: string;
  title: string;
  value: string;
  unit?: string;
  status: string;
  target: string;
  percent?: number;
  subtext?: string;
}

export const BencanaDetailView: React.FC<BencanaDetailViewProps> = ({
  category = 'PKPN',
}) => {
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [activeKendalaId, setActiveKendalaId] = useState<string | number | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'indikator' | 'kendala'>('indikator');

  const kendalaCount = useMemo(() => {
    return getKendalaListByPillar('bencana').length;
  }, []);

  // If a program detail is selected, render it as its own full page
  if (selectedProgramId) {
    const programDetail = getProgramDetailData(selectedProgramId, undefined, 'bencana');
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

  // 6 Priority Program Widgets for Bencana (Gambar 3 Verbatim)
  const widgetCards: WidgetCardItem[] = [
    {
      id: 'jumlah_kejadian_bencana',
      chipLabel: 'PKPN',
      title: 'Jumlah kejadian bencana',
      value: '2.100',
      unit: 'kejadian',
      status: 'Tercatat s.d. Okt 2026',
      target: '2025: 4.727 kejadian',
      subtext: 'Pemantauan kesiapsiagaan darurat bencana nasional',
    },
    {
      id: 'huntara_sumatera',
      chipLabel: 'PKPN',
      title: 'Pembangunan Huntara Sumatera',
      value: '20.770',
      unit: 'unit',
      status: 'Realisasi 2026',
      target: 'Target 2026: 20.803 unit',
      percent: 99.8,
      subtext: 'Penyediaan hunian sementara pengungsi pascabencana',
    },
    {
      id: 'huntap_sumatera',
      chipLabel: 'PKPN',
      title: 'Pembangunan Huntap Sumatera',
      value: '1.012',
      unit: 'unit',
      status: 'Realisasi 2026',
      target: 'Target 2026: 44.121 unit',
      percent: 2.3,
      subtext: 'Pembangunan hunian tetap relokasi bencana',
    },
    {
      id: 'provinsi_karhutla',
      chipLabel: 'PKPN',
      title: 'Provinsi Prioritas Terdampak Karhutla',
      value: '6',
      unit: 'Provinsi',
      status: 'Data 13 Oktober 2026',
      target: 'Fokus pengendalian & pencegahan terpadu',
      subtext: 'Wilayah prioritas kerawanan kebakaran hutan dan lahan',
    },
    {
      id: 'luas_karhutla',
      chipLabel: 'PKPN',
      title: 'Luas Karhutla yang sudah dipadamkan',
      value: '129.434,18',
      unit: 'Ha',
      status: 'Jumlah Luas Karhutla: 130.097,79 Ha',
      target: 'Dalam proses pemadaman: 663,61 Ha',
      percent: 99.5,
      subtext: 'Efektivitas satgas pemadaman karhutla tuntas 99,5%',
    },
    {
      id: 'kerugian_bencana',
      chipLabel: 'PKPN',
      title: 'Kerugian bencana',
      value: '—',
      unit: '% PDB',
      status: 'Realisasi 2026',
      target: 'Target 2026: 0,136% PDB',
      subtext: 'Monitoring dampak kerugian ekonomi terhadap Produk Domestik Bruto',
    },
  ];

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-150">
      {/* 1. Header Card: Photographic Banner with Gradient Overlay & High Contrast (Centered Vertically) */}
      <div className="relative overflow-hidden rounded-3xl min-h-[140px] sm:min-h-[160px] border border-slate-200/90 shadow-xs flex flex-col justify-center p-6 sm:p-8 group bg-slate-900">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
          style={{ backgroundImage: `url('/images/banners/header-bencana.jpg')` }}
        />
        {/* Multi-stop Gradient Overlay for Legibility & Contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/85 to-[#3b2110]/50 backdrop-blur-[0.5px]" />
        
        {/* Ambient Subtle Accent Light */}
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-[#a8754b]/20 blur-3xl pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 space-y-1.5 max-w-2xl">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight drop-shadow-xs">
            {category === 'PKPN' ? 'PKPN Bencana' : 'Bencana'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 font-medium drop-shadow-xs">
            Target dan Capaian Kinerja Program
          </p>
        </div>
      </div>

      {/* 2. Tab Navigation: Indikator vs Kendala (Consistent Segmented Button Style) */}
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
            <span
              className={`ml-1.5 px-1.5 py-0.5 rounded-md text-[11px] font-bold ${
                activeTab === 'indikator'
                  ? 'bg-slate-100 text-slate-800'
                  : 'bg-slate-200/70 text-slate-600'
              }`}
            >
              {widgetCards.length}
            </span>
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
            <span
              className={`ml-1.5 px-1.5 py-0.5 rounded-md text-[11px] font-bold ${
                activeTab === 'kendala'
                  ? 'bg-amber-100 text-amber-900'
                  : 'bg-slate-200/70 text-slate-600'
              }`}
            >
              {kendalaCount}
            </span>
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
          pillarId="bencana"
          pillarTitle="Bencana"
          themeColor="amber"
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
                className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-lg hover:border-[#a8754b] p-6 sm:p-7 flex flex-col justify-between group transition-all duration-200 cursor-pointer select-none"
              >
                <div>
                  {/* Header Widget */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#7a4b27] transition-colors leading-snug">
                      {card.title}
                    </h3>
                  </div>

                  {/* Big Number & Unit */}
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
                            className="h-full bg-[#7a4b27] rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(100, card.percent)}%` }}
                          />
                        </div>
                        <span className="text-xs font-extrabold text-[#7a4b27] tabular-nums shrink-0">
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
                  <div className="w-full py-2.5 px-3 rounded-xl bg-slate-50 group-hover:bg-[#fcf8f4] text-slate-700 group-hover:text-[#7a4b27] border border-slate-200/80 group-hover:border-[#a8754b]/40 text-xs font-bold transition-all duration-150 flex items-center justify-between pointer-events-none">
                    <span className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-[#7a4b27]" />
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
