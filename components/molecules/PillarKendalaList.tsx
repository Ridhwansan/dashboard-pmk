'use client';

import React, { useState, useMemo } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Search,
  CheckCircle2,
} from 'lucide-react';
import {
  PillarKendalaItem,
  getKendalaListByPillar,
} from '@/data/programDetailData';

interface PillarKendalaListProps {
  pillarId: 'pendidikan' | 'kesehatan' | 'bencana' | 'kemiskinan';
  pillarTitle: string;
  onSelectProgram: (programId: string, kendalaId?: string | number) => void;
  availablePrograms?: Array<{ id: string; title: string }>;
  themeColor?: 'blue' | 'emerald' | 'amber' | 'rose';
}

export const PillarKendalaList: React.FC<PillarKendalaListProps> = ({
  pillarId,
  pillarTitle,
  onSelectProgram,
}) => {
  const [selectedFilterProgramId, setSelectedFilterProgramId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

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

  // Toggle FAQ card open/close
  const toggleExpand = (key: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-150">
      {/* 1. FILTER & SEARCH TOOLBAR (Clean Dropdown & Search, No cluttered pill wrap) */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Dropdown Filter for Indikator */}
          <div className="flex items-center gap-2.5 flex-1 max-w-md">
            <label htmlFor="filter-indikator" className="text-xs font-semibold text-slate-500 shrink-0">
              Indikator:
            </label>
            <div className="relative w-full">
              <select
                id="filter-indikator"
                value={selectedFilterProgramId}
                onChange={(e) => setSelectedFilterProgramId(e.target.value)}
                className="w-full h-9 px-3 text-xs font-medium rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer shadow-2xs"
              >
                <option value="all">Semua Indikator ({allKendalaItems.length} Kendala)</option>
                {programOptionsWithKendala.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.title} ({opt.count})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative min-w-[200px] sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kendala..."
              className="w-full h-9 pl-9 pr-3 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-900 placeholder:text-slate-400 shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* 2. LIST OF KENDALA (FAQ Accordion Style, Expandable on Click) */}
      {filteredKendalaItems.length === 0 ? (
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
          {filteredKendalaItems.map((item, idx) => {
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
                  className="w-full p-4 sm:p-5 flex items-start justify-between gap-4 text-left cursor-pointer hover:bg-slate-50/70 transition-colors"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    {/* Non-chip indicator context & update date */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                      <span className="font-semibold text-slate-500">
                        {item.programTitle}
                      </span>
                      {updateDate && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span className="font-medium text-slate-400">
                            Diperbarui: {updateDate}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Issue Title */}
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                      {item.title}
                    </h4>
                  </div>

                  {/* Accordion Chevron Indicator */}
                  <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-500 shrink-0 mt-0.5 transition-transform duration-200">
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180 text-blue-600' : ''
                      }`}
                    />
                  </div>
                </button>

                {/* Accordion Body: Revealed when expanded */}
                {isExpanded && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-slate-100 space-y-4 animate-in fade-in duration-200">
                    {/* 2 Clean Columns with Neutral / Subtle Accent */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
                      {/* Left: Kendala Pelaksanaan */}
                      <div className="border-l-2 border-amber-400 pl-3.5 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                            Kendala Pelaksanaan
                          </span>
                          {item.tanggalKendala && (
                            <span className="text-[11px] text-slate-400 font-medium">
                              {item.tanggalKendala}
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-[13px] text-slate-700 font-medium leading-relaxed whitespace-pre-line">
                          {item.kendala}
                        </p>
                      </div>

                      {/* Right: Tindak Lanjut & Solusi */}
                      <div className="border-l-2 border-blue-500 pl-3.5 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                            Tindak Lanjut &amp; Solusi
                          </span>
                          {item.tanggalTindakLanjut && (
                            <span className="text-[11px] text-slate-400 font-medium">
                              {item.tanggalTindakLanjut}
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-[13px] text-slate-700 font-medium leading-relaxed whitespace-pre-line">
                          {item.tindakLanjut}
                        </p>
                      </div>
                    </div>

                    {/* Action Bar: Direct navigation to Indicator Detail Kendala section */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => onSelectProgram(item.programId, item.id)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 border border-blue-200/80 transition-all cursor-pointer"
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
