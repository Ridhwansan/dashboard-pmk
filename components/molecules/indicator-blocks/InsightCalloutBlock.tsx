'use client';

import React from 'react';
import { InsightCalloutBlockData } from '@/types/cms';
import { Sparkles } from 'lucide-react';

interface InsightCalloutBlockProps {
  data: InsightCalloutBlockData;
  title?: string;
  width?: 'full' | 'half' | 'third';
  className?: string;
}

export const InsightCalloutBlock: React.FC<InsightCalloutBlockProps> = ({
  data,
  title = 'INSIGHT UTAMA',
  width = 'third',
  className = '',
}) => {
  const insights = data.insights || [];
  if (insights.length === 0) return null;

  const isFullWidth = width === 'full';

  return (
    <div
      className={`bg-white text-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-3.5 flex flex-col justify-between overflow-hidden ${className}`}
    >
      <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
        <div className="w-5 h-5 rounded-md bg-blue-700 text-white flex items-center justify-center shadow-2xs shrink-0">
          <Sparkles className="w-3 h-3" />
        </div>
        <span className="font-extrabold text-slate-900 tracking-tight text-xs uppercase truncate">{title}</span>
      </div>

      <div
        className={`flex-1 overflow-hidden ${
          isFullWidth ? 'grid grid-cols-1 md:grid-cols-3 gap-3 pt-0.5' : 'flex flex-col gap-2.5 pt-0.5'
        }`}
      >
        {insights.slice(0, 3).map((insight, idx) => {
          const numStr = String(idx + 1).padStart(2, '0');
          return (
            <div
              key={idx}
              className="bg-slate-50/80 hover:bg-slate-100/70 border border-slate-200/90 rounded-xl p-3 space-y-1 transition-all flex items-start gap-2.5 overflow-hidden"
            >
              <span className="text-[11px] font-black text-blue-800 bg-blue-100 px-1.5 py-0.5 rounded shrink-0 tabular-nums border border-blue-200/80">
                {numStr}
              </span>
              <p
                className="text-xs text-slate-700 font-medium leading-relaxed line-clamp-2 overflow-hidden"
                title={insight}
              >
                {insight}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
