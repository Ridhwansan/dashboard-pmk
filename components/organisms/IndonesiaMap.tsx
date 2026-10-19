'use client';

import React, { useState, useMemo, useRef } from 'react';
import {
  WilayahData,
  NASIONAL_DATA,
  PROVINSI_DATA,
  KABKOTA_DATA,
  KECAMATAN_DATA,
  DESA_DATA,
} from '@/data/wilayahData';
import {
  MapPillarId,
  MAP_PILLARS,
  getIndicatorsByPillar,
  getIndicatorById,
  getDefaultIndicatorForPillar,
} from '@/data/mapIndicators';
import { AVAILABLE_YEARS, PeriodYear } from '@/data/pillarAgregatData';
import { LeafletMapWrapper } from '@/components/molecules/LeafletMapWrapper';
import { PillarAgregatListCard } from '@/components/molecules/PillarAgregatListCard';
import {
  RotateCcw,
  ChevronDown,
  Check,
  Calendar,
  AlertTriangle,
  Target,
} from 'lucide-react';

interface IndonesiaMapProps {
  className?: string;
  onSelectPillar?: (id: string) => void;
  initialPillar?: MapPillarId | null;
}

export const IndonesiaMap: React.FC<IndonesiaMapProps> = ({
  className = '',
  onSelectPillar,
  initialPillar = 'pendidikan',
}) => {
  // 1. Pillar and Sub-Indicator Filter States (default: Pendidikan & Revitalisasi Satdik)
  const [activePillar, setActivePillar] = useState<MapPillarId | null>(initialPillar || 'pendidikan');
  const [activeIndicatorId, setActiveIndicatorId] = useState<string | null>(() => {
    return initialPillar ? getDefaultIndicatorForPillar(initialPillar).id : 'revitalisasi_satdik';
  });

  // 2. Annual Period Filter State (2025 - 2029, default: 2026)
  const [selectedYear, setSelectedYear] = useState<PeriodYear>(2026);

  // Dropdown open state for hover / click
  const [openDropdownPillar, setOpenDropdownPillar] = useState<MapPillarId | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (pillarId: MapPillarId) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setOpenDropdownPillar(pillarId);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setOpenDropdownPillar(null);
    }, 200);
  };

  // 2. Cascading Territory Filter States
  const [selectedProvinsiId, setSelectedProvinsiId] = useState<string>('nasional');
  const [selectedKabKotaId, setSelectedKabKotaId] = useState<string>('');
  const [selectedKecamatanId, setSelectedKecamatanId] = useState<string>('');
  const [selectedDesaId, setSelectedDesaId] = useState<string>('');

  // Handle Pillar Switch: update active pillar and select its default indicator
  const handlePillarChange = (newPillar: MapPillarId) => {
    setActivePillar(newPillar);
    const defaultInd = getDefaultIndicatorForPillar(newPillar);
    setActiveIndicatorId(defaultInd.id);
  };

  // Handle Sub-Indicator Select from Dropdown
  const handleSelectIndicator = (pillarId: MapPillarId, indicatorId: string) => {
    setActivePillar(pillarId);
    setActiveIndicatorId(indicatorId);
    setOpenDropdownPillar(null);
  };

  // Designated Focus Indicator
  const FOCUS_PILLAR: MapPillarId = 'pendidikan';
  const FOCUS_INDICATOR_ID = 'revitalisasi_satdik';

  const isAtFocusIndicator =
    activePillar === FOCUS_PILLAR && activeIndicatorId === FOCUS_INDICATOR_ID;

  const handleResetToFocus = () => {
    setActivePillar(FOCUS_PILLAR);
    setActiveIndicatorId(FOCUS_INDICATOR_ID);
  };

  // Active indicator definition (null when user hasn't selected a pillar yet)
  const currentIndicator = useMemo(() => {
    if (!activeIndicatorId && !activePillar) return null;
    return getIndicatorById(activeIndicatorId, activePillar);
  }, [activeIndicatorId, activePillar]);

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
    <div className={`space-y-5 ${className}`}>
      {/* ======================================================== */}
      {/* 1. COMPACT & SIMPLIFIED FILTER TOOLBAR                   */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 shadow-2xs space-y-3">
        {/* Row 1: Filter Wilayah (Lokus Administratif) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-sm font-semibold text-slate-600 shrink-0">
              Wilayah:
            </span>

            {/* Selects with 40px height and proportional chevron arrows */}
            <div className="flex items-center gap-2 flex-wrap">
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

          {/* Right side of Row 1: Filter Periode Tahun & Reset Wilayah */}
          <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto flex-wrap">
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
                className="h-[40px] px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer flex items-center gap-1.5 border border-slate-200/90 shrink-0"
              >
                <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
                <span>Reset Wilayah</span>
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Filter Pilar & Sub-Indikator (Clean 40px Buttons, Proportional Arrows) */}
        <div className="pt-3 border-t border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 overflow-x-visible flex-wrap sm:flex-nowrap">
            <span className="text-sm font-semibold text-slate-600 shrink-0 mr-0.5">
              Pilar:
            </span>

            {MAP_PILLARS.map((pilar) => {
              const isSelected = activePillar === pilar.id;
              const pilarIndicators = getIndicatorsByPillar(pilar.id);
              const isOpen = openDropdownPillar === pilar.id;

              return (
                <div
                  key={pilar.id}
                  className="relative"
                  onMouseEnter={() => handleMouseEnter(pilar.id)}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    type="button"
                    onClick={() => {
                      handlePillarChange(pilar.id);
                      setOpenDropdownPillar((prev) => (prev === pilar.id ? null : pilar.id));
                    }}
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                    className={`h-[40px] inline-flex items-center gap-2 px-3.5 sm:px-4 rounded-xl text-xs sm:text-sm transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white font-semibold shadow-xs hover:bg-blue-700'
                        : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200/90 font-medium hover:border-slate-300'
                    }`}
                  >
                    <span>{pilar.shortName}</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-150 shrink-0 ${
                        isOpen ? 'rotate-180' : ''
                      } ${isSelected ? 'text-white/90' : 'text-slate-400'}`}
                    />
                  </button>

                  {/* Clean Floating Dropdown for Sub-Indicators */}
                  {isOpen && (
                    <div
                      className="absolute left-0 top-full pt-2 z-40 w-72 sm:w-80 animate-in fade-in zoom-in-95 duration-100"
                      onMouseEnter={() => handleMouseEnter(pilar.id)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="bg-white rounded-xl border border-slate-200 shadow-xl p-1.5 text-xs">
                        <div className="space-y-0.5 max-h-64 overflow-y-auto custom-scrollbar">
                          {pilarIndicators.map((ind) => {
                            const isIndActive = activeIndicatorId === ind.id;
                            return (
                              <button
                                key={ind.id}
                                type="button"
                                onClick={() => handleSelectIndicator(pilar.id, ind.id)}
                                className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                                  isIndActive
                                    ? 'bg-blue-50 text-blue-900 font-semibold'
                                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                              >
                                <div className="min-w-0 pr-1">
                                  <div className="text-xs font-medium text-slate-800 truncate">
                                    {ind.name}
                                  </div>
                                </div>
                                {isIndActive && (
                                  <Check className="h-4 w-4 text-blue-600 shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. INDIKATOR FOKUS BANNER (~80px Height, Pastel Blue)    */}
      {/* ======================================================== */}
      <div className="w-full min-h-[76px] md:h-[80px] bg-white rounded-2xl border border-slate-200/90 shadow-2xs px-4 sm:px-5 py-3 md:py-0 flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors">
        {/* Left Side: Pastel Blue Chip & Indicator Title */}
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap min-w-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-bold border border-blue-200/80 text-xs shrink-0 shadow-2xs">
            <Target className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>Indikator Fokus</span>
          </span>

          <div className="h-6 w-px bg-slate-200 hidden sm:block shrink-0" />

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm sm:text-base font-bold text-slate-900 truncate">
                {currentIndicator?.name || 'Revitalisasi (satdik)'}
              </span>
              <span className="text-xs font-medium text-slate-500">
                ({activePillar && activePillar !== 'all' ? MAP_PILLARS.find((p) => p.id === activePillar)?.name : 'Pilar Pendidikan'})
              </span>
            </div>
            <p className="text-[11.5px] text-slate-500 truncate max-w-xl hidden lg:block">
              {currentIndicator?.description || 'Pengawalan target prioritas dan percepatan wilayah tertinggal'}
            </p>
          </div>
        </div>

        {/* Right Side: Metrics & Return to Focus Button */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0 flex-wrap sm:flex-nowrap justify-between md:justify-end border-t md:border-t-0 pt-2 md:pt-0 border-slate-100">
          <div className="flex items-center gap-2.5 sm:gap-3 text-xs text-slate-600 font-medium">
            <span>
              Target {selectedYear}:{' '}
              <strong className="text-slate-900 font-semibold">
                {currentIndicator?.target2026 || '80.282 satdik'}
              </strong>
            </span>
            <span className="text-slate-300">·</span>
            <span>
              Realisasi:{' '}
              <strong className="text-slate-900 font-semibold">
                {currentIndicator?.nationalValue || '36.669 satdik (45,7%)'}
              </strong>
            </span>
          </div>

          {/* Quick Button to return to Focus Indicator if changed */}
          {isAtFocusIndicator ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Sedang Aktif</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResetToFocus}
              title="Arahkan kembali ke Indikator Fokus (Revitalisasi Satdik)"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/90 transition-all cursor-pointer shadow-2xs group shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5 text-blue-600 group-hover:-rotate-90 transition-transform duration-200" />
              <span>Ke Indikator Fokus</span>
            </button>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. EXECUTIVE WORKSPACE: 30% AGREGAT LIST & 70% PETA      */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-4.5 items-stretch w-full">
        {/* Left Column: 30% Target & Capaian Agregat Nasional Pilar */}
        <div className="lg:col-span-3 h-[540px] lg:h-[580px] xl:h-[620px] flex flex-col">
          <PillarAgregatListCard
            activePillar={activePillar}
            selectedYear={selectedYear}
            activeIndicatorId={activeIndicatorId}
            onSelectIndicator={(indicatorId) => {
              setActiveIndicatorId(indicatorId);
            }}
            onSelectPillar={(pillarId) => {
              handlePillarChange(pillarId);
            }}
          />
        </div>

        {/* Right Column: 70% Peta Geospasial Interaktif */}
        <div className="lg:col-span-7 h-[540px] lg:h-[580px] xl:h-[620px] flex flex-col">
          <LeafletMapWrapper
            selectedWilayah={currentWilayah}
            availableBoundaries={activeBoundaries}
            onSelectWilayah={handleBoundaryClick}
            onResetNasional={handleResetNasional}
            selectedPillar={activePillar}
            selectedIndicator={activeIndicatorId}
          />
        </div>
      </div>
    </div>
  );
};
