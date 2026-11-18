'use client';

import React from 'react';
import { KpiCardsBlockData, KpiCardItem } from '@/types/cms';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface KpiCardsBlockProps {
  data: KpiCardsBlockData;
  title?: string;
  subtitle?: string;
  className?: string;
}

export const KpiCardsBlock: React.FC<KpiCardsBlockProps> = ({
  data,
  title,
  subtitle,
  className = '',
}) => {
  const items: KpiCardItem[] = data.items || [];
  if (items.length === 0) return null;

  // Compute grid columns based on item count (1 to 5 cards)
  const gridColsClass =
    items.length === 1
      ? 'grid-cols-1 max-w-md'
      : items.length === 2
      ? 'grid-cols-1 sm:grid-cols-2'
      : items.length === 3
      ? 'grid-cols-1 sm:grid-cols-3'
      : items.length === 4
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5';

  return (
    <div className={`space-y-3 ${className}`}>
      {(title || subtitle) && (
        <div className="space-y-0.5">
          {title && <h4 className="text-base font-bold text-slate-900 tracking-tight">{title}</h4>}
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
      )}

      <div className={`grid ${gridColsClass} gap-3 sm:gap-4`}>
        {items.map((item) => {
          const isComparator = Boolean(
            (item.val2025 !== undefined || item.val2026 !== undefined) &&
              !(item.value && item.val2025 === undefined && item.val2026 === undefined)
          );

          // Auto calculate delta if not supplied
          let deltaText = item.delta;
          let isPositiveDelta = true;
          if (!deltaText && isComparator) {
            const num25 = typeof item.val2025 === 'number' ? item.val2025 : parseFloat(String(item.val2025).replace(/[^\d.-]/g, ''));
            const num26 = typeof item.val2026 === 'number' ? item.val2026 : parseFloat(String(item.val2026).replace(/[^\d.-]/g, ''));
            if (!isNaN(num25) && !isNaN(num26) && num25 > 0) {
              const diffPct = Math.round(((num26 - num25) / num25) * 1000) / 10;
              deltaText = `${diffPct >= 0 ? '+' : ''}${diffPct.toLocaleString('id-ID')}%`;
              isPositiveDelta = diffPct >= 0;
            }
          } else if (deltaText) {
            isPositiveDelta = !deltaText.startsWith('-');
          }

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between transition-all hover:border-slate-300 hover:shadow-xs group"
            >
              <div className="space-y-1 overflow-hidden">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block truncate" title={item.label}>
                  {item.label}
                </span>

                {isComparator ? (
                  /* Dual Year Comparator (2025 vs 2026) */
                  <div className="grid grid-cols-2 gap-2 pt-1 pb-1 border-b border-slate-100">
                    <div className="min-w-0">
                      <span className="text-[10px] font-semibold text-slate-400 block truncate">2025</span>
                      <span className="text-base sm:text-lg font-bold text-slate-700 block tabular-nums truncate">
                        {item.val2025}
                      </span>
                    </div>
                    <div className="border-l border-slate-100 pl-2 min-w-0">
                      <span className="text-[10px] font-bold text-blue-700 block truncate">2026</span>
                      <span className="text-xl sm:text-2xl font-black text-slate-900 block tabular-nums tracking-tight truncate">
                        {item.val2026}
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Single Value / Ratio Metric */
                  <div className="pt-1 min-w-0">
                    <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 block tracking-tight tabular-nums truncate">
                      {item.value || item.target || '—'}
                    </span>
                    {item.target && item.value && (
                      <span className="text-xs text-slate-500 font-medium block mt-0.5 truncate">
                        Target: {item.target}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom footer: Delta percentage or clean non-redundant subtext */}
              {(() => {
                // Filter out redundant sentences like "Realisasi 2025: ... Realisasi 2026: ..."
                let cleanSubtext = item.subtext || item.unit || '';
                if (/realisasi\s*202\d/i.test(cleanSubtext)) {
                  cleanSubtext = item.unit ? `Satuan: ${item.unit}` : 'Capaian Berjalan';
                }

                const hasValid2025 =
                  item.val2025 !== undefined &&
                  item.val2025 !== null &&
                  item.val2025 !== '—' &&
                  item.val2025 !== '-' &&
                  item.val2025 !== '';

                const showDelta = Boolean(hasValid2025 && deltaText);

                return (
                  <div className="pt-2.5 flex items-center justify-between text-xs gap-1.5 mt-2 border-t border-slate-50 overflow-hidden">
                    <span className="text-[11px] text-slate-500 font-medium truncate flex-1 min-w-0" title={cleanSubtext}>
                      {cleanSubtext}
                    </span>

                    {showDelta && (
                      <span
                        className="inline-flex items-center gap-0.5 text-[11px] font-bold shrink-0 tabular-nums text-slate-800"
                        title={`Perubahan: ${deltaText}`}
                      >
                        {isPositiveDelta ? (
                          <ArrowUpRight className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        )}
                        <span>{deltaText}</span>
                      </span>
                    )}
                  </div>
                );
              })()}
            </div>
          );
        })}
      </div>
    </div>
  );
};
