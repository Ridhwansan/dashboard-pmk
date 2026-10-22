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
        name: 'Revitalisasi satuan pendidikan',
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
        name: 'SNT operasional',
        unit: 'unit sekolah kumulatif',
        years: {
          2025: { target: '—', capaian: '—' },
          2026: { target: '35', capaian: '17', percent: '45,9%', statusType: 'warning' },
          2027: { target: '135', capaian: '—' },
          2028: { target: '335', capaian: '—' },
          2029: { target: '500', capaian: '—' },
        },
      },
      {
        id: 'digitalisasi_pembelajaran',
        mapIndicatorId: 'ifp_digitalisasi',
        name: 'IFP diproduksi dan disalurkan',
        unit: 'perangkat & satdik',
        years: {
          2025: { target: '288.865', capaian: '288.865 (100%)', percent: '100%', statusType: 'success' },
          2026: { target: '727.436', capaian: '727.436 (100%) (Berproses disalurkan)', percent: '100%', statusType: 'success' },
          2027: { target: '—', capaian: '—' },
          2028: { target: '—', capaian: '—' },
          2029: { target: '—', capaian: '—' },
        },
      },
      {
        id: 'sug_transformasi',
        mapIndicatorId: 'sug_transformasi',
        name: 'SUG Transformasi',
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
        id: 'sug_baru',
        mapIndicatorId: 'sug_baru',
        name: 'SUG baru',
        unit: 'unit',
        years: {
          2025: { target: '4', capaian: '—' },
          2026: { target: '4', capaian: '3 (75%)', percent: '75%', statusType: 'warning' },
          2027: { target: '5', capaian: '—' },
          2028: { target: '4', capaian: '—' },
          2029: { target: '3', capaian: '—' },
        },
      },
      {
        id: 'studio_guru',
        mapIndicatorId: 'studio_guru',
        name: 'Studio Guru',
        unit: '',
        years: {
          2025: { target: '—', capaian: '—' },
          2026: { target: 'Peluncuran Nov 2027', capaian: '—' },
          2027: { target: 'Operasional', capaian: '—' },
          2028: { target: '—', capaian: '—' },
          2029: { target: '—', capaian: '—' },
        },
      },
      {
        id: 'imm',
        name: 'Indeks Modal Manusia (IMM)',
        unit: 'poin',
        years: {
          2025: { target: '0,56', capaian: '0,562', percent: '100%', statusType: 'success' },
          2026: { target: '0,57', capaian: '0,566', percent: '99,3%', statusType: 'success' },
          2027: { target: '0,575', capaian: '—' },
          2028: { target: '0,582', capaian: '—' },
          2029: { target: '0,590', capaian: '—' },
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
          2025: { target: '102', capaian: '70,3', percent: '68,9%', statusType: 'success' },
          2026: { target: '130', capaian: '105,98', percent: '81,5%', statusType: 'success' },
          2027: { target: '157', capaian: '—' },
          2028: { target: '174', capaian: '—' },
          2029: { target: '199', capaian: '—' },
        },
      },
      {
        id: 'tb',
        mapIndicatorId: 'tb_penemuan',
        name: 'Penuntasan Tuberkulosis (Kasus TB)',
        unit: 'kasus',
        years: {
          2025: { target: '981.000', capaian: '867.480', percent: '88,4%', statusType: 'success' },
          2026: { target: '972.000', capaian: '663.455', percent: '68,3%', statusType: 'warning' },
          2027: { target: '963.014', capaian: '—' },
          2028: { target: '954.035', capaian: '—' },
          2029: { target: '945.058', capaian: '—' },
        },
      },
      {
        id: 'rsud',
        mapIndicatorId: 'rsud_spesialis',
        name: 'Renovasi RSUD Tipe D ke C',
        unit: 'RSUD',
        years: {
          2025: { target: '21', capaian: '21', percent: '100%', statusType: 'success' },
          2026: { target: '20', capaian: '18', percent: '90%', statusType: 'success' },
          2027: { target: '66', capaian: '—' },
          2028: { target: '80', capaian: '—' },
          2029: { target: '100', capaian: '—' },
        },
      },
      {
        id: 'stunting',
        name: 'Percepatan Penurunan Stunting',
        unit: '%',
        years: {
          2025: { target: '20,5%', capaian: '19,8%', percent: '96,6%', statusType: 'success' },
          2026: { target: '18,2%', capaian: '17,6%', percent: '96,7%', statusType: 'success' },
          2027: { target: '16,5%', capaian: '—' },
          2028: { target: '15,2%', capaian: '—' },
          2029: { target: '14,0%', capaian: '—' },
        },
      },
      {
        id: 'mbg_3b',
        mapIndicatorId: 'mbg_3b',
        name: 'MBG Ibu Hamil, Ibu Menyusui, dan Balita (3B)',
        unit: '% sasaran',
        years: {
          2025: { target: '35', capaian: '32', percent: '91,4%', statusType: 'success' },
          2026: { target: '50', capaian: '54,5', percent: '109%', statusType: 'success' },
          2027: { target: '70', capaian: '—' },
          2028: { target: '80', capaian: '—' },
          2029: { target: '100', capaian: '—' },
        },
      },
      {
        id: 'mbg_balita',
        name: 'MBG balita non-PAUD',
        unit: 'juta jiwa',
        years: {
          2025: { target: '10', capaian: '8', percent: '80%', statusType: 'success' },
          2026: { target: '16,7', capaian: '4,89', percent: '29,2%', statusType: 'warning' },
          2027: { target: '25', capaian: '—' },
          2028: { target: '30', capaian: '—' },
          2029: { target: '35', capaian: '—' },
        },
      },
      {
        id: 'mbg_ibu_hamil',
        name: 'MBG ibu hamil',
        unit: 'juta jiwa',
        years: {
          2025: { target: '1,5', capaian: '1,2', percent: '80%', statusType: 'success' },
          2026: { target: '2,49', capaian: '0,65', percent: '26,3%', statusType: 'warning' },
          2027: { target: '3,5', capaian: '—' },
          2028: { target: '4,0', capaian: '—' },
          2029: { target: '4,5', capaian: '—' },
        },
      },
      {
        id: 'mbg_ibu_menyusui',
        name: 'MBG ibu menyusui',
        unit: 'juta jiwa',
        years: {
          2025: { target: '1,8', capaian: '1,6', percent: '88,9%', statusType: 'success' },
          2026: { target: '2,75', capaian: '1,77', percent: '64,5%', statusType: 'warning' },
          2027: { target: '3,5', capaian: '—' },
          2028: { target: '4,0', capaian: '—' },
          2029: { target: '4,5', capaian: '—' },
        },
      },
      {
        id: 'puskesmas',
        name: 'Revitalisasi Puskesmas & Labkesmas',
        unit: 'puskesmas',
        years: {
          2025: { target: '2.000', capaian: '2.000', percent: '100%', statusType: 'success' },
          2026: { target: '5.000', capaian: '4.200', percent: '84%', statusType: 'success' },
          2027: { target: '10.000', capaian: '—' },
          2028: { target: '10.000', capaian: '—' },
          2029: { target: '10.000', capaian: '—' },
        },
      },
      {
        id: 'revitalisasi_rs',
        name: 'Revitalisasi RS Jejaring KJSU',
        unit: 'RS',
        years: {
          2025: { target: '100', capaian: '100', percent: '100%', statusType: 'success' },
          2026: { target: '250', capaian: '210', percent: '84%', statusType: 'success' },
          2027: { target: '450', capaian: '—' },
          2028: { target: '450', capaian: '—' },
          2029: { target: '450', capaian: '—' },
        },
      },
    ],
  },

  bencana: {
    pillarId: 'bencana',
    pillarName: 'Bencana',
    badge: 'Pilar 3',
    description: 'Target & Capaian Tahunan Kesiapsiagaan & Pemulihan Pascabencana',
    indicators: [
      {
        id: 'jumlah_kejadian_bencana',
        name: 'Jumlah kejadian bencana',
        unit: 'kejadian',
        years: {
          2025: { target: '4.727', capaian: '3.176', percent: '100%', statusType: 'success' },
          2026: { target: '2.500', capaian: '2.100', percent: '84%', statusType: 'warning' },
          2027: { target: '2.400', capaian: '—' },
          2028: { target: '2.300', capaian: '—' },
          2029: { target: '2.200', capaian: '—' },
        },
      },
      {
        id: 'huntara',
        mapIndicatorId: 'huntara_bencana',
        name: 'Pembangunan Huntara Sumatera',
        unit: 'unit',
        years: {
          2025: { target: '15.000', capaian: '14.800', percent: '98,7%', statusType: 'success' },
          2026: { target: '20.803', capaian: '20.770', percent: '99,8%', statusType: 'success' },
          2027: { target: '21.000', capaian: '—' },
          2028: { target: '21.000', capaian: '—' },
          2029: { target: '21.000', capaian: '—' },
        },
      },
      {
        id: 'huntap',
        mapIndicatorId: 'huntap_bencana',
        name: 'Pembangunan Huntap Sumatera',
        unit: 'unit',
        years: {
          2025: { target: '1.850', capaian: '1.620', percent: '87,6%', statusType: 'success' },
          2026: { target: '44.121', capaian: '1.012', percent: '2,3%', statusType: 'alert' },
          2027: { target: '57.027', capaian: '—' },
          2028: { target: '57.027', capaian: '—' },
          2029: { target: '57.027', capaian: '—' },
        },
      },
      {
        id: 'provinsi_karhutla',
        name: 'Provinsi Prioritas Terdampak Karhutla',
        unit: 'provinsi',
        years: {
          2025: { target: '6', capaian: '6', percent: '100%', statusType: 'success' },
          2026: { target: '6', capaian: '6', percent: '100%', statusType: 'success' },
          2027: { target: '6', capaian: '—' },
          2028: { target: '6', capaian: '—' },
          2029: { target: '6', capaian: '—' },
        },
      },
      {
        id: 'luas_karhutla',
        name: 'Luas Karhutla yang sudah dipadamkan',
        unit: 'Ha',
        years: {
          2025: { target: '150.000', capaian: '148.200', percent: '98,8%', statusType: 'success' },
          2026: { target: '130.097', capaian: '129.434', percent: '99,5%', statusType: 'success' },
          2027: { target: '120.000', capaian: '—' },
          2028: { target: '100.000', capaian: '—' },
          2029: { target: '80.000', capaian: '—' },
        },
      },
      {
        id: 'kerugian_bencana',
        name: 'Kerugian bencana',
        unit: '% PDB',
        years: {
          2025: { target: '≤ 0,137%', capaian: '0,137%', percent: '100%', statusType: 'success' },
          2026: { target: '≤ 0,136%', capaian: '0,136%', percent: '100%', statusType: 'success' },
          2027: { target: '≤ 0,135%', capaian: '—' },
          2028: { target: '≤ 0,134%', capaian: '—' },
          2029: { target: '≤ 0,134%', capaian: '—' },
        },
      },
      {
        id: 'rehabilitasi_sumatera',
        mapIndicatorId: 'rehabilitasi_sumatera',
        name: 'Rehabilitasi dan Rekonstruksi Sumatera',
        unit: 'unit',
        years: {
          2025: { target: '7.200', capaian: '3.350', percent: '46,5%', statusType: 'warning' },
          2026: { target: '60.045', capaian: '21.974', percent: '36,6%', statusType: 'warning' },
          2027: { target: '77.500', capaian: '—' },
          2028: { target: '85.000', capaian: '—' },
          2029: { target: '90.000', capaian: '—' },
        },
      },
      {
        id: 'destana',
        mapIndicatorId: 'infrastruktur_bencana',
        name: 'Desa Tangguh Bencana (Destana)',
        unit: 'desa',
        years: {
          2025: { target: '1.200', capaian: '1.150', percent: '95,8%', statusType: 'success' },
          2026: { target: '3.500', capaian: '2.410', percent: '68,9%', statusType: 'warning' },
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
        id: 'tingkat_kemiskinan',
        mapIndicatorId: 'tingkat_kemiskinan_pilar',
        name: 'Tingkat kemiskinan',
        unit: '% penduduk',
        years: {
          2025: { target: '8,5%', capaian: '8,25%', percent: '97%', statusType: 'success' },
          2026: { target: '6,5–7,5%', capaian: '8,07%', percent: '91%', statusType: 'warning' },
          2027: { target: '6,2%', capaian: '—' },
          2028: { target: '5,5%', capaian: '—' },
          2029: { target: '5,0%', capaian: '—' },
        },
      },
      {
        id: 'kemiskinan_ekstrem',
        mapIndicatorId: 'kemiskinan_ekstrem_pilar',
        name: 'Kemiskinan ekstrem',
        unit: '% penduduk',
        years: {
          2025: { target: '1,2%', capaian: '0,78%', percent: '85%', statusType: 'success' },
          2026: { target: '0–0,5%', capaian: '0,45%', percent: '90%', statusType: 'success' },
          2027: { target: '0,0%', capaian: '—' },
          2028: { target: '0,0%', capaian: '—' },
          2029: { target: '0,0%', capaian: '—' },
        },
      },
      {
        id: 'bantuan_permakanan_lansia',
        name: 'Bantuan permakanan lansia',
        unit: 'orang penerima',
        years: {
          2025: { target: '116.754', capaian: '116.754', percent: '100%', statusType: 'success' },
          2026: { target: 'Terhenti', capaian: 'Terhenti', percent: '0%', statusType: 'alert' },
          2027: { target: '≥116.754', capaian: '—' },
          2028: { target: '150.000', capaian: '—' },
          2029: { target: '175.000', capaian: '—' },
        },
      },
      {
        id: 'bantuan_permakanan_disabilitas',
        name: 'Bantuan permakanan disabilitas',
        unit: 'orang penerima',
        years: {
          2025: { target: '36.000', capaian: '36.000', percent: '100%', statusType: 'success' },
          2026: { target: 'Terhenti', capaian: 'Terhenti', percent: '0%', statusType: 'alert' },
          2027: { target: '≥36.000', capaian: '—' },
          2028: { target: '50.000', capaian: '—' },
          2029: { target: '60.000', capaian: '—' },
        },
      },
      {
        id: 'cakupan_lansia_desil',
        name: 'Cakupan lansia desil 1–5',
        unit: '% sasaran',
        years: {
          2025: { target: '0,70%', capaian: '0,66%', percent: '94,3%', statusType: 'success' },
          2026: { target: 'Belum Tersedia', capaian: '—' },
          2027: { target: '0,85%', capaian: '—' },
          2028: { target: '0,95%', capaian: '—' },
          2029: { target: '1,00%', capaian: '—' },
        },
      },
      {
        id: 'cakupan_disabilitas_desil',
        name: 'Cakupan disabilitas desil 1–5',
        unit: '% sasaran',
        years: {
          2025: { target: '0,50%', capaian: '0,41%', percent: '82%', statusType: 'success' },
          2026: { target: 'Belum Tersedia', capaian: '—' },
          2027: { target: '0,65%', capaian: '—' },
          2028: { target: '0,80%', capaian: '—' },
          2029: { target: '0,90%', capaian: '—' },
        },
      },
      {
        id: 'bos_reguler',
        name: 'Bantuan Operasional Sekolah Reguler',
        unit: 'sekolah penerima',
        years: {
          2025: { target: '430.000', capaian: '430.000', percent: '100%', statusType: 'success' },
          2026: { target: '432.716', capaian: '432.654', percent: '99,9%', statusType: 'success' },
          2027: { target: '435.000', capaian: '—' },
          2028: { target: '438.000', capaian: '—' },
          2029: { target: '440.000', capaian: '—' },
        },
      },
      {
        id: 'bop_pendidikan',
        name: 'Bantuan Operasional Pendidikan',
        unit: 'lembaga penerima',
        years: {
          2025: { target: '390.000', capaian: '390.000', percent: '100%', statusType: 'success' },
          2026: { target: '406.741', capaian: '396.618', percent: '97,5%', statusType: 'success' },
          2027: { target: '415.000', capaian: '—' },
          2028: { target: '420.000', capaian: '—' },
          2029: { target: '425.000', capaian: '—' },
        },
      },
      {
        id: 'bos_madrasah',
        name: 'Bantuan Operasional Madrasah',
        unit: 'madrasah penerima',
        years: {
          2025: { target: '85.000', capaian: '85.000', percent: '100%', statusType: 'success' },
          2026: { target: '88.500', capaian: '87.200', percent: '98,5%', statusType: 'success' },
          2027: { target: '90.000', capaian: '—' },
          2028: { target: '92.000', capaian: '—' },
          2029: { target: '95.000', capaian: '—' },
        },
      },
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
        id: 'pemberdayaan',
        mapIndicatorId: 'tingkat_kemiskinan_pilar',
        name: 'Pemberdayaan Ekonomi Keluarga Rentan',
        unit: 'KPM',
        years: {
          2025: { target: '500.000', capaian: '485.000', percent: '97%', statusType: 'success' },
          2026: { target: '1.800.000', capaian: '1.120.000', percent: '62,2%', statusType: 'warning' },
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

/**
 * Helper to find annual indicator metrics for a specific program ID or name
 */
export function getIndicatorAnnualRow(
  indicatorId: string,
  pillarId?: 'pendidikan' | 'kesehatan' | 'bencana' | 'kemiskinan' | string
): AgregatIndicatorRow | null {
  // Normalize ID
  const cleanId = indicatorId.toLowerCase().trim();

  // Search in specific pillar if provided
  if (pillarId && pillarId !== 'all') {
    const pData = PILLAR_AGREGAT_DATA[pillarId as Exclude<MapPillarId, 'all'>];
    if (pData) {
      // 1. Direct ID match
      const direct = pData.indicators.find(
        (ind) => ind.id.toLowerCase() === cleanId || ind.mapIndicatorId?.toLowerCase() === cleanId
      );
      if (direct) return direct;

      // 2. Substring or fuzzy matching
      const fuzzy = pData.indicators.find(
        (ind) =>
          cleanId.includes(ind.id.toLowerCase()) ||
          ind.id.toLowerCase().includes(cleanId) ||
          cleanId.includes(ind.name.toLowerCase()) ||
          ind.name.toLowerCase().includes(cleanId)
      );
      if (fuzzy) return fuzzy;
    }
  }

  // Search across all pillars if not found
  for (const pKey of Object.keys(PILLAR_AGREGAT_DATA) as Array<Exclude<MapPillarId, 'all'>>) {
    const pData = PILLAR_AGREGAT_DATA[pKey];
    const match = pData.indicators.find(
      (ind) =>
        ind.id.toLowerCase() === cleanId ||
        ind.mapIndicatorId?.toLowerCase() === cleanId ||
        cleanId.includes(ind.id.toLowerCase()) ||
        ind.id.toLowerCase().includes(cleanId)
    );
    if (match) return match;
  }

  return null;
}

