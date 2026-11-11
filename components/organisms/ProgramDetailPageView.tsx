'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  TableProperties,
  CalendarRange,
  BarChart3,
  AlertCircle,
  CheckCircle2,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { ProgramDetailData, KendalaDetailItem, getProgramDetailData } from '@/data/programDetailData';
import { PENGKINIAN_BENCANA_DATA, BENCANA_RINGKASAN_UTAMA } from '@/data/bencanaPengkinianData';
import {
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
 * Format table cell value: clean numbers, stripping redundant unit suffix since unit is in the column header
 */
function formatTableCellValue(val: string | undefined | null, unit?: string): string {
  if (!val || val === '—' || val === '-') return '—';
  const trimmed = val.trim();
  if (unit && unit.trim()) {
    const u = unit.trim().toLowerCase();
    if (trimmed.toLowerCase().endsWith(u)) {
      const stripped = trimmed.slice(0, trimmed.length - unit.trim().length).trim();
      if (stripped) return stripped;
    }
  }
  return trimmed;
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

const chartW = 900;
const chartH = 260;
const padL = 70;
const padR = 40;
const padT = 35;
const padB = 45;
const plotW = chartW - padL - padR;
const plotH = chartH - padT - padB;

export const ProgramDetailPageView: React.FC<ProgramDetailPageViewProps> = ({
  program,
  onBack,
  category = 'PKPN',
  initialSection,
  highlightKendalaId,
}) => {
  const [currentProgram, setCurrentProgram] = useState<ProgramDetailData>(program);

  // Sync program detail from database API
  useEffect(() => {
    let active = true;
    const fetchDbDetail = async () => {
      try {
        const res = await fetch(`/api/programs/${program.id}`);
        if (res.ok) {
          const json = await res.json();
          if (active && json.data) {
            setCurrentProgram(json.data);
          }
        }
      } catch {
        // Keep baseline
      }
    };
    fetchDbDetail();
    return () => {
      active = false;
    };
  }, [program.id]);

  // Always scroll to top when entering program detail unless kendala is targeted
  useEffect(() => {
    if (initialSection === 'kendala') {
      const timer = setTimeout(() => {
        const el = document.getElementById('kendala-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
      return () => clearTimeout(timer);
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [initialSection]);

  // Check if current indicator is MBG 3B
  const isMbg3b =
    currentProgram.id === 'mbg_3b' ||
    currentProgram.id === 'mbg_balita' ||
    currentProgram.id === 'mbg_ibu_hamil' ||
    currentProgram.id === 'mbg_ibu_menyusui';

  const [activeMbgTab, setActiveMbgTab] = useState<'semua' | 'balita' | 'ibu_hamil' | 'ibu_menyusui'>(
    currentProgram.id === 'mbg_balita'
      ? 'balita'
      : currentProgram.id === 'mbg_ibu_hamil'
      ? 'ibu_hamil'
      : currentProgram.id === 'mbg_ibu_menyusui'
      ? 'ibu_menyusui'
      : 'semua'
  );

  // Resolves active program data dynamically based on active segmented control tab
  const effectiveProgram: ProgramDetailData = useMemo(() => {
    if (isMbg3b) {
      if (activeMbgTab === 'balita') {
        return getProgramDetailData('mbg_balita', 'MBG Balita Non-PAUD', 'kesehatan');
      }
      if (activeMbgTab === 'ibu_hamil') {
        return getProgramDetailData('mbg_ibu_hamil', 'MBG Ibu Hamil', 'kesehatan');
      }
      if (activeMbgTab === 'ibu_menyusui') {
        return getProgramDetailData('mbg_ibu_menyusui', 'MBG Ibu Menyusui', 'kesehatan');
      }
      return getProgramDetailData('mbg_3b', 'MBG Ibu Hamil, Ibu Menyusui, dan Balita (3B)', 'kesehatan');
    }
    return currentProgram;
  }, [isMbg3b, activeMbgTab, currentProgram]);

  // Default view is 'bulanan' or 'timeseries' or 'tahunan'
  const [tableType, setTableType] = useState<'tahunan' | 'bulanan' | 'timeseries'>('tahunan');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(0); // 0 = Semua Bulan
  const [hoveredAnnualIdx, setHoveredAnnualIdx] = useState<number | null>(null);
  const [hoveredMonthlyIdx, setHoveredMonthlyIdx] = useState<number | null>(null);
  const isJumlahBencana = effectiveProgram.id === 'jumlah_bencana';
  const [bencanaReport, setBencanaReport] = useState<{
    ringkasanUtama: typeof BENCANA_RINGKASAN_UTAMA;
    pengkinianData: typeof PENGKINIAN_BENCANA_DATA;
  }>({
    ringkasanUtama: BENCANA_RINGKASAN_UTAMA,
    pengkinianData: PENGKINIAN_BENCANA_DATA,
  });

  useEffect(() => {
    let active = true;
    const loadBencana = async () => {
      try {
        const res = await fetch('/api/bencana');
        if (res.ok) {
          const json = await res.json();
          if (active && json.data) {
            setBencanaReport(json.data);
          }
        }
      } catch {
        // baseline fallback
      }
    };
    if (isJumlahBencana) {
      loadBencana();
    }
    return () => {
      active = false;
    };
  }, [isJumlahBencana]);

  // Table type defaults to tahunan if timeseries is not supported for this program

  // Resolve annual row for this specific program (only this indicator appears in the annual table)
  const annualRowForProgram = useMemo(() => {
    const baseline = getIndicatorAnnualRow(effectiveProgram.id, effectiveProgram.pillarId);
    const customAnnual = (effectiveProgram as unknown as { annualTargets?: Record<string | number, { target?: string; capaian?: string }> })?.annualTargets;
    if (customAnnual && typeof customAnnual === 'object') {
      const mergedYears: Record<number, { target: string; capaian: string; percent?: string }> = {
        ...(baseline?.years || {}),
      };
      let hasCustom = false;
      [2025, 2026, 2027, 2028, 2029].forEach((yr) => {
        const entry = customAnnual[yr] || customAnnual[String(yr)];
        if (entry && (entry.target || entry.capaian)) {
          hasCustom = true;
          const tVal = entry.target && entry.target.trim() ? entry.target.trim() : (mergedYears[yr]?.target || '—');
          const cVal = entry.capaian && entry.capaian.trim() ? entry.capaian.trim() : (mergedYears[yr]?.capaian || '—');
          let pct: string | undefined = mergedYears[yr]?.percent;
          const tNum = parseFloat(tVal.replace(/[^0-9,.-]/g, '').replace(',', '.'));
          const cNum = parseFloat(cVal.replace(/[^0-9,.-]/g, '').replace(',', '.'));
          if (!isNaN(tNum) && !isNaN(cNum) && tNum > 0) {
            pct = `${Math.round((cNum / tNum) * 1000) / 10}%`;
          }
          mergedYears[yr] = {
            target: tVal,
            capaian: cVal,
            percent: pct,
          };
        }
      });
      if (hasCustom) {
        return {
          id: effectiveProgram.id,
          name: effectiveProgram.title,
          unit: effectiveProgram.unit,
          years: mergedYears,
        };
      }
    }
    return baseline;
  }, [effectiveProgram.id, effectiveProgram.pillarId, effectiveProgram]);

  // Fallback annual row if program is not hardcoded in agregat data
  const activeAnnualRow: AgregatIndicatorRow = useMemo(() => {
    if (annualRowForProgram) return annualRowForProgram;
    const pctMatch = effectiveProgram.status?.match(/(\d+(?:[.,]\d+)?)\s*%/);
    return {
      id: effectiveProgram.id,
      name: effectiveProgram.title,
      unit: effectiveProgram.unit,
      years: {
        2025: { target: '—', capaian: '—' },
        2026: {
          target: effectiveProgram.target2026 || '—',
          capaian: effectiveProgram.currentValue || '—',
          percent: pctMatch ? `${pctMatch[1]}%` : undefined,
        },
        2027: { target: '—', capaian: '—' },
        2028: { target: '—', capaian: '—' },
        2029: { target: '—', capaian: '—' },
      },
    };
  }, [annualRowForProgram, effectiveProgram]);

  // Filtered monthly data
  const rawMonths = useMemo(() => {
    return effectiveProgram.monthlyData[selectedYear] || effectiveProgram.monthlyData[2026] || [];
  }, [effectiveProgram, selectedYear]);

  // Enriched monthly data with Delta MoM calculation for time-series updates
  const enrichedMonths = useMemo(() => {
    return rawMonths.map((m, idx) => {
      const prevMonth = idx > 0 ? rawMonths[idx - 1] : null;
      let deltaMoM: number | null = null;
      let deltaMoMPct: number | null = null;
      let deltaFormatted = '—';

      const currentVal = m.capaian;
      const prevVal = prevMonth?.capaian;

      if (currentVal !== null && currentVal !== undefined && m.capaianFormatted !== '—' && m.capaianFormatted !== '') {
        if (idx === 0) {
          deltaFormatted = 'Basis Awal';
        } else if (prevVal !== null && prevVal !== undefined && prevMonth?.capaianFormatted !== '—' && prevMonth?.capaianFormatted !== '') {
          deltaMoM = currentVal - prevVal;
          if (prevVal > 0) {
            deltaMoMPct = Math.round(((currentVal - prevVal) / prevVal) * 1000) / 10;
          }
          const sign = deltaMoM > 0 ? '+' : '';
          const pctText = deltaMoMPct !== null ? ` (${deltaMoMPct > 0 ? '+' : ''}${deltaMoMPct}%)` : '';
          deltaFormatted = `${sign}${deltaMoM.toLocaleString('id-ID')}${pctText}`;
        }
      }

      return {
        ...m,
        deltaMoM,
        deltaMoMPct,
        deltaFormatted,
        isCutoff: selectedYear === 2026 && m.month === 10,
        isPending: (m.capaianFormatted === '—' || m.capaianFormatted === '') && selectedYear === 2026 && m.month > 10,
      };
    });
  }, [rawMonths, selectedYear]);

  const displayedMonths = useMemo(() => {
    if (selectedMonth === 0) return enrichedMonths;
    return enrichedMonths.filter((m) => m.month === selectedMonth);
  }, [enrichedMonths, selectedMonth]);

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

  // Clean target string without redundant "Target 2026:" prefix
  const cleanTarget2026 = useMemo(() => {
    const t = effectiveProgram.target2026 || '';
    const stripped = t.replace(/^Target\s*(\d{4})?\s*:\s*/i, '').trim();
    return stripped || t || '—';
  }, [effectiveProgram.target2026]);

  // Unified numerical percentage for 2026
  const percentNumber2026 = useMemo(() => {
    if (effectiveProgram.currentValue?.toLowerCase() === 'terhenti') return 0;
    const annualMetric = activeAnnualRow.years[2026];
    if (annualMetric?.percent) {
      const parsed = parseFloat(annualMetric.percent.replace(/[^0-9,.-]/g, '').replace(',', '.'));
      if (!isNaN(parsed)) return parsed;
    }
    if (summaryMetrics.avgPct > 0) return summaryMetrics.avgPct;
    const pctMatch = effectiveProgram.status?.match(/(\d+(?:[.,]\d+)?)\s*%/);
    if (pctMatch) {
      const parsed = parseFloat(pctMatch[1].replace(',', '.'));
      if (!isNaN(parsed)) return parsed;
    }
    return null;
  }, [effectiveProgram, activeAnnualRow, summaryMetrics]);

  // Display percentage string
  const percentDisplay = useMemo(() => {
    if (effectiveProgram.currentValue?.toLowerCase() === 'terhenti') return '0% (Terhenti)';
    const annualMetric = activeAnnualRow.years[2026];
    if (annualMetric?.percent) return annualMetric.percent;
    if (summaryMetrics.avgPct > 0) return `${summaryMetrics.avgPct}%`;
    const pctMatch = effectiveProgram.status?.match(/(\d+(?:[.,]\d+)?)\s*%/);
    if (pctMatch) return `${pctMatch[1]}%`;
    return '—';
  }, [effectiveProgram, activeAnnualRow, summaryMetrics]);

  // Dynamic resolution of kendala list
  const resolvedKendalaList: KendalaDetailItem[] = useMemo(() => {
    if (effectiveProgram.kendalaList !== undefined) {
      return effectiveProgram.kendalaList;
    }
    if (effectiveProgram.kendala || effectiveProgram.tindakLanjut) {
      const rawKendala = effectiveProgram.kendala || 'Tidak terdapat kendala operasional yang kritis saat ini.';
      const rawTindakLanjut =
        effectiveProgram.tindakLanjut ||
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
            klTerkait: effectiveProgram.picKementerian,
          }));
        }
      }

      return [
        {
          id: 1,
          title: `Isu Prioritas: ${effectiveProgram.title}`,
          kendala: rawKendala,
          tindakLanjut: rawTindakLanjut,
          klTerkait: effectiveProgram.picKementerian,
        },
      ];
    }
    return [];
  }, [effectiveProgram]);

  // =========================================================================
  // ANNUAL CHART CALCULATIONS (2025–2029)
  // =========================================================================
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

  const getXAnnual = useCallback((index: number) => padL + (index / (AVAILABLE_YEARS.length - 1)) * plotW, []);
  const getYAnnual = useCallback((val: number | null) => {
    if (val === null) return padT + plotH;
    const ratio = Math.min(1, Math.max(0, val / yMaxAnnual));
    return padT + plotH - ratio * plotH;
  }, [yMaxAnnual]);

  const targetAnnualPath = useMemo(() => {
    const pts = annualPoints
      .map((p, idx) => ({ x: getXAnnual(idx), y: p.targetNum !== null ? getYAnnual(p.targetNum) : null }))
      .filter((p): p is { x: number; y: number } => p.y !== null);
    return buildSmoothPath(pts);
  }, [annualPoints, getXAnnual, getYAnnual]);

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
  }, [capaianAnnualPoints, annualPoints, getXAnnual, getYAnnual]);

  const capaianAnnualArea = useMemo(() => {
    if (capaianAnnualPoints.length === 0) return '';
    const firstIdx = annualPoints.findIndex((p) => p.year === capaianAnnualPoints[0].year);
    const lastIdx = annualPoints.findIndex(
      (p) => p.year === capaianAnnualPoints[capaianAnnualPoints.length - 1].year
    );
    const xStart = getXAnnual(firstIdx);
    const xEnd = getXAnnual(lastIdx);
    return `${capaianAnnualPath} L ${xEnd} ${padT + plotH} L ${xStart} ${padT + plotH} Z`;
  }, [capaianAnnualPoints, capaianAnnualPath, annualPoints, getXAnnual]);

  // =========================================================================
  // MONTHLY CHART CALCULATIONS (Jan - Des) & TRAJECTORY TO ANNUAL TARGET
  // =========================================================================
  const annualTargetPoint = useMemo(() => {
    return rawMonths.find((m) => m.month === 12 && m.target > 0) || rawMonths.find((m) => m.target > 0);
  }, [rawMonths]);

  const annualTargetNum = useMemo(() => {
    if (annualTargetPoint && annualTargetPoint.target > 0) return annualTargetPoint.target;
    return parseMetricValue(effectiveProgram.target2026);
  }, [annualTargetPoint, effectiveProgram.target2026]);

  const validMonthlyTargets = useMemo(() => {
    const list = rawMonths
      .filter((m) => m.target > 0 && m.targetFormatted !== '' && m.targetFormatted !== '—')
      .map((m) => m.target);
    if (annualTargetNum && annualTargetNum > 0) list.push(annualTargetNum);
    return list;
  }, [rawMonths, annualTargetNum]);

  const validMonthlyCapaian = useMemo(() => {
    return rawMonths
      .filter((m) => m.capaian !== null && m.capaianFormatted !== '' && m.capaianFormatted !== '—')
      .map((m) => m.capaian as number);
  }, [rawMonths]);

  const maxValMonthly = Math.max(...validMonthlyTargets, ...validMonthlyCapaian, 10);
  const yMaxMonthly = maxValMonthly * 1.18;

  const getXMonthly = useCallback(
    (index: number) => padL + (index / Math.max(1, rawMonths.length - 1)) * plotW,
    [rawMonths.length]
  );
  const getYMonthly = useCallback(
    (val: number | null) => {
      if (val === null) return padT + plotH;
      const ratio = Math.min(1, Math.max(0, val / yMaxMonthly));
      return padT + plotH - ratio * plotH;
    },
    [yMaxMonthly]
  );

  const targetMonthlyList = useMemo(() => {
    return rawMonths.filter(
      (m) => m.target > 0 && m.targetFormatted !== '' && m.targetFormatted !== '—'
    );
  }, [rawMonths]);

  // Target trajectory curve / reference line towards December target
  const targetMonthlyPath = useMemo(() => {
    if (targetMonthlyList.length >= 2) {
      const pts = targetMonthlyList.map((m) => {
        const idx = rawMonths.findIndex((rm) => rm.month === m.month);
        return { x: getXMonthly(idx), y: getYMonthly(m.target) };
      });
      return buildSmoothPath(pts);
    }
    if (annualTargetNum && annualTargetNum > 0) {
      // Connect January to December annual target
      const pts = [
        { x: getXMonthly(0), y: getYMonthly(0) },
        { x: getXMonthly(11), y: getYMonthly(annualTargetNum) },
      ];
      return buildSmoothPath(pts);
    }
    return '';
  }, [targetMonthlyList, annualTargetNum, rawMonths, getXMonthly, getYMonthly]);

  const capaianMonthlyList = useMemo(() => {
    return rawMonths.filter(
      (m) => m.capaian !== null && m.capaianFormatted !== '' && m.capaianFormatted !== '—'
    );
  }, [rawMonths]);

  const latestCapaianPoint = useMemo(() => {
    return capaianMonthlyList.length > 0 ? capaianMonthlyList[capaianMonthlyList.length - 1] : null;
  }, [capaianMonthlyList]);

  // Actual realized path (solid curve)
  const capaianMonthlyPath = useMemo(() => {
    if (capaianMonthlyList.length >= 2) {
      const pts = capaianMonthlyList.map((m) => {
        const idx = rawMonths.findIndex((rm) => rm.month === m.month);
        return { x: getXMonthly(idx), y: getYMonthly(m.capaian) };
      });
      return buildSmoothPath(pts);
    }
    if (latestCapaianPoint) {
      const latestIdx = rawMonths.findIndex((rm) => rm.month === latestCapaianPoint.month);
      const pts = [
        { x: getXMonthly(0), y: getYMonthly(0) },
        { x: getXMonthly(latestIdx), y: getYMonthly(latestCapaianPoint.capaian) },
      ];
      return buildSmoothPath(pts);
    }
    return '';
  }, [capaianMonthlyList, latestCapaianPoint, rawMonths, getXMonthly, getYMonthly]);

  // Gradient area under realized progress
  const capaianMonthlyArea = useMemo(() => {
    if (!capaianMonthlyPath || !latestCapaianPoint) return '';
    const firstIdx = capaianMonthlyList.length >= 2 ? rawMonths.findIndex((m) => m.month === capaianMonthlyList[0].month) : 0;
    const lastIdx = rawMonths.findIndex((m) => m.month === latestCapaianPoint.month);
    const xStart = getXMonthly(firstIdx);
    const xEnd = getXMonthly(lastIdx);
    return `${capaianMonthlyPath} L ${xEnd} ${padT + plotH} L ${xStart} ${padT + plotH} Z`;
  }, [capaianMonthlyList, capaianMonthlyPath, latestCapaianPoint, rawMonths, getXMonthly]);

  // Trajectory projection path (dashed line from latest capaian to December annual target)
  const trajectoryProjectionPath = useMemo(() => {
    if (!latestCapaianPoint || !annualTargetNum || latestCapaianPoint.month >= 12) return '';
    const startIdx = rawMonths.findIndex((rm) => rm.month === latestCapaianPoint.month);
    const endIdx = 11; // Desember
    const pts = [
      { x: getXMonthly(startIdx), y: getYMonthly(latestCapaianPoint.capaian) },
      { x: getXMonthly(endIdx), y: getYMonthly(annualTargetNum) },
    ];
    return buildSmoothPath(pts);
  }, [latestCapaianPoint, annualTargetNum, rawMonths, getXMonthly, getYMonthly]);

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-150">
      {/* 1. TOP BAR: Back Button & Context Breadcrumb */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="h-[44px] inline-flex items-center gap-2.5 px-4.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200/90 shadow-2xs transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-hidden"
        >
          <ArrowLeft className="w-4.5 h-4.5 text-slate-500" />
          <span>Kembali ke Daftar Program</span>
        </button>

        {/* Clear Breadcrumb Context */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500 bg-white px-4 py-2.5 rounded-xl border border-slate-200/90 shadow-2xs">
          <span>Ikhtisar</span>
          <span className="text-slate-300">/</span>
          <span>Pilar {category === 'PKPN' ? `PKPN ${effectiveProgram.pillarTitle}` : effectiveProgram.pillarTitle}</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-bold truncate max-w-[280px]">{effectiveProgram.title}</span>
        </div>
      </div>

      {/* 2. PROGRAM OVERVIEW & 3 FOCUSED KPI STAT CARDS */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-6">
        {/* MBG 3B SUB-INDICATOR SEGMENTED CONTROL */}
        {isMbg3b && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Kelompok Sasaran MBG 3B
              </span>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                Pilih sasaran untuk melihat data capaian, target, dan rincian berkala
              </p>
            </div>
            <div
              role="tablist"
              aria-label="Pilih Kelompok Sasaran MBG 3B"
              className="p-1 bg-slate-100 rounded-xl border border-slate-200/90 inline-flex items-center gap-1 self-start sm:self-auto shadow-2xs overflow-x-auto max-w-full shrink-0"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeMbgTab === 'semua'}
                onClick={() => setActiveMbgTab('semua')}
                className={`h-[36px] px-3.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeMbgTab === 'semua'
                    ? 'bg-white text-slate-900 shadow-2xs font-extrabold border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                Semua Sasaran (3B)
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeMbgTab === 'balita'}
                onClick={() => setActiveMbgTab('balita')}
                className={`h-[36px] px-3.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeMbgTab === 'balita'
                    ? 'bg-white text-slate-900 shadow-2xs font-extrabold border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                Balita Non-PAUD
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeMbgTab === 'ibu_hamil'}
                onClick={() => setActiveMbgTab('ibu_hamil')}
                className={`h-[36px] px-3.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeMbgTab === 'ibu_hamil'
                    ? 'bg-white text-slate-900 shadow-2xs font-extrabold border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                Ibu Hamil
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeMbgTab === 'ibu_menyusui'}
                onClick={() => setActiveMbgTab('ibu_menyusui')}
                className={`h-[36px] px-3.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeMbgTab === 'ibu_menyusui'
                    ? 'bg-white text-slate-900 shadow-2xs font-extrabold border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                Ibu Menyusui
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
            {effectiveProgram.title}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed max-w-4xl">
            {effectiveProgram.description}
          </p>
        </div>

        {/* 3 Prominent KPI Stat Cards for Focus */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {/* Card 1: Target 2026 (Clean without redundant prefix) */}
          <div className="bg-slate-50/70 rounded-xl p-5 border border-slate-200/90 space-y-1.5 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Target 2026
            </span>
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 block tracking-tight tabular-nums">
              {cleanTarget2026}
            </span>
            <span className="text-xs text-slate-500 font-normal block">
              Sasaran rencana aksi nasional
            </span>
          </div>

          {/* Card 2: Realisasi Berjalan */}
          <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-200/80 space-y-1.5 shadow-2xs">
            <span className="text-[11px] font-bold text-blue-900/80 uppercase tracking-wider block">
              Realisasi Berjalan
            </span>
            <span className="text-2xl sm:text-3xl font-bold text-blue-900 block tracking-tight tabular-nums">
              {(() => {
                const val = effectiveProgram.currentValue;
                if (!val || val === '—') return '—';
                if (val.toLowerCase() === 'terhenti') return 'Terhenti';
                if (effectiveProgram.unit && val.includes(effectiveProgram.unit)) return val;
                if (val.includes('%')) return val;
                return effectiveProgram.unit ? `${val} ${effectiveProgram.unit}` : val;
              })()}
            </span>
            <span className="text-xs text-blue-700/80 font-normal block">
              {percentNumber2026 !== null ? `Capaian saat ini: ${percentNumber2026}% dari target` : 'Data terverifikasi berkala'}
            </span>
          </div>

          {/* Card 3: Persentase Capaian with Mini Visual Progress */}
          <div className="bg-emerald-50/50 rounded-xl p-5 border border-emerald-200/80 space-y-1.5 shadow-2xs flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold text-emerald-900/80 uppercase tracking-wider block">
                Persentase Capaian
              </span>
              <span className="text-2xl sm:text-3xl font-bold text-emerald-800 block tracking-tight tabular-nums">
                {percentDisplay}
              </span>
            </div>
            {percentNumber2026 !== null && (
              <div className="pt-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-emerald-200/60 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(0, percentNumber2026))}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-emerald-800 tabular-nums shrink-0">
                    {percentNumber2026}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. SECTION TABEL & TREN BERKALA */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-6">
        {/* Controls Toolbar: Title on Left, Segmented Control on Right */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          {/* Left: Dynamic Title based on active table mode */}
          <div className="flex items-center gap-4 flex-wrap">
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              {tableType === 'tahunan'
                ? 'Tabel Tahunan'
                : tableType === 'bulanan'
                ? 'Tabel Bulanan'
                : 'Pengkinian Data Bencana'}
            </h3>

            {/* When bulanan or timeseries, show year/month filters */}
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
                    <option value={2026}>Tahun 2026</option>
                    <option value={2025}>Tahun 2025</option>
                    <option value={2027}>Tahun 2027</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>

                {/* Filter Bulan (khusus Tabel Bulanan) */}
                {tableType === 'bulanan' && (
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
                )}
              </div>
            )}
          </div>

          {/* Right: Segmented Control switching between Tabel Tahunan, Tabel Bulanan, Hirarki Wilayah, and Tren Berkala */}
          <div
            role="tablist"
            aria-label="Pilihan Jenis Tampilan Tabel"
            className="p-1 bg-slate-100 rounded-xl border border-slate-200/90 inline-flex items-center gap-1 self-start lg:self-auto shrink-0 shadow-2xs overflow-x-auto max-w-full"
          >
            <button
              type="button"
              role="tab"
              aria-selected={tableType === 'tahunan'}
              onClick={() => setTableType('tahunan')}
              className={`h-[36px] inline-flex items-center gap-1.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                tableType === 'tahunan'
                  ? 'bg-white text-slate-900 shadow-2xs font-extrabold border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <CalendarRange className="w-4 h-4 text-slate-500" />
              <span>Tabel Tahunan</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={tableType === 'bulanan'}
              onClick={() => setTableType('bulanan')}
              className={`h-[36px] inline-flex items-center gap-1.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                tableType === 'bulanan'
                  ? 'bg-white text-slate-900 shadow-2xs font-extrabold border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <TableProperties className="w-4 h-4 text-slate-500" />
              <span>Tabel Bulanan</span>
            </button>

            {isJumlahBencana && (
              <button
                type="button"
                role="tab"
                aria-selected={tableType === 'timeseries'}
                onClick={() => setTableType('timeseries')}
                className={`h-[36px] inline-flex items-center gap-1.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                  tableType === 'timeseries'
                    ? 'bg-white text-slate-900 shadow-2xs font-extrabold border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <RefreshCw className="w-4 h-4 text-slate-500" />
                <span>Pengkinian Data</span>
              </button>
            )}
          </div>
        </div>

        {/* VIEW A: TABEL TAHUNAN (2025–2029) - TARGET & CAPAIAN RPJMN */}
        {tableType === 'tahunan' && (
          <div className="border border-slate-200/90 rounded-2xl overflow-hidden bg-white shadow-2xs">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-800 font-bold border-b border-slate-200/90">
                    <th className="py-3.5 px-4 min-w-[170px] border-r border-slate-200/80">
                      Periode / Tahun
                    </th>
                    <th className="py-3.5 px-4 text-right min-w-[150px] border-r border-slate-200/80 font-bold text-slate-900">
                      Target {activeAnnualRow.unit ? `(${activeAnnualRow.unit})` : '(T)'}
                    </th>
                    <th className="py-3.5 px-4 text-right min-w-[150px] border-r border-slate-200/80 font-bold text-slate-900">
                      Capaian {activeAnnualRow.unit ? `(${activeAnnualRow.unit})` : '(C)'}
                    </th>
                    <th className="py-3.5 px-4 text-center min-w-[160px] font-bold text-slate-900">
                      % Capaian
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {AVAILABLE_YEARS.map((yr) => {
                    const metric = activeAnnualRow.years[yr] || { target: '—', capaian: '—' };
                    const isCutoff = yr === 2026;
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

                    const cleanTargetVal = formatTableCellValue(metric.target, activeAnnualRow.unit);
                    const cleanCapaianVal = formatTableCellValue(metric.capaian, activeAnnualRow.unit);

                    return (
                      <tr
                        key={yr}
                        className={`group relative hover:bg-slate-50/80 transition-colors ${
                          isCutoff ? 'bg-blue-50/40 font-semibold' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4 text-slate-900 font-bold border-r border-slate-100">
                          <div className="flex items-center gap-2">
                            <span>Tahun {yr}</span>
                            {isCutoff && (
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100/80 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-md shrink-0">
                                Tahun Berjalan
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Target */}
                        <td className="py-3.5 px-4 text-right text-slate-800 tabular-nums font-semibold border-r border-slate-100">
                          {cleanTargetVal}
                        </td>

                        {/* Capaian */}
                        <td className="py-3.5 px-4 text-right tabular-nums font-bold text-slate-900 border-r border-slate-100">
                          {cleanCapaianVal}
                        </td>

                        {/* % Capaian */}
                        <td className="py-3.5 px-4 text-center tabular-nums">
                          {hasCapaian && pctVal !== null ? (
                            <div className="inline-flex items-center gap-2 justify-center">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                                  pctVal >= 100
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
                                    : pctVal >= 75
                                    ? 'bg-blue-50 text-blue-800 border-blue-200/80'
                                    : 'bg-amber-50 text-amber-900 border-amber-200/80'
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    pctVal >= 100 ? 'bg-emerald-600' : pctVal >= 75 ? 'bg-blue-600' : 'bg-amber-500'
                                  }`}
                                />
                                <span>{pctVal}%</span>
                              </span>
                              {pctVal >= 100 && (
                                <span className="hidden lg:inline-block text-[11px] font-semibold text-emerald-700">
                                  Melampaui Target
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-300 font-normal">—</span>
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

        {/* VIEW B: TABEL BULANAN (PENYEDERHANAAN: CAPAIAN & TOTAL CAPAIAN) */}
        {tableType === 'bulanan' && (
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="bg-slate-100/90 text-slate-900 font-bold border-b border-slate-200">
                    <th className="py-3.5 px-4 min-w-[160px] border-r border-slate-200">
                      Bulan
                    </th>
                    <th className="py-3.5 px-4 text-right min-w-[160px] border-r border-slate-200 font-bold text-slate-900">
                      Capaian
                    </th>
                    <th className="py-3.5 px-4 text-right min-w-[160px] border-r border-slate-200 font-bold text-slate-900">
                      Total Capaian
                    </th>
                    <th className="py-3.5 px-4 min-w-[200px] font-bold text-slate-700">
                      Catatan Pelaksanaan
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {displayedMonths.map((m) => {
                    const isCutoff = selectedYear === 2026 && m.month === 10;
                    const capaianDisplay = m.capaianFormatted || '';
                    const totalCapaianDisplay = m.totalCapaianFormatted || m.capaianFormatted || '';
                    const noteDisplay = m.note || '';

                    return (
                      <tr
                        key={m.month}
                        className={`group relative hover:bg-slate-50/80 transition-colors ${
                          isCutoff ? 'bg-blue-50/30 font-semibold' : ''
                        }`}
                      >
                        {/* Bulan */}
                        <td className="py-3.5 px-4 text-slate-900 font-bold border-r border-slate-100">
                          {m.monthName} {selectedYear}
                        </td>

                        {/* Capaian */}
                        <td className={`py-3.5 px-4 text-right tabular-nums border-r border-slate-100 ${
                          isCutoff ? 'font-black text-slate-900' : 'font-bold text-slate-800'
                        }`}>
                          {capaianDisplay === '—' || !capaianDisplay ? (
                            <span className="text-slate-400 font-normal">—</span>
                          ) : (
                            capaianDisplay
                          )}
                        </td>

                        {/* Total Capaian */}
                        <td className={`py-3.5 px-4 text-right tabular-nums border-r border-slate-100 font-bold ${
                          isCutoff ? 'text-slate-900' : 'text-slate-800'
                        }`}>
                          {totalCapaianDisplay === '—' || !totalCapaianDisplay ? (
                            <span className="text-slate-400 font-normal">—</span>
                          ) : (
                            totalCapaianDisplay
                          )}
                        </td>

                        {/* Catatan Pelaksanaan */}
                        <td className="py-3.5 px-4 text-slate-700 text-xs sm:text-sm">
                          {noteDisplay || (isCutoff ? 'Data resmi berjalan per 18 Oktober 2026' : '—')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW C: PENGKINIAN DATA (KHUSUS INDIKATOR JUMLAH BENCANA - GAMBAR 1, 2, 3) */}
        {tableType === 'timeseries' && isJumlahBencana && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* WIDGET RINGKASAN UTAMA (BERSIH, TANPA DOT MERAH, FONT NYAMAN) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-0.5">
                <h4 className="text-sm font-bold text-slate-900 tracking-tight uppercase">
                  Ringkasan Utama Pemantauan Bencana
                </h4>
                <span className="text-xs font-medium text-slate-500">
                  Cutoff Laporan: 27 Oktober 2026
                </span>
              </div>

              {/* Grid 5 Cards Stat Ringkas */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 items-stretch">
                {/* 1. Kejadian Baru */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Kejadian Baru
                  </span>
                  <div>
                    <span className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight block">
                      {bencanaReport.ringkasanUtama.kejadianBaru}
                    </span>
                    <span className="text-xs text-slate-500 font-medium block mt-1">
                      Laporan Masuk Baru
                    </span>
                  </div>
                </div>

                {/* 2. Pengkinian Data */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Pengkinian Data
                  </span>
                  <div>
                    <span className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight block">
                      {bencanaReport.ringkasanUtama.pengkinianData}
                    </span>
                    <span className="text-xs text-slate-500 font-medium block mt-1">
                      Pembaruan Lapangan
                    </span>
                  </div>
                </div>

                {/* 3. Total Kejadian Signifikan */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Total Kejadian
                  </span>
                  <div>
                    <span className="text-3xl lg:text-4xl font-extrabold text-rose-700 tracking-tight block">
                      {bencanaReport.ringkasanUtama.totalKejadianSignifikan}
                    </span>
                    <span className="text-xs text-rose-600 font-medium block mt-1">
                      Berdampak Signifikan
                    </span>
                  </div>
                </div>

                {/* 4. Provinsi Terdampak */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Wilayah Terdampak
                  </span>
                  <div>
                    <span className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight block">
                      {bencanaReport.ringkasanUtama.provinsiTerdampak}
                    </span>
                    <span className="text-xs text-slate-500 font-medium block mt-1">
                      Provinsi Se-Indonesia
                    </span>
                  </div>
                </div>

                {/* 5. Rekap Jenis Bencana */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                    Jenis Dominan
                  </span>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-medium">Karhutla</span>
                      <span className="font-extrabold text-slate-900">{bencanaReport.ringkasanUtama.rekapBencana.karhutla}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-medium">Kekeringan</span>
                      <span className="font-extrabold text-slate-900">{bencanaReport.ringkasanUtama.rekapBencana.kekeringan}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-medium">Banjir</span>
                      <span className="font-extrabold text-slate-900">{bencanaReport.ringkasanUtama.rekapBencana.banjir}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium pt-0.5 border-t border-slate-100 truncate">
                      {bencanaReport.ringkasanUtama.rekapBencana.lainnya}
                    </div>
                  </div>
                </div>
              </div>

              {/* Rangkuman Situasi / Teks Panjang (Disediakan Tempat Luas & Nyaman Dibaca) */}
              <div className="p-4 sm:p-4.5 rounded-2xl bg-slate-50/80 border border-slate-200/90 shadow-2xs">
                <div className="flex items-start gap-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900 shrink-0 mt-0.5">
                    Dominasi Kejadian:
                  </span>
                  <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                    {bencanaReport.ringkasanUtama.narasiDominasi}
                  </p>
                </div>
              </div>
            </div>

            {/* TABEL PENGKINIAN DATA (BERSIH, TANPA NOMOR 5, TANPA CHIPS, FONT NYAMAN DIBACA) */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
              <div className="p-4 sm:p-5 bg-white border-b border-slate-200 flex items-center justify-between gap-3">
                <h4 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight uppercase">
                  Pengkinian Data Menonjol / Berdampak Signifikan
                </h4>
                <span className="text-xs text-slate-500 font-medium">
                  {bencanaReport.pengkinianData.length} Kejadian Terlaporkan
                </span>
              </div>

              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50/90 text-slate-900 font-bold border-b border-slate-200 text-xs uppercase tracking-wider">
                      <th className="py-3.5 px-3 w-12 text-center border-r border-slate-200">
                        No
                      </th>
                      <th className="py-3.5 px-4 min-w-[190px] border-r border-slate-200">
                        Provinsi / Lokasi
                      </th>
                      <th className="py-3.5 px-5 min-w-[290px] border-r border-slate-200">
                        Dampak
                      </th>
                      <th className="py-3.5 px-4 min-w-[180px] border-r border-slate-200">
                        Status
                      </th>
                      <th className="py-3.5 px-5 min-w-[360px]">
                        Kondisi Mutakhir
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {bencanaReport.pengkinianData.map((item) => (
                      <tr
                        key={item.no}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        {/* No */}
                        <td className="py-4 px-3 text-center text-slate-500 font-bold border-r border-slate-100 align-top text-xs sm:text-sm">
                          {item.no}
                        </td>

                        {/* Provinsi / Lokasi */}
                        <td className="py-4 px-4 font-bold text-slate-900 border-r border-slate-100 align-top text-sm leading-snug whitespace-pre-line">
                          {item.provinsiLokasi}
                        </td>

                        {/* Dampak */}
                        <td className="py-4 px-5 text-slate-800 border-r border-slate-100 align-top text-xs sm:text-sm leading-relaxed font-normal">
                          {item.dampak}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4 border-r border-slate-100 align-top text-xs">
                          {item.isEmergencyStatus ? (
                            <span className="text-rose-700 font-bold leading-tight block">
                              {item.status}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-medium">-</span>
                          )}
                        </td>

                        {/* Kondisi Mutakhir */}
                        <td className="py-4 px-5 text-slate-800 align-top text-xs sm:text-sm space-y-1.5 font-normal">
                          <p className="leading-relaxed text-slate-800">
                            {item.kondisiMutakhir}
                          </p>
                          <p className="text-xs text-slate-500 font-medium pt-0.5">
                            {item.detailLaphar}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. DEDICATED VISUALISASI GRAFIK SECTION (UNTUK TABEL TAHUNAN & BULANAN) */}
      {tableType !== 'timeseries' && (
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
                  : `Tren Capaian Bulanan & Total Capaian Kumulatif · ${effectiveProgram.title}`}
              </p>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200/80 text-xs font-bold self-start sm:self-auto shadow-2xs">
            {tableType === 'tahunan' ? (
              <>
                <span className="flex items-center gap-2 text-blue-700">
                  <span className="w-4 h-0.5 border-t-2 border-dashed border-blue-600 inline-block" />
                  <span>Target (T)</span>
                </span>
                <span className="flex items-center gap-2 text-emerald-700">
                  <span className="w-4 h-1 bg-emerald-600 inline-block rounded-full" />
                  <span>Capaian (C)</span>
                </span>
              </>
            ) : (
              <>
                <span className="flex items-center gap-2 text-blue-700">
                  <span className="w-3.5 h-0.5 border-t-2 border-dashed border-blue-600 inline-block" />
                  <span>Target Tahunan (Des 2026)</span>
                </span>
                <span className="flex items-center gap-2 text-emerald-800">
                  <span className="w-4 h-1 bg-emerald-600 inline-block rounded-full" />
                  <span>Realisasi Berjalan (s.d. Okt 2026)</span>
                </span>
                <span className="flex items-center gap-2 text-emerald-700">
                  <span className="w-4 h-0.5 border-t-2 border-dashed border-emerald-600 inline-block" />
                  <span>Proyeksi ke Target</span>
                </span>
              </>
            )}
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
                      <div className="bg-slate-100/95 backdrop-blur-md text-slate-800 rounded-2xl px-4 py-3 shadow-xl border border-slate-300/90 min-w-[220px] space-y-2">
                        <div className="border-b border-slate-200 pb-2">
                          <span className="font-extrabold text-slate-900 text-sm block">
                            Tahun {pt.year}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                          <div>
                            <span className="text-[11px] font-bold text-blue-700 block">Target (T)</span>
                            <span className="font-extrabold text-slate-900">{pt.targetFormatted}</span>
                          </div>
                          <div>
                            <span className="text-[11px] font-bold text-emerald-700 block">Capaian (C)</span>
                            <span className="font-extrabold text-emerald-800">{pt.capaianFormatted}</span>
                          </div>
                        </div>
                        {pt.percent && (
                          <div className="pt-1.5 border-t border-slate-200 flex items-center justify-between text-xs">
                            <span className="text-slate-600 font-medium">Persentase:</span>
                            <span className="font-extrabold text-slate-900">{pt.percent}</span>
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
                    <div className="mb-2">
                      <span className="text-xs font-extrabold text-slate-900 block">
                        Tahun {pt.year}
                      </span>
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
                  <div className="mb-1">
                    <span className="text-xs font-extrabold text-slate-900 block">
                      Tahun {pt.year}
                    </span>
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

        {/* GRAPH VIEW 2: MONTHLY & TIME-SERIES TRAJECTORY (Jan - Des) */}
        {tableType === 'bulanan' && (
          <div className="space-y-4">
            {validMonthlyCapaian.length > 0 || validMonthlyTargets.length > 0 ? (
              <div className="relative w-full overflow-x-auto custom-scrollbar border border-slate-200/90 rounded-2xl p-4 sm:p-5 bg-gradient-to-b from-white to-slate-50/50 shadow-2xs">
              {/* Floating Interactive Tooltip */}
              {hoveredMonthlyIdx !== null && rawMonths[hoveredMonthlyIdx] && (() => {
                const m = rawMonths[hoveredMonthlyIdx];
                const colX = getXMonthly(hoveredMonthlyIdx);
                const leftPct = (colX / chartW) * 100;

                return (
                  <div
                    className="pointer-events-none absolute z-20 top-3 -translate-x-1/2 transition-all duration-150 ease-out"
                    style={{ left: `${Math.max(16, Math.min(84, leftPct))}%` }}
                  >
                    <div className="bg-slate-100/95 backdrop-blur-md text-slate-800 rounded-2xl px-4 py-3 shadow-xl border border-slate-300/90 min-w-[220px] space-y-2">
                      <div className="border-b border-slate-200 pb-2">
                        <span className="font-extrabold text-slate-900 text-sm block">
                          {m.monthName} {selectedYear}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                        <div>
                          <span className="text-[11px] font-bold text-blue-700 block">Target (T)</span>
                          <span className="font-extrabold text-slate-900">{m.targetFormatted || '—'}</span>
                        </div>
                        <div>
                          <span className="text-[11px] font-bold text-emerald-700 block">Capaian (C)</span>
                          <span className="font-extrabold text-emerald-800">{m.capaianFormatted || '—'}</span>
                        </div>
                      </div>
                      {m.percentageFormatted && m.percentageFormatted !== '' && (
                        <div className="text-xs text-slate-600 pt-1.5 border-t border-slate-200">
                          Persentase: <span className="font-extrabold text-slate-900">{m.percentageFormatted}</span>
                        </div>
                      )}
                      {m.note && (
                        <div className="text-xs text-slate-500 pt-1 border-t border-slate-200">
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

                {/* Capaian Solid Line (Realisasi Berjalan s.d. Oktober) */}
                {capaianMonthlyPath && (
                  <path
                    d={capaianMonthlyPath}
                    fill="none"
                    stroke="#059669"
                    strokeWidth="3.5"
                    filter="url(#capaianGlowMonthly)"
                  />
                )}

                {/* Trajectory Projection Line (Mengarah ke Target Tahunan Desember) */}
                {trajectoryProjectionPath && (
                  <path
                    d={trajectoryProjectionPath}
                    fill="none"
                    stroke="#059669"
                    strokeWidth="3"
                    strokeDasharray="6 6"
                    opacity="0.85"
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
            ) : effectiveProgram.id === 'studio_guru' ? (
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
            ) : (
              <div className="py-12 px-6 rounded-2xl border border-slate-200/90 bg-slate-50/60 text-center space-y-2.5">
                <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto text-slate-400 shadow-2xs">
                  <Clock className="w-5 h-5 text-slate-400" />
                </div>
                <h4 className="text-sm font-bold text-slate-700">Rangkaian Data Bulanan Belum Tersedia</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Rincian capaian berkala per bulan untuk indikator ini belum dihimpun atau belum dipublikasikan oleh K/L pengampu program.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      )}

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
                    <h4 className="text-sm sm:text-base font-bold text-slate-900">
                      {item.title}
                    </h4>
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

      {/* 5. BOTTOM BAR: Convenient Return Action at the End of Detail View */}
      <div className="flex items-center justify-between pt-2 pb-6">
        <button
          type="button"
          onClick={onBack}
          className="h-[44px] inline-flex items-center gap-2.5 px-6 rounded-2xl text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200/90 shadow-2xs transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4.5 h-4.5 text-slate-500" />
          <span>Kembali ke Daftar Program</span>
        </button>

        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="h-[44px] inline-flex items-center gap-2 px-4 rounded-2xl text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200/90 shadow-2xs transition-all cursor-pointer"
        >
          <span>Ke Atas Halaman ↑</span>
        </button>
      </div>
    </div>
  );
};
