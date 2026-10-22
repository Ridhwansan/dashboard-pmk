'use client';

import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  TableProperties,
  CalendarRange,
  BarChart3,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { ProgramDetailData, KendalaDetailItem } from '@/data/programDetailData';
import {
  PILLAR_AGREGAT_DATA,
  AgregatIndicatorRow,
  getIndicatorAnnualRow,
  AVAILABLE_YEARS,
} from '@/data/pillarAgregatData';

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

/**
 * Robust parser for Indonesian formatted numbers in indicator metrics
 * Handles: "12.825" -> 12825, "70,3" -> 70.3, "867.480 (88,4%)" -> 867480, "80%" -> 80
 */
function parseMetricValue(val: string | null | undefined): number | null {
  if (!val || val === '—' || val.trim() === '') return null;
  // Strip notes in parentheses e.g. "(100%)" or "(Berproses)"
  const withoutParens = val.replace(/\(.*?\)/g, '').trim();
  const clean = withoutParens.replace(/[^0-9,.-]/g, '').trim();
  if (!clean) return null;

  let normalized = clean;
  if (normalized.includes('.') && normalized.includes(',')) {
    normalized = normalized.replace(/\./g, '').replace(',', '.');
  } else if (normalized.includes('.')) {
    const parts = normalized.split('.');
    if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3)) {
      normalized = normalized.replace(/\./g, '');
    }
  } else if (normalized.includes(',')) {
    normalized = normalized.replace(',', '.');
  }

  const num = parseFloat(normalized);
  return isNaN(num) ? null : num;
}

/**
 * Format metric value with unit if not already present
 */
function formatMetricWithUnit(val: string | undefined | null, unit: string): string {
  if (!val || val === '—' || val === '-') return '—';
  const trimmed = val.trim();
  if (
    trimmed.includes('%') ||
    trimmed.toLowerCase().includes(unit.toLowerCase()) ||
    isNaN(Number(trimmed.replace(/[^0-9]/g, '')))
  ) {
    return trimmed;
  }
  return `${trimmed} ${unit}`;
}

export const ProgramDetailPageView: React.FC<ProgramDetailPageViewProps> = ({
  program,
  onBack,
}) => {
  // Default view is 'tahunan' (2025–2029) as requested
  const [tableType, setTableType] = useState<'tahunan' | 'bulanan'>('tahunan');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(0); // 0 = Semua Bulan

  // Resolve annual row for this specific program (only this indicator appears in the annual table)
  const annualRowForProgram = useMemo(() => {
    return getIndicatorAnnualRow(program.id, program.pillarId);
  }, [program.id, program.pillarId]);

  // Fallback annual row if program is not hardcoded in agregat data
  const activeAnnualRow: AgregatIndicatorRow = useMemo(() => {
    if (annualRowForProgram) return annualRowForProgram;
    return {
      id: program.id,
      name: program.title,
      unit: program.unit,
      years: {
        2025: { target: '—', capaian: '—' },
        2026: { target: program.target2026, capaian: program.currentValue, percent: '75%' },
        2027: { target: '—', capaian: '—' },
        2028: { target: '—', capaian: '—' },
        2029: { target: '—', capaian: '—' },
      },
    };
  }, [annualRowForProgram, program]);

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

  // Dynamic resolution of kendala list
  const resolvedKendalaList: KendalaDetailItem[] = useMemo(() => {
    if (program.kendalaList && program.kendalaList.length > 0) {
      return program.kendalaList;
    }
    if (program.kendala || program.tindakLanjut) {
      const rawKendala = program.kendala || 'Tidak terdapat kendala operasional yang kritis saat ini.';
      const rawTindakLanjut =
        program.tindakLanjut ||
        'Koordinasi teknis rutin antar kementerian/lembaga terkait pengawasan realisasi program.';

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

  // =========================================================================
  // ANNUAL CHART CALCULATIONS (2025–2029)
  // =========================================================================
  const chartW = 900;
  const chartH = 260;
  const padL = 70;
  const padR = 40;
  const padT = 35;
  const padB = 45;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;

  const annualPoints = useMemo(() => {
    return AVAILABLE_YEARS.map((year) => {
      const metric = activeAnnualRow.years[year] || { target: '—', capaian: '—' };
      const tVal = parseMetricValue(metric.target);
      const cVal = parseMetricValue(metric.capaian);
      return {
        year,
        yearLabel: year === 2026 ? '2026 (Berjalan)' : `${year}`,
        targetFormatted: formatMetricWithUnit(metric.target, activeAnnualRow.unit),
        capaianFormatted: formatMetricWithUnit(metric.capaian, activeAnnualRow.unit),
        rawTarget: metric.target,
        rawCapaian: metric.capaian,
        targetNum: tVal,
        capaianNum: cVal,
        percent: metric.percent,
        isCutoff: year === 2026,
        isFuture: year > 2026,
      };
    });
  }, [activeAnnualRow]);

  const validAnnualTargets = useMemo(
    () => annualPoints.map((p) => p.targetNum).filter((v): v is number => v !== null),
    [annualPoints]
  );
  const validAnnualCapaian = useMemo(
    () => annualPoints.map((p) => p.capaianNum).filter((v): v is number => v !== null),
    [annualPoints]
  );
  const isNumericAnnual = validAnnualTargets.length > 0;

  const maxValAnnual = Math.max(...validAnnualTargets, ...validAnnualCapaian, 10);
  const yMaxAnnual = maxValAnnual * 1.18;

  const getXAnnual = (index: number) => padL + (index / (AVAILABLE_YEARS.length - 1)) * plotW;
  const getYAnnual = (val: number | null) => {
    if (val === null) return padT + plotH;
    const ratio = Math.min(1, Math.max(0, val / yMaxAnnual));
    return padT + plotH - ratio * plotH;
  };

  const targetAnnualPath = useMemo(() => {
    return annualPoints.reduce((acc, curr, i) => {
      if (curr.targetNum === null) return acc;
      const x = getXAnnual(i);
      const y = getYAnnual(curr.targetNum);
      return acc === '' ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');
  }, [annualPoints, yMaxAnnual]);

  const capaianAnnualPoints = useMemo(
    () => annualPoints.filter((p) => p.capaianNum !== null),
    [annualPoints]
  );

  const capaianAnnualPath = useMemo(() => {
    return capaianAnnualPoints.reduce((acc, curr) => {
      const i = annualPoints.findIndex((p) => p.year === curr.year);
      const x = getXAnnual(i);
      const y = getYAnnual(curr.capaianNum);
      return acc === '' ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');
  }, [capaianAnnualPoints, annualPoints, yMaxAnnual]);

  const capaianAnnualArea = useMemo(() => {
    if (capaianAnnualPoints.length === 0) return '';
    const firstIdx = annualPoints.findIndex((p) => p.year === capaianAnnualPoints[0].year);
    const lastIdx = annualPoints.findIndex(
      (p) => p.year === capaianAnnualPoints[capaianAnnualPoints.length - 1].year
    );
    const xStart = getXAnnual(firstIdx);
    const xEnd = getXAnnual(lastIdx);
    return `${capaianAnnualPath} L ${xEnd} ${padT + plotH} L ${xStart} ${padT + plotH} Z`;
  }, [capaianAnnualPoints, capaianAnnualPath, annualPoints]);

  // =========================================================================
  // MONTHLY CHART CALCULATIONS (Jan - Des)
  // =========================================================================
  const validMonthlyTargets = rawMonths.map((m) => m.target);
  const validMonthlyCapaian = rawMonths
    .map((m) => m.capaian)
    .filter((v): v is number => v !== null);
  const maxValMonthly = Math.max(...validMonthlyTargets, ...validMonthlyCapaian, 10);
  const yMaxMonthly = maxValMonthly * 1.15;

  const getXMonthly = (index: number) => padL + (index / (rawMonths.length - 1)) * plotW;
  const getYMonthly = (val: number | null) => {
    if (val === null) return padT + plotH;
    const ratio = Math.min(1, Math.max(0, val / yMaxMonthly));
    return padT + plotH - ratio * plotH;
  };

  const targetMonthlyPath = rawMonths.reduce((acc, curr, i) => {
    const x = getXMonthly(i);
    const y = getYMonthly(curr.target);
    return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const capaianMonthlyList = rawMonths.filter((m) => m.capaian !== null);
  const capaianMonthlyPath = capaianMonthlyList.reduce((acc, curr) => {
    const origIndex = rawMonths.findIndex((m) => m.month === curr.month);
    const x = getXMonthly(origIndex);
    const y = getYMonthly(curr.capaian);
    return acc === '' ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const capaianMonthlyArea =
    capaianMonthlyList.length > 0
      ? `${capaianMonthlyPath} L ${getXMonthly(
          rawMonths.findIndex((m) => m.month === capaianMonthlyList[capaianMonthlyList.length - 1].month)
        )} ${padT + plotH} L ${getXMonthly(0)} ${padT + plotH} Z`
      : '';

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-150">
      {/* 1. TOP BAR: Back Button & Context Breadcrumb */}
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

      {/* 2. PROGRAM OVERVIEW & 3 KPI STAT CARDS */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200/90 shadow-2xs">
              PKPN
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {program.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Pilar {program.pillarTitle} · Pelaksana: {program.picKementerian}
          </p>
        </div>

        {/* Factual description container */}
        <div className="bg-slate-50/90 rounded-2xl p-5 sm:p-6 border border-slate-200/80 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Deskripsi Program
            </span>
          </div>
          <p className="text-sm sm:text-base text-slate-800 font-medium leading-relaxed">
            {program.description}
          </p>
        </div>

        {/* 3-Metric Summary Strip */}
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

      {/* 3. SECTION TABEL: DEFAULT TAHUNAN (2025–2029) DENGAN SEGMENTED CONTROL KE BULANAN */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
        {/* Controls Toolbar: Filter on Left, Segmented Control on Right */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          {/* Left: Dynamic Context based on active table mode */}
          <div className="flex items-center gap-3 flex-wrap">
            {tableType === 'tahunan' ? (
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50/90 text-blue-900 border border-blue-200/80 text-xs sm:text-sm font-bold shadow-2xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                  Periode RPJMN 2025–2029
                </span>
                <span className="text-xs sm:text-sm font-semibold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80">
                  Indikator: <strong className="text-slate-900">{activeAnnualRow.name}</strong> ({activeAnnualRow.unit})
                </span>
              </div>
            ) : (
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
            )}
          </div>

          {/* Right: Segmented Control switching between Tabel Tahunan (Default) and Tabel Bulanan */}
          <div className="h-[44px] p-1 bg-slate-100 rounded-xl border border-slate-200/90 inline-flex items-center gap-1.5 self-start lg:self-auto shrink-0 shadow-2xs">
            <button
              type="button"
              onClick={() => setTableType('tahunan')}
              className={`h-[36px] inline-flex items-center gap-2 px-4 sm:px-5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                tableType === 'tahunan'
                  ? 'bg-white text-slate-900 shadow-2xs font-extrabold border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <CalendarRange className="w-4.5 h-4.5 text-blue-600" />
              <span>Tabel Tahunan</span>
            </button>

            <button
              type="button"
              onClick={() => setTableType('bulanan')}
              className={`h-[36px] inline-flex items-center gap-2 px-4 sm:px-5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                tableType === 'bulanan'
                  ? 'bg-white text-slate-900 shadow-2xs font-extrabold border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <TableProperties className="w-4.5 h-4.5 text-blue-600" />
              <span>Tabel Bulanan</span>
            </button>
          </div>
        </div>

        {/* VIEW A: TABEL TAHUNAN (2025–2029) - 1 Indikator Terpilih dengan Kolom Target & Capaian Mandiri */}
        {tableType === 'tahunan' && (
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="bg-slate-100/90 text-slate-900 font-bold border-b border-slate-200">
                    <th className="py-3.5 px-4 min-w-[160px]">Tahun</th>
                    <th className="py-3.5 px-4 text-right min-w-[140px]">Target (T)</th>
                    <th className="py-3.5 px-4 text-right min-w-[140px] bg-blue-50/70 border-x border-blue-100 text-blue-950 font-extrabold">
                      Capaian (C)
                    </th>
                    <th className="py-3.5 px-4 text-center min-w-[150px]">Persentase Capaian</th>
                    <th className="py-3.5 px-4 min-w-[220px]">Catatan Pelaksanaan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {AVAILABLE_YEARS.map((yr) => {
                    const metric = activeAnnualRow.years[yr] || { target: '—', capaian: '—' };
                    const isCutoff = yr === 2026;
                    const isPast = yr === 2025;
                    const isFuture = yr > 2026;
                    const hasCapaian = metric.capaian && metric.capaian !== '—';

                    // Percentage calculation
                    let pctVal: number | null = null;
                    if (metric.percent) {
                      const parsed = parseFloat(metric.percent.replace(/[^0-9,.-]/g, '').replace(',', '.'));
                      if (!isNaN(parsed)) pctVal = parsed;
                    } else if (hasCapaian) {
                      const tNum = parseMetricValue(metric.target);
                      const cNum = parseMetricValue(metric.capaian);
                      if (tNum && cNum && tNum > 0) {
                        pctVal = Math.round((cNum / tNum) * 100);
                      }
                    }

                    // Execution note
                    let note = '';
                    if (isPast) {
                      note = hasCapaian
                        ? `Laporan tahunan terverifikasi${metric.percent ? ' (' + metric.percent + ')' : ''}`
                        : 'Realisasi tercatat';
                    } else if (isCutoff) {
                      note = 'Posisi per 18 Oktober 2026 (Sedang berjalan)';
                    } else {
                      note = yr === 2029 ? 'Target akhir periode RPJMN 2025–2029' : `Proyeksi target RPJMN tahun ${yr}`;
                    }

                    return (
                      <tr
                        key={yr}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isCutoff ? 'bg-amber-50/40 font-semibold' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4 text-slate-900 font-bold">
                          Tahun {yr}
                          {isCutoff && (
                            <span className="block text-[11px] text-amber-700 font-normal">
                              (Posisi Berjalan Saat Ini)
                            </span>
                          )}
                          {isPast && (
                            <span className="block text-[11px] text-slate-500 font-normal">
                              (Historis)
                            </span>
                          )}
                          {isFuture && (
                            <span className="block text-[11px] text-slate-400 font-normal">
                              (Target Rencana)
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right text-slate-700 tabular-nums">
                          {formatMetricWithUnit(metric.target, activeAnnualRow.unit)}
                        </td>

                        <td className="py-3.5 px-4 text-right tabular-nums font-bold text-slate-950 bg-blue-50/30 border-x border-blue-100/70">
                          {formatMetricWithUnit(metric.capaian, activeAnnualRow.unit)}
                        </td>

                        <td className="py-3.5 px-4 text-center tabular-nums">
                          {hasCapaian && pctVal !== null ? (
                            <span
                              className={`font-bold ${
                                pctVal >= 95
                                  ? 'text-emerald-700'
                                  : pctVal >= 75
                                  ? 'text-blue-700'
                                  : 'text-amber-700'
                              }`}
                            >
                              {pctVal}%
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 text-xs">
                          {note}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW B: TABEL BULANAN */}
        {tableType === 'bulanan' && (
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
      </div>

      {/* 4. DEDICATED VISUALISASI GRAFIK SECTION BELOW TABLE */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 shadow-2xs shrink-0">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                {tableType === 'tahunan'
                  ? 'Visualisasi Trajektori Tahunan (2025–2029)'
                  : `Visualisasi Trajektori Bulanan (Tahun ${selectedYear})`}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                {tableType === 'tahunan'
                  ? `Perbandingan Target (T) vs Capaian (C) RPJMN 2025–2029 · ${activeAnnualRow.name}`
                  : `Tren Kumulatif Target (T) vs Capaian (C) 12 Bulan · ${program.title}`}
              </p>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200/80 text-xs font-bold self-start sm:self-auto shadow-2xs">
            <span className="flex items-center gap-2 text-blue-700">
              <span className="w-4 h-0.5 border-t-2 border-dashed border-blue-600 inline-block" />
              <span>Target (T)</span>
            </span>
            <span className="flex items-center gap-2 text-emerald-700">
              <span className="w-4 h-1 bg-emerald-600 inline-block rounded-full" />
              <span>Capaian (C)</span>
            </span>
          </div>
        </div>

        {/* GRAPH VIEW 1: ANNUAL TRAJECTORY (2025–2029) */}
        {tableType === 'tahunan' && (
          <div className="space-y-6">
            {isNumericAnnual ? (
              <div className="w-full overflow-x-auto custom-scrollbar border border-slate-200 rounded-2xl p-4 sm:p-5 bg-white shadow-2xs">
                <svg
                  viewBox={`0 0 ${chartW} ${chartH}`}
                  className="w-full h-64 min-w-[680px] overflow-visible"
                >
                  <defs>
                    <linearGradient id="capaianAnnualGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((r, idx) => {
                    const y = padT + plotH - r * plotH;
                    const val = (r * yMaxAnnual).toLocaleString('id-ID', { maximumFractionDigits: 1 });
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
                          x={padL - 10}
                          y={y + 3}
                          textAnchor="end"
                          className="text-[10px] fill-slate-400 font-mono"
                        >
                          {val}
                        </text>
                      </g>
                    );
                  })}

                  {/* Capaian Area (Recorded Years 2025 - 2026) */}
                  {capaianAnnualArea && <path d={capaianAnnualArea} fill="url(#capaianAnnualGrad)" />}

                  {/* Target Dashed Line (2025 - 2029) */}
                  {targetAnnualPath && (
                    <path
                      d={targetAnnualPath}
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="2.5"
                      strokeDasharray="6 6"
                    />
                  )}

                  {/* Capaian Solid Line (2025 - 2026) */}
                  {capaianAnnualPath && (
                    <path
                      d={capaianAnnualPath}
                      fill="none"
                      stroke="#059669"
                      strokeWidth="3.5"
                    />
                  )}

                  {/* Interactive Points on Years 2025 - 2029 */}
                  {annualPoints.map((pt, idx) => {
                    const x = getXAnnual(idx);
                    const yT = pt.targetNum !== null ? getYAnnual(pt.targetNum) : null;
                    const yC = pt.capaianNum !== null ? getYAnnual(pt.capaianNum) : null;

                    return (
                      <g key={pt.year}>
                        {/* Target Point */}
                        {yT !== null && (
                          <g>
                            <circle cx={x} cy={yT} r="4.5" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
                            {/* Target label value */}
                            <text
                              x={x}
                              y={yT - 10}
                              textAnchor="middle"
                              className="text-[10px] font-bold fill-blue-700 font-mono"
                            >
                              T: {pt.targetFormatted}
                            </text>
                          </g>
                        )}

                        {/* Capaian Point */}
                        {yC !== null && (
                          <g>
                            <circle
                              cx={x}
                              cy={yC}
                              r="5.5"
                              fill="#059669"
                              stroke="#ffffff"
                              strokeWidth="2.5"
                            />
                            {/* Capaian label value */}
                            <text
                              x={x}
                              y={yC + 16}
                              textAnchor="middle"
                              className="text-[10px] font-extrabold fill-emerald-800 font-mono"
                            >
                              C: {pt.capaianFormatted}
                            </text>
                          </g>
                        )}

                        {/* X-Axis Year Labels */}
                        <text
                          x={x}
                          y={chartH - 12}
                          textAnchor="middle"
                          className={`text-xs font-bold ${
                            pt.isCutoff ? 'fill-blue-900 font-extrabold' : 'fill-slate-600'
                          }`}
                        >
                          {pt.yearLabel}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            ) : (
              // Milestone / Tahapan View for Qualitative Programs (e.g. Studio Guru)
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3.5">
                {annualPoints.map((pt) => (
                  <div
                    key={pt.year}
                    className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/80 space-y-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-900">
                        Tahun {pt.year}
                      </span>
                      {pt.year === 2026 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-600 text-white">
                          Berjalan
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Target
                      </span>
                      <div className="text-xs font-bold text-slate-800">{pt.targetFormatted}</div>
                    </div>
                    <div className="space-y-1 pt-1 border-t border-slate-200/70">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Capaian
                      </span>
                      <div
                        className={`text-xs font-extrabold ${
                          pt.capaianFormatted !== '—' ? 'text-emerald-700' : 'text-slate-400'
                        }`}
                      >
                        {pt.capaianFormatted}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 5 Annual Metric Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
              {annualPoints.map((pt) => (
                <div
                  key={pt.year}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    pt.year === 2026
                      ? 'bg-blue-50/80 border-blue-200 ring-2 ring-blue-500/20'
                      : 'bg-slate-50/80 border-slate-200/80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-xs font-extrabold text-slate-900">
                      Tahun {pt.year}
                    </span>
                    {pt.year === 2026 ? (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-600 text-white">
                        Berjalan
                      </span>
                    ) : pt.year === 2025 ? (
                      <span className="text-[9px] font-semibold text-slate-500">
                        Historis
                      </span>
                    ) : (
                      <span className="text-[9px] font-semibold text-slate-400">
                        Rencana
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="text-slate-600 flex justify-between gap-1">
                      <span className="font-semibold text-slate-500">Target (T):</span>
                      <span className="font-bold text-slate-800 truncate">{pt.targetFormatted}</span>
                    </div>
                    <div className="text-slate-600 flex justify-between gap-1">
                      <span className="font-semibold text-slate-500">Capaian (C):</span>
                      <span
                        className={`font-extrabold truncate ${
                          pt.capaianFormatted !== '—' ? 'text-emerald-700' : 'text-slate-400'
                        }`}
                      >
                        {pt.capaianFormatted}
                      </span>
                    </div>
                    {pt.percent && (
                      <div className="pt-1 mt-1 border-t border-slate-200/60 flex justify-between text-[11px]">
                        <span className="text-slate-500 font-medium">Persentase:</span>
                        <span className="font-extrabold text-blue-900">{pt.percent}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GRAPH VIEW 2: MONTHLY TRAJECTORY (Jan - Des) */}
        {tableType === 'bulanan' && (
          <div className="space-y-4">
            <div className="w-full overflow-x-auto custom-scrollbar border border-slate-200 rounded-2xl p-4 bg-white shadow-2xs">
              <svg
                viewBox={`0 0 ${chartW} ${chartH}`}
                className="w-full h-64 min-w-[650px] overflow-visible"
              >
                <defs>
                  <linearGradient id="capaianGradPageMonthly" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((r, idx) => {
                  const y = padT + plotH - r * plotH;
                  const val = (r * yMaxMonthly).toLocaleString('id-ID', { maximumFractionDigits: 0 });
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
                {capaianMonthlyArea && <path d={capaianMonthlyArea} fill="url(#capaianGradPageMonthly)" />}

                {/* Target Dashed Line */}
                <path
                  d={targetMonthlyPath}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                  strokeDasharray="5 5"
                />

                {/* Capaian Solid Line */}
                {capaianMonthlyPath && (
                  <path
                    d={capaianMonthlyPath}
                    fill="none"
                    stroke="#059669"
                    strokeWidth="3"
                  />
                )}

                {/* Points on Months */}
                {rawMonths.map((m, idx) => {
                  const x = getXMonthly(idx);
                  const yT = getYMonthly(m.target);
                  const yC = m.capaian !== null ? getYMonthly(m.capaian) : null;

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

      {/* 5. KENDALA PELAKSANAAN & TINDAK LANJUT */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
            <AlertCircle className="w-4.5 h-4.5" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Kendala Pelaksanaan &amp; Tindak Lanjut
          </h3>
        </div>

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

                {/* 2 Clean Columns with Left Accent Borders */}
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
