'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  WilayahData,
  NASIONAL_DATA,
  PROVINSI_DATA,
  KABKOTA_DATA,
  KECAMATAN_DATA,
} from '@/data/wilayahData';
import {
  MapPillarId,
  getIndicatorById,
  getDefaultIndicatorForPillar,
  getIndicatorChoroplethColor,
  getIndicatorLegendStops,
} from '@/data/mapIndicators';
import { RotateCcw, Plus, Minus, Info } from 'lucide-react';

interface LeafletBlindMapProps {
  selectedWilayah: WilayahData;
  availableBoundaries: WilayahData[];
  onSelectWilayah: (wilayah: WilayahData) => void;
  onResetNasional: () => void;
  selectedPillar?: MapPillarId | null;
  selectedIndicator?: string | null;
}

// Module-level in-memory cache for fast GeoJSON switching
const geojsonCache = new Map<string, any>();

const getPillarStrokeColor = (pillarId?: MapPillarId | null): string => {
  switch (pillarId) {
    case 'pendidikan':
      return '#1d4ed8'; // Blue
    case 'kesehatan':
      return '#15803d'; // Green
    case 'bencana':
      return '#7a4b27'; // Brown
    case 'kemiskinan':
      return '#b91c1c'; // Red
    default:
      return '#1d4ed8';
  }
};

export const LeafletBlindMap: React.FC<LeafletBlindMapProps> = ({
  selectedWilayah,
  onSelectWilayah,
  onResetNasional,
  selectedPillar = null,
  selectedIndicator = null,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const geojsonLayerRef = useRef<L.GeoJSON | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  // Active indicator definition (null when no pillar is chosen yet)
  const indicatorDef = selectedIndicator
    ? getIndicatorById(selectedIndicator, selectedPillar)
    : selectedPillar
    ? getDefaultIndicatorForPillar(selectedPillar)
    : null;
  const legendStops = indicatorDef ? getIndicatorLegendStops(indicatorDef, selectedPillar) : null;
  const isPillarActive = Boolean(selectedPillar && indicatorDef);
  const activePillarId = selectedPillar || indicatorDef?.pillarId;

  // 1. Initialize Leaflet Map with CartoDB / OSM Tile Layer
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [-2.2, 118.0],
        zoom: 5,
        minZoom: 4,
        maxZoom: 18,
        zoomControl: false,
        attributionControl: false,
      });

      // OpenStreetMap basemap
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Minimalist attribution
      L.control
        .attribution({
          position: 'bottomright',
          prefix: '<span class="text-[10px] text-slate-500">OpenStreetMap · Kemenko PMK</span>',
        })
        .addTo(map);

      mapInstanceRef.current = map;
    }

    // Auto-resize observer to keep Leaflet canvas synced with dynamic layout
    let resizeObserver: ResizeObserver | null = null;
    if (mapContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        mapInstanceRef.current?.invalidateSize();
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Load and Render Organic GeoJSON Administrative Boundaries with Indicator-driven Styling
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    let isCancelled = false;

    // Determine target GeoJSON based on active navigation hierarchy
    let geojsonUrl = '/indonesia-provinces-fine.geojson';
    let currentLevel: 'nasional' | 'provinsi' | 'kabupaten' | 'kecamatan' = 'nasional';

    if (
      selectedWilayah.id === 'cianjur' ||
      selectedWilayah.parentKabKotaId === 'cianjur'
    ) {
      geojsonUrl = '/cianjur-kec-all.geojson';
      currentLevel = 'kecamatan';
    } else if (
      selectedWilayah.id === 'jawa-barat' ||
      selectedWilayah.parentProvinsiId === 'jawa-barat'
    ) {
      geojsonUrl = '/jawa-barat-kab-all.geojson';
      currentLevel = 'kabupaten';
    } else if (
      selectedWilayah.id === 'dki-jakarta' ||
      selectedWilayah.parentProvinsiId === 'dki-jakarta'
    ) {
      geojsonUrl = '/dki-jakarta-kab-all.geojson';
      currentLevel = 'kabupaten';
    }

    async function loadGeoJson() {
      try {
        let geoData = geojsonCache.get(geojsonUrl);
        if (!geoData) {
          const res = await fetch(geojsonUrl);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          geoData = await res.json();
          geojsonCache.set(geojsonUrl, geoData);
        }

        if (isCancelled || !mapInstanceRef.current) return;

        // Clear existing GeoJSON layer
        if (geojsonLayerRef.current) {
          mapInstanceRef.current.removeLayer(geojsonLayerRef.current);
          geojsonLayerRef.current = null;
        }

        // Active indicator lookup strictly within active pillar context
        const currentInd = selectedIndicator
          ? getIndicatorById(selectedIndicator, selectedPillar)
          : selectedPillar
          ? getDefaultIndicatorForPillar(selectedPillar)
          : null;

        // Create GeoJSON Layer with authentic choropleth coloring and white boundary strokes
        const newLayer = L.geoJSON(geoData, {
          style: (feature) => {
            if (!feature) return {};

            // Match feature to corresponding WilayahData
            const matched = resolveWilayah(feature, currentLevel);
            const isSelected =
              matched &&
              (matched.id === selectedWilayah.id ||
                matched.kodeBps === selectedWilayah.kodeBps);

            // If no pillar selected yet, render clean neutral boundaries
            if (!isPillarActive || !currentInd) {
              return {
                fillColor: '#f1f5f9',
                fillOpacity: isSelected ? 0.92 : 0.65,
                color: isSelected ? '#1d4ed8' : '#cbd5e1',
                weight: isSelected ? 3.0 : 1.0,
                opacity: 0.9,
                className: 'executive-choropleth-feature cursor-pointer transition-all duration-150',
              };
            }

            const targetWilayah = matched || NASIONAL_DATA;
            const indVal = currentInd.getValue(targetWilayah);
            const fillColor = getIndicatorChoroplethColor(currentInd, indVal.num, selectedPillar);

            return {
              fillColor: fillColor,
              fillOpacity: isSelected ? 0.96 : 0.88,
              color: isSelected ? getPillarStrokeColor(selectedPillar) : '#ffffff', // Selected: Pillar Color; Default: Crisp white separator
              weight: isSelected ? 3.5 : 1.2,
              opacity: 0.95,
              className: 'executive-choropleth-feature cursor-pointer transition-all duration-150',
            };
          },

          onEachFeature: (feature, layer) => {
            const matched = resolveWilayah(feature, currentLevel);
            const targetWilayah = matched || NASIONAL_DATA;

            const isSelected =
              matched &&
              (matched.id === selectedWilayah.id ||
                matched.kodeBps === selectedWilayah.kodeBps);

            // If no pillar selected yet, show gentle prompt in tooltip
            if (!isPillarActive || !currentInd) {
              layer.bindTooltip(
                `
                <div style="font-family: inherit; padding: 7px 10px; text-align: left; min-width: 150px; line-height: 1.35;">
                  <div style="display:flex; align-items:center; justify-content:space-between; gap:6px; margin-bottom: 3px;">
                    <span style="font-size: 13px; font-weight: 800; color: #0f172a;">${targetWilayah.name}</span>
                    ${targetWilayah.isPrioritas ? '<span style="color:#b91c1c; font-size:9.5px; font-weight:700; background:#fee2e2; padding:1px 5px; border-radius:3px;">3T Prioritas</span>' : ''}
                  </div>
                  <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
                    Pilih pilar di atas untuk melihat capaian daerah ini
                  </div>
                </div>
                `,
                {
                  sticky: true,
                  direction: 'top',
                  className: 'shadow-xl border border-slate-200/90 rounded-xl bg-white/95 backdrop-blur-xs',
                }
              );
            } else {
              const indVal = currentInd.getValue(targetWilayah);
              const statusBadge = indVal.statusLabel
                ? `<span style="display:inline-block; margin-top:3px; padding:2px 6px; border-radius:4px; font-size:10px; font-weight:700; ${
                    indVal.statusType === 'success'
                      ? 'background-color:#dcfce7; color:#14532d; border:1px solid #86efac;'
                      : indVal.statusType === 'warning'
                      ? 'background-color:#fef3c7; color:#78350f; border:1px solid #fde68a;'
                      : indVal.statusType === 'alert'
                      ? 'background-color:#ffe4e6; color:#881337; border:1px solid #fecdd3;'
                      : 'background-color:#f1f5f9; color:#1e293b; border:1px solid #cbd5e1;'
                  }">${indVal.statusLabel}</span>`
                : '';

              layer.bindTooltip(
                `
                <div style="font-family: inherit; padding: 7px 10px; text-align: left; min-width: 175px; line-height: 1.35;">
                  <div style="display:flex; align-items:center; justify-content:space-between; gap:6px; margin-bottom: 4px;">
                    <span style="font-size: 13px; font-weight: 800; color: #0f172a;">${targetWilayah.name}</span>
                    ${targetWilayah.isPrioritas ? '<span style="color:#b91c1c; font-size:9.5px; font-weight:700; background:#fee2e2; padding:1px 5px; border-radius:3px;">3T Prioritas</span>' : ''}
                  </div>
                  <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.04em; color: #64748b; font-weight: 700; margin-bottom: 2px;">
                    ${currentInd.shortName}
                  </div>
                  <div style="display: flex; align-items: baseline; justify-content: space-between; font-size: 11.5px; color: #334155; margin-bottom: 3px;">
                    <span>Capaian Terkini:</span>
                    <strong style="color: #0f172a; font-size: 14px; font-weight: 900;">${indVal.display}</strong>
                  </div>
                  ${indVal.subtext ? `<div style="font-size: 10.5px; color: #475569; margin-bottom: 3px;">${indVal.subtext}</div>` : ''}
                  <div style="font-size: 10px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 4px; display:flex; justify-content:space-between; align-items:center;">
                    <span>Target: <strong>${currentInd.target2026}</strong></span>
                    ${statusBadge}
                  </div>
                </div>
                `,
                {
                  sticky: true,
                  direction: 'top',
                  className: 'shadow-xl border border-slate-200/90 rounded-xl bg-white/95 backdrop-blur-xs',
                }
              );
            }

            // Hover interactions
            layer.on({
              mouseover: (e) => {
                const l = e.target;
                if (!isSelected) {
                  l.setStyle({
                    weight: 2.6,
                    color: '#ffffff',
                    fillOpacity: 0.98,
                  });
                  l.bringToFront();
                }
              },
              mouseout: (e) => {
                if (!isSelected) {
                  newLayer.resetStyle(e.target);
                }
              },
              click: () => {
                if (matched) {
                  onSelectWilayah(matched);
                }
              },
            });
          },
        });

        newLayer.addTo(mapInstanceRef.current);
        geojsonLayerRef.current = newLayer;

        // Camera positioning: smoothly focus on active selection or root Indonesia
        if (selectedWilayah.level === 'nasional') {
          mapInstanceRef.current.setView([-2.4, 118.0], 5, {
            animate: true,
            duration: 0.9,
          });
        } else {
          // Find matching layer to fit bounds precisely
          let foundBounds: L.LatLngBounds | null = null;
          newLayer.eachLayer((l: any) => {
            const f = l.feature;
            const matched = resolveWilayah(f, currentLevel);
            if (
              matched &&
              (matched.id === selectedWilayah.id ||
                matched.kodeBps === selectedWilayah.kodeBps)
            ) {
              if (l.getBounds) {
                foundBounds = l.getBounds();
              }
            }
          });

          if (foundBounds && mapInstanceRef.current) {
            mapInstanceRef.current.fitBounds(foundBounds, {
              padding: [45, 45],
              maxZoom: selectedWilayah.zoom,
              animate: true,
              duration: 1.0,
            });
          } else if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo(
              [selectedWilayah.lat, selectedWilayah.lng],
              selectedWilayah.zoom,
              { duration: 1.0 }
            );
          }
        }
      } catch (err) {
        console.error('Failed to load GeoJSON administrative boundary:', err);
      }
    }

    loadGeoJson();

    return () => {
      isCancelled = true;
    };
  }, [selectedWilayah, selectedPillar, selectedIndicator, onSelectWilayah]);

  // Helper to map GeoJSON feature properties to WilayahData instances
  function resolveWilayah(
    feature: any,
    level: 'nasional' | 'provinsi' | 'kabupaten' | 'kecamatan'
  ): WilayahData | undefined {
    const props = feature.properties || {};

    if (level === 'kecamatan') {
      const fid = props.id;
      const fcode = props.Code ? String(props.Code) : '';
      const fcodeBps = props.kodeBps;
      return (
        KECAMATAN_DATA.find((k) => k.id === fid) ||
        KECAMATAN_DATA.find((k) => k.kodeBps === fcodeBps) ||
        KECAMATAN_DATA.find((k) => k.kodeBps.replace(/\./g, '') === fcode)
      );
    }

    if (level === 'kabupaten') {
      const fid = props.id;
      const fcode = props.Code ? String(props.Code) : '';
      const fcodeBps = props.kodeBps;
      return (
        KABKOTA_DATA.find((k) => k.id === fid) ||
        KABKOTA_DATA.find((k) => k.kodeBps === fcodeBps) ||
        KABKOTA_DATA.find((k) => k.kodeBps.replace(/\./g, '') === fcode)
      );
    }

    // National Level: Match 38 Provinces
    const fkode = props.kode;
    const fkodeStr = String(fkode).padStart(2, '0');
    const fPropinsi = String(props.Propinsi || '').toUpperCase().trim();

    return (
      PROVINSI_DATA.find((p) => p.kodeBps === fkodeStr || p.kodeBps === String(fkode)) ||
      PROVINSI_DATA.find((p) => {
        const pUpper = p.name.toUpperCase();
        return fPropinsi.includes(pUpper) || pUpper.includes(fPropinsi);
      })
    );
  }

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  // Active indicator reading for legend
  const activeWilayahIndVal = indicatorDef ? indicatorDef.getValue(selectedWilayah) : null;

  return (
    <div className="relative w-full h-full min-h-[500px] lg:min-h-[580px] xl:min-h-[620px] rounded-2xl overflow-hidden border border-slate-200/90 bg-[#cde2e4] shadow-xs">
      {/* 1. Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* 2. Top-Right: Reset Tampilan Peta Pill Button */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <button
          type="button"
          onClick={onResetNasional}
          aria-label="Kembali ke tampilan seluruh Indonesia"
          title="Reset Tampilan Peta"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/95 hover:bg-white text-slate-800 hover:text-slate-950 border border-slate-200/90 rounded-full shadow-xs text-xs font-semibold cursor-pointer transition-colors backdrop-blur-xs select-none"
        >
          <RotateCcw className="h-3.5 w-3.5 text-slate-600" />
          <span>Reset Tampilan Peta</span>
        </button>
      </div>

      {/* 3. Bottom-Left: Dynamic Thematic Choropleth Pill Legend or Initial Guide */}
      {isPillarActive && indicatorDef && legendStops && activeWilayahIndVal ? (
        <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-xs border border-slate-200/90 rounded-2xl px-4 py-3 shadow-md text-xs select-none min-w-[270px] sm:min-w-[320px] max-w-[380px]">
          <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-1.5 tracking-tight gap-2">
            <span className="truncate">{indicatorDef.name}</span>
            <span className="text-[11px] font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 shrink-0 tabular-nums">
              {selectedWilayah.level === 'nasional'
                ? `Nasional: ${indicatorDef.nationalValue}`
                : `${selectedWilayah.name}: ${activeWilayahIndVal.display}`}
            </span>
          </div>

          {/* Dynamic Continuous Gradient Bar for the Selected Indicator */}
          <div
            className="w-full h-2.5 rounded-full border border-black/10 shadow-inner mb-2"
            style={{
              background: `linear-gradient(to right, ${legendStops.minColor}, ${legendStops.midColor}, ${legendStops.maxColor})`,
            }}
          />

          {/* Min / Max Labels */}
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-2">
            <span className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full border border-slate-300"
                style={{ backgroundColor: legendStops.minColor }}
              />
              {indicatorDef.isLowerBetter
                ? `Min: ${indicatorDef.minVal}${indicatorDef.unit.startsWith('%') ? '' : ' '}${indicatorDef.unit} (Optimal)`
                : `Min: ${indicatorDef.minVal}${indicatorDef.unit.startsWith('%') ? '' : ' '}${indicatorDef.unit} (Akselerasi)`}
            </span>
            <span className="flex items-center gap-1.5">
              {indicatorDef.isLowerBetter
                ? `Max: ${indicatorDef.maxVal}${indicatorDef.unit.startsWith('%') ? '' : ' '}${indicatorDef.unit} (Akselerasi)`
                : `Max: ${indicatorDef.maxVal}${indicatorDef.unit.startsWith('%') ? '' : ' '}${indicatorDef.unit} (Optimal)`}
              <span
                className="w-2.5 h-2.5 rounded-full border border-slate-700"
                style={{ backgroundColor: legendStops.maxColor }}
              />
            </span>
          </div>

          {/* Quick Strategic Target */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10.5px] text-slate-600 font-semibold gap-1.5 flex-wrap">
            <span>Target 2026: <strong className="text-slate-900">{indicatorDef.target2026}</strong></span>
            <span>·</span>
            <span
              className={`font-bold capitalize ${
                activePillarId === 'kesehatan'
                  ? 'text-emerald-700'
                  : activePillarId === 'bencana'
                  ? 'text-[#7a4b27]'
                  : activePillarId === 'kemiskinan'
                  ? 'text-red-700'
                  : 'text-blue-700'
              }`}
            >
              {activePillarId === 'bencana'
                ? 'Ketahanan Bencana'
                : activePillarId === 'kemiskinan'
                ? 'Penurunan Kemiskinan'
                : activePillarId === 'kesehatan'
                ? 'Pilar Kesehatan'
                : 'Pilar Pendidikan'}
            </span>
          </div>
        </div>
      ) : (
        <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-xs border border-slate-200/90 rounded-2xl p-3.5 shadow-md text-xs select-none max-w-xs">
          <div className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span>Peta Spasial Indonesia</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Silakan pilih salah satu Pilar (Pendidikan, Kesehatan, Ketahanan Bencana, Penurunan Kemiskinan) di toolbar atas untuk mengaktifkan pemetaan tematik dan capaian daerah.
          </p>
        </div>
      )}

      {/* 4. Bottom-Right: Clean Zoom & Info Buttons */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col items-center gap-2 select-none">
        <div className="bg-white/95 backdrop-blur-xs border border-slate-200/90 rounded-xl shadow-xs overflow-hidden flex flex-col">
          <button
            type="button"
            onClick={handleZoomIn}
            aria-label="Perbesar peta"
            className="w-8 h-8 flex items-center justify-center text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
          </button>
          <div className="w-full h-[1px] bg-slate-200" />
          <button
            type="button"
            onClick={handleZoomOut}
            aria-label="Perkecil peta"
            className="w-8 h-8 flex items-center justify-center text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Minus className="h-4 w-4" />
          </button>
        </div>

        {/* Info Toggle */}
        <button
          type="button"
          onClick={() => setShowInfo(!showInfo)}
          aria-label="Informasi Sumber Peta & Indikator"
          title="Sumber Peta & Indikator"
          className="w-8 h-8 bg-white/95 backdrop-blur-xs border border-slate-200/90 rounded-full shadow-xs flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <Info className="h-4 w-4" />
        </button>
      </div>

      {/* Info Popover Modal */}
      {showInfo && (
        <div className="absolute bottom-16 right-4 z-20 bg-white/95 backdrop-blur-xs border border-slate-200/90 rounded-xl p-3.5 shadow-xl max-w-xs text-xs text-slate-700">
          <div className="font-bold text-slate-900 mb-1 flex items-center justify-between">
            <span>Metadata Geospasial &amp; Indikator</span>
            <button
              type="button"
              onClick={() => setShowInfo(false)}
              className="text-slate-400 hover:text-slate-700 text-sm font-bold"
            >
              ✕
            </button>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-600 mb-1.5">
            Batas wilayah administratif resmi bersumber dari Peta Dasar BAKOSURTANAL Skala 1:250.000 &amp; Badan Pusat Statistik (BPS).
          </p>
          {indicatorDef && (
            <div className="text-[10px] text-slate-500 border-t border-slate-100 pt-1.5 leading-relaxed">
              Data indikator aktif: <strong>{indicatorDef.name}</strong> ({indicatorDef.description}). Target RPJMN 2025–2029.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
