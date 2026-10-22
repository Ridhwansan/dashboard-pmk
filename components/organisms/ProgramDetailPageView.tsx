'use client';

import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  TableProperties,
  BarChart3,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { ProgramDetailData, KendalaDetailItem } from '@/data/programDetailData';

interface ProgramDetailPageViewProps {
  program: ProgramDetailData;
  onBack: () => void;
}

const MONTH_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

export const ProgramDetailPageView: React.FC<ProgramDetailPageViewProps> = ({
  program,
  onBack,
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(0); // 0 = Semua Bulan
  const [viewMode, setViewMode] = useState<'tabel' | 'grafik'>('tabel');

  // Filtered monthly data
  const rawMonths = useMemo(() => {
    return program.monthlyData[selectedYear] || program.monthlyData[2026] || [];
  }, [program, selectedYear]);

  const displayedMonths = useMemo(() => {
    if (selectedMonth === 0) return rawMonths;
    return rawMonths.filter((m) => m.month === selectedMonth);
  }, [rawMonths, selectedMonth]);

  // Aggregate metrics
  const summaryMetrics = useMemo(() => {
    if (rawMonths.length === 0) return { totalTarget: 0, totalCapaian: 0, avgPct: 0 };
    const latestActiveMonth = rawMonths
      .filter((m) => m.capaian !== null)
      .slice(-1)[0] || rawMonths[0];

    const targetVal = latestActiveMonth?.target || 0;
    const capaianVal = latestActiveMonth?.capaian || 0;
    const pct = targetVal > 0 ? Math.round((capaianVal / targetVal) * 100) : 0;

    return {
      totalTarget: targetVal,
      totalCapaian: capaianVal,
      avgPct: pct,
    };
  }, [rawMonths]);

  // Dynamic resolution of kendala list (supports multiple issues & long descriptions)
  const resolvedKendalaList: KendalaDetailItem[] = useMemo(() => {
    if (program.kendalaList && program.kendalaList.length > 0) {
      return program.kendalaList;
    }
    if (program.kendala || program.tindakLanjut) {
      const rawKendala = program.kendala || 'Tidak terdapat kendala operasional yang kritis saat ini.';
      const rawTindakLanjut =
        program.tindakLanjut ||
        'Koordinasi teknis rutin antar kementerian/lembaga terkait pengawasan realisasi program.';

      // Check if semicolon or double-newline separates multiple distinct issues
      if (rawKendala.includes(';') && !rawKendala.includes('\n')) {
        const kParts = rawKendala.split(';').map((s) => s.trim()).filter(Boolean);
        const tParts = rawTindakLanjut.split(';').map((s) => s.trim()).filter(Boolean);
        if (kParts.length > 1) {
          return kParts.map((kText, idx) => ({
            id: idx + 1,
            title: `Isu Lapangan #${idx + 1}`,
            kendala: kText,
            tindakLanjut: tParts[idx] || tParts[0] || 'Koordinasi teknis lintas K/L untuk penanganan kendala.',
            klTerkait: program.picKementerian,
          }));
        }
      }

      return [
        {
          id: 1,
          title: `Isu Prioritas: ${program.title}`,
          kendala: rawKendala,
          tindakLanjut: rawTindakLanjut,
          klTerkait: program.picKementerian,
        },
      ];
    }
    return [];
  }, [program]);

  // SVG Chart Calculations
  const chartW = 900;
  const chartH = 260;
  const padL = 60;
  const padR = 30;
  const padT = 30;
  const padB = 40;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;

  const validTargets = rawMonths.map((m) => m.target);
  const validCapaian = rawMonths.map((m) => m.capaian).filter((v): v is number => v !== null);
  const maxVal = Math.max(...validTargets, ...validCapaian, 10);
  const yMax = maxVal * 1.15;

  const getX = (index: number) => padL + (index / (rawMonths.length - 1)) * plotW;
  const getY = (val: number | null) => {
    if (val === null) return padT + plotH;
    const ratio = Math.min(1, Math.max(0, val / yMax));
    return padT + plotH - ratio * plotH;
  };

  const targetPath = rawMonths.reduce((acc, curr, i) => {
    const x = getX(i);
    const y = getY(curr.target);
    return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const capaianMonths = rawMonths.filter((m) => m.capaian !== null);
  const capaianPath = capaianMonths.reduce((acc, curr, i) => {
    const origIndex = rawMonths.findIndex((m) => m.month === curr.month);
    const x = getX(origIndex);
    const y = getY(curr.capaian);
    return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const capaianArea =
    capaianMonths.length > 0
      ? `${capaianPath} L ${getX(rawMonths.findIndex((m) => m.month === capaianMonths[capaianMonths.length - 1].month))} ${padT + plotH} L ${getX(0)} ${padT + plotH} Z`
      : '';

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-150">
      {/* 1. TOP BAR: Consistent Back Button & Context Breadcrumb */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="h-[44px] inline-flex items-center gap-2.5 px-5 rounded-2xl text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200/90 shadow-2xs transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4.5 h-4.5 text-slate-500" />
          <span>Kembali ke Daftar Program</span>
        </button>

        {/* Clear Breadcrumb Context */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500 bg-white px-4 py-2.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span>Ikhtisar</span>
          <span className="text-slate-300">/</span>
          <span>Pilar {program.pillarTitle}</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-bold truncate max-w-[280px]">{program.title}</span>
        </div>
      </div>

      {/* 2. PROGRAM OVERVIEW & 4 KPI STAT CARDS */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-5">
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {program.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Pilar {program.pillarTitle} · Pelaksana: {program.picKementerian}
          </p>
        </div>

        {/* Factual, non-verbose description */}
        <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed max-w-4xl">
          {program.description}
        </p>

        {/* Clean 3-Metric Summary Strip (No nested bordered cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-5 border-t border-slate-100">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 block">Target 2026</span>
            <span className="text-xl sm:text-2xl font-extrabold text-slate-900 block tracking-tight">
              {program.target2026}
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 block">Realisasi Berjalan</span>
            <span className="text-xl sm:text-2xl font-extrabold text-blue-900 block tracking-tight">
              {program.currentValue} {program.unit}
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 block">Persentase Capaian</span>
            <span className="text-xl sm:text-2xl font-extrabold text-emerald-700 block tracking-tight">
              {summaryMetrics.avgPct}%
            </span>
          </div>
        </div>
      </div>

      {/* 3. TARGET & CAPAIAN BULANAN (Consistent Height for Filters & Segmented Control) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
        {/* Controls Toolbar: All inputs & controls standard h-[44px] */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          {/* Left: Filter Tahun & Bulan */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Filter Tahun */}
            <div className="relative">
              <select
                id="filter-tahun-page"
                aria-label="Pilih Tahun"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="h-[44px] appearance-none pl-4 pr-10 text-xs sm:text-sm font-bold bg-slate-50 hover:bg-white text-slate-900 border border-slate-200/90 hover:border-slate-300 rounded-xl cursor-pointer shadow-2xs transition-all focus:ring-2 focus:ring-blue-600 focus:bg-white"
              >
                <option value={2026}>Tahun 2026 (Berjalan)</option>
                <option value={2025}>Tahun 2025 (Historis)</option>
                <option value={2027}>Tahun 2027 (Rencana)</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>

            {/* Filter Bulan */}
            <div className="relative">
              <select
                id="filter-bulan-page"
                aria-label="Pilih Bulan"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="h-[44px] appearance-none pl-4 pr-10 text-xs sm:text-sm font-bold bg-slate-50 hover:bg-white text-slate-900 border border-slate-200/90 hover:border-slate-300 rounded-xl cursor-pointer shadow-2xs transition-all focus:ring-2 focus:ring-blue-600 focus:bg-white"
              >
                <option value={0}>Semua Bulan (12 Bulan)</option>
                <option value={1}>Januari</option>
                <option value={2}>Februari</option>
                <option value={3}>Maret</option>
                <option value={4}>April</option>
                <option value={5}>Mei</option>
                <option value={6}>Juni</option>
                <option value={7}>Juli</option>
                <option value={8}>Agustus</option>
                <option value={9}>September</option>
                <option value={10}>Oktober</option>
                <option value={11}>November</option>
                <option value={12}>Desember</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </div>

          {/* Right: Prominent, Enlarged Segmented Control matching select height */}
          <div className="h-[44px] p-1 bg-slate-100 rounded-xl border border-slate-200/90 inline-flex items-center gap-1.5 self-start lg:self-auto shrink-0 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('tabel')}
              className={`h-[36px] inline-flex items-center gap-2 px-5 sm:px-6 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                viewMode === 'tabel'
                  ? 'bg-white text-slate-900 shadow-2xs font-extrabold border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <TableProperties className="w-4.5 h-4.5 text-blue-600" />
              <span>Tabel Bulanan</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('grafik')}
              className={`h-[36px] inline-flex items-center gap-2 px-5 sm:px-6 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                viewMode === 'grafik'
                  ? 'bg-white text-slate-900 shadow-2xs font-extrabold border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <BarChart3 className="w-4.5 h-4.5 text-blue-600" />
              <span>Visualisasi Grafik</span>
            </button>
          </div>
        </div>

        {/* View 1: Tabel Bulanan */}
        {viewMode === 'tabel' && (
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="bg-slate-100/90 text-slate-900 font-bold border-b border-slate-200">
                    <th className="py-3.5 px-4 min-w-[140px]">Bulan</th>
                    <th className="py-3.5 px-4 text-right min-w-[140px]">Target (T)</th>
                    <th className="py-3.5 px-4 text-right min-w-[140px] bg-blue-50/70 border-x border-blue-100 text-blue-950 font-extrabold">
                      Capaian (C)
                    </th>
                    <th className="py-3.5 px-4 text-center min-w-[150px]">Persentase Capaian</th>
                    <th className="py-3.5 px-4 min-w-[200px]">Catatan Pelaksanaan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {displayedMonths.map((m) => {
                    const isCutoff = selectedYear === 2026 && m.month === 10;
                    return (
                      <tr
                        key={m.month}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isCutoff ? 'bg-amber-50/40 font-semibold' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4 text-slate-900 font-bold">
                          {m.monthName} {selectedYear}
                          {isCutoff && (
                            <span className="block text-[11px] text-amber-700 font-normal">
                              (Posisi Berjalan Saat Ini)
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right text-slate-700 tabular-nums">
                          {m.targetFormatted}
                        </td>
                        <td className="py-3.5 px-4 text-right tabular-nums font-bold text-slate-950 bg-blue-50/30 border-x border-blue-100/70">
                          {m.capaianFormatted}
                        </td>
                        <td className="py-3.5 px-4 text-center tabular-nums">
                          {m.percentage !== undefined && m.capaian !== null ? (
                            <span
                              className={`font-bold ${
                                m.percentage >= 95
                                  ? 'text-emerald-700'
                                  : m.percentage >= 75
                                  ? 'text-blue-700'
                                  : 'text-amber-700'
                              }`}
                            >
                              {m.percentage}%
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 text-xs">
                          {m.note || (m.capaian !== null ? 'Laporan diverifikasi' : 'Menunggu periode berjalan')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* View 2: Visualisasi Grafik */}
        {viewMode === 'grafik' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-600">
                Trajektori Kumulatif Target vs Realisasi Tahun {selectedYear}
              </span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-3 h-0.5 bg-blue-600 inline-block border-t-2 border-dashed border-blue-600" />
                  <span>Target</span>
                </span>
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <span className="w-3 h-1 bg-emerald-600 inline-block rounded-full" />
                  <span>Realisasi</span>
                </span>
              </div>
            </div>

            <div className="w-full overflow-x-auto custom-scrollbar border border-slate-200 rounded-2xl p-4 bg-white shadow-2xs">
              <svg
                viewBox={`0 0 ${chartW} ${chartH}`}
                className="w-full h-64 min-w-[650px] overflow-visible"
              >
                <defs>
                  <linearGradient id="capaianGradPage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((r, idx) => {
                  const y = padT + plotH - r * plotH;
                  const val = (r * yMax).toLocaleString('id-ID', { maximumFractionDigits: 0 });
                  return (
                    <g key={idx}>
                      <line
                        x1={padL}
                        y1={y}
                        x2={chartW - padR}
                        y2={y}
                        stroke="#e2e8f0"
                        strokeDasharray="4 4"
                      />
                      <text
                        x={padL - 8}
                        y={y + 3}
                        textAnchor="end"
                        className="text-[10px] fill-slate-400 font-mono"
                      >
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* Capaian Area */}
                {capaianArea && <path d={capaianArea} fill="url(#capaianGradPage)" />}

                {/* Target Dashed Line */}
                <path
                  d={targetPath}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                  strokeDasharray="5 5"
                />

                {/* Capaian Solid Line */}
                {capaianPath && (
                  <path
                    d={capaianPath}
                    fill="none"
                    stroke="#059669"
                    strokeWidth="3"
                  />
                )}

                {/* Points on Months */}
                {rawMonths.map((m, idx) => {
                  const x = getX(idx);
                  const yT = getY(m.target);
                  const yC = m.capaian !== null ? getY(m.capaian) : null;

                  return (
                    <g key={m.month}>
                      <circle cx={x} cy={yT} r="3" fill="#3b82f6" />
                      {yC !== null && (
                        <circle
                          cx={x}
                          cy={yC}
                          r="4.5"
                          fill="#059669"
                          stroke="#ffffff"
                          strokeWidth="2"
                        />
                      )}
                      <text
                        x={x}
                        y={chartH - 12}
                        textAnchor="middle"
                        className="text-[10px] fill-slate-500 font-medium"
                      >
                        {MONTH_SHORT[idx]}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* 4. KENDALA & TINDAK LANJUT (Flat layout without nested card-in-card) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
            <AlertCircle className="w-4.5 h-4.5" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Kendala Pelaksanaan &amp; Tindak Lanjut
          </h3>
        </div>

        {/* Dynamic Issue List without nested cards */}
        {resolvedKendalaList.length === 0 ? (
          <p className="text-xs sm:text-sm text-slate-600 font-medium py-2">
            Tidak teridentifikasi kendala kritis pada periode berjalan.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {resolvedKendalaList.map((item, idx) => (
              <div key={item.id || idx} className="py-5 first:pt-0 last:pb-0 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="text-sm sm:text-base font-bold text-slate-900">
                    {item.title}
                  </h4>
                  {item.klTerkait && (
                    <span className="text-xs text-slate-500 font-medium">
                      Pelaksana: {item.klTerkait}
                    </span>
                  )}
                </div>

                {/* 2 Clean Columns with Left Accent Borders (No nested colored cards) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-1">
                  <div className="border-l-2 border-amber-400 pl-4 space-y-1.5">
                    <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">
                      Kendala Pelaksanaan
                    </span>
                    <div className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-line">
                      {item.kendala}
                    </div>
                  </div>

                  <div className="border-l-2 border-blue-500 pl-4 space-y-1.5">
                    <span className="text-[11px] font-bold text-blue-950 uppercase tracking-wider block">
                      Tindak Lanjut
                    </span>
                    <div className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-line">
                      {item.tindakLanjut}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
