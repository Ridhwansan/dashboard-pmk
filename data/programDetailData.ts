export interface MonthlyDataPoint {
  month: number;
  monthName: string;
  target: number;
  capaian: number | null;
  totalCapaian?: number | null;
  targetFormatted: string;
  capaianFormatted: string;
  totalCapaianFormatted?: string;
  percentage?: number;
  percentageFormatted?: string;
  status: 'Tercapai' | 'Sesuai Target' | 'Perlu Percepatan' | 'Terjadwal' | 'Terhenti';
  note?: string;
}

export interface KendalaDetailItem {
  id?: string | number;
  title: string;
  kendala: string;
  tindakLanjut: string;
  klTerkait?: string;
  urgensi?: 'Tinggi' | 'Sedang';
  tanggalKendala?: string;
  tanggalTindakLanjut?: string;
}

export interface PillarKendalaItem extends KendalaDetailItem {
  programId: string;
  programTitle: string;
  pillarId: 'pendidikan' | 'kesehatan' | 'bencana' | 'kemiskinan';
}

export interface ProgramDetailData {
  id: string;
  title: string;
  pillarId: 'pendidikan' | 'kesehatan' | 'bencana' | 'kemiskinan';
  pillarTitle: string;
  category?: string;
  description: string;
  picKementerian: string;
  unit: string;
  currentValue: string;
  target2026: string;
  status: string;
  subtext?: string;
  kendala?: string;
  tindakLanjut?: string;
  kendalaList?: KendalaDetailItem[];
  monthlyData: Record<number, MonthlyDataPoint[]>;
}

const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const MONTH_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

/**
 * Official Monthly Data Generator for programs in the official presentation slides
 * Verbatim from official documents:
 * - Months 1 - 9 (Jan - Sep): blank / not yet reported individually
 * - Month 10 (Oktober): Posisi Berjalan Saat Ini (per 18 Oktober 2026)
 * - Month 11 (November): Capaian —, Persentase —
 * - Month 12 (Desember): Target 2026 (T), Capaian —, Persentase —
 */
export function generateOfficialProgramMonthlyData(config: {
  targetDesember: number;
  targetDesemberFormatted: string;
  capaianOktober: number;
  capaianOktoberFormatted: string;
  percentageOktober: number;
  percentageOktoberFormatted: string;
  noteOktober?: string;
}): Record<number, MonthlyDataPoint[]> {
  const makeEmptyYear = () =>
    MONTH_NAMES.map((name, i) => ({
      month: i + 1,
      monthName: name,
      target: 0,
      capaian: null,
      totalCapaian: null,
      targetFormatted: '—',
      capaianFormatted: '—',
      totalCapaianFormatted: '—',
      percentageFormatted: '—',
      status: 'Terjadwal' as const,
      note: '',
    }));

  const data2026: MonthlyDataPoint[] = MONTH_NAMES.map((name, i) => {
    const monthNum = i + 1;
    // Bulan 1 - 9 (Januari - September): belum ada rincian bulanan
    if (monthNum < 10) {
      return {
        month: monthNum,
        monthName: name,
        target: 0,
        capaian: null,
        totalCapaian: null,
        targetFormatted: '',
        capaianFormatted: '',
        totalCapaianFormatted: '',
        percentageFormatted: '',
        status: 'Terjadwal' as const,
        note: '',
      };
    }
    // Bulan 10 (Oktober - Posisi Berjalan Saat Ini)
    if (monthNum === 10) {
      return {
        month: 10,
        monthName: 'Oktober',
        target: 0,
        capaian: config.capaianOktober,
        totalCapaian: config.capaianOktober,
        targetFormatted: '',
        capaianFormatted: config.capaianOktoberFormatted,
        totalCapaianFormatted: config.capaianOktoberFormatted,
        percentage: config.percentageOktober,
        percentageFormatted: config.percentageOktoberFormatted,
        status: config.percentageOktober >= 100 ? ('Tercapai' as const) : ('Sesuai Target' as const),
        note: config.noteOktober || 'Posisi per 18 Oktober 2026',
      };
    }
    // Bulan 11 (November)
    if (monthNum === 11) {
      return {
        month: 11,
        monthName: 'November',
        target: 0,
        capaian: null,
        totalCapaian: null,
        targetFormatted: '',
        capaianFormatted: '—',
        totalCapaianFormatted: '—',
        percentageFormatted: '—',
        status: 'Terjadwal' as const,
        note: '',
      };
    }
    // Bulan 12 (Desember)
    return {
      month: 12,
      monthName: 'Desember',
      target: config.targetDesember,
      capaian: null,
      totalCapaian: null,
      targetFormatted: config.targetDesemberFormatted,
      capaianFormatted: '—',
      totalCapaianFormatted: '—',
      percentageFormatted: '—',
      status: 'Terjadwal' as const,
      note: '',
    };
  });

  return {
    2025: makeEmptyYear(),
    2026: data2026,
    2027: makeEmptyYear(),
  };
}

/**
 * Clean empty monthly dataset for indicators where monthly breakdown data
 * has not been provided by user / official sources.
 */
export function generateEmptyMonthlyData(): Record<number, MonthlyDataPoint[]> {
  const makeEmptyYear = () =>
    MONTH_NAMES.map((name, i) => ({
      month: i + 1,
      monthName: name,
      target: 0,
      capaian: null,
      totalCapaian: null,
      targetFormatted: '—',
      capaianFormatted: '—',
      totalCapaianFormatted: '—',
      percentageFormatted: '—',
      status: 'Terjadwal' as const,
      note: '',
    }));

  return {
    2025: makeEmptyYear(),
    2026: makeEmptyYear(),
    2027: makeEmptyYear(),
  };
}

/**
 * Compatibility wrapper - returns empty monthly data for unprovided metrics
 */
function generateMonthlyData(): Record<number, MonthlyDataPoint[]> {
  return generateEmptyMonthlyData();
}

/**
 * Compatibility wrapper - returns empty monthly data for unprovided metrics
 */
function generateOfficialMonthlyData(): Record<number, MonthlyDataPoint[]> {
  return generateEmptyMonthlyData();
}

/**
 * Specialized helper for Studio Guru monthly data matching official presentation slide
 * where November 2026 has the specific milestone target
 */
function generateStudioGuruMonthlyData(): Record<number, MonthlyDataPoint[]> {
  const data2026: MonthlyDataPoint[] = MONTH_NAMES.map((name, i) => {
    const monthNum = i + 1;
    if (monthNum === 11) {
      return {
        month: monthNum,
        monthName: name,
        target: 1,
        capaian: null,
        targetFormatted: 'Peluncuran 1 Studio pusat dengan minimal 100 Konten Pembelajaran',
        capaianFormatted: '',
        percentageFormatted: '',
        status: 'Terjadwal' as const,
        note: '',
      };
    }
    return {
      month: monthNum,
      monthName: name,
      target: 0,
      capaian: null,
      targetFormatted: '',
      capaianFormatted: '',
      percentageFormatted: '',
      status: 'Terjadwal' as const,
      note: '',
    };
  });

  const emptyYear = generateEmptyMonthlyData()[2025];
  return {
    2025: emptyYear,
    2026: data2026,
    2027: emptyYear,
  };
}

export const PROGRAM_DETAILS_DATA: Record<string, ProgramDetailData> = {
  // =========================================================================
  // PILAR 1: PENDIDIKAN
  // =========================================================================
  'revitalisasi_satdik': {
    id: 'revitalisasi_satdik',
    title: 'Revitalisasi Satuan Pendidikan',
    pillarId: 'pendidikan',
    pillarTitle: 'Pendidikan',
    category: 'Infrastruktur Sekolah',
    description:
      'Program peningkatan kualitas dan kelayakan sarana-prasarana sekolah melalui rehabilitasi dan pembangunan fasilitas pendidikan untuk mendukung pemerataan akses dan mutu pembelajaran.',
    picKementerian: 'Kemendikdasmen, Kemenag, Kementerian PUPR, Kemendagri',
    unit: 'Satuan Pendidikan',
    currentValue: '36.669',
    target2026: '80.282 Satuan Pendidikan',
    status: 'Capaian 2026',
    subtext: 'Realisasi 2025: 17.508 Satdik (136,5% target 2025)',
    kendalaList: [
      {
        id: 1,
        title: 'Persetujuan Anggaran Belanja Tambahan (ABT) untuk 7.131 Madrasah',
        kendala:
          'Usulan Anggaran Belanja Tambahan (ABT) untuk 7.131 madrasah negeri dan swasta masih menunggu persetujuan Kementerian Keuangan. Belum adanya kepastian anggaran berpotensi menghambat penyelesaian dan serah terima pekerjaan konstruksi pada tahun anggaran berjalan.',
        tindakLanjut:
          'Percepatan Koordinasi Kemenko PMK bersama Kemenkeu dan Kemenag untuk menyepakati prioritas alokasi dan mekanisme revisi anggaran.',
      },
      {
        id: 2,
        title: 'Penanganan Darurat 41 Madrasah & Sekolah Terdampak Bencana Alam',
        kendala:
          'Sebanyak 41 madrasah di kawasan rawan bencana (Sumatera Barat dan NTT) mengalami kerusakan struktur berat dan memerlukan relokasi ke lahan aman di luar zona sesar aktif.',
        tindakLanjut:
          'Koordinasi penerbitan instruksi bersama Mendagri dan Menteri ATR/BPN untuk penetapan lahan relokasi aman oleh pemda serta penyaluran Dana Siap Pakai BNPB.',
      },
      {
        id: 3,
        title: 'Kapasitas Pengadaan & Komitmen APBD Pemerintah Daerah',
        kendala:
          'Ketimpangan kesiapan unit pengadaan barang/jasa di dinas pendidikan daerah 3T menghambat verifikasi teknis dan validasi lapangan sekolah sasaran revitalisasi.',
        tindakLanjut:
          'Koordinasi BPKP dan Kemendikdasmen memberikan pendampingan teknis dan probity audit di 50 kabupaten prioritas percepatan.',
      },
    ],
    monthlyData: generateOfficialProgramMonthlyData({
      targetDesember: 80282,
      targetDesemberFormatted: '80.282 satdik',
      capaianOktober: 36669,
      capaianOktoberFormatted: '36.669 satdik',
      percentageOktober: 45.7,
      percentageOktoberFormatted: '45,7 %',
      noteOktober: 'Posisi per 18 Oktober 2026',
    }),
  },

  'snt_operasional': {
    id: 'snt_operasional',
    title: 'Sekolah Nasional Terintegrasi (SNT)',
    pillarId: 'pendidikan',
    pillarTitle: 'Pendidikan',
    category: 'Satuan Pendidikan Terintegrasi',
    description:
      'Program yang mengintegrasikan sekolah jenjang SMP dan SMA dalam satu ekosistem berkelanjutan, mulai dari pembelajaran, pengembangan guru, pembinaan karakter, hingga penjaminan mutu.',
    picKementerian: 'Kemendikdasmen, KemenPANRB, Kemendagri, Bappenas',
    unit: 'unit',
    currentValue: '17',
    target2026: '35 unit',
    status: 'Capaian 2026 (45,9%)',
    subtext: 'Target 2026: 35 unit · Realisasi: 17 unit (45,9%) · Posisi per 18 Oktober 2026',
    kendalaList: [
      {
        id: 1,
        title: 'Penetapan RPerpres Sekolah Nasional Terintegrasi',
        kendala:
          'Rancangan Peraturan Presiden (RPerpres) belum ditetapkan sehingga menghambat kepastian pelaksanaan program.',
        tindakLanjut:
          'Percepat finalisasi dan penetapan RPerpres melalui koordinasi lintas K/L terkait.',
      },
      {
        id: 2,
        title: 'Kesiapan Lahan',
        kendala:
          'Kesiapan dan kepastian status lahan pembangunan belum terpenuhi di sejumlah lokasi sasaran.',
        tindakLanjut:
          'Koordinasi dengan pemda dan Kementerian ATR/BPN untuk percepatan penyediaan dan legalitas lahan.',
      },
      {
        id: 3,
        title: 'Pemenuhan Guru dan Tenaga Kependidikan',
        kendala:
          'Ketersediaan dan pemerataan guru belum memadai untuk mendukung operasional sekolah.',
        tindakLanjut:
          'Koordinasi Kemendikdasmen, KemenPANRB, dan BKN untuk pemetaan kebutuhan serta pemenuhan tenaga pendidik.',
      },
    ],
    monthlyData: generateOfficialProgramMonthlyData({
      targetDesember: 35,
      targetDesemberFormatted: '35 unit',
      capaianOktober: 17,
      capaianOktoberFormatted: '17 unit',
      percentageOktober: 45.9,
      percentageOktoberFormatted: '45,9%',
      noteOktober: 'Posisi per 18 Oktober 2026',
    }),
  },

  'sekolah_unggul_garuda': {
    id: 'sekolah_unggul_garuda',
    title: 'Sekolah Unggul Garuda',
    pillarId: 'pendidikan',
    pillarTitle: 'Pendidikan',
    category: 'Pendidikan Keunggulan',
    description:
      'Program pengembangan sekolah menengah atas unggulan melalui pembangunan Sekolah Garuda Baru dan transformasi SMA yang sudah ada, dengan penguatan pendidikan sains dan teknologi untuk menyiapkan talenta berprestasi dan berdaya saing global.',
    picKementerian: 'Kemendikdasmen, Kemenkeu, Kementerian PUPR, Setneg',
    unit: 'unit',
    currentValue: '30',
    target2026: '30 unit',
    status: 'Capaian 2026 (100%)',
    subtext: 'Posisi per 18 Oktober 2026 · Terdiri dari SUG Transformasi (30 unit) dan SUG Baru (3 unit)',
    kendalaList: [
      {
        id: 1,
        title: 'Penetapan RPerpres Tunjangan Lain Guru dan Tenaga Kependidikan',
        kendala:
          'RPerpres Tunjangan Lain GTK SUG masih belum selesai. Pada Agustus 2026, Mensesneg telah mengajukan pemberian paraf koordinasi kepada MenPAN-RB dan Menkeu. Menpan RB telah memberikan masukan, sementara Menkeu sampai saat ini belum',
        tindakLanjut:
          'Koordinasi dengan Menkeu untuk percepat finalisasi dan penetapan RPerpres Tunjangan Lain Guru dan Tenaga Kependidikan di Sekolah Unggul Garuda.',
      },
    ],
    monthlyData: generateOfficialProgramMonthlyData({
      targetDesember: 30,
      targetDesemberFormatted: '30 unit',
      capaianOktober: 30,
      capaianOktoberFormatted: '30 unit',
      percentageOktober: 100,
      percentageOktoberFormatted: '100 %',
      noteOktober: 'Posisi per 18 Oktober 2026',
    }),
  },

  'sug_transformasi': {
    id: 'sug_transformasi',
    title: 'Sekolah Unggul Garuda Transformasi',
    pillarId: 'pendidikan',
    pillarTitle: 'Pendidikan',
    category: 'Transformasi Mutu Sekolah',
    description:
      'Program peningkatan mutu SMA unggulan eksisting menjadi Sekolah Unggul Garuda Transformasi dengan penguatan kurikulum sains, teknologi, dan penyiapan talenta berprestasi global.',
    picKementerian: 'Kemendikdasmen, Bappenas, Kemenkeu',
    unit: 'unit',
    currentValue: '30',
    target2026: '30 unit',
    status: 'Capaian 2026 (100%)',
    subtext: 'Realisasi 2025: 12 unit · Realisasi 2026: 30 unit (100%) · Target 2026: 30 unit',
    kendalaList: [
      {
        id: 1,
        title: 'Penetapan RPerpres Tunjangan Lain Guru dan Tenaga Kependidikan',
        kendala:
          'RPerpres Tunjangan Lain GTK SUG masih belum selesai. Pada Agustus 2026, Mensesneg telah mengajukan pemberian paraf koordinasi kepada MenPAN-RB dan Menkeu. Menpan RB telah memberikan masukan, sementara Menkeu sampai saat ini belum',
        tindakLanjut:
          'Koordinasi dengan Menkeu untuk percepat finalisasi dan penetapan RPerpres Tunjangan Lain Guru dan Tenaga Kependidikan di Sekolah Unggul Garuda.',
      },
    ],
    monthlyData: generateOfficialProgramMonthlyData({
      targetDesember: 30,
      targetDesemberFormatted: '30 unit',
      capaianOktober: 30,
      capaianOktoberFormatted: '30 unit',
      percentageOktober: 100,
      percentageOktoberFormatted: '100 %',
      noteOktober: 'Posisi per 18 Oktober 2026',
    }),
  },

  'sug_baru': {
    id: 'sug_baru',
    title: 'Sekolah Unggul Garuda Baru',
    pillarId: 'pendidikan',
    pillarTitle: 'Pendidikan',
    category: 'Pendidikan Keunggulan',
    description:
      'Program pengembangan sekolah menengah atas unggulan melalui pembangunan unit baru Sekolah Unggul Garuda berasrama dengan kurikulum sains & teknologi global di daerah prioritas.',
    picKementerian: 'Kemendikdasmen, Kemenkeu, Kementerian PUPR, Setneg',
    unit: 'unit',
    currentValue: '3',
    target2026: '4 unit',
    status: 'Capaian 2026 (75%)',
    subtext: 'Target 2026: 4 unit · Realisasi: 3 unit (75%) · Posisi per 18 Oktober 2026',
    kendalaList: [
      {
        id: 1,
        title: 'Penetapan RPerpres Tunjangan Lain Guru dan Tenaga Kependidikan',
        kendala:
          'RPerpres Tunjangan Lain GTK SUG masih belum selesai. Pada Agustus 2026, Mensesneg telah mengajukan pemberian paraf koordinasi kepada MenPAN-RB dan Menkeu. Menpan RB telah memberikan masukan, sementara Menkeu sampai saat ini belum',
        tindakLanjut:
          'Koordinasi dengan Menkeu untuk percepat finalisasi dan penetapan RPerpres Tunjangan Lain Guru dan Tenaga Kependidikan di Sekolah Unggul Garuda.',
      },
    ],
    monthlyData: generateOfficialProgramMonthlyData({
      targetDesember: 4,
      targetDesemberFormatted: '4 unit',
      capaianOktober: 3,
      capaianOktoberFormatted: '3 unit',
      percentageOktober: 75,
      percentageOktoberFormatted: '75 %',
      noteOktober: 'Posisi per 18 Oktober 2026',
    }),
  },

  'digitalisasi_pendidikan': {
    id: 'digitalisasi_pendidikan',
    title: 'Digitalisasi Pendidikan',
    pillarId: 'pendidikan',
    pillarTitle: 'Pendidikan',
    category: 'Teknologi Pembelajaran',
    description:
      'Program transformasi pembelajaran melalui penyediaan Interactive Flat Panel (IFP), konten pembelajaran digital, dan infrastruktur penunjang di satuan pendidikan.',
    picKementerian: 'Kemendikdasmen, Kemenkomdigi, Kemenkeu, Kemenag',
    unit: 'unit',
    currentValue: '727.436',
    target2026: '727.436 unit',
    status: 'Capaian 2026 (100%)',
    subtext: 'Posisi per 18 Oktober 2026 (Berproses Disalurkan ke 316.535 Sekolah) · Realisasi 2025: 288.865 unit (100%)',
    kendalaList: [
      {
        id: 1,
        title: 'Pemenuhan IFP untuk Sekolah di Lingkungan Kemenag',
        kendala:
          'ABT pengadaan IFP Untuk Sekolah di Lingkungan Kemenag masih proses di Kementerian Keuangan',
        tindakLanjut:
          'Perlu percepatan Koordinasi dengan Kemenkeu dan Kemenag',
      },
    ],
    monthlyData: generateOfficialProgramMonthlyData({
      targetDesember: 727436,
      targetDesemberFormatted: '727.436 unit',
      capaianOktober: 727436,
      capaianOktoberFormatted: '727.436 unit',
      percentageOktober: 100,
      percentageOktoberFormatted: '100 %',
      noteOktober: 'Posisi per 18 Oktober 2026',
    }),
  },

  'studio_guru': {
    id: 'studio_guru',
    title: 'Studio Guru',
    pillarId: 'pendidikan',
    pillarTitle: 'Pendidikan',
    category: 'Kompetensi Pendidik',
    description:
      'Program penyediaan pusat produksi dan penyebarluasan konten pembelajaran digital berkualitas dari guru untuk meningkatkan pemerataan mutu pembelajaran di Indonesia.',
    picKementerian: 'Kemendikdasmen, Kemenkomdigi, Bappenas',
    unit: 'studio',
    currentValue: '—',
    target2026: 'Peluncuran Nov 2027',
    status: 'Peluncuran 1 Studio pusat dengan minimal 100 Konten Pembelajaran (Nov 2026)',
    subtext: 'Target 2026: Peluncuran Nov 2027 · Target 2027: Operasional',
    kendalaList: [],
    monthlyData: generateStudioGuruMonthlyData(),
  },

  'imm': {
    id: 'imm',
    title: 'Indeks Modal Manusia (IMM)',
    pillarId: 'pendidikan',
    pillarTitle: 'Pendidikan',
    category: 'Indikator Makro Strategis',
    description:
      'Indikator komposit pembangunan manusia yang mengintegrasikan peluang kelangsungan hidup anak, angka harapan lama sekolah, kualitas pembelajaran tes terstandar, dan status kesehatan usia produktif.',
    picKementerian: 'Bappenas, BPS, Kemendikdasmen, Kemenkes',
    unit: 'poin',
    currentValue: '0,562',
    target2026: '0,57 poin',
    status: 'Capaian 2025: 0,562',
    subtext: 'Target 2027: 0,575 · Target 2029: 0,59 poin',
    monthlyData: generateEmptyMonthlyData(),
  },

  // =========================================================================
  // PILAR 2: KESEHATAN
  // =========================================================================
  'ckg': {
    id: 'ckg',
    title: 'Cek Kesehatan Gratis',
    pillarId: 'kesehatan',
    pillarTitle: 'Kesehatan',
    category: 'Layanan Preventif Promotif',
    description:
      'Program pemeriksaan kesehatan gratis bagi seluruh masyarakat berdasarkan siklus hidup untuk mendeteksi dini penyakit dan faktor risiko kesehatan, serta mendorong pencegahan dan penanganan penyakit secara tepat waktu.',
    picKementerian: 'Kemenkes, BPJS Kesehatan, Kemendagri, Faskes TNI/Polri',
    unit: 'juta jiwa',
    currentValue: '105,98',
    target2026: '130 juta jiwa',
    status: 'Capaian 2026 (81,5%)',
    subtext: 'Realisasi 2025: 70,3 juta jiwa (68,9% dari target 102 juta jiwa)',
    kendala: 'Keterbatasan ketersediaan Bahan Medis Habis Pakai (BMHP) dan kesiapan fasilitas rujukan di daerah terpencil.',
    tindakLanjut:
      'Pelibatan fasilitas kesehatan TNI/Polri untuk menjangkau Indonesia bagian Timur dan percepatan rantai pasok reagen laboratorium puskesmas.',
    monthlyData: generateEmptyMonthlyData(),
  },

  'tb': {
    id: 'tb',
    title: 'Penuntasan Tuberkulosis',
    pillarId: 'kesehatan',
    pillarTitle: 'Kesehatan',
    category: 'Pengendalian Penyakit Menular',
    description:
      'Program percepatan eliminasi tuberkulosis melalui peningkatan deteksi dini, penemuan kasus secara aktif, pemeriksaan, pengobatan hingga tuntas, serta pencegahan penularan untuk menurunkan kasus tuberkulosis.',
    picKementerian: 'Kemenkes, Kemenkeu, Kemensos, Pemda',
    unit: 'kasus',
    currentValue: '656.517',
    target2026: '972.000 kasus',
    status: 'Capaian 2026 (67,5%)',
    subtext: 'Target 2027: 963.014 · Realisasi 2025: 867.480 kasus (88,4%)',
    kendala: 'Dukungan nutrisi dan isolasi bagi penderita tidak mampu serta keterbatasan anggaran penelusuran kontak erat.',
    tindakLanjut:
      'Pengajuan peningkatan alokasi anggaran penuntasan TB dari Kemenkeu serta integrasi bantuan sosial permakanan Kemensos.',
    monthlyData: generateEmptyMonthlyData(),
  },

  'rsud': {
    id: 'rsud',
    title: 'Revitalisasi Rumah Sakit Umum Daerah (RSUD)',
    pillarId: 'kesehatan',
    pillarTitle: 'Kesehatan',
    category: 'Rujukan Rumah Sakit',
    description:
      'Program peningkatan kapasitas dan kualitas RSUD, terutama dari kelas D menjadi kelas C, melalui pembangunan dan peningkatan fasilitas, penyediaan alat kesehatan, serta penguatan tenaga medis untuk memperluas akses layanan kesehatan rujukan yang berkualitas.',
    picKementerian: 'Kemenkes, Kemendiktisaintek, Kementerian PUPR, Pemda',
    unit: 'RSUD',
    currentValue: '18',
    target2026: '20 RSUD (Kelas D ke C)',
    status: '18 Konstruksi Selesai (90%)',
    subtext: 'Realisasi 2025: 21 RSUD · Target 2027: 66 RSUD',
    kendala: 'Kekurangan 7 dokter spesialis dasar (Penyakit Dalam, Anak, Obsgyn, Bedah, Anestesi, Patologi Klinik, Radiologi).',
    tindakLanjut:
      'Akselerasi program dokter spesialis berbasis rumah sakit pendidikan (hospital-based) oleh Kemendiktisaintek dan Kemenkes.',
    monthlyData: generateEmptyMonthlyData(),
  },

  'mbg_3b': {
    id: 'mbg_3b',
    title: 'MBG Ibu Hamil, Ibu Menyusui, dan Balita (3B)',
    pillarId: 'kesehatan',
    pillarTitle: 'Kesehatan',
    category: 'Gizi Ibu & Anak (3B)',
    description:
      'Program pemberian makanan bergizi gratis kepada ibu hamil, ibu menyusui, dan balita untuk memenuhi kebutuhan gizi kelompok rentan, mendukung kesehatan ibu dan tumbuh kembang anak, serta mencegah stunting sejak dini.',
    picKementerian: 'Badan Gizi Nasional (BGN), Kemenkes, Kemendagri',
    unit: '% sasaran',
    currentValue: '54,5%',
    target2026: '50% sasaran 3B',
    status: 'Capaian 2026 (54,5% rata-rata)',
    subtext: 'Cakupan: Balita non-PAUD (29,2%), Ibu Hamil (26,3%), Ibu Menyusui (64,5%)',
    kendala: 'Kepatuhan konsumsi rutin, pendataan door-to-door ibu hamil & balita di kepulauan terpencil.',
    tindakLanjut:
      'Integrasi kartu kontrol posyandu dengan layanan dapur Satuan Pelayanan Gizi BGN dan kader PKK desa.',
    monthlyData: generateEmptyMonthlyData(),
  },

  'stunting': {
    id: 'stunting',
    title: 'Percepatan Penurunan Stunting',
    pillarId: 'kesehatan',
    pillarTitle: 'Kesehatan',
    category: 'Gizi & Tumbuh Kembang',
    description:
      'Intervensi gizi terintegrasi bagi ibu hamil, ibu menyusui, dan balita baduta (1.000 Hari Pertama Kehidupan) untuk menekan angka gagal tumbuh di bawah standar nasional.',
    picKementerian: 'Bappenas, Kemenkes, BGN, BKKBN, Kemendagri',
    unit: '%',
    currentValue: '19,8%',
    target2026: '14,0% pada 2029',
    status: 'Survei Kesehatan Indonesia',
    subtext: 'Target RPJMN 2029: 14% secara nasional',
    kendala: 'Revisi Perpres 72/2021 tentang Penurunan Stunting belum rampung disahkan.',
    tindakLanjut:
      'Percepatan harmonisasi dan pengesahan revisi Perpres Stunting dengan penguatan komando Bappenas dan sinergi MBG.',
    monthlyData: generateEmptyMonthlyData(),
  },

  'mbg_balita': {
    id: 'mbg_balita',
    title: 'MBG balita non-PAUD',
    pillarId: 'kesehatan',
    pillarTitle: 'Kesehatan',
    category: 'Gizi Ibu & Anak (3B)',
    description:
      'Program pemberian makanan bergizi gratis kepada ibu hamil, ibu menyusui, dan balita untuk memenuhi kebutuhan gizi kelompok rentan, mendukung kesehatan ibu dan tumbuh kembang anak, serta mencegah stunting sejak dini.',
    picKementerian: 'Badan Gizi Nasional (BGN), Kemenkes, Kemendagri',
    unit: 'juta jiwa',
    currentValue: '4,89',
    target2026: '16,7 juta jiwa',
    status: 'Capaian 2026 (29,2% sasaran)',
    subtext: 'Target 2027: 70% cakupan sasaran · Target 2029: 100%',
    kendala: 'Pendataan balita luar PAUD secara door-to-door dan koordinasi rantai pasok dapur SP Gizi.',
    tindakLanjut:
      'Refocusing intervensi pada desa rawan pangan dan penguatan peran posyandu serta kader PKK.',
    monthlyData: generateEmptyMonthlyData(),
  },

  'mbg_ibu_hamil': {
    id: 'mbg_ibu_hamil',
    title: 'MBG ibu hamil',
    pillarId: 'kesehatan',
    pillarTitle: 'Kesehatan',
    category: 'Gizi Ibu & Anak (3B)',
    description:
      'Program pemberian makanan bergizi gratis kepada ibu hamil, ibu menyusui, dan balita untuk memenuhi kebutuhan gizi kelompok rentan, mendukung kesehatan ibu dan tumbuh kembang anak, serta mencegah stunting sejak dini.',
    picKementerian: 'Badan Gizi Nasional (BGN), Kemenkes, Kemendagri',
    unit: 'ribu jiwa',
    currentValue: '656',
    target2026: '2,49 juta jiwa',
    status: 'Capaian 2026 (26,3% sasaran)',
    subtext: 'Target 2027: 70% sasaran · Target 2029: 100%',
    kendala: 'Kepatuhan konsumsi rutin dan pendataan ibu hamil trimester pertama di daerah 3T.',
    tindakLanjut:
      'Integrasi kartu kontrol kehamilan dengan layanan SP Gizi BGN dan bidan desa.',
    monthlyData: generateEmptyMonthlyData(),
  },

  'mbg_ibu_menyusui': {
    id: 'mbg_ibu_menyusui',
    title: 'MBG ibu menyusui',
    pillarId: 'kesehatan',
    pillarTitle: 'Kesehatan',
    category: 'Gizi Ibu & Anak (3B)',
    description:
      'Program pemberian makanan bergizi gratis kepada ibu hamil, ibu menyusui, dan balita untuk memenuhi kebutuhan gizi kelompok rentan, mendukung kesehatan ibu dan tumbuh kembang anak, serta mencegah stunting sejak dini.',
    picKementerian: 'Badan Gizi Nasional (BGN), Kemenkes',
    unit: 'juta jiwa',
    currentValue: '1,77',
    target2026: '2,75 juta jiwa',
    status: 'Capaian 2026 (64,5% sasaran)',
    subtext: 'Target 2027: 70% sasaran · Target 2029: 100%',
    kendala: 'Keterjangkauan pasokan bahan segar harian di kepulauan terpencil.',
    tindakLanjut:
      'Pemberdayaan kelompok tani dan peternak lokal dalam rantai pasok dapur satuan pelayanan gizi.',
    monthlyData: generateEmptyMonthlyData(),
  },

  'puskesmas': {
    id: 'puskesmas',
    title: 'Revitalisasi Puskesmas & Labkesmas',
    pillarId: 'kesehatan',
    pillarTitle: 'Kesehatan',
    category: 'Fasilitas Layanan Primer',
    description:
      'Standardisasi gedung, alat laboratorium kesehatan masyarakat, dan sistem rujukan digital terintegrasi di 10.000 Puskesmas di seluruh Indonesia.',
    picKementerian: 'Kemenkes, Kementerian PUPR, Kemenkeu',
    unit: 'puskesmas',
    currentValue: '10.000',
    target2026: 'Tahap Inventarisasi 2026',
    status: 'Target Pelaksanaan 2027',
    subtext: 'Target 2027: 10.000 puskesmas terstandar',
    kendala: 'Ruang fiskal APBN/APBD terbatas untuk alokasi fisik serentak.',
    tindakLanjut:
      'Inventarisasi ketat kelayakan dan prioritas puskesmas serta skema pembiayaan DAK Fisik terarah.',
    monthlyData: generateEmptyMonthlyData(),
  },

  'rs_revitalisasi': {
    id: 'rs_revitalisasi',
    title: 'Revitalisasi Rumah Sakit Rujukan',
    pillarId: 'kesehatan',
    pillarTitle: 'Kesehatan',
    category: 'Fasilitas Layanan Lanjutan',
    description:
      'Peningkatan kapabilitas 450 Rumah Sakit rujukan regional untuk penanganan layanan KJSU (Kanker, Jantung, Stroke, Uronefrologi) berstandar nasional.',
    picKementerian: 'Kemenkes, Bappenas, Kemenkeu',
    unit: 'RS',
    currentValue: '450',
    target2026: 'Persiapan Fasilitas 2026',
    status: 'Target 2027–2028',
    subtext: 'Target 2027-2028: 450 RS jejaring KJSU lengkap',
    kendala: 'Kesiapan infrastruktur bunker radioterapi dan pengadaan alkes canggih impor.',
    tindakLanjut:
      'Pengawalan kontrak tahun jamak (multi-years) dan percepatan izin ketenaganukliran BAPETEN.',
    monthlyData: generateEmptyMonthlyData(),
  },

  // =========================================================================
  // PILAR 3: KETAHANAN BENCANA
  // =========================================================================
  'rehabilitasi_rekonstruksi_sumatera': {
    id: 'rehabilitasi_rekonstruksi_sumatera',
    title: 'Rehabilitasi dan Rekonstruksi Sumatera',
    pillarId: 'bencana',
    pillarTitle: 'Ketahanan Bencana',
    category: 'Pemulihan Pascabencana',
    description:
      'Program percepatan pemulihan pascabencana di Provinsi Aceh, Sumatera Utara, dan Sumatera Barat melalui pembangunan kembali wilayah terdampak dengan pendekatan Build Back Better untuk mewujudkan hunian, infrastruktur, layanan dasar, dan kehidupan sosial ekonomi masyarakat yang lebih baik, aman, tangguh, dan berkelanjutan serta mengurangi risiko bencana di masa depan.',
    picKementerian: 'Satgas PRRP Sumatera, Kementerian PUPR, BNPB, ATR/BPN, Kemendagri',
    unit: 'unit hunian & infrastruktur',
    currentValue: '21.974',
    target2026: '60.045 unit',
    status: 'Capaian 2026 (Huntap & Huntara)',
    subtext: 'Fokus Wilayah: Aceh, Sumatera Utara, dan Sumatera Barat',
    kendala: 'Ketersediaan lahan relokasi clean and clear serta percepatan harmonisasi regulasi pendanaan lintas K/L.',
    tindakLanjut:
      'Penyelenggaraan RTM Satgas PRRP Sumatera untuk penetapan tapak lahan relokasi aman sesar gempa dan pengawalan kontrak multi-years.',
    monthlyData: generateEmptyMonthlyData(),
  },

  'huntap': {
    id: 'huntap',
    title: 'Rehabilitasi dan Rekonstruksi Sumatera (Huntap)',
    pillarId: 'bencana',
    pillarTitle: 'Ketahanan Bencana',
    category: 'Pemulihan Pascabencana',
    description:
      'Program percepatan pemulihan pascabencana di Provinsi Aceh, Sumatera Utara, dan Sumatera Barat melalui pembangunan kembali wilayah terdampak dengan pendekatan Build Back Better untuk mewujudkan hunian, infrastruktur, layanan dasar, dan kehidupan sosial ekonomi masyarakat yang lebih baik, aman, tangguh, dan berkelanjutan serta mengurangi risiko bencana di masa depan.',
    picKementerian: 'Satgas PRRP Sumatera, Kementerian PUPR, BNPB, ATR/BPN',
    unit: 'unit',
    currentValue: '1.707',
    target2026: '39.501 unit',
    status: 'Capaian 2026 (4,3%)',
    subtext: 'Kebutuhan total: 57.027 unit · Target selesai 100% pada 2027 · Fokus: Aceh, Sumut, Sumbar',
    kendala: 'Ketersediaan lahan relokasi clean and clear serta pembiayaan lintas kementerian/lembaga.',
    tindakLanjut:
      'RTM Satgas PRRP Sumatera untuk penetapan lokasi lahan, pembagian pendanaan, dan percepatan tender konstruksi.',
    monthlyData: generateEmptyMonthlyData(),
  },

  'huntara': {
    id: 'huntara',
    title: 'Huntara Sumatera (unit)',
    pillarId: 'bencana',
    pillarTitle: 'Ketahanan Bencana',
    category: 'Tanggap Darurat',
    description:
      'Penyediaan Hunian Sementara (Huntara) layak dan aman bagi para pengungsi bencana alam selama menunggu pembangunan huntap selesai.',
    picKementerian: 'BNPB, Kemensos, Pemda, TNI',
    unit: 'unit',
    currentValue: '20.267',
    target2026: '20.544 unit',
    status: 'Capaian 2026 (99,0%)',
    subtext: 'Realisasi hampir rampung sempurna (99%) di seluruh kantong pengungsian',
    monthlyData: generateEmptyMonthlyData(),
  },

  'jumlah_bencana': {
    id: 'jumlah_bencana',
    title: 'Jumlah Kejadian Bencana',
    pillarId: 'bencana',
    pillarTitle: 'Ketahanan Bencana',
    category: 'Monitoring Frekuensi',
    description:
      'Pencatatan dan pemantauan real-time frekuensi bencana hidrometeorologi dan geologi di seluruh Indonesia untuk evaluasi kesiapsiagaan operasional.',
    picKementerian: 'BNPB, BMKG, PVMBG, Basarnas',
    unit: 'kejadian',
    currentValue: '2.096',
    target2026: 'Monitoring 2026',
    status: 'Posisi s.d. Oktober 2026',
    subtext: 'Historis 2025: 3.176 kejadian bencana di seluruh Indonesia',
    kendala: 'Peningkatan anomali cuaca ekstrem dan aktivitas sesar aktif darat.',
    tindakLanjut:
      'Penguatan sistem peringatan dini terintegrasi (Early Warning System for All) dan edukasi kebencanaan di sekolah.',
    monthlyData: generateEmptyMonthlyData(),
  },

  'pengungsi': {
    id: 'pengungsi',
    title: 'Pengungsi Kembali Pascabencana',
    pillarId: 'bencana',
    pillarTitle: 'Ketahanan Bencana',
    category: 'Pemulihan Sosial',
    description:
      'Fasilitasi pemulangan pengungsi ke daerah asal yang telah dinyatakan aman atau pemindahan ke huntap mandiri.',
    picKementerian: 'BNPB, Kemensos, Pemda',
    unit: '%',
    currentValue: '100%',
    target2026: '100%',
    status: 'Tercapai 100%',
    subtext: 'Seluruh warga binaan pengungsian telah difasilitasi hunian mandiri',
    kendala: 'Pemulihan mata pencaharian pertanian yang tertutup material lahar/longsor.',
    tindakLanjut:
      'Pemberian stimulan modal usaha mikro dan bibit tanaman produktif oleh Kementan dan Kemensos.',
    monthlyData: generateEmptyMonthlyData(),
  },

  'infrastruktur': {
    id: 'infrastruktur',
    title: 'Infrastruktur Pascabencana Sumatera',
    pillarId: 'bencana',
    pillarTitle: 'Ketahanan Bencana',
    category: 'Infrastruktur Publik',
    description:
      'Rekonstruksi jembatan penghubung, tanggul sungai penahan banjir bandang, jalan poros logistik, dan fasilitas umum di wilayah terdampak bencana Sumatera.',
    picKementerian: 'Kementerian PUPR, BNPB, Pemda',
    unit: '%',
    currentValue: '99%',
    target2026: 'Target Selesai 2027 (100%)',
    status: 'Capaian 2026: 99%',
    subtext: 'Progres fisik konstruksi telah mencapai 99% dari paket rencana',
    kendala: 'Kondisi cuaca curah hujan tinggi yang menghambat pengecoran struktur sungai.',
    tindakLanjut:
      'Penyelesaian tahap akhir proteksi tebing dan serah terima aset operasional kepada pemerintah daerah.',
    monthlyData: generateEmptyMonthlyData(),
  },

  'kerugian': {
    id: 'kerugian',
    title: 'Kerugian Bencana (% PDB)',
    pillarId: 'bencana',
    pillarTitle: 'Ketahanan Bencana',
    category: 'Dampak Makro Fiskal',
    description:
      'Rasio estimasi nilai kerusakan dan kerugian ekonomi akibat bencana alam terhadap Produk Domestik Bruto nasional.',
    picKementerian: 'Bappenas, Kemenkeu, BNPB',
    unit: '% PDB',
    currentValue: '0,137%',
    target2026: '≤ 0,137% PDB',
    status: 'Terkendali dalam batas target',
    subtext: 'Target 2027: ≤ 0,136% · Target 2029: ≤ 0,135% PDB',
    kendala: 'Tingginya nilai aset publik yang belum terlindungi skema asuransi kebencanaan BMN.',
    tindakLanjut:
      'Perluasan cakupan Asuransi Barang Milik Negara (ABMN) dan Dana Bersama Penanggulangan Bencana (Pooling Fund).',
    monthlyData: generateEmptyMonthlyData(),
  },

  // =========================================================================
  // PILAR 4: PENURUNAN KEMISKINAN
  // =========================================================================
  'kemiskinan': {
    id: 'kemiskinan',
    title: 'Tingkat Kemiskinan (%)',
    pillarId: 'kemiskinan',
    pillarTitle: 'Penurunan Kemiskinan',
    category: 'Indikator Utama Makro',
    description:
      'Persentase penduduk yang hidup di bawah garis kemiskinan per kapita per bulan berdasarkan survei resmi Badan Pusat Statistik (BPS).',
    picKementerian: 'Bappenas, BPS, Kemensos, Kemenko PMK',
    unit: '%',
    currentValue: '8,07%',
    target2026: '6,5% – 7,5%',
    status: 'Posisi Maret 2026: 8,07%',
    subtext: 'Realisasi September 2025: 8,25% (turun 0,18% poin)',
    monthlyData: generateEmptyMonthlyData(),
  },

  'kemiskinan_ekstrem': {
    id: 'kemiskinan_ekstrem',
    title: 'Kemiskinan Ekstrem (%)',
    pillarId: 'kemiskinan',
    pillarTitle: 'Penurunan Kemiskinan',
    category: 'Penghapusan Ekstrem',
    description:
      'Persentase penduduk dengan pengeluaran di bawah garis kemiskinan ekstrem (Purchasing Power Parity USD 2,15 per orang per hari).',
    picKementerian: 'Kemenko PMK, Kemensos, Bappenas, Kemendagri',
    unit: '%',
    currentValue: '0,83%',
    target2026: '0% – 0,5%',
    status: 'Menuju 0% pada 2027',
    subtext: 'Target RPJMN 2027: 0,0% secara tuntas di seluruh daerah',
    kendala: 'Residu kantong kemiskinan ekstrem di wilayah terisolir Papua dan pedalaman Nusa Tenggara.',
    tindakLanjut:
      'Paket konvergensi intervensi 3 pilar: pengurangan beban pengeluaran, peningkatan pendapatan usaha mikro, dan pemukiman layak.',
    monthlyData: generateEmptyMonthlyData(),
  },

  'permakanan_lansia': {
    id: 'permakanan_lansia',
    title: 'Permakanan / MBG Lansia',
    pillarId: 'kemiskinan',
    pillarTitle: 'Penurunan Kemiskinan',
    category: 'Jaminan Sosial Lansia',
    description:
      'Pemberian makanan siap santap 2 kali sehari bergizi lengkap bagi lansia tunggal berusia 70 tahun ke atas yang hidup tanpa sanak saudara.',
    picKementerian: 'Kemensos, Badan Gizi Nasional (BGN), Kemenko PMK',
    unit: 'orang',
    currentValue: 'Terhenti',
    target2026: 'Integrasi MBG 2026',
    status: 'Terhenti Awal 2026',
    subtext: 'Realisasi 2025: 116.754 lansia tunggal penerima manfaat',
    kendala: 'Bantuan permakanan mandiri terhenti sejak awal 2026 karena proses peralihan anggaran ke Badan Gizi Nasional (BGN).',
    tindakLanjut:
      'RTM Orkestrasi Menko PMK dengan Kepala BGN dan Mensos untuk memastikan jatah alokasi makanan siap santap lansia dalam skema MBG.',
    monthlyData: generateEmptyMonthlyData(),
  },

  'permakanan_disabilitas': {
    id: 'permakanan_disabilitas',
    title: 'Permakanan / MBG Disabilitas',
    pillarId: 'kemiskinan',
    pillarTitle: 'Penurunan Kemiskinan',
    category: 'Perlindungan Disabilitas',
    description:
      'Layanan pemenuhan gizi dan makanan harian bagi penyandang disabilitas berat dan terlantar yang bergantung pada perawatan orang lain.',
    picKementerian: 'Kemensos, Badan Gizi Nasional (BGN), Kemenko PMK',
    unit: 'orang',
    currentValue: 'Terhenti',
    target2026: 'Integrasi MBG 2026',
    status: 'Terhenti Awal 2026',
    subtext: 'Realisasi 2025: 36.000 penyandang disabilitas berat',
    kendala: 'Skema pembiayaan khusus dan pelibatan pendamping sosial belum terintegrasi di dapur pelayanan MBG.',
    tindakLanjut:
      'Harmonisasi petunjuk teknis distribusi makanan ramah disabilitas dan validasi data P3KE desil 1.',
    monthlyData: generateEmptyMonthlyData(),
  },

  'mobilitas_lansia': {
    id: 'mobilitas_lansia',
    title: 'Mobilitas Penduduk Lansia',
    pillarId: 'kemiskinan',
    pillarTitle: 'Penurunan Kemiskinan',
    category: 'Aksesibilitas Lansia',
    description:
      'Indeks kemandirian dan mobilitas penduduk lanjut usia dalam mengakses layanan kesehatan, sosial, dan ruang publik inklusif.',
    picKementerian: 'Kemensos, Kemenhub, Bappenas',
    unit: 'indeks',
    currentValue: '94,2',
    target2026: '94,5 poin',
    status: 'Terkendali',
    subtext: 'Target 2027: 95,0 · Target 2029: 96,0 poin',
    monthlyData: generateEmptyMonthlyData(),
  },

  'mobilitas_disabilitas': {
    id: 'mobilitas_disabilitas',
    title: 'Mobilitas Penyandang Disabilitas',
    pillarId: 'kemiskinan',
    pillarTitle: 'Penurunan Kemiskinan',
    category: 'Inklusi Sosial',
    description:
      'Tingkat pemenuhan alat bantu dan kemudahan aksesibilitas fisik bagi penyandang disabilitas dalam berpartisipasi mandiri.',
    picKementerian: 'Kemensos, Kementerian PUPR, Pemda',
    unit: 'indeks',
    currentValue: '69,2',
    target2026: '69,5 poin',
    status: 'Sesuai Target',
    subtext: 'Target 2027: 70,0 · Target 2029: 71,0 poin',
    monthlyData: generateEmptyMonthlyData(),
  },
  // =========================================================================
  // PILAR 3 (TAMBAHAN): KARHUTLA
  // =========================================================================
  'provinsi_karhutla': {
    id: 'provinsi_karhutla',
    title: 'Provinsi Prioritas Terdampak Karhutla',
    pillarId: 'bencana',
    pillarTitle: 'Ketahanan Bencana',
    category: 'Pencegahan Karhutla',
    description:
      'Wilayah prioritas kerawanan kebakaran hutan dan lahan untuk pengendalian dan pencegahan terpadu di 6 provinsi rawan nasional.',
    picKementerian: 'Kementerian LHK, BNPB, TNI/Polri, Pemda',
    unit: 'Provinsi',
    currentValue: '6',
    target2026: '6 Provinsi Prioritas',
    status: 'Data 13 Oktober 2026',
    subtext: 'Fokus Pengendalian & Pencegahan Terpadu',
    monthlyData: generateEmptyMonthlyData(),
  },

  'luas_karhutla': {
    id: 'luas_karhutla',
    title: 'Luas Karhutla yang Sudah Dipadamkan',
    pillarId: 'bencana',
    pillarTitle: 'Ketahanan Bencana',
    category: 'Penanggulangan Karhutla',
    description:
      'Pemantauan akumulasi luas kebakaran hutan dan lahan yang telah tertangani dan berhasil dipadamkan oleh satgas darat dan udara.',
    picKementerian: 'Kementerian LHK, BNPB, Satgas Terpadu',
    unit: 'Ha',
    currentValue: '129.434,18',
    target2026: '130.097,79 Ha',
    status: 'Capaian 2026 (99,5%)',
    subtext: 'Jumlah Luas Karhutla: 130.097,79 Ha · Dalam Proses Pemadaman: 663,61 Ha',
    monthlyData: generateEmptyMonthlyData(),
  },

  // =========================================================================
  // PILAR 4 (TAMBAHAN): DESIL LANSIA/DISABILITAS & BANTUAN OPERASIONAL
  // =========================================================================
  'cakupan_lansia_desil': {
    id: 'cakupan_lansia_desil',
    title: 'Cakupan Lansia Desil 1–5',
    pillarId: 'kemiskinan',
    pillarTitle: 'Penurunan Kemiskinan',
    category: 'Perlindungan Sosial',
    description:
      'Perlindungan sosial dan jaminan pemenuhan kesejahteraan dasar bagi penduduk lanjut usia pada kelompok desil 1 sampai 5 DTSEN.',
    picKementerian: 'Kemensos, BPS, Bappenas',
    unit: '% sasaran',
    currentValue: '0,66%',
    target2026: 'Dalam Proses Pendataan',
    status: 'Realisasi 2025: 0,66%',
    subtext: 'Target 2026: Dalam Proses Pendataan',
    monthlyData: generateEmptyMonthlyData(),
  },

  'cakupan_disabilitas_desil': {
    id: 'cakupan_disabilitas_desil',
    title: 'Cakupan Disabilitas Desil 1–5',
    pillarId: 'kemiskinan',
    pillarTitle: 'Penurunan Kemiskinan',
    category: 'Perlindungan Sosial',
    description:
      'Jangkauan bantuan sosial adaptif dan pemenuhan hak penyandang disabilitas pada kelompok pengeluaran desil 1 sampai 5 DTSEN.',
    picKementerian: 'Kemensos, BPS, Bappenas',
    unit: '% sasaran',
    currentValue: '0,41%',
    target2026: 'Dalam Proses Pendataan',
    status: 'Realisasi 2025: 0,41%',
    subtext: 'Target 2026: Dalam Proses Pendataan',
    monthlyData: generateEmptyMonthlyData(),
  },

  'bos_reguler': {
    id: 'bos_reguler',
    title: 'Bantuan Operasional Sekolah Reguler',
    pillarId: 'kemiskinan',
    pillarTitle: 'Penurunan Kemiskinan',
    category: 'Dukungan Pendidikan',
    description:
      'Penyaluran dana Bantuan Operasional Sekolah (BOS) reguler bagi satuan pendidikan dasar dan menengah di seluruh Indonesia.',
    picKementerian: 'Kemendikdasmen, Kemenkeu',
    unit: 'Sekolah',
    currentValue: '432.654 (99%)',
    target2026: '432.716 Sekolah',
    status: 'Realisasi 2026 (99,9%)',
    subtext: 'Penyaluran Dana BOS Reguler Sekolah Dasar & Menengah',
    monthlyData: generateEmptyMonthlyData(),
  },

  'bop_pendidikan': {
    id: 'bop_pendidikan',
    title: 'Bantuan Operasional Pendidikan',
    pillarId: 'kemiskinan',
    pillarTitle: 'Penurunan Kemiskinan',
    category: 'Dukungan Pendidikan',
    description:
      'Penyaluran Bantuan Operasional Pendidikan bagi satuan pendidikan usia dini dan lembaga pendidikan kesetaraan.',
    picKementerian: 'Kemendikdasmen, Kemenkeu',
    unit: 'Lembaga',
    currentValue: '396.618',
    target2026: '406.741 Lembaga',
    status: 'Realisasi 2026',
    subtext: 'Penyaluran BOP Pendidikan Anak Usia Dini & Kesetaraan',
    monthlyData: generateEmptyMonthlyData(),
  },
};

const PROGRAM_ALIASES: Record<string, string> = {
  // Pendidikan
  revitalisasi_sarpras: 'revitalisasi_satdik',
  digitalisasi_pembelajaran: 'digitalisasi_pendidikan',
  sug: 'sug_transformasi',
  sug_semua: 'sug_transformasi',
  sekolah_unggul_garuda: 'sug_transformasi',
  // Kesehatan
  penuntasan_tb: 'tb',
  penemuan_kasus_tb: 'tb',
  revitalisasi_rsud: 'rsud',
  cek_kesehatan_gratis: 'ckg',
  mbg_kesehatan: 'mbg_3b',
  mbg_balita: 'mbg_3b',
  mbg_ibu_hamil: 'mbg_3b',
  mbg_ibu_menyusui: 'mbg_3b',
  revitalisasi_rs: 'rsud',
  // Bencana
  rehabilitasi_sumatera: 'rehabilitasi_rekonstruksi_sumatera',
  rehabilitasi_dan_rekonstruksi_sumatera: 'rehabilitasi_rekonstruksi_sumatera',
  huntara_sumatera: 'huntara',
  huntap_sumatera: 'huntap',
  huntara_bencana: 'huntara',
  huntap_bencana: 'huntap',
  jumlah_kejadian_bencana: 'jumlah_bencana',
  kerugian_bencana: 'kerugian',
  // Kemiskinan
  tingkat_kemiskinan: 'kemiskinan',
  bantuan_permakanan_lansia: 'permakanan_lansia',
  bantuan_permakanan_disabilitas: 'permakanan_disabilitas',
  cakupan_lansia_desil: 'desil_lansia',
  cakupan_disabilitas_desil: 'desil_disabilitas',
};

/**
 * Helper to get program detail by program ID or fallback
 */
export function getProgramDetailData(id: string, fallbackTitle?: string, fallbackPillar?: string): ProgramDetailData {
  const resolvedId = PROGRAM_ALIASES[id] || id;
  if (PROGRAM_DETAILS_DATA[resolvedId]) {
    return PROGRAM_DETAILS_DATA[resolvedId];
  }
  if (PROGRAM_DETAILS_DATA[id]) {
    return PROGRAM_DETAILS_DATA[id];
  }

  // Fallback matching by title keywords if exact key doesn't match
  const lowerTitle = (fallbackTitle || id).toLowerCase();
  for (const key of Object.keys(PROGRAM_DETAILS_DATA)) {
    const item = PROGRAM_DETAILS_DATA[key];
    if (lowerTitle.includes(item.title.toLowerCase()) || item.title.toLowerCase().includes(lowerTitle)) {
      return item;
    }
  }

  // Generic fallback if completely unknown
  const safePillar = (fallbackPillar || 'pendidikan') as 'pendidikan' | 'kesehatan' | 'bencana' | 'kemiskinan';
  return {
    id,
    title: fallbackTitle || id,
    pillarId: safePillar,
    pillarTitle: safePillar.toUpperCase(),
    description: `Rincian program prioritas dan trajektori pelaksanaan capaian program ${fallbackTitle || id}.`,
    picKementerian: 'Kementerian Koordinator Bidang PMK',
    unit: 'unit',
    currentValue: '—',
    target2026: '—',
    status: 'Capaian 2026',
    monthlyData: generateEmptyMonthlyData(),
  };
}

/**
 * Helper to fetch all kendala items for a given pillar, including dates and parent indicator info
 */
export function getKendalaListByPillar(
  pillarId: 'pendidikan' | 'kesehatan' | 'bencana' | 'kemiskinan'
): PillarKendalaItem[] {
  const list: PillarKendalaItem[] = [];
  const seenKeys = new Set<string>();

  const SAMPLE_DATES = [
    { kendala: '12 Okt 2026', tindak: '18 Okt 2026' },
    { kendala: '10 Okt 2026', tindak: '16 Okt 2026' },
    { kendala: '08 Okt 2026', tindak: '15 Okt 2026' },
    { kendala: '05 Okt 2026', tindak: '14 Okt 2026' },
    { kendala: '03 Okt 2026', tindak: '11 Okt 2026' },
    { kendala: '28 Sep 2026', tindak: '08 Okt 2026' },
    { kendala: '25 Sep 2026', tindak: '05 Okt 2026' },
    { kendala: '20 Sep 2026', tindak: '02 Okt 2026' },
  ];

  for (const [key, prog] of Object.entries(PROGRAM_DETAILS_DATA)) {
    if (prog.pillarId !== pillarId) continue;

    // Avoid alias duplicate entries
    if (key === 'sekolah_unggul_garuda' || key === 'rehabilitasi_rekonstruksi_sumatera' || key === 'mbg_3b') {
      continue;
    }

    if (prog.kendalaList && prog.kendalaList.length > 0) {
      for (const k of prog.kendalaList) {
        const uniqueKey = `${prog.id}-${k.title}`;
        if (!seenKeys.has(uniqueKey)) {
          seenKeys.add(uniqueKey);
          const datePair = SAMPLE_DATES[list.length % SAMPLE_DATES.length];
          list.push({
            ...k,
            programId: prog.id,
            programTitle: prog.title,
            pillarId: prog.pillarId,
            tanggalKendala: k.tanggalKendala || datePair.kendala,
            tanggalTindakLanjut: k.tanggalTindakLanjut || datePair.tindak,
          });
        }
      }
    } else if (prog.kendala && prog.kendala.trim() !== '') {
      const uniqueKey = `${prog.id}-${prog.kendala.slice(0, 30)}`;
      if (!seenKeys.has(uniqueKey)) {
        seenKeys.add(uniqueKey);
        const datePair = SAMPLE_DATES[list.length % SAMPLE_DATES.length];
        list.push({
          id: `${prog.id}-1`,
          title: `Isu Operasional: ${prog.title}`,
          kendala: prog.kendala,
          tindakLanjut:
            prog.tindakLanjut ||
            'Koordinasi berkala lintas kementerian/lembaga untuk penanganan hambatan dan percepatan realisasi.',
          klTerkait: prog.picKementerian,
          urgensi: 'Sedang',
          tanggalKendala: datePair.kendala,
          tanggalTindakLanjut: datePair.tindak,
          programId: prog.id,
          programTitle: prog.title,
          pillarId: prog.pillarId,
        });
      }
    }
  }

  return list;
}

export interface IndicatorMainIssue {
  hasIssue: boolean;
  title?: string;
  description: string;
  totalCount: number;
}

/**
 * Resolves the primary issue/obstacle for an indicator card.
 * Handles single or multiple issues dynamically.
 */
export function getIndicatorMainIssue(
  programId: string,
  fallbackTitle?: string,
  pillarId?: 'pendidikan' | 'kesehatan' | 'bencana' | 'kemiskinan'
): IndicatorMainIssue {
  const prog = getProgramDetailData(programId, fallbackTitle, pillarId);
  if (prog.kendalaList && prog.kendalaList.length > 0) {
    const first = prog.kendalaList[0];
    return {
      hasIssue: true,
      title: first.title,
      description: first.kendala,
      totalCount: prog.kendalaList.length,
    };
  }
  if (prog.kendala && prog.kendala.trim() !== '') {
    return {
      hasIssue: true,
      title: prog.title ? `Isu Pelaksanaan: ${prog.title}` : 'Isu Pelaksanaan',
      description: prog.kendala,
      totalCount: 1,
    };
  }
  return {
    hasIssue: false,
    title: 'Status Pelaksanaan Terkendali',
    description: 'Tidak terdata kendala operasional kritis. Program berjalan sesuai target dan jadwal.',
    totalCount: 0,
  };
}
