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
  getValue: (w: WilayahData) => MapIndicatorValue;
}

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
    name: 'Revitalisasi (satdik)',
    shortName: 'Revitalisasi (satdik)',
    unit: 'satdik',
    nationalValue: '36.669 satdik (45,7%)',
    target2026: '80.282 satdik',
    description: 'Realisasi fisik renovasi sekolah rusak sedang-berat dan ruang belajar baru.',
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
    id: 'imm_pendidikan',
    pillarId: 'pendidikan',
    name: 'Indeks Modal Manusia',
    shortName: 'Indeks Modal Manusia',
    unit: 'poin',
    nationalValue: '0,56',
    target2026: '0.57',
    description: 'Pencapaian Indeks Modal Manusia (IMM) tahunan yang mengukur kualitas SDM.',
    minVal: 0.46,
    maxVal: 0.68,
    colorScheme: 'blue',
    getValue: (w) => {
      const num = parseFloat(w.imm.replace(',', '.')) || 0.56;
      return {
        num,
        display: `${w.imm} poin`,
        label: 'Nilai IMM',
        subtext: 'Target 2026: 0.57 · Target 2029: 0.59',
        statusLabel: num >= 0.57 ? 'Mencapai Target' : 'Kesenjangan Wilayah',
        statusType: num >= 0.57 ? 'success' : 'warning',
      };
    },
  },
  {
    id: 'snt_operasional',
    pillarId: 'pendidikan',
    name: 'SNT operasional (unit - kumulatif)',
    shortName: 'SNT operasional',
    unit: 'unit - kumulatif',
    nationalValue: '17 unit (45,9%)',
    target2026: '35 unit',
    description: 'Sekolah Nasional Terintegrasi operasional kumulatif di wilayah afirmasi 3T.',
    minVal: 35.0,
    maxVal: 85.0,
    colorScheme: 'blue',
    getValue: (w) => {
      const baseNum = parsePercent(w.pillarDetails?.pendidikan?.heroValue, 45.9);
      return {
        num: baseNum,
        display: w.isPrioritas ? '1–2 unit (kumulatif)' : '1 unit (kumulatif)',
        label: 'Kesiapan SNT Wilayah',
        subtext: 'Target 2026: 35 unit (Capaian Nasional: 17 unit / 45,9%)',
        statusLabel: baseNum >= 50 ? 'Fasilitas Siap' : 'Tahap Verifikasi',
        statusType: baseNum >= 50 ? 'success' : 'normal',
      };
    },
  },
  {
    id: 'sug_baru',
    pillarId: 'pendidikan',
    name: 'SUG baru (unit)',
    shortName: 'SUG baru',
    unit: 'unit',
    nationalValue: '3 unit (75%)',
    target2026: '4 unit',
    description: 'Sekolah Unggul Garuda unit pembangunan baru berstandar global.',
    minVal: 45.0,
    maxVal: 100.0,
    colorScheme: 'blue',
    getValue: (w) => {
      return {
        num: w.isPrioritas ? 75.0 : 85.0,
        display: w.isPrioritas ? '1 unit (75%)' : '0 unit',
        label: 'Penyelenggaraan SUG Baru',
        subtext: 'Target 2026: 4 unit (Capaian: 3 unit / 75%)',
        statusLabel: w.isPrioritas ? 'Tahap Pembangunan' : 'Kawasan Siap',
        statusType: w.isPrioritas ? 'success' : 'normal',
      };
    },
  },
  {
    id: 'sug_transformasi',
    pillarId: 'pendidikan',
    name: 'SUG Transformasi (unit)',
    shortName: 'SUG Transformasi',
    unit: 'unit',
    nationalValue: '30 unit (100%)',
    target2026: '30 unit',
    description: 'Sekolah Unggul Garuda hasil transformasi sekolah unggulan eksisting.',
    minVal: 50.0,
    maxVal: 100.0,
    colorScheme: 'blue',
    getValue: (w) => {
      return {
        num: 100,
        display: w.isPrioritas ? '1–2 unit (100%)' : '1 unit (100%)',
        label: 'Transformasi SUG',
        subtext: 'Target 2026: 30 unit (Capaian: 30 unit / 100%)',
        statusLabel: '100% Terealisasi',
        statusType: 'success',
      };
    },
  },
  {
    id: 'ifp_digitalisasi',
    pillarId: 'pendidikan',
    name: 'IFP diproduksi dan disalurkan (perangkat & satdik)',
    shortName: 'Penyaluran IFP',
    unit: 'perangkat & satdik',
    nationalValue: '727.436 (100% Berproses)',
    target2026: '727.436 perangkat & satdik',
    description: 'Papan tulis interaktif digital (IFP) dan Chromebook untuk sekolah sasaran.',
    minVal: 55.0,
    maxVal: 100.0,
    colorScheme: 'blue',
    getValue: (w) => {
      const num = w.isPrioritas ? 82.5 : 98.0;
      const count = w.isPrioritas ? '19.450' : '28.120';
      return {
        num,
        display: `${count} perangkat & satdik (100% Berproses)`,
        label: 'Penyaluran IFP',
        subtext: 'Target 2026: 727.436 perangkat & satdik',
        statusLabel: num >= 95 ? 'Tersalurkan 100%' : 'Berproses Disalurkan',
        statusType: 'success',
      };
    },
  },
  {
    id: 'studio_guru',
    pillarId: 'pendidikan',
    name: 'Studio Guru',
    shortName: 'Studio Guru',
    unit: 'tahap',
    nationalValue: 'Penyiapan',
    target2026: 'Peluncuran Nov 2027',
    description: 'Studio pengembangan dan penyiapan kompetensi guru berkualitas.',
    minVal: 40.0,
    maxVal: 100.0,
    colorScheme: 'blue',
    getValue: (w) => {
      return {
        num: 50,
        display: 'Tahap Penyiapan',
        label: 'Studio Guru',
        subtext: 'Target: Peluncuran Nov 2027 · Operasional 2028',
        statusLabel: 'Persiapan Kurikulum',
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
    name: 'Cakupan Cek Kesehatan Gratis (CKG)',
    shortName: 'Cek Kesehatan (CKG)',
    unit: '%',
    nationalValue: '81,5% (105,98 Juta Jiwa)',
    target2026: '130 Juta Jiwa',
    description: 'Pemeriksaan kesehatan preventif berkala terintegrasi di seluruh Puskesmas dan faskes primer.',
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
    name: 'Penemuan & Notifikasi Kasus TB',
    shortName: 'Penemuan Kasus TB',
    unit: '%',
    nationalValue: '63,5% (617.244 kasus)',
    target2026: '972.000 kasus',
    description: 'Skrining aktif dan pelacakan kontak erat tuberkulosis untuk memutus rantai penularan nasional.',
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
    id: 'mbg_3b',
    pillarId: 'kesehatan',
    name: 'MBG Ibu Hamil, Menyusui & Balita (3B)',
    shortName: 'MBG 3B & Stunting',
    unit: '%',
    nationalValue: '44,28%–86,87%',
    target2026: '50% sasaran 3B',
    description: 'Intervensi nutrisi spesifik penanganan stunting pada 1.000 Hari Pertama Kehidupan (HPK).',
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
  {
    id: 'rsud_spesialis',
    pillarId: 'kesehatan',
    name: 'Peningkatan RSUD & Dokter Spesialis',
    shortName: 'Peningkatan RSUD',
    unit: '%',
    nationalValue: '90% (18 Konstruksi Selesai)',
    target2026: '20 RSUD (Kelas D ke C)',
    description: 'Penyediaan 7 dokter spesialis dasar dan alat kesehatan canggih di RSUD rujukan kabupaten.',
    minVal: 50.0,
    maxVal: 100.0,
    colorScheme: 'green',
    getValue: (w) => {
      const num = w.isPrioritas ? 68.0 : 92.0;
      return {
        num,
        display: `${num.toString().replace('.', ',')}%`,
        label: 'Kesiapan RS Rujukan',
        subtext: '7 Dokter Spesialis Dasar & Alkes',
        statusLabel: num >= 85 ? 'Spesialis Lengkap' : 'Kendala Tenaga Dokter',
        statusType: num >= 85 ? 'success' : 'warning',
      };
    },
  },
  {
    id: 'stunting_prev',
    pillarId: 'kesehatan',
    name: 'Penurunan Prevalensi Stunting',
    shortName: 'Prevalensi Stunting',
    unit: '%',
    nationalValue: '16,2%',
    target2026: '14,0%',
    description: 'Prevalensi balita stunting hasil survei kesehatan dengan target penurunan menuju RPJMN 2029 (<10%).',
    minVal: 10.0,
    maxVal: 28.0,
    isLowerBetter: true,
    colorScheme: 'green',
    getValue: (w) => {
      const num = w.isPrioritas ? 21.4 : 14.8;
      return {
        num,
        display: `${num.toString().replace('.', ',')}%`,
        label: 'Prevalensi Stunting',
        subtext: 'Target 2026: 14,0% (Target 2029: < 10%)',
        statusLabel: num <= 14.0 ? 'Mencapai Target' : num <= 20.0 ? 'Intervensi Lanjut' : 'Prioritas Khusus',
        statusType: num <= 14.0 ? 'success' : num <= 20.0 ? 'normal' : 'warning',
      };
    },
  },

  // ==========================================================
  // 3. PILAR KETAHANAN BENCANA
  // ==========================================================
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
    getValue: (w) => {
      const heroVal = w.pillarDetails?.bencana?.heroValue || '94,0%';
      const num = parsePercent(heroVal, 94.0);
      return {
        num,
        display: heroVal.includes('%') ? heroVal : `${num}%`,
        label: 'Kesiapan Hunian',
        subtext: w.pillarDetails?.bencana?.metric1?.value || '20.267 unit terbangun',
        statusLabel: num >= 90 ? 'Tersedia Lengkap' : 'Pembangunan Bertahap',
        statusType: num >= 90 ? 'success' : 'normal',
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
    getValue: (w) => {
      const num = w.id === 'sumatera-barat' || w.id === 'sumatera-utara' || w.id === 'aceh' ? 8.5 : 4.3;
      return {
        num,
        display: `${num.toString().replace('.', ',')}%`,
        label: 'Realisasi Huntap',
        subtext: 'Kendala Kepastian Lahan Relokasi & Inpres',
        statusLabel: 'Perlu Akselerasi Satgas',
        statusType: 'alert',
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
  tb_penuntasan: 'tb_penemuan',
  mbg_kesehatan: 'mbg_3b',
  rsud_kesiapan: 'rsud_spesialis',
  stunting: 'stunting_prev',
  // Bencana aliases
  destana_mandiri: 'infrastruktur_bencana',
  ews_bencana: 'mitigasi_bencana',
  // Kemiskinan aliases
  dtsen_kemiskinan: 'dtsen_desil_pilar',
  bansos_kemiskinan: 'graduasi_bansos_pilar',
  pemberdayaan_rentan: 'tingkat_kemiskinan_pilar',
  // Pendidikan aliases
  ifp_disalurkan: 'ifp_digitalisasi',
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
