'use client';

import React from 'react';
import { WatchlistBlockData, WatchlistItem } from '@/types/cms';
import { AlertTriangle } from 'lucide-react';

interface WatchlistBlockProps {
  data: WatchlistBlockData;
  title?: string;
  subtitle?: string;
  className?: string;
}

export const WatchlistBlock: React.FC<WatchlistBlockProps> = ({
  data,
  title = 'LOKASI & ISU YANG MEMERLUKAN PERHATIAN',
  subtitle = 'Penyaringan deviasi progres dan kendala lapangan',
  className = '',
}) => {
  const items: WatchlistItem[] = data.items || [];
  if (items.length === 0) return null;

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-3.5 flex flex-col justify-between overflow-hidden ${className}`}>
      <div className="space-y-0.5 pb-2.5 border-b border-slate-100 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h4 className="text-xs sm:text-[13px] font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5 uppercase truncate">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="truncate">{title}</span>
          </h4>
          {subtitle && <p className="text-[11px] text-slate-500 font-medium truncate">{subtitle}</p>}
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-2.5 overflow-hidden">
        {items.slice(0, 2).map((item) => {
          return (
            <div
              key={item.id}
              className="rounded-xl p-3 border border-slate-200/90 bg-slate-50/80 text-xs space-y-1.5 transition-colors overflow-hidden"
            >
              <div className="flex items-center justify-between gap-2 overflow-hidden">
                <span className="font-bold text-slate-900 text-xs truncate max-w-[200px]" title={item.title}>
                  {item.title}
                </span>
                <span className="text-[10px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0 truncate max-w-[130px]" title={item.location}>
                  {item.location}
                </span>
              </div>

              <p className="text-slate-600 font-normal text-[11px] leading-relaxed line-clamp-2" title={item.findings}>
                {item.findings}
              </p>

              <div className="pt-1 border-t border-slate-200/70 text-[11px] line-clamp-1 overflow-hidden" title={item.action}>
                <span className="font-bold text-slate-800">Tindak Lanjut: </span>
                <span className="text-slate-700">{item.action}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
