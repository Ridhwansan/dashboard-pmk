'use client';

import React from 'react';
import { CategoryBarsBlockData, CategoryBarItem } from '@/types/cms';

interface CategoryBarBlockProps {
  data: CategoryBarsBlockData;
  title?: string;
  subtitle?: string;
  className?: string;
}

export const CategoryBarBlock: React.FC<CategoryBarBlockProps> = ({
  data,
  title = 'KONDISI AWAL & INTERVENSI RUANG',
  subtitle = 'Jumlah ruang teridentifikasi berdasarkan tingkat kerusakan dan intervensi',
  className = '',
}) => {
  const categories: CategoryBarItem[] = data.categories || [];
  if (categories.length === 0) return null;

  // Find max value across all categories to scale bars proportionally
  const maxVal = Math.max(
    ...categories.map((c) => Math.max(c.val2025 || 0, c.val2026 || 0)),
    1
  );

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4 flex flex-col ${className}`}>
      {/* Header with Title and Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="space-y-0.5 min-w-0">
          <h4 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
            {title}
          </h4>
          {subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}
        </div>

        {/* Legend: 2025 vs 2026 */}
        <div className="flex items-center gap-3 text-xs font-bold text-slate-700 shrink-0 self-start sm:self-auto bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-blue-400 inline-block shadow-2xs" />
            <span>2025</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-blue-700 inline-block shadow-2xs" />
            <span>2026</span>
          </span>
        </div>
      </div>

      {/* Horizontal Bar Chart Rows */}
      <div className="space-y-4">
        {categories.map((cat) => {
          const pct2025 = Math.min(100, Math.max(4, Math.round((cat.val2025 / maxVal) * 100)));
          const pct2026 = Math.min(100, Math.max(4, Math.round((cat.val2026 / maxVal) * 100)));

          return (
            <div key={cat.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span className="truncate" title={cat.name}>{cat.name}</span>
                <span className="text-[11px] text-slate-500 font-semibold tabular-nums">
                  {cat.val2026.toLocaleString('id-ID')} {data.unit || 'Ruang'}
                </span>
              </div>

              {/* Bar 2025 */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 w-8 shrink-0">2025</span>
                <div className="flex-1 h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-blue-400 rounded-full transition-all duration-500 shadow-2xs flex items-center justify-end pr-1 text-[9px] font-bold text-white"
                    style={{ width: `${pct2025}%` }}
                  />
                </div>
                <span className="text-[11px] font-bold text-slate-600 w-14 text-right tabular-nums">
                  {cat.val2025Label || cat.val2025.toLocaleString('id-ID')}
                </span>
              </div>

              {/* Bar 2026 */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-blue-700 w-8 shrink-0">2026</span>
                <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-blue-700 rounded-full transition-all duration-500 shadow-2xs flex items-center justify-end pr-1.5 text-[9px] font-extrabold text-white"
                    style={{ width: `${pct2026}%` }}
                  />
                </div>
                <span className="text-[11px] font-black text-slate-900 w-14 text-right tabular-nums">
                  {cat.val2026Label || cat.val2026.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
