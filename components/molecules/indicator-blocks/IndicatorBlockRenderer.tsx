'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import {
  DetailBlockConfig,
  KpiCardsBlockData,
  SpatialMapBlockData,
  CategoryBarsBlockData,
  MilestonePipelineBlockData,
  ProgressMetricsBlockData,
  WatchlistBlockData,
  InsightCalloutBlockData,
  AnnualTableBlockData,
} from '@/types/cms';
import { KpiCardsBlock } from './KpiCardsBlock';
import { CategoryBarBlock } from './CategoryBarBlock';
import { MilestonePipelineBlock } from './MilestonePipelineBlock';
import { ProgressMetricsBlock } from './ProgressMetricsBlock';
import { WatchlistBlock } from './WatchlistBlock';
import { InsightCalloutBlock } from './InsightCalloutBlock';
import { AnnualTableBlock } from './AnnualTableBlock';

// Dynamic import Leaflet spatial map to prevent SSR hydration issues
const DynamicSpatialMapBlock = dynamic(
  () => import('./SpatialMapBlock').then((mod) => mod.SpatialMapBlock),
  {
    ssr: false,
    loading: () => (
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs h-[360px] flex flex-col items-center justify-center gap-2 text-slate-500">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
        <span className="text-xs font-semibold text-slate-700">Memuat Peta Spasial Program...</span>
      </div>
    ),
  }
);

interface IndicatorBlockRendererProps {
  blocks: DetailBlockConfig[];
  annualTargets?: Array<{
    year: number;
    target: string;
    capaian: string;
    percent?: number;
    status?: string;
  }>;
  unit?: string;
  className?: string;
}

export const IndicatorBlockRenderer: React.FC<IndicatorBlockRendererProps> = ({
  blocks,
  annualTargets,
  unit,
  className = '',
}) => {
  if (!blocks || blocks.length === 0) return null;

  // Filter enabled blocks and sort by order
  const activeBlocks = blocks
    .filter((b) => b.enabled !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  if (activeBlocks.length === 0) return null;

  return (
    <div className={`grid grid-cols-12 gap-5 sm:gap-6 items-stretch ${className}`}>
      {activeBlocks.map((block) => {
        // Resolve responsive column span
        const colSpanClass =
          block.width === 'half'
            ? 'col-span-12 lg:col-span-6'
            : block.width === 'third'
            ? 'col-span-12 md:col-span-4'
            : 'col-span-12';

        return (
          <div key={block.id} className={`${colSpanClass} flex flex-col h-full`}>
            {block.type === 'kpi_cards' && (
              <KpiCardsBlock
                data={block.data as KpiCardsBlockData}
                title={block.title}
                subtitle={block.subtitle}
                className="w-full h-full"
              />
            )}

            {block.type === 'spatial_map' && (
              <DynamicSpatialMapBlock
                data={block.data as SpatialMapBlockData}
                title={block.title}
                subtitle={block.subtitle}
                className="w-full h-full"
              />
            )}

            {block.type === 'category_bars' && (
              <CategoryBarBlock
                data={block.data as CategoryBarsBlockData}
                title={block.title}
                subtitle={block.subtitle}
                className="w-full h-full"
              />
            )}

            {block.type === 'milestone_pipeline' && (
              <MilestonePipelineBlock
                data={block.data as MilestonePipelineBlockData}
                title={block.title}
                subtitle={block.subtitle}
                className="w-full h-full"
              />
            )}

            {block.type === 'progress_metrics' && (
              <ProgressMetricsBlock
                data={block.data as ProgressMetricsBlockData}
                title={block.title}
                subtitle={block.subtitle}
                className="w-full h-full"
              />
            )}

            {block.type === 'watchlist' && (
              <WatchlistBlock
                data={block.data as WatchlistBlockData}
                title={block.title}
                subtitle={block.subtitle}
                className="w-full h-full"
              />
            )}

            {block.type === 'insight_callout' && (
              <InsightCalloutBlock
                data={block.data as InsightCalloutBlockData}
                title={block.title}
                width={block.width}
                className="w-full h-full"
              />
            )}

            {block.type === 'annual_table' && (
              <AnnualTableBlock
                data={block.data as AnnualTableBlockData}
                annualTargets={annualTargets}
                title={block.title}
                subtitle={block.subtitle}
                unit={unit}
                className="w-full h-full"
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
