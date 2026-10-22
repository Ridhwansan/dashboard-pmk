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

  // Dynamic kendala list resolver
  const resolvedKendalaList: KendalaDetailItem[] = useMemo(() => {
    if (kendalaProgram.kendalaList && kendalaProgram.kendalaList.length > 0) {
      return kendalaProgram.kendalaList;
    }
    if (kendalaProgram.kendala || kendalaProgram.tindakLanjut) {
      const rawK = kendalaProgram.kendala || 'Tidak terdapat kendala operasional yang kritis saat ini.';
      const rawT =
        kendalaProgram.tindakLanjut ||
        'Koordinasi teknis rutin antar kementerian/lembaga terkait pengawasan realisasi target.';

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
          title: `Isu Prioritas: ${kendalaProgram.title}`,
          kendala: rawK,
          tindakLanjut: rawT,
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

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
            {/* Pilar 1: Pendidikan */}
            <div className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-300 p-5 flex flex-col justify-between transition-all hover:shadow-2xs">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                      <GraduationCap className="h-4.5 w-4.5" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">Pendidikan</h4>
                  </div>
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200/80">
                    {wilayah.pillarDetails.pendidikan.heroLabel}
                  </span>
                </div>

                <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
                  {wilayah.pillarDetails.pendidikan.heroValue}
                </div>

                <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 block truncate">
                      {wilayah.pillarDetails.pendidikan.metric1.label}
                    </span>
                    <strong className="text-slate-900 font-bold tabular-nums">
                      {wilayah.pillarDetails.pendidikan.metric1.value}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block truncate">
                      {wilayah.pillarDetails.pendidikan.metric2.label}
                    </span>
                    <strong className="text-slate-900 font-bold tabular-nums">
                      {wilayah.pillarDetails.pendidikan.metric2.value}
                    </strong>
                  </div>
                </div>
              </div>

              <p className="mt-3 pt-2.5 border-t border-slate-100 text-xs text-slate-600 font-medium leading-relaxed">
                {wilayah.pillarDetails.pendidikan.keterangan}
              </p>
            </div>

            {/* Pilar 2: Kesehatan */}
            <div className="bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-300 p-5 flex flex-col justify-between transition-all hover:shadow-2xs">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                      <HeartPulse className="h-4.5 w-4.5" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">Kesehatan</h4>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200/80">
                    {wilayah.pillarDetails.kesehatan.heroLabel}
                  </span>
                </div>

                <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
                  {wilayah.pillarDetails.kesehatan.heroValue}
                </div>

                <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 block truncate">
                      {wilayah.pillarDetails.kesehatan.metric1.label}
                    </span>
                    <strong className="text-slate-900 font-bold tabular-nums">
                      {wilayah.pillarDetails.kesehatan.metric1.value}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block truncate">
                      {wilayah.pillarDetails.kesehatan.metric2.label}
                    </span>
                    <strong className="text-slate-900 font-bold tabular-nums">
                      {wilayah.pillarDetails.kesehatan.metric2.value}
                    </strong>
                  </div>
                </div>
              </div>

              <p className="mt-3 pt-2.5 border-t border-slate-100 text-xs text-slate-600 font-medium leading-relaxed">
                {wilayah.pillarDetails.kesehatan.keterangan}
              </p>
            </div>

            {/* Pilar 3: Ketahanan Bencana */}
            <div className="bg-white rounded-2xl border border-slate-200/90 hover:border-[#a8754b] p-5 flex flex-col justify-between transition-all hover:shadow-2xs">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#fcf8f4] border border-[#a8754b]/30 flex items-center justify-center text-[#7a4b27] shrink-0">
                      <ShieldAlert className="h-4.5 w-4.5" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">Ketahanan Bencana</h4>
                  </div>
                  <span className="text-xs font-bold text-[#7a4b27] bg-[#fcf8f4] px-2 py-0.5 rounded-lg border border-[#a8754b]/40">
                    {wilayah.pillarDetails.bencana.heroLabel}
                  </span>
                </div>

                <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
                  {wilayah.pillarDetails.bencana.heroValue}
                </div>

                <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 block truncate">
                      {wilayah.pillarDetails.bencana.metric1.label}
                    </span>
                    <strong className="text-slate-900 font-bold tabular-nums">
                      {wilayah.pillarDetails.bencana.metric1.value}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block truncate">
                      {wilayah.pillarDetails.bencana.metric2.label}
                    </span>
                    <strong className="text-slate-900 font-bold tabular-nums">
                      {wilayah.pillarDetails.bencana.metric2.value}
                    </strong>
                  </div>
                </div>
              </div>

              <p className="mt-3 pt-2.5 border-t border-slate-100 text-xs text-slate-600 font-medium leading-relaxed">
                {wilayah.pillarDetails.bencana.keterangan}
              </p>
            </div>

            {/* Pilar 4: Penurunan Kemiskinan */}
            <div className="bg-white rounded-2xl border border-slate-200/90 hover:border-rose-300 p-5 flex flex-col justify-between transition-all hover:shadow-2xs">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                      <TrendingDown className="h-4.5 w-4.5" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">Kemiskinan</h4>
                  </div>
                  <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200/80">
                    {wilayah.pillarDetails.kemiskinan.heroLabel}
                  </span>
                </div>

                <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
                  {wilayah.pillarDetails.kemiskinan.heroValue}
                </div>

                <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 block truncate">
                      {wilayah.pillarDetails.kemiskinan.metric1.label}
                    </span>
                    <strong className="text-slate-900 font-bold tabular-nums">
                      {wilayah.pillarDetails.kemiskinan.metric1.value}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block truncate">
                      {wilayah.pillarDetails.kemiskinan.metric2.label}
                    </span>
                    <strong className="text-slate-900 font-bold tabular-nums">
                      {wilayah.pillarDetails.kemiskinan.metric2.value}
                    </strong>
                  </div>
                </div>
              </div>

              <p className="mt-3 pt-2.5 border-t border-slate-100 text-xs text-slate-600 font-medium leading-relaxed">
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
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Kendala Pelaksanaan &amp; Tindak Lanjut Orkestrasi Tiap Indikator
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Hambatan operasional lapangan dan rumusan tindak lanjut lintas K/L untuk pengawalan target
                </p>
              </div>
            </div>

            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3.5 py-1.5 rounded-xl border border-slate-200/90 shrink-0 self-start sm:self-auto">
              {resolvedKendalaList.length} Isu Teridentifikasi
            </span>
          </div>

          {/* Quick Indicator Selector Chips in Active Pillar */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500 block">
              Pilih Indikator untuk Melihat Kendala:
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
                      <span className="w-2 h-2 rounded-full bg-white shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Indicator Overview Banner */}
          <div className="bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                  {kendalaProgram.title}
                </h4>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200/80">
                  Pilar {kendalaProgram.pillarTitle}
                </span>
              </div>
              <p className="text-xs font-medium text-slate-600">
                Pelaksana: <strong className="text-slate-800">{kendalaProgram.picKementerian}</strong>
              </p>
            </div>

            <div className="text-xs text-slate-600 font-medium shrink-0 self-start sm:self-auto">
              <span>Target: <strong className="text-slate-900">{kendalaProgram.target2026}</strong></span>
              <span className="mx-2 text-slate-300">·</span>
              <span>Realisasi: <strong className="text-slate-900">{kendalaProgram.currentValue} {kendalaProgram.unit}</strong></span>
            </div>
          </div>

          {/* Dynamic Issues List */}
          {resolvedKendalaList.length === 0 ? (
            <div className="p-6 rounded-2xl bg-emerald-50/70 border border-emerald-200/90 flex items-center gap-3 text-emerald-900">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <p className="text-xs sm:text-sm font-semibold">
                Tidak teridentifikasi kendala kritis pada indikator ini. Pelaksanaan program berjalan sesuai target kerja lintas K/L.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {resolvedKendalaList.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 space-y-4 shadow-2xs"
                >
                  {/* Issue Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-200/80">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-950 text-xs font-extrabold flex items-center justify-center shrink-0">
                        #{idx + 1}
                      </span>
                      <h5 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                        {item.title}
                      </h5>
                    </div>
                    {item.klTerkait && (
                      <span className="inline-flex items-center px-3 py-1 rounded-lg bg-slate-50 border border-slate-200/90 text-xs font-bold text-slate-700 shadow-2xs shrink-0 self-start sm:self-auto">
                        K/L: {item.klTerkait}
                      </span>
                    )}
                  </div>

                  {/* Side-by-Side Detail Columns */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Box 1: Hambatan / Kendala */}
                    <div className="p-4 sm:p-5 rounded-xl bg-amber-50/70 border border-amber-200/90 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                        <span className="text-[11px] font-extrabold text-amber-950 uppercase tracking-wider block">
                          Hambatan / Kendala di Lapangan
                        </span>
                      </div>
                      <div className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed whitespace-pre-line space-y-2">
                        {item.kendala}
                      </div>
                    </div>

                    {/* Box 2: Tindak Lanjut Orkestrasi */}
                    <div className="p-4 sm:p-5 rounded-xl bg-blue-50/70 border border-blue-200/90 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                        <span className="text-[11px] font-extrabold text-blue-950 uppercase tracking-wider block">
                          Tindak Lanjut &amp; Koordinasi Lintas K/L
                        </span>
                      </div>
                      <div className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed whitespace-pre-line space-y-2">
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
