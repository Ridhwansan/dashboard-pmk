'use client';

import React, { useState } from 'react';
import { TrendingDown, ChevronRight, BarChart3 } from 'lucide-react';
import { PillarData } from '@/types/dashboard';
import { ProgramDetailPageView } from './ProgramDetailPageView';
import { getProgramDetailData } from '@/data/programDetailData';

interface KemiskinanDetailViewProps {
  onBackToHome: () => void;
  pillar: PillarData;
}

interface WidgetCardItem {
  id: string;
  title: string;
  value: string;
  unit?: string;
  status: string;
  target: string;
  percent?: number;
  subtext?: string;
}

export const KemiskinanDetailView: React.FC<KemiskinanDetailViewProps> = () => {
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);

  // If a program detail is selected, render it as its own full page
  if (selectedProgramId) {
    const programDetail = getProgramDetailData(selectedProgramId, undefined, 'kemiskinan');
    return (
      <ProgramDetailPageView
        program={programDetail}
        onBack={() => setSelectedProgramId(null)}
      />
    );
  }

  // 9 Executive Program Widgets for Penurunan Kemiskinan
  const widgetCards: WidgetCardItem[] = [
    {
      id: 'kemiskinan',
      title: 'Tingkat Kemiskinan',
      value: '8,07',
      unit: '% penduduk',
      status: 'Capaian Maret 2026',
      target: 'Target 2026: 6,5–7,5%',
      percent: 91.0,
      subtext: 'Realisasi September 2025: 8,25% (turun 0,18% poin)',
    },
    {
      id: 'kemiskinan_ekstrem',
      title: 'Kemiskinan Ekstrem',
      value: '0,78',
      unit: '% penduduk',
      status: 'Capaian 2025',
      target: 'Target 2026: 0–0,5%',
      percent: 85.0,
      subtext: 'Target RPJMN 2027: 0,0% secara tuntas nasional',
    },
    {
      id: 'permakanan_lansia',
      title: 'Bantuan Permakanan Lansia',
      value: '116.754',
      unit: 'orang penerima',
      status: 'Realisasi 2025 (2026 Terhenti)',
      target: 'Target 2027: ≥116.754 orang',
      subtext: 'Dalam proses integrasi ke program MBG Badan Gizi Nasional',
    },
    {
      id: 'permakanan_disabilitas',
      title: 'Bantuan Permakanan Disabilitas',
      value: '36.000',
      unit: 'orang penerima',
      status: 'Realisasi 2025 (2026 Terhenti)',
      target: 'Target 2027: ≥36.000 orang',
      subtext: 'Dalam proses integrasi ke program MBG Badan Gizi Nasional',
    },
    {
      id: 'desil_lansia',
      title: 'Cakupan Lansia Desil 1–5',
      value: '0,66',
      unit: '% sasaran',
      status: 'Capaian Basis 2025',
      target: 'Target: Perlindungan Lansia Rentan',
      subtext: 'Fokus asistensi sosial dan jaminan kesehatan KIS',
    },
    {
      id: 'desil_disabilitas',
      title: 'Cakupan Disabilitas Desil 1–5',
      value: '0,41',
      unit: '% sasaran',
      status: 'Capaian Basis 2025',
      target: 'Target: Asistensi Rehabilitasi Sosial',
      subtext: 'Pemberian alat bantu adaptif dan pemenuhan nutrisi',
    },
    {
      id: 'bos_reguler',
      title: 'Bantuan Operasional Sekolah (BOS) Reguler',
      value: '432.654',
      unit: 'sekolah (99%)',
      status: 'Capaian 2026',
      target: 'Target 2026: 432.716 sekolah',
      percent: 99.9,
      subtext: 'Penyaluran dana afirmasi pendidikan dasar-menengah',
    },
    {
      id: 'bop_pendidikan',
      title: 'Bantuan Operasional Pendidikan (BOP)',
      value: '396.618',
      unit: 'lembaga',
      status: 'Capaian 2026 (97,5%)',
      target: 'Target 2026: 406.741 lembaga',
      percent: 97.5,
      subtext: 'Dukungan PAUD dan pendidikan non-formal kantong kemiskinan',
    },
    {
      id: 'bos_madrasah',
      title: 'BOS Madrasah',
      value: '10,36',
      unit: 'juta siswa',
      status: 'Capaian Penyaluran 2026',
      target: 'Target 2026: Terpenuhi 100%',
      percent: 100,
      subtext: 'Bantuan operasional pendidikan keagamaan Kemenag',
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
              Penurunan Kemiskinan
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Target dan Realisasi Program Prioritas (RPJMN 2025–2029)
            </p>
          </div>
        </div>
      </div>

      {/* 2. Grid of Separated Widget Cards (No Kendala section on this initial page) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {widgetCards.map((card) => {
          return (
            <div
              key={card.id}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-lg hover:border-rose-400 p-6 sm:p-7 flex flex-col justify-between group transition-all duration-200"
            >
              <div>
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

              {/* Action: Detail Program Button */}
              <div className="mt-5 pt-3.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedProgramId(card.id)}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-50 group-hover:bg-rose-50 text-slate-700 group-hover:text-rose-700 border border-slate-200/80 group-hover:border-rose-200 text-xs font-bold transition-all duration-150 flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-rose-600" />
                    <span>Lihat Detail Program</span>
                  </span>
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
