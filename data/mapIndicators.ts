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
    name: 'Ketahanan Bencana',
    shortName: 'Ketahanan Bencana',
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
  // 1. PILAR PENDIDIKAN (SESUAI TARGET & SATUAN RESMI PKPN)
  // ==========================================================
  {
    id: 'revitalisasi_satdik',
    pillarId: 'pendidikan',
    name: 'Revitalisasi Sarana dan Prasarana Sekolah/Madrasah',
    shortName: 'Revitalisasi Sarpras',
    unit: 'satdik',
    nationalValue: '36.669 satdik (45,7%)',
    target2026: '80.282 satdik',
    description:
      'Program peningkatan kualitas dan kelayakan sarana-prasarana sekolah melalui rehabilitasi dan pembangunan fasilitas pendidikan untuk mendukung pemerataan akses dan mutu pembelajaran.',
    minVal: 30.0,
    maxVal: 85.0,
    colorScheme: 'blue',
    getValue: (w) => {
      const heroVal = w.pillarDetails?.pendidikan?.heroValue || '45,7%';
      const num = parsePercent(heroVal, 45.7);
      const satdikVal = Math.round((num / 100) * 80282);
      return {
        num,
        display: `${satdikVal.toLocaleString('id-ID')} satdik (${heroVal})`,
        label: 'Realisasi Revitalisasi',
        subtext: 'Target 2026: 80.282 satdik',
        statusLabel: num >= 60 ? 'Realisasi Cepat' : num >= 45 ? 'On Track 2026' : 'Perlu Percepatan Pemda',
        statusType: num >= 60 ? 'success' : num >= 45 ? 'normal' : 'warning',
      };
    },
  },
  {
    id: 'sug_transformasi',
    pillarId: 'pendidikan',
    name: 'Sekolah Unggul Garuda Transformasi (SUGT)',
    shortName: 'SUGT (Transformasi)',
    unit: 'unit',
    nationalValue: '42 unit (15 Provinsi)',
    target2026: '30 unit',
    description:
      'Transformasi dan peningkatan mutu SMA unggulan eksisting menjadi Sekolah Unggul Garuda Transformasi di 15 provinsi (42 unit total).',
    minVal: 1,
    maxVal: 7,
    colorScheme: 'blue',
    customRegionType: 'sugt',
    getValue: (w) => {
      const sugtLoc = SUG_LOCATIONS.find(
        (l) => l.type === 'SUGT' && (l.provinceId === w.id || l.kodeBps === w.kodeBps)
      );
      if (sugtLoc) {
        return {
          num: sugtLoc.count,
          display: `${sugtLoc.count} Unit`,
          label: 'Alokasi SUGT',
          subtext: `Target Nasional: 30 unit · Capaian: 42 unit (15 Provinsi)`,
          statusLabel: `${sugtLoc.count} Unit`,
          statusType: 'success',
        };
      }
      return {
        num: 0,
        display: '0 Unit',
        label: 'SUGT Transformasi',
        subtext: '0 Unit (Area Putih)',
        statusLabel: '0 Unit',
        statusType: 'normal',
      };
    },
  },
  {
    id: 'sug_baru',
    pillarId: 'pendidikan',
    name: 'Sekolah Unggul Garuda Baru (SUGB)',
    shortName: 'SUGB (Baru)',
    unit: 'unit',
    nationalValue: '4 unit (4 Provinsi)',
    target2026: '4 unit',
    description:
      'Pembangunan unit baru Sekolah Unggul Garuda berasrama dengan kurikulum sains & teknologi global di 4 provinsi (Bangka Belitung, Kaltara, Sultra, NTT).',
    minVal: 1,
    maxVal: 1,
    colorScheme: 'blue',
    customRegionType: 'sugb',
    getValue: (w) => {
      const sugbLoc = SUG_LOCATIONS.find(
        (l) => l.type === 'SUGB' && (l.provinceId === w.id || l.kodeBps === w.kodeBps)
      );
      if (sugbLoc) {
        return {
          num: sugbLoc.count,
          display: `${sugbLoc.count} Unit`,
          label: 'Alokasi SUGB Baru',
          subtext: `Target: 4 unit · Lokasi: Babel, Kaltara, Sultra, NTT`,
          statusLabel: `${sugbLoc.count} Unit`,
          statusType: 'success',
        };
      }
      return {
        num: 0,
        display: '0 Unit',
        label: 'SUGB Baru',
        subtext: '0 Unit (Area Putih)',
        statusLabel: '0 Unit',
        statusType: 'normal',
      };
    },
  },
  {
    id: 'snt_operasional',
    pillarId: 'pendidikan',
    name: 'Sekolah Nasional Terintegrasi (SNT)',
    shortName: 'SNT Terintegrasi',
    unit: 'unit - kumulatif',
    nationalValue: '17 unit (48,6%)',
    target2026: '35 unit',
    description:
      'Program yang mengintegrasikan sekolah jenjang SMP dan SMA dalam satu ekosistem berkelanjutan, mulai dari pembelajaran, pengembangan guru, pembinaan karakter, hingga penjaminan mutu.',
    minVal: 35.0,
    maxVal: 85.0,
    colorScheme: 'blue',
    isNationalOnly: true,
    getValue: () => {
      return {
        num: 48.6,
        display: '17 unit (Capaian Nasional)',
        label: 'Capaian Nasional SNT',
        subtext: 'Target 2026: 35 unit · Capaian Nasional: 17 unit (48,6%)',
        statusLabel: 'Area Putih (Capaian Nasional)',
        statusType: 'normal',
      };
    },
  },
  {
    id: 'ifp_digitalisasi',
    pillarId: 'pendidikan',
    name: 'Digitalisasi Pembelajaran',
    shortName: 'Digitalisasi Pembelajaran',
    unit: 'unit perangkat',
    nationalValue: '727.436 unit (100% Berproses)',
    target2026: '727.436 unit',
    description:
      'Program transformasi pembelajaran melalui penyediaan interactive flat panel, konten pembelajaran digital, dan infrastruktur teknologi informasi untuk mewujudkan pembelajaran yang interaktif dan merata.',
    minVal: 55.0,
    maxVal: 100.0,
    colorScheme: 'blue',
    isNationalOnly: true,
    getValue: () => {
      return {
        num: 100,
        display: '727.436 unit (100% Berproses)',
        label: 'Capaian Nasional Digitalisasi',
        subtext: 'Target 2026: 727.436 perangkat & satdik di seluruh Indonesia',
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
    unit: 'tahap',
    nationalValue: 'Tahap Penyiapan',
    target2026: 'Peluncuran Nov 2027',
    description:
      'Program penyediaan pusat produksi dan penyebarluasan konten pembelajaran digital berkualitas dari guru untuk meningkatkan pemerataan mutu pembelajaran di Indonesia.',
    minVal: 40.0,
    maxVal: 100.0,
    colorScheme: 'blue',
    isNationalOnly: true,
    getValue: () => {
      return {
        num: 50,
        display: 'Tahap Penyiapan',
        label: 'Studio Guru',
        subtext: 'Target: Peluncuran Nov 2027 · Operasional 2028',
        statusLabel: 'Area Putih (Capaian Nasional)',
        statusType: 'normal',
      };
    },
  },

  // ==========================================================
  // 2. PILAR KESEHATAN
  // ==========================================================
  {
    id: 'ckg_kesehatan',
    pillarId: 'kesehatan',
    name: 'Cek Kesehatan Gratis',
    shortName: 'Cek Kesehatan Gratis',
    unit: 'juta jiwa',
    nationalValue: '105,98 Juta Jiwa (81,5%)',
    target2026: '130 Juta Jiwa',
    description:
      'Program pemeriksaan kesehatan gratis bagi seluruh masyarakat berdasarkan siklus hidup untuk mendeteksi dini penyakit dan faktor risiko kesehatan, serta mendorong pencegahan dan penanganan penyakit secara tepat waktu.',
    minVal: 45.0,
    maxVal: 95.0,
    colorScheme: 'green',
    getValue: (w) => {
      const heroVal = w.pillarDetails?.kesehatan?.heroValue || '81,5%';
      const num = parsePercent(heroVal, 81.5);
      const sub = w.pillarDetails?.kesehatan?.metric1?.value || 'Target: 130 Juta Jiwa';
      return {
        num,
        display: heroVal,
        label: 'Cakupan Peserta',
        subtext: sub,
        statusLabel: num >= 80 ? 'Sangat Baik' : num >= 65 ? 'Cukup' : 'Perlu Akselerasi Timur',
        statusType: num >= 80 ? 'success' : num >= 65 ? 'normal' : 'warning',
      };
    },
  },
  {
    id: 'tb_penemuan',
    pillarId: 'kesehatan',
    name: 'Penuntasan Tuberkulosis',
    shortName: 'Penuntasan TB',
    unit: 'kasus',
    nationalValue: '656.517 kasus (67,5%)',
    target2026: '972.000 kasus',
    description:
      'Program percepatan eliminasi tuberkulosis melalui peningkatan deteksi dini, penemuan kasus secara aktif, pemeriksaan, pengobatan hingga tuntas, serta pencegahan penularan untuk menurunkan kasus tuberkulosis.',
    minVal: 38.0,
    maxVal: 88.0,
    colorScheme: 'green',
    getValue: (w) => {
      const baseNum = parsePercent(w.pillarDetails?.kesehatan?.heroValue, 63.5);
      const num = Math.min(92, Math.max(35, Math.round((baseNum * 0.8 + 8) * 10) / 10));
      return {
        num,
        display: `${num.toString().replace('.', ',')}%`,
        label: 'Notifikasi Kasus',
        subtext: 'Target Nasional: 972.000 kasus',
        statusLabel: num >= 70 ? 'Pelacakan Intensif' : 'Notifikasi Rendah',
        statusType: num >= 70 ? 'success' : 'warning',
      };
    },
  },
  {
    id: 'rsud_spesialis',
    pillarId: 'kesehatan',
    name: 'Revitalisasi Rumah Sakit Umum Daerah (RSUD)',
    shortName: 'Revitalisasi RSUD',
    unit: 'RSUD',
    nationalValue: '18 Konstruksi (90%)',
    target2026: '20 RSUD (Kelas D ke C)',
    description:
      'Program peningkatan kapasitas dan kualitas RSUD, terutama dari kelas D menjadi kelas C, melalui pembangunan dan peningkatan fasilitas, penyediaan alat kesehatan, serta penguatan tenaga medis untuk memperluas akses layanan kesehatan rujukan yang berkualitas.',
    minVal: 50.0,
    maxVal: 100.0,
    colorScheme: 'green',
    getValue: (w) => {
      const num = w.isPrioritas ? 68.0 : 92.0;
      return {
        num,
        display: `${num.toString().replace('.', ',')}%`,
        label: 'Kesiapan RS Rujukan',
        subtext: 'Peningkatan Kelas D ke C & 7 Dokter Spesialis',
        statusLabel: num >= 85 ? 'Spesialis Lengkap' : 'Kendala Tenaga Dokter',
        statusType: num >= 85 ? 'success' : 'warning',
      };
    },
  },
  {
    id: 'mbg_3b',
    pillarId: 'kesehatan',
    name: 'MBG Ibu Hamil, Ibu Menyusui, dan Balita (3B)',
    shortName: 'MBG 3B',
    unit: '% sasaran',
    nationalValue: '44,28%–86,87%',
    target2026: '50% sasaran 3B',
    description:
      'Program pemberian makanan bergizi gratis kepada ibu hamil, ibu menyusui, dan balita untuk memenuhi kebutuhan gizi kelompok rentan, mendukung kesehatan ibu dan tumbuh kembang anak, serta mencegah stunting sejak dini.',
    minVal: 35.0,
    maxVal: 92.0,
    colorScheme: 'green',
    getValue: (w) => {
      const num = w.isPrioritas ? 52.4 : 76.8;
      return {
        num,
        display: `${num.toString().replace('.', ',')}%`,
        label: 'Cakupan MBG 3B',
        subtext: 'Fokus Wilayah Rawan Stunting & 3T',
        statusLabel: num >= 70 ? 'Cakupan Tinggi' : 'Refocusing BGN & Pemda',
        statusType: num >= 70 ? 'success' : 'warning',
      };
    },
  },

  // ==========================================================
  // 3. PILAR KETAHANAN BENCANA
  // ==========================================================
  {
    id: 'rehabilitasi_sumatera',
    pillarId: 'bencana',
    name: 'Rehabilitasi dan Rekonstruksi Sumatera',
    shortName: 'Rehab & Rekon Sumatera',
    unit: 'unit / %',
    nationalValue: 'Huntap 1.707 (4,3%) · Huntara 20.267 (99%)',
    target2026: '39.501 Huntap · 20.544 Huntara',
    description:
      'Program percepatan pemulihan pascabencana di Provinsi Aceh, Sumatera Utara, dan Sumatera Barat melalui pembangunan kembali wilayah terdampak dengan pendekatan Build Back Better untuk mewujudkan hunian, infrastruktur, layanan dasar, dan kehidupan sosial ekonomi masyarakat yang lebih baik, aman, tangguh, dan berkelanjutan serta mengurangi risiko bencana di masa depan.',
    minVal: 0,
    maxVal: 100,
    colorScheme: 'brown',
    customRegionType: 'sumatera_rehab',
    getValue: (w) => {
      const isSumatera =
        SUMATERA_REHAB_PROVINCES.includes(w.id) ||
        SUMATERA_REHAB_KODE_BPS.includes(w.kodeBps);
      if (isSumatera) {
        return {
          num: 85.0,
          display: 'Wilayah Intervensi Program',
          label: 'Rehabilitasi & Rekonstruksi',
          subtext: 'Fokus: Aceh, Sumatera Utara, dan Sumatera Barat',
          statusLabel: 'Lokasi Prioritas Bencana',
          statusType: 'alert',
        };
      }
      return {
        num: 0,
        display: 'Bukan Wilayah Intervensi Program',
        label: 'Rehabilitasi & Rekonstruksi Sumatera',
        subtext: 'Program khusus wilayah terdampak bencana Sumatera',
        statusLabel: 'Area Putih (Di Luar Sasaran)',
        statusType: 'normal',
      };
    },
  },
  {
    id: 'huntap_bencana',
    pillarId: 'bencana',
    name: 'Hunian Tetap Pascabencana (Huntap)',
    shortName: 'Huntap Relokasi',
    unit: '%',
    nationalValue: '4,3% (1.707 unit)',
    target2026: '39.501 unit (Kebutuhan: 57.027)',
    description: 'Pembangunan rumah relokasi permanen tahan gempa di zona aman risiko bencana.',
    minVal: 2.0,
    maxVal: 35.0,
    colorScheme: 'brown',
    customRegionType: 'sumatera_rehab',
    getValue: (w) => {
      const isSumatera =
        SUMATERA_REHAB_PROVINCES.includes(w.id) ||
        SUMATERA_REHAB_KODE_BPS.includes(w.kodeBps);
      if (isSumatera) {
        return {
          num: 8.5,
          display: '8,5%',
          label: 'Realisasi Huntap',
          subtext: 'Pembangunan Huntap di Kawasan Aman Relokasi',
          statusLabel: 'Perlu Akselerasi Satgas',
          statusType: 'alert',
        };
      }
      return {
        num: 0,
        display: 'Bukan Lokasi Huntap',
        label: 'Huntap Pascabencana',
        subtext: 'Program fokus di Aceh, Sumut, Sumbar',
        statusLabel: 'Area Putih',
        statusType: 'normal',
      };
    },
  },
  {
    id: 'huntara_bencana',
    pillarId: 'bencana',
    name: 'Kesiapan Hunian Antara (Huntara)',
    shortName: 'Huntara Terbangun',
    unit: '%',
    nationalValue: '99% (20.267 unit)',
    target2026: '20.544 unit',
    description: 'Penyediaan tempat tinggal darurat layak huni bagi warga penyintas bencana alam.',
    minVal: 65.0,
    maxVal: 100.0,
    colorScheme: 'brown',
    customRegionType: 'sumatera_rehab',
    getValue: (w) => {
      const isSumatera =
        SUMATERA_REHAB_PROVINCES.includes(w.id) ||
        SUMATERA_REHAB_KODE_BPS.includes(w.kodeBps);
      if (isSumatera) {
        return {
          num: 99.0,
          display: '99,0% (20.267 unit)',
          label: 'Kesiapan Huntara',
          subtext: 'Target 2026: 20.544 unit terbangun',
          statusLabel: 'Tersedia Lengkap',
          statusType: 'success',
        };
      }
      return {
        num: 0,
        display: 'Bukan Lokasi Huntara',
        label: 'Huntara Pascabencana',
        subtext: 'Program fokus di Aceh, Sumut, Sumbar',
        statusLabel: 'Area Putih',
        statusType: 'normal',
      };
    },
  },
  {
    id: 'infrastruktur_bencana',
    pillarId: 'bencana',
    name: 'Pemulihan Infrastruktur & Sabodam',
    shortName: 'Infrastruktur Bencana',
    unit: '%',
    nationalValue: '99% (Realisasi Berjalan)',
    target2026: '100% Rekonstruksi',
    description: 'Pembangunan sabodam lahar dingin, perbaikan jembatan vital, dan normalisasi tanggul sungai.',
    minVal: 65.0,
    maxVal: 100.0,
    colorScheme: 'brown',
    getValue: (w) => {
      const num = w.isPrioritas ? 82.0 : 96.5;
      return {
        num,
        display: `${num.toString().replace('.', ',')}%`,
        label: 'Fasilitas Pulih',
        subtext: 'Konektivitas Jalur Evakuasi & Sabodam',
        statusLabel: num >= 90 ? 'Rekonstruksi Optimal' : 'Pekerjaan Fisik Berjalan',
        statusType: num >= 90 ? 'success' : 'normal',
      };
    },
  },
  {
    id: 'mitigasi_bencana',
    pillarId: 'bencana',
    name: 'Kesiapsiagaan & Jalur Evakuasi (EWS)',
    shortName: 'Mitigasi & EWS',
    unit: '%',
    nationalValue: '88% Kesiapan Daerah',
    target2026: '100% Peringatan Dini Terpadu',
    description: 'Integrasi sistem deteksi dini multi-bahaya (Early Warning System for All) dan kesiapan logistik BPBD.',
    minVal: 55.0,
    maxVal: 98.0,
    colorScheme: 'brown',
    getValue: (w) => {
      const num = w.isPrioritas ? 72.0 : 90.0;
      return {
        num,
        display: `${num.toString().replace('.', ',')}%`,
        label: 'Indeks Kesiapsiagaan',
        subtext: 'Sirine Aktif & SOP Evakuasi Warga',
        statusLabel: num >= 85 ? 'Siap Siaga' : 'Perlu Penguatan Alat EWS',
        statusType: num >= 85 ? 'success' : 'warning',
      };
    },
  },

  // ==========================================================
  // 4. PILAR PENURUNAN KEMISKINAN
  // ==========================================================
  {
    id: 'tingkat_kemiskinan_pilar',
    pillarId: 'kemiskinan',
    name: 'Tingkat Kemiskinan Makro Wilayah',
    shortName: 'Tingkat Kemiskinan',
    unit: '%',
    nationalValue: '8,07%',
    target2026: '6,5–7,5%',
    description: 'Persentase penduduk miskin dengan target penurunan bertahap menuju RPJMN 2029 (4,5–5,0%).',
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
        subtext: `Target 2026: 6,5–7,5% · Ekstrem: ${w.kemiskinanEkstrem}`,
        statusLabel: num <= 7.5 ? 'Di Bawah Rata-rata' : num <= 11.5 ? 'Waspada Disparitas' : 'Kantong Kemiskinan',
        statusType: num <= 7.5 ? 'success' : num <= 11.5 ? 'warning' : 'alert',
      };
    },
  },
  {
    id: 'kemiskinan_ekstrem_pilar',
    pillarId: 'kemiskinan',
    name: 'Kemiskinan Ekstrem Wilayah',
    shortName: 'Kemiskinan Ekstrem',
    unit: '%',
    nationalValue: '0,83%',
    target2026: '0–0,5%',
    description: 'Kelompok masyarakat dengan pengeluaran di bawah garis kemiskinan ekstrem PPP $2,15/hari.',
    minVal: 0.1,
    maxVal: 5.5,
    isLowerBetter: true,
    colorScheme: 'red',
    getValue: (w) => {
      const num = parsePercent(w.kemiskinanEkstrem, 0.83);
      return {
        num,
        display: w.kemiskinanEkstrem,
        label: 'Kemiskinan Ekstrem',
        subtext: 'Target Nol Persen (0–0,5%)',
        statusLabel: num <= 0.5 ? 'Target Tercapai' : 'Perlu Bansos Khusus',
        statusType: num <= 0.5 ? 'success' : 'alert',
      };
    },
  },
  {
    id: 'dtsen_desil_pilar',
    pillarId: 'kemiskinan',
    name: 'Cakupan Desil 1–2 Terpadu DTSEN',
    shortName: 'Cakupan DTSEN Desil 1–2',
    unit: '%',
    nationalValue: '100% Pemadanan BPS',
    target2026: 'Desil 1–2 Akurat',
    description: 'Pemutakhiran Data Terpadu Sasaran Perlindungan Sosial bagi lansia tunggal dan penyandang disabilitas.',
    minVal: 60.0,
    maxVal: 98.0,
    colorScheme: 'red',
    getValue: (w) => {
      const num = w.isPrioritas ? 74.0 : 93.0;
      return {
        num,
        display: `${num.toString().replace('.', ',')}%`,
        label: 'Validasi DTSEN',
        subtext: 'Fokus MBG Lansia & Disabilitas',
        statusLabel: num >= 85 ? 'Data Padan 100%' : 'Verval Terus Berjalan',
        statusType: num >= 85 ? 'success' : 'normal',
      };
    },
  },
  {
    id: 'graduasi_bansos_pilar',
    pillarId: 'kemiskinan',
    name: 'Graduasi Bansos & MBG Kantong Kemiskinan',
    shortName: 'Graduasi Mandiri',
    unit: '%',
    nationalValue: '8,2% Lolos Graduasi',
    target2026: '10,0% Graduasi Mandiri',
    description: 'Kemandirian ekonomi keluarga rentan melalui program pemberdayaan dan permodalan usaha terpadu.',
    minVal: 4.0,
    maxVal: 15.0,
    colorScheme: 'red',
    getValue: (w) => {
      const num = w.isPrioritas ? 5.2 : 9.8;
      return {
        num,
        display: `${num.toString().replace('.', ',')}%`,
        label: 'Tingkat Graduasi',
        subtext: 'Keluarga Binaan Berhasil Mandiri',
        statusLabel: num >= 8.0 ? 'Pemberdayaan Berhasil' : 'Butuh Pendampingan PKH',
        statusType: num >= 8.0 ? 'success' : 'warning',
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
