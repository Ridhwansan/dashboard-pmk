'use client';

import React, { useState } from 'react';
import { HeartPulse, ChevronRight, BarChart3 } from 'lucide-react';
import { PillarData } from '@/types/dashboard';
import { ProgramDetailPageView } from './ProgramDetailPageView';
import { getProgramDetailData } from '@/data/programDetailData';

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

  // If a program detail is selected, render it as its own full page
  if (selectedProgramId) {
    const programDetail = getProgramDetailData(selectedProgramId, undefined, 'kesehatan');
    return (
      <ProgramDetailPageView
        program={programDetail}
        onBack={() => setSelectedProgramId(null)}
        category={category}
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
      unit: 'juta jiwa',
      status: 'Capaian 2026',
      target: 'Target 2026: 130',
      percent: 81.5,
    },
    {
      id: 'tb',
      chipLabel: 'PKPN',
      title: 'Penemuan kasus TB',
      value: '663.455',
      unit: 'kasus',
      status: 'Capaian 2026',
      target: 'Target 2026: 972.000',
      percent: 68.3,
    },
    {
      id: 'rsud',
      chipLabel: 'PKPN',
      title: 'Renovasi RSUD Tipe D ke C',
      value: '39',
      unit: 'RSUD',
      status: 'Capaian 2025 :21 RSUD Capaian 2026: 18 RSUD proses konstruksi',
      target: 'Target 2026: 20 RSUD',
      subtext: 'Target 2027: 66 RSUD',
      percent: 90.0,
    },
    {
      id: 'stunting',
      chipLabel: 'PKPN',
      title: 'Stunting',
      value: '19,8%',
      status: 'Capaian 2024 (Survei SKI)',
      target: 'Target 14% pada 2029',
    },
    {
      id: 'mbg_balita',
      chipLabel: 'PKPN',
      title: 'MBG balita non-PAUD',
      value: '4,89',
      unit: 'juta jiwa',
      status: 'Capaian 2026 • 29,2% dari sasaran',
      target: 'Target 2026: 16,7 juta jiwa',
      percent: 29.2,
    },
    {
      id: 'mbg_ibu_hamil',
      chipLabel: 'PKPN',
      title: 'MBG ibu hamil',
      value: '0,65',
      unit: 'juta jiwa',
      status: 'Capaian 2026 • 26,3% dari sasaran',
      target: 'Target 2026: 2,49 juta jiwa',
      percent: 26.3,
    },
    {
      id: 'mbg_ibu_menyusui',
      chipLabel: 'PKPN',
      title: 'MBG ibu menyusui',
      value: '1,77',
      unit: 'juta jiwa',
      status: 'Capaian 2026 • 64,5% dari sasaran',
      target: 'Target 2026: 2,75 juta jiwa',
      percent: 64.5,
    },
    {
      id: 'puskesmas',
      chipLabel: 'PKPN',
      title: 'Revitalisasi Puskesmas',
      value: '10.000',
      unit: 'puskesmas',
      status: 'Target 2027',
      target: 'Target 2027: 10.000 puskesmas',
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
      {/* 1. Header Card: Factual Title */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-2xs shrink-0">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {category === 'PKPN' ? 'PKPN Kesehatan' : 'Kesehatan'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Target dan Capaian
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
              className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-lg hover:border-emerald-400 p-6 sm:p-7 flex flex-col justify-between group transition-all duration-200 cursor-pointer select-none"
            >
              <div>
                {/* PKPN Chip Label */}
                <div className="mb-2.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200/90 shadow-2xs">
                    {category || card.chipLabel || 'PKPN'}
                  </span>
                </div>

                {/* Header Widget */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-emerald-900 transition-colors leading-snug">
                    {card.title}
                  </h3>
                </div>

                {/* Big Number & Unit */}
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tabular-nums tracking-tight">
                    {card.value}
                  </span>
                  {card.unit && (
                    <span className="text-xs font-semibold text-slate-500">
                      {card.unit}
                    </span>
                  )}
                </div>

                {/* Target & Status Information */}
                <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
                  <div className="flex items-center justify-between text-slate-600 font-medium">
                    <span>{card.status}</span>
                    {card.percent !== undefined && (
                      <span className="font-bold text-emerald-700 tabular-nums">
                        {card.percent}%
                      </span>
                    )}
                  </div>

                  {/* Visual Progress Bar */}
                  {card.percent !== undefined && (
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all duration-300"
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
    </div>
  );
};
