import { WilayahData, getWilayahCapaianRpjmn } from '@/data/wilayahData';

export type MapPillarId = 'all' | 'pendidikan' | 'kesehatan' | 'bencana' | 'kemiskinan';

export interface MapIndicatorValue {
  num: number;
  display: string;
  label: string;
  subtext?: string;
  statusLabel?: string;
  statusType?: 'success' | 'warning' | 'alert' | 'normal';
}

export interface MapIndicatorDef {
  id: string;
  pillarId: MapPillarId;
  name: string;
  shortName: string;
  unit: string;
  nationalValue: string;
  target2026: string;
  description: string;
  minVal: number;
  maxVal: number;
  isLowerBetter?: boolean;
  colorScheme: 'blue' | 'green' | 'brown' | 'red' | 'burgundy' | 'emerald' | 'amber' | 'rose';
  isNationalOnly?: boolean;
  customRegionType?: 'sugt' | 'sugb' | 'sug_all' | 'sumatera_rehab';
  getValue: (w: WilayahData) => MapIndicatorValue;
}

export interface SugLocation {
  provinceId: string;
  kodeBps: string;
  provinceName: string;
  type: 'SUGT' | 'SUGB';
  count: number;
  lat: number;
  lng: number;
}

/**
 * Data sebaran lokasi SUGT dan SUGB tahun 2025–2026 (Sesuai Peta Resmi Diktisaintek)
 * - SUGT: 15 Provinsi, 42 Unit (Warna Merah Marun)
 * - SUGB: 4 Provinsi, 4 Unit (Warna Biru Tua)
 */
export const SUG_LOCATIONS: SugLocation[] = [
  // SUGT (15 Provinsi)
  { provinceId: 'aceh', kodeBps: '11', provinceName: 'Aceh', type: 'SUGT', count: 3, lat: 4.6951, lng: 96.7494 },
  { provinceId: 'sumatera-utara', kodeBps: '12', provinceName: 'Sumatera Utara', type: 'SUGT', count: 1, lat: 2.1154, lng: 99.5451 },
  { provinceId: 'sumatera-selatan', kodeBps: '16', provinceName: 'Sumatera Selatan', type: 'SUGT', count: 2, lat: -3.3194, lng: 104.9147 },
  { provinceId: 'dki-jakarta', kodeBps: '31', provinceName: 'DKI Jakarta', type: 'SUGT', count: 6, lat: -6.2088, lng: 106.8456 },
  { provinceId: 'banten', kodeBps: '36', provinceName: 'Banten', type: 'SUGT', count: 4, lat: -6.4058, lng: 106.064 },
  { provinceId: 'jawa-barat', kodeBps: '32', provinceName: 'Jawa Barat', type: 'SUGT', count: 7, lat: -6.9175, lng: 107.6191 },
  { provinceId: 'jawa-tengah', kodeBps: '33', provinceName: 'Jawa Tengah', type: 'SUGT', count: 6, lat: -7.1509, lng: 110.1402 },
  { provinceId: 'di-yogyakarta', kodeBps: '34', provinceName: 'DI Yogyakarta', type: 'SUGT', count: 3, lat: -7.8753, lng: 110.4262 },
  { provinceId: 'jawa-timur', kodeBps: '35', provinceName: 'Jawa Timur', type: 'SUGT', count: 2, lat: -7.536, lng: 112.2384 },
  { provinceId: 'kalimantan-selatan', kodeBps: '63', provinceName: 'Kalimantan Selatan', type: 'SUGT', count: 1, lat: -2.9935, lng: 115.34 },
  { provinceId: 'kalimantan-timur', kodeBps: '64', provinceName: 'Kalimantan Timur', type: 'SUGT', count: 2, lat: 0.5387, lng: 116.4194 },
  { provinceId: 'gorontalo', kodeBps: '75', provinceName: 'Gorontalo', type: 'SUGT', count: 1, lat: 0.6999, lng: 122.4467 },
  { provinceId: 'sulawesi-selatan', kodeBps: '73', provinceName: 'Sulawesi Selatan', type: 'SUGT', count: 2, lat: -4.1449, lng: 120.1242 },
  { provinceId: 'maluku', kodeBps: '81', provinceName: 'Maluku', type: 'SUGT', count: 1, lat: -3.2385, lng: 130.1453 },
  { provinceId: 'papua-barat', kodeBps: '92', provinceName: 'Papua Barat Daya', type: 'SUGT', count: 1, lat: -1.3361, lng: 133.1747 },

  // SUGB (4 Provinsi)
  { provinceId: 'kepulauan-bangka-belitung', kodeBps: '19', provinceName: 'Kepulauan Bangka Belitung', type: 'SUGB', count: 1, lat: -2.741, lng: 106.4406 },
  { provinceId: 'kalimantan-utara', kodeBps: '65', provinceName: 'Kalimantan Utara', type: 'SUGB', count: 1, lat: 3.0731, lng: 116.0414 },
  { provinceId: 'sulawesi-tenggara', kodeBps: '74', provinceName: 'Sulawesi Tenggara', type: 'SUGB', count: 1, lat: -4.1, lng: 122.2 },
  { provinceId: 'nusa-tenggara-timur', kodeBps: '53', provinceName: 'Nusa Tenggara Timur', type: 'SUGB', count: 1, lat: -8.6573, lng: 121.0793 },
];

export const SUMATERA_REHAB_PROVINCES = ['aceh', 'sumatera-utara', 'sumatera-barat'];
export const SUMATERA_REHAB_KODE_BPS = ['11', '12', '13'];

export interface PillarOption {
  id: MapPillarId;
  name: string;
  shortName: string;
  badge: string;
  iconName: 'all' | 'pendidikan' | 'kesehatan' | 'bencana' | 'kemiskinan';
}

export const MAP_PILLARS: PillarOption[] = [
  {
    id: 'pendidikan',
    name: 'Pilar Pendidikan',
    shortName: 'Pendidikan',
    badge: 'Pilar 1',
    iconName: 'pendidikan',
  },
  {
    id: 'kesehatan',
    name: 'Pilar Kesehatan',
    shortName: 'Kesehatan',
    badge: 'Pilar 2',
    iconName: 'kesehatan',
  },
  {
    id: 'bencana',
    name: 'Bencana',
    shortName: 'Bencana',
    badge: 'Pilar 3',
    iconName: 'bencana',
  },
  {
    id: 'kemiskinan',
    name: 'Penurunan Kemiskinan',
    shortName: 'Penurunan Kemiskinan',
    badge: 'Pilar 4',
    iconName: 'kemiskinan',
  },
];

function parseNumeric(valStr?: string, defaultVal = 0): number {
  if (!valStr) return defaultVal;
  const clean = valStr.replace('%', '').replace(/\./g, '').replace(',', '.').trim();
  const num = parseFloat(clean);
  return isNaN(num) ? defaultVal : num;
}

function parsePercent(valStr?: string, defaultVal = 70): number {
  if (!valStr) return defaultVal;
  const match = valStr.match(/(\d+([.,]\d+)?)\s*%/);
  if (match) {
    const num = parseFloat(match[1].replace(',', '.'));
    return isNaN(num) ? defaultVal : num;
  }
  const clean = valStr.replace(/\./g, '').replace(',', '.').trim();
  const num = parseFloat(clean);
  return isNaN(num) ? defaultVal : num;
}

export const MAP_INDICATORS: MapIndicatorDef[] = [
  // ==========================================================
  // 0. SEMUA PILAR (OVERVIEW RPJMN)
  // ==========================================================
  {
    id: 'capaian_rpjmn',
    pillarId: 'all',
    name: 'Capaian Sasaran RPJMN 2025–2029',
    shortName: 'Capaian RPJMN',
    unit: '%',
    nationalValue: '76,4%',
    target2026: '80,0%',
    description: 'Progres rata-rata konvergensi sasaran indikator RPJMN dan pengawalan 4 pilar prioritas.',
    minVal: 62.0,
    maxVal: 88.0,
    colorScheme: 'blue',
    getValue: (w) => {
      const capaianStr = getWilayahCapaianRpjmn(w);
      const num = parsePercent(capaianStr, 76.4);
      return {
        num,
        display: capaianStr,
        label: 'Capaian RPJMN',
        subtext: `Target: 80,0% · IMM: ${w.imm}`,
        statusLabel: num >= 80 ? 'Optimal (Target Tercapai)' : num >= 74 ? 'Progresif' : 'Perlu Akselerasi',
        statusType: num >= 80 ? 'success' : num >= 74 ? 'normal' : 'warning',
      };
    },
  },
  {
    id: 'imm_makro',
    pillarId: 'all',
    name: 'Indeks Modal Manusia (IMM)',
    shortName: 'Indeks IMM',
    unit: 'Indeks',
    nationalValue: '0,56',
    target2026: '0,57',
    description: 'Indikator makro kualitas SDM komprehensif mengukur kesehatan, pendidikan, dan kelangsungan hidup.',
    minVal: 0.46,
    maxVal: 0.68,
    colorScheme: 'blue',
    getValue: (w) => {
      const num = parseFloat(w.imm.replace(',', '.')) || 0.56;
      return {
        num,
        display: w.imm,
        label: 'Nilai IMM',
        subtext: 'Target 2026: 0,57 · Target 2029: 0,59',
        statusLabel: num >= 0.58 ? 'Tinggi' : num >= 0.53 ? 'Sedang' : 'Prioritas Akselerasi',
        statusType: num >= 0.57 ? 'success' : num >= 0.53 ? 'normal' : 'warning',
      };
    },
  },
  {
    id: 'kemiskinan_makro',
    pillarId: 'all',
    name: 'Tingkat Kemiskinan Terpadu',
    shortName: 'Kemiskinan',
    unit: '%',
    nationalValue: '8,07%',
    target2026: '6,5–7,5%',
    description: 'Persentase penduduk di bawah garis kemiskinan rilis BPS dengan pemantauan kantong kemiskinan.',
    minVal: 4.0,
    maxVal: 22.0,
    isLowerBetter: true,
    colorScheme: 'red',
    getValue: (w) => {
      const num = parsePercent(w.tingkatKemiskinan, 8.07);
      return {
        num,
        display: w.tingkatKemiskinan,
        label: 'Tingkat Kemiskinan',
        subtext: `Kemiskinan Ekstrem: ${w.kemiskinanEkstrem}`,
        statusLabel: num <= 7.5 ? 'Di Bawah Target Makro' : num <= 11.0 ? 'Perlu Pengawalan' : 'Kantong Kemiskinan',
        statusType: num <= 7.5 ? 'success' : num <= 11.0 ? 'warning' : 'alert',
      };
    },
  },

  // ==========================================================
  // 1. PILAR PENDIDIKAN (SESUAI TARGET & SATUAN RESMI PKPN / IKHTISAR)
  // ==========================================================
  {
    id: 'revitalisasi_satdik',
    pillarId: 'pendidikan',
    name: 'Revitalisasi Satuan Pendidikan',
    shortName: 'Revitalisasi Satdik',
    unit: 'Satuan Pendidikan',
    nationalValue: '36.669 Satuan Pendidikan (45,7%)',
    target2026: '80.282 Satuan Pendidikan',
    description:
      'Program peningkatan kualitas dan kelayakan sarana-prasarana sekolah melalui rehabilitasi dan pembangunan fasilitas pendidikan untuk mendukung pemerataan akses dan mutu pembelajaran.',
    minVal: 30.0,
    maxVal: 85.0,
    colorScheme: 'blue',
    getValue: (w) => {
      const heroVal = w.pillarDetails?.pendidikan?.heroValue || '45,7%';
      const num = parsePercent(heroVal, 45.7);
      if (w.level === 'nasional') {
        return {
          num: 45.7,
          display: '36.669 Satuan Pendidikan (45,7%)',
          label: 'Realisasi Revitalisasi',
          subtext: 'Capaian 2026',
          statusLabel: 'On Track 2026',
          statusType: 'normal',
        };
      }
      const match = w.pillarDetails?.pendidikan?.metric1?.value?.match(/([0-9.,]+)\s*\/\s*([0-9.,]+)/);
      const satdikVal = match ? match[1] : Math.round((num / 100) * 80282).toLocaleString('id-ID');
      return {
        num,
        display: `${satdikVal} Satuan Pendidikan (${heroVal})`,
        label: 'Realisasi Revitalisasi',
        subtext: 'Target 2026: 80.282 Satuan Pendidikan',
        statusLabel: num >= 60 ? 'Realisasi Cepat' : num >= 45 ? 'On Track 2026' : 'Perlu Percepatan Pemda',
        statusType: num >= 60 ? 'success' : num >= 45 ? 'normal' : 'warning',
      };
    },
  },
  {
    id: 'snt_operasional',
    pillarId: 'pendidikan',
    name: 'Sekolah Nasional Terintegrasi (SNT)',
    shortName: 'SNT Terintegrasi',
    unit: 'Sekolah Operasional',
    nationalValue: '17 Sekolah Operasional (48,6%)',
    target2026: '35 SNT Operasional',
    description:
      'Program yang mengintegrasikan sekolah jenjang SMP dan SMA dalam satu ekosistem berkelanjutan, mulai dari pembelajaran, pengembangan guru, pembinaan karakter, hingga penjaminan mutu.',
    minVal: 35.0,
    maxVal: 85.0,
    colorScheme: 'blue',
    isNationalOnly: true,
    getValue: () => {
      return {
        num: 48.6,
        display: '17 Sekolah Operasional (48,6%)',
        label: 'Capaian Nasional SNT',
        subtext: 'Capaian 2026',
        statusLabel: 'Area Putih (Capaian Nasional)',
        statusType: 'normal',
      };
    },
  },
  {
    id: 'sug_baru',
    pillarId: 'pendidikan',
    name: 'Sekolah Unggul Garuda Baru',
    shortName: 'SUG Baru',
    unit: 'Satuan Pendidikan',
    nationalValue: '3 Satuan Pendidikan (75%)',
    target2026: '4 Satuan Pendidikan',
    description:
      'Pembangunan unit baru Sekolah Unggul Garuda berasrama dengan kurikulum sains & teknologi global di daerah prioritas.',
    minVal: 1,
    maxVal: 1,
    colorScheme: 'blue',
    customRegionType: 'sugb',
    getValue: (w) => {
      if (w.level === 'nasional') {
        return {
          num: 75,
          display: '3 Satuan Pendidikan (75%)',
          label: 'Capaian SUG Baru',
          subtext: 'Capaian 2026',
          statusLabel: '3 dari 4 Satdik',
          statusType: 'success',
        };
      }
      const sugbLoc = SUG_LOCATIONS.find(
        (l) => l.type === 'SUGB' && (l.provinceId === w.id || l.kodeBps === w.kodeBps)
      );
      if (sugbLoc) {
        return {
          num: sugbLoc.count,
          display: `${sugbLoc.count} Satuan Pendidikan`,
          label: 'Alokasi SUG Baru',
          subtext: 'Target 2026: 4 Satuan Pendidikan',
          statusLabel: `${sugbLoc.count} Satdik`,
          statusType: 'success',
        };
      }
      return {
        num: 0,
        display: '0 Satuan Pendidikan',
        label: 'SUG Baru',
        subtext: 'Target 2026: 4 Satuan Pendidikan',
        statusLabel: '0 Satdik',
        statusType: 'normal',
      };
    },
  },
  {
    id: 'sug_transformasi',
    pillarId: 'pendidikan',
    name: 'Sekolah Unggul Garuda Transformasi',
    shortName: 'SUG Transformasi',
    unit: 'Satuan Pendidikan',
    nationalValue: '42 Satuan Pendidikan',
    target2026: '30 Satuan Pendidikan',
    description:
      'Transformasi dan peningkatan mutu SMA unggulan eksisting menjadi Sekolah Unggul Garuda Transformasi dengan penguatan sains dan teknologi global.',
    minVal: 1,
    maxVal: 7,
    colorScheme: 'blue',
    customRegionType: 'sugt',
    getValue: (w) => {
      if (w.level === 'nasional') {
        return {
          num: 100,
          display: '42 Satuan Pendidikan',
          label: 'Alokasi SUG Transformasi',
          subtext: 'Capaian 2025 :12 Satuan Pendidikan; Capaian 2026: 30 Satuan Pendidikan',
          statusLabel: '42 Satuan Pendidikan',
          statusType: 'success',
        };
      }
      const sugtLoc = SUG_LOCATIONS.find(
        (l) => l.type === 'SUGT' && (l.provinceId === w.id || l.kodeBps === w.kodeBps)
      );
      if (sugtLoc) {
        return {
          num: sugtLoc.count,
          display: `${sugtLoc.count} Satuan Pendidikan`,
          label: 'Alokasi SUG Transformasi',
          subtext: 'Target 2026: 30 Satuan Pendidikan',
          statusLabel: `${sugtLoc.count} Satdik`,
          statusType: 'success',
        };
      }
      return {
        num: 0,
        display: '0 Satuan Pendidikan',
        label: 'SUG Transformasi',
        subtext: 'Target 2026: 30 Satuan Pendidikan',
        statusLabel: '0 Satdik',
        statusType: 'normal',
      };
    },
  },
  {
    id: 'ifp_digitalisasi',
    pillarId: 'pendidikan',
    name: 'Digitalisasi Pendidikan',
    shortName: 'Digitalisasi Pendidikan',
    unit: 'unit',
    nationalValue: '727.436 unit',
    target2026: '727.436 unit',
    description:
      'Program transformasi pembelajaran melalui penyediaan Interactive Flat Panel (IFP), konten pembelajaran digital, dan infrastruktur penunjang di satuan pendidikan.',
    minVal: 55.0,
    maxVal: 100.0,
    colorScheme: 'blue',
    isNationalOnly: true,
    getValue: () => {
      return {
        num: 100,
        display: '727.436 unit',
        label: 'Capaian Nasional Digitalisasi',
        subtext: 'Berproses disalurkan ke 316.535 sekolah',
        statusLabel: 'Area Putih (Capaian Nasional)',
        statusType: 'normal',
      };
    },
  },
  {
    id: 'studio_guru',
    pillarId: 'pendidikan',
    name: 'Studio Guru',
    shortName: 'Studio Guru',
    unit: 'studio',
    nationalValue: '1 studio pusat + 110 konten',
    target2026: 'Studio Guru beroperasi penuh',
    description:
      'Program penyediaan pusat produksi dan penyebarluasan konten pembelajaran digital berkualitas dari guru untuk meningkatkan pemerataan mutu pembelajaran di Indonesia.',
    minVal: 40.0,
    maxVal: 100.0,
    colorScheme: 'blue',
    isNationalOnly: true,
    getValue: () => {
      return {
        num: 50,
        display: '1 studio pusat + 110 konten pembelajaran',
        label: 'Studio Guru',
        subtext: 'Launching 25 November 2026',
        statusLabel: 'Area Putih (Capaian Nasional)',
        statusType: 'normal',
      };
    },
  },

  // ==========================================================
  // 2. PILAR KESEHATAN (9 Indikator Sesuai Ikhtisar)
  // ==========================================================
  {
    id: 'ckg_kesehatan',
    pillarId: 'kesehatan',
    name: 'Cek Kesehatan Gratis',
    shortName: 'Cek Kesehatan Gratis',
    unit: 'juta jiwa',
    nationalValue: '105,98 Juta Jiwa (81,5%)',
    target2026: 'Target 2026: 130 Juta Jiwa',
    description:
      'Program pemeriksaan kesehatan gratis bagi seluruh masyarakat berdasarkan siklus hidup untuk mendeteksi dini penyakit dan faktor risiko kesehatan, serta mendorong pencegahan dan penanganan penyakit secara tepat waktu.',
    minVal: 45.0,
    maxVal: 95.0,
    colorScheme: 'green',
    getValue: (w) => {
      const heroVal = w.pillarDetails?.kesehatan?.heroValue || '81,5%';
      const num = parsePercent(heroVal, 81.5);
      const valStr = w.level === 'nasional' ? '105,98 Juta Jiwa (81,5%)' : `${heroVal}`;
      return {
        num,
        display: valStr,
        label: 'Cakupan Peserta CKG',
        subtext: 'Target 2026: 130 Juta Jiwa',
        statusLabel: num >= 80 ? 'Target Terlampaui' : 'Progresif',
        statusType: 'success',
      };
    },
  },
  {
    id: 'tb_penemuan',
    pillarId: 'kesehatan',
    name: 'Penemuan kasus TB',
    shortName: 'Penemuan kasus TB',
    unit: 'kasus',
    nationalValue: '663.455 kasus (68,3%)',
    target2026: 'Target 2026: 972.000',
    description:
      'Program percepatan eliminasi tuberkulosis melalui peningkatan deteksi dini, penemuan kasus secara aktif, pemeriksaan, pengobatan hingga tuntas, serta pencegahan penularan untuk menurunkan kasus tuberkulosis.',
    minVal: 38.0,
    maxVal: 88.0,
    colorScheme: 'green',
    getValue: (w) => {
      const num = 68.3;
      const display = w.level === 'nasional' ? '663.455 kasus (68,3%)' : 'Kasus TB Ternotifikasi';
      return {
        num,
        display,
        label: 'Notifikasi Kasus TB',
        subtext: 'Target 2026: 972.000',
        statusLabel: 'Pelacakan Berjalan',
        statusType: 'normal',
      };
    },
  },
  {
    id: 'rsud_spesialis',
    pillarId: 'kesehatan',
    name: 'Renovasi RSUD Tipe D ke C',
    shortName: 'Renovasi RSUD Tipe D ke C',
    unit: 'RSUD',
    nationalValue: 'Capaian 2025 :21 RSUD Capaian 2026: 18 RSUD proses konstruksi (90%)',
    target2026: 'Target 2026: 20 RSUD',
    description:
      'Program peningkatan kapasitas dan kualitas RSUD, terutama dari kelas D menjadi kelas C, melalui pembangunan dan peningkatan fasilitas, penyediaan alat kesehatan, serta penguatan tenaga medis.',
    minVal: 50.0,
    maxVal: 100.0,
    colorScheme: 'green',
    getValue: () => {
      return {
        num: 90,
        display: 'Capaian 2025 :21 RSUD; Capaian 2026: 18 RSUD proses konstruksi (90%)',
        label: 'Kesiapan RSUD',
        subtext: 'Target 2026: 20 RSUD · Target 2027: 66 RSUD',
        statusLabel: '18 dari 20 RSUD Konstruksi',
        statusType: 'success',
      };
    },
  },
  {
    id: 'stunting_prev',
    pillarId: 'kesehatan',
    name: 'Stunting',
    shortName: 'Stunting',
    unit: '%',
    nationalValue: '19,8% (Survei SKI 2024)',
    target2026: 'Target 14% pada 2029',
    description: 'Intervensi penurunan prevalensi stunting terintegrasi lintas kementerian.',
    minVal: 10.0,
    maxVal: 35.0,
    isLowerBetter: true,
    colorScheme: 'green',
    getValue: () => {
      return {
        num: 19.8,
        display: '19,8% (Survei SKI)',
        label: 'Prevalensi Stunting',
        subtext: 'Target 14% pada 2029',
        statusLabel: 'Survei Kesehatan Indonesia',
        statusType: 'normal',
      };
    },
  },
  {
    id: 'mbg_balita',
    pillarId: 'kesehatan',
    name: 'MBG balita non-PAUD',
    shortName: 'MBG balita',
    unit: 'juta jiwa',
    nationalValue: '4,89 juta jiwa (29,2% sasaran)',
    target2026: 'Target 2026: 16,7 juta jiwa',
    description: 'Pemberian makanan bergizi gratis untuk balita non-PAUD.',
    minVal: 20.0,
    maxVal: 80.0,
    colorScheme: 'green',
    getValue: () => {
      return {
        num: 29.2,
        display: '4,89 juta jiwa (29,2% dari sasaran)',
        label: 'Sasaran Balita',
        subtext: 'Target 2026: 16,7 juta jiwa',
        statusLabel: '29,2% Sasaran',
        statusType: 'normal',
      };
    },
  },
  {
    id: 'mbg_ibu_hamil',
    pillarId: 'kesehatan',
    name: 'MBG ibu hamil',
    shortName: 'MBG ibu hamil',
    unit: 'juta jiwa',
    nationalValue: '0,65 juta jiwa (26,3% sasaran)',
    target2026: 'Target 2026: 2,49 juta jiwa',
    description: 'Pemberian makanan bergizi gratis untuk ibu hamil.',
    minVal: 20.0,
    maxVal: 80.0,
    colorScheme: 'green',
    getValue: () => {
      return {
        num: 26.3,
        display: '0,65 juta jiwa (26,3% dari sasaran)',
        label: 'Sasaran Ibu Hamil',
        subtext: 'Target 2026: 2,49 juta jiwa',
        statusLabel: '26,3% Sasaran',
        statusType: 'normal',
      };
    },
  },
  {
    id: 'mbg_ibu_menyusui',
    pillarId: 'kesehatan',
    name: 'MBG ibu menyusui',
    shortName: 'MBG ibu menyusui',
    unit: 'juta jiwa',
    nationalValue: '1,77 juta jiwa (64,5% sasaran)',
    target2026: 'Target 2026: 2,75 juta jiwa',
    description: 'Pemberian makanan bergizi gratis untuk ibu menyusui.',
    minVal: 30.0,
    maxVal: 90.0,
    colorScheme: 'green',
    getValue: () => {
      return {
        num: 64.5,
        display: '1,77 juta jiwa (64,5% dari sasaran)',
        label: 'Sasaran Ibu Menyusui',
        subtext: 'Target 2026: 2,75 juta jiwa',
        statusLabel: '64,5% Sasaran',
        statusType: 'success',
      };
    },
  },
  {
    id: 'revitalisasi_puskesmas',
    pillarId: 'kesehatan',
    name: 'Revitalisasi Puskesmas',
    shortName: 'Revitalisasi Puskesmas',
    unit: 'puskesmas',
    nationalValue: 'Target 2027',
    target2026: 'Target 2027: 10.000 puskesmas',
    description: 'Standardisasi gedung, alat laboratorium, dan tenaga medis di 10.000 Puskesmas.',
    minVal: 0,
    maxVal: 10000,
    colorScheme: 'green',
    getValue: () => {
      return {
        num: 10000,
        display: 'Target 2027',
        label: 'Revitalisasi Puskesmas',
        subtext: 'Target 2027: 10.000 puskesmas',
        statusLabel: 'Perencanaan 2027',
        statusType: 'normal',
      };
    },
  },
  {
    id: 'revitalisasi_rs',
    pillarId: 'kesehatan',
    name: 'Revitalisasi RS',
    shortName: 'Revitalisasi RS',
    unit: 'RS',
    nationalValue: 'Target 2027-2028',
    target2026: 'Target 2027-2028: 450 RS',
    description: 'Peningkatan kapabilitas 450 RS rujukan regional penanganan layanan KJSU.',
    minVal: 0,
    maxVal: 450,
    colorScheme: 'green',
    getValue: () => {
      return {
        num: 450,
        display: 'Target 2027-2028',
        label: 'Revitalisasi RS Rujukan',
        subtext: 'Target 2027-2028: 450 RS',
        statusLabel: 'Perencanaan 2027–2028',
        statusType: 'normal',
      };
    },
  },

  // ==========================================================
  // 3. PILAR KETAHANAN BENCANA (6 Indikator Sesuai Ikhtisar)
  // ==========================================================
  {
    id: 'jumlah_kejadian_bencana',
    pillarId: 'bencana',
    name: 'Jumlah kejadian bencana',
    shortName: 'Jumlah kejadian bencana',
    unit: 'kejadian',
    nationalValue: '2.100 kejadian (s.d. Okt 2026)',
    target2026: '2025: 4.727 kejadian',
    description: 'Pemantauan kesiapsiagaan darurat bencana nasional.',
    minVal: 0,
    maxVal: 5000,
    colorScheme: 'brown',
    getValue: () => {
      return {
        num: 2100,
        display: '2.100 kejadian',
        label: 'Kejadian Bencana',
        subtext: '2025: 4.727 kejadian · Tercatat s.d. Okt 2026',
        statusLabel: 'Posisi s.d. Okt 2026',
        statusType: 'normal',
      };
    },
  },
  {
    id: 'huntara_sumatera',
    pillarId: 'bencana',
    name: 'Pembangunan Huntara Sumatera',
    shortName: 'Huntara Sumatera',
    unit: 'unit',
    nationalValue: '20.770 unit (99,8%)',
    target2026: 'Target 2026: 20.803',
    description: 'Penyediaan hunian sementara pengungsi pascabencana.',
    minVal: 0,
    maxVal: 21000,
    colorScheme: 'brown',
    customRegionType: 'sumatera_rehab',
    getValue: () => {
      return {
        num: 99.8,
        display: '20.770 unit (99,8%)',
        label: 'Kesiapan Huntara',
        subtext: 'Target 2026: 20.803 unit',
        statusLabel: 'Hampir Tuntas (99,8%)',
        statusType: 'success',
      };
    },
  },
  {
    id: 'huntap_sumatera',
    pillarId: 'bencana',
    name: 'Pembangunan Huntap Sumatera',
    shortName: 'Huntap Sumatera',
    unit: 'unit',
    nationalValue: '1.012 unit (2,3%)',
    target2026: 'Target 2026: 44.121',
    description: 'Pembangunan hunian tetap relokasi bencana di kawasan aman.',
    minVal: 0,
    maxVal: 45000,
    colorScheme: 'brown',
    customRegionType: 'sumatera_rehab',
    getValue: () => {
      return {
        num: 2.3,
        display: '1.012 unit (2,3%)',
        label: 'Realisasi Huntap',
        subtext: 'Target 2026: 44.121 unit',
        statusLabel: 'Dalam Percepatan Satgas',
        statusType: 'alert',
      };
    },
  },
  {
    id: 'provinsi_karhutla',
    pillarId: 'bencana',
    name: 'Provinsi Prioritas Terdampak Karhutla',
    shortName: 'Provinsi Karhutla',
    unit: 'Provinsi',
    nationalValue: '6 Provinsi',
    target2026: 'Fokus pengendalian & pencegahan terpadu',
    description: 'Wilayah prioritas kerawanan kebakaran hutan dan lahan.',
    minVal: 1,
    maxVal: 6,
    colorScheme: 'brown',
    getValue: () => {
      return {
        num: 6,
        display: '6 Provinsi',
        label: 'Provinsi Prioritas Karhutla',
        subtext: 'Data 13 Oktober 2026',
        statusLabel: 'Fokus Pengendalian Terpadu',
        statusType: 'warning',
      };
    },
  },
  {
    id: 'luas_karhutla',
    pillarId: 'bencana',
    name: 'Luas Karhutla yang sudah dipadamkan',
    shortName: 'Luas Pemadaman Karhutla',
    unit: 'Ha',
    nationalValue: '129.434,18 Ha (99,5%)',
    target2026: 'Jumlah Luas Karhutla: 130.097,79 Ha',
    description: 'Efektivitas satgas pemadaman karhutla tuntas 99,5%.',
    minVal: 0,
    maxVal: 135000,
    colorScheme: 'brown',
    getValue: () => {
      return {
        num: 99.5,
        display: '129.434,18 Ha (99,5%)',
        label: 'Luas Dipadamkan',
        subtext: 'Total: 130.097,79 Ha · Proses: 663,61 Ha',
        statusLabel: 'Tuntas 99,5%',
        statusType: 'success',
      };
    },
  },
  {
    id: 'kerugian_bencana',
    pillarId: 'bencana',
    name: 'Kerugian bencana',
    shortName: 'Kerugian bencana',
    unit: '% PDB',
    nationalValue: '— % PDB',
    target2026: 'Target 2026: 0,136',
    description: 'Monitoring dampak kerugian ekonomi terhadap Produk Domestik Bruto.',
    minVal: 0,
    maxVal: 1,
    isLowerBetter: true,
    colorScheme: 'brown',
    getValue: () => {
      return {
        num: 0.136,
        display: '— % PDB',
        label: 'Kerugian Ekonomi',
        subtext: 'Target 2026: 0,136 % PDB',
        statusLabel: 'Dalam Batas Aman',
        statusType: 'normal',
      };
    },
  },

  // ==========================================================
  // 4. PILAR PENURUNAN KEMISKINAN (9 Indikator Sesuai Ikhtisar)
  // ==========================================================
  {
    id: 'tingkat_kemiskinan',
    pillarId: 'kemiskinan',
    name: 'Tingkat kemiskinan',
    shortName: 'Tingkat kemiskinan',
    unit: '%',
    nationalValue: '8,07%',
    target2026: 'Target 2026: 6,5–7,5',
    description: 'Pemantauan laju penurunan kemiskinan nasional.',
    minVal: 4.0,
    maxVal: 22.0,
    isLowerBetter: true,
    colorScheme: 'red',
    getValue: (w) => {
      const val = w.tingkatKemiskinan || '8,07%';
      const num = parsePercent(val, 8.07);
      return {
        num,
        display: `${val} (% penduduk)`,
        label: 'Tingkat Kemiskinan',
        subtext: 'Target 2026: 6,5–7,5% · Capaian 2026',
        statusLabel: num <= 7.5 ? 'Sesuai Target' : 'Waspada Disparitas',
        statusType: num <= 7.5 ? 'success' : 'warning',
      };
    },
  },
  {
    id: 'kemiskinan_ekstrem',
    pillarId: 'kemiskinan',
    name: 'Kemiskinan ekstrem',
    shortName: 'Kemiskinan ekstrem',
    unit: '%',
    nationalValue: '0.78% (85%)',
    target2026: 'Target 2026: 0–0,5',
    description: 'Target penurunan kemiskinan ekstrem mendekati 0%.',
    minVal: 0.1,
    maxVal: 5.5,
    isLowerBetter: true,
    colorScheme: 'red',
    getValue: (w) => {
      const val = w.level === 'nasional' ? '0.78% (% penduduk)' : (w.kemiskinanEkstrem || '0,83%');
      return {
        num: 0.78,
        display: val,
        label: 'Kemiskinan Ekstrem',
        subtext: 'Target 2026: 0–0,5 · Capaian 2025',
        statusLabel: 'Menuju 0%',
        statusType: 'normal',
      };
    },
  },
  {
    id: 'bantuan_permakanan_lansia',
    pillarId: 'kemiskinan',
    name: 'Bantuan permakanan lansia',
    shortName: 'Permakanan lansia',
    unit: 'orang penerima',
    nationalValue: '116.754 orang penerima',
    target2026: 'Target 2027 ≥116.754 | 2026 terhenti',
    description: 'Dalam proses peralihan & sinkronisasi program ke BGN.',
    minVal: 0,
    maxVal: 150000,
    colorScheme: 'red',
    getValue: () => {
      return {
        num: 116754,
        display: '116.754 orang penerima',
        label: 'Penerima Lansia',
        subtext: 'Target 2027 ≥116.754 | 2026 terhenti · Capaian 2025',
        statusLabel: 'Proses Sinkronisasi BGN',
        statusType: 'warning',
      };
    },
  },
  {
    id: 'bantuan_permakanan_disabilitas',
    pillarId: 'kemiskinan',
    name: 'Bantuan permakanan disabilitas',
    shortName: 'Permakanan disabilitas',
    unit: 'orang penerima',
    nationalValue: '36.000 orang penerima',
    target2026: 'Target 2027 ≥36.000 | 2026 terhenti',
    description: 'Dalam proses peralihan & sinkronisasi program ke BGN.',
    minVal: 0,
    maxVal: 50000,
    colorScheme: 'red',
    getValue: () => {
      return {
        num: 36000,
        display: '36.000 orang penerima',
        label: 'Penerima Disabilitas',
        subtext: 'Target 2027 ≥36.000 | 2026 terhenti · Capaian 2025',
        statusLabel: 'Proses Sinkronisasi BGN',
        statusType: 'warning',
      };
    },
  },
  {
    id: 'cakupan_lansia_desil',
    pillarId: 'kemiskinan',
    name: 'Cakupan lansia desil 1–5',
    shortName: 'Lansia desil 1–5',
    unit: '% sasaran',
    nationalValue: '0,66% sasaran',
    target2026: '2026 belum tersedia',
    description: 'Perlindungan sosial & jaminan kesejahteraan lanjut usia.',
    minVal: 0,
    maxVal: 2,
    colorScheme: 'red',
    getValue: () => {
      return {
        num: 0.66,
        display: '0,66% sasaran',
        label: 'Cakupan Lansia',
        subtext: '2026 belum tersedia · Capaian 2025',
        statusLabel: 'Capaian 2025',
        statusType: 'normal',
      };
    },
  },
  {
    id: 'cakupan_disabilitas_desil',
    pillarId: 'kemiskinan',
    name: 'Cakupan disabilitas desil 1–5',
    shortName: 'Disabilitas desil 1–5',
    unit: '% sasaran',
    nationalValue: '0,41% sasaran',
    target2026: '2026 belum tersedia',
    description: 'Perlindungan sosial & pemenuhan hak penyandang disabilitas.',
    minVal: 0,
    maxVal: 2,
    colorScheme: 'red',
    getValue: () => {
      return {
        num: 0.41,
        display: '0,41% sasaran',
        label: 'Cakupan Disabilitas',
        subtext: '2026 belum tersedia · Capaian 2025',
        statusLabel: 'Capaian 2025',
        statusType: 'normal',
      };
    },
  },
  {
    id: 'bos_reguler',
    pillarId: 'kemiskinan',
    name: 'Bantuan Operasional Sekolah Reguler',
    shortName: 'BOS Reguler',
    unit: 'sekolah penerima',
    nationalValue: '432.654 (99%)',
    target2026: 'Target 2026: 432.716',
    description: 'Penyaluran dana BOS reguler sekolah dasar & menengah.',
    minVal: 0,
    maxVal: 450000,
    colorScheme: 'red',
    getValue: () => {
      return {
        num: 99.9,
        display: '432.654 (99%) sekolah',
        label: 'Sekolah Penerima BOS',
        subtext: 'Target 2026: 432.716 · Capaian 2026 (99,9%)',
        statusLabel: 'Tersalurkan 99,9%',
        statusType: 'success',
      };
    },
  },
  {
    id: 'bop_pendidikan',
    pillarId: 'kemiskinan',
    name: 'Bantuan Operasional Pendidikan',
    shortName: 'BOP Pendidikan',
    unit: 'Lembaga Penerima',
    nationalValue: '396.618 lembaga (97,5%)',
    target2026: 'Target 2026: 406.741',
    description: 'Dukungan operasional PAUD & pendidikan non-formal.',
    minVal: 0,
    maxVal: 420000,
    colorScheme: 'red',
    getValue: () => {
      return {
        num: 97.5,
        display: '396.618 lembaga (97,5%)',
        label: 'Lembaga Penerima BOP',
        subtext: 'Target 2026: 406.741 · Capaian 2026 (97,5%)',
        statusLabel: 'Tersalurkan 97,5%',
        statusType: 'success',
      };
    },
  },
  {
    id: 'bos_madrasah',
    pillarId: 'kemiskinan',
    name: 'Bantuan Operasional Sekolah Madrasah',
    shortName: 'BOS Madrasah',
    unit: 'juta penerima',
    nationalValue: '10.36 juta penerima (100%)',
    target2026: 'Target 2026: 10,36 juta',
    description: 'Penyaluran BOS madrasah di lingkungan Kementerian Agama.',
    minVal: 0,
    maxVal: 15,
    colorScheme: 'red',
    getValue: () => {
      return {
        num: 100,
        display: '10.36 juta penerima (100%)',
        label: 'Penerima BOS Madrasah',
        subtext: 'Target 2026 · Capaian 2026 (100%)',
        statusLabel: 'Tersalurkan 100%',
        statusType: 'success',
      };
    },
  },
];

export function getIndicatorsByPillar(pillarId: MapPillarId): MapIndicatorDef[] {
  return MAP_INDICATORS.filter((ind) => ind.pillarId === pillarId);
}

const ID_ALIASES: Record<string, string> = {
  // Kesehatan aliases
  tb: 'tb_penemuan',
  tb_penuntasan: 'tb_penemuan',
  ckg: 'ckg_kesehatan',
  rsud: 'rsud_spesialis',
  rsud_kesiapan: 'rsud_spesialis',
  mbg_kesehatan: 'mbg_3b',
  mbg_balita: 'mbg_3b',
  mbg_ibu_hamil: 'mbg_3b',
  mbg_ibu_menyusui: 'mbg_3b',
  stunting: 'stunting_prev',
  // Bencana aliases
  rehabilitasi_rekonstruksi_sumatera: 'rehabilitasi_sumatera',
  huntap: 'huntap_bencana',
  huntara: 'huntara_bencana',
  infrastruktur: 'infrastruktur_bencana',
  destana_mandiri: 'infrastruktur_bencana',
  ews_bencana: 'mitigasi_bencana',
  // Kemiskinan aliases
  kemiskinan: 'tingkat_kemiskinan_pilar',
  kemiskinan_ekstrem: 'kemiskinan_ekstrem_pilar',
  dtsen_kemiskinan: 'dtsen_desil_pilar',
  bansos_kemiskinan: 'graduasi_bansos_pilar',
  pemberdayaan_rentan: 'tingkat_kemiskinan_pilar',
  // Pendidikan aliases
  revitalisasi_sarpras: 'revitalisasi_satdik',
  digitalisasi_pembelajaran: 'ifp_digitalisasi',
  digitalisasi_pendidikan: 'ifp_digitalisasi',
  sekolah_unggul_garuda: 'sug_transformasi',
  sug: 'sug_transformasi',
  sug_semua: 'sug_transformasi',
};

export function getDefaultIndicatorForPillar(pillarId: MapPillarId): MapIndicatorDef {
  const targetId = pillarId === 'all' ? 'pendidikan' : pillarId;
  const list = getIndicatorsByPillar(targetId);
  return list[0] || MAP_INDICATORS.find((ind) => ind.pillarId === targetId) || MAP_INDICATORS[0];
}

export function getIndicatorById(
  indicatorId?: string | null,
  fallbackPillar?: MapPillarId | null
): MapIndicatorDef {
  if (indicatorId) {
    const resolvedId = ID_ALIASES[indicatorId] || indicatorId;
    const found = MAP_INDICATORS.find((ind) => ind.id === resolvedId);
    if (found) return found;
  }
  if (fallbackPillar && fallbackPillar !== 'all') {
    return getDefaultIndicatorForPillar(fallbackPillar);
  }
  return MAP_INDICATORS.find((ind) => ind.pillarId === 'pendidikan') || MAP_INDICATORS[0];
}

/**
 * Color ramp palettes strictly standardized by Pillar:
 * 1. Pilar Pendidikan: Warna Biru (Blue)
 * 2. Pilar Kesehatan: Warna Hijau (Green)
 * 3. Pilar Ketahanan Bencana: Warna Coklat (Brown)
 * 4. Pilar Penurunan Kemiskinan: Warna Merah (Red)
 */
export const COLOR_SCHEMES: Record<
  'blue' | 'green' | 'brown' | 'red' | 'burgundy' | 'emerald' | 'amber' | 'rose',
  string[]
> = {
  // Pilar Pendidikan: Biru (Soft Blue to Royal/Navy Blue)
  blue: ['#eff6ff', '#dbeafe', '#93c5fd', '#3b82f6', '#1d4ed8', '#1e3a8a'],
  // Pilar Kesehatan: Hijau (Light Mint Green to Deep Forest Green)
  green: ['#f0fdf4', '#dcfce7', '#86efac', '#22c55e', '#15803d', '#14532d'],
  // Pilar Ketahanan Bencana: Coklat (Warm Sand/Cream to Deep Rich Earthy Brown)
  brown: ['#fcf8f4', '#f5e9de', '#d8bba0', '#a8754b', '#7a4b27', '#4a2810'],
  // Pilar Penurunan Kemiskinan: Merah (Soft Coral/Pink-Red to Deep Crimson Red)
  red: ['#fef2f2', '#fee2e2', '#fca5a5', '#ef4444', '#b91c1c', '#7f1d1d'],

  // Backwards compatibility aliases
  burgundy: ['#eff6ff', '#dbeafe', '#93c5fd', '#3b82f6', '#1d4ed8', '#1e3a8a'],
  emerald: ['#f0fdf4', '#dcfce7', '#86efac', '#22c55e', '#15803d', '#14532d'],
  amber: ['#fcf8f4', '#f5e9de', '#d8bba0', '#a8754b', '#7a4b27', '#4a2810'],
  rose: ['#fef2f2', '#fee2e2', '#fca5a5', '#ef4444', '#b91c1c', '#7f1d1d'],
};

export function getPaletteForIndicator(
  indicator: MapIndicatorDef,
  overridePillar?: MapPillarId | null
): string[] {
  // If an active pillar context is provided, enforce that pillar's color;
  // otherwise strictly use the indicator's own pillarId.
  const activePillar =
    overridePillar && overridePillar !== 'all' ? overridePillar : indicator.pillarId;

  switch (activePillar) {
    case 'pendidikan':
      return COLOR_SCHEMES.blue;
    case 'kesehatan':
      return COLOR_SCHEMES.green;
    case 'bencana':
      return COLOR_SCHEMES.brown;
    case 'kemiskinan':
      return COLOR_SCHEMES.red;
    default:
      return COLOR_SCHEMES[indicator.colorScheme] || COLOR_SCHEMES.blue;
  }
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export function getIndicatorChoroplethColor(
  indicator: MapIndicatorDef,
  value: number,
  overridePillar?: MapPillarId | null
): string {
  const palette = getPaletteForIndicator(indicator, overridePillar);
  const { minVal, maxVal, isLowerBetter } = indicator;

  const clamped = Math.max(minVal, Math.min(maxVal, value));
  let ratio = (clamped - minVal) / (maxVal - minVal || 1);

  if (isLowerBetter) {
    // Lower is better, so lower gets the calm/positive end or invert
    ratio = 1 - ratio;
  }

  // Multi-stop interpolation across palette
  const numSegments = palette.length - 1;
  const position = ratio * numSegments;
  const index = Math.min(Math.floor(position), numSegments - 1);
  const factor = position - index;

  const rgb1 = hexToRgb(palette[index]);
  const rgb2 = hexToRgb(palette[index + 1]);

  const r = Math.round(rgb1[0] + factor * (rgb2[0] - rgb1[0]));
  const g = Math.round(rgb1[1] + factor * (rgb2[1] - rgb1[1]));
  const b = Math.round(rgb1[2] + factor * (rgb2[2] - rgb1[2]));

  return rgbToHex(r, g, b);
}

export function getIndicatorLegendStops(
  indicator: MapIndicatorDef,
  overridePillar?: MapPillarId | null
): { minColor: string; midColor: string; maxColor: string } {
  const palette = getPaletteForIndicator(indicator, overridePillar);
  return {
    minColor: palette[1],
    midColor: palette[3],
    maxColor: palette[palette.length - 1],
  };
}
