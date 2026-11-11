'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, X } from 'lucide-react';
import { ProgramDetailPageView } from './ProgramDetailPageView';
import { ProgramDetailData, KendalaDetailItem, MonthlyDataPoint, DataUpdateLogItem, getProgramDetailData } from '@/data/programDetailData';
import { useCmsCards } from '@/lib/useCmsCards';

interface KemiskinanDetailViewProps {
  onBackToHome: () => void;
  category?: string;
  onCategoryChange?: (category: string) => void;
  onDetailOpenChange?: (isOpen: boolean) => void;
}

export const KemiskinanDetailView: React.FC<KemiskinanDetailViewProps> = ({
  category = 'PKPN',
  onCategoryChange,
  onDetailOpenChange,
}) => {
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [activeKendalaId, setActiveKendalaId] = useState<string | number | undefined>(undefined);
  const [pinnedCardId, setPinnedCardId] = useState<string | null>(null);

  useEffect(() => {
    if (!pinnedCardId) return;

    const handleClickOutside = () => {
      setPinnedCardId(null);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPinnedCardId(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [pinnedCardId]);

  const handleSelectProgram = (programId: string) => {
    setSelectedProgramId(programId);
    onDetailOpenChange?.(true);
  };

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
      <div className="relative overflow-hidden rounded-2xl min-h-[140px] sm:min-h-[160px] border border-slate-200/90 shadow-2xs flex flex-col justify-center p-6 sm:p-8 group bg-slate-900">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
          style={{ backgroundImage: `url('/images/banners/header-kemiskinan.jpg')` }}
        />
        {/* Clean Directional Gradient Overlay for Authentic Photography & Text Contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/75 to-slate-950/35" />

        {/* Content */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
          <div className="space-y-1.5 max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
              {category === 'Semua' || category === 'all'
                ? 'Seluruh Indikator Penurunan Kemiskinan'
                : category === 'Isu Strategis'
                ? 'Isu Strategis Penurunan Kemiskinan'
                : category === 'RPJMN'
                ? 'Sasaran RPJMN Penurunan Kemiskinan'
                : 'PKPN Penurunan Kemiskinan'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 font-normal">
              {category === 'Semua' || category === 'all'
                ? 'Pemantauan Komprehensif Seluruh Program Kerja & Isu Strategis Penurunan Kemiskinan'
                : category === 'Isu Strategis'
                ? 'Pemantauan 6 Agenda Isu Strategis Prioritas Penurunan Kemiskinan Nasional'
                : category === 'RPJMN'
                ? 'Target Sasaran Rencana Pembangunan Jangka Menengah Nasional 2025–2029'
                : 'Target dan Capaian Kinerja Program'}
            </p>
          </div>

          {/* Standout Segmented Control Sub-Filter inside Header Banner */}
          {onCategoryChange && (
            <div className="inline-flex items-center p-1.5 rounded-2xl bg-white/95 backdrop-blur-md border border-white shadow-lg ring-1 ring-slate-900/10 shrink-0 self-start sm:self-auto overflow-x-auto max-w-full">
              <button
                type="button"
                onClick={() => onCategoryChange('Semua')}
                className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 cursor-pointer whitespace-nowrap ${
                  category === 'Semua' || category === 'all'
                    ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-900'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/80 font-semibold'
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => onCategoryChange('PKPN')}
                className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 cursor-pointer whitespace-nowrap ${
                  category === 'PKPN'
                    ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-900'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/80 font-semibold'
                }`}
              >
                PKPN
              </button>
              <button
                type="button"
                onClick={() => onCategoryChange('Isu Strategis')}
                className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 cursor-pointer whitespace-nowrap ${
                  category === 'Isu Strategis'
                    ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-900'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/80 font-semibold'
                }`}
              >
                Isu Strategis
              </button>
              <button
                type="button"
                onClick={() => onCategoryChange('RPJMN')}
                className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 cursor-pointer whitespace-nowrap ${
                  category === 'RPJMN'
                    ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-900'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/80 font-semibold'
                }`}
              >
                RPJMN
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Grid of Widget Cards */}
      {loading && displayedCards.length === 0 ? (
        <div
          role="status"
          aria-live="polite"
          aria-label="Memuat indikator penurunan kemiskinan"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-1"
        >
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 h-64 flex flex-col justify-between animate-pulse"
            >
              <div className="space-y-3">
                <div className="h-5 bg-slate-200 rounded-md w-3/4"></div>
                <div className="h-9 bg-slate-100 rounded-md w-2/5"></div>
              </div>
              <div className="pt-3 border-t border-slate-100 space-y-2.5">
                <div className="h-2 bg-slate-100 rounded-full w-full"></div>
                <div className="h-3.5 bg-slate-100 rounded-md w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : displayedCards.length === 0 ? (
        <div className="py-16 px-6 bg-white rounded-3xl border border-slate-200/90 shadow-2xs text-center space-y-4 max-w-2xl mx-auto my-4 animate-in fade-in duration-200">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-700 flex items-center justify-center mx-auto shadow-2xs text-xl font-black">
            !
          </div>

          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Informasi Belum Tersedia
            </span>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              {category === 'RPJMN'
                ? 'Indikator RPJMN Sedang Disinkronisasi'
                : category === 'Isu Strategis'
                ? 'Isu Strategis Belum Terdaftar'
                : 'Data Indikator Belum Tersedia'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-lg mx-auto">
              {category === 'RPJMN'
                ? 'Data sasaran RPJMN 2025–2029 untuk Pilar Penurunan Kemiskinan sedang dalam proses harmonisasi dan verifikasi bersama Bappenas dan instansi pengampu.'
                : category === 'Isu Strategis'
                ? 'Agenda isu strategis prioritas untuk Pilar Penurunan Kemiskinan belum ditambahkan atau sedang dalam tahap penyusunan.'
                : 'Belum ada indikator aktif yang terdaftar untuk kategori ini pada sistem pemantauan.'}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onCategoryChange && onCategoryChange('PKPN')}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
            >
              Lihat Capaian Program PKPN
            </button>
            <button
              type="button"
              onClick={() => onCategoryChange && onCategoryChange('Semua')}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
            >
              Lihat Semua Indikator
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-1">
          {displayedCards.map((card) => {
            const kendalaList = (card.kendalaList && (card.kendalaList as any[]).length > 0)
              ? (card.kendalaList as Array<{ title?: string; kendala?: string; tindakLanjut?: string }>)
              : (() => {
                  const detail = getProgramDetailData(card.id, card.title, 'kemiskinan');
                  return (detail.kendalaList && detail.kendalaList.length > 0)
                    ? detail.kendalaList
                    : detail.kendala
                      ? [{
                          title: detail.title ? `Isu Pelaksanaan: ${detail.title}` : 'Kendala Pelaksanaan',
                          kendala: detail.kendala,
                          tindakLanjut: detail.tindakLanjut || 'Koordinasi lintas instansi pengampu untuk percepatan realisasi target.',
                        }]
                      : [];
                })();

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

            const isPinned = pinnedCardId === card.id;

            return (
              <div
                key={card.id}
                onClick={() => {
                  if (pinnedCardId) {
                    setPinnedCardId(null);
                    return;
                  }
                  handleSelectProgram(card.id);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (pinnedCardId) {
                      setPinnedCardId(null);
                      return;
                    }
                    handleSelectProgram(card.id);
                  }
                }}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-rose-400 p-5 sm:p-6 flex flex-col justify-between h-full group transition-all duration-200 cursor-pointer select-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-hidden"
              >
                <div className="flex-1 flex flex-col">
                  {/* Header: Title and Top-right Indicator */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-sm sm:text-base font-semibold text-slate-900 group-hover:text-rose-900 transition-colors leading-snug">
                      {card.title}
                    </h3>
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-rose-600 group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
                  </div>

                  {/* Big Number & Unit */}
                  <div className="flex items-baseline gap-x-2 my-2 min-h-[40px]">
                    <span className="text-3xl sm:text-4xl font-bold text-slate-900 tabular-nums tracking-tight">
                      {card.value}
                    </span>
                    {card.unit && (
                      <span className="text-xs sm:text-sm font-medium text-slate-600">
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
                            className="h-full bg-rose-600 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(100, card.percent)}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-slate-700 tabular-nums shrink-0">
                          {card.percent}%
                        </span>
                      </div>
                    )}

                    {/* Target */}
                    {card.target && (
                      <p className="text-xs text-slate-600 font-normal leading-relaxed">
                        {card.target}
                      </p>
                    )}

                    {/* Status Label */}
                    {card.status && (
                      <p className="text-[11px] text-slate-500 font-normal">
                        {card.status}
                      </p>
                    )}

                    {/* Integrated Issue Status Chip with Hover & Click-to-Pin Pop-up */}
                    {issueData.hasIssue && (
                      <div className="pt-2 relative group/issue">
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            setPinnedCardId((prev) => (prev === card.id ? null : card.id));
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              e.stopPropagation();
                              setPinnedCardId((prev) => (prev === card.id ? null : card.id));
                            }
                          }}
                          title="Klik untuk menyematkan rincian kendala atau arahkan kursor"
                          className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg border text-xs transition-all cursor-pointer ${
                            isPinned
                              ? 'bg-slate-100 border-slate-300 ring-2 ring-rose-500/20 text-slate-900 shadow-2xs'
                              : 'bg-slate-50/90 hover:bg-slate-100/90 border-slate-200/90 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 ring-2 ring-amber-200" />
                            <span className="truncate font-medium text-slate-700">{issueData.description}</span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {issueData.totalCount > 1 && (
                              <span className="text-[10px] font-semibold bg-slate-200/80 text-slate-700 px-1.5 py-0.5 rounded-md">
                                {issueData.totalCount} isu
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Hover & Pinned Pop-up: Zero dead-zone bridge via pb-2 with comfortable human typography */}
                        <div
                          className={`transition-all duration-150 absolute bottom-full left-0 right-0 pb-2 z-50 ${
                            isPinned
                              ? 'opacity-100 pointer-events-auto'
                              : 'pointer-events-none opacity-0 group-hover/issue:pointer-events-auto group-hover/issue:opacity-100'
                          }`}
                        >
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl p-5 sm:p-6 shadow-2xl border border-slate-200 ring-1 ring-slate-900/10 space-y-4 max-h-84 sm:max-h-96 overflow-y-auto overscroll-contain custom-scrollbar cursor-default"
                          >
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                              <div className="flex items-center gap-2 font-bold text-slate-900 text-xs sm:text-sm tracking-tight">
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-amber-100" />
                                <span>KENDALA & CATATAN PELAKSANAAN</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200 px-2.5 py-1 rounded-full">
                                  {kendalaList.length} Isu Terdata
                                </span>
                                {isPinned && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setPinnedCardId(null);
                                    }}
                                    aria-label="Tutup pop up rincian kendala"
                                    className="text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg p-1.5 transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="space-y-4 divide-y divide-slate-100">
                              {kendalaList.map((item, idx) => (
                                <div key={idx} className={idx > 0 ? 'pt-3.5 space-y-2' : 'space-y-2'}>
                                  <p className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                                    {idx + 1}. {item.title || `Isu #${idx + 1}`}
                                  </p>
                                  <p className="text-slate-700 font-normal text-xs sm:text-sm leading-relaxed">
                                    {item.kendala || item.title}
                                  </p>
                                  {item.tindakLanjut && (
                                    <div className="mt-1.5 p-3 rounded-xl bg-rose-50/70 border border-rose-200/80 text-xs sm:text-sm text-slate-800 leading-relaxed">
                                      <span className="font-bold text-rose-900">Tindak Lanjut: </span>
                                      {item.tindakLanjut}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
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
