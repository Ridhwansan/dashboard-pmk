'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
  category?: string;
  initialSection?: 'overview' | 'kendala';
  highlightKendalaId?: string | number;
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
  if (!val || val === '—' || val === '-' || val.trim() === '') return null;
  // Strip notes in parentheses e.g. "(100%)" or "(Berproses)"
  const withoutParens = val.replace(/\(.*?\)/g, '').trim();

  // If the string contains qualitative words (e.g. "Peluncuran", "Operasional", "Penyiapan", "Uji Coba")
  if (/[a-zA-Z]{3,}/.test(withoutParens.replace(/^(unit|satdik|orang|jiwa|persen|poin)/i, '').trim())) {
    return null;
  }

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
  if (!unit || unit.trim() === '') return trimmed;
  if (
    trimmed.includes('%') ||
    trimmed.toLowerCase().includes(unit.toLowerCase()) ||
    /[a-zA-Z]{3,}/.test(trimmed.replace(/^(unit|satdik|orang|jiwa|persen|poin)/i, '').trim())
  ) {
    return trimmed;
  }
  return `${trimmed} ${unit}`;
}

/**
 * Builds a smooth cubic bezier SVG path string from an array of coordinates
 */
function buildSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  if (points.length === 2) {
    return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)} L ${points[1].x.toFixed(1)} ${points[1].y.toFixed(1)}`;
  }

  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

export const ProgramDetailPageView: React.FC<ProgramDetailPageViewProps> = ({
  program,
  onBack,
  category = 'PKPN',
  initialSection,
  highlightKendalaId,
}) => {
  // Auto-scroll to kendala section if requested from Kendala list tab
  useEffect(() => {
    if (initialSection === 'kendala') {
      const timer = setTimeout(() => {
        const el = document.getElementById('kendala-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [initialSection]);

  // Default view is 'tahunan' (2025–2029) as requested
  const [tableType, setTableType] = useState<'tahunan' | 'bulanan'>('tahunan');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(0); // 0 = Semua Bulan
  const [hoveredAnnualIdx, setHoveredAnnualIdx] = useState<number | null>(null);
  const [hoveredMonthlyIdx, setHoveredMonthlyIdx] = useState<number | null>(null);

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
    const latestActiveMonth =
      rawMonths
        .filter((m) => m.capaian !== null && (m.capaianFormatted !== '' && m.capaianFormatted !== '—'))
        .slice(-1)[0] ||
      rawMonths.filter((m) => m.capaian !== null).slice(-1)[0] ||
      rawMonths[0];

    const targetVal = latestActiveMonth?.target || 0;
    const capaianVal = latestActiveMonth?.capaian || 0;
    let pct = 0;
    if (latestActiveMonth?.percentage) {
      pct = latestActiveMonth.percentage;
    } else if (latestActiveMonth?.percentageFormatted) {
      const parsed = parseFloat(
        latestActiveMonth.percentageFormatted.replace(/[^0-9,.-]/g, '').replace(',', '.')
      );
      if (!isNaN(parsed)) pct = parsed;
    } else if (targetVal > 0) {
      pct = Math.round((capaianVal / targetVal) * 100);
    }

    return {
      totalTarget: targetVal,
      totalCapaian: capaianVal,
      avgPct: pct,
    };
  }, [rawMonths]);

  // Dynamic resolution of kendala list
  const resolvedKendalaList: KendalaDetailItem[] = useMemo(() => {
    if (program.kendalaList !== undefined) {
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
    const pts = annualPoints
      .map((p, idx) => ({ x: getXAnnual(idx), y: p.targetNum !== null ? getYAnnual(p.targetNum) : null }))
      .filter((p): p is { x: number; y: number } => p.y !== null);
    return buildSmoothPath(pts);
  }, [annualPoints, yMaxAnnual]);

  const capaianAnnualPoints = useMemo(
    () => annualPoints.filter((p) => p.capaianNum !== null),
    [annualPoints]
  );

  const capaianAnnualPath = useMemo(() => {
    const pts = capaianAnnualPoints.map((p) => {
      const idx = annualPoints.findIndex((ap) => ap.year === p.year);
      return { x: getXAnnual(idx), y: getYAnnual(p.capaianNum) };
    });
    return buildSmoothPath(pts);
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
  const validMonthlyTargets = useMemo(() => {
    return rawMonths
      .filter((m) => m.target > 0 && m.targetFormatted !== '' && m.targetFormatted !== '—')
      .map((m) => m.target);
  }, [rawMonths]);

  const validMonthlyCapaian = useMemo(() => {
    return rawMonths
      .filter((m) => m.capaian !== null && m.capaianFormatted !== '' && m.capaianFormatted !== '—')
      .map((m) => m.capaian as number);
  }, [rawMonths]);

  const maxValMonthly = Math.max(...validMonthlyTargets, ...validMonthlyCapaian, 10);
  const yMaxMonthly = maxValMonthly * 1.15;

  const getXMonthly = (index: number) => padL + (index / (rawMonths.length - 1)) * plotW;
  const getYMonthly = (val: number | null) => {
    if (val === null) return padT + plotH;
    const ratio = Math.min(1, Math.max(0, val / yMaxMonthly));
    return padT + plotH - ratio * plotH;
  };

  const targetMonthlyList = useMemo(() => {
    return rawMonths.filter(
      (m) => m.target > 0 && m.targetFormatted !== '' && m.targetFormatted !== '—'
    );
  }, [rawMonths]);

  const targetMonthlyPath = useMemo(() => {
    if (targetMonthlyList.length < 2) return '';
    const pts = targetMonthlyList.map((m) => {
      const idx = rawMonths.findIndex((rm) => rm.month === m.month);
      return { x: getXMonthly(idx), y: getYMonthly(m.target) };
    });
    return buildSmoothPath(pts);
  }, [targetMonthlyList, rawMonths, yMaxMonthly]);

  const capaianMonthlyList = useMemo(() => {
    return rawMonths.filter(
      (m) => m.capaian !== null && m.capaianFormatted !== '' && m.capaianFormatted !== '—'
    );
  }, [rawMonths]);

  const capaianMonthlyPath = useMemo(() => {
    if (capaianMonthlyList.length < 2) return '';
    const pts = capaianMonthlyList.map((m) => {
      const idx = rawMonths.findIndex((rm) => rm.month === m.month);
      return { x: getXMonthly(idx), y: getYMonthly(m.capaian) };
    });
    return buildSmoothPath(pts);
  }, [capaianMonthlyList, rawMonths, yMaxMonthly]);

  const capaianMonthlyArea = useMemo(() => {
    if (capaianMonthlyList.length < 2 || !capaianMonthlyPath) return '';
    const firstIdx = rawMonths.findIndex((m) => m.month === capaianMonthlyList[0].month);
    const lastIdx = rawMonths.findIndex(
      (m) => m.month === capaianMonthlyList[capaianMonthlyList.length - 1].month
    );
    const xStart = getXMonthly(firstIdx);
    const xEnd = getXMonthly(lastIdx);
    return `${capaianMonthlyPath} L ${xEnd} ${padT + plotH} L ${xStart} ${padT + plotH} Z`;
  }, [capaianMonthlyList, capaianMonthlyPath, rawMonths]);

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
          <span>Pilar {category === 'PKPN' ? `PKPN ${program.pillarTitle}` : program.pillarTitle}</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-bold truncate max-w-[280px]">{program.title}</span>
        </div>
      </div>

      {/* 2. PROGRAM OVERVIEW & 3 FOCUSED KPI STAT CARDS (Gambar 4) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200/90 shadow-2xs">
              {category || 'PKPN'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {program.title}
          </h1>
          {/* Program explanation directly below the title, without gray box or "Deskripsi Program" label */}
          <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed max-w-4xl">
            {program.description}
          </p>
        </div>

        {/* 3 Prominent KPI Stat Cards for Focus */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Card 1: Target 2026 */}
          <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 space-y-2 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Target 2026
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 block tracking-tight">
              {program.target2026}
            </span>
          </div>

          {/* Card 2: Realisasi Berjalan */}
          <div className="bg-blue-50/40 rounded-2xl p-5 border border-blue-200/70 space-y-2 shadow-2xs">
            <span className="text-[11px] font-bold text-blue-900/70 uppercase tracking-wider block">
              Realisasi Berjalan
            </span>
            <span className="text-xl sm:text-2xl font-black text-blue-900 block tracking-tight">
              {program.currentValue === '—' || !program.currentValue
                ? '—'
                : `${program.currentValue} ${program.unit}`}
            </span>
          </div>

          {/* Card 3: Persentase Capaian */}
          <div className="bg-emerald-50/40 rounded-2xl p-5 border border-emerald-200/70 space-y-2 shadow-2xs">
            <span className="text-[11px] font-bold text-emerald-900/70 uppercase tracking-wider block">
              Persentase Capaian
            </span>
            <span className="text-xl sm:text-2xl font-black text-emerald-700 block tracking-tight">
              {summaryMetrics.avgPct > 0
                ? `${summaryMetrics.avgPct}%`
                : program.status.includes('%')
                ? program.status
                : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. SECTION TABEL: DEFAULT TAHUNAN (2025–2029) DENGAN SEGMENTED CONTROL KE BULANAN */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
        {/* Controls Toolbar: Title on Left, Segmented Control on Right */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          {/* Left: Dynamic Title based on active table mode */}
          <div className="flex items-center gap-4 flex-wrap">
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              {tableType === 'tahunan' ? 'Tabel Tahunan' : 'Tabel Bulanan'}
            </h3>

            {/* When bulanan, show year & month filters */}
            {tableType === 'bulanan' && (
              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Filter Tahun */}
                <div className="relative">
                  <select
                    id="filter-tahun-page"
                    aria-label="Pilih Tahun"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="h-[38px] appearance-none pl-3.5 pr-9 text-xs sm:text-sm font-bold bg-slate-50 hover:bg-white text-slate-900 border border-slate-200/90 hover:border-slate-300 rounded-xl cursor-pointer shadow-2xs transition-all focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  >
                    <option value={2026}>Tahun 2026 (Berjalan)</option>
                    <option value={2025}>Tahun 2025 (Historis)</option>
                    <option value={2027}>Tahun 2027 (Rencana)</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>

                {/* Filter Bulan */}
                <div className="relative">
                  <select
                    id="filter-bulan-page"
                    aria-label="Pilih Bulan"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="h-[38px] appearance-none pl-3.5 pr-9 text-xs sm:text-sm font-bold bg-slate-50 hover:bg-white text-slate-900 border border-slate-200/90 hover:border-slate-300 rounded-xl cursor-pointer shadow-2xs transition-all focus:ring-2 focus:ring-blue-600 focus:bg-white"
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
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
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
                        className={`group relative hover:bg-blue-50/50 transition-colors ${
                          isCutoff ? 'bg-amber-50/40 font-semibold' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4 text-slate-900 font-bold relative">
                          <div className="flex items-center gap-2">
                            <span>Tahun {yr}</span>
                            {/* Hover Micro Tooltip on Row */}
                            <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-150 absolute left-36 top-1/2 -translate-y-1/2 z-30 whitespace-nowrap">
                              <div className="bg-slate-900/95 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg shadow-xl flex items-center gap-2 border border-slate-700/80">
                                <span>Target: <strong className="text-blue-300 font-bold">{formatMetricWithUnit(metric.target, activeAnnualRow.unit)}</strong></span>
                                <span className="text-slate-500">·</span>
                                <span>Capaian: <strong className="text-emerald-300 font-bold">{formatMetricWithUnit(metric.capaian, activeAnnualRow.unit)}</strong></span>
                                {pctVal !== null && (
                                  <>
                                    <span className="text-slate-500">·</span>
                                    <span className="text-amber-300 font-extrabold">({pctVal}%)</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {displayedMonths.map((m) => {
                    const isCutoff = selectedYear === 2026 && m.month === 10;
                    return (
                      <tr
                        key={m.month}
                        className={`group relative hover:bg-blue-50/50 transition-colors ${
                          isCutoff ? 'bg-amber-50/40 font-semibold' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4 text-slate-900 font-bold relative">
                          <div className="flex items-center gap-2">
                            <span>{m.monthName} {selectedYear}</span>
                            {/* Hover Micro Tooltip on Monthly Row */}
                            {(m.targetFormatted !== '' || (m.capaianFormatted !== '' && m.capaianFormatted !== '—')) && (
                              <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-150 absolute left-40 top-1/2 -translate-y-1/2 z-30 whitespace-nowrap">
                                <div className="bg-slate-900/95 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg shadow-xl flex items-center gap-2 border border-slate-700/80">
                                  {m.targetFormatted && (
                                    <span>Target: <strong className="text-blue-300 font-bold">{m.targetFormatted}</strong></span>
                                  )}
                                  {m.targetFormatted && m.capaianFormatted && m.capaianFormatted !== '—' && (
                                    <span className="text-slate-500">·</span>
                                  )}
                                  {m.capaianFormatted && m.capaianFormatted !== '—' && (
                                    <span>Capaian: <strong className="text-emerald-300 font-bold">{m.capaianFormatted}</strong></span>
                                  )}
                                  {m.percentageFormatted && m.percentageFormatted !== '—' && m.percentageFormatted !== '' ? (
                                    <>
                                      <span className="text-slate-500">·</span>
                                      <span className="text-amber-300 font-extrabold">({m.percentageFormatted})</span>
                                    </>
                                  ) : m.percentage !== undefined && m.capaian !== null ? (
                                    <>
                                      <span className="text-slate-500">·</span>
                                      <span className="text-amber-300 font-extrabold">({m.percentage}%)</span>
                                    </>
                                  ) : null}
                                </div>
                              </div>
                            )}
                          </div>
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
                          {m.capaianFormatted === '—' ? (
                            <span className="text-slate-300 font-normal">—</span>
                          ) : (
                            m.capaianFormatted
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center tabular-nums">
                          {m.percentageFormatted !== undefined ? (
                            m.percentageFormatted === '—' ? (
                              <span className="text-slate-300">—</span>
                            ) : m.percentageFormatted === '' ? (
                              ''
                            ) : (
                              <span className="font-bold text-amber-700">{m.percentageFormatted}</span>
                            )
                          ) : m.percentage !== undefined && m.capaian !== null ? (
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
                Visualisasi
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
              <>
                <div className="relative w-full overflow-x-auto custom-scrollbar border border-slate-200/90 rounded-2xl p-4 sm:p-5 bg-gradient-to-b from-white to-slate-50/50 shadow-2xs">
                {/* Floating Interactive Tooltip */}
                {hoveredAnnualIdx !== null && annualPoints[hoveredAnnualIdx] && (() => {
                  const pt = annualPoints[hoveredAnnualIdx];
                  const colX = getXAnnual(hoveredAnnualIdx);
                  const leftPct = (colX / chartW) * 100;
                  return (
                    <div
                      className="pointer-events-none absolute z-20 top-3 -translate-x-1/2 transition-all duration-150 ease-out"
                      style={{ left: `${Math.max(16, Math.min(84, leftPct))}%` }}
                    >
                      <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-xl px-3.5 py-2.5 shadow-xl border border-slate-700/80 min-w-[210px] space-y-1.5">
                        <div className="flex items-center justify-between gap-3 border-b border-slate-700/70 pb-1.5">
                          <span className="font-bold text-white text-xs">
                            Tahun {pt.year}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              pt.year === 2026
                                ? 'bg-blue-600 text-white'
                                : pt.year === 2025
                                ? 'bg-slate-700 text-slate-200'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {pt.year === 2026 ? 'Berjalan' : pt.year === 2025 ? 'Historis' : 'Rencana'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-[10px] font-semibold text-blue-300 block">Target (T)</span>
                            <span className="font-bold text-white">{pt.targetFormatted}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-semibold text-emerald-300 block">Capaian (C)</span>
                            <span className="font-bold text-emerald-400">{pt.capaianFormatted}</span>
                          </div>
                        </div>
                        {pt.percent && (
                          <div className="pt-1 border-t border-slate-800 flex items-center justify-between text-[11px]">
                            <span className="text-slate-400">Persentase Capaian:</span>
                            <span className="font-extrabold text-amber-300">{pt.percent}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                <svg
                  viewBox={`0 0 ${chartW} ${chartH}`}
                  className="w-full h-64 min-w-[680px] overflow-visible"
                >
                  <defs>
                    <linearGradient id="capaianAnnualGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                    <filter id="capaianGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#10b981" floodOpacity="0.3" />
                    </filter>
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

                  {/* Vertical Guideline on Hover */}
                  {hoveredAnnualIdx !== null && (
                    <line
                      x1={getXAnnual(hoveredAnnualIdx)}
                      y1={padT}
                      x2={getXAnnual(hoveredAnnualIdx)}
                      y2={chartH - padB}
                      stroke="#3b82f6"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                      opacity="0.8"
                    />
                  )}

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
                      filter="url(#capaianGlow)"
                    />
                  )}

                  {/* Interactive Points on Years 2025 - 2029 */}
                  {annualPoints.map((pt, idx) => {
                    const x = getXAnnual(idx);
                    const yT = pt.targetNum !== null ? getYAnnual(pt.targetNum) : null;
                    const yC = pt.capaianNum !== null ? getYAnnual(pt.capaianNum) : null;
                    const isHovered = hoveredAnnualIdx === idx;

                    return (
                      <g key={pt.year}>
                        {/* Target Point */}
                        {yT !== null && (
                          <g>
                            {isHovered && (
                              <circle cx={x} cy={yT} r="10" fill="rgba(37, 99, 235, 0.25)" />
                            )}
                            <circle cx={x} cy={yT} r={isHovered ? "5.5" : "4.5"} fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
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
                            {isHovered && (
                              <circle cx={x} cy={yC} r="12" fill="rgba(16, 185, 129, 0.3)" />
                            )}
                            <circle
                              cx={x}
                              cy={yC}
                              r={isHovered ? "6.5" : "5.5"}
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
                            isHovered
                              ? 'fill-blue-600 font-black'
                              : pt.isCutoff
                              ? 'fill-blue-900 font-extrabold'
                              : 'fill-slate-600'
                          }`}
                        >
                          {pt.yearLabel}
                        </text>
                      </g>
                    );
                  })}

                  {/* Invisible Hitbox Triggers for Hover */}
                  {annualPoints.map((pt, idx) => {
                    const x = getXAnnual(idx);
                    const colW = plotW / (annualPoints.length - 1);
                    return (
                      <rect
                        key={`hitbox-annual-${idx}`}
                        x={x - colW / 2}
                        y={padT - 10}
                        width={colW}
                        height={plotH + 20}
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredAnnualIdx(idx)}
                        onMouseLeave={() => setHoveredAnnualIdx(null)}
                      />
                    );
                  })}
                </svg>
              </div>

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
            </>
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
        </div>
      )}

        {/* GRAPH VIEW 2: MONTHLY TRAJECTORY (Jan - Des) */}
        {tableType === 'bulanan' && (
          <div className="space-y-4">
            {validMonthlyCapaian.length > 0 || validMonthlyTargets.length > 0 ? (
              <div className="relative w-full overflow-x-auto custom-scrollbar border border-slate-200/90 rounded-2xl p-4 sm:p-5 bg-gradient-to-b from-white to-slate-50/50 shadow-2xs">
              {/* Floating Interactive Tooltip */}
              {hoveredMonthlyIdx !== null && rawMonths[hoveredMonthlyIdx] && (() => {
                const m = rawMonths[hoveredMonthlyIdx];
                const colX = getXMonthly(hoveredMonthlyIdx);
                const leftPct = (colX / chartW) * 100;
                const hasCapaian = m.capaian !== null && m.capaianFormatted !== '' && m.capaianFormatted !== '—';
                const hasTarget = m.target > 0 && m.targetFormatted !== '' && m.targetFormatted !== '—';
                const capaianVal = m.capaian;
                const pct =
                  m.percentageFormatted && m.percentageFormatted !== '—' && m.percentageFormatted !== ''
                    ? m.percentageFormatted
                    : hasCapaian && m.target > 0
                    ? `${Math.round(((capaianVal as number) / m.target) * 100)}%`
                    : null;
                const targetText = hasTarget
                  ? m.targetFormatted
                  : m.targetFormatted === '—'
                  ? '—'
                  : '—';
                const capaianText = hasCapaian
                  ? m.capaianFormatted
                  : m.capaianFormatted === '—'
                  ? '—'
                  : 'Belum ada data';

                return (
                  <div
                    className="pointer-events-none absolute z-20 top-3 -translate-x-1/2 transition-all duration-150 ease-out"
                    style={{ left: `${Math.max(16, Math.min(84, leftPct))}%` }}
                  >
                    <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-xl px-3.5 py-2.5 shadow-xl border border-slate-700/80 min-w-[210px] space-y-1.5">
                      <div className="flex items-center justify-between gap-3 border-b border-slate-700/70 pb-1.5">
                        <span className="font-bold text-white text-xs">
                          {MONTH_SHORT[hoveredMonthlyIdx]} {selectedYear}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            hasCapaian
                              ? 'bg-emerald-600 text-white'
                              : hasTarget
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {hasCapaian ? 'Terealisasi' : hasTarget ? 'Target Akhir Tahun' : 'Belum Ada Data'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] font-semibold text-blue-300 block">Target (T)</span>
                          <span className="font-bold text-white">{targetText}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-semibold text-emerald-300 block">Capaian (C)</span>
                          <span className="font-bold text-emerald-400">{capaianText}</span>
                        </div>
                      </div>
                      {pct !== null && (
                        <div className="pt-1 border-t border-slate-800 flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Persentase Capaian:</span>
                          <span className="font-extrabold text-amber-300">
                            {pct.endsWith('%') ? pct : `${pct}%`}
                          </span>
                        </div>
                      )}
                      {m.note && (
                        <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                          {m.note}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              <svg
                viewBox={`0 0 ${chartW} ${chartH}`}
                className="w-full h-64 min-w-[650px] overflow-visible"
              >
                <defs>
                  <linearGradient id="capaianGradPageMonthly" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                  <filter id="capaianGlowMonthly" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#10b981" floodOpacity="0.3" />
                  </filter>
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

                {/* Vertical Guideline on Hover */}
                {hoveredMonthlyIdx !== null && (
                  <line
                    x1={getXMonthly(hoveredMonthlyIdx)}
                    y1={padT}
                    x2={getXMonthly(hoveredMonthlyIdx)}
                    y2={chartH - padB}
                    stroke="#3b82f6"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    opacity="0.8"
                  />
                )}

                {/* Capaian Area (only if >= 2 points) */}
                {capaianMonthlyArea && <path d={capaianMonthlyArea} fill="url(#capaianGradPageMonthly)" />}

                {/* Target Dashed Line (only if >= 2 points) */}
                {targetMonthlyPath && (
                  <path
                    d={targetMonthlyPath}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2.5"
                    strokeDasharray="5 5"
                  />
                )}

                {/* Capaian Solid Line (only if >= 2 points) */}
                {capaianMonthlyPath && (
                  <path
                    d={capaianMonthlyPath}
                    fill="none"
                    stroke="#059669"
                    strokeWidth="3.5"
                    filter="url(#capaianGlowMonthly)"
                  />
                )}

                {/* Points on Months */}
                {rawMonths.map((m, idx) => {
                  const x = getXMonthly(idx);
                  const hasTarget = m.target > 0 && m.targetFormatted !== '' && m.targetFormatted !== '—';
                  const hasCapaian = m.capaian !== null && m.capaianFormatted !== '' && m.capaianFormatted !== '—';
                  const yT = hasTarget ? getYMonthly(m.target) : null;
                  const yC = hasCapaian ? getYMonthly(m.capaian) : null;
                  const isHovered = hoveredMonthlyIdx === idx;
                  const isSingleCapaian = capaianMonthlyList.length === 1;
                  const isSingleTarget = targetMonthlyList.length === 1;

                  return (
                    <g key={m.month}>
                      {/* Target Point: rendered ONLY when target is reported for this month */}
                      {hasTarget && yT !== null && (
                        <g>
                          {(isHovered || isSingleTarget) && (
                            <circle
                              cx={x}
                              cy={yT}
                              r={isHovered ? "11" : "9"}
                              fill="rgba(59, 130, 246, 0.2)"
                              stroke="#3b82f6"
                              strokeWidth={isSingleTarget ? "1.5" : "0"}
                              strokeDasharray={isSingleTarget ? "3 3" : undefined}
                            />
                          )}
                          <circle
                            cx={x}
                            cy={yT}
                            r={isHovered ? "5.5" : "4.5"}
                            fill="#3b82f6"
                            stroke="#ffffff"
                            strokeWidth="2"
                          />
                          {(isSingleTarget || isHovered) && (
                            <text
                              x={x}
                              y={yT - 12}
                              textAnchor="middle"
                              className="text-[10px] font-bold fill-blue-700 font-mono select-none pointer-events-none"
                            >
                              T: {m.targetFormatted}
                            </text>
                          )}
                        </g>
                      )}

                      {/* Capaian Point: rendered ONLY when capaian is reported for this month */}
                      {hasCapaian && yC !== null && (
                        <g>
                          {(isHovered || isSingleCapaian) && (
                            <circle
                              cx={x}
                              cy={yC}
                              r={isHovered ? "13" : "11"}
                              fill="rgba(16, 185, 129, 0.25)"
                              stroke="#10b981"
                              strokeWidth={isSingleCapaian ? "1.5" : "0"}
                              strokeDasharray={isSingleCapaian ? "3 3" : undefined}
                            />
                          )}
                          <circle
                            cx={x}
                            cy={yC}
                            r={isHovered ? "6.5" : "5.5"}
                            fill="#059669"
                            stroke="#ffffff"
                            strokeWidth="2.5"
                          />
                          {(isSingleCapaian || isHovered) && (
                            <text
                              x={x}
                              y={yC + (hasTarget && yT !== null && yC < yT ? -14 : 18)}
                              textAnchor="middle"
                              className="text-[10px] font-extrabold fill-emerald-800 font-mono select-none pointer-events-none"
                            >
                              C: {m.capaianFormatted}
                            </text>
                          )}
                        </g>
                      )}

                      {/* X-Axis Month Label */}
                      <text
                        x={x}
                        y={chartH - 12}
                        textAnchor="middle"
                        className={`text-[10px] font-bold ${
                          isHovered
                            ? 'fill-blue-600 font-black'
                            : (hasCapaian || hasTarget)
                            ? 'fill-slate-900 font-extrabold'
                            : 'fill-slate-400 font-medium'
                        }`}
                      >
                        {MONTH_SHORT[idx]}
                      </text>
                    </g>
                  );
                })}

                {/* Invisible Hitbox Triggers for Monthly Hover */}
                {rawMonths.map((m, idx) => {
                  const x = getXMonthly(idx);
                  const colW = plotW / (rawMonths.length - 1);
                  return (
                    <rect
                      key={`hitbox-monthly-${idx}`}
                      x={x - colW / 2}
                      y={padT - 10}
                      width={colW}
                      height={plotH + 20}
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredMonthlyIdx(idx)}
                      onMouseLeave={() => setHoveredMonthlyIdx(null)}
                    />
                  );
                })}
              </svg>
            </div>
            ) : (
              <div className="p-6 sm:p-7 rounded-2xl border border-blue-200/80 bg-gradient-to-r from-blue-50/80 via-slate-50/70 to-indigo-50/60 shadow-2xs space-y-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                    Nov
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-slate-900">
                      Target Peluncuran: November 2026
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium">
                      Peluncuran 1 Studio pusat dengan minimal 100 Konten Pembelajaran
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 text-xs space-y-1 shadow-2xs">
                    <span className="text-slate-500 block font-semibold text-[11px] uppercase tracking-wider">Jadwal Peluncuran</span>
                    <span className="font-bold text-slate-900 text-sm">November 2026</span>
                  </div>
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 text-xs space-y-1 shadow-2xs">
                    <span className="text-slate-500 block font-semibold text-[11px] uppercase tracking-wider">Status Periode Berjalan</span>
                    <span className="font-bold text-blue-700 text-sm">Tahap Penyiapan Studio</span>
                  </div>
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 text-xs space-y-1 shadow-2xs">
                    <span className="text-slate-500 block font-semibold text-[11px] uppercase tracking-wider">Target Operasional Penuh</span>
                    <span className="font-bold text-slate-900 text-sm">Tahun 2027</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. KENDALA PELAKSANAAN & TINDAK LANJUT */}
      <div id="kendala-section" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6 scroll-mt-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
            <AlertCircle className="w-4.5 h-4.5" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Kendala Pelaksanaan &amp; Tindak Lanjut
          </h3>
        </div>

        {resolvedKendalaList.length === 0 ? (
          <div className="py-8 px-6 text-center rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-sm sm:text-base font-bold text-slate-900">
              Tidak Ada Kendala dan Tindak Lanjut Pelaksanaan
            </p>
            <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-md mx-auto">
              Tidak terdapat isu kritis atau kendala operasional yang dilaporkan untuk program ini pada periode berjalan.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {resolvedKendalaList.map((item, idx) => {
              const isHighlighted =
                highlightKendalaId !== undefined &&
                (item.id === highlightKendalaId ||
                  String(item.id) === String(highlightKendalaId));

              return (
                <div
                  key={item.id || idx}
                  className={`py-5 first:pt-0 last:pb-0 space-y-4 rounded-2xl transition-all duration-300 ${
                    isHighlighted
                      ? 'p-4 bg-amber-50/40 ring-2 ring-amber-400/80 shadow-xs'
                      : ''
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm sm:text-base font-bold text-slate-900">
                        {item.title}
                      </h4>
                      {isHighlighted && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                          Fokus Isu Terpilih
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 2 Clean Columns with Left Accent Borders */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-1">
                    <div className="border-l-2 border-amber-400 pl-4 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">
                          Kendala Pelaksanaan
                        </span>
                        {item.tanggalKendala && (
                          <span className="text-[11px] text-slate-500 font-medium">
                            {item.tanggalKendala}
                          </span>
                        )}
                      </div>
                      <div className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-line">
                        {item.kendala}
                      </div>
                    </div>

                    <div className="border-l-2 border-blue-500 pl-4 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-blue-950 uppercase tracking-wider block">
                          Tindak Lanjut
                        </span>
                        {item.tanggalTindakLanjut && (
                          <span className="text-[11px] text-slate-500 font-medium">
                            {item.tanggalTindakLanjut}
                          </span>
                        )}
                      </div>
                      <div className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-line">
                        {item.tindakLanjut}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
