'use client';

import React, { useState } from 'react';
import { WilayahData, getWilayahCapaianRpjmn } from '@/data/wilayahData';
import {
  MAP_PILLARS,
  getIndicatorsByPillar,
  MapIndicatorDef,
  MapPillarId,
} from '@/data/mapIndicators';
import {
  GraduationCap,
  HeartPulse,
  ShieldAlert,
  TrendingDown,
  RotateCcw,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface WilayahSidePanelProps {
  wilayah: WilayahData;
  selectedYear?: number;
  onResetNasional?: () => void;
  className?: string;
}

interface PillarTheme {
  icon: React.ComponentType<{ className?: string }>;
  headerBg: string;
  headerBorder: string;
  headerText: string;
  iconBg: string;
  iconText: string;
  capaianText: string;
}

const PILLAR_THEMES: Record<MapPillarId, PillarTheme> = {
  all: {
    icon: GraduationCap,
    headerBg: 'bg-slate-50',
    headerBorder: 'border-slate-200',
    headerText: 'text-slate-900',
    iconBg: 'bg-slate-100',
    iconText: 'text-slate-600',
    capaianText: 'text-slate-800',
  },
  pendidikan: {
    icon: GraduationCap,
    headerBg: 'bg-blue-50/70',
    headerBorder: 'border-blue-200/80',
    headerText: 'text-blue-950',
    iconBg: 'bg-blue-600',
    iconText: 'text-white',
    capaianText: 'text-blue-700',
  },
  kesehatan: {
    icon: HeartPulse,
    headerBg: 'bg-emerald-50/70',
    headerBorder: 'border-emerald-200/80',
    headerText: 'text-emerald-950',
    iconBg: 'bg-emerald-600',
    iconText: 'text-white',
    capaianText: 'text-emerald-700',
  },
  bencana: {
    icon: ShieldAlert,
    headerBg: 'bg-amber-50/70',
    headerBorder: 'border-amber-200/80',
    headerText: 'text-amber-950',
    iconBg: 'bg-amber-600',
    iconText: 'text-white',
    capaianText: 'text-amber-800',
  },
  kemiskinan: {
    icon: TrendingDown,
    headerBg: 'bg-rose-50/70',
    headerBorder: 'border-rose-200/80',
    headerText: 'text-rose-950',
    iconBg: 'bg-rose-600',
    iconText: 'text-white',
    capaianText: 'text-rose-700',
  },
};

/**
 * Utility to strip repetitive / redundant phrases from indicator display strings
 */
function cleanCapaianDisplay(raw: string): string {
  if (!raw) return '—';
  return raw
    .replace(/\s*\(Capaian Nasional\)/gi, '')
    .trim();
}

export const WilayahSidePanel: React.FC<WilayahSidePanelProps> = ({
  wilayah,
  onResetNasional,
  className = '',
}) => {
  // Drawer state: 'pendidikan' is open by default as requested
  const [openPillarId, setOpenPillarId] = useState<string | null>('pendidikan');

  const isNasional = wilayah.level === 'nasional';
  const capaianRpjmn = getWilayahCapaianRpjmn(wilayah);

  const toggleDrawer = (pillarId: string) => {
    setOpenPillarId((prev) => (prev === pillarId ? null : pillarId));
  };

  return (
    <aside
      aria-label={`Profil Wilayah ${wilayah.name}`}
      className={`h-full flex flex-col bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden ${className}`}
    >
      {/* ======================================================== */}
      {/* 1. CLEAN FIXED HEADER (NO REDUNDANT CHIPS)               */}
      {/* ======================================================== */}
      <div className="p-4 border-b border-slate-200/80 bg-slate-50/40 shrink-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h2
              className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-snug truncate"
              title={wilayah.name}
            >
              {wilayah.name}
            </h2>

            {/* Crisp, clean subtitle: RPJMN only */}
            <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-slate-500 flex-wrap">
              <span>
                IMM: <strong className="text-slate-800">{capaianRpjmn}</strong>
              </span>
              {wilayah.isPrioritas && (
                <>
                  <span className="text-slate-300">·</span>
                  <span className="text-rose-600 font-bold">Prioritas 3T</span>
                </>
              )}
            </div>
          </div>

          {!isNasional && onResetNasional && (
            <button
              type="button"
              onClick={onResetNasional}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200/90 shadow-2xs transition-colors cursor-pointer shrink-0"
              title="Kembali ke Seluruh Indonesia"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. DRAWER ACCORDION BODY: 4 Pillars                      */}
      {/* ======================================================== */}
      <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-2.5 [scrollbar-width:thin]">
        {MAP_PILLARS.map((pillar) => {
          const isOpen = openPillarId === pillar.id;
          const theme = PILLAR_THEMES[pillar.id] || PILLAR_THEMES.pendidikan;
          const Icon = theme.icon;
          const indicators: MapIndicatorDef[] = getIndicatorsByPillar(pillar.id);

          return (
            <div
              key={pillar.id}
              className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? 'border-slate-300 bg-white shadow-2xs'
                  : 'border-slate-200/80 bg-white hover:border-slate-300'
              }`}
            >
              {/* Drawer Header (Click to Open / Close) */}
              <button
                type="button"
                onClick={() => toggleDrawer(pillar.id)}
                aria-expanded={isOpen}
                className={`w-full px-3.5 py-3 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer ${
                  isOpen ? theme.headerBg : 'hover:bg-slate-50/80'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${theme.iconBg} ${theme.iconText} shadow-2xs`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span
                    className={`text-xs sm:text-sm font-extrabold truncate ${
                      isOpen ? theme.headerText : 'text-slate-800'
                    }`}
                  >
                    {pillar.shortName}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isOpen ? (
                    <ChevronDown className="w-4 h-4 text-slate-500 transition-transform duration-150" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400 transition-transform duration-150" />
                  )}
                </div>
              </button>

              {/* Drawer Content (Opens Full when active) */}
              {isOpen && (
                <div className="p-2.5 space-y-2 bg-slate-50/40 border-t border-slate-200/70 animate-in fade-in duration-150">
                  {indicators.map((ind) => {
                    const val = ind.getValue(wilayah);
                    const cleanDisplay = cleanCapaianDisplay(val.display);

                    return (
                      <div
                        key={ind.id}
                        className="bg-white rounded-lg p-2.5 border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-colors"
                      >
                        {/* Indicator Title */}
                        <div className="text-xs font-bold text-slate-800 leading-snug mb-2">
                          {ind.name}
                        </div>

                        {/* Dynamic Target vs Capaian: Stacks cleanly if either string is long or contains multiple clauses, preventing text collision */}
                        {(() => {
                          const isLong =
                            (ind.target2026 && ind.target2026.length > 20) ||
                            (cleanDisplay && cleanDisplay.length > 20) ||
                            (ind.target2026 && ind.target2026.includes(';')) ||
                            cleanDisplay.includes(';') ||
                            cleanDisplay.includes('launching') ||
                            cleanDisplay.includes('proses');

                          if (isLong) {
                            return (
                              <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                                {/* Target Box (Full Width) */}
                                <div className="bg-slate-50/90 rounded-lg p-2 border border-slate-200/70 flex items-start justify-between gap-2">
                                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider shrink-0 mt-0.5">
                                    Target
                                  </span>
                                  <span
                                    className="text-xs font-semibold text-slate-800 text-right leading-relaxed break-words flex-1"
                                    title={ind.target2026}
                                  >
                                    {ind.target2026}
                                  </span>
                                </div>

                                {/* Capaian Box (Full Width with Theme Tint) */}
                                <div
                                  className={`rounded-lg p-2 border flex items-start justify-between gap-2 ${theme.headerBg} ${theme.headerBorder}`}
                                >
                                  <span
                                    className={`text-[10px] uppercase font-bold tracking-wider shrink-0 mt-0.5 ${theme.capaianText}`}
                                  >
                                    Capaian
                                  </span>
                                  <span
                                    className={`text-xs font-extrabold text-right leading-relaxed break-words flex-1 ${theme.capaianText}`}
                                    title={cleanDisplay}
                                  >
                                    {cleanDisplay}
                                  </span>
                                </div>
                              </div>
                            );
                          }

                          return (
                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                              {/* Target Box */}
                              <div className="bg-slate-50/90 rounded-lg p-2 border border-slate-200/70 flex flex-col justify-between">
                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">
                                  Target
                                </span>
                                <span
                                  className="text-xs font-bold text-slate-700 leading-snug tabular-nums break-words"
                                  title={ind.target2026}
                                >
                                  {ind.target2026}
                                </span>
                              </div>

                              {/* Capaian Box */}
                              <div
                                className={`rounded-lg p-2 border flex flex-col justify-between ${theme.headerBg} ${theme.headerBorder}`}
                              >
                                <span
                                  className={`text-[10px] uppercase font-bold tracking-wider mb-0.5 ${theme.capaianText}`}
                                >
                                  Capaian
                                </span>
                                <span
                                  className={`text-xs font-extrabold leading-snug tabular-nums break-words ${theme.capaianText}`}
                                  title={cleanDisplay}
                                >
                                  {cleanDisplay}
                                </span>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Subtext Context Note (if present) */}
                        {val.subtext && (
                          <div className="mt-2 pt-1.5 border-t border-slate-100/90 text-[11px] font-medium text-slate-500 leading-relaxed">
                            {val.subtext}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* 3. MINIMAL CLEAN FOOTNOTE                                 */}
      {/* ======================================================== */}
      <div className="px-3.5 py-2 border-t border-slate-100 bg-slate-50/60 text-[10.5px] font-medium text-slate-400 text-center shrink-0">
        Posisi s.d. Oktober 2026 · Kemenko PMK
      </div>
    </aside>
  );
};
