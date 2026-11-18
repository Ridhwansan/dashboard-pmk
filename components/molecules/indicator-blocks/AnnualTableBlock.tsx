'use client';

import React from 'react';
import { AnnualTableBlockData } from '@/types/cms';
import { TableProperties } from 'lucide-react';

interface AnnualTableBlockProps {
  data?: AnnualTableBlockData;
  annualTargets?: Array<{
    year: number;
    target: string;
    capaian: string;
    percent?: number;
    status?: string;
  }>;
  title?: string;
  subtitle?: string;
  unit?: string;
  className?: string;
}

export const AnnualTableBlock: React.FC<AnnualTableBlockProps> = ({
  annualTargets = [],
  title = 'TABEL RINCIAN TAHUNAN RPJMN (2025–2029)',
  subtitle = 'Target sasaran rencana aksi nasional vs realisasi berjalan per tahun',
  unit = '',
  className = '',
}) => {
  if (!annualTargets || annualTargets.length === 0) return null;

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col ${className}`}>
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/40">
        <div className="space-y-0.5 min-w-0">
          <h4 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <TableProperties className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="truncate">{title}</span>
          </h4>
          {subtitle && <p className="text-xs text-slate-500 font-medium truncate">{subtitle}</p>}
        </div>
      </div>

      <div className="overflow-x-auto [scrollbar-width:thin]">
        <table className="w-full text-left border-collapse text-xs md:text-sm">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4 sm:px-6">Tahun</th>
              <th className="py-3 px-4 sm:px-6">Target Sasaran</th>
              <th className="py-3 px-4 sm:px-6">Realisasi Capaian</th>
              <th className="py-3 px-4 sm:px-6 text-center">% Capaian</th>
              <th className="py-3 px-4 sm:px-6 text-right">Status Pelaksanaan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {annualTargets.map((row) => {
              const isCurrentYear = row.year === 2026;
              const hasCapaian = row.capaian && row.capaian !== '—';

              return (
                <tr
                  key={row.year}
                  className={`transition-colors ${
                    isCurrentYear
                      ? 'bg-blue-50/30 font-semibold'
                      : 'hover:bg-slate-50/60'
                  }`}
                >
                  <td className="py-3.5 px-4 sm:px-6 font-extrabold text-slate-900 tabular-nums">
                    {row.year} {isCurrentYear && <span className="text-[10px] text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded font-bold ml-1.5">Berjalan</span>}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-slate-700 font-bold tabular-nums">
                    {row.target} {unit && !row.target.includes(unit) ? unit : ''}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-slate-900 font-extrabold tabular-nums">
                    {row.capaian} {unit && hasCapaian && !row.capaian.includes(unit) ? unit : ''}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-center tabular-nums">
                    {row.percent !== undefined && row.percent !== null ? (
                      <span className="font-extrabold text-slate-900 bg-slate-100 px-2 py-1 rounded-md">
                        {row.percent}%
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-right">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        row.status?.toLowerCase().includes('tercapai') || (row.percent && row.percent >= 100)
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : row.status?.toLowerCase().includes('berjalan') || hasCapaian
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {row.status || (hasCapaian ? 'Berjalan Sesuai Rencana' : 'Belum Mulai')}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
