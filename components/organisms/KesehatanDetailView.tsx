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

interface KesehatanDetailViewProps {
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

export const KesehatanDetailView: React.FC<KesehatanDetailViewProps> = ({
  category = 'PKPN',
}) => {
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [activeKendalaId, setActiveKendalaId] = useState<string | number | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'indikator' | 'kendala'>('indikator');

  const kendalaCount = useMemo(() => {
    return getKendalaListByPillar('kesehatan').length;
  }, []);

  // If a program detail is selected, render it as its own full page
  if (selectedProgramId) {
    const programDetail = getProgramDetailData(selectedProgramId, undefined, 'kesehatan');
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

  // 9 Executive Program Widgets for Pilar Kesehatan (Gambar 1 Verbatim)
  const widgetCards: WidgetCardItem[] = [
    {
      id: 'ckg',
      chipLabel: 'PKPN',
      title: 'Cek Kesehatan Gratis',
      value: '105,98',
      unit: 'Juta Jiwa',
      status: 'Realisasi 2026',
      target: 'Target 2026: 130 Juta Jiwa',
      percent: 81.5,
    },
    {
      id: 'tb',
      chipLabel: 'PKPN',
      title: 'Penemuan Kasus TB',
      value: '663.455',
      unit: 'Kasus',
      status: 'Realisasi 2026',
      target: 'Target 2026: 972.000 Kasus',
      percent: 68.3,
    },
    {
      id: 'rsud',
      chipLabel: 'PKPN',
      title: 'Renovasi RSUD Tipe D ke C',
      value: '39',
      unit: 'RSUD',
      status: 'Realisasi 2025: 21 RSUD; Realisasi 2026: 18 RSUD Konstruksi',
      target: 'Target 2026: 20 RSUD',
      subtext: 'Target 2027: 66 RSUD',
      percent: 90.0,
    },
    {
      id: 'stunting',
      chipLabel: 'PKPN',
      title: 'Stunting',
      value: '19,8%',
      status: 'Realisasi 2024 (Survei SKI)',
      target: 'Target 14% Pada 2029',
    },
    {
      id: 'mbg_balita',
      chipLabel: 'PKPN',
      title: 'MBG Balita Non-PAUD',
      value: '4,89',
      unit: 'Juta Jiwa',
      status: 'Realisasi 2026 (29,2% dari Sasaran)',
      target: 'Target 2026: 16,7 Juta Jiwa',
      percent: 29.2,
    },
    {
      id: 'mbg_ibu_hamil',
      chipLabel: 'PKPN',
      title: 'MBG Ibu Hamil',
      value: '0,65',
      unit: 'Juta Jiwa',
      status: 'Realisasi 2026 (26,3% dari Sasaran)',
      target: 'Target 2026: 2,49 Juta Jiwa',
      percent: 26.3,
    },
    {
      id: 'mbg_ibu_menyusui',
      chipLabel: 'PKPN',
      title: 'MBG Ibu Menyusui',
      value: '1,77',
      unit: 'Juta Jiwa',
      status: 'Realisasi 2026 (64,5% dari Sasaran)',
      target: 'Target 2026: 2,75 Juta Jiwa',
      percent: 64.5,
    },
    {
      id: 'puskesmas',
      chipLabel: 'PKPN',
      title: 'Revitalisasi Puskesmas',
      value: '10.000',
      unit: 'Puskesmas',
      status: 'Target 2027',
      target: 'Target 2027: 10.000 Puskesmas',
    },
    {
      id: 'revitalisasi_rs',
      chipLabel: 'PKPN',
      title: 'Revitalisasi RS',
      value: '450',
      unit: 'RS',
      status: 'Target 2027-2028',
      target: 'Target 2027-2028: 450 RS',
    },
  ];

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-150">
      {/* 1. Header Card: Photographic Banner with Gradient Overlay & High Contrast (Centered Vertically) */}
      <div className="relative overflow-hidden rounded-3xl min-h-[140px] sm:min-h-[160px] border border-slate-200/90 shadow-xs flex flex-col justify-center p-6 sm:p-8 group bg-slate-900">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
          style={{ backgroundImage: `url('/images/banners/header-kesehatan.jpg')` }}
        />
        {/* Multi-stop Gradient Overlay for Legibility & Contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/85 to-emerald-950/45 backdrop-blur-[0.5px]" />
        
        {/* Ambient Subtle Accent Light */}
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 space-y-1.5 max-w-2xl">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight drop-shadow-xs">
            {category === 'PKPN' ? 'PKPN Kesehatan' : 'Kesehatan'}
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
          pillarId="kesehatan"
          pillarTitle="Kesehatan"
          themeColor="emerald"
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
                className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-lg hover:border-emerald-400 p-6 sm:p-7 flex flex-col justify-between group transition-all duration-200 cursor-pointer select-none"
              >
                <div>
                  {/* Header Widget */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-emerald-900 transition-colors leading-snug">
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
                            className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(100, card.percent)}%` }}
                          />
                        </div>
                        <span className="text-xs font-extrabold text-emerald-700 tabular-nums shrink-0">
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
                  <div className="w-full py-2.5 px-3 rounded-xl bg-slate-50 group-hover:bg-emerald-50 text-slate-700 group-hover:text-emerald-700 border border-slate-200/80 group-hover:border-emerald-200 text-xs font-bold transition-all duration-150 flex items-center justify-between pointer-events-none">
                    <span className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-emerald-600" />
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
