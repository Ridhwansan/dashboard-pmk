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
import { WilayahInfoSection } from '@/components/organisms/WilayahInfoSection';
import {
  RotateCcw,
  ChevronDown,
  Maximize2,
  Minimize2,
  MapPin,
  Check,
  Calendar,
  AlertTriangle,
  Target,
  ArrowLeft,
  BarChart3,
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

    // Scroll smoothly to territory details under map
    setTimeout(() => {
      wilayahInfoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 150);
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

          {/* Right side of Row 1: Filter Periode Tahun & Reset Wilayah with generous whitespace */}
          <div className="flex items-center gap-4 shrink-0 self-start lg:self-auto ml-auto">
            {/* Filter Periode Tahun Dropdown */}
            <div className="flex items-center gap-2.5">
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
                className="h-[40px] px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer flex items-center gap-2 border border-slate-200/90 shrink-0"
              >
                <RotateCcw className="h-4 w-4 text-slate-500" />
                <span>Reset Wilayah</span>
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Filter Pilar & Sub-Indikator with generous whitespace */}
        <div className="pt-3.5 border-t border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-x-visible flex-wrap">
            <span className="text-sm font-semibold text-slate-700 shrink-0 mr-1">
              Pilar:
            </span>

            {MAP_PILLARS.map((pilar, pIdx) => {
              const isSelected = activePillar === pilar.id;
              const pilarIndicators = getIndicatorsByPillar(pilar.id);
              const isOpen = openDropdownPillar === pilar.id;
              const isRightAligned = pIdx >= 2;

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
                      className={`absolute ${
                        isRightAligned ? 'right-0 sm:right-0 left-auto' : 'left-0'
                      } top-full pt-2 z-40 w-72 sm:w-80 max-w-[calc(100vw-2rem)] animate-in fade-in zoom-in-95 duration-100`}
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
      {/* 2. STATUS INDIKATOR & TARGET REALISASI                   */}
      {/* ======================================================== */}
      <div className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-2xs px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        {/* Left Side: Indicator Title & Pillar Name (Clean typography, no chips) */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0 space-y-0.5">
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
              {currentIndicator?.name || 'Revitalisasi (satdik)'}
            </h3>
            <p className="text-xs font-semibold text-slate-500">
              {activePillar && activePillar !== 'all'
                ? MAP_PILLARS.find((p) => p.id === activePillar)?.name
                : 'Pilar Pendidikan'}
            </p>
          </div>
        </div>

        {/* Right Side: Target, Realisasi & Action Button with Generous Whitespace */}
        <div className="flex items-center gap-4 sm:gap-6 shrink-0 flex-wrap sm:flex-nowrap justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
          <div className="flex items-center gap-4 text-xs text-slate-600 font-medium">
            <span>
              Target {selectedYear}:{' '}
              <strong className="text-slate-900 font-bold">
                {currentIndicator?.target2026 || '80.282 satdik'}
              </strong>
            </span>
            <span className="text-slate-300">·</span>
            <span>
              Realisasi:{' '}
              <strong className="text-slate-900 font-bold">
                {currentIndicator?.nationalValue || '36.669 satdik (45,7%)'}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Quick Button to return to Focus Indicator if changed */}
            {!isAtFocusIndicator && (
              <button
                type="button"
                onClick={handleResetToFocus}
                title="Arahkan kembali ke Indikator Fokus (Revitalisasi Satdik)"
                className="h-[40px] inline-flex items-center gap-2 px-3.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/90 transition-all cursor-pointer shadow-2xs shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Ke Indikator Fokus</span>
              </button>
            )}

            {/* Fullscreen Map Toggle Button */}
            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              className="h-[40px] inline-flex items-center gap-2 px-4 rounded-xl text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200/90 shadow-2xs transition-all cursor-pointer shrink-0"
              title="Perbesar Peta ke Layar Penuh"
            >
              <Maximize2 className="w-4 h-4 text-blue-600" />
              <span>Layar Penuh Peta</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. PETA GEOSPASIAL INTERAKTIF 100% LEBAR                 */}
      {/* ======================================================== */}
      <div className="w-full h-[540px] sm:h-[600px] lg:h-[650px] xl:h-[700px] flex flex-col rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs relative">
        <LeafletMapWrapper
          selectedWilayah={currentWilayah}
          availableBoundaries={activeBoundaries}
          onSelectWilayah={handleBoundaryClick}
          onResetNasional={handleResetNasional}
          selectedPillar={activePillar}
          selectedIndicator={activeIndicatorId}
        />
      </div>

      {/* Fullscreen Map Overlay (when isFullscreen is active) */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/95 backdrop-blur-sm flex flex-col p-3 sm:p-5 w-screen h-screen animate-in fade-in duration-150">
          {/* Top Fullscreen Control Bar with Pillar & Indicator Filters */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-3 border border-slate-200/90 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-3 shrink-0 mb-3">
            {/* Left / Center: Region Badge, Pillar Tabs, and Indicator Filter */}
            <div className="flex items-center gap-3 flex-wrap min-w-0">
              {/* Region Pill */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl border border-slate-200 text-slate-800 shrink-0">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-xs sm:text-sm font-extrabold truncate max-w-[150px] sm:max-w-[200px]">
                  {currentWilayah.name}
                </span>
              </div>

              {/* Pillar Selector Pills */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200 shrink-0">
                {MAP_PILLARS.map((p) => {
                  const isActive = activePillar === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handlePillarChange(p.id)}
                      className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                      }`}
                    >
                      {p.shortName}
                    </button>
                  );
                })}
              </div>

              {/* Indicator Filter Dropdown */}
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-bold text-slate-500 shrink-0 hidden sm:inline">
                  Indikator:
                </span>
                <div className="relative min-w-[200px] sm:min-w-[280px] max-w-[360px]">
                  <select
                    id="fullscreen-indicator-filter"
                    aria-label="Pilih Indikator Peta"
                    value={activeIndicatorId || ''}
                    onChange={(e) =>
                      handleSelectIndicator(activePillar || 'pendidikan', e.target.value)
                    }
                    className="w-full h-[36px] appearance-none pl-3 pr-8 text-xs font-bold bg-white text-slate-900 border border-slate-300 hover:border-slate-400 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all cursor-pointer truncate shadow-2xs"
                  >
                    {getIndicatorsByPillar(activePillar || 'pendidikan').map((ind) => (
                      <option key={ind.id} value={ind.id}>
                        {ind.name} {ind.isNationalOnly ? '• [Capaian Nasional]' : ''}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>

              {/* Status Badge: National Only / Area Putih */}
              {currentIndicator?.isNationalOnly && (
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200/90 shrink-0">
                  Capaian Nasional (Area Putih)
                </span>
              )}
            </div>

            {/* Right: Target/Realisasi info, Reset Wilayah, and Exit Fullscreen */}
            <div className="flex items-center gap-3 shrink-0 justify-between lg:justify-end border-t lg:border-t-0 pt-2 lg:pt-0 border-slate-100">
              <div className="hidden xl:flex items-center gap-3 text-xs text-slate-600 font-medium">
                <span>
                  Target {selectedYear}:{' '}
                  <strong className="text-slate-900 font-bold">
                    {currentIndicator?.target2026}
                  </strong>
                </span>
                <span className="text-slate-300">·</span>
                <span>
                  Realisasi:{' '}
                  <strong className="text-slate-900 font-bold">
                    {currentIndicator?.nationalValue}
                  </strong>
                </span>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                {selectedProvinsiId !== 'nasional' && (
                  <button
                    type="button"
                    onClick={handleResetNasional}
                    className="h-[36px] px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200/80"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                    <span>Reset Wilayah</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsFullscreen(false)}
                  className="h-[36px] px-3.5 sm:px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer shrink-0"
                >
                  <Minimize2 className="w-3.5 h-3.5 text-white" />
                  <span>Keluar Layar Penuh</span>
                  <kbd className="hidden sm:inline-block text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 ml-0.5">
                    ESC
                  </kbd>
                </button>
              </div>
            </div>
          </div>

          {/* Fullscreen Map Canvas */}
          <div className="flex-1 w-full h-full rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl relative">
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
      )}

      {/* ======================================================== */}
      {/* 3. INFORMASI WILAYAH YANG DITEKAN (DI BAWAH PETA)        */}
      {/* ======================================================== */}
      <div ref={wilayahInfoRef} className="w-full pt-1">
        <WilayahInfoSection
          wilayah={currentWilayah}
          activeIndicator={currentIndicator}
          activePillar={activePillar}
          selectedYear={selectedYear}
          onResetNasional={handleResetNasional}
        />
      </div>

      {/* ======================================================== */}
      {/* 4. REKAPITULASI TARGET & CAPAIAN INDIKATOR PRIORITAS      */}
      {/* (No redundant dropdown, direct natural scroll)           */}
      {/* ======================================================== */}
      <div className="pt-2 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/90 flex items-center justify-center text-blue-700 shrink-0">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Rekapitulasi Target &amp; Capaian Indikator Prioritas (RPJMN 2025–2029)
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Tinjauan komprehensif target kumulatif, realisasi tahun berjalan, dan trajektori 4 pilar
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3.5 py-1.5 rounded-xl border border-slate-200/90 shrink-0 self-start sm:self-auto">
            Periode Evaluasi {selectedYear}
          </span>
        </div>

        <div className="h-[540px] lg:h-[620px]">
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
      </div>
    </div>
  );
};
