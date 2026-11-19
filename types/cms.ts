export type CmsCardCategory = 'PKPN' | 'Isu Strategis' | 'RPJMN' | string;

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

// ---------------------------------------------------------------------------
// Detail Page Sections & Layout Configuration
// ---------------------------------------------------------------------------
export type DetailSectionId =
  | 'superset'
  | 'custom_excel'
  | 'spatial_map'
  | 'kinerja_chart'
  | 'kendala';

export interface DetailSectionOrderItem {
  id: DetailSectionId;
  name: string;
  order: number;
  enabled: boolean;
}

// ---------------------------------------------------------------------------
// Apache Superset Embed Configuration
// ---------------------------------------------------------------------------
export interface SupersetEmbedConfig {
  enabled: boolean;
  iframeCode?: string;       // Raw snippet iframe pasted by user
  srcUrl: string;            // Extracted direct URL
  url?: string;              // Optional alias for srcUrl
  uuid?: string;             // Extracted Superset UUID (e.g. BQpgLPvgJMo)
  widthPercent: number;      // 50, 75, or 100 (%)
  heightPx: number;          // e.g. 400, 500, 600 (px)
  title?: string;
  updatedAt?: string;        // ISO timestamp log when embed was updated
  sectionOrder?: DetailSectionId[];      // Configurable display order of sections
  sectionSettings?: DetailSectionOrderItem[]; // Detailed section order & enabled flags
}

export interface CmsPillarItem {
  id: string;
  name: string;
  badge?: string;
  description?: string;
  order?: number;
  programCount?: number;
}

// ---------------------------------------------------------------------------
// Custom Excel Table Data (Template Generator & Uploader)
// ---------------------------------------------------------------------------
export interface CustomExcelColumn {
  id: string;
  name: string;              // e.g. "No", "Program atau Komponen", "Indikasi data khusus"
  label?: string;            // Alias for name
  key: string;
  width?: string;
}

export interface CustomExcelTableData {
  id?: string;
  title?: string;
  tableName?: string;        // Alias for title
  description?: string;
  columns: CustomExcelColumn[];
  rows: Record<string, string>[];
  templateFileName?: string;
  templateFileBase64?: string;
  fileName?: string;
  rowCount: number;
  uploadedAt?: string;       // ISO timestamp log when excel was uploaded
  lastUploadedAt?: string;   // Alias for uploadedAt
}

// ---------------------------------------------------------------------------
// Spatial Map Coordinates Uploaded via Excel
// ---------------------------------------------------------------------------
export interface MapMarkersExcelData {
  markers: MapPointMarker[];
  fileName?: string;
  markerCount: number;
  uploadedAt?: string;       // ISO timestamp log when map markers were uploaded
  lastUploadedAt?: string;   // Alias for uploadedAt
}

export interface CmsCardItem {
  id: string;
  slug: string;
  pillarId: string;
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
  supersetEmbed?: SupersetEmbedConfig;
  spatialMapEmbed?: SupersetEmbedConfig;
  customExcelTable?: CustomExcelTableData;
  customExcelTables?: CustomExcelTableData[];
  mapMarkersExcel?: MapMarkersExcelData;
  detailSectionOrder?: DetailSectionId[];
}

