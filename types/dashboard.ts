export type LayerType = 'layer1' | 'layer2' | 'layer3';

export type Layer1ViewMode = 'cards' | 'map';

export type PillarId = 'pendidikan' | 'kesehatan' | 'bencana' | 'kemiskinan';

export interface AnnualIndicator {
  name: string;
  t2025?: string;
  c2025?: string;
  t2026?: string;
  c2026?: string;
  t2027?: string;
  c2027?: string;
  t2028?: string;
  c2028?: string;
  t2029?: string;
  c2029?: string;
  note?: string;
}

export interface IssueOrchestration {
  id: number;
  title: string;
  kendala?: string;
  tindakLanjut: string;
}

export interface PillarSummaryIndicator {
  label: string;
  target: string;
  achievement: string;
  note?: string;
  percent?: number;
  statusType?: 'normal' | 'warning' | 'alert' | 'success';
}

export interface PillarData {
  id: PillarId;
  number: number;
  name: string;
  title: string;
  subtitle: string;
  summaryIndicators: PillarSummaryIndicator[];
  kendalaHighlights: string[];
  indicators2025_2029: AnnualIndicator[];
  kendalaLengkap: IssueOrchestration[];
  footnotes: string;
}

export interface RegionProgress {
  id: string;
  name: string;
  pulau: string;
  progressOverall: number;
  imm: string;
  kemiskinan: string;
  statusPKPN: string;
  agendaTransformasi: string;
  catatanKhusus?: string;
}

export interface DTSENRecord {
  id: string;
  wilayah: string;
  provinsi: string;
  kantongKemiskinan: boolean;
  kategoriSasaran: 'Lansia' | 'Disabilitas' | 'Stunting' | 'TB' | 'Pendidikan Gratis';
  desil: 'Desil 1' | 'Desil 2' | 'Desil 3' | 'Desil 4' | 'Desil 5';
  jumlahSasaran: number;
  statusMBG: 'Terhenti' | 'Perlu Intervensi' | 'Dalam Proses' | 'Terlayani';
  keterangan: string;
}
