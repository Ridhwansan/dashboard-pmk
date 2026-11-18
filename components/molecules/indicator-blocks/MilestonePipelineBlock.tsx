'use client';

import React from 'react';
import { MilestonePipelineBlockData, MilestoneStageItem } from '@/types/cms';

interface MilestonePipelineBlockProps {
  data: MilestonePipelineBlockData;
  title?: string;
  subtitle?: string;
  className?: string;
}

export const MilestonePipelineBlock: React.FC<MilestonePipelineBlockProps> = ({
  data,
  title = 'KESIAPAN TAHAPAN PEMBANGUNAN',
  subtitle = 'Pemenuhan milestone per lokasi program • Posisi 2026',
  className = '',
}) => {
  const stages: MilestoneStageItem[] = data.stages || [];
  if (stages.length === 0) return null;

  const maxTotal = Math.max(...stages.map((s) => s.total || s.count || 42), 1);

  // Distinct color per stage matching Gambar 2
  const stageColors = [
    'from-blue-500 to-blue-600',
    'from-emerald-500 to-emerald-600',
    'from-amber-500 to-amber-600',
    'from-purple-500 to-purple-600',
    'from-indigo-500 to-indigo-600',
  ];

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4 flex flex-col ${className}`}>
      <div className="space-y-0.5 pb-2 border-b border-slate-100">
        <h4 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
          {title}
        </h4>
        {subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}
      </div>

      <div className="space-y-3.5 pt-1">
        {stages.map((stage, idx) => {
          const totalTarget = stage.total || maxTotal;
          const pct = Math.min(100, Math.max(5, Math.round((stage.count / totalTarget) * 100)));
          const colorGradient = stageColors[idx % stageColors.length];

          return (
            <div key={stage.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span className="truncate">{stage.name}</span>
                <span className="text-slate-900 font-extrabold tabular-nums">
                  {stage.count} lokasi {stage.total ? `dari ${stage.total}` : ''}
                </span>
              </div>

              <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
                <div
                  className={`h-full bg-gradient-to-r ${colorGradient} rounded-full transition-all duration-500 shadow-2xs flex items-center justify-end pr-2 text-[9px] font-extrabold text-white`}
                  style={{ width: `${pct}%` }}
                >
                  {pct >= 20 ? `${pct}%` : ''}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-auto pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-medium italic">
        *Milestone bersifat kumulatif: satu lokasi dapat memenuhi lebih dari satu tahapan pelaksanaan.
      </div>
    </div>
  );
};
