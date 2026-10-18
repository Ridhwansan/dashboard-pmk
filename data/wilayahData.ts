export interface PillarDetail {
  heroValue: string;
  heroLabel: string;
  metric1: { label: string; value: string };
  metric2: { label: string; value: string };
  keterangan: string;
}

export interface WilayahPillars {
  pendidikan: string;
  kesehatan: string;
  bencana: string;
  kemiskinan: string;
}

export interface WilayahData {
  id: string;
  kodeBps: string;
  name: string;
  level: 'nasional' | 'provinsi' | 'kabupaten' | 'kecamatan' | 'desa';
  parentProvinsiId?: string;
  parentKabKotaId?: string;
  parentKecamatanId?: string;
  lat: number;
  lng: number;
  zoom: number;
  boundary: [number, number][]; // Poligon koordinat batas wilayah (lat, lng)
  tingkatKemiskinan: string;
  kemiskinanEkstrem: string;
  imm: string;
  isPrioritas: boolean; // Menandakan wilayah prioritas percepatan / tertinggal
  kategoriWilayah: string;
  ringkasanStrategis: string;
  capaianRpjmn?: string; // Capaian Sasaran Target RPJMN 2025-2029
  targetRpjmn?: string;  // Target RPJMN 2029 (misal 80,0%)
  isuStrategis?: string; // Isu Kritis & Strategis Wilayah
  agendaTransformasi?: string; // Agenda Transformasi PMK
  pillarDetails: {
    pendidikan: PillarDetail;
    kesehatan: PillarDetail;
    bencana: PillarDetail;
    kemiskinan: PillarDetail;
  };
  catatanStrategis: string;
  // Legacy compatibility
  pillars: WilayahPillars;
}

/**
 * Helper to resolve dynamic or explicit Capaian RPJMN % for any territory
 */
export function getWilayahCapaianRpjmn(w: WilayahData): string {
  if (w.capaianRpjmn) return w.capaianRpjmn;
  const immNum = parseFloat(w.imm.replace(',', '.')) || 0.56;
  const val = Math.round((immNum * 40 + 54) * 10) / 10;
  return `${val.toString().replace('.', ',')}%`;
}

/**
 * Helper to resolve Target RPJMN for territory
 */
export function getWilayahTargetRpjmn(w: WilayahData): string {
  if (w.targetRpjmn) return w.targetRpjmn;
  return '80,0%';
}

/**
 * Helper to resolve strategic issues (Isu Strategis)
 */
export function getWilayahIsuStrategis(w: WilayahData): string {
  if (w.isuStrategis) return w.isuStrategis;
  return w.ringkasanStrategis || w.catatanStrategis || 'Percepatan konvergensi 4 pilar prioritas dan penurunan disparitas wilayah.';
}

/**
 * Helper to resolve Agenda Transformasi PMK
 */
export function getWilayahAgendaTransformasi(w: WilayahData): string {
  if (w.agendaTransformasi) return w.agendaTransformasi;
  if (w.isPrioritas) {
    return 'Transformasi Layanan Sosial Dasar 3T, Penuntasan Kemiskinan Ekstrem & Resiliensi Bencana Terpadu';
  }
  return 'Transformasi Produktivitas SDM Unggul, Integrasi Layanan Primer & Perlindungan Sosial Adaptif';
}

// 1. DATA TINGKAT NASIONAL (KODE BPS: 00)
export const NASIONAL_DATA: WilayahData = {
  id: 'nasional',
  kodeBps: '00',
  name: 'Republik Indonesia',
  level: 'nasional',
  lat: -2.5489,
  lng: 118.0149,
  zoom: 5,
  boundary: [
    [5.9, 95.2],
    [5.9, 141.0],
    [-11.0, 141.0],
    [-11.0, 95.2],
  ],
  tingkatKemiskinan: '8,07%',
  kemiskinanEkstrem: '0,83%',
  imm: '0,56',
  isPrioritas: false,
  kategoriWilayah: 'Agregat Nasional',
  capaianRpjmn: '76,4%',
  targetRpjmn: '80,0%',
  isuStrategis:
    'Percepatan penuntasan kemiskinan ekstrem di kantong kemiskinan dan penyelesaian huntap pascabencana.',
  agendaTransformasi:
    'Penguatan jaring pengaman sosial adaptif, reformasi faskes primer, dan transformasi ketahanan iklim-bencana.',
  ringkasanStrategis:
    'Pengawalan orkestrasi 4 pilar prioritas difokuskan pada percepatan penuntasan kemiskinan ekstrem di kantong kemiskinan dan penyelesaian huntap pascabencana.',
  pillarDetails: {
    pendidikan: {
      heroValue: '45,7%',
      heroLabel: 'Revitalisasi Sarana Satdik',
      metric1: { label: 'Realisasi Fisik', value: '36.669 / 80.282 satdik' },
      metric2: { label: 'Target IMM Nasional', value: '0,57' },
      keterangan: 'Fokus intervensi sekolah rusak sedang-berat & digitalisasi pembelajaran 3T.',
    },
    kesehatan: {
      heroValue: '81,5%',
      heroLabel: 'Cakupan Cek Kesehatan Gratis',
      metric1: { label: 'Realisasi Peserta', value: '105,98 Juta Jiwa' },
      metric2: { label: 'Penemuan Kasus TB', value: '617.244 kasus' },
      keterangan: 'Skrining kesehatan berkala terintegrasi di faskes primer seluruh Indonesia.',
    },
    bencana: {
      heroValue: '20.267',
      heroLabel: 'Hunian Antara Terbangun (99%)',
      metric1: { label: 'Huntap Terbangun', value: '1.707 unit (4,3%)' },
      metric2: { label: 'Target Relokasi', value: '39.501 unit huntap' },
      keterangan: 'Akselerasi kepastian status lahan relokasi dan pencairan stimulan rumah rusak.',
    },
    kemiskinan: {
      heroValue: '8,07%',
      heroLabel: 'Tingkat Kemiskinan Terkini',
      metric1: { label: 'Kemiskinan Ekstrem', value: '0,83% (Target 0%)' },
      metric2: { label: 'Fokus Sasaran', value: 'Desil 1–2 Terpadu DTSEN' },
      keterangan: 'Konvergensi program graduasi bansos dan perlindungan sosial adaptif.',
    },
  },
  pillars: {
    pendidikan: 'Revitalisasi Satdik: 36.669 / 80.282 satdik (45,7%) · Target IMM: 0,57',
    kesehatan: 'Cek Kesehatan Gratis (CKG): 105,98 Juta Jiwa (81,5%) · Penemuan TB: 617.244 kasus',
    bencana: 'Huntara: 20.267 unit (99%) · Huntap: 1.707 unit (4,3%)',
    kemiskinan: 'Kemiskinan: 8,07% (Target 6,5–7,5%) · Desil 1–2 Terpadu',
  },
  catatanStrategis:
    'Pengawalan orkestrasi 4 pilar difokuskan pada percepatan penuntasan kemiskinan ekstrem di kantong kemiskinan dan penyelesaian huntap pascabencana.',
};

// 2. DATA TINGKAT PROVINSI (URUT KODE BPS: 11 S/D 94)
export const PROVINSI_DATA: WilayahData[] = [
  // 11 - Aceh
  {
    id: 'aceh',
    kodeBps: '11',
    name: 'Aceh',
    level: 'provinsi',
    lat: 4.6951,
    lng: 96.7494,
    zoom: 7,
    boundary: [
      [5.95, 95.10],
      [5.65, 95.85],
      [5.20, 97.55],
      [4.35, 98.30],
      [2.75, 98.15],
      [2.10, 97.30],
      [3.40, 96.20],
      [4.75, 95.30],
      [5.95, 95.10],
    ],
    tingkatKemiskinan: '14,23%',
    kemiskinanEkstrem: '1,83%',
    imm: '0,52',
    isPrioritas: true,
    kategoriWilayah: 'Wilayah Prioritas Percepatan',
    ringkasanStrategis:
      'Percepatan pemenuhan sarana pendidikan terpencil dan dokter spesialis di wilayah barat-selatan Aceh.',
    pillarDetails: {
      pendidikan: {
        heroValue: '37,2%',
        heroLabel: 'Revitalisasi Satdik',
        metric1: { label: 'Satdik Terealisasi', value: '1.450 / 3.900 satdik' },
        metric2: { label: 'Indeks Pendidikan', value: '0,52' },
        keterangan: 'Prioritas sarana air bersih & ruang kelas pulau terluar Simeulue.',
      },
      kesehatan: {
        heroValue: '68,5%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Realisasi Peserta', value: '2,7 Juta Jiwa' },
        metric2: { label: 'Tenaga Medis', value: 'Penguatan 12 Puskesmas 3T' },
        keterangan: 'Skrining anemia remaja putri dan penanganan stunting pesisir.',
      },
      bencana: {
        heroValue: '94,0%',
        heroLabel: 'Kesiapsiagaan Jalur Evakuasi',
        metric1: { label: 'Mitigasi Gempa-Tsunami', value: '45 Titik Sirine Aktif' },
        metric2: { label: 'Kesiapan Huntara', value: '820 Unit Siap Huni' },
        keterangan: 'Penguatan tanggul penahan banjir luapan sungai Singkil & Tamiang.',
      },
      kemiskinan: {
        heroValue: '14,23%',
        heroLabel: 'Tingkat Kemiskinan',
        metric1: { label: 'Kemiskinan Ekstrem', value: '1,83%' },
        metric2: { label: 'Intervensi Dana Otsus', value: 'Fasilitas Layanan Dasar' },
        keterangan: 'Pemberdayaan ekonomi nelayan tradisional dan petani nilam.',
      },
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik: 1.450 / 3.900 satdik (37,2%)',
      kesehatan: 'CKG Terealisasi: 2,7 Juta Jiwa (68,5%)',
      bencana: 'Mitigasi Bencana Gempa, Tsunami & Banjir Luapan',
      kemiskinan: 'Kemiskinan: 14,23% · Ekstrem: 1,83%',
    },
    catatanStrategis:
      'Percepatan pemerataan fasilitas sekolah dan dokter spesialis di wilayah barat-selatan Aceh.',
  },

  // 12 - Sumatera Utara
  {
    id: 'sumatera-utara',
    kodeBps: '12',
    name: 'Sumatera Utara',
    level: 'provinsi',
    lat: 2.1154,
    lng: 99.5451,
    zoom: 7,
    boundary: [
      [4.30, 98.00],
      [3.85, 99.85],
      [2.45, 100.15],
      [1.10, 100.20],
      [0.60, 99.10],
      [1.50, 98.40],
      [2.80, 97.40],
      [4.30, 98.00],
    ],
    tingkatKemiskinan: '7,99%',
    kemiskinanEkstrem: '0,76%',
    imm: '0,55',
    isPrioritas: false,
    kategoriWilayah: 'Wilayah Reguler Pengawalan',
    ringkasanStrategis:
      'Pengawalan sarana pendidikan terpencil dan peningkatan fasilitas kesehatan di Kepulauan Nias.',
    pillarDetails: {
      pendidikan: {
        heroValue: '45,2%',
        heroLabel: 'Revitalisasi Satdik',
        metric1: { label: 'Satdik Terealisasi', value: '2.890 / 6.400 satdik' },
        metric2: { label: 'Akses Digital', value: '78,4% Sekolah Terhubung' },
        keterangan: 'Fasilitasi ruang kelas tahan gempa di zona Patahan Semangko.',
      },
      kesehatan: {
        heroValue: '78,1%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Realisasi Peserta', value: '8,4 Juta Jiwa' },
        metric2: { label: 'Skrining TB', value: '62.400 kasus terlacak' },
        keterangan: 'Penguatan RS rujukan regional di kawasan Danau Toba dan Nias.',
      },
      bencana: {
        heroValue: '88,0%',
        heroLabel: 'Mitigasi Bencana Terpadu',
        metric1: { label: 'Rawan Banjir Bandang', value: '18 Daerah Aliran Sungai' },
        metric2: { label: 'Early Warning System', value: '32 Unit Aktif' },
        keterangan: 'Normalisasi sungai rawan longsor di Tapanuli dan Mandailing.',
      },
      kemiskinan: {
        heroValue: '7,99%',
        heroLabel: 'Tingkat Kemiskinan',
        metric1: { label: 'Kemiskinan Ekstrem', value: '0,76%' },
        metric2: { label: 'Kawasan Fokus', value: 'Kantong Pesisir & Nias' },
        keterangan: 'Pemberdayaan nelayan tangkap dan integrasi jaminan sosial.',
      },
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik: 2.890 / 6.400 satdik (45,2%)',
      kesehatan: 'CKG Terealisasi: 8,4 Juta Jiwa (78,1%)',
      bencana: 'Kesiapsiagaan Banjir Bandang & Gempa Patahan Semangko',
      kemiskinan: 'Kemiskinan: 7,99% · Ekstrem: 0,76%',
    },
    catatanStrategis:
      'Pengawalan sarana pendidikan dan kesehatan terpencil di Kepulauan Nias.',
  },

  // 13 - Sumatera Barat
  {
    id: 'sumatera-barat',
    kodeBps: '13',
    name: 'Sumatera Barat',
    level: 'provinsi',
    lat: -0.7399,
    lng: 100.8000,
    zoom: 7,
    boundary: [
      [0.60, 99.10],
      [0.25, 100.50],
      [-0.40, 101.50],
      [-1.80, 101.80],
      [-2.80, 101.30],
      [-1.80, 100.50],
      [-0.20, 99.20],
      [0.60, 99.10],
    ],
    tingkatKemiskinan: '5,95%',
    kemiskinanEkstrem: '0,41%',
    imm: '0,61',
    isPrioritas: false,
    kategoriWilayah: 'Wilayah Reguler Pengawalan',
    ringkasanStrategis:
      'Mitigasi bencana lahar dingin Marapi serta pemulihan konektivitas jalur logistik Lembah Anai.',
    pillarDetails: {
      pendidikan: {
        heroValue: '58,4%',
        heroLabel: 'Revitalisasi Satdik',
        metric1: { label: 'Satdik Terealisasi', value: '1.920 / 3.280 satdik' },
        metric2: { label: 'Digitalisasi', value: '88,2% Akses Pembelajaran' },
        keterangan: 'Perbaikan sarana madrasah terdampak banjir lahar Agam & Tanah Datar.',
      },
      kesehatan: {
        heroValue: '82,4%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Realisasi Peserta', value: '3,8 Juta Jiwa' },
        metric2: { label: 'Posyandu Aktif', value: '94,5% Integrasi ILP' },
        keterangan: 'Pelayanan trauma healing korban bencana erupsi dan tanah longsor.',
      },
      bencana: {
        heroValue: '91,0%',
        heroLabel: 'Pemulihan Pascabencana',
        metric1: { label: 'Huntara Marapi', value: '310 Unit Selesai' },
        metric2: { label: 'Sabodam Dibangun', value: '6 Titik Aliran Lahar' },
        keterangan: 'Penyelesaian sabodam mitigasi lahar dingin Gunung Marapi.',
      },
      kemiskinan: {
        heroValue: '5,95%',
        heroLabel: 'Tingkat Kemiskinan',
        metric1: { label: 'Kemiskinan Ekstrem', value: '0,41%' },
        metric2: { label: 'Lokus Utama', value: 'Mentawai & Pesisir Selatan' },
        keterangan: 'Penguatan rantai pasok komoditas pertanian dan perikanan rakyat.',
      },
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik: 1.920 / 3.280 satdik (58,4%)',
      kesehatan: 'CKG Terealisasi: 3,8 Juta Jiwa (82,4%)',
      bencana: 'Pemulihan Erupsi Marapi & Jalur Lembah Anai',
      kemiskinan: 'Kemiskinan: 5,95% · Ekstrem: 0,41%',
    },
    catatanStrategis:
      'Percepatan pembangunan sabodam Marapi dan perlindungan sosial daerah terisolir Kepulauan Mentawai.',
  },

  // 14 - Riau
  {
    id: 'riau',
    kodeBps: '14',
    name: 'Riau',
    level: 'provinsi',
    lat: 0.5071,
    lng: 101.4478,
    zoom: 7,
    boundary: [
      [2.45, 100.15],
      [2.10, 101.80],
      [1.30, 103.20],
      [-0.80, 103.50],
      [-1.20, 102.50],
      [-0.40, 101.50],
      [1.10, 100.20],
      [2.45, 100.15],
    ],
    tingkatKemiskinan: '6,67%',
    kemiskinanEkstrem: '0,52%',
    imm: '0,62',
    isPrioritas: false,
    kategoriWilayah: 'Wilayah Reguler Pengawalan',
    ringkasanStrategis:
      'Penanggulangan karhutla gambut dan peningkatan akses fasilitas dasar pulau terluar Meranti.',
    pillarDetails: {
      pendidikan: {
        heroValue: '54,0%',
        heroLabel: 'Revitalisasi Satdik',
        metric1: { label: 'Satdik Terealisasi', value: '2.100 / 3.890 satdik' },
        metric2: { label: 'Sekolah Pesisir', value: '410 Satdik Terpencil' },
        keterangan: 'Peningkatan ruang kelas dan sanitasi layak pulau gambut.',
      },
      kesehatan: {
        heroValue: '79,0%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Realisasi Peserta', value: '4,6 Juta Jiwa' },
        metric2: { label: 'Kesiapan Faskes', value: 'Puskesmas Terapung Aktif' },
        keterangan: 'Skrining ISPA pencegahan dampak kabut asap karhutla.',
      },
      bencana: {
        heroValue: '96,0%',
        heroLabel: 'Satgas Karhutla Terpadu',
        metric1: { label: 'Restorasi Gambut', value: '42 Kanal Penyekat' },
        metric2: { label: 'Water Bombing', value: '6 Heli Siaga Pangkalan' },
        keterangan: 'Patroli terpadu TNI-Polri dan BPBD di zona rawan gambut Rokan Hilir & Dumai.',
      },
      kemiskinan: {
        heroValue: '6,67%',
        heroLabel: 'Tingkat Kemiskinan',
        metric1: { label: 'Kemiskinan Ekstrem', value: '0,52%' },
        metric2: { label: 'Kantong Utama', value: 'Kepulauan Meranti (12,8%)' },
        keterangan: 'Bantuan hilirisasi sagu dan perbaikan konektivitas pelabuhan perintis.',
      },
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik: 2.100 / 3.890 satdik (54,0%)',
      kesehatan: 'CKG Terealisasi: 4,6 Juta Jiwa (79,0%)',
      bencana: 'Mitigasi Karhutla Lahan Gambut & Kanal Penyekat',
      kemiskinan: 'Kemiskinan: 6,67% · Ekstrem: 0,52%',
    },
    catatanStrategis:
      'Fokus pengentasan kemiskinan perdesaan gambut di Kabupaten Kepulauan Meranti.',
  },

    // 15 - Jambi
  {
  id: 'jambi',
  kodeBps: '15',
  name: 'Jambi',
  level: 'provinsi',
  lat: -1.6101,
  lng: 103.6131,
  zoom: 7,
  boundary: [
    [
      -0.8,
      103.5
    ],
    [
      -1,
      104.3
    ],
    [
      -1.6,
      104.1
    ],
    [
      -2.4,
      103
    ],
    [
      -2.2,
      101.4
    ],
    [
      -1.3,
      101.3
    ],
    [
      -0.8,
      103.5
    ]
  ],
  tingkatKemiskinan: '7,58%',
  kemiskinanEkstrem: '0,62%',
  imm: '0,58',
  isPrioritas: false,
  kategoriWilayah: 'Wilayah Reguler Pengawalan',
  ringkasanStrategis: 'Peningkatan akses pendidikan perdesaan dan pengendalian kebakaran hutan lahan gambut Muaro Jambi.',
  pillarDetails: {
    pendidikan: {
      heroValue: '51,2%',
      heroLabel: 'Revitalisasi Satdik',
      metric1: {
        label: 'Satdik Terealisasi',
        value: '1.240 / 2.420 satdik'
      },
      metric2: {
        label: 'Akses Komputer',
        value: '76,5% Satdik'
      },
      keterangan: 'Peningkatan mutu ruang belajar di pedalaman Tanjung Jabung.'
    },
    kesehatan: {
      heroValue: '78,4%',
      heroLabel: 'Cakupan Cek Kesehatan Gratis',
      metric1: {
        label: 'Peserta Terlayani',
        value: '2,4 Juta Jiwa'
      },
      metric2: {
        label: 'Faskes Primer',
        value: '185 Puskesmas'
      },
      keterangan: 'Skrining berkala penyakit tidak menular pekerja perkebunan.'
    },
    bencana: {
      heroValue: '93,0%',
      heroLabel: 'Kesiapsiagaan Karhutla',
      metric1: {
        label: 'Sekat Kanal',
        value: '28 Titik Gambut'
      },
      metric2: {
        label: 'Posko Siaga',
        value: '12 Pos Lintas Sektor'
      },
      keterangan: 'Patroli terpadu cegah kebakaran gambut Taman Nasional Berbak.'
    },
    kemiskinan: {
      heroValue: '7,58%',
      heroLabel: 'Tingkat Kemiskinan',
      metric1: {
        label: 'Kemiskinan Ekstrem',
        value: '0,62%'
      },
      metric2: {
        label: 'Sasaran Program',
        value: 'Tanjung Jabung Timur & Barat'
      },
      keterangan: 'Pemberdayaan petani pinang dan kelapa sawit rakyat.'
    }
  },
  pillars: {
    pendidikan: 'Revitalisasi Satdik: 1.240 / 2.420 satdik (51,2%)',
    kesehatan: 'CKG Terealisasi: 2,4 Juta Jiwa (78,4%)',
    bencana: 'Mitigasi Karhutla Lahan Gambut Berbak',
    kemiskinan: 'Kemiskinan: 7,58% · Ekstrem: 0,62%'
  },
  catatanStrategis: 'Fokus pemenuhan hak dasar warga pedalaman SAD dan perbaikan sanitasi pesisir.'
},

// 16 - Sumatera Selatan
  {
    id: 'sumatera-selatan',
    kodeBps: '16',
    name: 'Sumatera Selatan',
    level: 'provinsi',
    lat: -3.3194,
    lng: 104.9147,
    zoom: 7,
    boundary: [
      [-1.80, 103.50],
      [-2.10, 105.50],
      [-3.40, 106.10],
      [-4.80, 105.20],
      [-4.90, 103.80],
      [-3.80, 102.60],
      [-2.40, 103.00],
      [-1.80, 103.50],
    ],
    tingkatKemiskinan: '11,78%',
    kemiskinanEkstrem: '1,24%',
    imm: '0,56',
    isPrioritas: true,
    kategoriWilayah: 'Wilayah Prioritas Percepatan',
    ringkasanStrategis:
      'Pengentasan kantong kemiskinan perairan pasang surut Banyuasin dan OKI.',
    pillarDetails: {
      pendidikan: {
        heroValue: '48,1%',
        heroLabel: 'Revitalisasi Satdik',
        metric1: { label: 'Satdik Terealisasi', value: '2.450 / 5.100 satdik' },
        metric2: { label: 'Digitalisasi', value: '72,0% Akses Internet Sekolah' },
        keterangan: 'Revitalisasi SD/SMP di kawasan perairan pasang surut.',
      },
      kesehatan: {
        heroValue: '76,5%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Realisasi Peserta', value: '6,1 Juta Jiwa' },
        metric2: { label: 'Penurunan Stunting', value: 'Fokus 5 Kabupaten Kritis' },
        keterangan: 'Pemberian makanan bergizi bagi balita resiko stunting.',
      },
      bencana: {
        heroValue: '93,0%',
        heroLabel: 'Pencegahan Karhutla Gambut',
        metric1: { label: 'TMC Pengkondisian Udara', value: '18 Sortir Operasi' },
        metric2: { label: 'Embung Air Aktif', value: '124 Titik Lokasi' },
        keterangan: 'Penyiapan embung dan sekat kanal gambut di Ogan Komering Ilir.',
      },
      kemiskinan: {
        heroValue: '11,78%',
        heroLabel: 'Tingkat Kemiskinan',
        metric1: { label: 'Kemiskinan Ekstrem', value: '1,24%' },
        metric2: { label: 'Lokus Sasaran', value: 'Muratara, Banyuasin, OKI' },
        keterangan: 'Pemberdayaan petani sawit mandiri dan nelayan lebak lebung.',
      },
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik: 2.450 / 5.100 satdik (48,1%)',
      kesehatan: 'CKG Terealisasi: 6,1 Juta Jiwa (76,5%)',
      bencana: 'Kesiapan Karhutla Lahan Gambut OKI & Banyuasin',
      kemiskinan: 'Kemiskinan: 11,78% · Ekstrem: 1,24%',
    },
    catatanStrategis:
      'Percepatan sanitasi dan akses air bersih di kawasan perairan Musi Banyuasin dan Muratara.',
  },

    // 17 - Bengkulu
  {
  id: 'bengkulu',
  kodeBps: '17',
  name: 'Bengkulu',
  level: 'provinsi',
  lat: -3.8004,
  lng: 102.2655,
  zoom: 7,
  boundary: [
    [
      -2.4,
      101.1
    ],
    [
      -3,
      102.5
    ],
    [
      -4.6,
      103.5
    ],
    [
      -4.9,
      102.8
    ],
    [
      -3.5,
      101.8
    ],
    [
      -2.4,
      101.1
    ]
  ],
  tingkatKemiskinan: '14,04%',
  kemiskinanEkstrem: '1,72%',
  imm: '0,52',
  isPrioritas: true,
  kategoriWilayah: 'Wilayah Prioritas Percepatan',
  ringkasanStrategis: 'Percepatan konektivitas Pulau Enggano dan mitigasi bencana gempa tsunami megathrust pesisir barat.',
  pillarDetails: {
    pendidikan: {
      heroValue: '41,8%',
      heroLabel: 'Revitalisasi Satdik',
      metric1: {
        label: 'Satdik Terealisasi',
        value: '820 / 1.960 satdik'
      },
      metric2: {
        label: 'Satdik Enggano',
        value: '18 Sekolah Terluar'
      },
      keterangan: 'Penyediaan laboratorium digital dan sarana asrama siswa Enggano.'
    },
    kesehatan: {
      heroValue: '72,1%',
      heroLabel: 'Cakupan Cek Kesehatan Gratis',
      metric1: {
        label: 'Peserta Terlayani',
        value: '1,3 Juta Jiwa'
      },
      metric2: {
        label: 'Dokter Spesialis',
        value: 'Penugasan 8 RSUD'
      },
      keterangan: 'Penguatan puskesmas terapung untuk kepulauan terpencil.'
    },
    bencana: {
      heroValue: '90,0%',
      heroLabel: 'Mitigasi Gempa Megathrust',
      metric1: {
        label: 'Sirine Tsunami',
        value: '14 Titik Pesisir Aktif'
      },
      metric2: {
        label: 'Shelter Evakuasi',
        value: '8 Gedung Siaga'
      },
      keterangan: 'Simulasi tanggap darurat rutin di zona megathrust Mentawai-Bengkulu.'
    },
    kemiskinan: {
      heroValue: '14,04%',
      heroLabel: 'Tingkat Kemiskinan',
      metric1: {
        label: 'Kemiskinan Ekstrem',
        value: '1,72%'
      },
      metric2: {
        label: 'Kantong Kemiskinan',
        value: 'Seluma, Kaur & Enggano'
      },
      keterangan: 'Bantuan alat tangkap nelayan tradisional dan bibit kopi robusta.'
    }
  },
  pillars: {
    pendidikan: 'Revitalisasi Satdik: 820 / 1.960 satdik (41,8%)',
    kesehatan: 'CKG Terealisasi: 1,3 Juta Jiwa (72,1%)',
    bencana: 'Mitigasi Gempa-Tsunami Megathrust Bengkulu',
    kemiskinan: 'Kemiskinan: 14,04% · Ekstrem: 1,72%'
  },
  catatanStrategis: 'Akselerasi pengentasan kemiskinan di Kabupaten Seluma dan perbaikan pelabuhan Enggano.'
},

// 18 - Lampung
  {
    id: 'lampung',
    kodeBps: '18',
    name: 'Lampung',
    level: 'provinsi',
    lat: -4.9000,
    lng: 105.0000,
    zoom: 7,
    boundary: [
      [-3.80, 104.80],
      [-4.00, 105.80],
      [-5.60, 105.90],
      [-5.90, 104.50],
      [-5.00, 103.50],
      [-4.20, 104.20],
      [-3.80, 104.80],
    ],
    tingkatKemiskinan: '10,69%',
    kemiskinanEkstrem: '1,05%',
    imm: '0,57',
    isPrioritas: true,
    kategoriWilayah: 'Wilayah Prioritas Percepatan',
    ringkasanStrategis:
      'Akselerasi integrasi data kemiskinan dan pemulihan infrastruktur jalan poros produksi tani.',
    pillarDetails: {
      pendidikan: {
        heroValue: '51,0%',
        heroLabel: 'Revitalisasi Satdik',
        metric1: { label: 'Satdik Terealisasi', value: '2.310 / 4.530 satdik' },
        metric2: { label: 'Sarpras Vokasi', value: '84 SMK Pertanian Unggulan' },
        keterangan: 'Penguatan kurikulum vokasi berbasis agribisnis lokal.',
      },
      kesehatan: {
        heroValue: '77,8%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Realisasi Peserta', value: '6,4 Juta Jiwa' },
        metric2: { label: 'Intervensi Gizi', value: 'Intervensi 10 Lokus Stunting' },
        keterangan: 'Skrining kesehatan berkala bagi buruh perkebunan dan petani.',
      },
      bencana: {
        heroValue: '90,0%',
        heroLabel: 'Mitigasi Tsunami Selat Sunda',
        metric1: { label: 'Sensor Pasang Surut', value: '8 Stasiun Aktif' },
        metric2: { label: 'Shelter Evakuasi', value: '14 Titik Pesisir Kalianda' },
        keterangan: 'Pemantauan aktivitas Gunung Anak Krakatau dan tanggul abrasi.',
      },
      kemiskinan: {
        heroValue: '10,69%',
        heroLabel: 'Tingkat Kemiskinan',
        metric1: { label: 'Kemiskinan Ekstrem', value: '1,05%' },
        metric2: { label: 'Lokus Fokus', value: 'Lampung Utara, Pesisir Barat' },
        keterangan: 'Graduasi bansos PKH melalui kelompok usaha bersama tani kopi.',
      },
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik: 2.310 / 4.530 satdik (51,0%)',
      kesehatan: 'CKG Terealisasi: 6,4 Juta Jiwa (77,8%)',
      bencana: 'Mitigasi Tsunami Selat Sunda & Erupsi Krakatau',
      kemiskinan: 'Kemiskinan: 10,69% · Ekstrem: 1,05%',
    },
    catatanStrategis:
      'Percepatan perbaikan jalan usaha tani dan sanitasi lingkungan di Lampung Utara.',
  },

    // 19 - Kepulauan Bangka Belitung
  {
  id: 'kepulauan-bangka-belitung',
  kodeBps: '19',
  name: 'Kepulauan Bangka Belitung',
  level: 'provinsi',
  lat: -2.741,
  lng: 106.4406,
  zoom: 8,
  boundary: [
    [
      -1.5,
      105.2
    ],
    [
      -1.6,
      106.2
    ],
    [
      -3,
      108.3
    ],
    [
      -3.5,
      107.8
    ],
    [
      -3.2,
      105.8
    ],
    [
      -1.5,
      105.2
    ]
  ],
  tingkatKemiskinan: '4,68%',
  kemiskinanEkstrem: '0,35%',
  imm: '0,61',
  isPrioritas: false,
  kategoriWilayah: 'Wilayah Reguler Pengawalan',
  ringkasanStrategis: 'Diversifikasi ekonomi pascatambang timah ke sektor kelautan, pariwisata, dan hilirisasi lada putih.',
  pillarDetails: {
    pendidikan: {
      heroValue: '61,5%',
      heroLabel: 'Revitalisasi Satdik',
      metric1: {
        label: 'Satdik Terealisasi',
        value: '710 / 1.150 satdik'
      },
      metric2: {
        label: 'Vokasi Pariwisata',
        value: '12 SMK Unggulan Belitung'
      },
      keterangan: 'Peningkatan sarana digital sekolah kepulauan.'
    },
    kesehatan: {
      heroValue: '84,0%',
      heroLabel: 'Cakupan Cek Kesehatan Gratis',
      metric1: {
        label: 'Peserta Terlayani',
        value: '1,1 Juta Jiwa'
      },
      metric2: {
        label: 'Faskes Terakreditasi',
        value: '96% Puskesmas'
      },
      keterangan: 'Skrining kesehatan terintegrasi berbasis pulau.'
    },
    bencana: {
      heroValue: '91,0%',
      heroLabel: 'Mitigasi Cuaca Ekstrem Pesisir',
      metric1: {
        label: 'EWS Gelombang',
        value: '8 Radar Cuaca Maritim'
      },
      metric2: {
        label: 'Reklamasi Kolong',
        value: '45 Eks Tambang Ditanami'
      },
      keterangan: 'Pemulihan lahan pascatambang menjadi ruang hijau produktif.'
    },
    kemiskinan: {
      heroValue: '4,68%',
      heroLabel: 'Tingkat Kemiskinan',
      metric1: {
        label: 'Kemiskinan Ekstrem',
        value: '0,35%'
      },
      metric2: {
        label: 'Fokus Wilayah',
        value: 'Pesisir Bangka Selatan'
      },
      keterangan: 'Pelatihan kewirausahaan maritim dan budidaya kepiting bakau.'
    }
  },
  pillars: {
    pendidikan: 'Revitalisasi Satdik: 710 / 1.150 satdik (61,5%)',
    kesehatan: 'CKG Terealisasi: 1,1 Juta Jiwa (84,0%)',
    bencana: 'Mitigasi Cuaca Ekstrem & Reklamasi Kolong Tambang',
    kemiskinan: 'Kemiskinan: 4,68% · Ekstrem: 0,35%'
  },
  catatanStrategis: 'Akselerasi transisi ekonomi hijau pascatambang dan perlindungan nelayan pesisir.'
},

  // 21 - Kepulauan Riau
  {
  id: 'kepulauan-riau',
  kodeBps: '21',
  name: 'Kepulauan Riau',
  level: 'provinsi',
  lat: 3.9456,
  lng: 108.1429,
  zoom: 7,
  boundary: [
    [
      4.8,
      107.5
    ],
    [
      4.5,
      109
    ],
    [
      1,
      109
    ],
    [
      0,
      104.5
    ],
    [
      1.2,
      103.5
    ],
    [
      4.8,
      107.5
    ]
  ],
  tingkatKemiskinan: '5,37%',
  kemiskinanEkstrem: '0,38%',
  imm: '0,65',
  isPrioritas: false,
  kategoriWilayah: 'Wilayah Reguler Pengawalan',
  ringkasanStrategis: 'Penguatan pertahanan kedaulatan laut dan jaminan layanan dasar di gugusan pulau terluar Natuna-Anambas.',
  pillarDetails: {
    pendidikan: {
      heroValue: '67,0%',
      heroLabel: 'Revitalisasi Satdik',
      metric1: {
        label: 'Satdik Terealisasi',
        value: '890 / 1.330 satdik'
      },
      metric2: {
        label: 'Sekolah Natuna',
        value: '112 Satdik Terpencil'
      },
      keterangan: 'Akses internet satelit Starlink untuk sekolah pulau perbatasan.'
    },
    kesehatan: {
      heroValue: '86,5%',
      heroLabel: 'Cakupan Cek Kesehatan Gratis',
      metric1: {
        label: 'Peserta Terlayani',
        value: '1,7 Juta Jiwa'
      },
      metric2: {
        label: 'Puskesmas Keliling Laut',
        value: '16 Speedboat Medis'
      },
      keterangan: 'Layanan medis terapung antar-pulau Anambas dan Natuna.'
    },
    bencana: {
      heroValue: '92,0%',
      heroLabel: 'Kesiapsiagaan Maritim Perbatasan',
      metric1: {
        label: 'Stasiun Radar BMKG',
        value: '5 Titik Natuna Utara'
      },
      metric2: {
        label: 'Depo Logistik Darurat',
        value: 'Ranai & Tarempa Siaga'
      },
      keterangan: 'Kesiapsiagaan gelombang laut ekstrem musim angin utara.'
    },
    kemiskinan: {
      heroValue: '5,37%',
      heroLabel: 'Tingkat Kemiskinan',
      metric1: {
        label: 'Kemiskinan Ekstrem',
        value: '0,38%'
      },
      metric2: {
        label: 'Lokus Sasaran',
        value: 'Lingga & Natuna Pesisir'
      },
      keterangan: 'Modernisasi kapal tangkap nelayan 5-10 GT dan cold storage perikanan.'
    }
  },
  pillars: {
    pendidikan: 'Revitalisasi Satdik: 890 / 1.330 satdik (67,0%)',
    kesehatan: 'CKG Terealisasi: 1,7 Juta Jiwa (86,5%)',
    bencana: 'Mitigasi Cuaca Maritim Ekstrem Laut Natuna',
    kemiskinan: 'Kemiskinan: 5,37% · Ekstrem: 0,38%'
  },
  catatanStrategis: 'Pemerataan fasilitas dasar kesehatan dan pendidikan pulau terluar di Kepulauan Anambas dan Natuna.'
},

// 31 - DKI Jakarta (Detail hingga Desa)
  {
    id: 'dki-jakarta',
    kodeBps: '31',
    name: 'DKI Jakarta',
    level: 'provinsi',
    lat: -6.2088,
    lng: 106.8456,
    zoom: 11,
    boundary: [
      [-6.08, 106.68],
      [-6.08, 106.97],
      [-6.18, 106.98],
      [-6.37, 106.90],
      [-6.37, 106.70],
      [-6.22, 106.68],
      [-6.08, 106.68],
    ],
    tingkatKemiskinan: '4,44%',
    kemiskinanEkstrem: '0,08%',
    imm: '0,72',
    isPrioritas: false,
    kategoriWilayah: 'Wilayah Penataan Kantong Padat',
    ringkasanStrategis:
      'Penajaman sasaran intervensi pada kantong kemiskinan pesisir Jakarta Utara dan penataan kawasan padat perkotaan.',
    pillarDetails: {
      pendidikan: {
        heroValue: '92,1%',
        heroLabel: 'Revitalisasi Sarana Satdik',
        metric1: { label: 'Realisasi Satdik', value: '820 / 890 satdik' },
        metric2: { label: 'Akses Digital', value: '100% Ruang Kelas Digital' },
        keterangan: 'Fasilitasi beasiswa KJP Plus dan peningkatan standar sarpras net-zero.',
      },
      kesehatan: {
        heroValue: '92,4%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Peserta Terlayani', value: '9,2 Juta Jiwa' },
        metric2: { label: 'Skrining TB Aktif', value: 'Kampung Nelayan & Rusun' },
        keterangan: 'Integrasi layanan primer puskesmas kelurahan 24 jam.',
      },
      bencana: {
        heroValue: '97,0%',
        heroLabel: 'Pengendalian Banjir & Rob',
        metric1: { label: 'Tanggul NCICD', value: '12,5 Km Terbangun' },
        metric2: { label: 'Rumah Pompa', value: '540 Pompa Siaga Penuh' },
        keterangan: 'Pengerukan waduk retensi dan normalisasi saluran primer perkotaan.',
      },
      kemiskinan: {
        heroValue: '4,44%',
        heroLabel: 'Tingkat Kemiskinan Terkini',
        metric1: { label: 'Kemiskinan Ekstrem', value: '0,08%' },
        metric2: { label: 'Fokus Intervensi', value: 'Kantong Pesisir Kalibaru' },
        keterangan: 'Bantuan sosial terpadu lansia rentan dan penataan kampung deret.',
      },
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik: 820 / 890 satdik (92,1%) · Digital 100%',
      kesehatan: 'CKG Terealisasi: 9,2 Juta Jiwa (92,4%) · Skrining TB aktif',
      bencana: 'Mitigasi Banjir Rob Pesisir & Penguatan Tanggul NCICD',
      kemiskinan: 'Intervensi kantong padat pesisir & lansia/disabilitas rentan',
    },
    catatanStrategis:
      'Penajaman sasaran intervensi pada kantong kemiskinan pesisir Jakarta Utara dan penataan kawasan padat Johar Baru.',
  },

  // 32 - Jawa Barat (Detail hingga Desa)
  {
    id: 'jawa-barat',
    kodeBps: '32',
    name: 'Jawa Barat',
    level: 'provinsi',
    lat: -6.9175,
    lng: 107.6191,
    zoom: 8,
    boundary: [
      [-5.92, 106.98],
      [-6.20, 107.50],
      [-6.25, 108.75],
      [-6.85, 108.80],
      [-7.75, 108.65],
      [-7.82, 108.15],
      [-7.65, 107.40],
      [-7.25, 106.40],
      [-6.75, 106.35],
      [-6.05, 106.65],
      [-5.92, 106.98],
    ],
    tingkatKemiskinan: '7,46%',
    kemiskinanEkstrem: '0,79%',
    imm: '0,58',
    isPrioritas: true,
    kategoriWilayah: 'Wilayah Prioritas Percepatan Pembangunan',
    ringkasanStrategis:
      'Percepatan penyelesaian huntap pascabencana di Cianjur dan pengentasan kantong kemiskinan perdesaan Jawa Barat Selatan.',
    pillarDetails: {
      pendidikan: {
        heroValue: '52,2%',
        heroLabel: 'Revitalisasi Sarana Satdik',
        metric1: { label: 'Satdik Terealisasi', value: '5.120 / 9.800 satdik' },
        metric2: { label: 'Sekolah Unggul', value: '3 SUG & 8 SNT Terpadu' },
        keterangan: 'Rehabilitasi ruang kelas tahan gempa pada jalur sesar aktif Cugenang.',
      },
      kesehatan: {
        heroValue: '80,6%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Peserta Terlayani', value: '28,4 Juta Jiwa' },
        metric2: { label: 'Kasus TB Terlacak', value: '78.412 Kasus' },
        keterangan: 'Penguatan puskesmas pembantu dengan layanan trauma healing anak.',
      },
      bencana: {
        heroValue: '4,3%',
        heroLabel: 'Penyelesaian Huntap Pascagempa',
        metric1: { label: 'Huntap Terbangun', value: '1.707 dari 39.501 unit' },
        metric2: { label: 'Huntara Aktif', value: '20.267 Unit Siap Huni' },
        keterangan: 'RTM Satgas PRRP untuk penyelesaian status lahan dan stimulan tahap IV.',
      },
      kemiskinan: {
        heroValue: '7,46%',
        heroLabel: 'Tingkat Kemiskinan Terkini',
        metric1: { label: 'Kemiskinan Ekstrem', value: '0,79%' },
        metric2: { label: 'Lokus Sasaran', value: 'Jabar Selatan (Cianjur, Garut)' },
        keterangan: 'Pemberdayaan klaster pertanian hortikultura sayuran pascabencana.',
      },
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik: 5.120 / 9.800 satdik (52,2%) · 3 SUG & 8 SNT',
      kesehatan: 'CKG Terealisasi: 28,4 Juta Jiwa (80,6%) · Penemuan TB: 78.412',
      bencana: 'Huntap: 1.707 unit (4,3%) · Huntara: 20.267 unit (99%)',
      kemiskinan: 'Akselerasi wilayah Jabar Selatan (Cianjur, Garut, Tasikmalaya)',
    },
    catatanStrategis:
      'Percepatan penyelesaian huntap pascabencana di Cianjur dan pengentasan kantong kemiskinan perdesaan Jawa Barat Selatan.',
  },

  // 33 - Jawa Tengah
  {
    id: 'jawa-tengah',
    kodeBps: '33',
    name: 'Jawa Tengah',
    level: 'provinsi',
    lat: -7.1509,
    lng: 110.1402,
    zoom: 8,
    boundary: [
      [-6.40, 108.80],
      [-6.45, 111.15],
      [-6.65, 111.60],
      [-7.15, 111.55],
      [-7.75, 111.20],
      [-8.20, 110.85],
      [-7.75, 109.00],
      [-7.30, 108.75],
      [-6.40, 108.80],
    ],
    tingkatKemiskinan: '10,47%',
    kemiskinanEkstrem: '1,11%',
    imm: '0,57',
    isPrioritas: true,
    kategoriWilayah: 'Wilayah Prioritas Percepatan',
    ringkasanStrategis:
      'Akselerasi integrasi bantuan sosial dan penguatan sanitasi di 15 kabupaten lokus zona merah kemiskinan.',
    pillarDetails: {
      pendidikan: {
        heroValue: '49,0%',
        heroLabel: 'Revitalisasi Satdik',
        metric1: { label: 'Satdik Terealisasi', value: '4.210 / 8.600 satdik' },
        metric2: { label: 'Pendidikan Vokasi', value: '112 SMK Kejuruan Khusus' },
        keterangan: 'Rehabilitasi gedung SD/SMP di kawasan rawan rob dan longsor.',
      },
      kesehatan: {
        heroValue: '79,4%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Peserta Terlayani', value: '22,8 Juta Jiwa' },
        metric2: { label: 'Skrining Stunting', value: 'Cakupan 91,2% Posyandu' },
        keterangan: 'Intervensi serentak pencegahan stunting pada balita keluarga miskin.',
      },
      bencana: {
        heroValue: '89,0%',
        heroLabel: 'Mitigasi Bencana Rob Pantura',
        metric1: { label: 'Tanggul Laut Demak', value: 'Tahap Konstruksi 68%' },
        metric2: { label: 'Mitigasi Longsor', value: '38 Titik Banjarnegara' },
        keterangan: 'Pembangunan polder dan rumah pompa di pesisir Demak, Pekalongan, Semarang.',
      },
      kemiskinan: {
        heroValue: '10,47%',
        heroLabel: 'Tingkat Kemiskinan',
        metric1: { label: 'Kemiskinan Ekstrem', value: '1,11%' },
        metric2: { label: 'Zona Merah', value: '15 Kabupaten Prioritas' },
        keterangan: 'Padat karya tunai dan perbaikan Rumah Tidak Layak Huni (RTLH).',
      },
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik: 4.210 / 8.600 satdik (49,0%)',
      kesehatan: 'CKG Terealisasi: 22,8 Juta Jiwa (79,4%)',
      bencana: 'Penanganan Rob Pantura Demak & Bencana Longsor',
      kemiskinan: 'Fokus penurunan angka kemiskinan 15 kabupaten zona merah',
    },
    catatanStrategis:
      'Akselerasi integrasi bantuan sosial dan penguatan sanitasi di 15 kabupaten lokus prioritas.',
  },

  // 34 - DI Yogyakarta
  {
    id: 'di-yogyakarta',
    kodeBps: '34',
    name: 'DI Yogyakarta',
    level: 'provinsi',
    lat: -7.8753,
    lng: 110.4262,
    zoom: 9,
    boundary: [
      [-7.55, 110.25],
      [-7.70, 110.55],
      [-8.05, 110.80],
      [-8.20, 110.70],
      [-8.00, 110.15],
      [-7.75, 110.10],
      [-7.55, 110.25],
    ],
    tingkatKemiskinan: '11,04%',
    kemiskinanEkstrem: '0,92%',
    imm: '0,68',
    isPrioritas: false,
    kategoriWilayah: 'Wilayah Reguler Pengawalan',
    ringkasanStrategis:
      'Pemberdayaan sosial berbasis kebudayaan dan penanganan kantong kemiskinan Gunungkidul dan Kulon Progo.',
    pillarDetails: {
      pendidikan: {
        heroValue: '72,1%',
        heroLabel: 'Revitalisasi Satdik',
        metric1: { label: 'Satdik Terealisasi', value: '980 / 1.360 satdik' },
        metric2: { label: 'Indeks Pendidikan', value: '0,76 (Tertinggi Jawa)' },
        keterangan: 'Fasilitas pembelajaran ramah disabilitas dan penguatan literasi desa.',
      },
      kesehatan: {
        heroValue: '86,5%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Peserta Terlayani', value: '3,1 Juta Jiwa' },
        metric2: { label: 'Integrasi ILP', value: '96% Puskesmas Terpadu' },
        keterangan: 'Pelayanan terpadu penyakit tidak menular bagi populasi lansia.',
      },
      bencana: {
        heroValue: '95,0%',
        heroLabel: 'Sistem Kesiapsiagaan Merapi',
        metric1: { label: 'Desa Tangguh Bencana', value: '142 Desa Mandiri' },
        metric2: { label: 'Jalur Evakuasi', value: 'Kondisi Mantap 92%' },
        keterangan: 'Pemantauan kubah lava Merapi dan mitigasi gempa sesar Opak.',
      },
      kemiskinan: {
        heroValue: '11,04%',
        heroLabel: 'Tingkat Kemiskinan',
        metric1: { label: 'Kemiskinan Ekstrem', value: '0,92%' },
        metric2: { label: 'Fokus Lokus', value: 'Gunungkidul & Kulon Progo' },
        keterangan: 'Pemberdayaan desa wisata dan bantuan sarana air bersih karst.',
      },
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik: 980 / 1.360 satdik (72,1%)',
      kesehatan: 'CKG Terealisasi: 3,1 Juta Jiwa (86,5%)',
      bencana: 'Sistem Kesiapsiagaan Erupsi Merapi & Gempa Opak',
      kemiskinan: 'Kemiskinan: 11,04% · Ekstrem: 0,92%',
    },
    catatanStrategis:
      'Penguatan ketahanan air perdesaan kawasan karst Gunungkidul dan integrasi bansos keistimewaan.',
  },

  // 35 - Jawa Timur
  {
    id: 'jawa-timur',
    kodeBps: '35',
    name: 'Jawa Timur',
    level: 'provinsi',
    lat: -7.5360,
    lng: 112.2384,
    zoom: 8,
    boundary: [
      [-6.75, 111.60],
      [-6.85, 114.40],
      [-7.85, 114.60],
      [-8.75, 114.40],
      [-8.50, 111.50],
      [-8.25, 111.00],
      [-7.20, 111.45],
      [-6.75, 111.60],
    ],
    tingkatKemiskinan: '9,79%',
    kemiskinanEkstrem: '0,98%',
    imm: '0,58',
    isPrioritas: false,
    kategoriWilayah: 'Wilayah Reguler Pengawalan',
    ringkasanStrategis:
      'Penguatan jangkauan layanan dasar di kepulauan Madura dan kawasan Tapal Kuda.',
    pillarDetails: {
      pendidikan: {
        heroValue: '53,1%',
        heroLabel: 'Revitalisasi Satdik',
        metric1: { label: 'Satdik Terealisasi', value: '4.890 / 9.200 satdik' },
        metric2: { label: 'Vokasi Pesantren', value: '180 Balai Latihan Kerja' },
        keterangan: 'Revitalisasi sarpras pendidikan madrasah dan pondok pesantren.',
      },
      kesehatan: {
        heroValue: '83,5%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Peserta Terlayani', value: '24,1 Juta Jiwa' },
        metric2: { label: 'Penanganan TB', value: '71.200 Kasus Daerah Mataraman' },
        keterangan: 'Peningkatan faskes rujukan di kepulauan Sumenep & Bawean.',
      },
      bencana: {
        heroValue: '92,0%',
        heroLabel: 'Kesiapsiagaan Vulkanik Semeru',
        metric1: { label: 'Hunian Tetap Semeru', value: '1.951 Unit Ditempati' },
        metric2: { label: 'Early Warning Erupsi', value: '12 Titik Sensor' },
        keterangan: 'Pembersihan endapan lahar dingin sungai Besuk Kobokan.',
      },
      kemiskinan: {
        heroValue: '9,79%',
        heroLabel: 'Tingkat Kemiskinan',
        metric1: { label: 'Kemiskinan Ekstrem', value: '0,98%' },
        metric2: { label: 'Kantong Utama', value: 'Madura & Tapal Kuda' },
        keterangan: 'Graduasi kemiskinan ekstrem melalui bansos modal usaha kelompok tani.',
      },
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik: 4.890 / 9.200 satdik (53,1%)',
      kesehatan: 'CKG Terealisasi: 24,1 Juta Jiwa (83,5%)',
      bencana: 'Mitigasi Bencana Erupsi Semeru & Gempa Pesisir Selatan',
      kemiskinan: 'Intervensi kantong kemiskinan Madura & Tapal Kuda',
    },
    catatanStrategis:
      'Penguatan jangkauan layanan dasar di kepulauan Madura dan kawasan Tapal Kuda.',
  },

  // 36 - Banten
  {
    id: 'banten',
    kodeBps: '36',
    name: 'Banten',
    level: 'provinsi',
    lat: -6.4058,
    lng: 106.0640,
    zoom: 8,
    boundary: [
      [-5.80, 106.00],
      [-5.95, 106.40],
      [-6.35, 106.70],
      [-6.95, 106.35],
      [-7.00, 105.80],
      [-6.75, 105.20],
      [-6.10, 105.80],
      [-5.80, 106.00],
    ],
    tingkatKemiskinan: '5,84%',
    kemiskinanEkstrem: '0,43%',
    imm: '0,59',
    isPrioritas: false,
    kategoriWilayah: 'Wilayah Reguler Pengawalan',
    ringkasanStrategis:
      'Penuntasan disparitas kesejahteraan antara Banten Utara (industri) dan Banten Selatan (Lebak & Pandeglang).',
    pillarDetails: {
      pendidikan: {
        heroValue: '50,4%',
        heroLabel: 'Revitalisasi Satdik',
        metric1: { label: 'Satdik Terealisasi', value: '1.820 / 3.610 satdik' },
        metric2: { label: 'Sekolah Pedalaman', value: '280 Satdik Adat Baduy' },
        keterangan: 'Perbaikan ruang kelas rawan ambruk di Lebak Selatan.',
      },
      kesehatan: {
        heroValue: '78,9%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Peserta Terlayani', value: '7,1 Juta Jiwa' },
        metric2: { label: 'Posyandu Terpadu', value: '88,0% Aktif Skrining' },
        keterangan: 'Peningkatan gizi balita dan imunisasi dasar di perdesaan Pandeglang.',
      },
      bencana: {
        heroValue: '91,0%',
        heroLabel: 'Mitigasi Tsunami Selat Sunda',
        metric1: { label: 'Tsunami Early Warning', value: '11 Sirine Labuan-Anyer' },
        metric2: { label: 'Zona Bahaya', value: 'Pemetaan Jalur Evakuasi Ujung Kulon' },
        keterangan: 'Latihan kontingensi berkala penanganan potensi tsunami megathrust.',
      },
      kemiskinan: {
        heroValue: '5,84%',
        heroLabel: 'Tingkat Kemiskinan',
        metric1: { label: 'Kemiskinan Ekstrem', value: '0,43%' },
        metric2: { label: 'Disparitas Wilayah', value: 'Lebak 8,68% · Pandeglang 9,21%' },
        keterangan: 'Akselerasi jalan desa poros selatan dan bantuan alat tangkap nelayan.',
      },
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik: 1.820 / 3.610 satdik (50,4%)',
      kesehatan: 'CKG Terealisasi: 7,1 Juta Jiwa (78,9%)',
      bencana: 'Mitigasi Tsunami Selat Sunda & Bencana Banjir Lebak',
      kemiskinan: 'Kemiskinan: 5,84% · Disparitas Lebak & Pandeglang',
    },
    catatanStrategis:
      'Akselerasi pembangunan infrastruktur dasar dan sanitasi di wilayah Lebak dan Pandeglang.',
  },

  // 51 - Bali
  {
    id: 'bali',
    kodeBps: '51',
    name: 'Bali',
    level: 'provinsi',
    lat: -8.4095,
    lng: 115.1889,
    zoom: 9,
    boundary: [
      [-8.10, 114.45],
      [-8.10, 115.45],
      [-8.35, 115.70],
      [-8.85, 115.20],
      [-8.60, 114.95],
      [-8.25, 114.45],
      [-8.10, 114.45],
    ],
    tingkatKemiskinan: '4,00%',
    kemiskinanEkstrem: '0,05%',
    imm: '0,69',
    isPrioritas: false,
    kategoriWilayah: 'Wilayah Reguler Pengawalan',
    ringkasanStrategis:
      'Penguatan jaring pengaman sosial pekerja pariwisata dan penanganan kantong kemiskinan Karangasem.',
    pillarDetails: {
      pendidikan: {
        heroValue: '75,0%',
        heroLabel: 'Revitalisasi Satdik',
        metric1: { label: 'Satdik Terealisasi', value: '1.020 / 1.360 satdik' },
        metric2: { label: 'Digitalisasi', value: '96% Sekolah Ramah Digital' },
        keterangan: 'Revitalisasi SMK Pariwisata dan kebudayaan bertaraf internasional.',
      },
      kesehatan: {
        heroValue: '90,2%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Peserta Terlayani', value: '3,8 Juta Jiwa' },
        metric2: { label: 'UHC Kesehatan', value: 'Cakupan 99,1% Penduduk' },
        keterangan: 'Skrining kesehatan terpadu berbasis banjar adat.',
      },
      bencana: {
        heroValue: '96,0%',
        heroLabel: 'Kesiapsiagaan Bencana Wisata',
        metric1: { label: 'Mitigasi Gunung Agung', value: 'Sistem Sensor EWS Penuh' },
        metric2: { label: 'Sertifikasi Kebencanaan', value: '240 Hotel Tangguh' },
        keterangan: 'Simulasi evakuasi gempa dan tsunami di kawasan destinasi wisata utama.',
      },
      kemiskinan: {
        heroValue: '4,00%',
        heroLabel: 'Tingkat Kemiskinan Terendah',
        metric1: { label: 'Kemiskinan Ekstrem', value: '0,05%' },
        metric2: { label: 'Lokus Khusus', value: 'Kubu & Tianyar Karangasem' },
        keterangan: 'Pemberdayaan kerajinan tenun dan distribusi bantuan pangan lokal.',
      },
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik: 1.020 / 1.360 satdik (75,0%)',
      kesehatan: 'CKG Terealisasi: 3,8 Juta Jiwa (90,2%) · UHC 99%',
      bencana: 'Kesiapsiagaan Erupsi Gunung Agung & Gempa Wisata',
      kemiskinan: 'Kemiskinan: 4,00% · Ekstrem: 0,05%',
    },
    catatanStrategis:
      'Penuntasan kantong kemiskinan perdesaan kering di Karangasem dan Buleleng Timur.',
  },

  // 52 - Nusa Tenggara Barat
  {
    id: 'nusa-tenggara-barat',
    kodeBps: '52',
    name: 'Nusa Tenggara Barat',
    level: 'provinsi',
    lat: -8.6529,
    lng: 117.3616,
    zoom: 8,
    boundary: [
      [-8.20, 115.80],
      [-8.25, 119.20],
      [-9.00, 119.00],
      [-8.95, 116.00],
      [-8.20, 115.80],
    ],
    tingkatKemiskinan: '12,91%',
    kemiskinanEkstrem: '1,56%',
    imm: '0,53',
    isPrioritas: true,
    kategoriWilayah: 'Wilayah Prioritas Percepatan',
    ringkasanStrategis:
      'Percepatan penurunan stunting dan mitigasi kekeringan lahan pertanian Sumbawa.',
    pillarDetails: {
      pendidikan: {
        heroValue: '44,0%',
        heroLabel: 'Revitalisasi Satdik',
        metric1: { label: 'Satdik Terealisasi', value: '1.240 / 2.820 satdik' },
        metric2: { label: 'Sekolah Tahan Gempa', value: '620 Satdik Rekonstruksi' },
        keterangan: 'Pemenuhan sarana belajar di wilayah kepulauan terluar Sumbawa.',
      },
      kesehatan: {
        heroValue: '73,2%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Peserta Terlayani', value: '3,2 Juta Jiwa' },
        metric2: { label: 'Stunting Terpadu', value: 'Penurunan Prevalensi 18,2%' },
        keterangan: 'Akselerasi penimbangan balita dan penyuluhan sanitasi jamban keluarga.',
      },
      bencana: {
        heroValue: '92,0%',
        heroLabel: 'Mitigasi Gempa & Kekeringan',
        metric1: { label: 'Sumur Bor Pertanian', value: '185 Titik Aktif' },
        metric2: { label: 'Bendungan Beroperasi', value: '6 Bendungan Pengendali' },
        keterangan: 'Optimalisasi distribusi air Bendungan Bintang Bano dan Meninting.',
      },
      kemiskinan: {
        heroValue: '12,91%',
        heroLabel: 'Tingkat Kemiskinan',
        metric1: { label: 'Kemiskinan Ekstrem', value: '1,56%' },
        metric2: { label: 'Lokus Fokus', value: 'Lombok Timur & Bima' },
        keterangan: 'Bantuan alat pakan ternak dan subsidi benih jagung tahan kekeringan.',
      },
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik: 1.240 / 2.820 satdik (44,0%)',
      kesehatan: 'CKG Terealisasi: 3,2 Juta Jiwa (73,2%)',
      bencana: 'Mitigasi Gempa Rinjani & Kekeringan Sumbawa',
      kemiskinan: 'Kemiskinan: 12,91% · Ekstrem: 1,56%',
    },
    catatanStrategis:
      'Percepatan penyediaan air minum perpipaan dan sanitasi layak di kantong kemiskinan Lombok Timur.',
  },

  // 53 - Nusa Tenggara Timur
  {
    id: 'nusa-tenggara-timur',
    kodeBps: '53',
    name: 'Nusa Tenggara Timur',
    level: 'provinsi',
    lat: -8.6573,
    lng: 121.0793,
    zoom: 7,
    boundary: [
      [-8.05, 119.80],
      [-8.20, 125.20],
      [-9.35, 125.10],
      [-10.45, 123.80],
      [-10.95, 122.90],
      [-9.85, 119.00],
      [-8.55, 119.20],
      [-8.05, 119.80],
    ],
    tingkatKemiskinan: '19,96%',
    kemiskinanEkstrem: '3,93%',
    imm: '0,48',
    isPrioritas: true,
    kategoriWilayah: 'Wilayah Tertinggal & Prioritas Khusus',
    ringkasanStrategis:
      'Fokus intervensi komprehensif stunting, ketersediaan air bersih sekolah, dan huntap Lewotobi.',
    pillarDetails: {
      pendidikan: {
        heroValue: '26,7%',
        heroLabel: 'Revitalisasi Satdik',
        metric1: { label: 'Satdik Terealisasi', value: '1.120 / 4.200 satdik' },
        metric2: { label: 'Kebutuhan Air Bersih', value: '1.840 Satdik Belum Layak' },
        keterangan: 'Pembangunan tangki air hujan dan ruang kelas permanen kepulauan.',
      },
      kesehatan: {
        heroValue: '52,4%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Peserta Terlayani', value: '2,1 Juta Jiwa' },
        metric2: { label: 'Lokus Stunting', value: 'Prioritas Tertinggi Nasional' },
        keterangan: 'Penyaluran makanan tambahan lokal berbahan kelor dan protein ikan.',
      },
      bencana: {
        heroValue: '48,0%',
        heroLabel: 'Pemulihan Erupsi Lewotobi',
        metric1: { label: 'Huntap Direncanakan', value: '2.140 Unit Relokasi' },
        metric2: { label: 'Mitigasi Kekeringan', value: 'Pengiriman Tangki Air 24 Kab' },
        keterangan: 'Percepatan relokasi warga terdampak bahaya erupsi Gunung Lewotobi Laki-Laki.',
      },
      kemiskinan: {
        heroValue: '19,96%',
        heroLabel: 'Tingkat Kemiskinan Kritis',
        metric1: { label: 'Kemiskinan Ekstrem', value: '3,93%' },
        metric2: { label: 'Wilayah Kantong', value: 'Timor Tengah Selatan, Sumba' },
        keterangan: 'Konvergensi lintas K/L untuk pemenuhan hak dasar pangan dan air minum.',
      },
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik: 1.120 / 4.200 satdik (26,7%) · Sarana air bersih',
      kesehatan: 'CKG: 2,1 Juta Jiwa (52,4%) · Prioritas penurunan stunting',
      bencana: 'Pemulihan Erupsi Lewotobi & Mitigasi Kekeringan Ekstrem',
      kemiskinan: 'Kemiskinan: 19,96% · Ekstrem: 3,93%',
    },
    catatanStrategis:
      'Fokus intervensi komprehensif stunting, ketersediaan air bersih sekolah, dan huntap Lewotobi.',
  },

  // 61 - Kalimantan Barat
  {
    id: 'kalimantan-barat',
    kodeBps: '61',
    name: 'Kalimantan Barat',
    level: 'provinsi',
    lat: -0.1322,
    lng: 111.0969,
    zoom: 7,
    boundary: [
      [2.10, 109.10],
      [1.80, 111.50],
      [0.90, 114.20],
      [-1.40, 113.80],
      [-3.00, 110.80],
      [-2.40, 109.80],
      [-0.50, 108.90],
      [1.10, 108.80],
      [2.10, 109.10],
    ],
    tingkatKemiskinan: '6,71%',
    kemiskinanEkstrem: '0,61%',
    imm: '0,55',
    isPrioritas: false,
    kategoriWilayah: 'Wilayah Perbatasan & Reguler',
    ringkasanStrategis:
      'Penguatan fasilitas dasar kawasan Pos Lintas Batas Negara (PLBN) dan desa pedalaman Kapuas Hulu.',
    pillarDetails: {
      pendidikan: {
        heroValue: '46,5%',
        heroLabel: 'Revitalisasi Satdik',
        metric1: { label: 'Satdik Terealisasi', value: '2.140 / 4.600 satdik' },
        metric2: { label: 'Sekolah Perbatasan', value: '148 Satdik Garis Batas' },
        keterangan: 'Penyediaan asrama siswa pedalaman dan solar panel tenaga surya.',
      },
      kesehatan: {
        heroValue: '75,3%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Peserta Terlayani', value: '3,7 Juta Jiwa' },
        metric2: { label: 'Puskesmas Perbatasan', value: 'Penguatan 16 Faskes PLBN' },
        keterangan: 'Skrining malaria dan penguatan tenaga medis terbangun di pedalaman.',
      },
      bencana: {
        heroValue: '91,0%',
        heroLabel: 'Mitigasi Bencana Asap Karhutla',
        metric1: { label: 'Kanal Gambut', value: '64 Penyekat Terbina' },
        metric2: { label: 'Banjir Sungai Kapuas', value: 'Sistem Peringatan Dini DAS' },
        keterangan: 'Pengendalian debit banjir luapan DAS Kapuas dan satgas darat karhutla.',
      },
      kemiskinan: {
        heroValue: '6,71%',
        heroLabel: 'Tingkat Kemiskinan',
        metric1: { label: 'Kemiskinan Ekstrem', value: '0,61%' },
        metric2: { label: 'Lokus Fokus', value: 'Melawi & Kapuas Hulu' },
        keterangan: 'Pemberdayaan komoditas karet rakyat dan sertifikasi tanah transmigrasi.',
      },
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik: 2.140 / 4.600 satdik (46,5%)',
      kesehatan: 'CKG Terealisasi: 3,7 Juta Jiwa (75,3%)',
      bencana: 'Mitigasi Banjir DAS Kapuas & Pengendalian Karhutla',
      kemiskinan: 'Kemiskinan: 6,71% · Ekstrem: 0,61%',
    },
    catatanStrategis:
      'Percepatan akses air bersih dan listrik sekolah di wilayah beranda perbatasan Entikong dan Badau.',
  },

  // 62 - Kalimantan Tengah
  {
    id: 'kalimantan-tengah',
    kodeBps: '62',
    name: 'Kalimantan Tengah',
    level: 'provinsi',
    lat: -1.5000,
    lng: 113.5000,
    zoom: 7,
    boundary: [
      [0.80, 113.80],
      [-0.40, 115.80],
      [-2.40, 115.50],
      [-3.50, 114.20],
      [-3.30, 111.50],
      [-1.50, 111.00],
      [0.80, 113.80],
    ],
    tingkatKemiskinan: '5,11%',
    kemiskinanEkstrem: '0,38%',
    imm: '0,58',
    isPrioritas: false,
    kategoriWilayah: 'Wilayah Reguler Pengawalan',
    ringkasanStrategis:
      'Pengawalan layanan dasar kawasan lumbung pangan dan restorasi hidrologis gambut.',
    pillarDetails: {
      pendidikan: {
        heroValue: '55,0%',
        heroLabel: 'Revitalisasi Satdik',
        metric1: { label: 'Satdik Terealisasi', value: '1.420 / 2.580 satdik' },
        metric2: { label: 'Sekolah Pelosok', value: '110 Ruang Kelas Baru' },
        keterangan: 'Perbaikan sarpras sekolah di bantaran sungai Barito dan Kahayan.',
      },
      kesehatan: {
        heroValue: '78,4%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Peserta Terlayani', value: '2,1 Juta Jiwa' },
        metric2: { label: 'Puskesmas Keliling', value: '38 Speedboat Medis Aktif' },
        keterangan: 'Pemeriksaan rutin kesehatan anak sekolah di pedalaman.',
      },
      bencana: {
        heroValue: '95,0%',
        heroLabel: 'Sistem Pemantauan Gambut',
        metric1: { label: 'Tinggi Muka Air', value: 'Realtime Sensor 48 Titik' },
        metric2: { label: 'Regu Pemadam', value: '280 Posko Desa Peduli Gambut' },
        keterangan: 'Pembasahan lahan gambut eks-PLG Pulang Pisau dan Kapuas.',
      },
      kemiskinan: {
        heroValue: '5,11%',
        heroLabel: 'Tingkat Kemiskinan',
        metric1: { label: 'Kemiskinan Ekstrem', value: '0,38%' },
        metric2: { label: 'Kantong Wilayah', value: 'Hulu Barito & Seruyan' },
        keterangan: 'Integrasi jaminan sosial bagi buruh kebun dan petani rotan.',
      },
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik: 1.420 / 2.580 satdik (55,0%)',
      kesehatan: 'CKG Terealisasi: 2,1 Juta Jiwa (78,4%)',
      bencana: 'Restorasi Gambut Eks-PLG & Penanganan Karhutla',
      kemiskinan: 'Kemiskinan: 5,11% · Ekstrem: 0,38%',
    },
    catatanStrategis:
      'Penguatan akses transportasi sungai bagi pelayanan kesehatan dan logistik pangan.',
  },

  // 63 - Kalimantan Selatan
  {
    id: 'kalimantan-selatan',
    kodeBps: '63',
    name: 'Kalimantan Selatan',
    level: 'provinsi',
    lat: -2.9935,
    lng: 115.3400,
    zoom: 8,
    boundary: [
      [-1.40, 115.50],
      [-2.10, 116.50],
      [-3.80, 116.30],
      [-4.20, 114.80],
      [-3.30, 114.40],
      [-2.10, 115.00],
      [-1.40, 115.50],
    ],
    tingkatKemiskinan: '4,29%',
    kemiskinanEkstrem: '0,14%',
    imm: '0,61',
    isPrioritas: false,
    kategoriWilayah: 'Wilayah Reguler Pengawalan',
    ringkasanStrategis:
      'Pengendalian banjir DAS Barito dan penguatan layanan dasar permukiman bantaran sungai.',
    pillarDetails: {
      pendidikan: {
        heroValue: '61,0%',
        heroLabel: 'Revitalisasi Satdik',
        metric1: { label: 'Satdik Terealisasi', value: '1.680 / 2.750 satdik' },
        metric2: { label: 'Satdik Ramah Air', value: 'SD Panggung Tahan Banjir' },
        keterangan: 'Rehabilitasi ruang kelas berkontur rawa pasang surut.',
      },
      kesehatan: {
        heroValue: '84,0%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Peserta Terlayani', value: '3,2 Juta Jiwa' },
        metric2: { label: 'Pemberantasan DBD', value: 'Pengendalian Vektor Masif' },
        keterangan: 'Pemeriksaan sanitasi air bersih polder Alabio dan Martapura.',
      },
      bencana: {
        heroValue: '93,0%',
        heroLabel: 'Mitigasi Banjir DAS Barito',
        metric1: { label: 'Kapasitas Waduk Riam Kanan', value: 'Optimalisasi Debit' },
        metric2: { label: 'Tanggul Banjir', value: 'Penguatan 24 Titik Kritis' },
        keterangan: 'Normalisasi alur sungai Martapura dan rehabilitasi tanggul jebol.',
      },
      kemiskinan: {
        heroValue: '4,29%',
        heroLabel: 'Tingkat Kemiskinan',
        metric1: { label: 'Kemiskinan Ekstrem', value: '0,14%' },
        metric2: { label: 'Fokus Wilayah', value: 'Hulu Sungai Utara' },
        keterangan: 'Dukungan usaha mikro pengolahan ikan air tawar dan anyaman purun.',
      },
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik: 1.680 / 2.750 satdik (61,0%)',
      kesehatan: 'CKG Terealisasi: 3,2 Juta Jiwa (84,0%)',
      bencana: 'Pengendalian Banjir DAS Barito & Normalisasi Martapura',
      kemiskinan: 'Kemiskinan: 4,29% · Ekstrem: 0,14%',
    },
    catatanStrategis:
      'Peningkatan sanitasi jamban apung dan pemenuhan air bersih layak di pemukiman rawa.',
  },

  // 64 - Kalimantan Timur
  {
    id: 'kalimantan-timur',
    kodeBps: '64',
    name: 'Kalimantan Timur',
    level: 'provinsi',
    lat: 0.5387,
    lng: 116.4194,
    zoom: 7,
    boundary: [
      [2.50, 117.50],
      [1.80, 118.80],
      [0.80, 118.00],
      [-1.40, 117.20],
      [-2.40, 116.20],
      [-1.20, 115.50],
      [1.00, 114.50],
      [2.50, 117.50],
    ],
    tingkatKemiskinan: '5,78%',
    kemiskinanEkstrem: '0,42%',
    imm: '0,65',
    isPrioritas: false,
    kategoriWilayah: 'Wilayah Penyangga IKN & Reguler',
    ringkasanStrategis:
      'Harmonisasi standar pelayanan publik dan infrastruktur sosial kawasan penyangga IKN Nusantara.',
    pillarDetails: {
      pendidikan: {
        heroValue: '68,2%',
        heroLabel: 'Revitalisasi Satdik',
        metric1: { label: 'Satdik Terealisasi', value: '1.580 / 2.310 satdik' },
        metric2: { label: 'Sekolah Model IKN', value: '24 Satdik Standar Nasional' },
        keterangan: 'Peningkatan kompetensi guru dan sarana vokasi digital kawasan penyangga.',
      },
      kesehatan: {
        heroValue: '85,1%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Peserta Terlayani', value: '3,1 Juta Jiwa' },
        metric2: { label: 'Faskes Rujukan', value: 'RS Internasional Siap Operasi' },
        keterangan: 'Skrining kesehatan berkala bagi ribuan pekerja konstruksi IKN.',
      },
      bencana: {
        heroValue: '96,0%',
        heroLabel: 'Proteksi Kebakaran Hutan & Lahan',
        metric1: { label: 'Koridor Hijau Bukit Soeharto', value: 'Pemantauan Satelit' },
        metric2: { label: 'Bendungan Sepaku Semoi', value: 'Pengendali Banjir 100%' },
        keterangan: 'Perlindungan tangkapan air dan pencegahan abrasi pesisir Teluk Balikpapan.',
      },
      kemiskinan: {
        heroValue: '5,78%',
        heroLabel: 'Tingkat Kemiskinan',
        metric1: { label: 'Kemiskinan Ekstrem', value: '0,42%' },
        metric2: { label: 'Lokus Sasaran', value: 'Kutai Barat & Mahakam Ulu' },
        keterangan: 'Penyaluran logistik pangan murah dan pemberdayaan ekonomi masyarakat adat Dayak.',
      },
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik: 1.580 / 2.310 satdik (68,2%)',
      kesehatan: 'CKG Terealisasi: 3,1 Juta Jiwa (85,1%)',
      bencana: 'Proteksi Hutan Lindung Bukit Soeharto & Pengendali Banjir Sepaku',
      kemiskinan: 'Kemiskinan: 5,78% · Ekstrem: 0,42%',
    },
    catatanStrategis:
      'Peningkatan kualitas sekolah perdesaan di Mahakam Ulu agar tidak tertinggal dari kawasan inti IKN.',
  },

    // 65 - Kalimantan Utara
  {
  id: 'kalimantan-utara',
  kodeBps: '65',
  name: 'Kalimantan Utara',
  level: 'provinsi',
  lat: 3.0731,
  lng: 116.0414,
  zoom: 7,
  boundary: [
    [
      4.4,
      115.5
    ],
    [
      4.3,
      117.8
    ],
    [
      2.5,
      118
    ],
    [
      1.5,
      115.5
    ],
    [
      3,
      114.8
    ],
    [
      4.4,
      115.5
    ]
  ],
  tingkatKemiskinan: '6,86%',
  kemiskinanEkstrem: '0,58%',
  imm: '0,59',
  isPrioritas: false,
  kategoriWilayah: 'Wilayah Reguler Pengawalan',
  ringkasanStrategis: 'Pengembangan kawasan industri hijau KIPI Tanah Kuning dan pemerataan sekolah perbatasan Krayan-Sebatik.',
  pillarDetails: {
    pendidikan: {
      heroValue: '52,4%',
      heroLabel: 'Revitalisasi Satdik',
      metric1: {
        label: 'Satdik Terealisasi',
        value: '480 / 915 satdik'
      },
      metric2: {
        label: 'Sekolah Perbatasan',
        value: '64 Satdik Krayan'
      },
      keterangan: 'Bantuan subsidi ongkos angkut udara material sekolah pedalaman.'
    },
    kesehatan: {
      heroValue: '80,1%',
      heroLabel: 'Cakupan Cek Kesehatan Gratis',
      metric1: {
        label: 'Peserta Terlayani',
        value: '570 Ribu Jiwa'
      },
      metric2: {
        label: 'Puskesmas 24 Jam',
        value: '55 Unit Perbatasan'
      },
      keterangan: 'Dokter terbang untuk wilayah terisolir Long Bawan dan Malinau pedalaman.'
    },
    bencana: {
      heroValue: '89,0%',
      heroLabel: 'Mitigasi Banjir Lintas Batas',
      metric1: {
        label: 'EWS Banjir Sembakung',
        value: '6 Sensor DAS'
      },
      metric2: {
        label: 'Posko Darurat',
        value: 'Nunukan & Tarakan Siaga'
      },
      keterangan: 'Kerjasama penanganan banjir kiriman DAS Sembakung.'
    },
    kemiskinan: {
      heroValue: '6,86%',
      heroLabel: 'Tingkat Kemiskinan',
      metric1: {
        label: 'Kemiskinan Ekstrem',
        value: '0,58%'
      },
      metric2: {
        label: 'Lokus Sasaran',
        value: 'Nunukan & Malinau Pedalaman'
      },
      keterangan: 'Pemberdayaan komoditas beras Adan Krayan dan rumput laut Nunukan.'
    }
  },
  pillars: {
    pendidikan: 'Revitalisasi Satdik: 480 / 915 satdik (52,4%)',
    kesehatan: 'CKG Terealisasi: 570 Ribu Jiwa (80,1%)',
    bencana: 'Mitigasi Banjir Kiriman Sungai Sembakung',
    kemiskinan: 'Kemiskinan: 6,86% · Ekstrem: 0,58%'
  },
  catatanStrategis: 'Akselerasi konektivitas jalan perbatasan dan logistik sembako di dataran tinggi Krayan.'
},

// 71 - Sulawesi Utara
  {
    id: 'sulawesi-utara',
    kodeBps: '71',
    name: 'Sulawesi Utara',
    level: 'provinsi',
    lat: 1.2500,
    lng: 124.8000,
    zoom: 8,
    boundary: [
      [1.00, 123.50],
      [1.80, 125.20],
      [4.50, 126.80],
      [5.50, 126.00],
      [2.50, 125.00],
      [0.60, 124.00],
      [1.00, 123.50],
    ],
    tingkatKemiskinan: '6,92%',
    kemiskinanEkstrem: '0,55%',
    imm: '0,64',
    isPrioritas: false,
    kategoriWilayah: 'Wilayah Reguler Pengawalan',
    ringkasanStrategis:
      'Pemulihan pascabencana erupsi Gunung Ruang dan peningkatan konektivitas pulau perbatasan Sangihe-Talaud.',
    pillarDetails: {
      pendidikan: {
        heroValue: '59,0%',
        heroLabel: 'Revitalisasi Satdik',
        metric1: { label: 'Satdik Terealisasi', value: '1.280 / 2.170 satdik' },
        metric2: { label: 'Sekolah Relokasi', value: 'Satdik Terdampak Erupsi Ruang' },
        keterangan: 'Penyelesaian gedung sekolah darurat pascaerupsi Tagulandang.',
      },
      kesehatan: {
        heroValue: '81,2%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Peserta Terlayani', value: '2,0 Juta Jiwa' },
        metric2: { label: 'Puskesmas Pulau', value: 'Ambulans Laut Beroperasi' },
        keterangan: 'Pemeriksaan rutin kesehatan paru dampak abu vulkanik.',
      },
      bencana: {
        heroValue: '86,0%',
        heroLabel: 'Relokasi Erupsi Gunung Ruang',
        metric1: { label: 'Huntap Modisi', value: '301 Unit Selesai Konstruksi' },
        metric2: { label: 'Zona Bahaya', value: 'Radius 5 Km Dikosongkan' },
        keterangan: 'Percepatan serah terima kunci huntap warga Pulau Ruang di Modisi Bolaang Mongondow Selatan.',
      },
      kemiskinan: {
        heroValue: '6,92%',
        heroLabel: 'Tingkat Kemiskinan',
        metric1: { label: 'Kemiskinan Ekstrem', value: '0,55%' },
        metric2: { label: 'Kawasan Kepulauan', value: 'Sitaro, Sangihe, Talaud' },
        keterangan: 'Bantuan kapal penangkap ikan dan subsidi ongkos angkut sembako pulau terluar.',
      },
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik: 1.280 / 2.170 satdik (59,0%)',
      kesehatan: 'CKG Terealisasi: 2,0 Juta Jiwa (81,2%)',
      bencana: 'Relokasi Pascabencana Erupsi Gunung Ruang (Huntap Modisi)',
      kemiskinan: 'Kemiskinan: 6,92% · Ekstrem: 0,55%',
    },
    catatanStrategis:
      'Penuntasan relokasi tetap warga Pulau Ruang dan pengawalan mata pencaharian nelayan terdampak.',
  },

    // 72 - Sulawesi Tengah
  {
  id: 'sulawesi-tengah',
  kodeBps: '72',
  name: 'Sulawesi Tengah',
  level: 'provinsi',
  lat: -1.43,
  lng: 121.4456,
  zoom: 7,
  boundary: [
    [
      1,
      120
    ],
    [
      0.5,
      122.5
    ],
    [
      -1.5,
      124
    ],
    [
      -3,
      122.5
    ],
    [
      -2,
      120
    ],
    [
      1,
      120
    ]
  ],
  tingkatKemiskinan: '11,77%',
  kemiskinanEkstrem: '1,42%',
  imm: '0,54',
  isPrioritas: true,
  kategoriWilayah: 'Wilayah Prioritas Percepatan',
  ringkasanStrategis: 'Penuntasan huntap pascabencana gempa-likuefaksi Palu-Sigi-Donggala dan perlindungan lingkungan industri Morowali.',
  pillarDetails: {
    pendidikan: {
      heroValue: '46,5%',
      heroLabel: 'Revitalisasi Satdik',
      metric1: {
        label: 'Satdik Terealisasi',
        value: '1.620 / 3.480 satdik'
      },
      metric2: {
        label: 'Sekolah Ramah Gempa',
        value: '380 Satdik Selesai'
      },
      keterangan: 'Pembangunan ruang kelas tahan gempa Patahan Palu-Koro.'
    },
    kesehatan: {
      heroValue: '75,8%',
      heroLabel: 'Cakupan Cek Kesehatan Gratis',
      metric1: {
        label: 'Peserta Terlayani',
        value: '2,3 Juta Jiwa'
      },
      metric2: {
        label: 'Puskesmas ILP',
        value: '162 Unit Terintegrasi'
      },
      keterangan: 'Pengendalian dampak polusi udara sekitar smelter nikel.'
    },
    bencana: {
      heroValue: '94,0%',
      heroLabel: 'Rekonstruksi Pascabencana PASIGALA',
      metric1: {
        label: 'Huntap Terbangun',
        value: '5.210 Unit Ditempati'
      },
      metric2: {
        label: 'Tanggul Silae',
        value: 'Panjang 7,5 Km Proteksi'
      },
      keterangan: 'Penataan zona sempadan patahan sesar aktif Palu-Koro.'
    },
    kemiskinan: {
      heroValue: '11,77%',
      heroLabel: 'Tingkat Kemiskinan',
      metric1: {
        label: 'Kemiskinan Ekstrem',
        value: '1,42%'
      },
      metric2: {
        label: 'Lokus Utama',
        value: 'Donggala, Tojo Una-Una, Banggai Laut'
      },
      keterangan: 'Bantuan modal usaha tani kakao dan jaring nelayan kepulauan Togean.'
    }
  },
  pillars: {
    pendidikan: 'Revitalisasi Satdik: 1.620 / 3.480 satdik (46,5%)',
    kesehatan: 'CKG Terealisasi: 2,3 Juta Jiwa (75,8%)',
    bencana: 'Pemulihan Gempa-Likuefaksi Pasigala & Huntap',
    kemiskinan: 'Kemiskinan: 11,77% · Ekstrem: 1,42%'
  },
  catatanStrategis: 'Percepatan sertifikasi lahan huntap dan penguatan ketahanan ekonomi nelayan pesisir Teluk Tomini.'
},

// 73 - Sulawesi Selatan
  {
    id: 'sulawesi-selatan',
    kodeBps: '73',
    name: 'Sulawesi Selatan',
    level: 'provinsi',
    lat: -4.1449,
    lng: 120.1242,
    zoom: 7,
    boundary: [
      [-2.00, 119.50],
      [-2.50, 121.50],
      [-4.00, 120.50],
      [-5.80, 120.60],
      [-5.60, 119.40],
      [-3.50, 119.20],
      [-2.00, 119.50],
    ],
    tingkatKemiskinan: '8,06%',
    kemiskinanEkstrem: '0,78%',
    imm: '0,59',
    isPrioritas: false,
    kategoriWilayah: 'Wilayah Reguler Pengawalan',
    ringkasanStrategis:
      'Penguatan ketahanan pangan lumbung padi nasional dan mitigasi banjir bandang Luwu Raya.',
    pillarDetails: {
      pendidikan: {
        heroValue: '54,2%',
        heroLabel: 'Revitalisasi Satdik',
        metric1: { label: 'Satdik Terealisasi', value: '3.420 / 6.300 satdik' },
        metric2: { label: 'Sekolah Pegunungan', value: 'Rehabilitasi Satdik Toraja' },
        keterangan: 'Pembangunan ruang kelas baru di kepulauan Pangkep dan Selayar.',
      },
      kesehatan: {
        heroValue: '82,0%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Peserta Terlayani', value: '7,3 Juta Jiwa' },
        metric2: { label: 'Penanganan Stunting', value: 'Prevalensi Turun ke 16,8%' },
        keterangan: 'Pemberian paket gizi serentak di posyandu desa terpencil.',
      },
      bencana: {
        heroValue: '90,0%',
        heroLabel: 'Pemulihan Banjir Longsor Luwu',
        metric1: { label: 'Jembatan Darurat', value: '14 Titik Akses Selesai' },
        metric2: { label: 'Stimulan Rumah', value: 'Tahap Verifikasi 920 KK' },
        keterangan: 'Normalisasi sungai Suso dan perkuatan tebing lereng rawan runtuh.',
      },
      kemiskinan: {
        heroValue: '8,06%',
        heroLabel: 'Tingkat Kemiskinan',
        metric1: { label: 'Kemiskinan Ekstrem', value: '0,78%' },
        metric2: { label: 'Kantong Pesisir', value: 'Jeneponto & Pangkep' },
        keterangan: 'Pemberdayaan tambak garam rakyat dan diversifikasi rumput laut.',
      },
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik: 3.420 / 6.300 satdik (54,2%)',
      kesehatan: 'CKG Terealisasi: 7,3 Juta Jiwa (82,0%)',
      bencana: 'Pemulihan Pascabencana Banjir Bandang Luwu Raya',
      kemiskinan: 'Kemiskinan: 8,06% · Ekstrem: 0,78%',
    },
    catatanStrategis:
      'Percepatan rehabilitasi jembatan penghubung dan bantuan stimulan rumah rusak banjir Luwu.',
  },

  // 74 - Sulawesi Tenggara
  {
    id: 'sulawesi-tenggara',
    kodeBps: '74',
    name: 'Sulawesi Tenggara',
    level: 'provinsi',
    lat: -4.1000,
    lng: 122.2000,
    zoom: 7,
    boundary: [
      [-3.00, 121.20],
      [-3.20, 123.00],
      [-5.20, 123.40],
      [-6.00, 124.00],
      [-5.80, 122.40],
      [-4.50, 121.50],
      [-3.00, 121.20],
    ],
    tingkatKemiskinan: '11,21%',
    kemiskinanEkstrem: '1,22%',
    imm: '0,55',
    isPrioritas: true,
    kategoriWilayah: 'Wilayah Prioritas Percepatan',
    ringkasanStrategis:
      'Pengendalian dampak lingkungan kawasan industri nikel dan penuntasan kemiskinan perdesaan pesisir.',
    pillarDetails: {
      pendidikan: {
        heroValue: '47,0%',
        heroLabel: 'Revitalisasi Satdik',
        metric1: { label: 'Satdik Terealisasi', value: '1.450 / 3.080 satdik' },
        metric2: { label: 'Vokasi Metalurgi', value: 'Politeknik Industri Konawe' },
        keterangan: 'Kemitraan sekolah kejuruan dengan industri pengolahan mineral lokal.',
      },
      kesehatan: {
        heroValue: '76,0%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Peserta Terlayani', value: '2,0 Juta Jiwa' },
        metric2: { label: 'Skrining Kualitas Air', value: 'Pengujian Rutin 42 Desa' },
        keterangan: 'Peningkatan faskes puskesmas pulau terpencil di Wakatobi dan Buton.',
      },
      bencana: {
        heroValue: '91,0%',
        heroLabel: 'Mitigasi Banjir Konawe Utara',
        metric1: { label: 'Normalisasi Sungai Lalindu', value: 'Rehabilitasi 18 Km' },
        metric2: { label: 'Pengendalian Sedimentasi', value: '4 Kolam Retensi Tambang' },
        keterangan: 'Penataan tanggul penahan banjir dan reboisasi catchment area.',
      },
      kemiskinan: {
        heroValue: '11,21%',
        heroLabel: 'Tingkat Kemiskinan',
        metric1: { label: 'Kemiskinan Ekstrem', value: '1,22%' },
        metric2: { label: 'Lokus Sasaran', value: 'Buton Tengah & Muna Barat' },
        keterangan: 'Integrasi jaminan sosial pekerja tambang lokal dan nelayan pesisir.',
      },
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik: 1.450 / 3.080 satdik (47,0%)',
      kesehatan: 'CKG Terealisasi: 2,0 Juta Jiwa (76,0%)',
      bencana: 'Mitigasi Banjir Konawe Utara & Pengendalian Sedimentasi',
      kemiskinan: 'Kemiskinan: 11,21% · Ekstrem: 1,22%',
    },
    catatanStrategis:
      'Akselerasi fasilitas sanitasi dan perlindungan tenaga kerja lokal di kawasan lingkar tambang.',
  },

    // 75 - Gorontalo
  {
  id: 'gorontalo',
  kodeBps: '75',
  name: 'Gorontalo',
  level: 'provinsi',
  lat: 0.6999,
  lng: 122.4467,
  zoom: 8,
  boundary: [
    [
      1,
      121.2
    ],
    [
      1,
      123.5
    ],
    [
      0.3,
      123.3
    ],
    [
      0.3,
      121.5
    ],
    [
      1,
      121.2
    ]
  ],
  tingkatKemiskinan: '14,57%',
  kemiskinanEkstrem: '1,95%',
  imm: '0,51',
  isPrioritas: true,
  kategoriWilayah: 'Wilayah Prioritas Percepatan',
  ringkasanStrategis: 'Akselerasi pengentasan kemiskinan perdesaan petani jagung dan mitigasi pendangkalan Danau Limboto.',
  pillarDetails: {
    pendidikan: {
      heroValue: '43,0%',
      heroLabel: 'Revitalisasi Satdik',
      metric1: {
        label: 'Satdik Terealisasi',
        value: '620 / 1.440 satdik'
      },
      metric2: {
        label: 'Akses Sanitasi',
        value: '78% Sekolah Bersanitasi Baik'
      },
      keterangan: 'Renovasi gedung sekolah rusak di Boalemo dan Pohuwato.'
    },
    kesehatan: {
      heroValue: '74,2%',
      heroLabel: 'Cakupan Cek Kesehatan Gratis',
      metric1: {
        label: 'Peserta Terlayani',
        value: '920 Ribu Jiwa'
      },
      metric2: {
        label: 'Intervensi Stunting',
        value: '48 Desa Kritis'
      },
      keterangan: 'Pemberian makanan tambahan protein ikan bagi ibu hamil.'
    },
    bencana: {
      heroValue: '88,0%',
      heroLabel: 'Pengendalian Banjir Bone Bolango',
      metric1: {
        label: 'Revitalisasi Danau Limboto',
        value: 'Pengerukan 4 Juta m³'
      },
      metric2: {
        label: 'Kanal Tanggul',
        value: 'Kapasitas Tampung Ditingkatkan'
      },
      keterangan: 'Normalisasi sungai rawan luapan Bone dan Bolango.'
    },
    kemiskinan: {
      heroValue: '14,57%',
      heroLabel: 'Tingkat Kemiskinan',
      metric1: {
        label: 'Kemiskinan Ekstrem',
        value: '1,95%'
      },
      metric2: {
        label: 'Lokus Sasaran',
        value: 'Boalemo & Gorontalo Utara'
      },
      keterangan: 'Pemberdayaan petani jagung hibrida dan hilirisasi pakan ternak.'
    }
  },
  pillars: {
    pendidikan: 'Revitalisasi Satdik: 620 / 1.440 satdik (43,0%)',
    kesehatan: 'CKG Terealisasi: 920 Ribu Jiwa (74,2%)',
    bencana: 'Pengendalian Banjir & Revitalisasi Danau Limboto',
    kemiskinan: 'Kemiskinan: 14,57% · Ekstrem: 1,95%'
  },
  catatanStrategis: 'Fokus penurunan angka stunting di Gorontalo Utara dan penguatan harga panen jagung rakyat.'
},

  // 76 - Sulawesi Barat
  {
  id: 'sulawesi-barat',
  kodeBps: '76',
  name: 'Sulawesi Barat',
  level: 'provinsi',
  lat: -2.8441,
  lng: 119.2321,
  zoom: 8,
  boundary: [
    [
      -0.8,
      119.2
    ],
    [
      -1.5,
      119.8
    ],
    [
      -3.5,
      119.4
    ],
    [
      -3.4,
      118.8
    ],
    [
      -2,
      118.8
    ],
    [
      -0.8,
      119.2
    ]
  ],
  tingkatKemiskinan: '11,21%',
  kemiskinanEkstrem: '1,38%',
  imm: '0,52',
  isPrioritas: true,
  kategoriWilayah: 'Wilayah Prioritas Percepatan',
  ringkasanStrategis: 'Pemulihan pascagempa Mamuju-Majene dan percepatan penurunan angka perkawinan anak serta stunting.',
  pillarDetails: {
    pendidikan: {
      heroValue: '42,1%',
      heroLabel: 'Revitalisasi Satdik',
      metric1: {
        label: 'Satdik Terealisasi',
        value: '680 / 1.615 satdik'
      },
      metric2: {
        label: 'Satdik Gempa',
        value: 'Rekonstruksi 142 Gedung'
      },
      keterangan: 'Penyelesaian gedung sekolah roboh pascagempa Majene.'
    },
    kesehatan: {
      heroValue: '71,5%',
      heroLabel: 'Cakupan Cek Kesehatan Gratis',
      metric1: {
        label: 'Peserta Terlayani',
        value: '1,05 Juta Jiwa'
      },
      metric2: {
        label: 'Pencegahan Stunting',
        value: 'Gerakan 1.000 HPK'
      },
      keterangan: 'Penyuluhan kesehatan reproduksi remaja cegah perkawinan anak.'
    },
    bencana: {
      heroValue: '89,0%',
      heroLabel: 'Kesiapsiagaan Gempa Selat Makassar',
      metric1: {
        label: 'EWS Sesar Naik Mamuju',
        value: '8 Sensor Geologi'
      },
      metric2: {
        label: 'Huntap Majene',
        value: '1.240 Unit Tuntas'
      },
      keterangan: 'Pembangunan tanggul pelindung pantai abrasi Polewali Mandar.'
    },
    kemiskinan: {
      heroValue: '11,21%',
      heroLabel: 'Tingkat Kemiskinan',
      metric1: {
        label: 'Kemiskinan Ekstrem',
        value: '1,38%'
      },
      metric2: {
        label: 'Lokus Sasaran',
        value: 'Mamasa & Polewali Mandar'
      },
      keterangan: 'Bantuan peremajaan kebun kakao dan sarana tenun sutra Mandar.'
    }
  },
  pillars: {
    pendidikan: 'Revitalisasi Satdik: 680 / 1.615 satdik (42,1%)',
    kesehatan: 'CKG Terealisasi: 1,05 Juta Jiwa (71,5%)',
    bencana: 'Mitigasi Gempa Patahan Sesar Naik Mamuju',
    kemiskinan: 'Kemiskinan: 11,21% · Ekstrem: 1,38%'
  },
  catatanStrategis: 'Pengentasan daerah terisolir pegunungan Mamasa dan penuntasan kasus stunting balita.'
},

// 81 - Maluku
  {
    id: 'maluku',
    kodeBps: '81',
    name: 'Maluku',
    level: 'provinsi',
    lat: -3.2385,
    lng: 130.1453,
    zoom: 7,
    boundary: [
      [-2.40, 125.80],
      [-2.80, 131.00],
      [-5.50, 134.50],
      [-8.50, 131.50],
      [-7.50, 128.00],
      [-4.00, 126.50],
      [-2.40, 125.80],
    ],
    tingkatKemiskinan: '16,05%',
    kemiskinanEkstrem: '2,68%',
    imm: '0,52',
    isPrioritas: true,
    kategoriWilayah: 'Wilayah Kepulauan 3T & Prioritas Percepatan',
    ringkasanStrategis:
      'Peningkatan konektivitas kapal perintis logistik pangan dan pemerataan fasilitas kesehatan puskesmas pulau.',
    pillarDetails: {
      pendidikan: {
        heroValue: '32,4%',
        heroLabel: 'Revitalisasi Satdik',
        metric1: { label: 'Satdik Terealisasi', value: '780 / 2.410 satdik' },
        metric2: { label: 'Sekolah Pulau Terluar', value: '94 Satdik Tanpa Sinyal' },
        keterangan: 'Pengadaan genset, solar panel, dan perahu sekolah bagi anak pulau.',
      },
      kesehatan: {
        heroValue: '58,2%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Peserta Terlayani', value: '1,1 Juta Jiwa' },
        metric2: { label: 'Dokter Spesialis Terbang', value: 'Layanan Berkala 11 RSUD' },
        keterangan: 'Ketersediaan obat esensial dan vaksinasi di faskes kepulauan Aru dan MBD.',
      },
      bencana: {
        heroValue: '88,0%',
        heroLabel: 'Kesiapsiagaan Gempa Laut Banda',
        metric1: { label: 'Mitigasi Gempa-Tsunami', value: '18 Sensor Laut Dalam' },
        metric2: { label: 'Cadangan Logistik Darurat', value: '3 Depo Pangan Pulau' },
        keterangan: 'Kesiapsiagaan cuaca ekstrem gelombang tinggi musim angin timur.',
      },
      kemiskinan: {
        heroValue: '16,05%',
        heroLabel: 'Tingkat Kemiskinan',
        metric1: { label: 'Kemiskinan Ekstrem', value: '2,68%' },
        metric2: { label: 'Wilayah 3T', value: 'Maluku Barat Daya, Kepulauan Aru' },
        keterangan: 'Pemberdayaan koperasi nelayan tangkap tuna dan subsidi muatan tol laut.',
      },
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik: 780 / 2.410 satdik (32,4%)',
      kesehatan: 'CKG Terealisasi: 1,1 Juta Jiwa (58,2%)',
      bencana: 'Kesiapsiagaan Gempa Laut Banda & Cuaca Ekstrem Laut',
      kemiskinan: 'Kemiskinan: 16,05% · Ekstrem: 2,68%',
    },
    catatanStrategis:
      'Kepastian ketersediaan BBM kapal perintis dan pasokan obat puskesmas pulau terluar.',
  },

    // 82 - Maluku Utara
  {
  id: 'maluku-utara',
  kodeBps: '82',
  name: 'Maluku Utara',
  level: 'provinsi',
  lat: 1.5709,
  lng: 127.8087,
  zoom: 7,
  boundary: [
    [
      2.5,
      127.5
    ],
    [
      2,
      129
    ],
    [
      0,
      129
    ],
    [
      -2,
      125.5
    ],
    [
      0.5,
      127
    ],
    [
      2.5,
      127.5
    ]
  ],
  tingkatKemiskinan: '6,46%',
  kemiskinanEkstrem: '0,49%',
  imm: '0,58',
  isPrioritas: false,
  kategoriWilayah: 'Wilayah Reguler Pengawalan',
  ringkasanStrategis: 'Hilirisasi industri nikel Weda Bay & Harita serta pemenuhan sarana air bersih dan sekolah pulau Halmahera.',
  pillarDetails: {
    pendidikan: {
      heroValue: '49,0%',
      heroLabel: 'Revitalisasi Satdik',
      metric1: {
        label: 'Satdik Terealisasi',
        value: '710 / 1.450 satdik'
      },
      metric2: {
        label: 'Vokasi Metalurgi',
        value: 'SMK Industri Halmahera Tengah'
      },
      keterangan: 'Kemitraan sekolah kejuruan dengan smelter pulau Obi.'
    },
    kesehatan: {
      heroValue: '78,4%',
      heroLabel: 'Cakupan Cek Kesehatan Gratis',
      metric1: {
        label: 'Peserta Terlayani',
        value: '980 Ribu Jiwa'
      },
      metric2: {
        label: 'Ambulans Laut',
        value: '14 Unit Aktif Berlayar'
      },
      keterangan: 'Layanan medis terapung di gugusan pulau Morotai dan Sula.'
    },
    bencana: {
      heroValue: '91,0%',
      heroLabel: 'Mitigasi Erupsi Gunung Ibu & Gamalama',
      metric1: {
        label: 'Pos Pengamatan',
        value: '7 Pos Vulkanologi Siaga'
      },
      metric2: {
        label: 'Zona Evakuasi',
        value: 'Radius 4 Km Ditetapkan'
      },
      keterangan: 'Kesiapsiagaan penampungan pengungsi erupsi Gunung Ibu Halmahera Barat.'
    },
    kemiskinan: {
      heroValue: '6,46%',
      heroLabel: 'Tingkat Kemiskinan',
      metric1: {
        label: 'Kemiskinan Ekstrem',
        value: '0,49%'
      },
      metric2: {
        label: 'Lokus Sasaran',
        value: 'Kepulauan Sula & Pulau Taliabu'
      },
      keterangan: 'Pemberdayaan nelayan cakalang dan petani cengkih pala.'
    }
  },
  pillars: {
    pendidikan: 'Revitalisasi Satdik: 710 / 1.450 satdik (49,0%)',
    kesehatan: 'CKG Terealisasi: 980 Ribu Jiwa (78,4%)',
    bencana: 'Kesiapsiagaan Erupsi Gunung Ibu & Gempa Laut Maluku',
    kemiskinan: 'Kemiskinan: 6,46% · Ekstrem: 0,49%'
  },
  catatanStrategis: 'Pengendalian dampak lingkungan industri smelter dan pemerataan sarana kesehatan di Pulau Morotai.'
},

// 91 - Papua Barat
  {
    id: 'papua-barat',
    kodeBps: '92',
    name: 'Papua Barat',
    level: 'provinsi',
    lat: -1.3361,
    lng: 133.1747,
    zoom: 7,
    boundary: [
      [-0.40, 131.00],
      [-0.80, 134.50],
      [-2.80, 134.80],
      [-4.50, 133.00],
      [-3.00, 131.50],
      [-1.50, 130.50],
      [-0.40, 131.00],
    ],
    tingkatKemiskinan: '21,10%',
    kemiskinanEkstrem: '4,88%',
    imm: '0,46',
    isPrioritas: true,
    kategoriWilayah: 'Wilayah Prioritas Khusus Kesejahteraan',
    ringkasanStrategis:
      'Percepatan akses pendidikan dasar anak pedalaman Pegunungan Arfak dan pemenuhan hak kependudukan.',
    pillarDetails: {
      pendidikan: {
        heroValue: '28,1%',
        heroLabel: 'Revitalisasi Satdik',
        metric1: { label: 'Satdik Terealisasi', value: '340 / 1.210 satdik' },
        metric2: { label: 'Guru Perintis', value: '180 Tenaga Pengajar Khusus' },
        keterangan: 'Pembangunan asrama dan penyediaan makanan bergizi di sekolah rimba.',
      },
      kesehatan: {
        heroValue: '48,0%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Peserta Terlayani', value: '540 Ribu Jiwa' },
        metric2: { label: 'Eliminasi Kusta & Malaria', value: 'Pelacakan Aktif Kampung' },
        keterangan: 'Pelayanan dokter terbang TNI-Polri ke distrik terisolir.',
      },
      bencana: {
        heroValue: '85,0%',
        heroLabel: 'Mitigasi Bencana Longsor Pegunungan',
        metric1: { label: 'Titik Rawan Longsor', value: 'Jalur Manokwari-Bintuni' },
        metric2: { label: 'Posko Siaga Logistik', value: '4 Hub Helipad Pangan' },
        keterangan: 'Pengamanan suplai pangan darurat melalui transportasi udara saat jalan tertutup.',
      },
      kemiskinan: {
        heroValue: '21,10%',
        heroLabel: 'Tingkat Kemiskinan',
        metric1: { label: 'Kemiskinan Ekstrem', value: '4,88%' },
        metric2: { label: 'Distrik Sasaran', value: 'Pegunungan Arfak & Tambrauw' },
        keterangan: 'Bantuan modal usaha tani kopi dan sayuran dataran tinggi Arfak.',
      },
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik: 340 / 1.210 satdik (28,1%)',
      kesehatan: 'CKG Terealisasi: 540 Ribu Jiwa (48,0%)',
      bencana: 'Mitigasi Bencana Longsor & Isolasi Logistik Pegunungan',
      kemiskinan: 'Kemiskinan: 21,10% · Ekstrem: 4,88%',
    },
    catatanStrategis:
      'Percepatan jangkauan imunisasi dasar dan kepemilikan dokumen identitas kependudukan Orang Asli Papua (OAP).',
  },

  // 94 - Papua
  {
    id: 'papua',
    kodeBps: '91',
    name: 'Papua',
    level: 'provinsi',
    lat: -4.2699,
    lng: 138.0803,
    zoom: 6,
    boundary: [
      [-1.50, 134.50],
      [-2.20, 140.90],
      [-9.10, 141.00],
      [-8.80, 138.00],
      [-5.10, 136.00],
      [-3.00, 134.50],
      [-1.50, 134.50],
    ],
    tingkatKemiskinan: '26,03%',
    kemiskinanEkstrem: '6,43%',
    imm: '0,42',
    isPrioritas: true,
    kategoriWilayah: 'Wilayah Tertinggal & Prioritas Khusus',
    ringkasanStrategis:
      'Percepatan penyediaan tenaga guru/medis dan logistik pangan di wilayah perbatasan dan pegunungan terisolir.',
    pillarDetails: {
      pendidikan: {
        heroValue: '19,5%',
        heroLabel: 'Revitalisasi Satdik',
        metric1: { label: 'Satdik Terealisasi', value: '410 / 2.100 satdik' },
        metric2: { label: 'Sekolah Terpencil', value: 'Penyediaan Asrama Siswa' },
        keterangan: 'Pengadaan modul ajar kontekstual dan insentif guru daerah 3T.',
      },
      kesehatan: {
        heroValue: '36,8%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Peserta Terlayani', value: '420 Ribu Jiwa' },
        metric2: { label: 'Faskes TNI-Polri', value: 'Dukungan Operasi Medis Udara' },
        keterangan: 'Pemberian kelambu malaria massal dan penimbangan balita distrik pedalaman.',
      },
      bencana: {
        heroValue: '82,0%',
        heroLabel: 'Kesiapsiagaan Bencana Cuaca Dingin',
        metric1: { label: 'Mitigasi Embun Beku', value: 'Depo Cadangan Pangan Darurat' },
        metric2: { label: 'Akses Helikopter', value: 'Subsidi Avtur Jembatan Udara' },
        keterangan: 'Penyaluran beras dan selimut darurat untuk distrik rawan bencana embun beku (frost).',
      },
      kemiskinan: {
        heroValue: '26,03%',
        heroLabel: 'Tingkat Kemiskinan',
        metric1: { label: 'Kemiskinan Ekstrem', value: '6,43%' },
        metric2: { label: 'Prioritas Percepatan', value: 'Daerah 3T & Perbatasan PNG' },
        keterangan: 'Program Makan Bergizi Gratis (MBG) dan percepatan kepemilikan NIK/KTP.',
      },
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik: 410 / 2.100 satdik (19,5%) · Guru perintis',
      kesehatan: 'CKG Terealisasi: 420 Ribu Jiwa (36,8%) · Pelibatan faskes TNI-Polri',
      bencana: 'Penanganan Bencana Longsor & Embun Beku Pegunungan',
      kemiskinan: 'Kemiskinan: 26,03% · Ekstrem: 6,43%',
    },
    catatanStrategis:
      'Percepatan penyediaan tenaga guru/medis dan logistik pangan di wilayah perbatasan dan pegunungan terisolir.',
  },
];

// 3. DATA TINGKAT KABUPATEN / KOTA (DKI Jakarta: 31 & Jawa Barat: 32)
export const KABKOTA_DATA: WilayahData[] = [
  {
    id: 'jakarta-selatan',
    kodeBps: '31.74',
    name: 'Kota Jakarta Selatan',
    level: 'kabupaten',
    parentProvinsiId: 'dki-jakarta',
    lat: -6.2615,
    lng: 106.8106,
    zoom: 10,
    boundary: [
      [-6.1815, 106.7306],
      [-6.1815, 106.8906],
      [-6.3415, 106.8906],
      [-6.3415, 106.7306],
      [-6.1815, 106.7306]
    ],
    tingkatKemiskinan: '3,12%',
    kemiskinanEkstrem: '0,12%',
    imm: '0,78',
    isPrioritas: false,
    kategoriWilayah: 'Wilayah Reguler Pengawalan',
    ringkasanStrategis: 'Pengawalan capaian 4 pilar prioritas pembangunan dan perlindungan sosial di Kota Jakarta Selatan.',
    pillarDetails: {
      pendidikan: {
        heroValue: '58,0%',
        heroLabel: 'Revitalisasi Satdik',
        metric1: { label: 'Satdik Layak', value: '88% Standar Pelayanan' },
        metric2: { label: 'Akses Sekolah', value: '94% Terhubung Digital' },
        keterangan: 'Peningkatan sarana belajar dan mutu ruang kelas.'
      },
      kesehatan: {
        heroValue: '82,0%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Peserta Terlayani', value: '82,0% Target' },
        metric2: { label: 'Posyandu Aktif', value: 'Integrasi ILP Terpadu' },
        keterangan: 'Skrining kesehatan berkala di puskesmas pembantu.'
      },
      bencana: {
        heroValue: '90,0%',
        heroLabel: 'Kesiapsiagaan Bencana Daerah',
        metric1: { label: 'Mitigasi Bencana', value: 'Sistem Peringatan Dini' },
        metric2: { label: 'Jalur Evakuasi', value: 'Pemetaan Titik Kumpul' },
        keterangan: 'Latihan kontingensi berkala mitigasi bencana.'
      },
      kemiskinan: {
        heroValue: '3,12%',
        heroLabel: 'Tingkat Kemiskinan',
        metric1: { label: 'Kemiskinan Ekstrem', value: '0,12%' },
        metric2: { label: 'Sasaran Program', value: 'Pemberdayaan Terpadu' },
        keterangan: 'Integrasi jaminan sosial dan bantuan modal usaha produktif.'
      }
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik di Kota Jakarta Selatan',
      kesehatan: 'CKG Terealisasi 82,0%',
      bencana: 'Kesiapsiagaan Mitigasi Bencana Daerah',
      kemiskinan: 'Kemiskinan: 3,12% · Ekstrem: 0,12%'
    },
    catatanStrategis: 'Fokus koordinasi percepatan program prioritas nasional di Kota Jakarta Selatan.'
  },

  {
    id: 'jakarta-timur',
    kodeBps: '31.75',
    name: 'Kota Jakarta Timur',
    level: 'kabupaten',
    parentProvinsiId: 'dki-jakarta',
    lat: -6.225,
    lng: 106.9004,
    zoom: 10,
    boundary: [
      [-6.1450, 106.8204],
      [-6.1450, 106.9804],
      [-6.3050, 106.9804],
      [-6.3050, 106.8204],
      [-6.1450, 106.8204]
    ],
    tingkatKemiskinan: '3,88%',
    kemiskinanEkstrem: '0,18%',
    imm: '0,74',
    isPrioritas: false,
    kategoriWilayah: 'Wilayah Reguler Pengawalan',
    ringkasanStrategis: 'Pengawalan capaian 4 pilar prioritas pembangunan dan perlindungan sosial di Kota Jakarta Timur.',
    pillarDetails: {
      pendidikan: {
        heroValue: '58,0%',
        heroLabel: 'Revitalisasi Satdik',
        metric1: { label: 'Satdik Layak', value: '88% Standar Pelayanan' },
        metric2: { label: 'Akses Sekolah', value: '94% Terhubung Digital' },
        keterangan: 'Peningkatan sarana belajar dan mutu ruang kelas.'
      },
      kesehatan: {
        heroValue: '82,0%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Peserta Terlayani', value: '82,0% Target' },
        metric2: { label: 'Posyandu Aktif', value: 'Integrasi ILP Terpadu' },
        keterangan: 'Skrining kesehatan berkala di puskesmas pembantu.'
      },
      bencana: {
        heroValue: '90,0%',
        heroLabel: 'Kesiapsiagaan Bencana Daerah',
        metric1: { label: 'Mitigasi Bencana', value: 'Sistem Peringatan Dini' },
        metric2: { label: 'Jalur Evakuasi', value: 'Pemetaan Titik Kumpul' },
        keterangan: 'Latihan kontingensi berkala mitigasi bencana.'
      },
      kemiskinan: {
        heroValue: '3,88%',
        heroLabel: 'Tingkat Kemiskinan',
        metric1: { label: 'Kemiskinan Ekstrem', value: '0,18%' },
        metric2: { label: 'Sasaran Program', value: 'Pemberdayaan Terpadu' },
        keterangan: 'Integrasi jaminan sosial dan bantuan modal usaha produktif.'
      }
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik di Kota Jakarta Timur',
      kesehatan: 'CKG Terealisasi 82,0%',
      bencana: 'Kesiapsiagaan Mitigasi Bencana Daerah',
      kemiskinan: 'Kemiskinan: 3,88% · Ekstrem: 0,18%'
    },
    catatanStrategis: 'Fokus koordinasi percepatan program prioritas nasional di Kota Jakarta Timur.'
  },

  {
    id: 'jakarta-barat',
    kodeBps: '31.73',
    name: 'Kota Jakarta Barat',
    level: 'kabupaten',
    parentProvinsiId: 'dki-jakarta',
    lat: -6.1683,
    lng: 106.7589,
    zoom: 10,
    boundary: [
      [-6.0883, 106.6789],
      [-6.0883, 106.8389],
      [-6.2483, 106.8389],
      [-6.2483, 106.6789],
      [-6.0883, 106.6789]
    ],
    tingkatKemiskinan: '3,75%',
    kemiskinanEkstrem: '0,16%',
    imm: '0,75',
    isPrioritas: false,
    kategoriWilayah: 'Wilayah Reguler Pengawalan',
    ringkasanStrategis: 'Pengawalan capaian 4 pilar prioritas pembangunan dan perlindungan sosial di Kota Jakarta Barat.',
    pillarDetails: {
      pendidikan: {
        heroValue: '58,0%',
        heroLabel: 'Revitalisasi Satdik',
        metric1: { label: 'Satdik Layak', value: '88% Standar Pelayanan' },
        metric2: { label: 'Akses Sekolah', value: '94% Terhubung Digital' },
        keterangan: 'Peningkatan sarana belajar dan mutu ruang kelas.'
      },
      kesehatan: {
        heroValue: '82,0%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Peserta Terlayani', value: '82,0% Target' },
        metric2: { label: 'Posyandu Aktif', value: 'Integrasi ILP Terpadu' },
        keterangan: 'Skrining kesehatan berkala di puskesmas pembantu.'
      },
      bencana: {
        heroValue: '90,0%',
        heroLabel: 'Kesiapsiagaan Bencana Daerah',
        metric1: { label: 'Mitigasi Bencana', value: 'Sistem Peringatan Dini' },
        metric2: { label: 'Jalur Evakuasi', value: 'Pemetaan Titik Kumpul' },
        keterangan: 'Latihan kontingensi berkala mitigasi bencana.'
      },
      kemiskinan: {
        heroValue: '3,75%',
        heroLabel: 'Tingkat Kemiskinan',
        metric1: { label: 'Kemiskinan Ekstrem', value: '0,16%' },
        metric2: { label: 'Sasaran Program', value: 'Pemberdayaan Terpadu' },
        keterangan: 'Integrasi jaminan sosial dan bantuan modal usaha produktif.'
      }
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik di Kota Jakarta Barat',
      kesehatan: 'CKG Terealisasi 82,0%',
      bencana: 'Kesiapsiagaan Mitigasi Bencana Daerah',
      kemiskinan: 'Kemiskinan: 3,75% · Ekstrem: 0,16%'
    },
    catatanStrategis: 'Fokus koordinasi percepatan program prioritas nasional di Kota Jakarta Barat.'
  },

  {
    id: 'sukabumi',
    kodeBps: '32.02',
    name: 'Kabupaten Sukabumi',
    level: 'kabupaten',
    parentProvinsiId: 'jawa-barat',
    lat: -7,
    lng: 106.7,
    zoom: 10,
    boundary: [
      [-6.9200, 106.6200],
      [-6.9200, 106.7800],
      [-7.0800, 106.7800],
      [-7.0800, 106.6200],
      [-6.9200, 106.6200]
    ],
    tingkatKemiskinan: '6,92%',
    kemiskinanEkstrem: '0,52%',
    imm: '0,56',
    isPrioritas: false,
    kategoriWilayah: 'Wilayah Reguler Pengawalan',
    ringkasanStrategis: 'Pengawalan capaian 4 pilar prioritas pembangunan dan perlindungan sosial di Kabupaten Sukabumi.',
    pillarDetails: {
      pendidikan: {
        heroValue: '58,0%',
        heroLabel: 'Revitalisasi Satdik',
        metric1: { label: 'Satdik Layak', value: '88% Standar Pelayanan' },
        metric2: { label: 'Akses Sekolah', value: '94% Terhubung Digital' },
        keterangan: 'Peningkatan sarana belajar dan mutu ruang kelas.'
      },
      kesehatan: {
        heroValue: '82,0%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Peserta Terlayani', value: '82,0% Target' },
        metric2: { label: 'Posyandu Aktif', value: 'Integrasi ILP Terpadu' },
        keterangan: 'Skrining kesehatan berkala di puskesmas pembantu.'
      },
      bencana: {
        heroValue: '90,0%',
        heroLabel: 'Kesiapsiagaan Bencana Daerah',
        metric1: { label: 'Mitigasi Bencana', value: 'Sistem Peringatan Dini' },
        metric2: { label: 'Jalur Evakuasi', value: 'Pemetaan Titik Kumpul' },
        keterangan: 'Latihan kontingensi berkala mitigasi bencana.'
      },
      kemiskinan: {
        heroValue: '6,92%',
        heroLabel: 'Tingkat Kemiskinan',
        metric1: { label: 'Kemiskinan Ekstrem', value: '0,52%' },
        metric2: { label: 'Sasaran Program', value: 'Pemberdayaan Terpadu' },
        keterangan: 'Integrasi jaminan sosial dan bantuan modal usaha produktif.'
      }
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik di Kabupaten Sukabumi',
      kesehatan: 'CKG Terealisasi 82,0%',
      bencana: 'Kesiapsiagaan Mitigasi Bencana Daerah',
      kemiskinan: 'Kemiskinan: 6,92% · Ekstrem: 0,52%'
    },
    catatanStrategis: 'Fokus koordinasi percepatan program prioritas nasional di Kabupaten Sukabumi.'
  },

  {
    id: 'bandung',
    kodeBps: '32.04',
    name: 'Kabupaten Bandung',
    level: 'kabupaten',
    parentProvinsiId: 'jawa-barat',
    lat: -7.0253,
    lng: 107.5198,
    zoom: 10,
    boundary: [
      [-6.9453, 107.4398],
      [-6.9453, 107.5998],
      [-7.1053, 107.5998],
      [-7.1053, 107.4398],
      [-6.9453, 107.4398]
    ],
    tingkatKemiskinan: '6,40%',
    kemiskinanEkstrem: '0,42%',
    imm: '0,62',
    isPrioritas: false,
    kategoriWilayah: 'Wilayah Reguler Pengawalan',
    ringkasanStrategis: 'Pengawalan capaian 4 pilar prioritas pembangunan dan perlindungan sosial di Kabupaten Bandung.',
    pillarDetails: {
      pendidikan: {
        heroValue: '58,0%',
        heroLabel: 'Revitalisasi Satdik',
        metric1: { label: 'Satdik Layak', value: '88% Standar Pelayanan' },
        metric2: { label: 'Akses Sekolah', value: '94% Terhubung Digital' },
        keterangan: 'Peningkatan sarana belajar dan mutu ruang kelas.'
      },
      kesehatan: {
        heroValue: '82,0%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Peserta Terlayani', value: '82,0% Target' },
        metric2: { label: 'Posyandu Aktif', value: 'Integrasi ILP Terpadu' },
        keterangan: 'Skrining kesehatan berkala di puskesmas pembantu.'
      },
      bencana: {
        heroValue: '90,0%',
        heroLabel: 'Kesiapsiagaan Bencana Daerah',
        metric1: { label: 'Mitigasi Bencana', value: 'Sistem Peringatan Dini' },
        metric2: { label: 'Jalur Evakuasi', value: 'Pemetaan Titik Kumpul' },
        keterangan: 'Latihan kontingensi berkala mitigasi bencana.'
      },
      kemiskinan: {
        heroValue: '6,40%',
        heroLabel: 'Tingkat Kemiskinan',
        metric1: { label: 'Kemiskinan Ekstrem', value: '0,42%' },
        metric2: { label: 'Sasaran Program', value: 'Pemberdayaan Terpadu' },
        keterangan: 'Integrasi jaminan sosial dan bantuan modal usaha produktif.'
      }
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik di Kabupaten Bandung',
      kesehatan: 'CKG Terealisasi 82,0%',
      bencana: 'Kesiapsiagaan Mitigasi Bencana Daerah',
      kemiskinan: 'Kemiskinan: 6,40% · Ekstrem: 0,42%'
    },
    catatanStrategis: 'Fokus koordinasi percepatan program prioritas nasional di Kabupaten Bandung.'
  },

  {
    id: 'tasikmalaya',
    kodeBps: '32.06',
    name: 'Kabupaten Tasikmalaya',
    level: 'kabupaten',
    parentProvinsiId: 'jawa-barat',
    lat: -7.35,
    lng: 108.15,
    zoom: 10,
    boundary: [
      [-7.2700, 108.0700],
      [-7.2700, 108.2300],
      [-7.4300, 108.2300],
      [-7.4300, 108.0700],
      [-7.2700, 108.0700]
    ],
    tingkatKemiskinan: '9,55%',
    kemiskinanEkstrem: '1,12%',
    imm: '0,54',
    isPrioritas: true,
    kategoriWilayah: 'Wilayah Prioritas Percepatan',
    ringkasanStrategis: 'Pengawalan capaian 4 pilar prioritas pembangunan dan perlindungan sosial di Kabupaten Tasikmalaya.',
    pillarDetails: {
      pendidikan: {
        heroValue: '58,0%',
        heroLabel: 'Revitalisasi Satdik',
        metric1: { label: 'Satdik Layak', value: '88% Standar Pelayanan' },
        metric2: { label: 'Akses Sekolah', value: '94% Terhubung Digital' },
        keterangan: 'Peningkatan sarana belajar dan mutu ruang kelas.'
      },
      kesehatan: {
        heroValue: '82,0%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Peserta Terlayani', value: '82,0% Target' },
        metric2: { label: 'Posyandu Aktif', value: 'Integrasi ILP Terpadu' },
        keterangan: 'Skrining kesehatan berkala di puskesmas pembantu.'
      },
      bencana: {
        heroValue: '90,0%',
        heroLabel: 'Kesiapsiagaan Bencana Daerah',
        metric1: { label: 'Mitigasi Bencana', value: 'Sistem Peringatan Dini' },
        metric2: { label: 'Jalur Evakuasi', value: 'Pemetaan Titik Kumpul' },
        keterangan: 'Latihan kontingensi berkala mitigasi bencana.'
      },
      kemiskinan: {
        heroValue: '9,55%',
        heroLabel: 'Tingkat Kemiskinan',
        metric1: { label: 'Kemiskinan Ekstrem', value: '1,12%' },
        metric2: { label: 'Sasaran Program', value: 'Pemberdayaan Terpadu' },
        keterangan: 'Integrasi jaminan sosial dan bantuan modal usaha produktif.'
      }
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik di Kabupaten Tasikmalaya',
      kesehatan: 'CKG Terealisasi 82,0%',
      bencana: 'Kesiapsiagaan Mitigasi Bencana Daerah',
      kemiskinan: 'Kemiskinan: 9,55% · Ekstrem: 1,12%'
    },
    catatanStrategis: 'Fokus koordinasi percepatan program prioritas nasional di Kabupaten Tasikmalaya.'
  },

  {
    id: 'ciamis',
    kodeBps: '32.07',
    name: 'Kabupaten Ciamis',
    level: 'kabupaten',
    parentProvinsiId: 'jawa-barat',
    lat: -7.3274,
    lng: 108.3541,
    zoom: 10,
    boundary: [
      [-7.2474, 108.2741],
      [-7.2474, 108.4341],
      [-7.4074, 108.4341],
      [-7.4074, 108.2741],
      [-7.2474, 108.2741]
    ],
    tingkatKemiskinan: '7,11%',
    kemiskinanEkstrem: '0,58%',
    imm: '0,58',
    isPrioritas: false,
    kategoriWilayah: 'Wilayah Reguler Pengawalan',
    ringkasanStrategis: 'Pengawalan capaian 4 pilar prioritas pembangunan dan perlindungan sosial di Kabupaten Ciamis.',
    pillarDetails: {
      pendidikan: {
        heroValue: '58,0%',
        heroLabel: 'Revitalisasi Satdik',
        metric1: { label: 'Satdik Layak', value: '88% Standar Pelayanan' },
        metric2: { label: 'Akses Sekolah', value: '94% Terhubung Digital' },
        keterangan: 'Peningkatan sarana belajar dan mutu ruang kelas.'
      },
      kesehatan: {
        heroValue: '82,0%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Peserta Terlayani', value: '82,0% Target' },
        metric2: { label: 'Posyandu Aktif', value: 'Integrasi ILP Terpadu' },
        keterangan: 'Skrining kesehatan berkala di puskesmas pembantu.'
      },
      bencana: {
        heroValue: '90,0%',
        heroLabel: 'Kesiapsiagaan Bencana Daerah',
        metric1: { label: 'Mitigasi Bencana', value: 'Sistem Peringatan Dini' },
        metric2: { label: 'Jalur Evakuasi', value: 'Pemetaan Titik Kumpul' },
        keterangan: 'Latihan kontingensi berkala mitigasi bencana.'
      },
      kemiskinan: {
        heroValue: '7,11%',
        heroLabel: 'Tingkat Kemiskinan',
        metric1: { label: 'Kemiskinan Ekstrem', value: '0,58%' },
        metric2: { label: 'Sasaran Program', value: 'Pemberdayaan Terpadu' },
        keterangan: 'Integrasi jaminan sosial dan bantuan modal usaha produktif.'
      }
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik di Kabupaten Ciamis',
      kesehatan: 'CKG Terealisasi 82,0%',
      bencana: 'Kesiapsiagaan Mitigasi Bencana Daerah',
      kemiskinan: 'Kemiskinan: 7,11% · Ekstrem: 0,58%'
    },
    catatanStrategis: 'Fokus koordinasi percepatan program prioritas nasional di Kabupaten Ciamis.'
  },

  {
    id: 'kuningan',
    kodeBps: '32.08',
    name: 'Kabupaten Kuningan',
    level: 'kabupaten',
    parentProvinsiId: 'jawa-barat',
    lat: -6.9764,
    lng: 108.4831,
    zoom: 10,
    boundary: [
      [-6.8964, 108.4031],
      [-6.8964, 108.5631],
      [-7.0564, 108.5631],
      [-7.0564, 108.4031],
      [-6.8964, 108.4031]
    ],
    tingkatKemiskinan: '11,88%',
    kemiskinanEkstrem: '1,45%',
    imm: '0,53',
    isPrioritas: true,
    kategoriWilayah: 'Wilayah Prioritas Percepatan',
    ringkasanStrategis: 'Pengawalan capaian 4 pilar prioritas pembangunan dan perlindungan sosial di Kabupaten Kuningan.',
    pillarDetails: {
      pendidikan: {
        heroValue: '58,0%',
        heroLabel: 'Revitalisasi Satdik',
        metric1: { label: 'Satdik Layak', value: '88% Standar Pelayanan' },
        metric2: { label: 'Akses Sekolah', value: '94% Terhubung Digital' },
        keterangan: 'Peningkatan sarana belajar dan mutu ruang kelas.'
      },
      kesehatan: {
        heroValue: '82,0%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Peserta Terlayani', value: '82,0% Target' },
        metric2: { label: 'Posyandu Aktif', value: 'Integrasi ILP Terpadu' },
        keterangan: 'Skrining kesehatan berkala di puskesmas pembantu.'
      },
      bencana: {
        heroValue: '90,0%',
        heroLabel: 'Kesiapsiagaan Bencana Daerah',
        metric1: { label: 'Mitigasi Bencana', value: 'Sistem Peringatan Dini' },
        metric2: { label: 'Jalur Evakuasi', value: 'Pemetaan Titik Kumpul' },
        keterangan: 'Latihan kontingensi berkala mitigasi bencana.'
      },
      kemiskinan: {
        heroValue: '11,88%',
        heroLabel: 'Tingkat Kemiskinan',
        metric1: { label: 'Kemiskinan Ekstrem', value: '1,45%' },
        metric2: { label: 'Sasaran Program', value: 'Pemberdayaan Terpadu' },
        keterangan: 'Integrasi jaminan sosial dan bantuan modal usaha produktif.'
      }
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik di Kabupaten Kuningan',
      kesehatan: 'CKG Terealisasi 82,0%',
      bencana: 'Kesiapsiagaan Mitigasi Bencana Daerah',
      kemiskinan: 'Kemiskinan: 11,88% · Ekstrem: 1,45%'
    },
    catatanStrategis: 'Fokus koordinasi percepatan program prioritas nasional di Kabupaten Kuningan.'
  },

  {
    id: 'cirebon',
    kodeBps: '32.09',
    name: 'Kabupaten Cirebon',
    level: 'kabupaten',
    parentProvinsiId: 'jawa-barat',
    lat: -6.764,
    lng: 108.4789,
    zoom: 10,
    boundary: [
      [-6.6840, 108.3989],
      [-6.6840, 108.5589],
      [-6.8440, 108.5589],
      [-6.8440, 108.3989],
      [-6.6840, 108.3989]
    ],
    tingkatKemiskinan: '11,20%',
    kemiskinanEkstrem: '1,32%',
    imm: '0,55',
    isPrioritas: true,
    kategoriWilayah: 'Wilayah Prioritas Percepatan',
    ringkasanStrategis: 'Pengawalan capaian 4 pilar prioritas pembangunan dan perlindungan sosial di Kabupaten Cirebon.',
    pillarDetails: {
      pendidikan: {
        heroValue: '58,0%',
        heroLabel: 'Revitalisasi Satdik',
        metric1: { label: 'Satdik Layak', value: '88% Standar Pelayanan' },
        metric2: { label: 'Akses Sekolah', value: '94% Terhubung Digital' },
        keterangan: 'Peningkatan sarana belajar dan mutu ruang kelas.'
      },
      kesehatan: {
        heroValue: '82,0%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Peserta Terlayani', value: '82,0% Target' },
        metric2: { label: 'Posyandu Aktif', value: 'Integrasi ILP Terpadu' },
        keterangan: 'Skrining kesehatan berkala di puskesmas pembantu.'
      },
      bencana: {
        heroValue: '90,0%',
        heroLabel: 'Kesiapsiagaan Bencana Daerah',
        metric1: { label: 'Mitigasi Bencana', value: 'Sistem Peringatan Dini' },
        metric2: { label: 'Jalur Evakuasi', value: 'Pemetaan Titik Kumpul' },
        keterangan: 'Latihan kontingensi berkala mitigasi bencana.'
      },
      kemiskinan: {
        heroValue: '11,20%',
        heroLabel: 'Tingkat Kemiskinan',
        metric1: { label: 'Kemiskinan Ekstrem', value: '1,32%' },
        metric2: { label: 'Sasaran Program', value: 'Pemberdayaan Terpadu' },
        keterangan: 'Integrasi jaminan sosial dan bantuan modal usaha produktif.'
      }
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik di Kabupaten Cirebon',
      kesehatan: 'CKG Terealisasi 82,0%',
      bencana: 'Kesiapsiagaan Mitigasi Bencana Daerah',
      kemiskinan: 'Kemiskinan: 11,20% · Ekstrem: 1,32%'
    },
    catatanStrategis: 'Fokus koordinasi percepatan program prioritas nasional di Kabupaten Cirebon.'
  },

  {
    id: 'majalengka',
    kodeBps: '32.10',
    name: 'Kabupaten Majalengka',
    level: 'kabupaten',
    parentProvinsiId: 'jawa-barat',
    lat: -6.8361,
    lng: 108.2274,
    zoom: 10,
    boundary: [
      [-6.7561, 108.1474],
      [-6.7561, 108.3074],
      [-6.9161, 108.3074],
      [-6.9161, 108.1474],
      [-6.7561, 108.1474]
    ],
    tingkatKemiskinan: '10,95%',
    kemiskinanEkstrem: '1,28%',
    imm: '0,55',
    isPrioritas: true,
    kategoriWilayah: 'Wilayah Prioritas Percepatan',
    ringkasanStrategis: 'Pengawalan capaian 4 pilar prioritas pembangunan dan perlindungan sosial di Kabupaten Majalengka.',
    pillarDetails: {
      pendidikan: {
        heroValue: '58,0%',
        heroLabel: 'Revitalisasi Satdik',
        metric1: { label: 'Satdik Layak', value: '88% Standar Pelayanan' },
        metric2: { label: 'Akses Sekolah', value: '94% Terhubung Digital' },
        keterangan: 'Peningkatan sarana belajar dan mutu ruang kelas.'
      },
      kesehatan: {
        heroValue: '82,0%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Peserta Terlayani', value: '82,0% Target' },
        metric2: { label: 'Posyandu Aktif', value: 'Integrasi ILP Terpadu' },
        keterangan: 'Skrining kesehatan berkala di puskesmas pembantu.'
      },
      bencana: {
        heroValue: '90,0%',
        heroLabel: 'Kesiapsiagaan Bencana Daerah',
        metric1: { label: 'Mitigasi Bencana', value: 'Sistem Peringatan Dini' },
        metric2: { label: 'Jalur Evakuasi', value: 'Pemetaan Titik Kumpul' },
        keterangan: 'Latihan kontingensi berkala mitigasi bencana.'
      },
      kemiskinan: {
        heroValue: '10,95%',
        heroLabel: 'Tingkat Kemiskinan',
        metric1: { label: 'Kemiskinan Ekstrem', value: '1,28%' },
        metric2: { label: 'Sasaran Program', value: 'Pemberdayaan Terpadu' },
        keterangan: 'Integrasi jaminan sosial dan bantuan modal usaha produktif.'
      }
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik di Kabupaten Majalengka',
      kesehatan: 'CKG Terealisasi 82,0%',
      bencana: 'Kesiapsiagaan Mitigasi Bencana Daerah',
      kemiskinan: 'Kemiskinan: 10,95% · Ekstrem: 1,28%'
    },
    catatanStrategis: 'Fokus koordinasi percepatan program prioritas nasional di Kabupaten Majalengka.'
  },

  {
    id: 'sumedang',
    kodeBps: '32.11',
    name: 'Kabupaten Sumedang',
    level: 'kabupaten',
    parentProvinsiId: 'jawa-barat',
    lat: -6.8586,
    lng: 107.9266,
    zoom: 10,
    boundary: [
      [-6.7786, 107.8466],
      [-6.7786, 108.0066],
      [-6.9386, 108.0066],
      [-6.9386, 107.8466],
      [-6.7786, 107.8466]
    ],
    tingkatKemiskinan: '9,36%',
    kemiskinanEkstrem: '0,92%',
    imm: '0,58',
    isPrioritas: false,
    kategoriWilayah: 'Wilayah Reguler Pengawalan',
    ringkasanStrategis: 'Pengawalan capaian 4 pilar prioritas pembangunan dan perlindungan sosial di Kabupaten Sumedang.',
    pillarDetails: {
      pendidikan: {
        heroValue: '58,0%',
        heroLabel: 'Revitalisasi Satdik',
        metric1: { label: 'Satdik Layak', value: '88% Standar Pelayanan' },
        metric2: { label: 'Akses Sekolah', value: '94% Terhubung Digital' },
        keterangan: 'Peningkatan sarana belajar dan mutu ruang kelas.'
      },
      kesehatan: {
        heroValue: '82,0%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Peserta Terlayani', value: '82,0% Target' },
        metric2: { label: 'Posyandu Aktif', value: 'Integrasi ILP Terpadu' },
        keterangan: 'Skrining kesehatan berkala di puskesmas pembantu.'
      },
      bencana: {
        heroValue: '90,0%',
        heroLabel: 'Kesiapsiagaan Bencana Daerah',
        metric1: { label: 'Mitigasi Bencana', value: 'Sistem Peringatan Dini' },
        metric2: { label: 'Jalur Evakuasi', value: 'Pemetaan Titik Kumpul' },
        keterangan: 'Latihan kontingensi berkala mitigasi bencana.'
      },
      kemiskinan: {
        heroValue: '9,36%',
        heroLabel: 'Tingkat Kemiskinan',
        metric1: { label: 'Kemiskinan Ekstrem', value: '0,92%' },
        metric2: { label: 'Sasaran Program', value: 'Pemberdayaan Terpadu' },
        keterangan: 'Integrasi jaminan sosial dan bantuan modal usaha produktif.'
      }
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik di Kabupaten Sumedang',
      kesehatan: 'CKG Terealisasi 82,0%',
      bencana: 'Kesiapsiagaan Mitigasi Bencana Daerah',
      kemiskinan: 'Kemiskinan: 9,36% · Ekstrem: 0,92%'
    },
    catatanStrategis: 'Fokus koordinasi percepatan program prioritas nasional di Kabupaten Sumedang.'
  },

  {
    id: 'indramayu',
    kodeBps: '32.12',
    name: 'Kabupaten Indramayu',
    level: 'kabupaten',
    parentProvinsiId: 'jawa-barat',
    lat: -6.3263,
    lng: 108.32,
    zoom: 10,
    boundary: [
      [-6.2463, 108.2400],
      [-6.2463, 108.4000],
      [-6.4063, 108.4000],
      [-6.4063, 108.2400],
      [-6.2463, 108.2400]
    ],
    tingkatKemiskinan: '11,93%',
    kemiskinanEkstrem: '1,52%',
    imm: '0,52',
    isPrioritas: true,
    kategoriWilayah: 'Wilayah Prioritas Percepatan',
    ringkasanStrategis: 'Pengawalan capaian 4 pilar prioritas pembangunan dan perlindungan sosial di Kabupaten Indramayu.',
    pillarDetails: {
      pendidikan: {
        heroValue: '58,0%',
        heroLabel: 'Revitalisasi Satdik',
        metric1: { label: 'Satdik Layak', value: '88% Standar Pelayanan' },
        metric2: { label: 'Akses Sekolah', value: '94% Terhubung Digital' },
        keterangan: 'Peningkatan sarana belajar dan mutu ruang kelas.'
      },
      kesehatan: {
        heroValue: '82,0%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Peserta Terlayani', value: '82,0% Target' },
        metric2: { label: 'Posyandu Aktif', value: 'Integrasi ILP Terpadu' },
        keterangan: 'Skrining kesehatan berkala di puskesmas pembantu.'
      },
      bencana: {
        heroValue: '90,0%',
        heroLabel: 'Kesiapsiagaan Bencana Daerah',
        metric1: { label: 'Mitigasi Bencana', value: 'Sistem Peringatan Dini' },
        metric2: { label: 'Jalur Evakuasi', value: 'Pemetaan Titik Kumpul' },
        keterangan: 'Latihan kontingensi berkala mitigasi bencana.'
      },
      kemiskinan: {
        heroValue: '11,93%',
        heroLabel: 'Tingkat Kemiskinan',
        metric1: { label: 'Kemiskinan Ekstrem', value: '1,52%' },
        metric2: { label: 'Sasaran Program', value: 'Pemberdayaan Terpadu' },
        keterangan: 'Integrasi jaminan sosial dan bantuan modal usaha produktif.'
      }
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik di Kabupaten Indramayu',
      kesehatan: 'CKG Terealisasi 82,0%',
      bencana: 'Kesiapsiagaan Mitigasi Bencana Daerah',
      kemiskinan: 'Kemiskinan: 11,93% · Ekstrem: 1,52%'
    },
    catatanStrategis: 'Fokus koordinasi percepatan program prioritas nasional di Kabupaten Indramayu.'
  },

  {
    id: 'subang',
    kodeBps: '32.13',
    name: 'Kabupaten Subang',
    level: 'kabupaten',
    parentProvinsiId: 'jawa-barat',
    lat: -6.5716,
    lng: 107.7587,
    zoom: 10,
    boundary: [
      [-6.4916, 107.6787],
      [-6.4916, 107.8387],
      [-6.6516, 107.8387],
      [-6.6516, 107.6787],
      [-6.4916, 107.6787]
    ],
    tingkatKemiskinan: '8,85%',
    kemiskinanEkstrem: '0,88%',
    imm: '0,57',
    isPrioritas: false,
    kategoriWilayah: 'Wilayah Reguler Pengawalan',
    ringkasanStrategis: 'Pengawalan capaian 4 pilar prioritas pembangunan dan perlindungan sosial di Kabupaten Subang.',
    pillarDetails: {
      pendidikan: {
        heroValue: '58,0%',
        heroLabel: 'Revitalisasi Satdik',
        metric1: { label: 'Satdik Layak', value: '88% Standar Pelayanan' },
        metric2: { label: 'Akses Sekolah', value: '94% Terhubung Digital' },
        keterangan: 'Peningkatan sarana belajar dan mutu ruang kelas.'
      },
      kesehatan: {
        heroValue: '82,0%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Peserta Terlayani', value: '82,0% Target' },
        metric2: { label: 'Posyandu Aktif', value: 'Integrasi ILP Terpadu' },
        keterangan: 'Skrining kesehatan berkala di puskesmas pembantu.'
      },
      bencana: {
        heroValue: '90,0%',
        heroLabel: 'Kesiapsiagaan Bencana Daerah',
        metric1: { label: 'Mitigasi Bencana', value: 'Sistem Peringatan Dini' },
        metric2: { label: 'Jalur Evakuasi', value: 'Pemetaan Titik Kumpul' },
        keterangan: 'Latihan kontingensi berkala mitigasi bencana.'
      },
      kemiskinan: {
        heroValue: '8,85%',
        heroLabel: 'Tingkat Kemiskinan',
        metric1: { label: 'Kemiskinan Ekstrem', value: '0,88%' },
        metric2: { label: 'Sasaran Program', value: 'Pemberdayaan Terpadu' },
        keterangan: 'Integrasi jaminan sosial dan bantuan modal usaha produktif.'
      }
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik di Kabupaten Subang',
      kesehatan: 'CKG Terealisasi 82,0%',
      bencana: 'Kesiapsiagaan Mitigasi Bencana Daerah',
      kemiskinan: 'Kemiskinan: 8,85% · Ekstrem: 0,88%'
    },
    catatanStrategis: 'Fokus koordinasi percepatan program prioritas nasional di Kabupaten Subang.'
  },

  {
    id: 'purwakarta',
    kodeBps: '32.14',
    name: 'Kabupaten Purwakarta',
    level: 'kabupaten',
    parentProvinsiId: 'jawa-barat',
    lat: -6.5569,
    lng: 107.4433,
    zoom: 10,
    boundary: [
      [-6.4769, 107.3633],
      [-6.4769, 107.5233],
      [-6.6369, 107.5233],
      [-6.6369, 107.3633],
      [-6.4769, 107.3633]
    ],
    tingkatKemiskinan: '7,88%',
    kemiskinanEkstrem: '0,65%',
    imm: '0,61',
    isPrioritas: false,
    kategoriWilayah: 'Wilayah Reguler Pengawalan',
    ringkasanStrategis: 'Pengawalan capaian 4 pilar prioritas pembangunan dan perlindungan sosial di Kabupaten Purwakarta.',
    pillarDetails: {
      pendidikan: {
        heroValue: '58,0%',
        heroLabel: 'Revitalisasi Satdik',
        metric1: { label: 'Satdik Layak', value: '88% Standar Pelayanan' },
        metric2: { label: 'Akses Sekolah', value: '94% Terhubung Digital' },
        keterangan: 'Peningkatan sarana belajar dan mutu ruang kelas.'
      },
      kesehatan: {
        heroValue: '82,0%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Peserta Terlayani', value: '82,0% Target' },
        metric2: { label: 'Posyandu Aktif', value: 'Integrasi ILP Terpadu' },
        keterangan: 'Skrining kesehatan berkala di puskesmas pembantu.'
      },
      bencana: {
        heroValue: '90,0%',
        heroLabel: 'Kesiapsiagaan Bencana Daerah',
        metric1: { label: 'Mitigasi Bencana', value: 'Sistem Peringatan Dini' },
        metric2: { label: 'Jalur Evakuasi', value: 'Pemetaan Titik Kumpul' },
        keterangan: 'Latihan kontingensi berkala mitigasi bencana.'
      },
      kemiskinan: {
        heroValue: '7,88%',
        heroLabel: 'Tingkat Kemiskinan',
        metric1: { label: 'Kemiskinan Ekstrem', value: '0,65%' },
        metric2: { label: 'Sasaran Program', value: 'Pemberdayaan Terpadu' },
        keterangan: 'Integrasi jaminan sosial dan bantuan modal usaha produktif.'
      }
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik di Kabupaten Purwakarta',
      kesehatan: 'CKG Terealisasi 82,0%',
      bencana: 'Kesiapsiagaan Mitigasi Bencana Daerah',
      kemiskinan: 'Kemiskinan: 7,88% · Ekstrem: 0,65%'
    },
    catatanStrategis: 'Fokus koordinasi percepatan program prioritas nasional di Kabupaten Purwakarta.'
  },

  {
    id: 'karawang',
    kodeBps: '32.15',
    name: 'Kabupaten Karawang',
    level: 'kabupaten',
    parentProvinsiId: 'jawa-barat',
    lat: -6.3054,
    lng: 107.3006,
    zoom: 10,
    boundary: [
      [-6.2254, 107.2206],
      [-6.2254, 107.3806],
      [-6.3854, 107.3806],
      [-6.3854, 107.2206],
      [-6.2254, 107.2206]
    ],
    tingkatKemiskinan: '7,87%',
    kemiskinanEkstrem: '0,62%',
    imm: '0,60',
    isPrioritas: false,
    kategoriWilayah: 'Wilayah Reguler Pengawalan',
    ringkasanStrategis: 'Pengawalan capaian 4 pilar prioritas pembangunan dan perlindungan sosial di Kabupaten Karawang.',
    pillarDetails: {
      pendidikan: {
        heroValue: '58,0%',
        heroLabel: 'Revitalisasi Satdik',
        metric1: { label: 'Satdik Layak', value: '88% Standar Pelayanan' },
        metric2: { label: 'Akses Sekolah', value: '94% Terhubung Digital' },
        keterangan: 'Peningkatan sarana belajar dan mutu ruang kelas.'
      },
      kesehatan: {
        heroValue: '82,0%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Peserta Terlayani', value: '82,0% Target' },
        metric2: { label: 'Posyandu Aktif', value: 'Integrasi ILP Terpadu' },
        keterangan: 'Skrining kesehatan berkala di puskesmas pembantu.'
      },
      bencana: {
        heroValue: '90,0%',
        heroLabel: 'Kesiapsiagaan Bencana Daerah',
        metric1: { label: 'Mitigasi Bencana', value: 'Sistem Peringatan Dini' },
        metric2: { label: 'Jalur Evakuasi', value: 'Pemetaan Titik Kumpul' },
        keterangan: 'Latihan kontingensi berkala mitigasi bencana.'
      },
      kemiskinan: {
        heroValue: '7,87%',
        heroLabel: 'Tingkat Kemiskinan',
        metric1: { label: 'Kemiskinan Ekstrem', value: '0,62%' },
        metric2: { label: 'Sasaran Program', value: 'Pemberdayaan Terpadu' },
        keterangan: 'Integrasi jaminan sosial dan bantuan modal usaha produktif.'
      }
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik di Kabupaten Karawang',
      kesehatan: 'CKG Terealisasi 82,0%',
      bencana: 'Kesiapsiagaan Mitigasi Bencana Daerah',
      kemiskinan: 'Kemiskinan: 7,87% · Ekstrem: 0,62%'
    },
    catatanStrategis: 'Fokus koordinasi percepatan program prioritas nasional di Kabupaten Karawang.'
  },

  {
    id: 'bekasi',
    kodeBps: '32.16',
    name: 'Kabupaten Bekasi',
    level: 'kabupaten',
    parentProvinsiId: 'jawa-barat',
    lat: -6.2415,
    lng: 107.1473,
    zoom: 10,
    boundary: [
      [-6.1615, 107.0673],
      [-6.1615, 107.2273],
      [-6.3215, 107.2273],
      [-6.3215, 107.0673],
      [-6.1615, 107.0673]
    ],
    tingkatKemiskinan: '4,84%',
    kemiskinanEkstrem: '0,31%',
    imm: '0,67',
    isPrioritas: false,
    kategoriWilayah: 'Wilayah Reguler Pengawalan',
    ringkasanStrategis: 'Pengawalan capaian 4 pilar prioritas pembangunan dan perlindungan sosial di Kabupaten Bekasi.',
    pillarDetails: {
      pendidikan: {
        heroValue: '58,0%',
        heroLabel: 'Revitalisasi Satdik',
        metric1: { label: 'Satdik Layak', value: '88% Standar Pelayanan' },
        metric2: { label: 'Akses Sekolah', value: '94% Terhubung Digital' },
        keterangan: 'Peningkatan sarana belajar dan mutu ruang kelas.'
      },
      kesehatan: {
        heroValue: '82,0%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Peserta Terlayani', value: '82,0% Target' },
        metric2: { label: 'Posyandu Aktif', value: 'Integrasi ILP Terpadu' },
        keterangan: 'Skrining kesehatan berkala di puskesmas pembantu.'
      },
      bencana: {
        heroValue: '90,0%',
        heroLabel: 'Kesiapsiagaan Bencana Daerah',
        metric1: { label: 'Mitigasi Bencana', value: 'Sistem Peringatan Dini' },
        metric2: { label: 'Jalur Evakuasi', value: 'Pemetaan Titik Kumpul' },
        keterangan: 'Latihan kontingensi berkala mitigasi bencana.'
      },
      kemiskinan: {
        heroValue: '4,84%',
        heroLabel: 'Tingkat Kemiskinan',
        metric1: { label: 'Kemiskinan Ekstrem', value: '0,31%' },
        metric2: { label: 'Sasaran Program', value: 'Pemberdayaan Terpadu' },
        keterangan: 'Integrasi jaminan sosial dan bantuan modal usaha produktif.'
      }
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik di Kabupaten Bekasi',
      kesehatan: 'CKG Terealisasi 82,0%',
      bencana: 'Kesiapsiagaan Mitigasi Bencana Daerah',
      kemiskinan: 'Kemiskinan: 4,84% · Ekstrem: 0,31%'
    },
    catatanStrategis: 'Fokus koordinasi percepatan program prioritas nasional di Kabupaten Bekasi.'
  },

  {
    id: 'bandung-barat',
    kodeBps: '32.17',
    name: 'Kabupaten Bandung Barat',
    level: 'kabupaten',
    parentProvinsiId: 'jawa-barat',
    lat: -6.8439,
    lng: 107.4939,
    zoom: 10,
    boundary: [
      [-6.7639, 107.4139],
      [-6.7639, 107.5739],
      [-6.9239, 107.5739],
      [-6.9239, 107.4139],
      [-6.7639, 107.4139]
    ],
    tingkatKemiskinan: '10,12%',
    kemiskinanEkstrem: '1,15%',
    imm: '0,56',
    isPrioritas: true,
    kategoriWilayah: 'Wilayah Prioritas Percepatan',
    ringkasanStrategis: 'Pengawalan capaian 4 pilar prioritas pembangunan dan perlindungan sosial di Kabupaten Bandung Barat.',
    pillarDetails: {
      pendidikan: {
        heroValue: '58,0%',
        heroLabel: 'Revitalisasi Satdik',
        metric1: { label: 'Satdik Layak', value: '88% Standar Pelayanan' },
        metric2: { label: 'Akses Sekolah', value: '94% Terhubung Digital' },
        keterangan: 'Peningkatan sarana belajar dan mutu ruang kelas.'
      },
      kesehatan: {
        heroValue: '82,0%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Peserta Terlayani', value: '82,0% Target' },
        metric2: { label: 'Posyandu Aktif', value: 'Integrasi ILP Terpadu' },
        keterangan: 'Skrining kesehatan berkala di puskesmas pembantu.'
      },
      bencana: {
        heroValue: '90,0%',
        heroLabel: 'Kesiapsiagaan Bencana Daerah',
        metric1: { label: 'Mitigasi Bencana', value: 'Sistem Peringatan Dini' },
        metric2: { label: 'Jalur Evakuasi', value: 'Pemetaan Titik Kumpul' },
        keterangan: 'Latihan kontingensi berkala mitigasi bencana.'
      },
      kemiskinan: {
        heroValue: '10,12%',
        heroLabel: 'Tingkat Kemiskinan',
        metric1: { label: 'Kemiskinan Ekstrem', value: '1,15%' },
        metric2: { label: 'Sasaran Program', value: 'Pemberdayaan Terpadu' },
        keterangan: 'Integrasi jaminan sosial dan bantuan modal usaha produktif.'
      }
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik di Kabupaten Bandung Barat',
      kesehatan: 'CKG Terealisasi 82,0%',
      bencana: 'Kesiapsiagaan Mitigasi Bencana Daerah',
      kemiskinan: 'Kemiskinan: 10,12% · Ekstrem: 1,15%'
    },
    catatanStrategis: 'Fokus koordinasi percepatan program prioritas nasional di Kabupaten Bandung Barat.'
  },

  {
    id: 'pangandaran',
    kodeBps: '32.18',
    name: 'Kabupaten Pangandaran',
    level: 'kabupaten',
    parentProvinsiId: 'jawa-barat',
    lat: -7.7,
    lng: 108.49,
    zoom: 10,
    boundary: [
      [-7.6200, 108.4100],
      [-7.6200, 108.5700],
      [-7.7800, 108.5700],
      [-7.7800, 108.4100],
      [-7.6200, 108.4100]
    ],
    tingkatKemiskinan: '8,81%',
    kemiskinanEkstrem: '0,84%',
    imm: '0,56',
    isPrioritas: false,
    kategoriWilayah: 'Wilayah Reguler Pengawalan',
    ringkasanStrategis: 'Pengawalan capaian 4 pilar prioritas pembangunan dan perlindungan sosial di Kabupaten Pangandaran.',
    pillarDetails: {
      pendidikan: {
        heroValue: '58,0%',
        heroLabel: 'Revitalisasi Satdik',
        metric1: { label: 'Satdik Layak', value: '88% Standar Pelayanan' },
        metric2: { label: 'Akses Sekolah', value: '94% Terhubung Digital' },
        keterangan: 'Peningkatan sarana belajar dan mutu ruang kelas.'
      },
      kesehatan: {
        heroValue: '82,0%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Peserta Terlayani', value: '82,0% Target' },
        metric2: { label: 'Posyandu Aktif', value: 'Integrasi ILP Terpadu' },
        keterangan: 'Skrining kesehatan berkala di puskesmas pembantu.'
      },
      bencana: {
        heroValue: '90,0%',
        heroLabel: 'Kesiapsiagaan Bencana Daerah',
        metric1: { label: 'Mitigasi Bencana', value: 'Sistem Peringatan Dini' },
        metric2: { label: 'Jalur Evakuasi', value: 'Pemetaan Titik Kumpul' },
        keterangan: 'Latihan kontingensi berkala mitigasi bencana.'
      },
      kemiskinan: {
        heroValue: '8,81%',
        heroLabel: 'Tingkat Kemiskinan',
        metric1: { label: 'Kemiskinan Ekstrem', value: '0,84%' },
        metric2: { label: 'Sasaran Program', value: 'Pemberdayaan Terpadu' },
        keterangan: 'Integrasi jaminan sosial dan bantuan modal usaha produktif.'
      }
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik di Kabupaten Pangandaran',
      kesehatan: 'CKG Terealisasi 82,0%',
      bencana: 'Kesiapsiagaan Mitigasi Bencana Daerah',
      kemiskinan: 'Kemiskinan: 8,81% · Ekstrem: 0,84%'
    },
    catatanStrategis: 'Fokus koordinasi percepatan program prioritas nasional di Kabupaten Pangandaran.'
  },

  {
    id: 'kota-bogor',
    kodeBps: '32.71',
    name: 'Kota Bogor',
    level: 'kabupaten',
    parentProvinsiId: 'jawa-barat',
    lat: -6.5971,
    lng: 106.806,
    zoom: 10,
    boundary: [
      [-6.5171, 106.7260],
      [-6.5171, 106.8860],
      [-6.6771, 106.8860],
      [-6.6771, 106.7260],
      [-6.5171, 106.7260]
    ],
    tingkatKemiskinan: '6,38%',
    kemiskinanEkstrem: '0,38%',
    imm: '0,69',
    isPrioritas: false,
    kategoriWilayah: 'Wilayah Reguler Pengawalan',
    ringkasanStrategis: 'Pengawalan capaian 4 pilar prioritas pembangunan dan perlindungan sosial di Kota Bogor.',
    pillarDetails: {
      pendidikan: {
        heroValue: '58,0%',
        heroLabel: 'Revitalisasi Satdik',
        metric1: { label: 'Satdik Layak', value: '88% Standar Pelayanan' },
        metric2: { label: 'Akses Sekolah', value: '94% Terhubung Digital' },
        keterangan: 'Peningkatan sarana belajar dan mutu ruang kelas.'
      },
      kesehatan: {
        heroValue: '82,0%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Peserta Terlayani', value: '82,0% Target' },
        metric2: { label: 'Posyandu Aktif', value: 'Integrasi ILP Terpadu' },
        keterangan: 'Skrining kesehatan berkala di puskesmas pembantu.'
      },
      bencana: {
        heroValue: '90,0%',
        heroLabel: 'Kesiapsiagaan Bencana Daerah',
        metric1: { label: 'Mitigasi Bencana', value: 'Sistem Peringatan Dini' },
        metric2: { label: 'Jalur Evakuasi', value: 'Pemetaan Titik Kumpul' },
        keterangan: 'Latihan kontingensi berkala mitigasi bencana.'
      },
      kemiskinan: {
        heroValue: '6,38%',
        heroLabel: 'Tingkat Kemiskinan',
        metric1: { label: 'Kemiskinan Ekstrem', value: '0,38%' },
        metric2: { label: 'Sasaran Program', value: 'Pemberdayaan Terpadu' },
        keterangan: 'Integrasi jaminan sosial dan bantuan modal usaha produktif.'
      }
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik di Kota Bogor',
      kesehatan: 'CKG Terealisasi 82,0%',
      bencana: 'Kesiapsiagaan Mitigasi Bencana Daerah',
      kemiskinan: 'Kemiskinan: 6,38% · Ekstrem: 0,38%'
    },
    catatanStrategis: 'Fokus koordinasi percepatan program prioritas nasional di Kota Bogor.'
  },

  {
    id: 'kota-sukabumi',
    kodeBps: '32.72',
    name: 'Kota Sukabumi',
    level: 'kabupaten',
    parentProvinsiId: 'jawa-barat',
    lat: -6.9277,
    lng: 106.93,
    zoom: 10,
    boundary: [
      [-6.8477, 106.8500],
      [-6.8477, 107.0100],
      [-7.0077, 107.0100],
      [-7.0077, 106.8500],
      [-6.8477, 106.8500]
    ],
    tingkatKemiskinan: '7,25%',
    kemiskinanEkstrem: '0,45%',
    imm: '0,66',
    isPrioritas: false,
    kategoriWilayah: 'Wilayah Reguler Pengawalan',
    ringkasanStrategis: 'Pengawalan capaian 4 pilar prioritas pembangunan dan perlindungan sosial di Kota Sukabumi.',
    pillarDetails: {
      pendidikan: {
        heroValue: '58,0%',
        heroLabel: 'Revitalisasi Satdik',
        metric1: { label: 'Satdik Layak', value: '88% Standar Pelayanan' },
        metric2: { label: 'Akses Sekolah', value: '94% Terhubung Digital' },
        keterangan: 'Peningkatan sarana belajar dan mutu ruang kelas.'
      },
      kesehatan: {
        heroValue: '82,0%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Peserta Terlayani', value: '82,0% Target' },
        metric2: { label: 'Posyandu Aktif', value: 'Integrasi ILP Terpadu' },
        keterangan: 'Skrining kesehatan berkala di puskesmas pembantu.'
      },
      bencana: {
        heroValue: '90,0%',
        heroLabel: 'Kesiapsiagaan Bencana Daerah',
        metric1: { label: 'Mitigasi Bencana', value: 'Sistem Peringatan Dini' },
        metric2: { label: 'Jalur Evakuasi', value: 'Pemetaan Titik Kumpul' },
        keterangan: 'Latihan kontingensi berkala mitigasi bencana.'
      },
      kemiskinan: {
        heroValue: '7,25%',
        heroLabel: 'Tingkat Kemiskinan',
        metric1: { label: 'Kemiskinan Ekstrem', value: '0,45%' },
        metric2: { label: 'Sasaran Program', value: 'Pemberdayaan Terpadu' },
        keterangan: 'Integrasi jaminan sosial dan bantuan modal usaha produktif.'
      }
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik di Kota Sukabumi',
      kesehatan: 'CKG Terealisasi 82,0%',
      bencana: 'Kesiapsiagaan Mitigasi Bencana Daerah',
      kemiskinan: 'Kemiskinan: 7,25% · Ekstrem: 0,45%'
    },
    catatanStrategis: 'Fokus koordinasi percepatan program prioritas nasional di Kota Sukabumi.'
  },

  {
    id: 'kota-bandung',
    kodeBps: '32.73',
    name: 'Kota Bandung',
    level: 'kabupaten',
    parentProvinsiId: 'jawa-barat',
    lat: -6.9175,
    lng: 107.6191,
    zoom: 10,
    boundary: [
      [-6.8375, 107.5391],
      [-6.8375, 107.6991],
      [-6.9975, 107.6991],
      [-6.9975, 107.5391],
      [-6.8375, 107.5391]
    ],
    tingkatKemiskinan: '3,96%',
    kemiskinanEkstrem: '0,18%',
    imm: '0,74',
    isPrioritas: false,
    kategoriWilayah: 'Wilayah Reguler Pengawalan',
    ringkasanStrategis: 'Pengawalan capaian 4 pilar prioritas pembangunan dan perlindungan sosial di Kota Bandung.',
    pillarDetails: {
      pendidikan: {
        heroValue: '58,0%',
        heroLabel: 'Revitalisasi Satdik',
        metric1: { label: 'Satdik Layak', value: '88% Standar Pelayanan' },
        metric2: { label: 'Akses Sekolah', value: '94% Terhubung Digital' },
        keterangan: 'Peningkatan sarana belajar dan mutu ruang kelas.'
      },
      kesehatan: {
        heroValue: '82,0%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Peserta Terlayani', value: '82,0% Target' },
        metric2: { label: 'Posyandu Aktif', value: 'Integrasi ILP Terpadu' },
        keterangan: 'Skrining kesehatan berkala di puskesmas pembantu.'
      },
      bencana: {
        heroValue: '90,0%',
        heroLabel: 'Kesiapsiagaan Bencana Daerah',
        metric1: { label: 'Mitigasi Bencana', value: 'Sistem Peringatan Dini' },
        metric2: { label: 'Jalur Evakuasi', value: 'Pemetaan Titik Kumpul' },
        keterangan: 'Latihan kontingensi berkala mitigasi bencana.'
      },
      kemiskinan: {
        heroValue: '3,96%',
        heroLabel: 'Tingkat Kemiskinan',
        metric1: { label: 'Kemiskinan Ekstrem', value: '0,18%' },
        metric2: { label: 'Sasaran Program', value: 'Pemberdayaan Terpadu' },
        keterangan: 'Integrasi jaminan sosial dan bantuan modal usaha produktif.'
      }
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik di Kota Bandung',
      kesehatan: 'CKG Terealisasi 82,0%',
      bencana: 'Kesiapsiagaan Mitigasi Bencana Daerah',
      kemiskinan: 'Kemiskinan: 3,96% · Ekstrem: 0,18%'
    },
    catatanStrategis: 'Fokus koordinasi percepatan program prioritas nasional di Kota Bandung.'
  },

  {
    id: 'kota-cirebon',
    kodeBps: '32.74',
    name: 'Kota Cirebon',
    level: 'kabupaten',
    parentProvinsiId: 'jawa-barat',
    lat: -6.732,
    lng: 108.5523,
    zoom: 10,
    boundary: [
      [-6.6520, 108.4723],
      [-6.6520, 108.6323],
      [-6.8120, 108.6323],
      [-6.8120, 108.4723],
      [-6.6520, 108.4723]
    ],
    tingkatKemiskinan: '9,12%',
    kemiskinanEkstrem: '0,78%',
    imm: '0,67',
    isPrioritas: false,
    kategoriWilayah: 'Wilayah Reguler Pengawalan',
    ringkasanStrategis: 'Pengawalan capaian 4 pilar prioritas pembangunan dan perlindungan sosial di Kota Cirebon.',
    pillarDetails: {
      pendidikan: {
        heroValue: '58,0%',
        heroLabel: 'Revitalisasi Satdik',
        metric1: { label: 'Satdik Layak', value: '88% Standar Pelayanan' },
        metric2: { label: 'Akses Sekolah', value: '94% Terhubung Digital' },
        keterangan: 'Peningkatan sarana belajar dan mutu ruang kelas.'
      },
      kesehatan: {
        heroValue: '82,0%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Peserta Terlayani', value: '82,0% Target' },
        metric2: { label: 'Posyandu Aktif', value: 'Integrasi ILP Terpadu' },
        keterangan: 'Skrining kesehatan berkala di puskesmas pembantu.'
      },
      bencana: {
        heroValue: '90,0%',
        heroLabel: 'Kesiapsiagaan Bencana Daerah',
        metric1: { label: 'Mitigasi Bencana', value: 'Sistem Peringatan Dini' },
        metric2: { label: 'Jalur Evakuasi', value: 'Pemetaan Titik Kumpul' },
        keterangan: 'Latihan kontingensi berkala mitigasi bencana.'
      },
      kemiskinan: {
        heroValue: '9,12%',
        heroLabel: 'Tingkat Kemiskinan',
        metric1: { label: 'Kemiskinan Ekstrem', value: '0,78%' },
        metric2: { label: 'Sasaran Program', value: 'Pemberdayaan Terpadu' },
        keterangan: 'Integrasi jaminan sosial dan bantuan modal usaha produktif.'
      }
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik di Kota Cirebon',
      kesehatan: 'CKG Terealisasi 82,0%',
      bencana: 'Kesiapsiagaan Mitigasi Bencana Daerah',
      kemiskinan: 'Kemiskinan: 9,12% · Ekstrem: 0,78%'
    },
    catatanStrategis: 'Fokus koordinasi percepatan program prioritas nasional di Kota Cirebon.'
  },

  {
    id: 'kota-bekasi',
    kodeBps: '32.75',
    name: 'Kota Bekasi',
    level: 'kabupaten',
    parentProvinsiId: 'jawa-barat',
    lat: -6.2383,
    lng: 106.9756,
    zoom: 10,
    boundary: [
      [-6.1583, 106.8956],
      [-6.1583, 107.0556],
      [-6.3183, 107.0556],
      [-6.3183, 106.8956],
      [-6.1583, 106.8956]
    ],
    tingkatKemiskinan: '4,05%',
    kemiskinanEkstrem: '0,20%',
    imm: '0,72',
    isPrioritas: false,
    kategoriWilayah: 'Wilayah Reguler Pengawalan',
    ringkasanStrategis: 'Pengawalan capaian 4 pilar prioritas pembangunan dan perlindungan sosial di Kota Bekasi.',
    pillarDetails: {
      pendidikan: {
        heroValue: '58,0%',
        heroLabel: 'Revitalisasi Satdik',
        metric1: { label: 'Satdik Layak', value: '88% Standar Pelayanan' },
        metric2: { label: 'Akses Sekolah', value: '94% Terhubung Digital' },
        keterangan: 'Peningkatan sarana belajar dan mutu ruang kelas.'
      },
      kesehatan: {
        heroValue: '82,0%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Peserta Terlayani', value: '82,0% Target' },
        metric2: { label: 'Posyandu Aktif', value: 'Integrasi ILP Terpadu' },
        keterangan: 'Skrining kesehatan berkala di puskesmas pembantu.'
      },
      bencana: {
        heroValue: '90,0%',
        heroLabel: 'Kesiapsiagaan Bencana Daerah',
        metric1: { label: 'Mitigasi Bencana', value: 'Sistem Peringatan Dini' },
        metric2: { label: 'Jalur Evakuasi', value: 'Pemetaan Titik Kumpul' },
        keterangan: 'Latihan kontingensi berkala mitigasi bencana.'
      },
      kemiskinan: {
        heroValue: '4,05%',
        heroLabel: 'Tingkat Kemiskinan',
        metric1: { label: 'Kemiskinan Ekstrem', value: '0,20%' },
        metric2: { label: 'Sasaran Program', value: 'Pemberdayaan Terpadu' },
        keterangan: 'Integrasi jaminan sosial dan bantuan modal usaha produktif.'
      }
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik di Kota Bekasi',
      kesehatan: 'CKG Terealisasi 82,0%',
      bencana: 'Kesiapsiagaan Mitigasi Bencana Daerah',
      kemiskinan: 'Kemiskinan: 4,05% · Ekstrem: 0,20%'
    },
    catatanStrategis: 'Fokus koordinasi percepatan program prioritas nasional di Kota Bekasi.'
  },

  {
    id: 'kota-depok',
    kodeBps: '32.76',
    name: 'Kota Depok',
    level: 'kabupaten',
    parentProvinsiId: 'jawa-barat',
    lat: -6.4025,
    lng: 106.7942,
    zoom: 10,
    boundary: [
      [-6.3225, 106.7142],
      [-6.3225, 106.8742],
      [-6.4825, 106.8742],
      [-6.4825, 106.7142],
      [-6.3225, 106.7142]
    ],
    tingkatKemiskinan: '2,31%',
    kemiskinanEkstrem: '0,08%',
    imm: '0,76',
    isPrioritas: false,
    kategoriWilayah: 'Wilayah Reguler Pengawalan',
    ringkasanStrategis: 'Pengawalan capaian 4 pilar prioritas pembangunan dan perlindungan sosial di Kota Depok.',
    pillarDetails: {
      pendidikan: {
        heroValue: '58,0%',
        heroLabel: 'Revitalisasi Satdik',
        metric1: { label: 'Satdik Layak', value: '88% Standar Pelayanan' },
        metric2: { label: 'Akses Sekolah', value: '94% Terhubung Digital' },
        keterangan: 'Peningkatan sarana belajar dan mutu ruang kelas.'
      },
      kesehatan: {
        heroValue: '82,0%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Peserta Terlayani', value: '82,0% Target' },
        metric2: { label: 'Posyandu Aktif', value: 'Integrasi ILP Terpadu' },
        keterangan: 'Skrining kesehatan berkala di puskesmas pembantu.'
      },
      bencana: {
        heroValue: '90,0%',
        heroLabel: 'Kesiapsiagaan Bencana Daerah',
        metric1: { label: 'Mitigasi Bencana', value: 'Sistem Peringatan Dini' },
        metric2: { label: 'Jalur Evakuasi', value: 'Pemetaan Titik Kumpul' },
        keterangan: 'Latihan kontingensi berkala mitigasi bencana.'
      },
      kemiskinan: {
        heroValue: '2,31%',
        heroLabel: 'Tingkat Kemiskinan',
        metric1: { label: 'Kemiskinan Ekstrem', value: '0,08%' },
        metric2: { label: 'Sasaran Program', value: 'Pemberdayaan Terpadu' },
        keterangan: 'Integrasi jaminan sosial dan bantuan modal usaha produktif.'
      }
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik di Kota Depok',
      kesehatan: 'CKG Terealisasi 82,0%',
      bencana: 'Kesiapsiagaan Mitigasi Bencana Daerah',
      kemiskinan: 'Kemiskinan: 2,31% · Ekstrem: 0,08%'
    },
    catatanStrategis: 'Fokus koordinasi percepatan program prioritas nasional di Kota Depok.'
  },

  {
    id: 'kota-cimahi',
    kodeBps: '32.77',
    name: 'Kota Cimahi',
    level: 'kabupaten',
    parentProvinsiId: 'jawa-barat',
    lat: -6.8723,
    lng: 107.542,
    zoom: 10,
    boundary: [
      [-6.7923, 107.4620],
      [-6.7923, 107.6220],
      [-6.9523, 107.6220],
      [-6.9523, 107.4620],
      [-6.7923, 107.4620]
    ],
    tingkatKemiskinan: '5,02%',
    kemiskinanEkstrem: '0,32%',
    imm: '0,71',
    isPrioritas: false,
    kategoriWilayah: 'Wilayah Reguler Pengawalan',
    ringkasanStrategis: 'Pengawalan capaian 4 pilar prioritas pembangunan dan perlindungan sosial di Kota Cimahi.',
    pillarDetails: {
      pendidikan: {
        heroValue: '58,0%',
        heroLabel: 'Revitalisasi Satdik',
        metric1: { label: 'Satdik Layak', value: '88% Standar Pelayanan' },
        metric2: { label: 'Akses Sekolah', value: '94% Terhubung Digital' },
        keterangan: 'Peningkatan sarana belajar dan mutu ruang kelas.'
      },
      kesehatan: {
        heroValue: '82,0%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Peserta Terlayani', value: '82,0% Target' },
        metric2: { label: 'Posyandu Aktif', value: 'Integrasi ILP Terpadu' },
        keterangan: 'Skrining kesehatan berkala di puskesmas pembantu.'
      },
      bencana: {
        heroValue: '90,0%',
        heroLabel: 'Kesiapsiagaan Bencana Daerah',
        metric1: { label: 'Mitigasi Bencana', value: 'Sistem Peringatan Dini' },
        metric2: { label: 'Jalur Evakuasi', value: 'Pemetaan Titik Kumpul' },
        keterangan: 'Latihan kontingensi berkala mitigasi bencana.'
      },
      kemiskinan: {
        heroValue: '5,02%',
        heroLabel: 'Tingkat Kemiskinan',
        metric1: { label: 'Kemiskinan Ekstrem', value: '0,32%' },
        metric2: { label: 'Sasaran Program', value: 'Pemberdayaan Terpadu' },
        keterangan: 'Integrasi jaminan sosial dan bantuan modal usaha produktif.'
      }
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik di Kota Cimahi',
      kesehatan: 'CKG Terealisasi 82,0%',
      bencana: 'Kesiapsiagaan Mitigasi Bencana Daerah',
      kemiskinan: 'Kemiskinan: 5,02% · Ekstrem: 0,32%'
    },
    catatanStrategis: 'Fokus koordinasi percepatan program prioritas nasional di Kota Cimahi.'
  },

  {
    id: 'kota-tasikmalaya',
    kodeBps: '32.78',
    name: 'Kota Tasikmalaya',
    level: 'kabupaten',
    parentProvinsiId: 'jawa-barat',
    lat: -7.3274,
    lng: 108.2207,
    zoom: 10,
    boundary: [
      [-7.2474, 108.1407],
      [-7.2474, 108.3007],
      [-7.4074, 108.3007],
      [-7.4074, 108.1407],
      [-7.2474, 108.1407]
    ],
    tingkatKemiskinan: '11,53%',
    kemiskinanEkstrem: '1,35%',
    imm: '0,62',
    isPrioritas: true,
    kategoriWilayah: 'Wilayah Prioritas Percepatan',
    ringkasanStrategis: 'Pengawalan capaian 4 pilar prioritas pembangunan dan perlindungan sosial di Kota Tasikmalaya.',
    pillarDetails: {
      pendidikan: {
        heroValue: '58,0%',
        heroLabel: 'Revitalisasi Satdik',
        metric1: { label: 'Satdik Layak', value: '88% Standar Pelayanan' },
        metric2: { label: 'Akses Sekolah', value: '94% Terhubung Digital' },
        keterangan: 'Peningkatan sarana belajar dan mutu ruang kelas.'
      },
      kesehatan: {
        heroValue: '82,0%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Peserta Terlayani', value: '82,0% Target' },
        metric2: { label: 'Posyandu Aktif', value: 'Integrasi ILP Terpadu' },
        keterangan: 'Skrining kesehatan berkala di puskesmas pembantu.'
      },
      bencana: {
        heroValue: '90,0%',
        heroLabel: 'Kesiapsiagaan Bencana Daerah',
        metric1: { label: 'Mitigasi Bencana', value: 'Sistem Peringatan Dini' },
        metric2: { label: 'Jalur Evakuasi', value: 'Pemetaan Titik Kumpul' },
        keterangan: 'Latihan kontingensi berkala mitigasi bencana.'
      },
      kemiskinan: {
        heroValue: '11,53%',
        heroLabel: 'Tingkat Kemiskinan',
        metric1: { label: 'Kemiskinan Ekstrem', value: '1,35%' },
        metric2: { label: 'Sasaran Program', value: 'Pemberdayaan Terpadu' },
        keterangan: 'Integrasi jaminan sosial dan bantuan modal usaha produktif.'
      }
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik di Kota Tasikmalaya',
      kesehatan: 'CKG Terealisasi 82,0%',
      bencana: 'Kesiapsiagaan Mitigasi Bencana Daerah',
      kemiskinan: 'Kemiskinan: 11,53% · Ekstrem: 1,35%'
    },
    catatanStrategis: 'Fokus koordinasi percepatan program prioritas nasional di Kota Tasikmalaya.'
  },

  {
    id: 'kota-banjar',
    kodeBps: '32.79',
    name: 'Kota Banjar',
    level: 'kabupaten',
    parentProvinsiId: 'jawa-barat',
    lat: -7.3739,
    lng: 108.5342,
    zoom: 10,
    boundary: [
      [-7.2939, 108.4542],
      [-7.2939, 108.6142],
      [-7.4539, 108.6142],
      [-7.4539, 108.4542],
      [-7.2939, 108.4542]
    ],
    tingkatKemiskinan: '6,61%',
    kemiskinanEkstrem: '0,48%',
    imm: '0,64',
    isPrioritas: false,
    kategoriWilayah: 'Wilayah Reguler Pengawalan',
    ringkasanStrategis: 'Pengawalan capaian 4 pilar prioritas pembangunan dan perlindungan sosial di Kota Banjar.',
    pillarDetails: {
      pendidikan: {
        heroValue: '58,0%',
        heroLabel: 'Revitalisasi Satdik',
        metric1: { label: 'Satdik Layak', value: '88% Standar Pelayanan' },
        metric2: { label: 'Akses Sekolah', value: '94% Terhubung Digital' },
        keterangan: 'Peningkatan sarana belajar dan mutu ruang kelas.'
      },
      kesehatan: {
        heroValue: '82,0%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Peserta Terlayani', value: '82,0% Target' },
        metric2: { label: 'Posyandu Aktif', value: 'Integrasi ILP Terpadu' },
        keterangan: 'Skrining kesehatan berkala di puskesmas pembantu.'
      },
      bencana: {
        heroValue: '90,0%',
        heroLabel: 'Kesiapsiagaan Bencana Daerah',
        metric1: { label: 'Mitigasi Bencana', value: 'Sistem Peringatan Dini' },
        metric2: { label: 'Jalur Evakuasi', value: 'Pemetaan Titik Kumpul' },
        keterangan: 'Latihan kontingensi berkala mitigasi bencana.'
      },
      kemiskinan: {
        heroValue: '6,61%',
        heroLabel: 'Tingkat Kemiskinan',
        metric1: { label: 'Kemiskinan Ekstrem', value: '0,48%' },
        metric2: { label: 'Sasaran Program', value: 'Pemberdayaan Terpadu' },
        keterangan: 'Integrasi jaminan sosial dan bantuan modal usaha produktif.'
      }
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik di Kota Banjar',
      kesehatan: 'CKG Terealisasi 82,0%',
      bencana: 'Kesiapsiagaan Mitigasi Bencana Daerah',
      kemiskinan: 'Kemiskinan: 6,61% · Ekstrem: 0,48%'
    },
    catatanStrategis: 'Fokus koordinasi percepatan program prioritas nasional di Kota Banjar.'
  },

  // DKI Jakarta (Urut Kode BPS 31.01 s/d 31.75)
  {
    id: 'kepulauan-seribu',
    kodeBps: '31.01',
    name: 'Kab. Kepulauan Seribu',
    level: 'kabupaten',
    parentProvinsiId: 'dki-jakarta',
    lat: -5.6120,
    lng: 106.5620,
    zoom: 11,
    boundary: [
      [-5.420, 106.460],
      [-5.420, 106.760],
      [-5.980, 106.760],
      [-5.980, 106.460],
      [-5.420, 106.460],
    ],
    tingkatKemiskinan: '13,13%',
    kemiskinanEkstrem: '1,12%',
    imm: '0,63',
    isPrioritas: true,
    kategoriWilayah: 'Wilayah Kepulauan 3T Prioritas Khusus',
    ringkasanStrategis:
      'Fasilitasi transportasi laut untuk anak sekolah serta kepastian stok obat puskesmas pulau.',
    pillarDetails: {
      pendidikan: {
        heroValue: '87,5%',
        heroLabel: 'Revitalisasi Satdik',
        metric1: { label: 'Satdik Selesai', value: '28 / 32 satdik' },
        metric2: { label: 'Transportasi Laut', value: '12 Kapal Siswa Aktif' },
        keterangan: 'Subsidi operasional kapal sekolah antarpulau.',
      },
      kesehatan: {
        heroValue: '82,8%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Peserta Terlayani', value: '24 Ribu Jiwa' },
        metric2: { label: 'Ambulans Kapal', value: '4 Unit Siaga 24 Jam' },
        keterangan: 'Pemeriksaan rutin dan penanganan rujukan medis ke daratan.',
      },
      bencana: {
        heroValue: '91,0%',
        heroLabel: 'Mitigasi Cuaca Ekstrem Laut',
        metric1: { label: 'Tanggul Pemecah Ombak', value: '7 Pulau Utama' },
        metric2: { label: 'Cadangan Pangan', value: 'Depo Pulau Kelapa & Tidung' },
        keterangan: 'Kesiapsiagaan gelombang tinggi musim barat dan ketersediaan sembako.',
      },
      kemiskinan: {
        heroValue: '13,13%',
        heroLabel: 'Tingkat Kemiskinan',
        metric1: { label: 'Kemiskinan Ekstrem', value: '1,12%' },
        metric2: { label: 'Bantuan Nelayan', value: 'Subsidi BBM Kapal Nelayan' },
        keterangan: 'Bantuan tepat sasaran bagi nelayan pulau terluar.',
      },
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik: 28 / 32 satdik (87,5%)',
      kesehatan: 'CKG Terealisasi: 24 Ribu Jiwa (82,8%)',
      bencana: 'Mitigasi cuaca laut & ketersediaan cadangan pangan pulau',
      kemiskinan: 'Kemiskinan: 13,13% · Bantuan nelayan pulau terluar',
    },
    catatanStrategis:
      'Fasilitasi transportasi laut untuk anak sekolah serta kepastian stok obat di puskesmas pulau.',
  },
  {
    id: 'jakarta-pusat',
    kodeBps: '31.71',
    name: 'Kota Jakarta Pusat',
    level: 'kabupaten',
    parentProvinsiId: 'dki-jakarta',
    lat: -6.1805,
    lng: 106.8284,
    zoom: 13,
    boundary: [
      [-6.155, 106.810],
      [-6.155, 106.875],
      [-6.215, 106.875],
      [-6.215, 106.805],
      [-6.185, 106.800],
      [-6.155, 106.810],
    ],
    tingkatKemiskinan: '4,62%',
    kemiskinanEkstrem: '0,11%',
    imm: '0,74',
    isPrioritas: false,
    kategoriWilayah: 'Wilayah Urban Penataan Kantong Padat',
    ringkasanStrategis:
      'Penataan permukiman padat Johar Baru serta integrasi bantuan sosial bagi lansia rentan.',
    pillarDetails: {
      pendidikan: {
        heroValue: '94,7%',
        heroLabel: 'Revitalisasi Satdik',
        metric1: { label: 'Satdik Selesai', value: '142 / 150 satdik' },
        metric2: { label: 'Sekolah Adiwiyata', value: '88% Standar Hijau' },
        keterangan: 'Peningkatan ruang terbuka hijau sekolah di kawasan padat.',
      },
      kesehatan: {
        heroValue: '96,1%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Peserta Terlayani', value: '980 Ribu Jiwa' },
        metric2: { label: 'Skrining TB', value: 'Kampung Padat Johar Baru' },
        keterangan: 'Faskes terintegrasi puskesmas kecamatan 24 jam.',
      },
      bencana: {
        heroValue: '98,0%',
        heroLabel: 'Pengendalian Banjir Saluran',
        metric1: { label: 'Pompa Stasioner', value: '42 Rumah Pompa' },
        metric2: { label: 'Pengerukan Saluran', value: 'Normalisasi Kali Ciliwung' },
        keterangan: 'Mitigasi genangan musim hujan di kawasan pemukiman padat.',
      },
      kemiskinan: {
        heroValue: '4,62%',
        heroLabel: 'Tingkat Kemiskinan',
        metric1: { label: 'Kemiskinan Ekstrem', value: '0,11%' },
        metric2: { label: 'Fokus Bantuan', value: 'Lansia & Disabilitas Johar Baru' },
        keterangan: 'Integrasi data bansos DTSEN dan penataan sanitasi komunal.',
      },
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik: 142 / 150 satdik (94,7%)',
      kesehatan: 'CKG Terealisasi: 980 Ribu Jiwa (96,1%)',
      bencana: 'Mitigasi genangan pemukiman padat Johar Baru',
      kemiskinan: 'Intervensi sosial kantong padat Johar Baru',
    },
    catatanStrategis:
      'Penataan pemukiman padat Johar Baru serta integrasi bansos bagi lansia rentan.',
  },
  {
    id: 'jakarta-utara',
    kodeBps: '31.75',
    name: 'Kota Jakarta Utara',
    level: 'kabupaten',
    parentProvinsiId: 'dki-jakarta',
    lat: -6.1384,
    lng: 106.8642,
    zoom: 12,
    boundary: [
      [-6.085, 106.690],
      [-6.090, 106.970],
      [-6.160, 106.970],
      [-6.155, 106.770],
      [-6.120, 106.690],
      [-6.085, 106.690],
    ],
    tingkatKemiskinan: '6,78%',
    kemiskinanEkstrem: '0,35%',
    imm: '0,69',
    isPrioritas: true,
    kategoriWilayah: 'Wilayah Prioritas Penataan Pesisir & Rob',
    ringkasanStrategis:
      'Percepatan perlindungan pesisir dari rob serta penguatan ekonomi nelayan tradisional Kalibaru.',
    pillarDetails: {
      pendidikan: {
        heroValue: '88,1%',
        heroLabel: 'Revitalisasi Satdik',
        metric1: { label: 'Satdik Selesai', value: '185 / 210 satdik' },
        metric2: { label: 'Peninggian Gedung', value: '28 Sekolah Rawan Rob' },
        keterangan: 'Peninggian lantai sekolah pesisir di Cilincing dan Penjaringan.',
      },
      kesehatan: {
        heroValue: '87,5%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Peserta Terlayani', value: '1,4 Juta Jiwa' },
        metric2: { label: 'Skrining TB Nelayan', value: 'Pelacakan Aktif Kampung Pesisir' },
        keterangan: 'Pemeriksaan rutin penyakit ISPA dan kulit di permukiman padat nelayan.',
      },
      bencana: {
        heroValue: '93,0%',
        heroLabel: 'Tanggul Pengaman NCICD',
        metric1: { label: 'Tanggul Pantai', value: '6,8 Km Cilincing-Kalibaru' },
        metric2: { label: 'Pompa Air Rob', value: '38 Pompa Kapasitas Tinggi' },
        keterangan: 'Perlindungan pemukiman warga dari rob pasang surut laut Jawa.',
      },
      kemiskinan: {
        heroValue: '6,78%',
        heroLabel: 'Tingkat Kemiskinan',
        metric1: { label: 'Kemiskinan Ekstrem', value: '0,35%' },
        metric2: { label: 'Kantong Pesisir', value: 'Kalibaru & Kamal Muara' },
        keterangan: 'Bantuan modal usaha pengolahan ikan asin dan perbaikan sanitasi jamban sehat.',
      },
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik: 185 / 210 satdik (88,1%)',
      kesehatan: 'CKG Terealisasi: 1,4 Juta Jiwa (87,5%)',
      bencana: 'Pengamanan tanggul rob pesisir Penjaringan & Cilincing',
      kemiskinan: 'Prioritas intervensi kantong kemiskinan Kalibaru',
    },
    catatanStrategis:
      'Percepatan perlindungan pesisir dari rob serta penguatan ekonomi nelayan tradisional Kalibaru.',
  },

  // Jawa Barat (Urut Kode BPS 32.01 s/d 32.73)
  {
    id: 'bogor',
    kodeBps: '32.01',
    name: 'Kabupaten Bogor',
    level: 'kabupaten',
    parentProvinsiId: 'jawa-barat',
    lat: -6.5950,
    lng: 106.8167,
    zoom: 11,
    boundary: [
      [-6.380, 106.650],
      [-6.380, 107.050],
      [-6.750, 107.000],
      [-6.780, 106.550],
      [-6.500, 106.500],
      [-6.380, 106.650],
    ],
    tingkatKemiskinan: '7,33%',
    kemiskinanEkstrem: '0,68%',
    imm: '0,59',
    isPrioritas: false,
    kategoriWilayah: 'Wilayah Penyangga Metropolitan',
    ringkasanStrategis:
      'Pengendalian daerah resapan hulu Ciliwung dan pengentasan kantong kemiskinan Bogor Barat.',
    pillarDetails: {
      pendidikan: {
        heroValue: '56,0%',
        heroLabel: 'Revitalisasi Satdik',
        metric1: { label: 'Satdik Selesai', value: '820 / 1.460 satdik' },
        metric2: { label: 'Ruang Kelas Baru', value: '310 RKB Wilayah Pelosok' },
        keterangan: 'Rehabilitasi gedung SD rawan longsor di kawasan perbukitan.',
      },
      kesehatan: {
        heroValue: '78,4%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Peserta Terlayani', value: '4,1 Juta Jiwa' },
        metric2: { label: 'Puskesmas 24 Jam', value: '38 Unit Rawat Inap' },
        keterangan: 'Pemeriksaan stunting dan gizi terpadu di desa perbatasan Banten.',
      },
      bencana: {
        heroValue: '88,0%',
        heroLabel: 'Mitigasi Bencana Longsor Puncak',
        metric1: { label: 'Bendungan Ciawi-Sukamahi', value: 'Reduksi Banjir 30%' },
        metric2: { label: 'Penghijauan Hulu', value: '1.200 Hektar Hutan Lindung' },
        keterangan: 'Pengendalian tata ruang kawasan resapan air Puncak.',
      },
      kemiskinan: {
        heroValue: '7,33%',
        heroLabel: 'Tingkat Kemiskinan',
        metric1: { label: 'Kemiskinan Ekstrem', value: '0,68%' },
        metric2: { label: 'Lokus Fokus', value: 'Bogor Barat (Jasinga, Cigudeg)' },
        keterangan: 'Pemberdayaan UMKM pengolahan hasil kebun dan padat karya irigasi.',
      },
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik: 820 / 1.460 satdik (56,0%)',
      kesehatan: 'CKG Terealisasi: 4,1 Juta Jiwa (78,4%)',
      bencana: 'Mitigasi Longsor Puncak & Pengendalian Hulu Ciliwung',
      kemiskinan: 'Kemiskinan: 7,33% · Fokus Bogor Barat',
    },
    catatanStrategis:
      'Penguatan fasilitas sanitasi dan akses jalan desa di wilayah barat Kabupaten Bogor.',
  },
  {
    id: 'cianjur',
    kodeBps: '32.03',
    name: 'Kabupaten Cianjur',
    level: 'kabupaten',
    parentProvinsiId: 'jawa-barat',
    lat: -6.8220,
    lng: 107.1390,
    zoom: 11,
    boundary: [
      [-6.650, 107.020],
      [-6.720, 107.350],
      [-7.480, 107.380],
      [-7.520, 107.150],
      [-7.150, 106.980],
      [-6.780, 107.000],
      [-6.650, 107.020],
    ],
    tingkatKemiskinan: '10,98%',
    kemiskinanEkstrem: '1,78%',
    imm: '0,53',
    isPrioritas: true,
    kategoriWilayah: 'Wilayah Prioritas Pemulihan Bencana & Kemiskinan',
    ringkasanStrategis:
      'Percepatan penyelesaian huntap relokasi gempa dan bantuan stimulan rumah rusak tahap IV.',
    pillarDetails: {
      pendidikan: {
        heroValue: '47,2%',
        heroLabel: 'Revitalisasi Satdik Tahan Gempa',
        metric1: { label: 'Satdik Selesai', value: '340 / 720 satdik' },
        metric2: { label: 'Madrasah Terdampak', value: '41 Unit Selesai ABT' },
        keterangan: 'Penerapan struktur bangunan tahan gempa di sepanjang jalur patahan Cugenang.',
      },
      kesehatan: {
        heroValue: '74,8%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Peserta Terlayani', value: '1,6 Juta Jiwa' },
        metric2: { label: 'Trauma Healing', value: '18 Posko Aktif Puskesmas' },
        keterangan: 'Pemulihan psikososial anak sekolah dan penanganan stunting anak gempa.',
      },
      bencana: {
        heroValue: '4,3%',
        heroLabel: 'Realisasi Huntap Pascagempa',
        metric1: { label: 'Huntap Terbangun', value: '1.707 dari 39.501 unit' },
        metric2: { label: 'Huntara Mandiri', value: '20.267 Unit Masih Dihuni' },
        keterangan: 'RTM Satgas PRRP untuk penyelesaian status lahan relokasi dan verifikasi stimulan.',
      },
      kemiskinan: {
        heroValue: '10,98%',
        heroLabel: 'Tingkat Kemiskinan Terkini',
        metric1: { label: 'Kemiskinan Ekstrem', value: '1,78%' },
        metric2: { label: 'Dampak Bencana', value: 'Kehilangan Aset Produktif Gempa' },
        keterangan: 'Reaktivasi mata pencaharian pertanian sayur dan bantuan stimulan ekonomi.',
      },
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik: 340 / 720 satdik (47,2%)',
      kesehatan: 'CKG Terealisasi: 1,6 Juta Jiwa (74,8%)',
      bencana: 'Huntap: 1.707 unit (4,3%) · Huntara: 20.267 unit (99%)',
      kemiskinan: 'Kemiskinan: 10,98% · Intervensi pascabencana',
    },
    catatanStrategis:
      'RTM Satgas PRRP Sumatera/Jabar untuk percepatan penyelesaian lahan huntap dan ABT madrasah.',
  },
  {
    id: 'garut',
    kodeBps: '32.05',
    name: 'Kabupaten Garut',
    level: 'kabupaten',
    parentProvinsiId: 'jawa-barat',
    lat: -7.2270,
    lng: 107.9080,
    zoom: 11,
    boundary: [
      [-6.980, 107.820],
      [-7.120, 108.150],
      [-7.750, 108.050],
      [-7.780, 107.650],
      [-7.350, 107.550],
      [-6.980, 107.820],
    ],
    tingkatKemiskinan: '11,45%',
    kemiskinanEkstrem: '1,65%',
    imm: '0,54',
    isPrioritas: true,
    kategoriWilayah: 'Wilayah Prioritas Pengentasan Kemiskinan Jabar Selatan',
    ringkasanStrategis:
      'Percepatan intervensi penurunan kemiskinan ekstrem dan mitigasi banjir bandang DAS Cimanuk.',
    pillarDetails: {
      pendidikan: {
        heroValue: '48,0%',
        heroLabel: 'Revitalisasi Satdik',
        metric1: { label: 'Satdik Selesai', value: '410 / 854 satdik' },
        metric2: { label: 'Ruang Kelas Layak', value: '180 Satdik Garut Selatan' },
        keterangan: 'Renovasi gedung sekolah terpencil di Cibalong dan Pameungpeuk.',
      },
      kesehatan: {
        heroValue: '76,1%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Peserta Terlayani', value: '1,9 Juta Jiwa' },
        metric2: { label: 'Prevalensi Stunting', value: 'Intervensi Khusus 24 Desa' },
        keterangan: 'Pemberian gizi spesifik balita dan skrining anemia calon pengantin.',
      },
      bencana: {
        heroValue: '90,0%',
        heroLabel: 'Normalisasi DAS Cimanuk',
        metric1: { label: 'Tanggul Sungai', value: '8,4 Km Diperkuat' },
        metric2: { label: 'EWS Banjir Bandang', value: '12 Sensor Aktif' },
        keterangan: 'Kesiapsiagaan musim hujan di kawasan perkotaan Garut.',
      },
      kemiskinan: {
        heroValue: '11,45%',
        heroLabel: 'Tingkat Kemiskinan',
        metric1: { label: 'Kemiskinan Ekstrem', value: '1,65%' },
        metric2: { label: 'Klaster Wilayah', value: 'Garut Selatan & Pesisir' },
        keterangan: 'Graduasi bansos PKH melalui klaster industri kulit dan petani jagung.',
      },
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik: 410 / 854 satdik (48,0%)',
      kesehatan: 'CKG Terealisasi: 1,9 Juta Jiwa (76,1%)',
      bencana: 'Mitigasi Banjir Bandang Cimanuk & Tanah Longsor',
      kemiskinan: 'Kemiskinan: 11,45% · Ekstrem: 1,65%',
    },
    catatanStrategis:
      'Peningkatan konektivitas jalan poros Garut Selatan untuk mempermudah akses faskes rujukan.',
  },
];

// 4. DATA TINGKAT KECAMATAN (Kabupaten Cianjur: 32.03 & Jakarta Utara: 31.75)
export const KECAMATAN_DATA: WilayahData[] = [
  {
    id: 'kec-agrabinta',
    kodeBps: '32.03.01',
    name: 'Kecamatan Agrabinta',
    level: 'kecamatan',
    parentProvinsiId: 'jawa-barat',
    parentKabKotaId: 'cianjur',
    lat: -7.38,
    lng: 106.95,
    zoom: 12,
    boundary: [
      [-7.3400, 106.9100],
      [-7.3400, 106.9900],
      [-7.4200, 106.9900],
      [-7.4200, 106.9100],
      [-7.3400, 106.9100]
    ],
    tingkatKemiskinan: '12,40%',
    kemiskinanEkstrem: '1,65%',
    imm: '0,49',
    isPrioritas: true,
    kategoriWilayah: 'Wilayah Prioritas Percepatan',
    ringkasanStrategis: 'Pelaksanaan program pembangunan terpadu dan pengawalan 4 pilar di Kecamatan Agrabinta.',
    pillarDetails: {
      pendidikan: {
        heroValue: '62,0%',
        heroLabel: 'Revitalisasi Satdik',
        metric1: { label: 'Ruang Kelas', value: 'Standar Memadai' },
        metric2: { label: 'Akses Digital', value: 'Sekolah Terkoneksi' },
        keterangan: 'Peningkatan fasilitas belajar dan sarana mengajar.'
      },
      kesehatan: {
        heroValue: '85,0%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Peserta', value: 'Warga Terlayani' },
        metric2: { label: 'Puskesmas', value: 'Layanan Aktif 24 Jam' },
        keterangan: 'Skrining kesehatan berkala dan posyandu ILP.'
      },
      bencana: {
        heroValue: '92,0%',
        heroLabel: 'Mitigasi Bencana Wilayah',
        metric1: { label: 'Jalur Evakuasi', value: 'Rambu Siaga Aktif' },
        metric2: { label: 'Relawan BPBD', value: 'Posko Siaga' },
        keterangan: 'Penguatan kesiapsiagaan warga terhadap ancaman gempa dan longsor.'
      },
      kemiskinan: {
        heroValue: '12,40%',
        heroLabel: 'Tingkat Kemiskinan',
        metric1: { label: 'Kemiskinan Ekstrem', value: '1,65%' },
        metric2: { label: 'Intervensi', value: 'Desil 1-2 Terpadu' },
        keterangan: 'Bansos tepat sasaran dan pelatihan keterampilan kerja lokal.'
      }
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik di Kecamatan Agrabinta',
      kesehatan: 'Cek Kesehatan Terpadu Masyarakat',
      bencana: 'Kesiapsiagaan Posko Kebencanaan',
      kemiskinan: 'Kemiskinan: 12,40% · Ekstrem: 1,65%'
    },
    catatanStrategis: 'Pengawalan program perlindungan sosial terpadu dan mitigasi bencana di Kecamatan Agrabinta.'
  },

  {
    id: 'kec-cibeber',
    kodeBps: '32.03.04',
    name: 'Kecamatan Cibeber',
    level: 'kecamatan',
    parentProvinsiId: 'jawa-barat',
    parentKabKotaId: 'cianjur',
    lat: -6.95,
    lng: 107.12,
    zoom: 12,
    boundary: [
      [-6.9100, 107.0800],
      [-6.9100, 107.1600],
      [-6.9900, 107.1600],
      [-6.9900, 107.0800],
      [-6.9100, 107.0800]
    ],
    tingkatKemiskinan: '9,80%',
    kemiskinanEkstrem: '1,05%',
    imm: '0,55',
    isPrioritas: false,
    kategoriWilayah: 'Wilayah Reguler Pengawalan',
    ringkasanStrategis: 'Pelaksanaan program pembangunan terpadu dan pengawalan 4 pilar di Kecamatan Cibeber.',
    pillarDetails: {
      pendidikan: {
        heroValue: '62,0%',
        heroLabel: 'Revitalisasi Satdik',
        metric1: { label: 'Ruang Kelas', value: 'Standar Memadai' },
        metric2: { label: 'Akses Digital', value: 'Sekolah Terkoneksi' },
        keterangan: 'Peningkatan fasilitas belajar dan sarana mengajar.'
      },
      kesehatan: {
        heroValue: '85,0%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Peserta', value: 'Warga Terlayani' },
        metric2: { label: 'Puskesmas', value: 'Layanan Aktif 24 Jam' },
        keterangan: 'Skrining kesehatan berkala dan posyandu ILP.'
      },
      bencana: {
        heroValue: '92,0%',
        heroLabel: 'Mitigasi Bencana Wilayah',
        metric1: { label: 'Jalur Evakuasi', value: 'Rambu Siaga Aktif' },
        metric2: { label: 'Relawan BPBD', value: 'Posko Siaga' },
        keterangan: 'Penguatan kesiapsiagaan warga terhadap ancaman gempa dan longsor.'
      },
      kemiskinan: {
        heroValue: '9,80%',
        heroLabel: 'Tingkat Kemiskinan',
        metric1: { label: 'Kemiskinan Ekstrem', value: '1,05%' },
        metric2: { label: 'Intervensi', value: 'Desil 1-2 Terpadu' },
        keterangan: 'Bansos tepat sasaran dan pelatihan keterampilan kerja lokal.'
      }
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik di Kecamatan Cibeber',
      kesehatan: 'Cek Kesehatan Terpadu Masyarakat',
      bencana: 'Kesiapsiagaan Posko Kebencanaan',
      kemiskinan: 'Kemiskinan: 9,80% · Ekstrem: 1,05%'
    },
    catatanStrategis: 'Pengawalan program perlindungan sosial terpadu dan mitigasi bencana di Kecamatan Cibeber.'
  },

  {
    id: 'kec-warungkondang',
    kodeBps: '32.03.03',
    name: 'Kecamatan Warungkondang',
    level: 'kecamatan',
    parentProvinsiId: 'jawa-barat',
    parentKabKotaId: 'cianjur',
    lat: -6.88,
    lng: 107.08,
    zoom: 12,
    boundary: [
      [-6.8400, 107.0400],
      [-6.8400, 107.1200],
      [-6.9200, 107.1200],
      [-6.9200, 107.0400],
      [-6.8400, 107.0400]
    ],
    tingkatKemiskinan: '9,10%',
    kemiskinanEkstrem: '0,95%',
    imm: '0,56',
    isPrioritas: false,
    kategoriWilayah: 'Wilayah Reguler Pengawalan',
    ringkasanStrategis: 'Pelaksanaan program pembangunan terpadu dan pengawalan 4 pilar di Kecamatan Warungkondang.',
    pillarDetails: {
      pendidikan: {
        heroValue: '62,0%',
        heroLabel: 'Revitalisasi Satdik',
        metric1: { label: 'Ruang Kelas', value: 'Standar Memadai' },
        metric2: { label: 'Akses Digital', value: 'Sekolah Terkoneksi' },
        keterangan: 'Peningkatan fasilitas belajar dan sarana mengajar.'
      },
      kesehatan: {
        heroValue: '85,0%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Peserta', value: 'Warga Terlayani' },
        metric2: { label: 'Puskesmas', value: 'Layanan Aktif 24 Jam' },
        keterangan: 'Skrining kesehatan berkala dan posyandu ILP.'
      },
      bencana: {
        heroValue: '92,0%',
        heroLabel: 'Mitigasi Bencana Wilayah',
        metric1: { label: 'Jalur Evakuasi', value: 'Rambu Siaga Aktif' },
        metric2: { label: 'Relawan BPBD', value: 'Posko Siaga' },
        keterangan: 'Penguatan kesiapsiagaan warga terhadap ancaman gempa dan longsor.'
      },
      kemiskinan: {
        heroValue: '9,10%',
        heroLabel: 'Tingkat Kemiskinan',
        metric1: { label: 'Kemiskinan Ekstrem', value: '0,95%' },
        metric2: { label: 'Intervensi', value: 'Desil 1-2 Terpadu' },
        keterangan: 'Bansos tepat sasaran dan pelatihan keterampilan kerja lokal.'
      }
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik di Kecamatan Warungkondang',
      kesehatan: 'Cek Kesehatan Terpadu Masyarakat',
      bencana: 'Kesiapsiagaan Posko Kebencanaan',
      kemiskinan: 'Kemiskinan: 9,10% · Ekstrem: 0,95%'
    },
    catatanStrategis: 'Pengawalan program perlindungan sosial terpadu dan mitigasi bencana di Kecamatan Warungkondang.'
  },

  {
    id: 'kec-cilaku',
    kodeBps: '32.03.05',
    name: 'Kecamatan Cilaku',
    level: 'kecamatan',
    parentProvinsiId: 'jawa-barat',
    parentKabKotaId: 'cianjur',
    lat: -6.86,
    lng: 107.15,
    zoom: 12,
    boundary: [
      [-6.8200, 107.1100],
      [-6.8200, 107.1900],
      [-6.9000, 107.1900],
      [-6.9000, 107.1100],
      [-6.8200, 107.1100]
    ],
    tingkatKemiskinan: '8,90%',
    kemiskinanEkstrem: '0,88%',
    imm: '0,57',
    isPrioritas: false,
    kategoriWilayah: 'Wilayah Reguler Pengawalan',
    ringkasanStrategis: 'Pelaksanaan program pembangunan terpadu dan pengawalan 4 pilar di Kecamatan Cilaku.',
    pillarDetails: {
      pendidikan: {
        heroValue: '62,0%',
        heroLabel: 'Revitalisasi Satdik',
        metric1: { label: 'Ruang Kelas', value: 'Standar Memadai' },
        metric2: { label: 'Akses Digital', value: 'Sekolah Terkoneksi' },
        keterangan: 'Peningkatan fasilitas belajar dan sarana mengajar.'
      },
      kesehatan: {
        heroValue: '85,0%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Peserta', value: 'Warga Terlayani' },
        metric2: { label: 'Puskesmas', value: 'Layanan Aktif 24 Jam' },
        keterangan: 'Skrining kesehatan berkala dan posyandu ILP.'
      },
      bencana: {
        heroValue: '92,0%',
        heroLabel: 'Mitigasi Bencana Wilayah',
        metric1: { label: 'Jalur Evakuasi', value: 'Rambu Siaga Aktif' },
        metric2: { label: 'Relawan BPBD', value: 'Posko Siaga' },
        keterangan: 'Penguatan kesiapsiagaan warga terhadap ancaman gempa dan longsor.'
      },
      kemiskinan: {
        heroValue: '8,90%',
        heroLabel: 'Tingkat Kemiskinan',
        metric1: { label: 'Kemiskinan Ekstrem', value: '0,88%' },
        metric2: { label: 'Intervensi', value: 'Desil 1-2 Terpadu' },
        keterangan: 'Bansos tepat sasaran dan pelatihan keterampilan kerja lokal.'
      }
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik di Kecamatan Cilaku',
      kesehatan: 'Cek Kesehatan Terpadu Masyarakat',
      bencana: 'Kesiapsiagaan Posko Kebencanaan',
      kemiskinan: 'Kemiskinan: 8,90% · Ekstrem: 0,88%'
    },
    catatanStrategis: 'Pengawalan program perlindungan sosial terpadu dan mitigasi bencana di Kecamatan Cilaku.'
  },

  {
    id: 'kec-pacet',
    kodeBps: '32.03.08',
    name: 'Kecamatan Pacet',
    level: 'kecamatan',
    parentProvinsiId: 'jawa-barat',
    parentKabKotaId: 'cianjur',
    lat: -6.75,
    lng: 107.05,
    zoom: 12,
    boundary: [
      [-6.7100, 107.0100],
      [-6.7100, 107.0900],
      [-6.7900, 107.0900],
      [-6.7900, 107.0100],
      [-6.7100, 107.0100]
    ],
    tingkatKemiskinan: '7,20%',
    kemiskinanEkstrem: '0,62%',
    imm: '0,62',
    isPrioritas: false,
    kategoriWilayah: 'Wilayah Reguler Pengawalan',
    ringkasanStrategis: 'Pelaksanaan program pembangunan terpadu dan pengawalan 4 pilar di Kecamatan Pacet.',
    pillarDetails: {
      pendidikan: {
        heroValue: '62,0%',
        heroLabel: 'Revitalisasi Satdik',
        metric1: { label: 'Ruang Kelas', value: 'Standar Memadai' },
        metric2: { label: 'Akses Digital', value: 'Sekolah Terkoneksi' },
        keterangan: 'Peningkatan fasilitas belajar dan sarana mengajar.'
      },
      kesehatan: {
        heroValue: '85,0%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Peserta', value: 'Warga Terlayani' },
        metric2: { label: 'Puskesmas', value: 'Layanan Aktif 24 Jam' },
        keterangan: 'Skrining kesehatan berkala dan posyandu ILP.'
      },
      bencana: {
        heroValue: '92,0%',
        heroLabel: 'Mitigasi Bencana Wilayah',
        metric1: { label: 'Jalur Evakuasi', value: 'Rambu Siaga Aktif' },
        metric2: { label: 'Relawan BPBD', value: 'Posko Siaga' },
        keterangan: 'Penguatan kesiapsiagaan warga terhadap ancaman gempa dan longsor.'
      },
      kemiskinan: {
        heroValue: '7,20%',
        heroLabel: 'Tingkat Kemiskinan',
        metric1: { label: 'Kemiskinan Ekstrem', value: '0,62%' },
        metric2: { label: 'Intervensi', value: 'Desil 1-2 Terpadu' },
        keterangan: 'Bansos tepat sasaran dan pelatihan keterampilan kerja lokal.'
      }
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik di Kecamatan Pacet',
      kesehatan: 'Cek Kesehatan Terpadu Masyarakat',
      bencana: 'Kesiapsiagaan Posko Kebencanaan',
      kemiskinan: 'Kemiskinan: 7,20% · Ekstrem: 0,62%'
    },
    catatanStrategis: 'Pengawalan program perlindungan sosial terpadu dan mitigasi bencana di Kecamatan Pacet.'
  },

  // Cianjur (Urut Kode BPS 32.03.01 s/d 32.03.08)
  {
    id: 'kec-cianjur',
    kodeBps: '32.03.01',
    name: 'Kecamatan Cianjur',
    level: 'kecamatan',
    parentProvinsiId: 'jawa-barat',
    parentKabKotaId: 'cianjur',
    lat: -6.8150,
    lng: 107.1400,
    zoom: 13,
    boundary: [
      [-6.800, 107.120],
      [-6.800, 107.160],
      [-6.835, 107.160],
      [-6.835, 107.120],
      [-6.800, 107.120],
    ],
    tingkatKemiskinan: '8,42%',
    kemiskinanEkstrem: '0,88%',
    imm: '0,62',
    isPrioritas: false,
    kategoriWilayah: 'Wilayah Pusat Pemerintahan & Urban',
    ringkasanStrategis:
      'Penataan kawasan komersial perkotaan dan integrasi perlindungan sosial fakir miskin kota.',
    pillarDetails: {
      pendidikan: {
        heroValue: '78,0%',
        heroLabel: 'Revitalisasi Satdik',
        metric1: { label: 'Satdik Selesai', value: '48 / 62 satdik' },
        metric2: { label: 'Sekolah Digital', value: '100% Akses Internet' },
        keterangan: 'Peningkatan fasilitas sekolah inklusi dan perpustakaan digital.',
      },
      kesehatan: {
        heroValue: '86,4%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Peserta Terlayani', value: '142 Ribu Jiwa' },
        metric2: { label: 'Skrining TB', value: 'Puskesmas Perkotaan Terpadu' },
        keterangan: 'Layanan terpadu penyakit tidak menular bagi kelompok lansia.',
      },
      bencana: {
        heroValue: '96,0%',
        heroLabel: 'Mitigasi Bencana Perkotaan',
        metric1: { label: 'Drainase Utama', value: 'Pengerukan Saluran Primer' },
        metric2: { label: 'Jalur Evakuasi', value: 'Rambu Siaga Gempa Kota' },
        keterangan: 'Simulasi kesiapsiagaan bencana di gedung perkantoran dan sekolah.',
      },
      kemiskinan: {
        heroValue: '8,42%',
        heroLabel: 'Tingkat Kemiskinan',
        metric1: { label: 'Kemiskinan Ekstrem', value: '0,88%' },
        metric2: { label: 'Bantuan Sosial', value: 'Bansos Desil 1–2 Tersalur' },
        keterangan: 'Pemberdayaan pedagang mikro pasar tradisional.',
      },
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik: 48 / 62 satdik (78,0%)',
      kesehatan: 'CKG Terealisasi: 142 Ribu Jiwa (86,4%)',
      bencana: 'Mitigasi drainase perkotaan & jalur evakuasi',
      kemiskinan: 'Kemiskinan: 8,42% · Ekstrem: 0,88%',
    },
    catatanStrategis:
      'Penataan sanitasi pemukiman padat sekitar bantaran sungai perkotaan Cianjur.',
  },
  {
    id: 'kec-cugenang',
    kodeBps: '32.03.08',
    name: 'Kecamatan Cugenang',
    level: 'kecamatan',
    parentProvinsiId: 'jawa-barat',
    parentKabKotaId: 'cianjur',
    lat: -6.8040,
    lng: 107.0980,
    zoom: 13,
    boundary: [
      [-6.760, 107.050],
      [-6.760, 107.130],
      [-6.840, 107.130],
      [-6.840, 107.050],
      [-6.760, 107.050],
    ],
    tingkatKemiskinan: '14,20%',
    kemiskinanEkstrem: '2,15%',
    imm: '0,52',
    isPrioritas: true,
    kategoriWilayah: 'Episentrum Bencana Gempa & Prioritas Khusus',
    ringkasanStrategis:
      'Percepatan verifikasi dana stimulan rumah rusak tahap IV dan penyelesaian hunian tetap relokasi.',
    pillarDetails: {
      pendidikan: {
        heroValue: '58,0%',
        heroLabel: 'Revitalisasi Satdik Tahan Gempa',
        metric1: { label: 'Satdik Selesai', value: '28 / 48 satdik' },
        metric2: { label: 'Madrasah Terdampak', value: '12 Madrasah Selesai ABT' },
        keterangan: 'Konstruksi tahan gempa dengan verifikasi teknis Kementerian PUPR.',
      },
      kesehatan: {
        heroValue: '79,0%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Peserta Terlayani', value: '88 Ribu Jiwa' },
        metric2: { label: 'Trauma Healing', value: '3 Posko Khusus Anak Aktif' },
        keterangan: 'Layanan medis jemput bola ke pemukiman huntara mandiri.',
      },
      bencana: {
        heroValue: '4,1%',
        heroLabel: 'Penyelesaian Huntap Episentrum',
        metric1: { label: 'Huntap Terbangun', value: '480 dari 11.200 unit' },
        metric2: { label: 'Huntara Mandiri', value: '8.400 Unit Masih Dihuni' },
        keterangan: 'Penyelesaian sertifikasi tanah relokasi dan verifikasi stimulan tahap IV.',
      },
      kemiskinan: {
        heroValue: '14,20%',
        heroLabel: 'Tingkat Kemiskinan Dampak Gempa',
        metric1: { label: 'Kemiskinan Ekstrem', value: '2,15%' },
        metric2: { label: 'Pemulihan Usaha', value: 'Reaktivasi Tani Hortikultura' },
        keterangan: 'Penyaluran bibit sayuran dan penggantian peralatan pertanian rusak.',
      },
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik: 28 / 48 satdik (58,0%) tahan gempa',
      kesehatan: 'CKG Terealisasi: 88 Ribu Jiwa (79,0%)',
      bencana: 'Episentrum gempa: 8.400 KK huntara mandiri butuh huntap',
      kemiskinan: 'Kemiskinan: 14,20% akibat kehilangan aset gempa',
    },
    catatanStrategis:
      'Fokus pengawalan penyelesaian sertifikasi tanah relokasi dan verifikasi stimulan tahap IV.',
  },

  // Jakarta Utara (Kode BPS 31.75.05)
  {
    id: 'kec-cilincing',
    kodeBps: '31.75.05',
    name: 'Kecamatan Cilincing',
    level: 'kecamatan',
    parentProvinsiId: 'dki-jakarta',
    parentKabKotaId: 'jakarta-utara',
    lat: -6.1280,
    lng: 106.9320,
    zoom: 13,
    boundary: [
      [-6.085, 106.900],
      [-6.085, 106.970],
      [-6.160, 106.970],
      [-6.160, 106.900],
      [-6.085, 106.900],
    ],
    tingkatKemiskinan: '7,85%',
    kemiskinanEkstrem: '0,42%',
    imm: '0,67',
    isPrioritas: true,
    kategoriWilayah: 'Wilayah Prioritas Penataan Pesisir & Rob',
    ringkasanStrategis:
      'Percepatan pengamanan tanggul pesisir dan penanganan kantong kemiskinan Kalibaru.',
    pillarDetails: {
      pendidikan: {
        heroValue: '86,0%',
        heroLabel: 'Revitalisasi Satdik',
        metric1: { label: 'Satdik Selesai', value: '42 / 49 satdik' },
        metric2: { label: 'Peninggian Bangunan', value: '8 Sekolah Bebas Rob' },
        keterangan: 'Penyediaan sarana sanitasi bersih bagi anak-anak kampung nelayan.',
      },
      kesehatan: {
        heroValue: '88,0%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Peserta Terlayani', value: '380 Ribu Jiwa' },
        metric2: { label: 'Skrining TB Pesisir', value: '1.240 Kasus Terpantau' },
        keterangan: 'Posyandu integrasi layanan primer aktif setiap minggu.',
      },
      bencana: {
        heroValue: '94,0%',
        heroLabel: 'Pengamanan Tanggul Pantai',
        metric1: { label: 'Tanggul NCICD', value: '3,2 Km Wilayah Cilincing' },
        metric2: { label: 'Rumah Pompa', value: '12 Pompa Siaga Penuh' },
        keterangan: 'Perlindungan pemukiman warga dari genangan banjir pasang laut.',
      },
      kemiskinan: {
        heroValue: '7,85%',
        heroLabel: 'Tingkat Kemiskinan',
        metric1: { label: 'Kemiskinan Ekstrem', value: '0,42%' },
        metric2: { label: 'Sasaran Utama', value: 'Kantong Nelayan Kalibaru' },
        keterangan: 'Bantuan sosial terpadu keluarga prasejahtera pesisir.',
      },
    },
    pillars: {
      pendidikan: 'Revitalisasi Satdik: 42 / 49 satdik (86,0%)',
      kesehatan: 'CKG Terealisasi: 380 Ribu Jiwa (88,0%)',
      bencana: 'Pengamanan tanggul rob pesisir Kalibaru & Cilincing',
      kemiskinan: 'Kemiskinan: 7,85% · Nelayan tradisional pesisir',
    },
    catatanStrategis:
      'Percepatan pembangunan tanggul pengaman pantai dan bantuan sanitasi layak.',
  },
];

// 5. DATA TINGKAT DESA / KELURAHAN (Kecamatan Cugenang: 32.03.08 & Cilincing: 31.75.05)
export const DESA_DATA: WilayahData[] = [
  // Cugenang - Cianjur (Urut Kode BPS 32.03.08.2001 s/d 32.03.08.2002)
  {
    id: 'desa-gasol',
    kodeBps: '32.03.08.2001',
    name: 'Desa Gasol',
    level: 'desa',
    parentProvinsiId: 'jawa-barat',
    parentKabKotaId: 'cianjur',
    parentKecamatanId: 'kec-cugenang',
    lat: -6.8080,
    lng: 107.1020,
    zoom: 15,
    boundary: [
      [-6.795, 107.090],
      [-6.795, 107.115],
      [-6.820, 107.115],
      [-6.820, 107.090],
      [-6.795, 107.090],
    ],
    tingkatKemiskinan: '15,40%',
    kemiskinanEkstrem: '2,40%',
    imm: '0,51',
    isPrioritas: true,
    kategoriWilayah: 'Zona Merah Patahan Aktif Gempa',
    ringkasanStrategis:
      'Percepatan pencairan dana stimulan rumah rusak tahap IV dan pemulihan mata pencaharian pertanian sayur.',
    pillarDetails: {
      pendidikan: {
        heroValue: '2 Unit',
        heroLabel: 'SDN Selesai Rekonstruksi',
        metric1: { label: 'Kondisi Bangunan', value: 'SDN Gasol 1 & 2 Tahan Gempa' },
        metric2: { label: 'Siswa Belajar', value: '420 Siswa Kelas Permanen' },
        keterangan: 'Sekolah telah dilengkapi modul evakuasi bencana mandiri.',
      },
      kesehatan: {
        heroValue: '1 Unit',
        heroLabel: 'Puskesmas Pembantu Beroperasi',
        metric1: { label: 'Layanan Medis', value: 'Trauma Healing Terjadwal' },
        metric2: { label: 'Skrining CKG', value: '3.420 Warga Terlayani (84%)' },
        keterangan: 'Layanan terpadu imunisasi balita dan penimbangan posyandu.',
      },
      bencana: {
        heroValue: '210 Unit',
        heroLabel: 'Huntap Mandiri Terbangun',
        metric1: { label: 'Tahap Verifikasi', value: '140 Unit Siap Stimulan' },
        metric2: { label: 'Huntara Aktif', value: '180 KK Masih di Tenda/Huntara' },
        keterangan: 'Kebutuhan percepatan transfer stimulan tahap IV BNPB.',
      },
      kemiskinan: {
        heroValue: '15,40%',
        heroLabel: 'Tingkat Kemiskinan Terkini',
        metric1: { label: 'Kemiskinan Ekstrem', value: '2,40%' },
        metric2: { label: 'Dampak Bencana', value: 'Kehilangan Aset Rumah & Lahan' },
        keterangan: 'Bantuan benih tanaman hortikultura dan jaminan hidup.',
      },
    },
    pillars: {
      pendidikan: 'SDN Gasol 1 & 2 telah direhabilitasi menjadi bangunan tahan gempa',
      kesehatan: 'Puskesmas Pembantu Gasol aktif dengan layanan trauma healing anak',
      bencana: 'Pembangunan 210 unit Huntap mandiri selesai; 140 unit tahap verifikasi',
      kemiskinan: 'Tingkat kemiskinan 15,40% akibat kehilangan aset produktif gempa',
    },
    catatanStrategis:
      'Percepatan pencairan dana stimulan rumah rusak tahap IV dan pemulihan mata pencaharian pertanian sayur.',
  },
  {
    id: 'desa-benjot',
    kodeBps: '32.03.08.2002',
    name: 'Desa Benjot',
    level: 'desa',
    parentProvinsiId: 'jawa-barat',
    parentKabKotaId: 'cianjur',
    parentKecamatanId: 'kec-cugenang',
    lat: -6.8120,
    lng: 107.0940,
    zoom: 15,
    boundary: [
      [-6.802, 107.085],
      [-6.802, 107.105],
      [-6.825, 107.105],
      [-6.825, 107.085],
      [-6.802, 107.085],
    ],
    tingkatKemiskinan: '14,80%',
    kemiskinanEkstrem: '2,10%',
    imm: '0,52',
    isPrioritas: true,
    kategoriWilayah: 'Zona Rawan Gempa & Huntara',
    ringkasanStrategis:
      'Fasilitasi penyediaan air bersih komunal dan percepatan pembangunan hunian tetap warga.',
    pillarDetails: {
      pendidikan: {
        heroValue: '1 Unit',
        heroLabel: 'Madrasah Ibtidaiyah Selesai',
        metric1: { label: 'Rehabilitasi Bangunan', value: 'MI Al-Falah Tahan Gempa' },
        metric2: { label: 'Siswa Belajar', value: '280 Santri & Murid' },
        keterangan: 'Didukung sarana sanitasi bersih bantuan Kemenko PMK.',
      },
      kesehatan: {
        heroValue: '1 Posko',
        heroLabel: 'Poskesdes Siaga 24 Jam',
        metric1: { label: 'Pemeriksaan Rutin', value: '2.890 Warga Terdaftar' },
        metric2: { label: 'Stunting Desa', value: 'Intervensi Khusus 18 Balita' },
        keterangan: 'Penyaluran makanan bergizi balita dan ibu hamil.',
      },
      bencana: {
        heroValue: '185 Unit',
        heroLabel: 'Huntap Terbangun',
        metric1: { label: 'Progres Verifikasi', value: '110 KK Tahap Pencairan' },
        metric2: { label: 'Huntara Mandiri', value: '145 KK Masih Bertahan' },
        keterangan: 'Penyelesaian sanitasi komunal pemukiman relokasi.',
      },
      kemiskinan: {
        heroValue: '14,80%',
        heroLabel: 'Tingkat Kemiskinan Terkini',
        metric1: { label: 'Kemiskinan Ekstrem', value: '2,10%' },
        metric2: { label: 'Mata Pencaharian', value: 'Petani Buruh & Sayuran' },
        keterangan: 'Bantuan alat pertanian semprot dan pupuk bersubsidi.',
      },
    },
    pillars: {
      pendidikan: 'Madrasah Ibtidaiyah Al-Falah telah beroperasi kembali dengan gedung aman',
      kesehatan: 'Poskesdes aktif melayani warga dan pemantauan balita stunting',
      bencana: 'Pembangunan 185 huntap mandiri; sarana air bersih komunal beroperasi',
      kemiskinan: 'Kemiskinan 14,80% · Bantuan alat pertanian dan modal bibit sayur',
    },
    catatanStrategis:
      'Fasilitasi pipa air bersih komunal dari mata air pegunungan untuk kebutuhan warga huntap.',
  },

  // Cilincing - Jakarta Utara (Kode BPS 31.75.05.1001)
  {
    id: 'kel-kalibaru',
    kodeBps: '31.75.05.1001',
    name: 'Kelurahan Kalibaru',
    level: 'desa',
    parentProvinsiId: 'dki-jakarta',
    parentKabKotaId: 'jakarta-utara',
    parentKecamatanId: 'kec-cilincing',
    lat: -6.1150,
    lng: 106.9200,
    zoom: 15,
    boundary: [
      [-6.105, 106.910],
      [-6.105, 106.935],
      [-6.128, 106.935],
      [-6.128, 106.910],
      [-6.105, 106.910],
    ],
    tingkatKemiskinan: '8,90%',
    kemiskinanEkstrem: '0,48%',
    imm: '0,66',
    isPrioritas: true,
    kategoriWilayah: 'Kantong Pesisir Padat & Rawan Rob',
    ringkasanStrategis:
      'Penataan kampung nelayan Kalibaru, sanitasi komunal, dan perlindungan tanggul rob laut.',
    pillarDetails: {
      pendidikan: {
        heroValue: '100%',
        heroLabel: 'KJP Plus Bagi Siswa Miskin',
        metric1: { label: 'SDN Kalibaru 01-09', value: 'Peninggian Bebas Genangan' },
        metric2: { label: 'Penerima KJP', value: '2.140 Siswa Terfasilitasi' },
        keterangan: 'Pencegahan putus sekolah anak keluarga nelayan tradisional.',
      },
      kesehatan: {
        heroValue: '91,0%',
        heroLabel: 'Cakupan Cek Kesehatan Gratis',
        metric1: { label: 'Warga Terperiksa', value: '38.400 Jiwa' },
        metric2: { label: 'Skrining TB Paru', value: 'Pengobatan Tuntas 114 Pasien' },
        keterangan: 'Puskesmas pembantu Kalibaru buka layanan sore untuk nelayan.',
      },
      bencana: {
        heroValue: '96,0%',
        heroLabel: 'Proteksi Tanggul NCICD',
        metric1: { label: 'Tanggul Nelayan', value: 'Tinggi 3,8 Meter Dpl' },
        metric2: { label: 'Pompa Kalibaru', value: '2 Unit Kapasitas 2.500 L/detik' },
        keterangan: 'Pemukiman bebas banjir rob pasang laut Jawa.',
      },
      kemiskinan: {
        heroValue: '8,90%',
        heroLabel: 'Tingkat Kemiskinan',
        metric1: { label: 'Kemiskinan Ekstrem', value: '0,48%' },
        metric2: { label: 'Ekonomi Lokal', value: 'Sentra Pengolahan Ikan Asin' },
        keterangan: 'Bantuan meja jemur higienis dan perbaikan jalan gang permukiman.',
      },
    },
    pillars: {
      pendidikan: 'Penyaluran KJP Plus 100% dan peninggian gedung SDN Kalibaru bebas genangan',
      kesehatan: 'Skrining TB komunitas nelayan dan layanan puskesmas pembantu aktif',
      bencana: 'Tanggul pantai NCICD Kalibaru melindungi pemukiman nelayan dari rob',
      kemiskinan: 'Pemberdayaan pengolahan ikan asin higienis dan sanitasi komunal',
    },
    catatanStrategis:
      'Penataan kampung deret nelayan Kalibaru dan sertifikasi laik higienis pengolahan hasil laut.',
  },
];
