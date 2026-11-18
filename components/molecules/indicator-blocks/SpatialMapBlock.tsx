'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { SpatialMapBlockData } from '@/types/cms';
import { Plus, Minus } from 'lucide-react';

interface SpatialMapBlockProps {
  data: SpatialMapBlockData;
  title?: string;
  subtitle?: string;
  className?: string;
}

export const SpatialMapBlock: React.FC<SpatialMapBlockProps> = ({
  data,
  title = 'PERSEBARAN SEKOLAH SASARAN',
  subtitle = 'Sebaran sekolah penerima program berdasarkan titik lokasi dan wilayah',
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const markers = useMemo(() => data.markers || [], [data.markers]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialLat = data.centerLat || -2.4;
      const initialLng = data.centerLng || 118.0;
      const initialZoom = data.zoom || 5;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: initialZoom,
        minZoom: 4,
        maxZoom: 18,
        zoomControl: false,
        attributionControl: false,
      });

      // Free standard OpenStreetMap tile layer (No API key needed)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c'],
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      mapInstanceRef.current = map;

      // Invalidate size after mounting
      setTimeout(() => {
        map.invalidateSize();
      }, 150);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [data.centerLat, data.centerLng, data.zoom]);

  // Render Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (markersLayerRef.current) {
      map.removeLayer(markersLayerRef.current);
      markersLayerRef.current = null;
    }

    const layerGroup = L.layerGroup();

    markers.forEach((marker) => {
      const is2026 = marker.year === 2026;
      const markerColor = is2026 ? '#059669' : '#2563eb'; // Emerald Green 2026, Royal Blue 2025
      const bgPill = is2026 ? '#ecfdf5' : '#eff6ff';
      const textPill = is2026 ? '#065f46' : '#1e40af';
      const borderPill = is2026 ? '#a7f3d0' : '#bfdbfe';

      // Outer ring marker for maximum contrast on map tiles
      const haloCircle = L.circleMarker([marker.lat, marker.lng], {
        radius: 12,
        fillColor: markerColor,
        color: markerColor,
        weight: 1,
        opacity: 0.35,
        fillOpacity: 0.15,
      });

      // Core point marker with thick white border
      const circle = L.circleMarker([marker.lat, marker.lng], {
        radius: 8.5,
        fillColor: markerColor,
        color: '#ffffff',
        weight: 2.5,
        opacity: 1,
        fillOpacity: 1,
      });

      // Interactive hover tooltip
      circle.bindTooltip(
        `
        <div style="font-family: inherit; padding: 4px 8px; text-align: left; line-height: 1.35; pointer-events: none;">
          <div style="font-size: 12px; font-weight: 800; color: #0f172a; margin-bottom: 2px;">
            ${marker.name}
          </div>
          <div style="font-size: 11px; color: #475569; font-weight: 600;">
            ${marker.kabKota ? `${marker.kabKota}, ` : ''}${marker.provinsi}
          </div>
        </div>
        `,
        {
          sticky: true,
          direction: 'top',
          className: 'shadow-md border border-slate-200/90 rounded-xl bg-white/95 backdrop-blur-xs',
        }
      );

      // Interactive click popup directly attached beside the marker point
      circle.bindPopup(
        `
        <div style="font-family: inherit; min-width: 200px; padding: 4px 2px; text-align: left;">
          <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 3px; line-height: 1.35;">
            ${marker.name}
          </div>
          <div style="font-size: 11px; color: #475569; font-weight: 600; margin-bottom: 6px;">
            ${marker.kabKota ? `${marker.kabKota}, ` : ''}${marker.provinsi}
          </div>
          <div style="display: inline-block; font-size: 10px; font-weight: 800; padding: 2.5px 8px; border-radius: 6px; background-color: ${bgPill}; color: ${textPill}; border: 1px solid ${borderPill}; margin-bottom: 4px;">
            Sasaran Tahun ${marker.year || 2026}
          </div>
          ${marker.status ? `<div style="font-size: 11px; font-weight: 700; color: #0284c7; margin-top: 4px;">Status: ${marker.status}</div>` : ''}
          ${marker.note ? `<div style="font-size: 10px; color: #64748b; margin-top: 6px; padding-top: 6px; border-top: 1px solid #f1f5f9; line-height: 1.35;">${marker.note}</div>` : ''}
        </div>
        `,
        {
          offset: [0, -8],
          closeButton: true,
          autoPan: true,
        }
      );

      layerGroup.addLayer(haloCircle);
      layerGroup.addLayer(circle);
    });

    layerGroup.addTo(map);
    markersLayerRef.current = layerGroup;
  }, [markers]);

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col ${className}`}>
      {/* Block Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/40">
        <div className="space-y-0.5 min-w-0">
          <h4 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block shrink-0" />
            <span className="truncate">{title}</span>
          </h4>
          {subtitle && <p className="text-xs text-slate-500 font-medium truncate">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => mapInstanceRef.current?.zoomIn()}
            title="Perbesar peta"
            aria-label="Perbesar peta"
            className="w-8 h-8 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => mapInstanceRef.current?.zoomOut()}
            title="Perkecil peta"
            aria-label="Perkecil peta"
            className="w-8 h-8 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center shadow-2xs transition-colors cursor-pointer"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="relative w-full h-[320px] sm:h-[360px] lg:h-[400px] bg-slate-100">
        <div ref={mapContainerRef} className="w-full h-full z-0" />
      </div>

      {/* Block Footer Legend (Matching Gambar 1 & 2) */}
      <div className="p-3.5 sm:p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-4 text-xs font-semibold text-slate-700 flex-wrap">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block shadow-2xs" />
            <span>Sekolah sasaran 2025</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-2xs" />
            <span>Sekolah sasaran 2026</span>
          </span>
        </div>

        <div className="text-[11px] text-slate-500 font-medium">
          Cakupan: <strong className="text-slate-800">Provinsi • Kabupaten/Kota</strong>
        </div>
      </div>
    </div>
  );
};
