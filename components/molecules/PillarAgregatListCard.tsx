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
  MapPin,
  RotateCcw,
} from 'lucide-react';

interface PillarAgregatListCardProps {
  activePillar: MapPillarId | null;
  selectedYear: PeriodYear;
  activeIndicatorId?: string | null;
  onSelectIndicator?: (mapIndicatorId: string) => void;
  onSelectPillar?: (pillarId: MapPillarId) => void;
  className?: string;
}

const PILLAR_ITEMS = [
  {
    id: 'pendidikan' as const,
    name: 'Pendidikan',
    count: '6 Indikator Utama',
    icon: GraduationCap,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50 border-blue-200/80',
    hoverBorder: 'hover:border-blue-300 hover:bg-blue-50/40',
  },
  {
    id: 'kesehatan' as const,
    name: 'Kesehatan',
    count: '6 Indikator Utama',
    icon: HeartPulse,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50 border-emerald-200/80',
    hoverBorder: 'hover:border-emerald-300 hover:bg-emerald-50/40',
  },
  {
    id: 'bencana' as const,
    name: 'Kebencanaan',
    count: '4 Indikator Utama',
    icon: ShieldAlert,
    iconColor: 'text-pillar-bencana',
    iconBg: 'bg-amber-50/70 border-amber-200/80',
    hoverBorder: 'hover:border-amber-300 hover:bg-amber-50/40',
  },
  {
    id: 'kemiskinan' as const,
    name: 'Kemiskinan',
    count: '4 Indikator Utama',
    icon: TrendingDown,
    iconColor: 'text-rose-600',
    iconBg: 'bg-rose-50 border-rose-200/80',
    hoverBorder: 'hover:border-rose-300 hover:bg-rose-50/40',
  },
];

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
        return <ShieldAlert className="h-4 w-4 text-pillar-bencana" style={{ color: '#7a4b27' }} />;
      case 'kemiskinan':
        return <TrendingDown className="h-4 w-4 text-rose-600" />;
      default:
        return <BarChart3 className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col overflow-hidden h-full min-h-[500px] lg:min-h-[580px] xl:min-h-[620px] ${className}`}
    >
      {/* 1. Header Card */}
      <div className="p-4 sm:p-4.5 border-b border-slate-200/80 bg-slate-50/60 shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center shrink-0">
              {activePillar && activePillar !== 'all' ? (
                getPillarIcon(activePillar)
              ) : (
                <BarChart3 className="h-4.5 w-4.5 text-blue-600" />
              )}
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug truncate">
              {pillarData ? pillarData.pillarName : 'Target & Capaian Nasional'}
            </h3>
          </div>

          {pillarData && onSelectPillar ? (
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onSelectPillar('all')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white bg-slate-50 border border-slate-200/90 transition-colors cursor-pointer shadow-2xs"
                title="Reset pemilihan pilar"
                aria-label="Reset pemilihan pilar"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Reset</span>
              </button>
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between text-xs pt-3 mt-3 border-t border-slate-200/70 text-slate-600">
          <span className="font-medium text-slate-500">Periode RPJMN 2025–2029</span>
          <div className="flex items-center gap-2.5 text-xs">
            <span className="inline-flex items-center gap-1.5 text-slate-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span>T: Target</span>
            </span>
            <span className="text-slate-300">·</span>
            <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>C: Capaian</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Scrollable Indicator List / Neutral Placeholder */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 overscroll-contain flex flex-col">
        {!pillarData ? (
          // Neutral State: Guide user to select a pillar
          <div className="h-full min-h-[380px] flex flex-col items-center justify-center text-center p-3 my-auto">
            <div className="w-13 h-13 rounded-2xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 mb-3 shadow-2xs">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>

            <h4 className="text-base font-bold text-slate-900 mb-1.5 tracking-tight">
              Pilih Pilar Prioritas
            </h4>

            <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-[280px] sm:max-w-xs leading-relaxed mb-5">
              Pilih Pilar Untuk Melihat Target dan Capaian Tahun {selectedYear}
            </p>

            {onSelectPillar && (
              <div className="grid grid-cols-2 gap-2.5 w-full max-w-[340px]">
                {PILLAR_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelectPillar(item.id)}
                      className={`p-3 rounded-xl border border-slate-200/90 bg-white hover:shadow-2xs text-left transition-all duration-150 cursor-pointer group flex flex-col justify-between ${item.hoverBorder} focus:outline-hidden focus:ring-2 focus:ring-blue-500/40`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <div className={`p-1.5 rounded-lg border ${item.iconBg}`}>
                          <Icon className={`h-4 w-4 ${item.iconColor}`} />
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <div>
                        <span className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-slate-950 block transition-colors leading-tight">
                          {item.name}
                        </span>
                        <span className="text-[11px] font-medium text-slate-500 group-hover:text-slate-700 block mt-0.5 transition-colors">
                          {item.count}
                        </span>
                      </div>
                    </button>
                  );
                })}
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
                    ? 'bg-blue-50/90 border-blue-400 ring-2 ring-blue-500/30 shadow-2xs'
                    : 'bg-white hover:bg-slate-50/90 border-slate-200/90 hover:border-slate-300'
                }`}
              >
                {/* Row Header: Indicator Name */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-start gap-1.5 min-w-0">
                    <span className="text-xs font-bold text-slate-600 shrink-0 mt-0.5">
                      {index + 1}.
                    </span>
                    <span
                      className={`text-xs md:text-sm leading-snug line-clamp-2 ${
                        isMapActive ? 'text-blue-950 font-bold' : 'text-slate-900 font-semibold'
                      }`}
                    >
                      {ind.name}
                    </span>
                  </div>

                  {isMapActive ? (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white shrink-0 mt-0.5">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Aktif</span>
                    </span>
                  ) : ind.mapIndicatorId ? (
                    <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-slate-600 hover:text-blue-600 shrink-0 mt-0.5 transition-colors">
                      <MapPin className="h-3 w-3" />
                      <ChevronRight className="h-3 w-3" />
                    </span>
                  ) : null}
                </div>

                {/* Target & Capaian Information */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                  {/* Target (T) */}
                  <div className="bg-slate-50/90 rounded-lg p-2 border border-slate-200/70">
                    <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider mb-0.5">
                      Target (T)
                    </span>
                    <span className="text-xs font-bold text-slate-900 tabular-nums break-words">
                      {metric.target === '—'
                        ? '—'
                        : metric.target.includes('Peluncuran') || metric.target.includes('Operasional')
                        ? metric.target
                        : `${metric.target} ${ind.unit}`}
                    </span>
                  </div>

                  {/* Capaian (C) */}
                  <div
                    className={`rounded-lg p-2 border ${
                      metric.statusType === 'success'
                        ? 'bg-emerald-50/80 border-emerald-200/90'
                        : metric.statusType === 'warning'
                        ? 'bg-amber-50/80 border-amber-200/90'
                        : metric.statusType === 'info'
                        ? 'bg-blue-50/80 border-blue-200/90'
                        : 'bg-slate-50/90 border-slate-200/70'
                    }`}
                  >
                    <span
                      className={`text-[10px] font-bold block uppercase tracking-wider mb-0.5 ${
                        metric.statusType === 'success'
                          ? 'text-emerald-800'
                          : metric.statusType === 'warning'
                          ? 'text-amber-800'
                          : metric.statusType === 'info'
                          ? 'text-blue-800'
                          : 'text-slate-500'
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
                          : 'text-slate-800'
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
    </div>
  );
};
