'use client';

import React from 'react';
import { ExternalLink } from 'lucide-react';
import { SupersetEmbedConfig } from '@/types/cms';
import { formatIndonesianDateTime } from '@/lib/excelParser';

interface SupersetEmbedViewProps {
  config?: SupersetEmbedConfig | null;
  className?: string;
  defaultTitle?: string;
  defaultSubtitle?: string;
}

export const SupersetEmbedView: React.FC<SupersetEmbedViewProps> = ({
  config,
  className = '',
  defaultTitle,
  defaultSubtitle,
}) => {
  const rawUrl = config?.srcUrl || config?.url || '';
  if (!config || (!rawUrl && !config.uuid)) {
    return null;
  }

  // Construct iframe url
  let embedUrl = rawUrl.trim();
  if (!embedUrl && config.uuid) {
    embedUrl = `https://superset.kemenkopmk.go.id/superset/explore/p/${config.uuid}/?standalone=1&height=${config.heightPx || 400}`;
  }

  const height = config.heightPx || 450;
  const widthPercent = config.widthPercent || 100;

  // Determine width CSS container
  let widthClass = 'w-full';
  if (widthPercent === 50) {
    widthClass = 'w-full lg:w-1/2';
  } else if (widthPercent === 75) {
    widthClass = 'w-full lg:w-3/4 mx-auto';
  }

  const formattedTime = formatIndonesianDateTime(config.updatedAt);

  return (
    <div className={`transition-all duration-200 ${widthClass} ${className}`}>
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
        {/* Header with Title and Update Log Badge */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          <div className="space-y-0.5 min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              {config.title || defaultTitle || 'Visualisasi Analitik Apache Superset'}
            </h3>
            <p className="text-xs text-slate-600 font-normal">
              {defaultSubtitle || 'Dasbor analitik interaktif terintegrasi langsung dari Apache Superset Kemenko PMK'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            {/* Timestamp Log Badge */}
            <div className="inline-flex items-center px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium">
              <span>
                Terakhir dimutakhirkan: <strong>{formattedTime}</strong>
              </span>
            </div>

            {/* Open in full screen / new tab */}
            {embedUrl && (
              <a
                href={embedUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Buka visualisasi di tab baru"
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-2xs transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-hidden"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Buka di Superset</span>
              </a>
            )}
          </div>
        </div>

        {/* Embedded Iframe Container */}
        <div className="relative w-full bg-slate-50" style={{ height: `${height}px` }}>
          <iframe
            src={embedUrl}
            width="100%"
            height={height}
            seamless
            frameBorder="0"
            scrolling="no"
            title={config.title || 'Apache Superset Dashboard'}
            className="w-full h-full border-0 bg-white"
            allow="fullscreen"
          />
        </div>

        {/* Footer info pill */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
          <span>Koneksi Superset: Terhubung (Live Embed)</span>
          <span>Lebar Tampilan: {widthPercent}%</span>
        </div>
      </div>
    </div>
  );
};
