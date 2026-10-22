'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  WilayahData,
  NASIONAL_DATA,
  PROVINSI_DATA,
  KABKOTA_DATA,
  KECAMATAN_DATA,
  DESA_DATA,
} from '@/data/wilayahData';
import { MapPillarId } from '@/data/mapIndicators';
import { AVAILABLE_YEARS, PeriodYear } from '@/data/pillarAgregatData';
import { LeafletMapWrapper } from '@/components/molecules/LeafletMapWrapper';
import { WilayahSidePanel } from '@/components/organisms/WilayahSidePanel';
import {
  RotateCcw,
  ChevronDown,
  Maximize2,
  Minimize2,
  MapPin,
} from 'lucide-react';

interface IndonesiaMapProps {
  className?: string;
  onSelectPillar?: (id: string) => void;
  initialPillar?: MapPillarId | null;
  onBackToLanding?: () => void;
  onSwitchToIkhtisar?: () => void;
}

export const IndonesiaMap: React.FC<IndonesiaMapProps> = ({
  className = '',
  onSelectPillar,
  initialPillar = 'pendidikan',
  onBackToLanding,
  onSwitchToIkhtisar,
}) => {
  const wilayahInfoRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sync Leaflet map canvas and lock body scroll when entering/exiting fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 120);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = 'unset';
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen]);

  // 1. Annual Period Filter State (2025 - 2029, default: 2026)
  const [selectedYear, setSelectedYear] = useState<PeriodYear>(2026);

  // 2. Cascading Territory Filter States (default: Nasional / 38 Provinsi)
  const [selectedProvinsiId, setSelectedProvinsiId] = useState<string>('nasional');
  const [selectedKabKotaId, setSelectedKabKotaId] = useState<string>('');
  const [selectedKecamatanId, setSelectedKecamatanId] = useState<string>('');
  const [selectedDesaId, setSelectedDesaId] = useState<string>('');

  // 3. Resolve Active Territory Object
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

  // 4. Territory cascading choices
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

  // 5. Boundaries for GeoJSON mapping
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
    return PROVINSI_DATA;
  }, [
    selectedProvinsiId,
    selectedKabKotaId,
    selectedKecamatanId,
    availableKabKota,
    availableKecamatan,
    availableDesa,
  ]);

  // Handlers for sequential region filtering
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

  // Direct selection from Map Boundary Click
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
      {/* 1. COMPACT & SIMPLIFIED FILTER TOOLBAR                   */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 shadow-2xs space-y-3">
        {/* Row 1: Filter Wilayah (Lokus Administratif) */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-semibold text-slate-700 shrink-0">
              Wilayah:
            </span>

            {/* Selects with 40px height and comfortable gap */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Dropdown 1: Provinsi */}
              <div className="relative">
                <select
                  id="filter-provinsi"
                  aria-label="Pilih Provinsi"
                  value={selectedProvinsiId}
                  onChange={(e) => handleProvinsiChange(e.target.value)}
                  className="h-[40px] appearance-none pl-3.5 pr-9 text-xs sm:text-sm font-semibold bg-slate-50 hover:bg-white text-slate-900 border border-slate-200/90 hover:border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all cursor-pointer w-48 sm:w-56 truncate"
                >
                  <option value="nasional">Seluruh Indonesia (38 Prov)</option>
                  {PROVINSI_DATA.map((prov) => (
                    <option key={prov.id} value={prov.id}>
                      {prov.name} {prov.isPrioritas ? '• Prioritas' : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>

              {/* Dropdown 2: Kabupaten / Kota */}
              <div className="relative">
                <select
                  id="filter-kabkota"
                  aria-label="Pilih Kabupaten atau Kota"
                  value={selectedKabKotaId}
                  disabled={!isDetailSupported}
                  onChange={(e) => handleKabKotaChange(e.target.value)}
                  className={`h-[40px] appearance-none pl-3.5 pr-9 text-xs sm:text-sm font-semibold rounded-xl border transition-all truncate w-36 sm:w-44 ${
                    !isDetailSupported
                      ? 'bg-slate-100/70 text-slate-400 border-slate-200 cursor-not-allowed'
                      : 'bg-slate-50 hover:bg-white text-slate-900 border-slate-200/90 hover:border-slate-300 focus:ring-2 focus:ring-blue-600 focus:bg-white cursor-pointer'
                  }`}
                >
                  <option value="">
                    {!isDetailSupported
                      ? selectedProvinsiId === 'nasional'
                        ? 'Kab/Kota'
                        : 'Detail s.d. Provinsi'
                      : 'Pilih Kab/Kota'}
                  </option>
                  {availableKabKota.map((kab) => (
                    <option key={kab.id} value={kab.id}>
                      {kab.name} {kab.isPrioritas ? '• Prioritas' : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                    !isDetailSupported ? 'text-slate-300' : 'text-slate-400'
                  }`}
                />
              </div>

              {/* Dropdown 3: Kecamatan */}
              <div className="relative">
                <select
                  id="filter-kecamatan"
                  aria-label="Pilih Kecamatan"
                  value={selectedKecamatanId}
                  disabled={!selectedKabKotaId}
                  onChange={(e) => handleKecamatanChange(e.target.value)}
                  className={`h-[40px] appearance-none pl-3.5 pr-9 text-xs sm:text-sm font-semibold rounded-xl border transition-all truncate w-32 sm:w-40 ${
                    !selectedKabKotaId
                      ? 'bg-slate-100/70 text-slate-400 border-slate-200 cursor-not-allowed'
                      : 'bg-slate-50 hover:bg-white text-slate-900 border-slate-200/90 hover:border-slate-300 focus:ring-2 focus:ring-blue-600 focus:bg-white cursor-pointer'
                  }`}
                >
                  <option value="">
                    {!selectedKabKotaId ? 'Kecamatan' : 'Pilih Kecamatan'}
                  </option>
                  {availableKecamatan.map((kec) => (
                    <option key={kec.id} value={kec.id}>
                      {kec.name} {kec.isPrioritas ? '• Prioritas' : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                    !selectedKabKotaId ? 'text-slate-300' : 'text-slate-400'
                  }`}
                />
              </div>

              {/* Dropdown 4: Desa */}
              <div className="relative">
                <select
                  id="filter-desa"
                  aria-label="Pilih Desa atau Kelurahan"
                  value={selectedDesaId}
                  disabled={!selectedKecamatanId}
                  onChange={(e) => handleDesaChange(e.target.value)}
                  className={`h-[40px] appearance-none pl-3.5 pr-9 text-xs sm:text-sm font-semibold rounded-xl border transition-all truncate w-32 sm:w-40 ${
                    !selectedKecamatanId
                      ? 'bg-slate-100/70 text-slate-400 border-slate-200 cursor-not-allowed'
                      : 'bg-slate-50 hover:bg-white text-slate-900 border-slate-200/90 hover:border-slate-300 focus:ring-2 focus:ring-blue-600 focus:bg-white cursor-pointer'
                  }`}
                >
                  <option value="">
                    {!selectedKecamatanId ? 'Desa/Kel' : 'Pilih Desa'}
                  </option>
                  {availableDesa.map((desa) => (
                    <option key={desa.id} value={desa.id}>
                      {desa.name} {desa.isPrioritas ? '• Prioritas' : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                    !selectedKecamatanId ? 'text-slate-300' : 'text-slate-400'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Right side: Filter Periode Tahun, Reset Wilayah, and Layar Penuh Peta Button */}
          <div className="flex items-center gap-3 shrink-0 self-start lg:self-auto ml-auto flex-wrap sm:flex-nowrap">
            {/* Filter Periode Tahun Dropdown */}
            <div className="flex items-center gap-2">
              <label htmlFor="filter-tahun" className="text-sm font-semibold text-slate-600 shrink-0">
                Tahun:
              </label>
              <div className="relative">
                <select
                  id="filter-tahun"
                  aria-label="Pilih Periode Tahun"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value) as PeriodYear)}
                  className="h-[40px] appearance-none pl-3.5 pr-8 w-24 sm:w-28 text-xs sm:text-sm font-semibold bg-slate-50 hover:bg-white text-slate-900 border border-slate-200/90 hover:border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all cursor-pointer"
                >
                  {AVAILABLE_YEARS.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* Reset Wilayah Button */}
            {selectedProvinsiId !== 'nasional' && (
              <button
                type="button"
                onClick={handleResetNasional}
                title="Kembali ke tampilan Seluruh Indonesia"
                className="h-[40px] px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer flex items-center gap-2 border border-slate-200/90 shrink-0"
              >
                <RotateCcw className="h-4 w-4 text-slate-500" />
                <span>Reset Wilayah</span>
              </button>
            )}

            {/* Fullscreen Map Toggle Button */}
            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              className="h-[40px] inline-flex items-center gap-2 px-3.5 sm:px-4 rounded-xl text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200/90 shadow-2xs transition-all cursor-pointer shrink-0"
              title="Perbesar Peta ke Layar Penuh"
            >
              <Maximize2 className="w-4 h-4 text-blue-600" />
              <span>Layar Penuh Peta</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. PETA (70%) & SECTION PENJELASAN WILAYAH (30%)         */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-5 lg:gap-6 items-stretch">
        {/* Section Peta Geospasial: 70% Lebar Layar (7 Kolom) */}
        <div className="lg:col-span-7 h-[560px] sm:h-[620px] lg:h-[720px] flex flex-col rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs relative bg-slate-50">
          <LeafletMapWrapper
            selectedWilayah={currentWilayah}
            availableBoundaries={activeBoundaries}
            onSelectWilayah={handleBoundaryClick}
            onResetNasional={handleResetNasional}
          />
        </div>

        {/* Section Penjelasan Wilayah: 30% Lebar Layar (3 Kolom) */}
        <div className="lg:col-span-3 h-[560px] sm:h-[620px] lg:h-[720px] flex flex-col">
          <WilayahSidePanel
            wilayah={currentWilayah}
            selectedYear={selectedYear}
            onResetNasional={handleResetNasional}
          />
        </div>
      </div>

      {/* Fullscreen Map Overlay (when isFullscreen is active) */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[9999] bg-slate-950 w-screen h-screen overflow-hidden animate-in fade-in duration-150">
          {/* Fullscreen Map Canvas fills 100% of the screen */}
          <div className="absolute inset-0 w-full h-full z-0">
            <LeafletMapWrapper
              selectedWilayah={currentWilayah}
              availableBoundaries={activeBoundaries}
              onSelectWilayah={handleBoundaryClick}
              onResetNasional={handleResetNasional}
              isFullscreen={true}
            />
          </div>

          {/* Floating Filter Menu on Right Side extending vertically downwards */}
          <aside
            aria-label="Panel Profil Wilayah Layar Penuh"
            className="absolute top-4 right-4 z-[1000] w-80 sm:w-96 max-h-[calc(100vh-2rem)] flex flex-col gap-2.5 pointer-events-auto"
          >
            {/* Header: Lokus Dropdown Selector & Exit Fullscreen Button */}
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 border border-slate-200/90 shadow-xl flex items-center justify-between gap-2 shrink-0">
              <div className="relative flex-1 min-w-0">
                <select
                  id="fullscreen-wilayah-filter"
                  aria-label="Pilih Wilayah Peta"
                  value={selectedProvinsiId}
                  onChange={(e) => handleProvinsiChange(e.target.value)}
                  className="w-full h-[36px] appearance-none pl-3 pr-8 text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-200 hover:border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all cursor-pointer truncate shadow-2xs"
                >
                  <option value="nasional">Seluruh Indonesia (38 Prov)</option>
                  {PROVINSI_DATA.map((prov) => (
                    <option key={prov.id} value={prov.id}>
                      {prov.name} {prov.isPrioritas ? '• Prioritas' : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>

              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="h-[36px] px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
                title="Keluar Layar Penuh (ESC)"
              >
                <Minimize2 className="w-3.5 h-3.5 text-white" />
                <span className="hidden sm:inline">Keluar</span>
                <kbd className="text-[10px] bg-slate-800 px-1 py-0.5 rounded text-slate-300">
                  ESC
                </kbd>
              </button>
            </div>

            {/* Same 4-Pillar Card Section (WilayahSidePanel) */}
            <div className="flex-1 min-h-0 overflow-hidden shadow-2xl rounded-2xl">
              <WilayahSidePanel
                wilayah={currentWilayah}
                selectedYear={selectedYear}
                onResetNasional={handleResetNasional}
                className="h-full max-h-[calc(100vh-5.5rem)] shadow-none"
              />
            </div>
          </aside>
        </div>
      )}

    </div>
  );
};
