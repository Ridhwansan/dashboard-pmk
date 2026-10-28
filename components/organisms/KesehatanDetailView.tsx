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

      {/* 2. Sub-Header: Indikator Program */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="inline-flex items-center gap-2.5">
          <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80">
            <div className="h-8.5 px-3.5 rounded-lg text-xs sm:text-sm font-bold bg-white text-slate-900 shadow-2xs border border-slate-200/90 flex items-center gap-1.5">
              <span>Indikator</span>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-400 hidden sm:inline">·</span>
          <span className="text-xs font-medium text-slate-500 hidden sm:inline">
            Target, Realisasi &amp; Isu Utama Pelaksanaan
          </span>
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Menampilkan {widgetCards.length} indikator program
        </div>
      </div>

      {/* 3. Grid of Widget Cards (Dynamic text accommodation, consistent rhythm) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {widgetCards.map((card) => {
          const issueData = getIndicatorMainIssue(card.id, card.title, 'kesehatan');

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
              className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-lg hover:border-emerald-400 p-6 sm:p-7 flex flex-col justify-between h-full group transition-all duration-200 cursor-pointer select-none"
            >
              <div className="flex-1 flex flex-col">
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

                {/* Status, Progress Bar, & Helper Target */}
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

                {/* Isu Utama Section (Accommodates Dynamic Free Text, Keeps Cards Uniform) */}
                <div className="mt-4 pt-3.5 border-t border-slate-100 flex-1 flex flex-col justify-start">
                  <div
                    className={`rounded-2xl p-3.5 border transition-all ${
                      issueData.hasIssue
                        ? 'bg-amber-50/70 border-amber-200/80 group-hover:border-amber-300'
                        : 'bg-slate-50/70 border-slate-200/80'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        {issueData.hasIssue ? (
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        )}
                        <span
                          className={`text-[11px] font-bold uppercase tracking-wider ${
                            issueData.hasIssue ? 'text-amber-900' : 'text-slate-700'
                          }`}
                        >
                          Isu Utama
                        </span>
                      </div>
                      {issueData.totalCount > 1 ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100/90 text-amber-800 border border-amber-200/70">
                          +{issueData.totalCount - 1} isu lain
                        </span>
                      ) : issueData.hasIssue ? (
                        <span className="text-[10px] font-semibold text-amber-700">
                          Prioritas
                        </span>
                      ) : null}
                    </div>

                    <div className="space-y-1">
                      {issueData.title && (
                        <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                          {issueData.title}
                        </h4>
                      )}
                      <p
                        title={issueData.description}
                        className="text-[11.5px] text-slate-600 font-normal leading-relaxed line-clamp-3 group-hover:line-clamp-6 transition-all duration-200"
                      >
                        {issueData.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action: Detail Program Button Affordance (Always pinned at bottom) */}
              <div className="mt-4 pt-3.5 border-t border-slate-100">
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
