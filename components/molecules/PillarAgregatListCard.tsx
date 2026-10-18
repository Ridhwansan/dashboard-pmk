'use client';

import React from 'react';
import { MapPillarId } from '@/data/mapIndicators';
import {
  PILLAR_AGREGAT_DATA,
  PeriodYear,
  AgregatIndicatorRow,
} from '@/data/pillarAgregatData';
import {
  GraduationCap,
  HeartPulse,
  ShieldAlert,
  TrendingDown,
  BarChart3,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

interface PillarAgregatListCardProps {
  activePillar: MapPillarId | null;
  selectedYear: PeriodYear;
  activeIndicatorId?: string | null;
  onSelectIndicator?: (mapIndicatorId: string) => void;
  onSelectPillar?: (pillarId: MapPillarId) => void;
  className?: string;
}

export const PillarAgregatListCard: React.FC<PillarAgregatListCardProps> = ({
  activePillar,
  selectedYear,
  activeIndicatorId,
  onSelectIndicator,
  onSelectPillar,
  className = '',
}) => {
  const pillarData = activePillar && activePillar !== 'all' ? PILLAR_AGREGAT_DATA[activePillar] : null;

  const getPillarIcon = (id: MapPillarId) => {
    switch (id) {
      case 'pendidikan':
        return <GraduationCap className="h-4 w-4 text-blue-600" />;
      case 'kesehatan':
        return <HeartPulse className="h-4 w-4 text-emerald-600" />;
      case 'bencana':
        return <ShieldAlert className="h-4 w-4 text-[#7a4b27]" />;
      case 'kemiskinan':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <BarChart3 className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col overflow-hidden h-full min-h-[500px] lg:min-h-[580px] xl:min-h-[620px] ${className}`}
    >
      {/* 1. Header Card */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/70 shrink-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
              {activePillar ? getPillarIcon(activePillar) : <BarChart3 className="h-4 w-4 text-slate-400" />}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Agregat Nasional · {selectedYear}
              </span>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">
                {pillarData ? pillarData.pillarName : 'Target & Capaian Nasional'}
              </h3>
            </div>
          </div>

          {pillarData && (
            <span className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200/80 text-blue-700 text-[11px] font-bold shrink-0">
              {pillarData.indicators.length} Indikator
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-1 mt-1 border-t border-slate-200/60">
          <span>Periode RPJMN 2025–2029</span>
          <span className="text-slate-400">T = Target · C = Capaian</span>
        </div>
      </div>

      {/* 2. Scrollable Indicator List / Neutral Placeholder */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 overscroll-contain">
        {!pillarData ? (
          // Neutral State: Guide user to select a pillar
          <div className="h-full min-h-[360px] flex flex-col items-center justify-center text-center p-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-3 shadow-2xs">
              <BarChart3 className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 mb-1">
              Pilih Pilar Prioritas
            </h4>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed mb-4">
              Pilih salah satu pilar di atas untuk melihat 7 baris rincian target dan capaian agregat nasional tahun {selectedYear}.
            </p>

            {onSelectPillar && (
              <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
                <button
                  type="button"
                  onClick={() => onSelectPillar('pendidikan')}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 group-hover:text-blue-700">
                    <GraduationCap className="h-3.5 w-3.5 text-blue-600" />
                    <span>Pendidikan</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">7 Indikator Utama</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectPillar('kesehatan')}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 group-hover:text-emerald-700">
                    <HeartPulse className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Kesehatan</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">5 Indikator Utama</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectPillar('bencana')}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-[#a8754b] hover:bg-[#fcf8f4] text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 group-hover:text-[#7a4b27]">
                    <ShieldAlert className="h-3.5 w-3.5 text-[#7a4b27]" />
                    <span>Bencana</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">4 Indikator Utama</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectPillar('kemiskinan')}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-red-300 hover:bg-red-50/50 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 group-hover:text-red-700">
                    <TrendingDown className="h-3.5 w-3.5 text-red-600" />
                    <span>Kemiskinan</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">4 Indikator Utama</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          // Active List of Indicators
          pillarData.indicators.map((ind: AgregatIndicatorRow, index: number) => {
            const metric = ind.years[selectedYear] || { target: '—', capaian: '—' };
            const isMapActive = ind.mapIndicatorId && activeIndicatorId === ind.mapIndicatorId;

            return (
              <div
                key={ind.id}
                onClick={() => {
                  if (ind.mapIndicatorId && onSelectIndicator) {
                    onSelectIndicator(ind.mapIndicatorId);
                  }
                }}
                className={`p-3 rounded-xl border transition-all text-left select-none ${
                  ind.mapIndicatorId ? 'cursor-pointer' : 'cursor-default'
                } ${
                  isMapActive
                    ? 'bg-blue-50/90 border-blue-400 ring-1 ring-blue-400 shadow-2xs'
                    : 'bg-white hover:bg-slate-50/90 border-slate-200/90 hover:border-slate-300'
                }`}
              >
                {/* Row Header: Indicator Name */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-start gap-1.5 min-w-0">
                    <span className="text-[11px] font-bold text-slate-400 shrink-0 mt-0.5">
                      {index + 1}.
                    </span>
                    <span
                      className={`text-xs font-semibold leading-snug line-clamp-2 ${
                        isMapActive ? 'text-blue-950 font-bold' : 'text-slate-900'
                      }`}
                    >
                      {ind.name}
                    </span>
                  </div>

                  {isMapActive ? (
                    <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  ) : ind.mapIndicatorId ? (
                    <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0 mt-0.5" />
                  ) : null}
                </div>

                {/* Target & Capaian Information */}
                <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-slate-100 text-xs">
                  {/* Target (T) */}
                  <div className="bg-slate-50/80 rounded-lg p-1.5 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                      Target (T)
                    </span>
                    <span className="text-xs font-bold text-slate-800 tabular-nums break-words">
                      {metric.target === '—'
                        ? '—'
                        : metric.target.includes('Peluncuran') || metric.target.includes('Operasional')
                        ? metric.target
                        : `${metric.target} ${ind.unit}`}
                    </span>
                  </div>

                  {/* Capaian (C) */}
                  <div
                    className={`rounded-lg p-1.5 border ${
                      metric.statusType === 'success'
                        ? 'bg-emerald-50/70 border-emerald-200/80'
                        : metric.statusType === 'warning'
                        ? 'bg-amber-50/70 border-amber-200/80'
                        : metric.statusType === 'info'
                        ? 'bg-blue-50/70 border-blue-200/80'
                        : 'bg-slate-50/80 border-slate-100'
                    }`}
                  >
                    <span
                      className={`text-[10px] font-bold block uppercase tracking-wider ${
                        metric.statusType === 'success'
                          ? 'text-emerald-700'
                          : metric.statusType === 'warning'
                          ? 'text-amber-700'
                          : metric.statusType === 'info'
                          ? 'text-blue-700'
                          : 'text-slate-400'
                      }`}
                    >
                      Capaian (C)
                    </span>
                    <span
                      className={`text-xs font-bold tabular-nums break-words ${
                        metric.statusType === 'success'
                          ? 'text-emerald-950'
                          : metric.statusType === 'warning'
                          ? 'text-amber-950'
                          : metric.statusType === 'info'
                          ? 'text-blue-950'
                          : 'text-slate-700'
                      }`}
                    >
                      {metric.capaian === '—'
                        ? '—'
                        : metric.capaian.includes('(')
                        ? metric.capaian
                        : `${metric.capaian} ${ind.unit}`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 3. Footer Card */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/60 shrink-0 flex items-center justify-between text-[10.5px] text-slate-500">
        <span>Bappenas &amp; Kemenko PMK</span>
        <span className="font-semibold text-slate-600">RPJMN 2025–2029</span>
      </div>
    </div>
  );
};
