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
import {
  MapPillarId,
  getIndicatorById,
  getDefaultIndicatorForPillar,
  getIndicatorChoroplethColor,
  getIndicatorLegendStops,
  SUG_LOCATIONS,
  SUMATERA_REHAB_PROVINCES,
  SUMATERA_REHAB_KODE_BPS,
} from '@/data/mapIndicators';
import { RotateCcw, Plus, Minus, Info } from 'lucide-react';

interface LeafletBlindMapProps {
  selectedWilayah: WilayahData;
  availableBoundaries: WilayahData[];
  onSelectWilayah: (wilayah: WilayahData) => void;
  onResetNasional: () => void;
  selectedPillar?: MapPillarId | null;
  selectedIndicator?: string | null;
  isFullscreen?: boolean;
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

const getSugtChoroplethColor = (count: number): string => {
  if (!count || count <= 0) return '#ffffff';
  switch (count) {
    case 1:
      return '#bfdbfe'; // Sumut (1), Kalsel (1), Gorontalo (1), Maluku (1), Papua Barat Daya (1) - Biru Lembut
    case 2:
      return '#93c5fd'; // Sumsel (2), Jatim (2), Kaltim (2), Sulsel (2)
    case 3:
      return '#60a5fa'; // Aceh (3), DIY (3)
    case 4:
      return '#3b82f6'; // Banten (4)
    case 5:
      return '#2563eb';
    case 6:
      return '#1d4ed8'; // DKI Jakarta (6), Jawa Tengah (6)
    case 7:
    default:
      return '#1e3a8a'; // Jawa Barat (7) - Biru Terpekat (Maksimal Provinsi)
  }
};

export const LeafletBlindMap: React.FC<LeafletBlindMapProps> = ({
  selectedWilayah,
  onSelectWilayah,
  onResetNasional,
  selectedPillar = null,
  selectedIndicator = null,
  isFullscreen = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const geojsonLayerRef = useRef<L.GeoJSON | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
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

            // If no pillar selected yet (Territory-First Mode), render clean interactive boundaries
            if (!isPillarActive || !currentInd) {
              return {
                fillColor: isSelected ? '#2563eb' : '#f1f5f9',
                fillOpacity: isSelected ? 0.95 : 0.72,
                color: isSelected ? '#1e3a8a' : '#cbd5e1',
                weight: isSelected ? 3.2 : 1.0,
                opacity: 0.95,
                className: 'executive-choropleth-feature cursor-pointer transition-all duration-150',
              };
            }

            const targetWilayah = matched || NASIONAL_DATA;

            // 1. Capaian Masih Nasional Saja -> Seluruh Area Putih Bersih (#ffffff)
            if (currentInd.isNationalOnly) {
              return {
                fillColor: '#ffffff',
                fillOpacity: 0.96,
                color: isSelected ? getPillarStrokeColor(selectedPillar) : '#cbd5e1',
                weight: isSelected ? 3.5 : 1.2,
                opacity: 0.95,
                className: 'executive-choropleth-feature cursor-pointer transition-all duration-150',
              };
            }

            // 2. SUGT Transformasi (Gradasi Warna Merah 1 s.d. 7 Unit, Terpekat di Jawa Barat = 7)
            if (currentInd.customRegionType === 'sugt') {
              const sugtLoc = SUG_LOCATIONS.find(
                (l) => l.type === 'SUGT' && (l.provinceId === targetWilayah.id || l.kodeBps === targetWilayah.kodeBps)
              );
              if (sugtLoc && sugtLoc.count > 0) {
                return {
                  fillColor: getSugtChoroplethColor(sugtLoc.count),
                  fillOpacity: isSelected ? 0.98 : 0.92,
                  color: isSelected ? '#fbbf24' : '#ffffff',
                  weight: isSelected ? 3.5 : 1.2,
                  opacity: 0.95,
                  className: 'executive-choropleth-feature cursor-pointer transition-all duration-150',
                };
              }
              // Bukan lokasi SUGT -> Area Putih Saja!
              return {
                fillColor: '#ffffff',
                fillOpacity: 0.96,
                color: isSelected ? getPillarStrokeColor(selectedPillar) : '#cbd5e1',
                weight: isSelected ? 3.5 : 1.2,
                opacity: 0.95,
                className: 'executive-choropleth-feature cursor-pointer transition-all duration-150',
              };
            }

            // 3. SUGB Baru Saja (Warna Terpekat Biru Navy untuk 1 Unit, lainnya Area Putih)
            if (currentInd.customRegionType === 'sugb') {
              const sugbLoc = SUG_LOCATIONS.find(
                (l) => l.type === 'SUGB' && (l.provinceId === targetWilayah.id || l.kodeBps === targetWilayah.kodeBps)
              );
              if (sugbLoc && sugbLoc.count > 0) {
                return {
                  fillColor: '#0f3b73', // Warna terpekat SUGB
                  fillOpacity: isSelected ? 0.98 : 0.92,
                  color: isSelected ? '#38bdf8' : '#ffffff',
                  weight: isSelected ? 3.5 : 1.2,
                  opacity: 0.95,
                  className: 'executive-choropleth-feature cursor-pointer transition-all duration-150',
                };
              }
              // Bukan lokasi SUGB -> Area Putih Saja!
              return {
                fillColor: '#ffffff',
                fillOpacity: 0.96,
                color: isSelected ? getPillarStrokeColor(selectedPillar) : '#cbd5e1',
                weight: isSelected ? 3.5 : 1.2,
                opacity: 0.95,
                className: 'executive-choropleth-feature cursor-pointer transition-all duration-150',
              };
            }

            // 5. Rehabilitasi & Rekonstruksi Sumatera (Hanya Aceh, Sumut, Sumbar)
            if (currentInd.customRegionType === 'sumatera_rehab') {
              const isSumatera =
                SUMATERA_REHAB_PROVINCES.includes(targetWilayah.id) ||
                SUMATERA_REHAB_KODE_BPS.includes(targetWilayah.kodeBps);
              if (isSumatera) {
                return {
                  fillColor: '#7a4b27',
                  fillOpacity: isSelected ? 0.98 : 0.92,
                  color: isSelected ? '#d97706' : '#ffffff',
                  weight: isSelected ? 3.5 : 1.2,
                  opacity: 0.95,
                  className: 'executive-choropleth-feature cursor-pointer transition-all duration-150',
                };
              }
              // Bukan lokasi bencana Sumatera -> Area Putih Saja!
              return {
                fillColor: '#ffffff',
                fillOpacity: 0.96,
                color: isSelected ? getPillarStrokeColor(selectedPillar) : '#cbd5e1',
                weight: isSelected ? 3.5 : 1.2,
                opacity: 0.95,
                className: 'executive-choropleth-feature cursor-pointer transition-all duration-150',
              };
            }

            // Default: Continuous Choropleth Coloring
            const indVal = currentInd.getValue(targetWilayah);
            const fillColor = getIndicatorChoroplethColor(currentInd, indVal.num, selectedPillar);

            return {
              fillColor: fillColor,
              fillOpacity: isSelected ? 0.96 : 0.88,
              color: isSelected ? getPillarStrokeColor(selectedPillar) : '#ffffff',
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

            // Territory tooltip: show ONLY Wilayah name and IMM
            if (!isPillarActive || !currentInd) {
              layer.bindTooltip(
                `
                <div style="font-family: inherit; padding: 6px 10px; text-align: left; min-width: 120px; line-height: 1.35;">
                  <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 3px;">
                    ${targetWilayah.name}
                  </div>
                  <div style="font-size: 11.5px; color: #475569; font-weight: 600;">
                    IMM: <strong style="color: #0f172a; font-weight: 800;">${targetWilayah.imm || '—'}</strong>
                  </div>
                </div>
                `,
                {
                  sticky: true,
                  direction: 'top',
                  className: 'shadow-md border border-slate-200/90 rounded-xl bg-white/95 backdrop-blur-xs',
                }
              );
            } else {
              const indVal = currentInd.getValue(targetWilayah);
              let tooltipHtml = '';

              if (currentInd.isNationalOnly) {
                tooltipHtml = `
                  <div style="font-family: inherit; padding: 7px 10px; text-align: left; min-width: 180px; line-height: 1.35;">
                    <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 2px;">${targetWilayah.name}</div>
                    <div style="font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.04em; color: #64748b; font-weight: 700; margin-bottom: 2px;">
                      ${currentInd.shortName}
                    </div>
                    <div style="font-size: 12px; color: #334155; margin-bottom: 3px;">
                      Capaian Nasional: <strong style="color:#0f172a; font-weight:900;">${currentInd.nationalValue}</strong>
                    </div>
                    <div style="font-size: 10px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 4px;">
                      <span style="display:inline-block; padding:2px 6px; border-radius:4px; font-size:9.5px; font-weight:700; background-color:#f1f5f9; color:#475569; border:1px solid #cbd5e1;">Capaian Nasional (Area Putih)</span>
                    </div>
                  </div>
                `;
              } else if (currentInd.customRegionType === 'sugt') {
                const sugtLoc = SUG_LOCATIONS.find(
                  (l) => l.type === 'SUGT' && (l.provinceId === targetWilayah.id || l.kodeBps === targetWilayah.kodeBps)
                );
                const count = sugtLoc ? sugtLoc.count : 0;
                tooltipHtml = `
                  <div style="font-family: inherit; padding: 6px 10px; text-align: left; line-height: 1.35;">
                    <div style="font-size: 13px; font-weight: 800; color: #0f172a;">${targetWilayah.name}</div>
                    <div style="font-size: 13px; font-weight: 700; color: ${count > 0 ? '#1e3a8a' : '#64748b'}; margin-top: 2px;">
                      ${count} Unit
                    </div>
                  </div>
                `;
              } else if (currentInd.customRegionType === 'sugb') {
                const sugbLoc = SUG_LOCATIONS.find(
                  (l) => l.type === 'SUGB' && (l.provinceId === targetWilayah.id || l.kodeBps === targetWilayah.kodeBps)
                );
                const count = sugbLoc ? sugbLoc.count : 0;
                tooltipHtml = `
                  <div style="font-family: inherit; padding: 6px 10px; text-align: left; line-height: 1.35;">
                    <div style="font-size: 13px; font-weight: 800; color: #0f172a;">${targetWilayah.name}</div>
                    <div style="font-size: 13px; font-weight: 700; color: ${count > 0 ? '#1e3a8a' : '#64748b'}; margin-top: 2px;">
                      ${count} Unit
                    </div>
                  </div>
                `;
              } else if (currentInd.customRegionType === 'sumatera_rehab') {
                const isSumatera =
                  SUMATERA_REHAB_PROVINCES.includes(targetWilayah.id) ||
                  SUMATERA_REHAB_KODE_BPS.includes(targetWilayah.kodeBps);
                if (isSumatera) {
                  tooltipHtml = `
                    <div style="font-family: inherit; padding: 7px 10px; text-align: left; min-width: 185px; line-height: 1.35;">
                      <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 2px;">${targetWilayah.name}</div>
                      <div style="font-size: 11px; font-weight: 700; color: #7a4b27; margin-bottom: 3px;">
                        Wilayah Intervensi Rehabilitasi &amp; Rekonstruksi Sumatera
                      </div>
                      <div style="font-size: 11px; color: #334155; margin-bottom: 4px;">
                        Fokus: Huntap, Huntara, Sabodam &amp; Infrastruktur
                      </div>
                      <div style="font-size: 10px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 4px;">
                        Target: <strong>39.501 Huntap · 20.544 Huntara</strong>
                      </div>
                    </div>
                  `;
                } else {
                  tooltipHtml = `
                    <div style="font-family: inherit; padding: 7px 10px; text-align: left; min-width: 175px; line-height: 1.35;">
                      <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 2px;">${targetWilayah.name}</div>
                      <div style="font-size: 11px; color: #64748b; margin-bottom: 3px;">Di Luar Wilayah Intervensi Program</div>
                      <div style="font-size: 10px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 4px;">
                        <span style="display:inline-block; padding:2px 6px; border-radius:4px; font-size:9.5px; font-weight:700; background-color:#f1f5f9; color:#475569; border:1px solid #cbd5e1;">Area Putih (Khusus Sumatera)</span>
                      </div>
                    </div>
                  `;
                }
              } else {
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

                tooltipHtml = `
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
                `;
              }

              layer.bindTooltip(tooltipHtml, {
                sticky: true,
                direction: 'top',
                className: 'shadow-xl border border-slate-200/90 rounded-xl bg-white/95 backdrop-blur-xs',
              });
            }

            // Hover interactions
            layer.on({
              mouseover: (e) => {
                const l = e.target;
                if (!isSelected) {
                  l.setStyle({
                    weight: 2.8,
                    color: !isPillarActive ? '#1d4ed8' : '#ffffff',
                    fillColor: !isPillarActive ? '#93c5fd' : undefined,
                    fillOpacity: 0.95,
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

        // Render SUG Location Pin Badges (Exact match to Image 2)
        if (markersLayerRef.current && mapInstanceRef.current) {
          mapInstanceRef.current.removeLayer(markersLayerRef.current);
          markersLayerRef.current = null;
        }



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

      {/* 2. Top-Right: Reset Tampilan Peta Pill Button (only when not in fullscreen overlay) */}
      {!isFullscreen && (
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
      )}

      {/* 3. Bottom-Left: Dynamic Thematic Choropleth Pill Legend or Initial Guide */}
      {isPillarActive && indicatorDef && legendStops && activeWilayahIndVal ? (
        <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-xs border border-slate-200/90 rounded-2xl px-4 py-3 shadow-md text-xs select-none min-w-[260px] sm:min-w-[300px] max-w-[360px]">
          <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-1.5 tracking-tight gap-2">
            <span className="truncate">{indicatorDef.shortName || indicatorDef.name}</span>
            <span className="text-[11px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 shrink-0 tabular-nums">
              {selectedWilayah.level === 'nasional'
                ? indicatorDef.nationalValue
                : `${selectedWilayah.name}: ${activeWilayahIndVal.display}`}
            </span>
          </div>

          {/* Contextual Legend Rendering */}
          {indicatorDef.customRegionType === 'sugt' ? (
            /* SUGT Transformasi Legend with Blue Gradient (1 to 7 Unit) */
            <div className="space-y-1.5 py-1 mb-1.5">
              {/* Gradient bar: 1 unit light blue -> 7 unit deepest blue */}
              <div
                className="w-full h-2.5 rounded-full border border-blue-900/20 shadow-inner"
                style={{
                  background: 'linear-gradient(to right, #bfdbfe, #93c5fd, #60a5fa, #3b82f6, #2563eb, #1d4ed8, #1e3a8a)',
                }}
              />
              <div className="flex items-center justify-between text-[10.5px] font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full border border-blue-300 bg-[#bfdbfe]" />
                  <span>Min: 1 Unit</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span>Max: 7 Unit (Jabar)</span>
                  <span className="w-2.5 h-2.5 rounded-full border border-blue-900 bg-[#1e3a8a]" />
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-md bg-white border border-slate-300 shadow-2xs" />
                  <span>Area Putih: 0 Unit</span>
                </span>
                <span className="text-[10px] text-slate-400">23 Prov</span>
              </div>
            </div>
          ) : indicatorDef.customRegionType === 'sugb' ? (
            /* SUGB Baru Legend */
            <div className="space-y-1.5 py-1 mb-1.5">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-md bg-[#1e3a8a] border border-white shadow-xs" />
                  <span>1 Unit (Babel, Kaltara, Sultra, NTT)</span>
                </span>
                <span className="font-bold text-[#1e3a8a]">Terpekat</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-md bg-white border border-slate-300 shadow-2xs" />
                  <span>Area Putih: 0 Unit</span>
                </span>
                <span className="text-[10px] text-slate-400">34 Prov</span>
              </div>
            </div>
          ) : indicatorDef.customRegionType === 'sumatera_rehab' ? (
            /* Sumatera Rehab Legend */
            <div className="space-y-1.5 py-1 mb-2">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#7a4b27] border border-white shadow-xs" />
                  <span>Area Terdampak Prioritas</span>
                </span>
                <span className="font-bold text-[#7a4b27] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Aceh, Sumut, Sumbar
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-md bg-white border border-slate-300 shadow-2xs" />
                  <span>Area Putih: Di Luar Prioritas Bencana</span>
                </span>
                <span className="text-[10px] text-slate-400">35 Prov</span>
              </div>
            </div>
          ) : indicatorDef.isNationalOnly ? (
            /* National-Only Area Putih Legend */
            <div className="space-y-1.5 py-1.5 mb-2 bg-slate-50/80 rounded-xl p-2.5 border border-slate-200/80">
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-800">
                <span className="w-3.5 h-3.5 rounded-md bg-white border border-slate-300 shadow-2xs shrink-0" />
                <span>Area Putih: Capaian Berskala Nasional</span>
              </div>
              <p className="text-[10.5px] text-slate-500 leading-relaxed pl-5.5">
                Data program ini saat ini dihimpun secara agregat nasional ({indicatorDef.nationalValue}) dan belum dialokasikan secara kuota spasial provinsi.
              </p>
            </div>
          ) : (
            /* Standard Continuous Gradient Bar */
            <>
              <div
                className="w-full h-2.5 rounded-full border border-black/10 shadow-inner mb-2"
                style={{
                  background: `linear-gradient(to right, ${legendStops.minColor}, ${legendStops.midColor}, ${legendStops.maxColor})`,
                }}
              />
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
            </>
          )}

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
                ? 'Bencana'
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
          <div className="font-extrabold text-slate-900 mb-1 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse shrink-0" />
              <span className="truncate">{selectedWilayah.level === 'nasional' ? 'Agregat Nasional' : selectedWilayah.name}</span>
            </div>
            {selectedWilayah.level !== 'nasional' && (
              <button
                type="button"
                onClick={onResetNasional}
                className="text-[10px] text-blue-600 font-bold hover:underline shrink-0 cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            {selectedWilayah.level === 'nasional'
              ? 'Klik wilayah provinsi pada peta untuk memuat data capaian 4 pilar dan rincian seluruh indikator daerah tersebut.'
              : `Menampilkan profil wilayah ${selectedWilayah.name} (Kode BPS: ${selectedWilayah.kodeBps}).`}
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
