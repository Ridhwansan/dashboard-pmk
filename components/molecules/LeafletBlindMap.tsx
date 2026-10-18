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
  getWilayahCapaianRpjmn,
} from '@/data/wilayahData';
import { RotateCcw, Plus, Minus, Info } from 'lucide-react';

interface LeafletBlindMapProps {
  selectedWilayah: WilayahData;
  availableBoundaries: WilayahData[];
  onSelectWilayah: (wilayah: WilayahData) => void;
  onResetNasional: () => void;
}

// Module-level in-memory cache for fast GeoJSON switching
const geojsonCache = new Map<string, any>();

/**
 * Multi-stop continuous choropleth color interpolation for Capaian RPJMN & PKPN:
 * - Perlu Akselerasi (~65.0%): #eed9d0 (pale warm sand/peach)
 * - Sedang (~72.0%): #dfa89a (soft rose-terracotta)
 * - Progresif (~77.0%): #c57161 (warm terracotta)
 * - Baik (~82.0%): #9f3e33 (rich terracotta)
 * - Sangat Baik / Optimal (≥88.0%): #581413 (deep executive burgundy)
 */
function interpolateColor(color1: string, color2: string, factor: number): string {
  const c1 = parseInt(color1.slice(1), 16);
  const c2 = parseInt(color2.slice(1), 16);

  const r1 = (c1 >> 16) & 255;
  const g1 = (c1 >> 8) & 255;
  const b1 = c1 & 255;

  const r2 = (c2 >> 16) & 255;
  const g2 = (c2 >> 8) & 255;
  const b2 = c2 & 255;

  const r = Math.round(r1 + factor * (r2 - r1));
  const g = Math.round(g1 + factor * (g2 - g1));
  const b = Math.round(b1 + factor * (b2 - b1));

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export function getCapaianRpjmnColor(capaianPercent: number): string {
  const minVal = 65.0;
  const maxVal = 90.0;
  const clamped = Math.max(minVal, Math.min(maxVal, capaianPercent));
  const t = (clamped - minVal) / (maxVal - minVal); // 0.0 to 1.0

  const stops = [
    { t: 0.0, color: '#eed9d0' },
    { t: 0.25, color: '#dfa89a' },
    { t: 0.5, color: '#c57161' },
    { t: 0.75, color: '#9f3e33' },
    { t: 1.0, color: '#581413' },
  ];

  for (let i = 0; i < stops.length - 1; i++) {
    if (t >= stops[i].t && t <= stops[i + 1].t) {
      const segmentT = (t - stops[i].t) / (stops[i + 1].t - stops[i].t);
      return interpolateColor(stops[i].color, stops[i + 1].color, segmentT);
    }
  }

  return '#581413';
}

function parseCapaianNumber(rateStr?: string): number {
  if (!rateStr) return 76.4;
  const clean = rateStr.replace('%', '').replace(',', '.').trim();
  const num = parseFloat(clean);
  return isNaN(num) ? 76.4 : num;
}

export const LeafletBlindMap: React.FC<LeafletBlindMapProps> = ({
  selectedWilayah,
  onSelectWilayah,
  onResetNasional,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const geojsonLayerRef = useRef<L.GeoJSON | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  // 1. Initialize Leaflet Map with CartoDB Voyager Tile Layer
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

      // OpenStreetMap basemap: Natural calm water & clean geographic typography (100% free, no watermark)
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Attribution in subtle minimalist executive style
      L.control
        .attribution({
          position: 'bottomright',
          prefix: '<span class="text-[10px] text-slate-500">OpenStreetMap</span>',
        })
        .addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Load and Render Organic GeoJSON Administrative Boundaries
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

        // Create GeoJSON Layer with authentic choropleth coloring and white boundary strokes
        const newLayer = L.geoJSON(geoData, {
          style: (feature) => {
            if (!feature) return {};

            // Match feature to corresponding WilayahData
            const matched = resolveWilayah(feature, currentLevel);
            const targetWilayah = matched || NASIONAL_DATA;
            const capaianStr = getWilayahCapaianRpjmn(targetWilayah);
            const capaianNum = parseCapaianNumber(capaianStr);
            const fillColor = getCapaianRpjmnColor(capaianNum);

            const isSelected =
              matched &&
              (matched.id === selectedWilayah.id ||
                matched.kodeBps === selectedWilayah.kodeBps);

            return {
              fillColor: fillColor,
              fillOpacity: isSelected ? 0.95 : 0.88,
              color: isSelected ? '#1d4ed8' : '#ffffff', // Selected: Royal blue; Default: Crisp white separator
              weight: isSelected ? 3.5 : 1.2,
              opacity: 0.95,
              className: 'executive-choropleth-feature cursor-pointer transition-all duration-150',
            };
          },

          onEachFeature: (feature, layer) => {
            const matched = resolveWilayah(feature, currentLevel);
            const targetWilayah = matched || NASIONAL_DATA;
            const capaianStr = getWilayahCapaianRpjmn(targetWilayah);

            const isSelected =
              matched &&
              (matched.id === selectedWilayah.id ||
                matched.kodeBps === selectedWilayah.kodeBps);

            // Compact, high-contrast, essential hover tooltip (sedikit saja, yang penting-penting)
            const statusLabel = targetWilayah.isPrioritas
              ? '<span style="color:#b91c1c; font-weight:700;">● Prioritas Percepatan PKPN</span>'
              : '<span style="color:#334155; font-weight:600;">● Reguler Pengawalan</span>';

            layer.bindTooltip(
              `
              <div style="font-family: inherit; padding: 6px 9px; text-align: left; min-width: 155px; line-height: 1.35;">
                <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 3px;">
                  ${targetWilayah.name}
                </div>
                <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: #475569; margin-bottom: 2px;">
                  <span>Capaian RPJMN:</span>
                  <strong style="color: #0f172a; font-weight: 800;">${capaianStr}</strong>
                </div>
                <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: #475569; margin-bottom: 3px;">
                  <span>IMM:</span>
                  <strong style="color: #0f172a; font-weight: 800;">${targetWilayah.imm}</strong>
                </div>
                <div style="font-size: 10px; margin-top: 3px; border-top: 1px solid #e2e8f0; padding-top: 3px;">
                  ${statusLabel}
                </div>
              </div>
              `,
              {
                sticky: true,
                direction: 'top',
                className: 'shadow-xl border border-slate-200/90 rounded-xl bg-white/95 backdrop-blur-xs',
              }
            );

            // Hover interactions
            layer.on({
              mouseover: (e) => {
                const l = e.target;
                if (!isSelected) {
                  l.setStyle({
                    weight: 2.4,
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
  }, [selectedWilayah, onSelectWilayah]);

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

    // National Level: Match 34 Provinces
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

  return (
    <div className="relative w-full h-[480px] md:h-[530px] lg:h-[560px] rounded-2xl overflow-hidden border border-slate-200/90 bg-[#cde2e4] shadow-xs">
      {/* 1. Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* 2. Top-Right: Reset Tampilan Peta Pill Button (Matching Gambar 1) */}
      <div className="absolute top-4 right-4 z-10">
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

      {/* 3. Bottom-Left: Thematic Choropleth Pill Legend (Capaian RPJMN, IMM & PKPN) */}
      <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-xs border border-slate-200/90 rounded-2xl px-4 py-3 shadow-md text-xs select-none min-w-[270px] sm:min-w-[310px]">
        <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-1.5 tracking-tight">
          <span>Capaian RPJMN (PKPN)</span>
          <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
            {selectedWilayah.level === 'nasional'
              ? 'Nasional: 76,4%'
              : `${selectedWilayah.name}: ${getWilayahCapaianRpjmn(selectedWilayah)}`}
          </span>
        </div>

        {/* Continuous Multi-Stop Gradient Bar */}
        <div className="w-full h-2.5 rounded-full bg-gradient-to-r from-[#eed9d0] via-[#c57161] to-[#581413] border border-black/10 shadow-inner mb-2" />

        {/* Min / Max Labels */}
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-2">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full border border-slate-300 bg-[#eed9d0]" />
            Min: 65,0% (Akselerasi)
          </span>
          <span className="flex items-center gap-1.5">
            Max: 90,0% (Optimal)
            <span className="w-2.5 h-2.5 rounded-full border border-slate-700 bg-[#581413]" />
          </span>
        </div>

        {/* Quick Strategic Indicators */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10.5px] text-slate-600 font-semibold gap-1.5 flex-wrap">
          <span>IMM: <strong className="text-slate-900">{selectedWilayah.imm}</strong></span>
          <span>·</span>
          <span>Target RPJMN: <strong className="text-slate-900">80,0%</strong></span>
          <span>·</span>
          <span className="text-blue-700 font-bold">4 Pilar PKPN</span>
        </div>
      </div>

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
          aria-label="Informasi Sumber Peta"
          title="Sumber Peta"
          className="w-8 h-8 bg-white/95 backdrop-blur-xs border border-slate-200/90 rounded-full shadow-xs flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <Info className="h-4 w-4" />
        </button>
      </div>

      {/* Info Popover Modal */}
      {showInfo && (
        <div className="absolute bottom-16 right-4 z-20 bg-white/95 backdrop-blur-xs border border-slate-200/90 rounded-xl p-3 shadow-xl max-w-xs text-xs text-slate-700">
          <div className="font-bold text-slate-900 mb-1 flex items-center justify-between">
            <span>Metadata Geospasial</span>
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
          <div className="text-[10px] text-slate-500 border-t border-slate-100 pt-1">
            Indikator Kemiskinan Terpadu RPJMN 2025–2029.
          </div>
        </div>
      )}
    </div>
  );
};
