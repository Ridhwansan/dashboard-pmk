'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Search,
  CheckCircle2,
  Check,
  Calendar,
} from 'lucide-react';
import {
  PillarKendalaItem,
  getKendalaListByPillar,
} from '@/data/programDetailData';
import { ExecutivePdfButton } from '@/components/molecules/ExecutivePdfButton';

interface PillarKendalaListProps {
  pillarId: 'pendidikan' | 'kesehatan' | 'bencana' | 'kemiskinan';
  pillarTitle: string;
  onSelectProgram: (programId: string, kendalaId?: string | number) => void;
  availablePrograms?: Array<{ id: string; title: string }>;
  themeColor?: 'blue' | 'emerald' | 'amber' | 'rose';
}

const MONTH_MAP: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, mei: 4, jun: 5,
  jul: 6, agu: 7, ags: 7, sep: 8, okt: 9, nov: 10, des: 11,
};

function parseIndoDate(dateStr?: string): number {
  if (!dateStr) return 0;
  const parts = dateStr.trim().split(/\s+/);
  if (parts.length >= 3) {
    const day = parseInt(parts[0], 10) || 1;
    const monthKey = parts[1].toLowerCase().slice(0, 3);
    const month = MONTH_MAP[monthKey] ?? 0;
    const year = parseInt(parts[2], 10) || 2026;
    return new Date(year, month, day).getTime();
  }
  const parsed = Date.parse(dateStr);
  return isNaN(parsed) ? 0 : parsed;
}

export const PillarKendalaList: React.FC<PillarKendalaListProps> = ({
  pillarId,
  pillarTitle,
  onSelectProgram,
}) => {
  const [selectedFilterProgramId, setSelectedFilterProgramId] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'terbaru' | 'terlama'>('terbaru');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const [openIndikator, setOpenIndikator] = useState(false);
  const [openSort, setOpenSort] = useState(false);
  const indikatorRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (indikatorRef.current && !indikatorRef.current.contains(event.target as Node)) {
        setOpenIndikator(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setOpenSort(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch all kendala items for this pillar
  const allKendalaItems: PillarKendalaItem[] = useMemo(() => {
    return getKendalaListByPillar(pillarId);
  }, [pillarId]);

  // Distinct list of programs that have at least one kendala
  const programOptionsWithKendala = useMemo(() => {
    const map = new Map<string, { id: string; title: string; count: number }>();
    for (const item of allKendalaItems) {
      if (!map.has(item.programId)) {
        map.set(item.programId, {
          id: item.programId,
          title: item.programTitle,
          count: 0,
        });
      }
      map.get(item.programId)!.count += 1;
    }
    return Array.from(map.values());
  }, [allKendalaItems]);

  const selectedProgramTitle = useMemo(() => {
    if (selectedFilterProgramId === 'all') {
      return `Semua Indikator (${allKendalaItems.length} Kendala)`;
    }
    const found = programOptionsWithKendala.find((p) => p.id === selectedFilterProgramId);
    return found ? `${found.title} (${found.count})` : 'Pilih Indikator';
  }, [selectedFilterProgramId, allKendalaItems.length, programOptionsWithKendala]);

  // Filtered kendala list based on selected dropdown filter and search query
  const filteredKendalaItems = useMemo(() => {
    return allKendalaItems.filter((item) => {
      // 1. Program Filter
      if (selectedFilterProgramId !== 'all' && item.programId !== selectedFilterProgramId) {
        return false;
      }
      // 2. Search query filter
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchKendala = item.kendala.toLowerCase().includes(q);
        const matchTindak = item.tindakLanjut.toLowerCase().includes(q);
        const matchProgram = item.programTitle.toLowerCase().includes(q);
        return matchTitle || matchKendala || matchTindak || matchProgram;
      }
      return true;
    });
  }, [allKendalaItems, selectedFilterProgramId, searchQuery]);

  // Sorted kendala items by date (Terbaru vs Terlama)
  const sortedKendalaItems = useMemo(() => {
    return [...filteredKendalaItems].sort((a, b) => {
      const dateA = parseIndoDate(a.tanggalTindakLanjut || a.tanggalKendala);
      const dateB = parseIndoDate(b.tanggalTindakLanjut || b.tanggalKendala);
      if (sortBy === 'terbaru') {
        return dateB - dateA;
      } else {
        return dateA - dateB;
      }
    });
  }, [filteredKendalaItems, sortBy]);

  // Toggle FAQ card open/close
  const toggleExpand = (key: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-150">
      {/* 1. FILTER & SEARCH TOOLBAR - Unified clean button controls */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Left Controls: Custom Dropdown Buttons */}
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* Filter Indikator Custom Button */}
            <div className="relative" ref={indikatorRef}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 shrink-0">Indikator:</span>
                <button
                  type="button"
                  onClick={() => {
                    setOpenIndikator((prev) => !prev);
                    setOpenSort(false);
                  }}
                  aria-expanded={openIndikator}
                  className={`h-9 px-3.5 inline-flex items-center justify-between gap-2.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-2xs max-w-xs sm:max-w-sm select-none ${
                    openIndikator ? 'ring-2 ring-blue-500/20 border-blue-400 text-blue-900' : ''
                  }`}
                >
                  <span className="truncate">{selectedProgramTitle}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-150 ${
                      openIndikator ? 'rotate-180 text-blue-600' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Indikator Popover */}
              {openIndikator && (
                <div className="absolute left-0 sm:left-[64px] top-full mt-1.5 w-72 sm:w-80 max-h-64 overflow-y-auto bg-white rounded-xl shadow-lg border border-slate-200/90 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFilterProgramId('all');
                      setOpenIndikator(false);
                    }}
                    className={`w-full px-3 py-2 text-left rounded-lg text-xs font-medium hover:bg-slate-50 flex items-center justify-between cursor-pointer ${
                      selectedFilterProgramId === 'all'
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'text-slate-800'
                    }`}
                  >
                    <span>Semua Indikator ({allKendalaItems.length} Kendala)</span>
                    {selectedFilterProgramId === 'all' && (
                      <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    )}
                  </button>

                  {programOptionsWithKendala.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setSelectedFilterProgramId(opt.id);
                        setOpenIndikator(false);
                      }}
                      className={`w-full px-3 py-2 text-left rounded-lg text-xs font-medium hover:bg-slate-50 flex items-center justify-between cursor-pointer ${
                        selectedFilterProgramId === opt.id
                          ? 'bg-blue-50 text-blue-700 font-bold'
                          : 'text-slate-800'
                      }`}
                    >
                      <span className="truncate pr-2">{opt.title} ({opt.count})</span>
                      {selectedFilterProgramId === opt.id && (
                        <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort By Custom Button */}
            <div className="relative" ref={sortRef}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 shrink-0">Urutkan:</span>
                <button
                  type="button"
                  onClick={() => {
                    setOpenSort((prev) => !prev);
                    setOpenIndikator(false);
                  }}
                  aria-expanded={openSort}
                  className={`h-9 px-3.5 inline-flex items-center justify-between gap-2.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-2xs select-none ${
                    openSort ? 'ring-2 ring-blue-500/20 border-blue-400 text-blue-900' : ''
                  }`}
                >
                  <span>{sortBy === 'terbaru' ? 'Terbaru' : 'Terlama'}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-150 ${
                      openSort ? 'rotate-180 text-blue-600' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Sort By Popover */}
              {openSort && (
                <div className="absolute left-0 sm:left-[56px] top-full mt-1.5 w-32 bg-white rounded-xl shadow-lg border border-slate-200/90 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <button
                    type="button"
                    onClick={() => {
                      setSortBy('terbaru');
                      setOpenSort(false);
                    }}
                    className={`w-full px-3 py-2 text-left rounded-lg text-xs font-medium hover:bg-slate-50 flex items-center justify-between cursor-pointer ${
                      sortBy === 'terbaru' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-800'
                    }`}
                  >
                    <span>Terbaru</span>
                    {sortBy === 'terbaru' && (
                      <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSortBy('terlama');
                      setOpenSort(false);
                    }}
                    className={`w-full px-3 py-2 text-left rounded-lg text-xs font-medium hover:bg-slate-50 flex items-center justify-between cursor-pointer ${
                      sortBy === 'terlama' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-800'
                    }`}
                  >
                    <span>Terlama</span>
                    {sortBy === 'terlama' && (
                      <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Controls: Search Input & Clean Executive PDF Download */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="relative min-w-[160px] sm:w-56">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari kendala..."
                className="w-full h-9 pl-9 pr-3 text-xs rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all font-medium text-slate-900 placeholder:text-slate-400 shadow-2xs"
              />
            </div>

            <ExecutivePdfButton currentPillar={pillarId} />
          </div>
        </div>
      </div>

      {/* 2. LIST OF KENDALA (FAQ Accordion Style, Expandable on Click) */}
      {sortedKendalaItems.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/90 shadow-2xs space-y-2">
          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 className="w-5 h-5 text-slate-400" />
          </div>
          <h4 className="text-sm sm:text-base font-bold text-slate-900">
            Tidak Ada Kendala Yang Sesuai Filter
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
            Tidak ditemukan kendala untuk indikator atau pencarian yang dipilih.
          </p>
          {(selectedFilterProgramId !== 'all' || searchQuery.trim() !== '') && (
            <button
              type="button"
              onClick={() => {
                setSelectedFilterProgramId('all');
                setSearchQuery('');
              }}
              className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-800 underline cursor-pointer"
            >
              Tampilkan semua kendala
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {sortedKendalaItems.map((item, idx) => {
            const cardKey = `${item.programId}-${item.id || idx}`;
            const isExpanded = !!expandedIds[cardKey];
            const updateDate = item.tanggalTindakLanjut || item.tanggalKendala;

            return (
              <div
                key={cardKey}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all duration-150 overflow-hidden"
              >
                {/* Accordion Header: Clickable to expand/collapse */}
                <button
                  type="button"
                  onClick={() => toggleExpand(cardKey)}
                  aria-expanded={isExpanded}
                  className="w-full p-4 sm:p-5 text-left cursor-pointer hover:bg-slate-50/70 transition-colors"
                >
                  {/* Top Row: Indicator Chip (Left) & Date + Chevron (Right - Locked Position) */}
                  <div className="flex items-center justify-between gap-3 mb-2.5">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/90 tracking-tight shrink-0">
                      {item.programTitle}
                    </span>

                    <div className="flex items-center gap-3 shrink-0">
                      {updateDate && (
                        <div
                          className="flex items-center gap-1.5 text-xs font-medium text-slate-500 tabular-nums"
                          title={`Diperbarui: ${updateDate}`}
                        >
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{updateDate}</span>
                        </div>
                      )}
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-500 transition-transform duration-200">
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${
                            isExpanded ? 'rotate-180 text-blue-600' : ''
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Issue Title: Full width beneath the chip & date, clear focus & elevated typography */}
                  <h4 className="text-base sm:text-lg md:text-[19px] font-bold text-slate-900 leading-snug tracking-tight">
                    {item.title}
                  </h4>
                </button>

                {/* Accordion Body: Revealed when expanded with generous, breathable vertical spacing */}
                {isExpanded && (
                  <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-6 border-t border-slate-200/80 space-y-6 animate-in fade-in duration-200">
                    {/* 2 Clean Columns with Generous Separation and Breathing Room */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                      {/* Left: Kendala Pelaksanaan */}
                      <div className="border-l-2 border-amber-500 pl-4 sm:pl-5 py-1.5 space-y-2.5">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs sm:text-[13px] font-extrabold text-amber-950 uppercase tracking-wider block">
                            Kendala Pelaksanaan
                          </span>
                          {item.tanggalKendala && (
                            <span className="text-xs text-slate-500 font-medium tabular-nums">
                              {item.tanggalKendala}
                            </span>
                          )}
                        </div>
                        <p className="text-sm sm:text-[14.5px] text-slate-800 font-normal leading-relaxed whitespace-pre-line">
                          {item.kendala}
                        </p>
                      </div>

                      {/* Right: Tindak Lanjut & Solusi */}
                      <div className="border-l-2 border-blue-600 pl-4 sm:pl-5 py-1.5 space-y-2.5">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs sm:text-[13px] font-extrabold text-blue-950 uppercase tracking-wider block">
                            Tindak Lanjut &amp; Solusi
                          </span>
                          {item.tanggalTindakLanjut && (
                            <span className="text-xs text-slate-500 font-medium tabular-nums">
                              {item.tanggalTindakLanjut}
                            </span>
                          )}
                        </div>
                        <p className="text-sm sm:text-[14.5px] text-slate-800 font-normal leading-relaxed whitespace-pre-line">
                          {item.tindakLanjut}
                        </p>
                      </div>
                    </div>

                    {/* Action Bar: Direct navigation to Indicator Detail Kendala section */}
                    <div className="pt-4 sm:pt-5 border-t border-slate-100 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => onSelectProgram(item.programId, item.id)}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 border border-blue-200/80 transition-all cursor-pointer"
                      >
                        <span>Lihat di Detail Indikator</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
