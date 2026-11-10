export interface CmsCardItem {
  id: string;
  slug: string;
  pillarId: 'pendidikan' | 'kesehatan' | 'bencana' | 'kemiskinan';
  category: 'PKPN' | 'Isu Strategis';
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
}

