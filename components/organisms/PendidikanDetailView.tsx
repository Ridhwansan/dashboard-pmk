'use client';

import React, { useState } from 'react';
import { GraduationCap, ChevronRight, BarChart3 } from 'lucide-react';
import { PillarData } from '@/types/dashboard';
import { ProgramDetailPageView } from './ProgramDetailPageView';
import { getProgramDetailData } from '@/data/programDetailData';

interface PendidikanDetailViewProps {
  onBackToHome: () => void;
  pillar: PillarData;
}

interface WidgetCardItem {
  id: string;
  chipLabel?: string;
  title: string;
  value: string;
  unit: string;
  status: string;
  target: string;
  percent?: number;
  subtext?: string;
}

export const PendidikanDetailView: React.FC<PendidikanDetailViewProps> = () => {
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);

  // If a program detail is selected, render it as its own full page
  if (selectedProgramId) {
    const programDetail = getProgramDetailData(selectedProgramId, undefined, 'pendidikan');
    return (
      <ProgramDetailPageView
        program={programDetail}
        onBack={() => setSelectedProgramId(null)}
      />
    );
  }

  // 6 Priority Program Widgets from Gambar 2 (Verbatim)
  const widgetCards: WidgetCardItem[] = [
    {
      id: 'revitalisasi_satdik',
      chipLabel: 'PKPN',
      title: 'Revitalisasi Satuan Pendidikan',
      value: '36.669',
      unit: 'satuan pendidikan',
      status: 'Capaian 2026',
      target: 'Target 2026: 80.282 satuan pendidikan',
      percent: 45.7,
    },
    {
      id: 'snt_operasional',
      chipLabel: 'PKPN',
      title: 'SNT operasional',
      value: '17',
      unit: 'satuan pendidikan',
      status: 'Capaian 2026',
      target: 'Target 2026: 35 satuan pendidikan',
      percent: 48.6,
    },
    {
      id: 'sug_baru',
      chipLabel: 'PKPN',
      title: 'Sekolah Unggul Garuda Baru',
      value: '3',
      unit: 'Sekolah Unggul Garuda Baru',
      status: 'Capaian 2026',
      target: 'Target 2026: 4 satuan pendidikan',
      percent: 75,
    },
    {
      id: 'sug_transformasi',
      chipLabel: 'PKPN',
      title: 'Sekolah Unggul Garuda Transformasi',
      value: '42',
      unit: 'satuan pendidikan',
      status: 'Capaian 2025 :12 satuan pendidikan; Capaian 2026: 30 satuan pendidikan',
      target: 'Target 2026: 30 satuan pendidikan',
      percent: 100,
    },
    {
      id: 'digitalisasi_pendidikan',
      chipLabel: 'PKPN',
      title: 'Digitalisasi Pendidikan',
      value: '727.436',
      unit: 'unit',
      status: 'Capaian 2026 (Berproses disalurkan ke 316.535 sekolah)',
      target: 'Target 2026: 727.436 unit',
      percent: 100,
    },
    {
      id: 'studio_guru',
      chipLabel: 'PKPN',
      title: 'Studio Guru',
      value: '1',
      unit: 'studio pusat + 110 konten pembelajaran',
      status: 'Launching 25 November 2026',
      target: 'Target 2026: Studio Guru beroperasi penuh',
    },
  ];

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-150">
      {/* 1. Header Card: Factual Title */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-2xs shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
              Pendidikan
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Target dan Realisasi Program Prioritas (RPJMN 2025–2029)
            </p>
          </div>
        </div>
      </div>

      {/* 2. Grid of Separated Widget Cards (Whole Card Clickable, Compact Height) */}
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
                {/* PKPN Chip Label */}
                <div className="mb-2.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200/90 shadow-2xs">
                    {card.chipLabel || 'PKPN'}
                  </span>
                </div>

                {/* Header Widget */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-900 transition-colors leading-snug">
                    {card.title}
                  </h3>
                </div>

                {/* Big Number & Unit */}
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tabular-nums tracking-tight">
                    {card.value}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {card.unit}
                  </span>
                </div>

                {/* Target & Status Information */}
                <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
                  <div className="flex items-center justify-between text-slate-600 font-medium">
                    <span>{card.status}</span>
                    {card.percent !== undefined && (
                      <span className="font-bold text-blue-700 tabular-nums">
                        {card.percent}%
                      </span>
                    )}
                  </div>

                  {/* Visual Progress Bar */}
                  {card.percent !== undefined && (
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, card.percent)}%` }}
                      />
                    </div>
                  )}

                  <div className="text-slate-700 font-semibold truncate pt-0.5">
                    {card.target}
                  </div>

                  {card.subtext && (
                    <div className="text-[11px] text-slate-500 font-medium">
                      {card.subtext}
                    </div>
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
    </div>
  );
};
