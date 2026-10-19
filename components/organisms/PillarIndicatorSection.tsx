'use client';

import React, { useState } from 'react';
import {
  TableProperties,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  HeartPulse,
  ShieldAlert,
  TrendingDown,
  Target,
  Sparkles,
  Rocket,
  Clock,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export interface AnnualIndicatorRow {
  name: string;
  subUnit?: string;
  y2025: { t: string; c: string };
  y2026: { t: string; c: string; note?: string };
  y2027: { t: string; c: string };
  y2028: { t: string; c: string };
  y2029: { t: string; c: string };
}

interface PillarIndicatorSectionProps {
  pillarName: string;
  pillarId: 'pendidikan' | 'kesehatan' | 'bencana' | 'kemiskinan';
  tableRows: AnnualIndicatorRow[];
  footnote?: string;
}

/**
 * Helper to safely extract numeric values from Indonesian formatted strings:
 * e.g. "36.669 (45,7%)" -> 36669
 * e.g. "0,56" -> 0.56
 * e.g. "105,98" -> 105.98
 * e.g. "6,5–7,5" -> 7.0
 * e.g. "—" or "Terhenti" or "Peluncuran Nov 2027" -> null
 */
function parseIndonesianNumber(val: string | undefined): number | null {
  if (!val || val === '—' || val.trim() === '') return null;
  // If text contains words without % or numbers
  if (/[a-zA-Z]/.test(val) && !val.includes('%')) {
    // Check if it's purely letters
    const withoutSpecial = val.replace(/[^a-zA-Z]/g, '');
    if (withoutSpecial.length > 2) return null;
  }

  // Extract clean number before parenthesis
  const clean = val.split('(')[0].trim().replace('%', '').trim();

  // Range support like "6,5–7,5"
  if (clean.includes('–') || clean.includes('-')) {
    const parts = clean.split(/[–-]/);
    const n1 = parseIndonesianNumber(parts[0]);
    const n2 = parseIndonesianNumber(parts[1]);
    if (n1 !== null && n2 !== null) return (n1 + n2) / 2;
    if (n1 !== null) return n1;
    if (n2 !== null) return n2;
  }

  // Decimals with comma like "0,56" or "105,98" or "8,07"
  if (clean.includes(',') && !clean.includes('.')) {
    const num = parseFloat(clean.replace(',', '.'));
    return isNaN(num) ? null : num;
  }

  // Small decimals with dot like "0.57" or "0.575"
  if (clean.startsWith('0.') || (clean.includes('.') && clean.length <= 5 && parseFloat(clean) < 10)) {
    const num = parseFloat(clean);
    return isNaN(num) ? null : num;
  }

  // Thousands separator with dot: "12.825" -> 12825, "80.282" -> 80282, "981.000" -> 981000
  if (clean.includes('.')) {
    const withoutDots = clean.replace(/\./g, '');
    const num = parseFloat(withoutDots.replace(',', '.'));
    return isNaN(num) ? null : num;
  }

  const num = parseFloat(clean.replace(',', '.'));
  return isNaN(num) ? null : num;
}

export const PillarIndicatorSection: React.FC<PillarIndicatorSectionProps> = ({
  pillarName,
  pillarId,
  tableRows,
  footnote = 'T = target • C = capaian • — = belum tersedia, bukan nol • 2026 merupakan posisi berjalan • Satuan mengikuti setiap indikator',
}) => {
  const [viewMode, setViewMode] = useState<'tabel' | 'visualisasi'>('tabel');
  const [selectedIdx, setSelectedIdx] = useState<number>(0);

  // Safe selected row
  const activeRow = tableRows[selectedIdx] || tableRows[0];

  const getPillarIcon = (id: string) => {
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

  // Trend analysis calculations for the selected indicator
  const years = [2025, 2026, 2027, 2028, 2029] as const;

  const yearData = [
    { year: 2025, tStr: activeRow.y2025.t, cStr: activeRow.y2025.c },
    { year: 2026, tStr: activeRow.y2026.t, cStr: activeRow.y2026.c, note: activeRow.y2026.note },
    { year: 2027, tStr: activeRow.y2027.t, cStr: activeRow.y2027.c },
    { year: 2028, tStr: activeRow.y2028.t, cStr: activeRow.y2028.c },
    { year: 2029, tStr: activeRow.y2029.t, cStr: activeRow.y2029.c },
  ];

  const parsedPoints = yearData.map((d) => ({
    ...d,
    tVal: parseIndonesianNumber(d.tStr),
    cVal: parseIndonesianNumber(d.cStr),
  }));

  const allNumbers = parsedPoints
    .flatMap((d) => [d.tVal, d.cVal])
    .filter((v): v is number => v !== null);

  const hasNumericData = allNumbers.length >= 2;
  const rawMin = hasNumericData ? Math.min(...allNumbers) : 0;
  const rawMax = hasNumericData ? Math.max(...allNumbers) : 100;

  // Compute adaptive Y-scale
  const isDecimal = rawMax <= 2 && rawMin >= 0;
  let yMin = isDecimal ? Math.max(0, rawMin - 0.05) : 0;
  let yMax = isDecimal ? rawMax + 0.05 : rawMax * 1.15;
  if (yMax === yMin) yMax = yMin + 10;

  // Chart coordinates: viewBox 0 0 620 220
  const chartW = 620;
  const chartH = 220;
  const paddingL = 60;
  const paddingR = 40;
  const paddingT = 30;
  const paddingB = 40;
  const plotW = chartW - paddingL - paddingR;
  const plotH = chartH - paddingT - paddingB;

  const getX = (index: number) => paddingL + (index / (years.length - 1)) * plotW;
  const getY = (val: number | null) => {
    if (val === null) return null;
    const ratio = (val - yMin) / (yMax - yMin);
    return paddingT + plotH - ratio * plotH;
  };

  // Generate SVG path for Target
  const targetPoints = parsedPoints
    .map((p, idx) => ({ ...p, x: getX(idx), y: getY(p.tVal) }))
    .filter((p): p is typeof p & { y: number } => p.y !== null);

  const targetPathD = targetPoints.reduce((acc, curr, i) => {
    return i === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  // Generate SVG path for Capaian
  const capaianPoints = parsedPoints
    .map((p, idx) => ({ ...p, x: getX(idx), y: getY(p.cVal) }))
    .filter((p): p is typeof p & { y: number } => p.y !== null);

  const capaianPathD = capaianPoints.reduce((acc, curr, i) => {
    return i === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  // Generate Capaian Area path
  const capaianAreaD =
    capaianPoints.length > 0
      ? `${capaianPathD} L ${capaianPoints[capaianPoints.length - 1].x} ${paddingT + plotH} L ${capaianPoints[0].x} ${paddingT + plotH} Z`
      : '';

  // Format Y-axis tick label
  const formatYTick = (val: number) => {
    if (isDecimal) return val.toFixed(2).replace('.', ',');
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
    return val.toFixed(0);
  };

  // 4 Y-axis ticks
  const yTicks = [0, 0.33, 0.66, 1].map((ratio) => {
    const val = yMin + ratio * (yMax - yMin);
    const y = paddingT + plotH - ratio * plotH;
    return { val, y };
  });

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* 1. Header with Title + Segmented Control (Tabel vs Visualisasi) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Target dan Capaian Tahunan (RPJMN 2025–2029)
          </h3>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            Perkembangan target (T) dan capaian (C) berkala per tahun
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Segmented Control 2 Pilihan: Tabel & Visualisasi */}
          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/90 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('tabel')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'tabel'
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80 ring-1 ring-slate-200/50'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableProperties className="h-3.5 w-3.5 text-blue-600" />
              <span>Tabel</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('visualisasi')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'visualisasi'
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80 ring-1 ring-slate-200/50'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5 text-blue-600" />
              <span>Visualisasi</span>
            </button>
          </div>

          <span className="hidden md:inline-block px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-xs font-semibold">
            {tableRows.length} Indikator Tahunan
          </span>
        </div>
      </div>

      {/* 2. TABEL VIEW (Exact layout from Gambar 1) */}
      {viewMode === 'tabel' && (
        <div className="space-y-3 animate-in fade-in duration-150">
          <div className="overflow-x-auto custom-scrollbar border border-slate-200 rounded-xl bg-white shadow-2xs">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/90 text-slate-900 font-bold">
                  <th className="py-3 px-4 md:px-5 min-w-[240px]">
                    Indikator dan satuan
                  </th>
                  <th className="py-3 px-3 md:px-4 text-center min-w-[110px] text-slate-800">
                    2025
                  </th>
                  <th className="py-3 px-3 md:px-4 text-center min-w-[150px] font-bold text-blue-950 bg-blue-100/70 border-x border-blue-200">
                    2026
                  </th>
                  <th className="py-3 px-3 md:px-4 text-center min-w-[110px] text-slate-800">
                    2027
                  </th>
                  <th className="py-3 px-3 md:px-4 text-center min-w-[110px] text-slate-800">
                    2028
                  </th>
                  <th className="py-3 px-3 md:px-4 text-center min-w-[110px] text-slate-800">
                    2029
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {tableRows.map((row, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    {/* Column 1: Indikator dan satuan */}
                    <td className="py-3.5 px-4 md:px-5 align-top">
                      <div className="font-bold text-slate-900 text-xs md:text-sm">
                        {row.name}
                      </div>
                      {row.subUnit && (
                        <div className="text-[11px] md:text-xs text-slate-600 font-medium mt-0.5">
                          {row.subUnit}
                        </div>
                      )}
                    </td>

                    {/* Column 2: 2025 */}
                    <td className="py-3.5 px-3 md:px-4 text-center align-top tabular-nums">
                      <div className="text-slate-700">T: {row.y2025.t}</div>
                      <div className="text-slate-900 font-semibold">
                        C: {row.y2025.c}
                      </div>
                    </td>

                    {/* Column 3: 2026 (Highlighted Column) */}
                    <td className="py-3.5 px-3 md:px-4 text-center align-top tabular-nums font-bold text-slate-950 bg-blue-50/50 border-x border-blue-100">
                      <div className="text-slate-800">T: {row.y2026.t}</div>
                      <div className="text-blue-950 font-bold">
                        C: {row.y2026.c}
                      </div>
                      {row.y2026.note && (
                        <div className="text-[11px] text-blue-900 font-medium mt-0.5">
                          {row.y2026.note}
                        </div>
                      )}
                    </td>

                    {/* Column 4: 2027 */}
                    <td className="py-3.5 px-3 md:px-4 text-center align-top tabular-nums">
                      <div className="text-slate-700">T: {row.y2027.t}</div>
                      <div className="text-slate-800 font-semibold">
                        C: {row.y2027.c}
                      </div>
                    </td>

                    {/* Column 5: 2028 */}
                    <td className="py-3.5 px-3 md:px-4 text-center align-top tabular-nums">
                      <div className="text-slate-700">T: {row.y2028.t}</div>
                      <div className="text-slate-800 font-semibold">
                        C: {row.y2028.c}
                      </div>
                    </td>

                    {/* Column 6: 2029 */}
                    <td className="py-3.5 px-3 md:px-4 text-center align-top tabular-nums">
                      <div className="text-slate-700">T: {row.y2029.t}</div>
                      <div className="text-slate-800 font-semibold">
                        C: {row.y2029.c}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            {footnote}
          </p>
        </div>
      )}

      {/* 3. VISUALISASI VIEW (Following Gambar 2: Left Indicators without T/C, Right Trend Chart) */}
      {viewMode === 'visualisasi' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* LEFT COLUMN: List of indicators without target and capaian */}
            <div className="lg:col-span-4 xl:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col overflow-hidden">
              {/* Header Card (Following Gambar 2 Header Style) */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/70 shrink-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
                      {getPillarIcon(pillarId)}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Pilar {pillarName}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 leading-tight">
                        Daftar Indikator
                      </h4>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200/80 text-blue-700 text-[11px] font-bold shrink-0">
                    {tableRows.length} Indikator
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-1 mt-1 border-t border-slate-200/60">
                  <span>Periode RPJMN 2025–2029</span>
                  <span className="text-slate-400">Pilih untuk tren</span>
                </div>
              </div>

              {/* Scrollable Indicator List: Clean, NO target and capaian cards */}
              <div className="p-2.5 space-y-1.5 max-h-[580px] overflow-y-auto custom-scrollbar">
                {tableRows.map((row, index) => {
                  const isSelected = selectedIdx === index;
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedIdx(index)}
                      className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer select-none flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-blue-50/90 border-blue-400 ring-1 ring-blue-400 shadow-2xs'
                          : 'bg-white hover:bg-slate-50 border-slate-200/80 hover:border-slate-300'
                      }`}
                    >
                      <div className="min-w-0 pr-1">
                        <div className="flex items-start gap-1.5">
                          <span
                            className={`text-xs font-bold shrink-0 mt-0.5 ${
                              isSelected ? 'text-blue-700' : 'text-slate-400'
                            }`}
                          >
                            {index + 1}.
                          </span>
                          <span
                            className={`text-xs leading-snug line-clamp-2 ${
                              isSelected
                                ? 'font-bold text-blue-950'
                                : 'font-semibold text-slate-800'
                            }`}
                          >
                            {row.name}
                          </span>
                        </div>

                        {row.subUnit && (
                          <div className="text-[11px] text-slate-500 font-medium pl-4 mt-0.5 truncate">
                            {row.subUnit}
                          </div>
                        )}
                      </div>

                      {isSelected ? (
                        <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Footer Card */}
              <div className="px-3.5 py-2.5 border-t border-slate-100 bg-slate-50/60 shrink-0 flex items-center justify-between text-[11px] text-slate-600 font-medium">
                <span>Daftar Indikator Pilar</span>
                <span className="font-semibold text-slate-700">RPJMN 2025–2029</span>
              </div>
            </div>

            {/* RIGHT COLUMN: Trend Chart & Annual Comparison (2025 - 2029) */}
            <div className="lg:col-span-8 xl:col-span-8 bg-white rounded-2xl border border-slate-200/90 p-5 md:p-6 shadow-2xs space-y-5">
              {/* Header: Selected Indicator Info & Legend */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-900 border border-blue-200">
                      Indikator #{selectedIdx + 1}
                    </span>
                    {activeRow.subUnit && (
                      <span className="text-xs text-slate-500 font-medium">
                        Satuan: {activeRow.subUnit}
                      </span>
                    )}
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug">
                    {activeRow.name}
                  </h4>
                </div>

                {/* Legend Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold">
                    <span className="w-3.5 h-0.5 bg-blue-600 border-b border-dashed border-blue-600 inline-block" />
                    <span>Target (T)</span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                    <span className="w-3.5 h-1 bg-emerald-600 rounded-full inline-block" />
                    <span>Capaian (C)</span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-blue-600 inline-block animate-pulse" />
                    <span>2026 Berjalan</span>
                  </div>
                </div>
              </div>

              {/* 3 Executive Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Stat 1: Realisasi 2026 */}
                <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/90 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Capaian 2026 (Berjalan)
                  </span>
                  <div className="mt-1.5 mb-1">
                    <span className="text-xl md:text-2xl font-bold text-slate-900 tabular-nums">
                      {activeRow.y2026.c}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 font-medium">
                    Target 2026: <strong className="text-slate-800">{activeRow.y2026.t}</strong>
                  </div>
                </div>

                {/* Stat 2: Target Akhir 2029 */}
                <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/90 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Sasaran Akhir RPJMN (2029)
                  </span>
                  <div className="mt-1.5 mb-1">
                    <span className="text-xl md:text-2xl font-bold text-blue-900 tabular-nums">
                      {activeRow.y2029.t}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 font-medium">
                    {activeRow.y2029.c === '—'
                      ? 'Realisasi akhir 2029'
                      : `Capaian: ${activeRow.y2029.c}`}
                  </div>
                </div>

                {/* Stat 3: Status / Catatan Evaluasi */}
                <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/90 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Status Perkembangan
                  </span>
                  <div className="mt-1.5 mb-1 flex items-center gap-1.5">
                    {activeRow.y2026.c.includes('100%') ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Target Terpenuhi
                      </span>
                    ) : activeRow.y2026.c.includes('%') ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        Dalam Proses
                      </span>
                    ) : activeRow.y2026.c === 'Terhenti' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300">
                        Terhenti
                      </span>
                    ) : activeRow.y2026.note ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300">
                        {activeRow.y2026.note}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-slate-200 text-slate-800">
                        Dalam Pemantauan
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-600 font-medium truncate">
                    {activeRow.y2026.note || 'Posisi berjalan tahun 2026'}
                  </div>
                </div>
              </div>

              {/* The Trend Chart Visualizer */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Target className="h-3.5 w-3.5 text-blue-600" />
                    Grafik Tren Target vs Realisasi (2025–2029)
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Kolom biru: Posisi berjalan 2026
                  </span>
                </div>

                {hasNumericData ? (
                  <div className="w-full overflow-hidden">
                    <svg
                      viewBox={`0 0 ${chartW} ${chartH}`}
                      className="w-full h-auto max-h-[260px] select-none"
                    >
                      <defs>
                        {/* Gradient for Capaian Area */}
                        <linearGradient id="capaianAreaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* 2026 Highlight Column Band */}
                      <rect
                        x={getX(1) - 45}
                        y={paddingT - 10}
                        width={90}
                        height={plotH + 20}
                        rx={8}
                        fill="#eff6ff"
                        stroke="#bfdbfe"
                        strokeWidth="1"
                        strokeDasharray="4 3"
                      />

                      {/* Tag on top of 2026 highlight column */}
                      <rect
                        x={getX(1) - 38}
                        y={paddingT - 22}
                        width={76}
                        height={16}
                        rx={4}
                        fill="#2563eb"
                      />
                      <text
                        x={getX(1)}
                        y={paddingT - 11}
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="8.5"
                        fontWeight="bold"
                      >
                        BERJALAN 2026
                      </text>

                      {/* Horizontal Gridlines & Y Labels */}
                      {yTicks.map((tick, i) => (
                        <g key={i}>
                          <line
                            x1={paddingL}
                            y1={tick.y}
                            x2={chartW - paddingR}
                            y2={tick.y}
                            stroke="#e2e8f0"
                            strokeDasharray="3 3"
                            strokeWidth="1"
                          />
                          <text
                            x={paddingL - 8}
                            y={tick.y + 3.5}
                            textAnchor="end"
                            fill="#64748b"
                            fontSize="9"
                            fontFamily="sans-serif"
                            fontWeight="500"
                          >
                            {formatYTick(tick.val)}
                          </text>
                        </g>
                      ))}

                      {/* Capaian Area Gradient */}
                      {capaianAreaD && (
                        <path d={capaianAreaD} fill="url(#capaianAreaGrad)" />
                      )}

                      {/* Target Line (Dashed Blue) */}
                      {targetPathD && (
                        <path
                          d={targetPathD}
                          fill="none"
                          stroke="#2563eb"
                          strokeWidth="2.5"
                          strokeDasharray="6 4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      )}

                      {/* Capaian Line (Solid Vibrant Emerald) */}
                      {capaianPathD && (
                        <path
                          d={capaianPathD}
                          fill="none"
                          stroke="#059669"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      )}

                      {/* Target Nodes */}
                      {targetPoints.map((pt, i) => (
                        <g key={`t-${i}`}>
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r={4.5}
                            fill="#ffffff"
                            stroke="#2563eb"
                            strokeWidth="2.5"
                          />
                          {/* Value Chip above target node */}
                          <text
                            x={pt.x}
                            y={pt.y - 8}
                            textAnchor="middle"
                            fill="#1e3a8a"
                            fontSize="9"
                            fontWeight="bold"
                          >
                            T: {pt.tStr}
                          </text>
                        </g>
                      ))}

                      {/* Capaian Nodes */}
                      {capaianPoints.map((pt, i) => (
                        <g key={`c-${i}`}>
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r={5.5}
                            fill="#059669"
                            stroke="#ffffff"
                            strokeWidth="2"
                          />
                          {/* Value Chip below or right of capaian node */}
                          <text
                            x={pt.x}
                            y={pt.y + 16}
                            textAnchor="middle"
                            fill="#065f46"
                            fontSize="9"
                            fontWeight="bold"
                          >
                            C: {pt.cStr.split('(')[0].trim()}
                          </text>
                        </g>
                      ))}

                      {/* X-axis Line */}
                      <line
                        x1={paddingL}
                        y1={paddingT + plotH}
                        x2={chartW - paddingR}
                        y2={paddingT + plotH}
                        stroke="#cbd5e1"
                        strokeWidth="1.5"
                      />

                      {/* X-axis Labels (Years) */}
                      {years.map((yr, idx) => {
                        const isCurrent = yr === 2026;
                        return (
                          <g key={yr}>
                            <text
                              x={getX(idx)}
                              y={paddingT + plotH + 20}
                              textAnchor="middle"
                              fill={isCurrent ? '#1e3a8a' : '#475569'}
                              fontSize={isCurrent ? '12' : '11'}
                              fontWeight={isCurrent ? 'bold' : '600'}
                            >
                              {yr}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                ) : (
                  /* Milestone / Qualitative Timeline (For non-numeric indicators like Studio Guru) */
                  <div className="py-6 px-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="h-4 w-4 text-amber-600" />
                      <span className="text-xs font-bold text-slate-800">
                        Lintasan Tahapan Implementasi RPJMN 2025–2029
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                      {yearData.map((d, i) => {
                        const is2026 = d.year === 2026;
                        const hasTarget = d.tStr !== '—';
                        const hasCapaian = d.cStr !== '—';

                        return (
                          <div
                            key={d.year}
                            className={`p-3 rounded-xl border flex flex-col justify-between ${
                              is2026
                                ? 'bg-blue-50/90 border-blue-300 ring-1 ring-blue-300'
                                : 'bg-white border-slate-200'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-2">
                              <span className="text-xs font-bold text-slate-900">
                                {d.year}
                              </span>
                              {is2026 && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-600 text-white">
                                  Berjalan
                                </span>
                              )}
                            </div>

                            <div className="space-y-1.5 text-xs">
                              <div className="p-1.5 rounded bg-slate-50 border border-slate-100">
                                <span className="text-[10px] text-slate-400 font-bold block uppercase">
                                  Target
                                </span>
                                <span className="font-bold text-slate-800 break-words">
                                  {d.tStr}
                                </span>
                              </div>

                              <div className="p-1.5 rounded bg-slate-50 border border-slate-100">
                                <span className="text-[10px] text-slate-400 font-bold block uppercase">
                                  Capaian
                                </span>
                                <span className="font-bold text-slate-800 break-words">
                                  {d.cStr}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* 5-Year Detail Matrix Cards underneath the chart */}
              <div>
                <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
                  Rincian Angka Target &amp; Capaian per Tahun
                </h5>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                  {yearData.map((d) => {
                    const is2026 = d.year === 2026;
                    return (
                      <div
                        key={d.year}
                        className={`p-3 rounded-xl border transition-all ${
                          is2026
                            ? 'bg-blue-50/70 border-blue-300 ring-1 ring-blue-300 shadow-2xs'
                            : 'bg-slate-50/70 border-slate-200/80 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-200/60">
                          <span
                            className={`text-xs font-bold ${
                              is2026 ? 'text-blue-950 font-extrabold' : 'text-slate-800'
                            }`}
                          >
                            Tahun {d.year}
                          </span>
                          {is2026 && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-600 text-white">
                              Posisi Berjalan
                            </span>
                          )}
                          {d.year === 2029 && (
                            <span className="text-[9px] font-semibold text-slate-500">
                              Akhir RPJMN
                            </span>
                          )}
                        </div>

                        <div className="space-y-1 text-xs">
                          <div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                              Target (T):
                            </span>
                            <div className="font-bold text-slate-900 tabular-nums break-words">
                              {d.tStr}
                            </div>
                          </div>

                          <div className="pt-1 border-t border-slate-200/50">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                              Capaian (C):
                            </span>
                            <div
                              className={`font-bold tabular-nums break-words ${
                                is2026 ? 'text-blue-950 font-extrabold' : 'text-slate-900'
                              }`}
                            >
                              {d.cStr}
                            </div>
                            {d.note && (
                              <div className="text-[10px] text-blue-900 font-medium mt-0.5">
                                {d.note}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Official Footnote */}
              <p className="text-xs text-slate-600 font-medium leading-relaxed pt-2 border-t border-slate-100">
                {footnote}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
