'use client';

import React, { useState, useMemo } from 'react';
import {
  WilayahData,
  NASIONAL_DATA,
  PROVINSI_DATA,
  KABKOTA_DATA,
  KECAMATAN_DATA,
  DESA_DATA,
  getWilayahCapaianRpjmn,
  getWilayahTargetRpjmn,
  getWilayahIsuStrategis,
  getWilayahAgendaTransformasi,
} from '@/data/wilayahData';
import { LeafletMapWrapper } from '@/components/molecules/LeafletMapWrapper';
import {
  GraduationCap,
  HeartPulse,
  ShieldAlert,
  TrendingDown,
  RotateCcw,
  Layers,
  ChevronRight,
  Info,
  AlertTriangle,
  Compass,
} from 'lucide-react';

interface IndonesiaMapProps {
  className?: string;
  onSelectPillar?: (id: string) => void;
}

export const IndonesiaMap: React.FC<IndonesiaMapProps> = ({ className = '' }) => {
  // Cascading Filter States
  const [selectedProvinsiId, setSelectedProvinsiId] = useState<string>('nasional');
  const [selectedKabKotaId, setSelectedKabKotaId] = useState<string>('');
  const [selectedKecamatanId, setSelectedKecamatanId] = useState<string>('');
  const [selectedDesaId, setSelectedDesaId] = useState<string>('');

  // 1. Resolve Active Territory
  const currentWilayah: WilayahData = useMemo(() => {
    if (selectedDesaId) {
      const found = DESA_DATA.find((d) => d.id === selectedDesaId);
      if (found) return found;
    }
    if (selectedKecamatanId) {
      const found = KECAMATAN_DATA.find((k) => k.id === selectedKecamatanId);
      if (found) return found;
    }
    if (selectedKabKotaId) {
      const found = KABKOTA_DATA.find((k) => k.id === selectedKabKotaId);
      if (found) return found;
    }
    if (selectedProvinsiId && selectedProvinsiId !== 'nasional') {
      const found = PROVINSI_DATA.find((p) => p.id === selectedProvinsiId);
      if (found) return found;
    }
    return NASIONAL_DATA;
  }, [selectedProvinsiId, selectedKabKotaId, selectedKecamatanId, selectedDesaId]);

  // 2. Filter Options strictly sorted by official BPS code
  const availableKabKota = useMemo(() => {
    if (!selectedProvinsiId || selectedProvinsiId === 'nasional') return [];
    return KABKOTA_DATA.filter((k) => k.parentProvinsiId === selectedProvinsiId);
  }, [selectedProvinsiId]);

  const availableKecamatan = useMemo(() => {
    if (!selectedKabKotaId) return [];
    return KECAMATAN_DATA.filter((k) => k.parentKabKotaId === selectedKabKotaId);
  }, [selectedKabKotaId]);

  const availableDesa = useMemo(() => {
    if (!selectedKecamatanId) return [];
    return DESA_DATA.filter((d) => d.parentKecamatanId === selectedKecamatanId);
  }, [selectedKecamatanId]);

  // 3. Boundaries (Polygons) to display on the OpenStreetMap blind map
  const activeBoundaries = useMemo(() => {
    if (selectedKecamatanId && availableDesa.length > 0) {
      return availableDesa;
    }
    if (selectedKabKotaId && availableKecamatan.length > 0) {
      return availableKecamatan;
    }
    if (
      selectedProvinsiId &&
      (selectedProvinsiId === 'dki-jakarta' || selectedProvinsiId === 'jawa-barat') &&
      availableKabKota.length > 0
    ) {
      return availableKabKota;
    }
    if (selectedProvinsiId && selectedProvinsiId !== 'nasional') {
      const prov = PROVINSI_DATA.find((p) => p.id === selectedProvinsiId);
      return prov ? [prov] : [];
    }
    // Return all provinces across the archipelago at root view
    return PROVINSI_DATA;
  }, [
    selectedProvinsiId,
    selectedKabKotaId,
    selectedKecamatanId,
    availableKabKota,
    availableKecamatan,
    availableDesa,
  ]);

  // Handlers for Sequential Filter Selection
  const handleProvinsiChange = (provId: string) => {
    setSelectedProvinsiId(provId);
    setSelectedKabKotaId('');
    setSelectedKecamatanId('');
    setSelectedDesaId('');
  };

  const handleKabKotaChange = (kabKotaId: string) => {
    setSelectedKabKotaId(kabKotaId);
    setSelectedKecamatanId('');
    setSelectedDesaId('');
  };

  const handleKecamatanChange = (kecId: string) => {
    setSelectedKecamatanId(kecId);
    setSelectedDesaId('');
  };

  const handleDesaChange = (desaId: string) => {
    setSelectedDesaId(desaId);
  };

  const handleResetNasional = () => {
    setSelectedProvinsiId('nasional');
    setSelectedKabKotaId('');
    setSelectedKecamatanId('');
    setSelectedDesaId('');
  };

  // Direct selection from Map Boundary Click (Area Batas Wilayah Poligon)
  const handleBoundaryClick = (wilayah: WilayahData) => {
    if (wilayah.level === 'provinsi') {
      handleProvinsiChange(wilayah.id);
    } else if (wilayah.level === 'kabupaten') {
      if (wilayah.parentProvinsiId) setSelectedProvinsiId(wilayah.parentProvinsiId);
      handleKabKotaChange(wilayah.id);
    } else if (wilayah.level === 'kecamatan') {
      if (wilayah.parentProvinsiId) setSelectedProvinsiId(wilayah.parentProvinsiId);
      if (wilayah.parentKabKotaId) setSelectedKabKotaId(wilayah.parentKabKotaId);
      handleKecamatanChange(wilayah.id);
    } else if (wilayah.level === 'desa') {
      if (wilayah.parentProvinsiId) setSelectedProvinsiId(wilayah.parentProvinsiId);
      if (wilayah.parentKabKotaId) setSelectedKabKotaId(wilayah.parentKabKotaId);
      if (wilayah.parentKecamatanId) setSelectedKecamatanId(wilayah.parentKecamatanId);
      handleDesaChange(wilayah.id);
    }
  };

  const isDetailSupported =
    selectedProvinsiId === 'dki-jakarta' || selectedProvinsiId === 'jawa-barat';

  return (
    <div className={`space-y-6 ${className}`}>
      {/* ======================================================== */}
      {/* 1. TOP CONTROL BAR: Horizontal 4-Level Sequential Filter */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200/90 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <span className="text-sm md:text-base font-bold text-slate-900 tracking-tight block">
                Filter Wilayah Kerja Prioritas
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Pilih bertingkat berdasarkan kode wilayah BPS untuk memfokuskan peta dan capaian
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Active Hierarchy Breadcrumb */}
            <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-400 text-[10px] uppercase font-bold">Lokus:</span>
              <span>
                {selectedProvinsiId === 'nasional'
                  ? 'Seluruh Indonesia'
                  : PROVINSI_DATA.find((p) => p.id === selectedProvinsiId)?.name}
              </span>
              {selectedKabKotaId && (
                <>
                  <ChevronRight className="h-3 w-3 text-slate-400 inline" />
                  <span>{KABKOTA_DATA.find((k) => k.id === selectedKabKotaId)?.name}</span>
                </>
              )}
              {selectedKecamatanId && (
                <>
                  <ChevronRight className="h-3 w-3 text-slate-400 inline" />
                  <span>{KECAMATAN_DATA.find((k) => k.id === selectedKecamatanId)?.name}</span>
                </>
              )}
              {selectedDesaId && (
                <>
                  <ChevronRight className="h-3 w-3 text-slate-400 inline" />
                  <span>{DESA_DATA.find((d) => d.id === selectedDesaId)?.name}</span>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={handleResetNasional}
              title="Reset ke Seluruh Indonesia"
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 border border-slate-200"
            >
              <RotateCcw className="h-3.5 w-3.5 text-slate-600" />
              Reset
            </button>
          </div>
        </div>

        {/* 4 Sequential Dropdowns in Wide Grid (No numeric codes, clean region names) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Filter 1: Provinsi */}
          <div>
            <label
              htmlFor="filter-provinsi"
              className="block text-xs font-bold text-slate-800 mb-1.5"
            >
              Provinsi
            </label>
            <select
              id="filter-provinsi"
              value={selectedProvinsiId}
              onChange={(e) => handleProvinsiChange(e.target.value)}
              className="w-full text-xs font-semibold bg-white text-slate-900 border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors shadow-2xs"
            >
              <option value="nasional">Seluruh Indonesia</option>
              {PROVINSI_DATA.map((prov) => (
                <option key={prov.id} value={prov.id}>
                  {prov.name} {prov.isPrioritas ? '• Prioritas' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Filter 2: Kabupaten / Kota */}
          <div>
            <label
              htmlFor="filter-kabkota"
              className="block text-xs font-bold text-slate-800 mb-1.5"
            >
              Kabupaten / Kota
            </label>
            <select
              id="filter-kabkota"
              value={selectedKabKotaId}
              disabled={!isDetailSupported}
              onChange={(e) => handleKabKotaChange(e.target.value)}
              className={`w-full text-xs font-semibold rounded-xl p-2.5 border transition-colors shadow-2xs ${
                !isDetailSupported
                  ? 'bg-slate-100/80 text-slate-400 border-slate-200 cursor-not-allowed'
                  : 'bg-white text-slate-900 border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600'
              }`}
            >
              <option value="">
                {!isDetailSupported
                  ? selectedProvinsiId === 'nasional'
                    ? '— Pilih Provinsi terlebih dahulu —'
                    : '— Detail hanya sampai provinsi —'
                  : '— Pilih Kabupaten / Kota —'}
              </option>
              {availableKabKota.map((kab) => (
                <option key={kab.id} value={kab.id}>
                  {kab.name} {kab.isPrioritas ? '• Prioritas' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Filter 3: Kecamatan */}
          <div>
            <label
              htmlFor="filter-kecamatan"
              className="block text-xs font-bold text-slate-800 mb-1.5"
            >
              Kecamatan
            </label>
            <select
              id="filter-kecamatan"
              value={selectedKecamatanId}
              disabled={!selectedKabKotaId}
              onChange={(e) => handleKecamatanChange(e.target.value)}
              className={`w-full text-xs font-semibold rounded-xl p-2.5 border transition-colors shadow-2xs ${
                !selectedKabKotaId
                  ? 'bg-slate-100/80 text-slate-400 border-slate-200 cursor-not-allowed'
                  : 'bg-white text-slate-900 border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600'
              }`}
            >
              <option value="">
                {!selectedKabKotaId
                  ? '— Pilih Kab/Kota terlebih dahulu —'
                  : '— Pilih Kecamatan —'}
              </option>
              {availableKecamatan.map((kec) => (
                <option key={kec.id} value={kec.id}>
                  {kec.name} {kec.isPrioritas ? '• Prioritas' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Filter 4: Desa / Kelurahan */}
          <div>
            <label
              htmlFor="filter-desa"
              className="block text-xs font-bold text-slate-800 mb-1.5"
            >
              Desa / Kelurahan
            </label>
            <select
              id="filter-desa"
              value={selectedDesaId}
              disabled={!selectedKecamatanId}
              onChange={(e) => handleDesaChange(e.target.value)}
              className={`w-full text-xs font-semibold rounded-xl p-2.5 border transition-colors shadow-2xs ${
                !selectedKecamatanId
                  ? 'bg-slate-100/80 text-slate-400 border-slate-200 cursor-not-allowed'
                  : 'bg-white text-slate-900 border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600'
              }`}
            >
              <option value="">
                {!selectedKecamatanId
                  ? '— Pilih Kecamatan terlebih dahulu —'
                  : '— Pilih Desa / Kelurahan —'}
              </option>
              {availableDesa.map((desa) => (
                <option key={desa.id} value={desa.id}>
                  {desa.name} {desa.isPrioritas ? '• Prioritas' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* High-Contrast Clear User Guidance Banner */}
        <div className="mt-4 p-3 rounded-xl bg-blue-50/80 border border-blue-200/90 text-xs text-blue-950 font-medium flex items-center gap-2.5">
          <Info className="h-4 w-4 text-blue-700 shrink-0" />
          <span>
            <strong>Panduan Interaktif:</strong> Klik langsung pada <strong>area batas wilayah</strong> di peta untuk menelaah Capaian RPJMN, Isu Strategis, Agenda Transformasi, IMM, dan 4 Pilar PKPN di wilayah terpilih.
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. WIDE MAP: OpenStreetMap Blind Map with Vignette Mask  */}
      {/* ======================================================== */}
      <div className="w-full">
        <LeafletMapWrapper
          selectedWilayah={currentWilayah}
          availableBoundaries={activeBoundaries}
          onSelectWilayah={handleBoundaryClick}
          onResetNasional={handleResetNasional}
        />
      </div>

      {/* ======================================================== */}
      {/* 3. STRATEGIC REGION CARD (Capaian RPJMN, Isu Strategis,  */}
      {/*    Agenda Transformasi, IMM, dan 4 Pilar PKPN)           */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200/90 shadow-2xs space-y-6">
        {/* Header Profile + 4 Macro Indicator Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pb-5 border-b border-slate-100 items-center">
          {/* Territory Identification */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-bold tracking-wide">
                {currentWilayah.level === 'nasional'
                  ? 'Cakupan Nasional'
                  : currentWilayah.level === 'provinsi'
                  ? 'Tingkat Provinsi'
                  : currentWilayah.level === 'kabupaten'
                  ? 'Tingkat Kabupaten/Kota'
                  : currentWilayah.level === 'kecamatan'
                  ? 'Tingkat Kecamatan'
                  : 'Tingkat Desa/Kelurahan'}
              </span>
              {currentWilayah.isPrioritas ? (
                <span className="px-2.5 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                  Wilayah Prioritas Percepatan PKPN
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-medium">
                  {currentWilayah.kategoriWilayah}
                </span>
              )}
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-1.5">
              {currentWilayah.name}
            </h2>

            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              {currentWilayah.ringkasanStrategis}
            </p>
          </div>

          {/* 4 Macro KPI Cards: Capaian RPJMN, IMM, Kemiskinan, Status PKPN */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3 items-stretch">
            {/* Box 1: Capaian RPJMN */}
            <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                Capaian RPJMN
              </span>
              <div className="my-0.5">
                <span className="text-2xl font-black text-slate-900 tabular-nums">
                  {getWilayahCapaianRpjmn(currentWilayah)}
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1 overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      (parseFloat(
                        getWilayahCapaianRpjmn(currentWilayah)
                          .replace('%', '')
                          .replace(',', '.')
                      ) /
                        80) *
                        100
                    )}%`,
                  }}
                />
              </div>
              <span className="text-[10px] text-slate-500 font-medium mt-1">
                Target: {getWilayahTargetRpjmn(currentWilayah)}
              </span>
            </div>

            {/* Box 2: Indeks IMM */}
            <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                Indeks Modal Manusia
              </span>
              <div className="my-0.5">
                <span className="text-2xl font-black text-slate-900 tabular-nums">
                  {currentWilayah.imm}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">
                Skala 0,00 – 1,00
              </span>
            </div>

            {/* Box 3: Tingkat Kemiskinan */}
            <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                Tingkat Kemiskinan
              </span>
              <div className="my-0.5">
                <span className="text-2xl font-black text-slate-900 tabular-nums">
                  {currentWilayah.tingkatKemiskinan}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">
                Ekstrem: {currentWilayah.kemiskinanEkstrem}
              </span>
            </div>

            {/* Box 4: Status PKPN */}
            <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                Orkestrasi PKPN
              </span>
              <div className="my-0.5">
                <span className="text-2xl font-black text-blue-700 tabular-nums">
                  4 Pilar
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">
                Pengawalan Aktif
              </span>
            </div>
          </div>
        </div>

        {/* Dual Strategic Banners: Isu Strategis & Agenda Transformasi PMK */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card A: Isu Strategis */}
          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2 text-amber-900 font-bold text-xs">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Isu Strategis Wilayah:</span>
              </div>
              <p className="text-xs text-slate-800 leading-relaxed font-medium">
                {getWilayahIsuStrategis(currentWilayah)}
              </p>
            </div>
            <div className="text-[10.5px] text-amber-700/90 font-semibold mt-3 pt-2 border-t border-amber-200/60">
              Fokus mitigasi hambatan &amp; akselerasi sasaran pembangunan
            </div>
          </div>

          {/* Card B: Agenda Transformasi */}
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2 text-blue-900 font-bold text-xs">
                <Compass className="h-4 w-4 text-blue-600 shrink-0" />
                <span>Agenda Transformasi PMK 2025–2029:</span>
              </div>
              <p className="text-xs text-slate-800 leading-relaxed font-medium">
                {getWilayahAgendaTransformasi(currentWilayah)}
              </p>
            </div>
            <div className="text-[10.5px] text-blue-700/90 font-semibold mt-3 pt-2 border-t border-blue-200/60">
              Konvergensi lintas K/L &amp; pemerintah daerah berkelanjutan
            </div>
          </div>
        </div>

        {/* 4 Pillars Capaian Strategis Side-by-Side (High readability, structured stats, no long jammed sentences) */}
        <div className="my-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Capaian Strategis 4 Pilar Utama di Wilayah Terpilih:
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              Data Terpadu Kemenko PMK
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Pilar 1: Pendidikan */}
            <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 flex flex-col justify-between hover:border-blue-300 transition-colors min-h-[220px]">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-bold text-slate-900">
                    Revitalisasi Sarana Satdik
                  </span>
                  <div className="w-6 h-6 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                    <GraduationCap className="h-3.5 w-3.5" />
                  </div>
                </div>

                {/* Hero Number Highlight */}
                <div className="mb-3">
                  <div className="text-2xl md:text-3xl font-black text-slate-900 tabular-nums tracking-tight">
                    {currentWilayah.pillarDetails?.pendidikan?.heroValue}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                    {currentWilayah.pillarDetails?.pendidikan?.heroLabel}
                  </div>
                </div>

                {/* Structured Key-Value Rows */}
                <div className="space-y-1.5 py-2.5 border-t border-slate-200/80 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      {currentWilayah.pillarDetails?.pendidikan?.metric1?.label}
                    </span>
                    <span className="text-[11px] font-bold text-slate-900">
                      {currentWilayah.pillarDetails?.pendidikan?.metric1?.value}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      {currentWilayah.pillarDetails?.pendidikan?.metric2?.label}
                    </span>
                    <span className="text-[11px] font-bold text-slate-900">
                      {currentWilayah.pillarDetails?.pendidikan?.metric2?.value}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 leading-snug pt-2.5 border-t border-slate-100 font-normal">
                {currentWilayah.pillarDetails?.pendidikan?.keterangan}
              </p>
            </div>

            {/* Pilar 2: Kesehatan */}
            <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 flex flex-col justify-between hover:border-emerald-300 transition-colors min-h-[220px]">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-bold text-slate-900">
                    Layanan Kesehatan Dasar &amp; CKG
                  </span>
                  <div className="w-6 h-6 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                    <HeartPulse className="h-3.5 w-3.5" />
                  </div>
                </div>

                {/* Hero Number Highlight */}
                <div className="mb-3">
                  <div className="text-2xl md:text-3xl font-black text-slate-900 tabular-nums tracking-tight">
                    {currentWilayah.pillarDetails?.kesehatan?.heroValue}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                    {currentWilayah.pillarDetails?.kesehatan?.heroLabel}
                  </div>
                </div>

                {/* Structured Key-Value Rows */}
                <div className="space-y-1.5 py-2.5 border-t border-slate-200/80 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      {currentWilayah.pillarDetails?.kesehatan?.metric1?.label}
                    </span>
                    <span className="text-[11px] font-bold text-slate-900">
                      {currentWilayah.pillarDetails?.kesehatan?.metric1?.value}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      {currentWilayah.pillarDetails?.kesehatan?.metric2?.label}
                    </span>
                    <span className="text-[11px] font-bold text-slate-900">
                      {currentWilayah.pillarDetails?.kesehatan?.metric2?.value}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 leading-snug pt-2.5 border-t border-slate-100 font-normal">
                {currentWilayah.pillarDetails?.kesehatan?.keterangan}
              </p>
            </div>

            {/* Pilar 3: Ketahanan Bencana */}
            <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 flex flex-col justify-between hover:border-amber-300 transition-colors min-h-[220px]">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-bold text-slate-900">
                    Infrastruktur Pascabencana
                  </span>
                  <div className="w-6 h-6 rounded-md bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                    <ShieldAlert className="h-3.5 w-3.5" />
                  </div>
                </div>

                {/* Hero Number Highlight */}
                <div className="mb-3">
                  <div className="text-2xl md:text-3xl font-black text-slate-900 tabular-nums tracking-tight">
                    {currentWilayah.pillarDetails?.bencana?.heroValue}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                    {currentWilayah.pillarDetails?.bencana?.heroLabel}
                  </div>
                </div>

                {/* Structured Key-Value Rows */}
                <div className="space-y-1.5 py-2.5 border-t border-slate-200/80 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      {currentWilayah.pillarDetails?.bencana?.metric1?.label}
                    </span>
                    <span className="text-[11px] font-bold text-slate-900">
                      {currentWilayah.pillarDetails?.bencana?.metric1?.value}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      {currentWilayah.pillarDetails?.bencana?.metric2?.label}
                    </span>
                    <span className="text-[11px] font-bold text-slate-900">
                      {currentWilayah.pillarDetails?.bencana?.metric2?.value}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 leading-snug pt-2.5 border-t border-slate-100 font-normal">
                {currentWilayah.pillarDetails?.bencana?.keterangan}
              </p>
            </div>

            {/* Pilar 4: Penurunan Kemiskinan */}
            <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 flex flex-col justify-between hover:border-rose-300 transition-colors min-h-[220px]">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-bold text-slate-900">
                    Perlindungan Sosial &amp; Kemiskinan
                  </span>
                  <div className="w-6 h-6 rounded-md bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700">
                    <TrendingDown className="h-3.5 w-3.5" />
                  </div>
                </div>

                {/* Hero Number Highlight */}
                <div className="mb-3">
                  <div className="text-2xl md:text-3xl font-black text-slate-900 tabular-nums tracking-tight">
                    {currentWilayah.pillarDetails?.kemiskinan?.heroValue}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                    {currentWilayah.pillarDetails?.kemiskinan?.heroLabel}
                  </div>
                </div>

                {/* Structured Key-Value Rows */}
                <div className="space-y-1.5 py-2.5 border-t border-slate-200/80 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      {currentWilayah.pillarDetails?.kemiskinan?.metric1?.label}
                    </span>
                    <span className="text-[11px] font-bold text-slate-900">
                      {currentWilayah.pillarDetails?.kemiskinan?.metric1?.value}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      {currentWilayah.pillarDetails?.kemiskinan?.metric2?.label}
                    </span>
                    <span className="text-[11px] font-bold text-slate-900">
                      {currentWilayah.pillarDetails?.kemiskinan?.metric2?.value}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 leading-snug pt-2.5 border-t border-slate-100 font-normal">
                {currentWilayah.pillarDetails?.kemiskinan?.keterangan}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Coordination Banner: Kemenko PMK */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start sm:items-center gap-2.5">
            <span className="font-extrabold text-slate-900 shrink-0">
              Fokus Pengawalan Kemenko PMK:
            </span>
            <span className="text-slate-700 font-normal leading-relaxed">
              {currentWilayah.catatanStrategis}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 shrink-0 font-medium">
            Sumber: Konsolidasi 4 Pilar &amp; BPS 2026
          </span>
        </div>
      </div>
    </div>
  );
};
