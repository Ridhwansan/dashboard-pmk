'use client';

import React, { useState } from 'react';
import {
  ChevronRight,
  BarChart3,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { PillarData } from '@/types/dashboard';
import { ProgramDetailPageView } from './ProgramDetailPageView';
import { getProgramDetailData, getIndicatorMainIssue } from '@/data/programDetailData';

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
      percent: 45.9,
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
      value: '30',
      unit: 'Sekolah',
      status: 'Realisasi 2025: 12 Sekolah; Realisasi 2026: 30 Sekolah (100%)',
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
      milestoneContent: 'Peluncuran 1 Studio Pusat dengan min. 100 Konten Pembelajaran (Nov 2026)',
      target: 'Target 2026: Peluncuran Nov 2027 · Target 2027: Operasional',
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

      {/* 2. Grid of Widget Cards - Calm, elegant, breathable (Gambar 3) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-1">
        {widgetCards.map((card) => {
          const issueData = getIndicatorMainIssue(card.id, card.title, 'pendidikan');

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
              className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-lg hover:border-blue-400 p-6 sm:p-7 flex flex-col justify-between h-full group transition-all duration-200 cursor-pointer select-none relative"
            >
              <div className="flex-1 flex flex-col">
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

                {/* Status, Progress Bar, & Helper Target */}
                <div className="pt-3.5 border-t border-slate-100 space-y-2 text-xs">
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

                  {/* Target as Small Helper Text Right Below Progress Bar */}
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

                {/* Sederhana, Ringkas & Bebas Warna Kuning Berlebih (Gambar 3) */}
                <div className="mt-4 pt-3.5 border-t border-slate-100 flex-1 flex flex-col justify-end">
                  {issueData.hasIssue ? (
                    <div className="relative group/popover">
                      <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-50/90 hover:bg-slate-100/90 border border-slate-200/80 transition-colors">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                          <span className="text-xs font-medium text-slate-700 truncate">
                            {issueData.title || issueData.description}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 shrink-0 uppercase tracking-tight">
                          {issueData.totalCount > 1 ? `+${issueData.totalCount - 1}` : 'Detail'}
                        </span>
                      </div>

                      {/* Floating Micro-Popover on Hover (Abu-abu elegan, mudah dibaca) */}
                      <div className="pointer-events-none opacity-0 group-hover/popover:opacity-100 transition-all duration-200 absolute bottom-full left-0 right-0 mb-2 z-30">
                        <div className="bg-slate-100/95 backdrop-blur-md text-slate-800 rounded-2xl p-4 shadow-xl border border-slate-300/90 space-y-2">
                          <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
                            <span className="text-xs font-extrabold text-amber-800 bg-amber-100/90 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                              Isu Pelaksanaan
                            </span>
                            {issueData.totalCount > 1 && (
                              <span className="text-xs font-semibold text-slate-500">
                                {issueData.totalCount} Isu Teridentifikasi
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                            {issueData.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50/60 border border-slate-200/60 text-slate-500 text-xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span className="text-xs font-medium truncate">Status Pelaksanaan Terkendali</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action: Detail Program Clean Link (Gambar 3) */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600 group-hover:text-blue-700 transition-colors">
                <span>Lihat Detail Program</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
