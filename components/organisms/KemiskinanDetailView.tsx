'use client';

import React, { useState } from 'react';
import { TrendingDown, ChevronRight, BarChart3 } from 'lucide-react';
import { PillarData } from '@/types/dashboard';
import { ProgramDetailPageView } from './ProgramDetailPageView';
import { getProgramDetailData } from '@/data/programDetailData';

interface KemiskinanDetailViewProps {
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

export const KemiskinanDetailView: React.FC<KemiskinanDetailViewProps> = ({
  category = 'PKPN',
}) => {
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);

  // If a program detail is selected, render it as its own full page
  if (selectedProgramId) {
    const programDetail = getProgramDetailData(selectedProgramId, undefined, 'kemiskinan');
    return (
      <ProgramDetailPageView
        program={programDetail}
        onBack={() => setSelectedProgramId(null)}
        category={category}
      />
    );
  }

  // 9 Executive Program Widgets for Penurunan Kemiskinan (Gambar 4 Verbatim)
  const widgetCards: WidgetCardItem[] = [
    {
      id: 'tingkat_kemiskinan',
      chipLabel: 'PKPN',
      title: 'Tingkat kemiskinan',
      value: '8,07',
      status: 'Capaian 2026 • % penduduk',
      target: 'Target 2026: 6,5–7,5',
      percent: 91.0,
      subtext: 'Pemantauan laju penurunan kemiskinan nasional',
    },
    {
      id: 'kemiskinan_ekstrem',
      chipLabel: 'PKPN',
      title: 'Kemiskinan ekstrem',
      value: '0.78',
      status: 'Capaian 2025 • % penduduk',
      target: 'Target 2026: 0–0,5',
      percent: 85.0,
      subtext: 'Target penurunan kemiskinan ekstrem mendekati 0%',
    },
    {
      id: 'bantuan_permakanan_lansia',
      chipLabel: 'PKPN',
      title: 'Bantuan permakanan lansia',
      value: '116.754',
      status: 'Capaian 2025 • orang penerima',
      target: 'Target 2027 ≥116.754 | 2026 terhenti',
      subtext: 'Dalam proses peralihan & sinkronisasi program',
    },
    {
      id: 'bantuan_permakanan_disabilitas',
      chipLabel: 'PKPN',
      title: 'Bantuan permakanan disabilitas',
      value: '36.000',
      status: 'Capaian 2025 • orang penerima',
      target: 'Target 2027 ≥36.000 | 2026 terhenti',
      subtext: 'Dalam proses peralihan & sinkronisasi program',
    },
    {
      id: 'cakupan_lansia_desil',
      chipLabel: 'PKPN',
      title: 'Cakupan lansia desil 1–5',
      value: '0,66',
      status: 'Capaian 2025 • % sasaran',
      target: '2026 belum tersedia',
      subtext: 'Perlindungan sosial & jaminan kesejahteraan lanjut usia',
    },
    {
      id: 'cakupan_disabilitas_desil',
      chipLabel: 'PKPN',
      title: 'Cakupan disabilitas desil 1–5',
      value: '0,41',
      status: 'Capaian 2025 • % sasaran',
      target: '2026 belum tersedia',
      subtext: 'Perlindungan sosial & pemenuhan hak penyandang disabilitas',
    },
    {
      id: 'bos_reguler',
      chipLabel: 'PKPN',
      title: 'Bantuan Operasional Sekolah Reguler',
      value: '432.654 (99%)',
      status: 'Capaian 2026 • sekolah penerima',
      target: 'Target 2026 432.716',
      percent: 99.9,
      subtext: 'Penyaluran dana BOS reguler sekolah dasar & menengah',
    },
    {
      id: 'bop_pendidikan',
      chipLabel: 'PKPN',
      title: 'Bantuan Operasional Pendidikan',
      value: '396.618',
      status: 'Capaian 2026 • Lembaga Penerima',
      target: 'Target 2026 406.741',
      percent: 97.5,
      subtext: 'Dukungan operasional PAUD & pendidikan non-formal',
    },
    {
      id: 'bos_madrasah',
      chipLabel: 'PKPN',
      title: 'Bantuan Operasional Sekolah Madrasah',
      value: '10.36',
      status: 'Capaian 2026 • juta penerima',
      target: 'Target 2026.',
      percent: 100,
      subtext: 'Penyaluran BOS madrasah di lingkungan Kementerian Agama',
    },
  ];

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-150">
      {/* 1. Header Card: Factual Title */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-2xs shrink-0">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {category === 'PKPN' ? 'PKPN Kemiskinan' : 'Kemiskinan'}
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
              className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-lg hover:border-rose-400 p-6 sm:p-7 flex flex-col justify-between group transition-all duration-200 cursor-pointer select-none"
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
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-rose-900 transition-colors leading-snug">
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
                      <span className="font-bold text-rose-700 tabular-nums">
                        {card.percent}%
                      </span>
                    )}
                  </div>

                  {/* Visual Progress Bar */}
                  {card.percent !== undefined && (
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-600 rounded-full transition-all duration-300"
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
                <div className="w-full py-2.5 px-3 rounded-xl bg-slate-50 group-hover:bg-rose-50 text-slate-700 group-hover:text-rose-700 border border-slate-200/80 group-hover:border-rose-200 text-xs font-bold transition-all duration-150 flex items-center justify-between pointer-events-none">
                  <span className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-rose-600" />
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
