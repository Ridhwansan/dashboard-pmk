'use client';

import React, { useState, useMemo } from 'react';
import {
  WilayahData,
  getWilayahCapaianRpjmn,
  getWilayahTargetRpjmn,
} from '@/data/wilayahData';
import {
  MapPillarId,
  MAP_PILLARS,
  getIndicatorsByPillar,
  MapIndicatorDef,
} from '@/data/mapIndicators';
import {
  getProgramDetailData,
  KendalaDetailItem,
} from '@/data/programDetailData';
import {
  GraduationCap,
  HeartPulse,
  ShieldAlert,
  TrendingDown,
  FileText,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  Target,
  ArrowRight,
} from 'lucide-react';

interface WilayahInfoSectionProps {
  wilayah: WilayahData;
  selectedYear?: number;
  onResetNasional?: () => void;
  className?: string;
}

export const WilayahInfoSection: React.FC<WilayahInfoSectionProps> = ({
  wilayah,
  selectedYear = 2026,
  onResetNasional,
  className = '',
}) => {
  // 1. Active Pillar Tab for the Indicator Detail Section (default: 'pendidikan')
  const [activeTab, setActiveTab] = useState<MapPillarId>('pendidikan');

  // Macro Metrics for the territory
  const capaianRpjmn = getWilayahCapaianRpjmn(wilayah);
  const targetRpjmn = getWilayahTargetRpjmn(wilayah);

  // Indicators belonging to the currently active tab
  const activeTabIndicators = useMemo(() => {
    return getIndicatorsByPillar(activeTab);
  }, [activeTab]);

  const getLevelLabel = (level: WilayahData['level']) => {
    switch (level) {
      case 'nasional':
        return 'Tingkat Nasional';
      case 'provinsi':
        return 'Provinsi';
      case 'kabupaten':
        return 'Kabupaten / Kota';
      case 'kecamatan':
        return 'Kecamatan';
      case 'desa':
        return 'Desa / Kelurahan';
      default:
        return 'Wilayah';
    }
  };

  const catatanWilayah = wilayah.catatanStrategis || wilayah.ringkasanStrategis;

  // Helper to extract issues list from program detail
  const resolveIndicatorIssues = (ind: MapIndicatorDef): KendalaDetailItem[] => {
    const prog = getProgramDetailData(ind.id, ind.name, activeTab);
    if (prog.kendalaList && prog.kendalaList.length > 0) {
      return prog.kendalaList;
    }
    if (prog.kendala && prog.kendala.trim().length > 0) {
      const rawK = prog.kendala.trim();
      const rawT = (prog.tindakLanjut || '').trim();

      if (rawK.includes(';') && !rawK.includes('\n')) {
        const kParts = rawK.split(';').map((s) => s.trim()).filter(Boolean);
        const tParts = rawT.split(';').map((s) => s.trim()).filter(Boolean);
        if (kParts.length > 1) {
          return kParts.map((kText, idx) => ({
            id: idx + 1,
            title: `Isu Operasional #${idx + 1}`,
            kendala: kText,
            tindakLanjut:
              tParts[idx] ||
              tParts[0] ||
              'Koordinasi teknis lintas K/L untuk penanganan kendala di lapangan.',
            klTerkait: prog.picKementerian,
          }));
        }
      }

      return [
        {
          id: 1,
          title: prog.title,
          kendala: rawK,
          tindakLanjut:
            rawT || 'Koordinasi teknis lintas K/L terkait percepatan pelaksanaan program.',
          klTerkait: prog.picKementerian,
        },
      ];
    }
    return [];
  };

  return (
    <section
      aria-label={`Informasi Wilayah ${wilayah.name}`}
      className={`bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all duration-200 ${className}`}
    >
      {/* ======================================================== */}
      {/* 1. SECTION HEADER: Crisp Typography & Macro Facts        */}
      {/* ======================================================== */}
      <div className="p-6 sm:p-8 border-b border-slate-200/80 bg-slate-50/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-4xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {wilayah.name}
            </h2>

            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-600 flex-wrap">
              <span>{getLevelLabel(wilayah.level)}</span>
              <span className="text-slate-300">·</span>
              <span className="tabular-nums">Kode BPS: {wilayah.kodeBps}</span>
              <span className="text-slate-300">·</span>
              <span>{wilayah.kategoriWilayah}</span>
              {wilayah.isPrioritas && (
                <>
                  <span className="text-slate-300">·</span>
                  <span className="text-rose-700 font-bold">Prioritas Percepatan 3T</span>
                </>
              )}
            </div>
          </div>

          {/* Optional Reset Button when viewing individual province */}
          {wilayah.level !== 'nasional' && onResetNasional && (
            <button
              type="button"
              onClick={onResetNasional}
              className="h-[38px] px-3.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 border border-slate-200/90 shadow-2xs self-start sm:self-auto shrink-0"
              title="Kembali ke tampilan agregat Seluruh Indonesia"
            >
              <RotateCcw className="h-4 w-4 text-slate-500" />
              <span>Kembali ke Nasional</span>
            </button>
          )}
        </div>

        {/* 4 MACRO INDICATORS STRIP (High-Contrast Fact Cards) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-200/80">
          {/* Metric 1: Capaian Sasaran RPJMN */}
          <div className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-600 tracking-tight block mb-2">
              Capaian RPJMN
            </span>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
                {capaianRpjmn}
              </div>
              <div className="text-xs font-semibold text-slate-600 mt-1">
                Target 2029: <strong className="text-slate-900 font-bold">{targetRpjmn}</strong>
              </div>
            </div>
          </div>

          {/* Metric 2: Indeks Modal Manusia (IMM) */}
          <div className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-600 tracking-tight block mb-2">
              Indeks Modal Manusia
            </span>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
                {wilayah.imm}
              </div>
              <div className="text-xs font-semibold text-slate-600 mt-1">
                Target 2026: <strong className="text-slate-900 font-bold">0,57 poin</strong>
              </div>
            </div>
          </div>

          {/* Metric 3: Tingkat Kemiskinan */}
          <div className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-600 tracking-tight block mb-2">
              Tingkat Kemiskinan
            </span>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
                {wilayah.tingkatKemiskinan}
              </div>
              <div className="text-xs font-semibold text-slate-600 mt-1">
                Target Nasional: <strong className="text-slate-900 font-bold">6,5% - 7,5%</strong>
              </div>
            </div>
          </div>

          {/* Metric 4: Kemiskinan Ekstrem */}
          <div className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-600 tracking-tight block mb-2">
              Kemiskinan Ekstrem
            </span>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
                {wilayah.kemiskinanEkstrem}
              </div>
              <div className="text-xs font-semibold text-slate-600 mt-1">
                Target RPJMN: <strong className="text-emerald-700 font-extrabold">0,0%</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-9">
        {/* ======================================================== */}
        {/* 2. 4 WIDGET RINGKASAN PILAR (SESUAI REQUEST USER)       */}
        {/* ======================================================== */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                Ringkasan 4 Pilar Prioritas Wilayah
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Capaian agregat terpadu tahun {selectedYear} di {wilayah.name}. Klik kartu untuk membuka rincian indikator pilar terkait.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 items-stretch">
            {/* WIDGET 1: PENDIDIKAN */}
            <div
              onClick={() => setActiveTab('pendidikan')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setActiveTab('pendidikan');
              }}
              className={`rounded-2xl p-5 flex flex-col justify-between h-full transition-all cursor-pointer border ${
                activeTab === 'pendidikan'
                  ? 'bg-blue-50/50 border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                  : 'bg-white border-slate-200/90 hover:border-blue-400 hover:shadow-2xs'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-100/80 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0">
                      <GraduationCap className="h-4.5 w-4.5" />
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-900">Pendidikan</h4>
                  </div>
                  {activeTab === 'pendidikan' && (
                    <span className="text-[10.5px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                      Aktif
                    </span>
                  )}
                </div>

                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums tracking-tight">
                    {wilayah.pillarDetails?.pendidikan?.heroValue || '—'}
                  </div>
                  <div
                    className="text-xs font-semibold text-slate-500 mt-0.5 line-clamp-1"
                    title={wilayah.pillarDetails?.pendidikan?.heroLabel}
                  >
                    {wilayah.pillarDetails?.pendidikan?.heroLabel || 'Satuan Pendidikan'}
                  </div>
                </div>

                <div className="py-2.5 my-1 border-y border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-500 font-medium truncate">
                      {wilayah.pillarDetails?.pendidikan?.metric1?.label || 'Revitalisasi Sarpras'}
                    </span>
                    <strong className="text-slate-900 font-bold tabular-nums shrink-0">
                      {wilayah.pillarDetails?.pendidikan?.metric1?.value || '—'}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-500 font-medium truncate">
                      {wilayah.pillarDetails?.pendidikan?.metric2?.label || 'Digitalisasi Pendidikan'}
                    </span>
                    <strong className="text-slate-900 font-bold tabular-nums shrink-0">
                      {wilayah.pillarDetails?.pendidikan?.metric2?.value || '—'}
                    </strong>
                  </div>
                </div>
              </div>

              <p
                className="mt-3 pt-2 text-xs text-slate-600 font-normal leading-relaxed line-clamp-2"
                title={wilayah.pillarDetails?.pendidikan?.keterangan}
              >
                {wilayah.pillarDetails?.pendidikan?.keterangan}
              </p>
            </div>

            {/* WIDGET 2: KESEHATAN */}
            <div
              onClick={() => setActiveTab('kesehatan')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setActiveTab('kesehatan');
              }}
              className={`rounded-2xl p-5 flex flex-col justify-between h-full transition-all cursor-pointer border ${
                activeTab === 'kesehatan'
                  ? 'bg-emerald-50/50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                  : 'bg-white border-slate-200/90 hover:border-emerald-400 hover:shadow-2xs'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100/80 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                      <HeartPulse className="h-4.5 w-4.5" />
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-900">Kesehatan</h4>
                  </div>
                  {activeTab === 'kesehatan' && (
                    <span className="text-[10.5px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Aktif
                    </span>
                  )}
                </div>

                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums tracking-tight">
                    {wilayah.pillarDetails?.kesehatan?.heroValue || '—'}
                  </div>
                  <div
                    className="text-xs font-semibold text-slate-500 mt-0.5 line-clamp-1"
                    title={wilayah.pillarDetails?.kesehatan?.heroLabel}
                  >
                    {wilayah.pillarDetails?.kesehatan?.heroLabel || 'Layanan Kesehatan'}
                  </div>
                </div>

                <div className="py-2.5 my-1 border-y border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-500 font-medium truncate">
                      {wilayah.pillarDetails?.kesehatan?.metric1?.label || 'Pemeriksaan CKG'}
                    </span>
                    <strong className="text-slate-900 font-bold tabular-nums shrink-0">
                      {wilayah.pillarDetails?.kesehatan?.metric1?.value || '—'}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-500 font-medium truncate">
                      {wilayah.pillarDetails?.kesehatan?.metric2?.label || 'Penanganan TBC'}
                    </span>
                    <strong className="text-slate-900 font-bold tabular-nums shrink-0">
                      {wilayah.pillarDetails?.kesehatan?.metric2?.value || '—'}
                    </strong>
                  </div>
                </div>
              </div>

              <p
                className="mt-3 pt-2 text-xs text-slate-600 font-normal leading-relaxed line-clamp-2"
                title={wilayah.pillarDetails?.kesehatan?.keterangan}
              >
                {wilayah.pillarDetails?.kesehatan?.keterangan}
              </p>
            </div>

            {/* WIDGET 3: KETAHANAN BENCANA */}
            <div
              onClick={() => setActiveTab('bencana')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setActiveTab('bencana');
              }}
              className={`rounded-2xl p-5 flex flex-col justify-between h-full transition-all cursor-pointer border ${
                activeTab === 'bencana'
                  ? 'bg-[#fcf8f4] border-[#7a4b27] ring-2 ring-[#7a4b27]/20 shadow-sm'
                  : 'bg-white border-slate-200/90 hover:border-[#a8754b] hover:shadow-2xs'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#f5e8dd] border border-[#a8754b]/30 flex items-center justify-center text-[#7a4b27] shrink-0">
                      <ShieldAlert className="h-4.5 w-4.5" />
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-900">Kebencanaan</h4>
                  </div>
                  {activeTab === 'bencana' && (
                    <span className="text-[10.5px] font-bold text-[#7a4b27] bg-[#f5e8dd] px-2 py-0.5 rounded-full">
                      Aktif
                    </span>
                  )}
                </div>

                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums tracking-tight">
                    {wilayah.pillarDetails?.bencana?.heroValue || '—'}
                  </div>
                  <div
                    className="text-xs font-semibold text-slate-500 mt-0.5 line-clamp-1"
                    title={wilayah.pillarDetails?.bencana?.heroLabel}
                  >
                    {wilayah.pillarDetails?.bencana?.heroLabel || 'Hunian & Sabodam'}
                  </div>
                </div>

                <div className="py-2.5 my-1 border-y border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-500 font-medium truncate">
                      {wilayah.pillarDetails?.bencana?.metric1?.label || 'Huntara & Huntap'}
                    </span>
                    <strong className="text-slate-900 font-bold tabular-nums shrink-0">
                      {wilayah.pillarDetails?.bencana?.metric1?.value || '—'}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-500 font-medium truncate">
                      {wilayah.pillarDetails?.bencana?.metric2?.label || 'EWS & Sabodam'}
                    </span>
                    <strong className="text-slate-900 font-bold tabular-nums shrink-0">
                      {wilayah.pillarDetails?.bencana?.metric2?.value || '—'}
                    </strong>
                  </div>
                </div>
              </div>

              <p
                className="mt-3 pt-2 text-xs text-slate-600 font-normal leading-relaxed line-clamp-2"
                title={wilayah.pillarDetails?.bencana?.keterangan}
              >
                {wilayah.pillarDetails?.bencana?.keterangan}
              </p>
            </div>

            {/* WIDGET 4: PENURUNAN KEMISKINAN */}
            <div
              onClick={() => setActiveTab('kemiskinan')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setActiveTab('kemiskinan');
              }}
              className={`rounded-2xl p-5 flex flex-col justify-between h-full transition-all cursor-pointer border ${
                activeTab === 'kemiskinan'
                  ? 'bg-rose-50/50 border-rose-500 ring-2 ring-rose-500/20 shadow-sm'
                  : 'bg-white border-slate-200/90 hover:border-rose-400 hover:shadow-2xs'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-rose-100/80 border border-rose-200 flex items-center justify-center text-rose-700 shrink-0">
                      <TrendingDown className="h-4.5 w-4.5" />
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-900">Kemiskinan</h4>
                  </div>
                  {activeTab === 'kemiskinan' && (
                    <span className="text-[10.5px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                      Aktif
                    </span>
                  )}
                </div>

                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums tracking-tight">
                    {wilayah.pillarDetails?.kemiskinan?.heroValue || '—'}
                  </div>
                  <div
                    className="text-xs font-semibold text-slate-500 mt-0.5 line-clamp-1"
                    title={wilayah.pillarDetails?.kemiskinan?.heroLabel}
                  >
                    {wilayah.pillarDetails?.kemiskinan?.heroLabel || 'Tingkat Kemiskinan'}
                  </div>
                </div>

                <div className="py-2.5 my-1 border-y border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-500 font-medium truncate">
                      {wilayah.pillarDetails?.kemiskinan?.metric1?.label || 'Kemiskinan Ekstrem'}
                    </span>
                    <strong className="text-slate-900 font-bold tabular-nums shrink-0">
                      {wilayah.pillarDetails?.kemiskinan?.metric1?.value || '—'}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-500 font-medium truncate">
                      {wilayah.pillarDetails?.kemiskinan?.metric2?.label || 'Bantuan Disabilitas'}
                    </span>
                    <strong className="text-slate-900 font-bold tabular-nums shrink-0">
                      {wilayah.pillarDetails?.kemiskinan?.metric2?.value || '—'}
                    </strong>
                  </div>
                </div>
              </div>

              <p
                className="mt-3 pt-2 text-xs text-slate-600 font-normal leading-relaxed line-clamp-2"
                title={wilayah.pillarDetails?.kemiskinan?.keterangan}
              >
                {wilayah.pillarDetails?.kemiskinan?.keterangan}
              </p>
            </div>
          </div>
        </div>

        {/* CATATAN STRATEGIS WILAYAH (JIKA ADA) */}
        {catatanWilayah && (
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-start gap-3">
            <FileText className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Catatan Strategis Wilayah
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                {catatanWilayah}
              </p>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 3. DETAIL INDIKATOR PER PILAR DENGAN TARGET, CAPAIAN,   */}
        {/*    KENDALA & TINDAK LANJUT                               */}
        {/* ======================================================== */}
        <div className="pt-6 border-t border-slate-200/80 space-y-6">
          {/* Section Header & Pillar Tab Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                Detail Indikator Per Pilar
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Target, capaian wilayah, serta kendala operasional dan tindak lanjut di {wilayah.name}.
              </p>
            </div>

            {/* 4 Pilar Tab Switcher */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] flex-wrap sm:flex-nowrap">
              {MAP_PILLARS.map((p) => {
                const isActive = activeTab === p.id;
                const pilarIndicators = getIndicatorsByPillar(p.id);

                const activeThemeClass =
                  p.id === 'pendidikan'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : p.id === 'kesehatan'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : p.id === 'bencana'
                    ? 'bg-[#7a4b27] text-white shadow-xs'
                    : 'bg-red-600 text-white shadow-xs';

                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setActiveTab(p.id)}
                    className={`h-[40px] px-3.5 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                      isActive
                        ? `${activeThemeClass} font-extrabold`
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 font-semibold'
                    }`}
                  >
                    <span>{p.name}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {pilarIndicators.length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* List of Indicators under the Selected Pillar */}
          <div className="space-y-6">
            {activeTabIndicators.map((ind) => {
              const indVal = ind.getValue(wilayah);
              const prog = getProgramDetailData(ind.id, ind.name, activeTab);
              const issues = resolveIndicatorIssues(ind);

              // Percentage for progress bar (clamped 0 - 100)
              const pctNumber = Math.min(100, Math.max(0, indVal.num || 0));

              return (
                <div
                  key={ind.id}
                  className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-5 transition-all hover:border-slate-300"
                >
                  {/* 1. Indicator Header: Title & Pelaksana K/L */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 pb-4 border-b border-slate-100">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h4 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                          {ind.name}
                        </h4>
                        {ind.unit && (
                          <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200/80">
                            Satuan: {ind.unit}
                          </span>
                        )}
                        {ind.isNationalOnly && (
                          <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                            Capaian Nasional
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-normal leading-relaxed max-w-4xl">
                        {ind.description}
                      </p>
                    </div>

                    {prog.picKementerian && (
                      <div className="shrink-0 self-start md:self-center">
                        <span className="text-xs font-semibold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/90 block">
                          Pelaksana: <strong className="text-slate-900 font-bold">{prog.picKementerian}</strong>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 2. Target vs Capaian Data Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 p-4 bg-slate-50/70 rounded-xl border border-slate-200/70">
                    {/* Column 1: Target */}
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-500 block">
                        Target {selectedYear} / RPJMN:
                      </span>
                      <div className="text-base sm:text-lg font-extrabold text-slate-900 tabular-nums">
                        {ind.target2026}
                      </div>
                    </div>

                    {/* Column 2: Capaian Wilayah */}
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-500 block">
                        Capaian di {wilayah.name}:
                      </span>
                      <div className="text-base sm:text-lg font-extrabold text-blue-900 tabular-nums">
                        {indVal.display}
                      </div>
                      {indVal.subtext && (
                        <div className="text-[11px] font-medium text-slate-500 truncate">
                          {indVal.subtext}
                        </div>
                      )}
                    </div>

                    {/* Column 3: Persentase Capaian & Progress Bar */}
                    <div className="space-y-1.5 sm:pl-2 sm:border-l border-slate-200">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span>Persentase Capaian</span>
                        <span className="tabular-nums font-extrabold text-slate-900">
                          {pctNumber.toFixed(1)}%
                        </span>
                      </div>
                      {/* Progress bar */}
                      <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            pctNumber >= 80
                              ? 'bg-emerald-600'
                              : pctNumber >= 50
                              ? 'bg-blue-600'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(5, pctNumber))}%` }}
                        />
                      </div>
                      {indVal.statusLabel && (
                        <div className="text-[10.5px] font-semibold text-slate-600 flex items-center justify-between">
                          <span>Status:</span>
                          <span className="font-bold text-slate-800">{indVal.statusLabel}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 3. Kendala & Tindak Lanjut Blocks */}
                  <div>
                    {issues.length > 0 ? (
                      <div className="space-y-3.5">
                        <div className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Kendala Pelaksanaan &amp; Tindak Lanjut</span>
                        </div>

                        {issues.map((item, idx) => (
                          <div
                            key={item.id || idx}
                            className="grid grid-cols-1 md:grid-cols-2 gap-3.5 items-stretch"
                          >
                            {/* KENDALA PELAKSANAAN (Amber Card) */}
                            <div className="rounded-xl bg-amber-50/70 border border-amber-200/90 p-4 flex flex-col justify-start space-y-2">
                              <div className="flex items-center gap-1.5 text-amber-800">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span className="text-xs font-extrabold uppercase tracking-wider">
                                  Kendala Pelaksanaan
                                </span>
                              </div>
                              <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed whitespace-pre-line">
                                {item.kendala}
                              </p>
                              {item.klTerkait && (
                                <div className="text-[11px] font-semibold text-amber-900/80 pt-1 border-t border-amber-200/60">
                                  Lokus K/L: {item.klTerkait}
                                </div>
                              )}
                            </div>

                            {/* TINDAK LANJUT (Blue Card) */}
                            <div className="rounded-xl bg-blue-50/70 border border-blue-200/90 p-4 flex flex-col justify-start space-y-2">
                              <div className="flex items-center gap-1.5 text-blue-800">
                                <CheckCircle2 className="w-4 h-4 shrink-0" />
                                <span className="text-xs font-extrabold uppercase tracking-wider">
                                  Tindak Lanjut
                                </span>
                              </div>
                              <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed whitespace-pre-line">
                                {item.tindakLanjut}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* Reassuring Emerald State when no critical bottleneck exists */
                      <div className="rounded-xl bg-emerald-50/60 border border-emerald-200/80 p-4 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5">
                          <CheckCircle2 className="w-4.5 h-4.5" />
                        </div>
                        <div className="space-y-0.5">
                          <h5 className="text-xs font-extrabold text-emerald-950 uppercase tracking-wider">
                            Tidak Teridentifikasi Kendala Kritis
                          </h5>
                          <p className="text-xs sm:text-sm text-emerald-900/80 font-medium leading-relaxed">
                            Pelaksanaan program <strong className="text-emerald-950 font-semibold">{ind.name}</strong> di {wilayah.name} berjalan lancar dan optimal sesuai rencana kerja tahun {selectedYear} tanpa hambatan operasional yang memerlukan intervensi khusus.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
