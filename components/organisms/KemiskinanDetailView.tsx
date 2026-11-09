'use client';

import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { ProgramDetailPageView } from './ProgramDetailPageView';
import { ProgramDetailData, KendalaDetailItem, MonthlyDataPoint, DataUpdateLogItem, getProgramDetailData } from '@/data/programDetailData';
import { useCmsCards } from '@/lib/useCmsCards';

interface KemiskinanDetailViewProps {
  onBackToHome: () => void;
  category?: string;
}

export const KemiskinanDetailView: React.FC<KemiskinanDetailViewProps> = ({
  category = 'PKPN',
}) => {
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [activeKendalaId, setActiveKendalaId] = useState<string | number | undefined>(undefined);

  // Fetch cards dynamically from CMS / Database
  const { cards: cmsCards, loading } = useCmsCards('kemiskinan', category);

  // If a program detail is selected, render it as its own full page
  if (selectedProgramId) {
    const selectedCard = cmsCards.find((c) => (c.slug || c.id) === selectedProgramId);
    const programDetail: ProgramDetailData = selectedCard
      ? {
          id: selectedCard.slug || selectedCard.id,
          title: selectedCard.title,
          pillarId: 'kemiskinan',
          pillarTitle: 'Pilar Penurunan Kemiskinan',
          category: selectedCard.category,
          description: selectedCard.description || 'Pengawalan perlindungan sosial, penanggulangan kemiskinan ekstrem, dan graduasi mandiri.',
          picKementerian: selectedCard.picKementerian || 'Kemensos',
          unit: selectedCard.unit || '',
          currentValue: selectedCard.value,
          target2026: selectedCard.target,
          status: selectedCard.status,
          subtext: selectedCard.subtext,
          kendalaList: (selectedCard.kendalaList as KendalaDetailItem[]) || [],
          monthlyData: (selectedCard.monthlyData as Record<number, MonthlyDataPoint[]>) || {},
          updateLogs: (selectedCard.updateLogs as DataUpdateLogItem[]) || [],
        }
      : getProgramDetailData(selectedProgramId, undefined, 'kemiskinan');

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

  const displayedCards = cmsCards.map((c) => ({
    id: c.slug || c.id,
    chipLabel: c.category,
    title: c.title,
    value: c.value,
    unit: c.unit,
    status: c.status,
    target: c.target,
    percent: c.percent !== null && c.percent !== undefined ? c.percent : undefined,
    subtext: c.subtext,
    isMilestone: c.isMilestone,
    milestoneContent: c.milestoneContent,
    kendalaList: c.kendalaList,
  }));

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-150">
      {/* 1. Header Card: Photographic Banner with Gradient Overlay & High Contrast */}
      <div className="relative overflow-hidden rounded-3xl min-h-[140px] sm:min-h-[160px] border border-slate-200/90 shadow-xs flex flex-col justify-center p-6 sm:p-8 group bg-slate-900">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
          style={{ backgroundImage: `url('/images/banners/header-kemiskinan.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/85 to-rose-950/45 backdrop-blur-[0.5px]" />
        
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-rose-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-1.5 max-w-2xl">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight drop-shadow-xs">
            {category === 'Isu Strategis'
              ? 'Isu Strategis Penurunan Kemiskinan'
              : category === 'PKPN'
              ? 'PKPN Penurunan Kemiskinan'
              : 'Penurunan Kemiskinan'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 font-medium drop-shadow-xs">
            {category === 'Isu Strategis'
              ? 'Pemantauan 6 Agenda Isu Strategis Prioritas Penurunan Kemiskinan Nasional'
              : 'Target dan Capaian Kinerja Program'}
          </p>
        </div>
      </div>

      {/* 2. Grid of Widget Cards */}
      {loading && displayedCards.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-1">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 h-64 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-2/3 mb-4"></div>
              <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
              <div className="h-3 bg-slate-100 rounded w-full mb-2"></div>
              <div className="h-3 bg-slate-100 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-1">
          {displayedCards.map((card) => {
            const kendalaList = (card.kendalaList as Array<{ title?: string; kendala?: string }>) || [];
            const issueData = kendalaList.length > 0
              ? {
                  hasIssue: true,
                  title: kendalaList[0].title || 'Kendala Pelaksanaan',
                  description: kendalaList[0].kendala || kendalaList[0].title || 'Kendala sedang dalam tindak lanjut orkestrasi.',
                  totalCount: kendalaList.length,
                }
              : {
                  hasIssue: false,
                  title: 'Status Pelaksanaan Terkendali',
                  description: 'Tidak terdata kendala operasional kritis.',
                  totalCount: 0,
                };

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
              className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-lg hover:border-rose-400 p-6 sm:p-7 flex flex-col justify-between h-full group transition-all duration-200 cursor-pointer select-none relative focus-visible:outline-2 focus-visible:outline-rose-500"
            >
              <div className="flex-1 flex flex-col">
                {/* Header Widget with Percentage in Front of Card */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-rose-900 transition-colors leading-snug">
                    {card.title}
                  </h3>
                  {card.percent !== undefined && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-200/80 shrink-0">
                      {card.percent}%
                    </span>
                  )}
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
                  {card.value === '—' && (
                    <span className="text-xs font-semibold text-slate-500">
                      (Belum Ada Data)
                    </span>
                  )}
                </div>

                {/* Status, Progress Bar, & Helper Target */}
                <div className="pt-3.5 border-t border-slate-100 space-y-2 text-xs">
                  {/* Status Label */}
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
                          className="h-full bg-rose-600 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, card.percent)}%` }}
                        />
                      </div>
                      <span className="text-xs font-extrabold text-rose-700 tabular-nums shrink-0">
                        {card.percent}%
                      </span>
                    </div>
                  )}

                  {/* Target as Small Helper Text */}
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

                {/* Bottom Status / Issue Container */}
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
                        <span className="text-[10px] font-bold text-slate-600 shrink-0 uppercase tracking-tight">
                          {issueData.totalCount > 1 ? `+${issueData.totalCount - 1}` : 'Detail'}
                        </span>
                      </div>

                      {/* Floating Micro-Popover on Hover */}
                      <div className="pointer-events-none opacity-0 group-hover/popover:opacity-100 transition-all duration-200 absolute bottom-full left-0 right-0 mb-2 z-30">
                        <div className="bg-slate-900 text-white rounded-2xl p-3 shadow-xl border border-slate-800 text-xs space-y-1.5">
                          <div className="font-bold text-[11px] text-amber-400 uppercase tracking-wider">
                            Kendala & Isu Utama
                          </div>
                          <p className="font-medium text-slate-200 leading-snug">
                            {issueData.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="px-3 py-2 rounded-xl bg-slate-50/50 border border-slate-200/40 text-center">
                      <span className="text-[11px] font-medium text-slate-400">
                        Tidak ada kendala krusial
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Action: Detail Indikator CTA */}
              <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500 group-hover:text-rose-600 transition-colors">
                <span>Detail Indikator</span>
                <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
};
