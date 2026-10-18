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
} from 'lucide-react';

interface IndonesiaMapProps {
  className?: string;
  onSelectPillar?: (id: string) => void;
  initialPillar?: MapPillarId | null;
}

export const IndonesiaMap: React.FC<IndonesiaMapProps> = ({
  className = '',
  onSelectPillar,
  initialPillar = null,
}) => {
  // 1. Pillar and Sub-Indicator Filter States (defaults to null so user chooses first)
  const [activePillar, setActivePillar] = useState<MapPillarId | null>(initialPillar);
  const [activeIndicatorId, setActiveIndicatorId] = useState<string | null>(() => {
    return initialPillar ? getDefaultIndicatorForPillar(initialPillar).id : null;
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-500 shrink-0">
              Wilayah:
            </span>

            {/* Compact Selects with reduced widths */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Dropdown 1: Provinsi */}
              <select
                id="filter-provinsi"
                aria-label="Pilih Provinsi"
                value={selectedProvinsiId}
                onChange={(e) => handleProvinsiChange(e.target.value)}
                className="w-40 sm:w-44 text-xs font-semibold bg-slate-50 hover:bg-white text-slate-900 border border-slate-200 hover:border-slate-300 rounded-lg py-1.5 px-2 focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors cursor-pointer truncate"
              >
                <option value="nasional">Seluruh Indonesia (38 Prov)</option>
                {PROVINSI_DATA.map((prov) => (
                  <option key={prov.id} value={prov.id}>
                    {prov.name} {prov.isPrioritas ? '• Prioritas' : ''}
                  </option>
                ))}
              </select>

              {/* Dropdown 2: Kabupaten / Kota */}
              <select
                id="filter-kabkota"
                aria-label="Pilih Kabupaten atau Kota"
                value={selectedKabKotaId}
                disabled={!isDetailSupported}
                onChange={(e) => handleKabKotaChange(e.target.value)}
                className={`w-28 sm:w-32 text-xs font-semibold rounded-lg py-1.5 px-2 border transition-colors truncate ${
                  !isDetailSupported
                    ? 'bg-slate-100/70 text-slate-400 border-slate-200 cursor-not-allowed'
                    : 'bg-slate-50 hover:bg-white text-slate-900 border-slate-200 hover:border-slate-300 focus:ring-2 focus:ring-blue-600 focus:bg-white cursor-pointer'
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

              {/* Dropdown 3: Kecamatan */}
              <select
                id="filter-kecamatan"
                aria-label="Pilih Kecamatan"
                value={selectedKecamatanId}
                disabled={!selectedKabKotaId}
                onChange={(e) => handleKecamatanChange(e.target.value)}
                className={`w-24 sm:w-28 text-xs font-semibold rounded-lg py-1.5 px-2 border transition-colors truncate ${
                  !selectedKabKotaId
                    ? 'bg-slate-100/70 text-slate-400 border-slate-200 cursor-not-allowed'
                    : 'bg-slate-50 hover:bg-white text-slate-900 border-slate-200 hover:border-slate-300 focus:ring-2 focus:ring-blue-600 focus:bg-white cursor-pointer'
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

              {/* Dropdown 4: Desa */}
              <select
                id="filter-desa"
                aria-label="Pilih Desa atau Kelurahan"
                value={selectedDesaId}
                disabled={!selectedKecamatanId}
                onChange={(e) => handleDesaChange(e.target.value)}
                className={`w-24 sm:w-28 text-xs font-semibold rounded-lg py-1.5 px-2 border transition-colors truncate ${
                  !selectedKecamatanId
                    ? 'bg-slate-100/70 text-slate-400 border-slate-200 cursor-not-allowed'
                    : 'bg-slate-50 hover:bg-white text-slate-900 border-slate-200 hover:border-slate-300 focus:ring-2 focus:ring-blue-600 focus:bg-white cursor-pointer'
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
            </div>
          </div>

          {/* Right side of Row 1: Filter Periode Tahun (Dropdown) & Reset Wilayah */}
          <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto flex-wrap min-h-[32px]">
            {/* Filter Periode Tahun Dropdown */}
            <div className="flex items-center gap-1.5">
              <label htmlFor="filter-tahun" className="text-xs font-semibold text-slate-500 shrink-0">
                Tahun:
              </label>
              <select
                id="filter-tahun"
                aria-label="Pilih Periode Tahun"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value) as PeriodYear)}
                className="text-xs font-semibold bg-slate-50 hover:bg-white text-slate-900 border border-slate-200 hover:border-slate-300 rounded-lg py-1.5 px-2.5 focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors cursor-pointer"
              >
                {AVAILABLE_YEARS.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Wilayah Button (visible when a specific territory is filtered) */}
            {selectedProvinsiId !== 'nasional' && (
              <button
                type="button"
                onClick={handleResetNasional}
                title="Kembali ke tampilan Seluruh Indonesia"
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 border border-slate-200 shrink-0"
              >
                <RotateCcw className="h-3 w-3 text-slate-500" />
                <span>Reset Wilayah</span>
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Filter Pilar & Sub-Indikator (Clean Buttons, No Noise) */}
        <div className="pt-2.5 border-t border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 overflow-x-visible flex-wrap sm:flex-nowrap">
            <span className="text-xs font-semibold text-slate-500 shrink-0 mr-0.5">
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
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white font-semibold shadow-xs'
                        : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200/90 font-medium'
                    }`}
                  >
                    <span>{pilar.shortName}</span>
                    <ChevronDown
                      className={`h-3 w-3 transition-transform duration-150 ${
                        isOpen ? 'rotate-180' : ''
                      } ${isSelected ? 'text-white/80' : 'text-slate-400'}`}
                    />
                  </button>

                  {/* Clean Floating Dropdown for Sub-Indicators */}
                  {isOpen && (
                    <div
                      className="absolute left-0 top-full pt-1.5 z-40 w-72 sm:w-80 animate-in fade-in zoom-in-95 duration-100"
                      onMouseEnter={() => handleMouseEnter(pilar.id)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="bg-white rounded-xl border border-slate-200 shadow-xl p-1.5 text-xs">
                        <div className="space-y-0.5 max-h-64 overflow-y-auto">
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

          {/* Active Indicator Display or Prompt */}
          {currentIndicator ? (
            <div className="flex items-center gap-1.5 text-xs text-slate-600 self-start xl:self-auto py-0.5">
              <span className="text-slate-400">Indikator:</span>
              <span className="font-semibold text-slate-900">{currentIndicator.name}</span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-500">Target 2026: {currentIndicator.target2026}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 self-start xl:self-auto py-0.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
              <span className="italic">Pilih pilar di atas untuk mengaktifkan pemetaan tematik</span>
            </div>
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
