'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  WilayahData,
  getWilayahCapaianRpjmn,
  getWilayahTargetRpjmn,
} from '@/data/wilayahData';
import {
  MapIndicatorDef,
  MapPillarId,
  getIndicatorsByPillar,
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
  Target,
  FileText,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface WilayahInfoSectionProps {
  wilayah: WilayahData;
  activeIndicator?: MapIndicatorDef | null;
  activePillar?: MapPillarId | null;
  selectedYear?: number;
  onResetNasional?: () => void;
  className?: string;
}

export const WilayahInfoSection: React.FC<WilayahInfoSectionProps> = ({
  wilayah,
  activeIndicator,
  activePillar = 'pendidikan',
  selectedYear = 2026,
  className = '',
}) => {
  // Active indicator local value for this territory
  const activeIndValue = activeIndicator ? activeIndicator.getValue(wilayah) : null;
  const capaianRpjmn = getWilayahCapaianRpjmn(wilayah);
  const targetRpjmn = getWilayahTargetRpjmn(wilayah);

  // Available indicators for the active pillar
  const pillarIndicators = useMemo(() => {
    const targetPillar = activePillar && activePillar !== 'all' ? activePillar : 'pendidikan';
    return getIndicatorsByPillar(targetPillar);
  }, [activePillar]);

  // Selected indicator for the Kendala & Tindak Lanjut section
  const [selectedKendalaIndId, setSelectedKendalaIndId] = useState<string>(
    activeIndicator?.id || pillarIndicators[0]?.id || 'revitalisasi_satdik'
  );

  // Sync selected kendala indicator whenever activeIndicator changes on the map
  useEffect(() => {
    if (activeIndicator?.id) {
      setSelectedKendalaIndId(activeIndicator.id);
    } else if (pillarIndicators.length > 0) {
      setSelectedKendalaIndId(pillarIndicators[0].id);
    }
  }, [activeIndicator?.id, pillarIndicators]);

  // Resolve program detail for selected kendala indicator
  const kendalaProgram = useMemo(() => {
    const targetPillar = activePillar && activePillar !== 'all' ? activePillar : 'pendidikan';
    const foundInd = pillarIndicators.find((ind) => ind.id === selectedKendalaIndId);
    return getProgramDetailData(selectedKendalaIndId, foundInd?.name, targetPillar);
  }, [selectedKendalaIndId, activePillar, pillarIndicators]);

  // Dynamic kendala list resolver (strictly for the selected indicator)
  const resolvedKendalaList: KendalaDetailItem[] = useMemo(() => {
    if (kendalaProgram.kendalaList && kendalaProgram.kendalaList.length > 0) {
      return kendalaProgram.kendalaList;
    }
    if (kendalaProgram.kendala && kendalaProgram.kendala.trim().length > 0) {
      const rawK = kendalaProgram.kendala.trim();
      const rawT = (kendalaProgram.tindakLanjut || '').trim();

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
            klTerkait: kendalaProgram.picKementerian,
          }));
        }
      }

      return [
        {
          id: 1,
          title: kendalaProgram.title,
          kendala: rawK,
          tindakLanjut: rawT || 'Koordinasi teknis lintas K/L terkait percepatan pelaksanaan program.',
          klTerkait: kendalaProgram.picKementerian,
        },
      ];
    }
    return [];
  }, [kendalaProgram]);

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

  return (
    <section
      aria-label={`Informasi Wilayah ${wilayah.name}`}
      className={`bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all duration-200 ${className}`}
    >
      {/* ======================================================== */}
      {/* 1. SECTION HEADER: Crisp Typography & Fact-based Metadata */}
      {/* ======================================================== */}
      <div className="p-6 sm:p-8 border-b border-slate-200/80 bg-slate-50/40">
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

        {/* 2. MACRO INDICATORS STRIP (5 High-Contrast Cards, Legible Typography) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-6 pt-6 border-t border-slate-200/80">
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

          {/* Metric 5: Indikator Peta Aktif */}
          <div className="col-span-2 sm:col-span-1 bg-blue-50/70 p-4.5 rounded-2xl border border-blue-200 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between gap-1 mb-2">
              <span className="text-xs font-bold text-blue-900 tracking-tight truncate">
                {activeIndicator ? activeIndicator.shortName : 'Indikator Aktif'}
              </span>
              <Target className="h-4 w-4 text-blue-600 shrink-0" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-950 tabular-nums">
                {activeIndValue ? activeIndValue.display : '—'}
              </div>
              <div className="text-xs font-semibold text-blue-800 mt-1 truncate">
                Target: <strong>{activeIndicator ? activeIndicator.target2026 : '—'}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-8">
        {/* ======================================================== */}
        {/* 3. CAPAIAN 4 PILAR PRIORITAS WILAYAH (Streamlined Cards) */}
        {/* ======================================================== */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Capaian 4 Pilar Prioritas Wilayah
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              Tahun {selectedYear}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 items-stretch">
            {/* Pilar 1: Pendidikan */}
            <div className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400 p-5 flex flex-col justify-between h-full transition-all hover:shadow-2xs">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                    <GraduationCap className="h-4.5 w-4.5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Pendidikan</h4>
                </div>

                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums tracking-tight">
                    {wilayah.pillarDetails.pendidikan.heroValue}
                  </div>
                  <div className="text-xs font-semibold text-slate-500 mt-0.5 line-clamp-1" title={wilayah.pillarDetails.pendidikan.heroLabel}>
                    {wilayah.pillarDetails.pendidikan.heroLabel}
                  </div>
                </div>

                <div className="py-2.5 my-1 border-y border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-500 font-medium truncate">{wilayah.pillarDetails.pendidikan.metric1.label}</span>
                    <strong className="text-slate-900 font-bold tabular-nums shrink-0">{wilayah.pillarDetails.pendidikan.metric1.value}</strong>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-500 font-medium truncate">{wilayah.pillarDetails.pendidikan.metric2.label}</span>
                    <strong className="text-slate-900 font-bold tabular-nums shrink-0">{wilayah.pillarDetails.pendidikan.metric2.value}</strong>
                  </div>
                </div>
              </div>

              <p className="mt-3 pt-2 text-xs text-slate-600 font-normal leading-relaxed line-clamp-3" title={wilayah.pillarDetails.pendidikan.keterangan}>
                {wilayah.pillarDetails.pendidikan.keterangan}
              </p>
            </div>

            {/* Pilar 2: Kesehatan */}
            <div className="bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-400 p-5 flex flex-col justify-between h-full transition-all hover:shadow-2xs">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                    <HeartPulse className="h-4.5 w-4.5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Kesehatan</h4>
                </div>

                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums tracking-tight">
                    {wilayah.pillarDetails.kesehatan.heroValue}
                  </div>
                  <div className="text-xs font-semibold text-slate-500 mt-0.5 line-clamp-1" title={wilayah.pillarDetails.kesehatan.heroLabel}>
                    {wilayah.pillarDetails.kesehatan.heroLabel}
                  </div>
                </div>

                <div className="py-2.5 my-1 border-y border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-500 font-medium truncate">{wilayah.pillarDetails.kesehatan.metric1.label}</span>
                    <strong className="text-slate-900 font-bold tabular-nums shrink-0">{wilayah.pillarDetails.kesehatan.metric1.value}</strong>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-500 font-medium truncate">{wilayah.pillarDetails.kesehatan.metric2.label}</span>
                    <strong className="text-slate-900 font-bold tabular-nums shrink-0">{wilayah.pillarDetails.kesehatan.metric2.value}</strong>
                  </div>
                </div>
              </div>

              <p className="mt-3 pt-2 text-xs text-slate-600 font-normal leading-relaxed line-clamp-3" title={wilayah.pillarDetails.kesehatan.keterangan}>
                {wilayah.pillarDetails.kesehatan.keterangan}
              </p>
            </div>

            {/* Pilar 3: Ketahanan Bencana */}
            <div className="bg-white rounded-2xl border border-slate-200/90 hover:border-[#a8754b] p-5 flex flex-col justify-between h-full transition-all hover:shadow-2xs">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#fcf8f4] border border-[#a8754b]/30 flex items-center justify-center text-[#7a4b27] shrink-0">
                    <ShieldAlert className="h-4.5 w-4.5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Ketahanan Bencana</h4>
                </div>

                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums tracking-tight">
                    {wilayah.pillarDetails.bencana.heroValue}
                  </div>
                  <div className="text-xs font-semibold text-slate-500 mt-0.5 line-clamp-1" title={wilayah.pillarDetails.bencana.heroLabel}>
                    {wilayah.pillarDetails.bencana.heroLabel}
                  </div>
                </div>

                <div className="py-2.5 my-1 border-y border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-500 font-medium truncate">{wilayah.pillarDetails.bencana.metric1.label}</span>
                    <strong className="text-slate-900 font-bold tabular-nums shrink-0">{wilayah.pillarDetails.bencana.metric1.value}</strong>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-500 font-medium truncate">{wilayah.pillarDetails.bencana.metric2.label}</span>
                    <strong className="text-slate-900 font-bold tabular-nums shrink-0">{wilayah.pillarDetails.bencana.metric2.value}</strong>
                  </div>
                </div>
              </div>

              <p className="mt-3 pt-2 text-xs text-slate-600 font-normal leading-relaxed line-clamp-3" title={wilayah.pillarDetails.bencana.keterangan}>
                {wilayah.pillarDetails.bencana.keterangan}
              </p>
            </div>

            {/* Pilar 4: Penurunan Kemiskinan */}
            <div className="bg-white rounded-2xl border border-slate-200/90 hover:border-rose-400 p-5 flex flex-col justify-between h-full transition-all hover:shadow-2xs">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                    <TrendingDown className="h-4.5 w-4.5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Kemiskinan</h4>
                </div>

                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums tracking-tight">
                    {wilayah.pillarDetails.kemiskinan.heroValue}
                  </div>
                  <div className="text-xs font-semibold text-slate-500 mt-0.5 line-clamp-1" title={wilayah.pillarDetails.kemiskinan.heroLabel}>
                    {wilayah.pillarDetails.kemiskinan.heroLabel}
                  </div>
                </div>

                <div className="py-2.5 my-1 border-y border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-500 font-medium truncate">{wilayah.pillarDetails.kemiskinan.metric1.label}</span>
                    <strong className="text-slate-900 font-bold tabular-nums shrink-0">{wilayah.pillarDetails.kemiskinan.metric1.value}</strong>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-500 font-medium truncate">{wilayah.pillarDetails.kemiskinan.metric2.label}</span>
                    <strong className="text-slate-900 font-bold tabular-nums shrink-0">{wilayah.pillarDetails.kemiskinan.metric2.value}</strong>
                  </div>
                </div>
              </div>

              <p className="mt-3 pt-2 text-xs text-slate-600 font-normal leading-relaxed line-clamp-3" title={wilayah.pillarDetails.kemiskinan.keterangan}>
                {wilayah.pillarDetails.kemiskinan.keterangan}
              </p>
            </div>
          </div>
        </div>

        {/* 4. CATATAN STRATEGIS WILAYAH */}
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
        {/* 5. KENDALA & TINDAK LANJUT TIAP INDIKATOR (NEW SECTION)  */}
        {/* ======================================================== */}
        <div className="pt-6 border-t border-slate-200/80 space-y-5">
          {/* Section Header: Dynamic based on presence of kendala */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                  resolvedKendalaList.length > 0
                    ? 'bg-amber-50 border-amber-200 text-amber-700'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                }`}
              >
                {resolvedKendalaList.length > 0 ? (
                  <AlertCircle className="w-4.5 h-4.5" />
                ) : (
                  <CheckCircle2 className="w-4.5 h-4.5" />
                )}
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Kendala Pelaksanaan &amp; Tindak Lanjut
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Indikator Terpilih: <strong className="text-slate-700">{kendalaProgram.title}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Indicator Selector Chips */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-500 block">
              Pilih Indikator:
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar flex-wrap sm:flex-nowrap">
              {pillarIndicators.map((ind) => {
                const isSelected = selectedKendalaIndId === ind.id;
                return (
                  <button
                    key={ind.id}
                    type="button"
                    onClick={() => setSelectedKendalaIndId(ind.id)}
                    className={`h-[36px] inline-flex items-center gap-2 px-3.5 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-2xs font-extrabold'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80'
                    }`}
                  >
                    <span>{ind.name}</span>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Issues List or Reassuring Empty State When No Critical Obstacles Exist */}
          {resolvedKendalaList.length === 0 ? (
            <div className="p-8 sm:p-10 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100/80 border border-emerald-200 flex items-center justify-center text-emerald-700 mx-auto shadow-2xs">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-1.5 max-w-lg mx-auto">
                <h5 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Tidak Teridentifikasi Kendala Kritis
                </h5>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                  Pelaksanaan program dan capaian indikator <strong className="text-slate-900 font-semibold">{kendalaProgram.title}</strong> berjalan lancar sesuai target rencana kerja tanpa kendala operasional yang memerlukan intervensi khusus.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200/80">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Pelaksanaan Berjalan Lancar Sesuai Target</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pt-1">
              {resolvedKendalaList.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4"
                >
                  {/* Issue Header: Title and Pelaksana */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <h5 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                      {item.title}
                    </h5>
                    {item.klTerkait && (
                      <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200/80 shrink-0 self-start sm:self-auto">
                        Pelaksana: {item.klTerkait}
                      </span>
                    )}
                  </div>

                  {/* 2 Clear, High-Contrast Dedicated Cards: Kendala vs Tindak Lanjut */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
                    {/* KENDALA PELAKSANAAN (Amber Card) */}
                    <div className="rounded-xl bg-amber-50/70 border border-amber-200/90 p-4 sm:p-5 flex flex-col justify-start space-y-2.5">
                      <div className="flex items-center gap-2 text-amber-800">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span className="text-xs font-extrabold uppercase tracking-wider">
                          Kendala Pelaksanaan
                        </span>
                      </div>
                      <div className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed whitespace-pre-line">
                        {item.kendala}
                      </div>
                    </div>

                    {/* TINDAK LANJUT (Blue Card) */}
                    <div className="rounded-xl bg-blue-50/70 border border-blue-200/90 p-4 sm:p-5 flex flex-col justify-start space-y-2.5">
                      <div className="flex items-center gap-2 text-blue-800">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span className="text-xs font-extrabold uppercase tracking-wider">
                          Tindak Lanjut
                        </span>
                      </div>
                      <div className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed whitespace-pre-line">
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
    </section>
  );
};
