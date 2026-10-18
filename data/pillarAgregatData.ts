import { MapPillarId } from './mapIndicators';

export interface AnnualIndicatorMetric {
  target: string;
  capaian: string;
  percent?: string;
  statusType?: 'success' | 'warning' | 'alert' | 'info' | 'pending';
}

export interface AgregatIndicatorRow {
  id: string;
  mapIndicatorId?: string; // Matching ID in MAP_INDICATORS to highlight choropleth
  name: string;
  unit: string;
  years: Record<number, AnnualIndicatorMetric>;
}

export interface PillarAgregatData {
  pillarId: MapPillarId;
  pillarName: string;
  badge: string;
  description: string;
  indicators: AgregatIndicatorRow[];
}

export const AVAILABLE_YEARS = [2025, 2026, 2027, 2028, 2029] as const;
export type PeriodYear = (typeof AVAILABLE_YEARS)[number];

export const PILLAR_AGREGAT_DATA: Record<Exclude<MapPillarId, 'all'>, PillarAgregatData> = {
  pendidikan: {
    pillarId: 'pendidikan',
    pillarName: 'Pilar Pendidikan',
    badge: 'Pilar 1',
    description: 'Target & Capaian Tahunan Program Prioritas Pendidikan Nasional (PKPN)',
    indicators: [
      {
        id: 'imm',
        mapIndicatorId: 'imm_pendidikan',
        name: 'Indeks Modal Manusia',
        unit: 'poin',
        years: {
          2025: { target: '0,56', capaian: '—' },
          2026: { target: '0.57', capaian: '—' },
          2027: { target: '0.575', capaian: '—' },
          2028: { target: '0.58', capaian: '—' },
          2029: { target: '0.59', capaian: '—' },
        },
      },
      {
        id: 'revitalisasi_satdik',
        mapIndicatorId: 'revitalisasi_satdik',
        name: 'Revitalisasi (satdik)',
        unit: 'satdik',
        years: {
          2025: { target: '12.825', capaian: '17.508', percent: '136,5%', statusType: 'success' },
          2026: { target: '80.282', capaian: '36.669 (45,7%)', percent: '45,7%', statusType: 'warning' },
          2027: { target: '99.423', capaian: '—' },
          2028: { target: '116.614', capaian: '—' },
          2029: { target: '98.375', capaian: '—' },
        },
      },
      {
        id: 'snt_operasional',
        mapIndicatorId: 'snt_operasional',
        name: 'SNT operasional (unit - kumulatif)',
        unit: 'unit - kumulatif',
        years: {
          2025: { target: '—', capaian: '—' },
          2026: { target: '35', capaian: '17 (45,9%)', percent: '45,9%', statusType: 'warning' },
          2027: { target: '135', capaian: '—' },
          2028: { target: '335', capaian: '—' },
          2029: { target: '500', capaian: '—' },
        },
      },
      {
        id: 'sug_baru',
        mapIndicatorId: 'sug_baru',
        name: 'SUG baru (unit)',
        unit: 'unit',
        years: {
          2025: { target: '4', capaian: '—' },
          2026: { target: '4', capaian: '3 (75%)', percent: '75%', statusType: 'success' },
          2027: { target: '5', capaian: '—' },
          2028: { target: '4', capaian: '—' },
          2029: { target: '3', capaian: '—' },
        },
      },
      {
        id: 'sug_transformasi',
        mapIndicatorId: 'sug_transformasi',
        name: 'SUG Transformasi (unit)',
        unit: 'unit',
        years: {
          2025: { target: '12', capaian: '12', percent: '100%', statusType: 'success' },
          2026: { target: '30', capaian: '30', percent: '100%', statusType: 'success' },
          2027: { target: '50', capaian: '—' },
          2028: { target: '—', capaian: '—' },
          2029: { target: '—', capaian: '—' },
        },
      },
      {
        id: 'ifp_disalurkan',
        mapIndicatorId: 'ifp_digitalisasi',
        name: 'IFP diproduksi dan disalurkan (perangkat & satdik)',
        unit: 'perangkat & satdik',
        years: {
          2025: { target: '288.865', capaian: '288.865 (100%)', percent: '100%', statusType: 'success' },
          2026: { target: '727.436', capaian: '727.436 (100%) (Berproses disalurkan)', percent: '100%', statusType: 'info' },
          2027: { target: '—', capaian: '—' },
          2028: { target: '—', capaian: '—' },
          2029: { target: '—', capaian: '—' },
        },
      },
      {
        id: 'studio_guru',
        mapIndicatorId: 'studio_guru',
        name: 'Studio Guru',
        unit: 'tahap',
        years: {
          2025: { target: '—', capaian: '—' },
          2026: { target: 'Peluncuran Nov 2027', capaian: '—', statusType: 'pending' },
          2027: { target: 'Operasional', capaian: '—' },
          2028: { target: '—', capaian: '—' },
          2029: { target: '—', capaian: '—' },
        },
      },
    ],
  },

  kesehatan: {
    pillarId: 'kesehatan',
    pillarName: 'Pilar Kesehatan',
    badge: 'Pilar 2',
    description: 'Target & Capaian Tahunan Pelayanan Kesehatan & Gizi Prioritas',
    indicators: [
      {
        id: 'ckg',
        mapIndicatorId: 'ckg_kesehatan',
        name: 'Pemeriksaan Kesehatan Gratis (CKG)',
        unit: 'jiwa',
        years: {
          2025: { target: '10.000.000', capaian: '8.450.000 (84,5%)', percent: '84,5%', statusType: 'success' },
          2026: { target: '52.200.000', capaian: '38.410.000 (73,6%)', percent: '73,6%', statusType: 'warning' },
          2027: { target: '75.000.000', capaian: '—' },
          2028: { target: '95.000.000', capaian: '—' },
          2029: { target: '120.000.000', capaian: '—' },
        },
      },
      {
        id: 'tb',
        mapIndicatorId: 'tb_penemuan',
        name: 'Penuntasan Tuberkulosis (TB)',
        unit: '%',
        years: {
          2025: { target: '85%', capaian: '81,2%', percent: '81,2%', statusType: 'success' },
          2026: { target: '90%', capaian: '74,5%', percent: '74,5%', statusType: 'warning' },
          2027: { target: '92%', capaian: '—' },
          2028: { target: '95%', capaian: '—' },
          2029: { target: '95%', capaian: '—' },
        },
      },
      {
        id: 'mbg',
        mapIndicatorId: 'mbg_3b',
        name: 'Makan Bergizi Gratis (MBG 3B)',
        unit: 'sasaran',
        years: {
          2025: { target: '3.000.000', capaian: '2.920.000 (97,3%)', percent: '97,3%', statusType: 'success' },
          2026: { target: '15.000.000', capaian: '12.350.000 (82,3%)', percent: '82,3%', statusType: 'success' },
          2027: { target: '28.000.000', capaian: '—' },
          2028: { target: '45.000.000', capaian: '—' },
          2029: { target: '82.900.000', capaian: '—' },
        },
      },
      {
        id: 'rsud',
        mapIndicatorId: 'rsud_spesialis',
        name: 'Peningkatan Kesiapan RSUD & Faskes',
        unit: 'kab/kota',
        years: {
          2025: { target: '250', capaian: '238 (95,2%)', percent: '95,2%', statusType: 'success' },
          2026: { target: '514', capaian: '342 (66,5%)', percent: '66,5%', statusType: 'warning' },
          2027: { target: '514', capaian: '—' },
          2028: { target: '514', capaian: '—' },
          2029: { target: '514', capaian: '—' },
        },
      },
      {
        id: 'stunting',
        mapIndicatorId: 'stunting_prev',
        name: 'Penurunan Prevalensi Stunting',
        unit: '%',
        years: {
          2025: { target: '17,0%', capaian: '17,8%', percent: '95,5%', statusType: 'warning' },
          2026: { target: '14,0%', capaian: '16,2%', percent: '86,4%', statusType: 'warning' },
          2027: { target: '12,5%', capaian: '—' },
          2028: { target: '11,0%', capaian: '—' },
          2029: { target: '< 10,0%', capaian: '—' },
        },
      },
    ],
  },

  bencana: {
    pillarId: 'bencana',
    pillarName: 'Ketahanan Bencana',
    badge: 'Pilar 3',
    description: 'Target & Capaian Tahunan Kesiapsiagaan & Pemulihan Pascabencana',
    indicators: [
      {
        id: 'huntap',
        mapIndicatorId: 'huntap_bencana',
        name: 'Hunian Tetap (Huntap) Pascabencana',
        unit: 'unit',
        years: {
          2025: { target: '1.850', capaian: '1.620 (87,6%)', percent: '87,6%', statusType: 'success' },
          2026: { target: '4.250', capaian: '3.480 (81,9%)', percent: '81,9%', statusType: 'success' },
          2027: { target: '5.500', capaian: '—' },
          2028: { target: '6.000', capaian: '—' },
          2029: { target: '6.500', capaian: '—' },
        },
      },
      {
        id: 'huntara',
        mapIndicatorId: 'huntara_bencana',
        name: 'Hunian Sementara (Huntara) Layak Huni',
        unit: 'unit',
        years: {
          2025: { target: '2.200', capaian: '2.150 (97,7%)', percent: '97,7%', statusType: 'success' },
          2026: { target: '5.100', capaian: '4.720 (92,5%)', percent: '92,5%', statusType: 'success' },
          2027: { target: '5.500', capaian: '—' },
          2028: { target: '5.500', capaian: '—' },
          2029: { target: '5.500', capaian: '—' },
        },
      },
      {
        id: 'destana',
        mapIndicatorId: 'infrastruktur_bencana',
        name: 'Desa Tangguh Bencana (Destana)',
        unit: 'desa',
        years: {
          2025: { target: '1.200', capaian: '1.150 (95,8%)', percent: '95,8%', statusType: 'success' },
          2026: { target: '3.500', capaian: '2.410 (68,9%)', percent: '68,9%', statusType: 'warning' },
          2027: { target: '5.000', capaian: '—' },
          2028: { target: '7.500', capaian: '—' },
          2029: { target: '10.000', capaian: '—' },
        },
      },
      {
        id: 'ews',
        mapIndicatorId: 'mitigasi_bencana',
        name: 'Sistem Peringatan Dini (EWS) Terintegrasi',
        unit: '%',
        years: {
          2025: { target: '80%', capaian: '76,4%', percent: '76,4%', statusType: 'warning' },
          2026: { target: '88%', capaian: '78,2%', percent: '78,2%', statusType: 'warning' },
          2027: { target: '92%', capaian: '—' },
          2028: { target: '95%', capaian: '—' },
          2029: { target: '98%', capaian: '—' },
        },
      },
    ],
  },

  kemiskinan: {
    pillarId: 'kemiskinan',
    pillarName: 'Penurunan Kemiskinan',
    badge: 'Pilar 4',
    description: 'Target & Capaian Tahunan Perlindungan Sosial & Penanggulangan Kemiskinan',
    indicators: [
      {
        id: 'dtsen',
        mapIndicatorId: 'dtsen_desil_pilar',
        name: 'Pendataan Terpadu Desil 1–2 (DTSEN)',
        unit: '%',
        years: {
          2025: { target: '95%', capaian: '94,2%', percent: '94,2%', statusType: 'success' },
          2026: { target: '98%', capaian: '92,4%', percent: '92,4%', statusType: 'success' },
          2027: { target: '99%', capaian: '—' },
          2028: { target: '100%', capaian: '—' },
          2029: { target: '100%', capaian: '—' },
        },
      },
      {
        id: 'bansos',
        mapIndicatorId: 'graduasi_bansos_pilar',
        name: 'Penyaluran Bansos Adaptif Tepat Sasaran',
        unit: '%',
        years: {
          2025: { target: '95%', capaian: '93,1%', percent: '93,1%', statusType: 'success' },
          2026: { target: '97%', capaian: '88,6%', percent: '88,6%', statusType: 'warning' },
          2027: { target: '98%', capaian: '—' },
          2028: { target: '99%', capaian: '—' },
          2029: { target: '99%', capaian: '—' },
        },
      },
      {
        id: 'ekstrem',
        mapIndicatorId: 'kemiskinan_ekstrem_pilar',
        name: 'Pengentasan Kemiskinan Ekstrem',
        unit: '%',
        years: {
          2025: { target: '< 0,8%', capaian: '0,83%', percent: '96%', statusType: 'warning' },
          2026: { target: '0,0%', capaian: '0,45%', percent: '55%', statusType: 'warning' },
          2027: { target: '0,0%', capaian: '—' },
          2028: { target: '0,0%', capaian: '—' },
          2029: { target: '0,0%', capaian: '—' },
        },
      },
      {
        id: 'pemberdayaan',
        mapIndicatorId: 'tingkat_kemiskinan_pilar',
        name: 'Pemberdayaan Ekonomi Keluarga Rentan',
        unit: 'KPM',
        years: {
          2025: { target: '500.000', capaian: '485.000 (97%)', percent: '97%', statusType: 'success' },
          2026: { target: '1.800.000', capaian: '1.120.000 (62,2%)', percent: '62,2%', statusType: 'warning' },
          2027: { target: '2.500.000', capaian: '—' },
          2028: { target: '3.200.000', capaian: '—' },
          2029: { target: '4.000.000', capaian: '—' },
        },
      },
    ],
  },
};

export function getPillarAgregatData(pillarId: MapPillarId): PillarAgregatData | null {
  if (pillarId === 'all') return null;
  return PILLAR_AGREGAT_DATA[pillarId] || null;
}
