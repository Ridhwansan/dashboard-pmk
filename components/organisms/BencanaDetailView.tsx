'use client';

import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { ProgramDetailPageView } from './ProgramDetailPageView';
import { ProgramDetailData, KendalaDetailItem, MonthlyDataPoint, DataUpdateLogItem, getProgramDetailData } from '@/data/programDetailData';
import { useCmsCards } from '@/lib/useCmsCards';

interface BencanaDetailViewProps {
  onBackToHome: () => void;
  category?: string;
  onDetailOpenChange?: (isOpen: boolean) => void;
}

export const BencanaDetailView: React.FC<BencanaDetailViewProps> = ({
  category = 'PKPN',
  onDetailOpenChange,
}) => {
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [activeKendalaId, setActiveKendalaId] = useState<string | number | undefined>(undefined);

  const handleSelectProgram = (programId: string) => {
    setSelectedProgramId(programId);
    onDetailOpenChange?.(true);
  };

  // Fetch cards dynamically from CMS / Database
  const { cards: cmsCards, loading } = useCmsCards('bencana', category);

  // If a program detail is selected, render it as its own full page
  if (selectedProgramId) {
    const selectedCard = cmsCards.find((c) => (c.slug || c.id) === selectedProgramId);
    const programDetail: ProgramDetailData = selectedCard
      ? {
          id: selectedCard.slug || selectedCard.id,
          title: selectedCard.title,
          pillarId: 'bencana',
          pillarTitle: 'Pilar Kebencanaan',
          category: selectedCard.category,
          description: selectedCard.description || 'Pengawalan penanggulangan, tanggap darurat, dan rehabilitasi pascabencana nasional.',
          picKementerian: selectedCard.picKementerian || 'BNPB',
          unit: selectedCard.unit || '',
          currentValue: selectedCard.value,
          target2026: selectedCard.target,
          status: selectedCard.status,
          subtext: selectedCard.subtext,
          kendalaList: (selectedCard.kendalaList as KendalaDetailItem[]) || [],
          monthlyData: (selectedCard.monthlyData as Record<number, MonthlyDataPoint[]>) || {},
          updateLogs: (selectedCard.updateLogs as DataUpdateLogItem[]) || [],
        }
      : getProgramDetailData(selectedProgramId, undefined, 'bencana');

    return (
      <ProgramDetailPageView
        program={programDetail}
        onBack={() => {
          setSelectedProgramId(null);
          setActiveKendalaId(undefined);
          onDetailOpenChange?.(false);
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
          style={{ backgroundImage: `url('/images/banners/header-kebencanaan.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/85 to-[#3b2312]/50 backdrop-blur-[0.5px]" />
        
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-[#7a4b27]/25 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-1.5 max-w-2xl">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight drop-shadow-xs">
            {category === 'Isu Strategis'
              ? 'Isu Strategis Kebencanaan'
              : category === 'PKPN'
              ? 'PKPN Kebencanaan'
              : 'Kebencanaan'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 font-medium drop-shadow-xs">
            {category === 'Isu Strategis'
              ? 'Pemantauan 3 Agenda Isu Strategis Prioritas Kebencanaan Nasional'
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
              onClick={() => handleSelectProgram(card.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelectProgram(card.id);
                }
              }}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-[#a8754b] p-5 sm:p-6 flex flex-col justify-between h-full group transition-all duration-200 cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-[#7a4b27]"
            >
              <div className="flex-1 flex flex-col">
                {/* Header: Title and Top-right Indicator */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#7a4b27] transition-colors leading-snug">
                    {card.title}
                  </h3>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-[#7a4b27] group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
                </div>

                {/* Big Number & Unit */}
                <div className="flex items-baseline gap-x-2 my-2 min-h-[40px]">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tabular-nums tracking-tight">
                    {card.value}
                  </span>
                  {card.unit && (
                    <span className="text-xs sm:text-sm font-semibold text-slate-600">
                      {card.unit}
                    </span>
                  )}
                </div>

                {/* Target, Progress, & Status */}
                <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                  {/* Progress Bar with Percentage */}
                  {card.percent !== undefined && (
                    <div className="flex items-center gap-2.5">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#7a4b27] rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, card.percent)}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-700 tabular-nums shrink-0">
                        {card.percent}%
                      </span>
                    </div>
                  )}

                  {/* Target */}
                  {card.target && (
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      {card.target}
                    </p>
                  )}

                  {/* Status Label */}
                  {card.status && (
                    <p className="text-[11px] text-slate-500">
                      {card.status}
                    </p>
                  )}

                  {/* Inline Issue indicator with interactive hover popover */}
                  {issueData.hasIssue && (
                    <div className="pt-2 relative group/issue">
                      <div
                        title={issueData.description}
                        className="flex items-center gap-1.5 text-xs text-amber-800 font-medium hover:text-amber-950 transition-colors cursor-help"
                      >
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 ring-2 ring-amber-200" />
                        <span className="truncate">{issueData.description}</span>
                      </div>

                      {/* Floating Tooltip Popover on Hover (White background with shadow, black text) */}
                      <div className="pointer-events-none opacity-0 group-hover/issue:opacity-100 transition-all duration-200 absolute bottom-full left-0 right-0 mb-2 z-40">
                        <div className="bg-white text-slate-900 rounded-2xl p-4 shadow-xl border border-slate-200/90 ring-1 ring-slate-900/5 text-sm space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-bold text-amber-700">
                            <span className="tracking-wide">KENDALA & CATATAN</span>
                            {issueData.totalCount > 1 && (
                              <span className="text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/80 px-2 py-0.5 rounded-full">
                                {issueData.totalCount} isu
                              </span>
                            )}
                          </div>
                          <p className="text-slate-800 font-normal leading-relaxed text-sm break-words">
                            {issueData.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
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
