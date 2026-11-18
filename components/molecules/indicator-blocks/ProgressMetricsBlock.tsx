'use client';

import React from 'react';
import { ProgressMetricsBlockData, ProgressMetricItem } from '@/types/cms';
import { TrendingUp } from 'lucide-react';

interface ProgressMetricsBlockProps {
  data: ProgressMetricsBlockData;
  title?: string;
  subtitle?: string;
  className?: string;
}

export const ProgressMetricsBlock: React.FC<ProgressMetricsBlockProps> = ({
  data,
  title = 'PROGRES FISIK DAN KEUANGAN',
  subtitle = 'Rata-rata progres pekerjaan pada periode pengamatan',
  className = '',
}) => {
  const items: ProgressMetricItem[] = data.items || [];
  if (items.length === 0) return null;

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-3.5 flex flex-col justify-between overflow-hidden ${className}`}>
      <div className="space-y-0.5 pb-2.5 border-b border-slate-100 min-w-0">
        <h4 className="text-xs sm:text-[13px] font-extrabold text-slate-900 tracking-tight uppercase truncate">
          {title}
        </h4>
        {subtitle && <p className="text-[11px] text-slate-500 font-medium truncate">{subtitle}</p>}
      </div>

      <div className="space-y-3.5 flex-1">
        {items.map((item) => {
          return (
            <div key={item.id} className="space-y-1.5">
              <span className="text-xs font-bold text-slate-800 block truncate" title={item.label}>
                {item.label}
              </span>

              {/* 2025 bar */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 w-8 shrink-0">2025</span>
                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-blue-400 rounded-full transition-all duration-500 shadow-2xs"
                    style={{ width: `${Math.min(100, Math.max(8, item.val2025))}%` }}
                  />
                </div>
                <span className="text-[11px] font-bold text-slate-600 w-11 text-right tabular-nums shrink-0">
                  {item.val2025}{item.unit || '%'}
                </span>
              </div>

              {/* 2026 bar */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-blue-700 w-8 shrink-0">2026</span>
                <div className="flex-1 h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-blue-700 rounded-full transition-all duration-500 shadow-2xs"
                    style={{ width: `${Math.min(100, Math.max(8, item.val2026))}%` }}
                  />
                </div>
                <span className="text-[11px] font-black text-slate-900 w-11 text-right tabular-nums shrink-0">
                  {item.val2026}{item.unit || '%'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delta text footer: clean high contrast text, no puffy pastel chip */}
      {items[0] && (
        <div className="mt-auto pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs overflow-hidden">
          <span className="text-[11px] text-slate-500 font-medium truncate">Kenaikan progres fisik</span>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-800 tabular-nums shrink-0">
            <TrendingUp className="w-3.5 h-3.5 text-blue-700" />
            <span>{items[0].deltaLabel || `+${(items[0].val2026 - items[0].val2025).toLocaleString('id-ID')} pp`}</span>
          </span>
        </div>
      )}
    </div>
  );
};
