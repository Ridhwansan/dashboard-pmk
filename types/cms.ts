export type CmsCardCategory = 'PKPN' | 'Isu Strategis' | 'RPJMN' | string;

export type BlockWidth = 'full' | 'half' | 'third';

export type BlockType =
  | 'kpi_cards'
  | 'spatial_map'
  | 'category_bars'
  | 'milestone_pipeline'
  | 'progress_metrics'
  | 'watchlist'
  | 'insight_callout'
  | 'annual_table';

export interface KpiCardItem {
  id: string;
  label: string;
  val2025?: string | number;
  val2026?: string | number;
  value?: string | number;
  target?: string | number;
  unit?: string;
  subtext?: string;
  delta?: string;
  deltaType?: 'up' | 'down' | 'neutral';
}

export interface KpiCardsBlockData {
  mode: 'single' | 'comparator' | 'multi';
  items: KpiCardItem[];
}

export interface MapPointMarker {
  id: string;
  name: string;
  kabKota?: string;
  provinsi: string;
  lat: number;
  lng: number;
  year?: 2025 | 2026 | number;
  status?: string;
  note?: string;
}

export interface ProvinceAggregateItem {
  provId: string;
  provName: string;
  target?: number;
  realisasi?: number;
  percent?: number;
}

export interface SpatialMapBlockData {
  mapMode: 'points' | 'provinces';
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
  legendTitle?: string;
  markers?: MapPointMarker[];
  provinceData?: ProvinceAggregateItem[];
}

export interface CategoryBarItem {
  id: string;
  name: string;
  val2025: number;
  val2026: number;
  val2025Label?: string;
  val2026Label?: string;
}

export interface CategoryBarsBlockData {
  chartTitle?: string;
  description?: string;
  unit?: string;
  categories: CategoryBarItem[];
}

export interface MilestoneStageItem {
  id: string;
  name: string;
  count: number;
  total?: number;
  percent?: number;
  status?: 'completed' | 'in_progress' | 'pending';
}

export interface MilestonePipelineBlockData {
  title?: string;
  stages: MilestoneStageItem[];
}

export interface ProgressMetricItem {
  id: string;
  label: string;
  val2025: number;
  val2026: number;
  deltaLabel?: string;
  unit?: string;
}

export interface ProgressMetricsBlockData {
  title?: string;
  items: ProgressMetricItem[];
}

export interface WatchlistItem {
  id: string;
  title: string;
  location: string;
  findings: string;
  action: string;
  statusSeverity?: 'danger' | 'warning' | 'info';
}

export interface WatchlistBlockData {
  title?: string;
  actionDirection?: string;
  items: WatchlistItem[];
}

export interface InsightCalloutBlockData {
  title?: string;
  insights: string[];
}

export interface AnnualTableBlockData {
  title?: string;
  showChart?: boolean;
}

export type DetailBlockPayload =
  | KpiCardsBlockData
  | SpatialMapBlockData
  | CategoryBarsBlockData
  | MilestonePipelineBlockData
  | ProgressMetricsBlockData
  | WatchlistBlockData
  | InsightCalloutBlockData
  | AnnualTableBlockData
  | Record<string, unknown>;

export interface DetailBlockConfig {
  id: string;
  type: BlockType;
  title?: string;
  subtitle?: string;
  width: BlockWidth;
  order: number;
  enabled?: boolean;
  data: DetailBlockPayload;
}

export interface CmsCardItem {
  id: string;
  slug: string;
  pillarId: 'pendidikan' | 'kesehatan' | 'bencana' | 'kemiskinan';
  category: CmsCardCategory;
  title: string;
  value: string;
  unit?: string;
  status: string;
  target: string;
  percent?: number | null;
  subtext?: string;
  description?: string;
  picKementerian?: string;
  order: number;
  isActive: boolean;
  includeInPdf?: boolean;
  isMilestone?: boolean;
  milestoneContent?: string;
  annualTargets?: unknown;
  monthlyData?: unknown;
  kendalaList?: unknown;
  updateLogs?: unknown;
  detailBlocks?: DetailBlockConfig[];
}

