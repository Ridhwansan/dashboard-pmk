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
        id: 'revitalisasi_satdik',
        mapIndicatorId: 'revitalisasi_satdik',
        name: 'Revitalisasi Sarana dan Prasarana Sekolah/Madrasah',
        unit: 'satdik',
        years: {
          2025: { target: '12.825', capaian: '17.508', percent: '136,5%', statusType: 'success' },
          2026: { target: '80.282', capaian: '36.669', percent: '45,7%', statusType: 'warning' },
          2027: { target: '99.423', capaian: '—' },
          2028: { target: '116.614', capaian: '—' },
          2029: { target: '98.375', capaian: '—' },
        },
      },
      {
        id: 'snt_operasional',
        mapIndicatorId: 'snt_operasional',
        name: 'Sekolah Nasional Terintegrasi (SNT)',
        unit: 'unit · kumulatif',
        years: {
          2025: { target: '—', capaian: '—' },
          2026: { target: '35', capaian: '17', percent: '48,6%', statusType: 'warning' },
          2027: { target: '135', capaian: '—' },
          2028: { target: '335', capaian: '—' },
          2029: { target: '500', capaian: '—' },
        },
      },
      {
        id: 'digitalisasi_pembelajaran',
        mapIndicatorId: 'ifp_digitalisasi',
        name: 'Digitalisasi Pembelajaran',
        unit: 'unit perangkat',
        years: {
          2025: { target: '288.865', capaian: '288.865 (100%)', percent: '100%', statusType: 'success' },
          2026: { target: '727.436', capaian: '727.436 (100%) (Berproses disalurkan)', percent: '100%', statusType: 'info' },
          2027: { target: '850.000', capaian: '—' },
          2028: { target: '—', capaian: '—' },
          2029: { target: '—', capaian: '—' },
        },
      },
      {
        id: 'sug_semua',
        mapIndicatorId: 'sug_semua',
        name: 'Sekolah Unggul Garuda (SUGT & SUGB)',
        unit: 'unit sekolah',
        years: {
          2025: { target: '16', capaian: '14', percent: '87,5%', statusType: 'success' },
          2026: { target: '34', capaian: '46', percent: '135,3%', statusType: 'success' },
          2027: { target: '55', capaian: '—' },
          2028: { target: '—', capaian: '—' },
          2029: { target: '—', capaian: '—' },
        },
      },
      {
        id: 'sug_transformasi',
        mapIndicatorId: 'sug_transformasi',
        name: 'Sekolah Unggul Garuda Transformasi (SUGT)',
        unit: 'unit',
        years: {
          2025: { target: '12', capaian: '12', percent: '100%', statusType: 'success' },
          2026: { target: '30', capaian: '42', percent: '140%', statusType: 'success' },
          2027: { target: '50', capaian: '—' },
          2028: { target: '—', capaian: '—' },
          2029: { target: '—', capaian: '—' },
        },
      },
      {
        id: 'sug_baru',
        mapIndicatorId: 'sug_baru',
        name: 'Sekolah Unggul Garuda Baru (SUGB)',
        unit: 'unit',
        years: {
          2025: { target: '4', capaian: '2', percent: '50%', statusType: 'warning' },
          2026: { target: '4', capaian: '4', percent: '100%', statusType: 'success' },
          2027: { target: '5', capaian: '—' },
          2028: { target: '4', capaian: '—' },
          2029: { target: '3', capaian: '—' },
        },
      },
      {
        id: 'studio_guru',
        mapIndicatorId: 'studio_guru',
        name: 'Studio Guru',
        unit: 'tahap',
        years: {
          2025: { target: 'Penyiapan', capaian: 'Selesai Pedoman', percent: '100%', statusType: 'success' },
          2026: { target: 'Uji Coba Studio', capaian: 'Tahap Penyiapan', percent: '70%', statusType: 'warning' },
          2027: { target: 'Peluncuran Nov 2027', capaian: '—' },
          2028: { target: 'Operasional Penuh', capaian: '—' },
          2029: { target: 'Ekspansi Nasional', capaian: '—' },
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
        name: 'Cek Kesehatan Gratis',
        unit: 'juta jiwa',
        years: {
          2025: { target: '102', capaian: '70,3 (68,9%)', percent: '68,9%', statusType: 'success' },
          2026: { target: '130', capaian: '105,98 (81,5%)', percent: '81,5%', statusType: 'success' },
          2027: { target: '157', capaian: '—' },
          2028: { target: '174', capaian: '—' },
          2029: { target: '199', capaian: '—' },
        },
      },
      {
        id: 'tb',
        mapIndicatorId: 'tb_penemuan',
        name: 'Penuntasan Tuberkulosis',
        unit: 'kasus',
        years: {
          2025: { target: '981.000', capaian: '867.480 (88,4%)', percent: '88,4%', statusType: 'success' },
          2026: { target: '972.000', capaian: '656.517 (67,5%)', percent: '67,5%', statusType: 'warning' },
          2027: { target: '963.014', capaian: '—' },
          2028: { target: '954.035', capaian: '—' },
          2029: { target: '945.058', capaian: '—' },
        },
      },
      {
        id: 'rsud',
        mapIndicatorId: 'rsud_spesialis',
        name: 'Revitalisasi Rumah Sakit Umum Daerah (RSUD)',
        unit: 'RSUD',
        years: {
          2025: { target: '21', capaian: '21', percent: '100%', statusType: 'success' },
          2026: { target: '20', capaian: '18 (90%)', percent: '90%', statusType: 'success' },
          2027: { target: '66', capaian: '—' },
          2028: { target: '80', capaian: '—' },
          2029: { target: '100', capaian: '—' },
        },
      },
      {
        id: 'mbg_3b',
        mapIndicatorId: 'mbg_3b',
        name: 'MBG Ibu Hamil, Ibu Menyusui, dan Balita (3B)',
        unit: '% dari sasaran',
        years: {
          2025: { target: '35', capaian: '32', percent: '91,4%', statusType: 'success' },
          2026: { target: '50', capaian: '54,5 (109%)', percent: '100%', statusType: 'success' },
          2027: { target: '70', capaian: '—' },
          2028: { target: '80', capaian: '—' },
          2029: { target: '100', capaian: '—' },
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
        id: 'rehabilitasi_sumatera',
        mapIndicatorId: 'rehabilitasi_sumatera',
        name: 'Rehabilitasi dan Rekonstruksi Sumatera',
        unit: 'unit / %',
        years: {
          2025: { target: '7.200', capaian: '3.350 (46,5%)', percent: '46,5%', statusType: 'warning' },
          2026: { target: '60.045', capaian: '21.974 (Huntap & Huntara)', percent: '36,6%', statusType: 'warning' },
          2027: { target: '77.500', capaian: '—' },
          2028: { target: '—', capaian: '—' },
          2029: { target: '—', capaian: '—' },
        },
      },
      {
        id: 'huntap',
        mapIndicatorId: 'huntap_bencana',
        name: 'Hunian Tetap (Huntap) Pascabencana',
        unit: 'unit',
        years: {
          2025: { target: '1.850', capaian: '1.620 (87,6%)', percent: '87,6%', statusType: 'success' },
          2026: { target: '39.501', capaian: '1.707 (4,3%)', percent: '4,3%', statusType: 'alert' },
          2027: { target: '57.027', capaian: '—' },
          2028: { target: '—', capaian: '—' },
          2029: { target: '—', capaian: '—' },
        },
      },
      {
        id: 'huntara',
        mapIndicatorId: 'huntara_bencana',
        name: 'Hunian Sementara (Huntara) Layak Huni',
        unit: 'unit',
        years: {
          2025: { target: '2.200', capaian: '2.150 (97,7%)', percent: '97,7%', statusType: 'success' },
          2026: { target: '20.544', capaian: '20.267 (99,0%)', percent: '99,0%', statusType: 'success' },
          2027: { target: '20.544', capaian: '—' },
          2028: { target: '—', capaian: '—' },
          2029: { target: '—', capaian: '—' },
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
