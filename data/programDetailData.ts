export interface MonthlyDataPoint {
  month: number;
  monthName: string;
  target: number;
  capaian: number | null;
  targetFormatted: string;
  capaianFormatted: string;
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
 * Helper to generate cumulative or stepped monthly data points for a given annual target & actual
 */
function generateMonthlyData(options: {
  target2025: number;
  capaian2025: number;
  target2026: number;
  capaian2026Okt: number;
  target2027: number;
  unit: string;
  isCumulative?: boolean;
  isPercentage?: boolean;
}): Record<number, MonthlyDataPoint[]> {
  const isIntegerUnit =
    !options.isPercentage &&
    !options.unit.includes('%') &&
    !options.unit.includes('juta') &&
    !options.unit.includes('jt') &&
    !options.unit.includes('poin') &&
    !options.unit.includes('indeks') &&
    !options.unit.includes('PDB');

  const formatVal = (val: number | null) => {
    if (val === null) return '—';
    if (options.isPercentage) {
      return `${val.toLocaleString('id-ID', { maximumFractionDigits: 1 })}%`;
    }
    if (isIntegerUnit) {
      return `${Math.round(val).toLocaleString('id-ID')} ${options.unit}`;
    }
    if (val >= 1000) {
      return `${val.toLocaleString('id-ID')} ${options.unit}`;
    }
    return `${val.toLocaleString('id-ID', { maximumFractionDigits: 2 })} ${options.unit}`;
  };

  // 2025: Full Year 12 Months
  const data2025: MonthlyDataPoint[] = MONTH_NAMES.map((name, i) => {
    const monthNum = i + 1;
    const progressRatio = monthNum / 12;
    const rawT = options.target2025 * progressRatio;
    const rawC = options.capaian2025 * (progressRatio * (0.92 + Math.sin(monthNum) * 0.08));

    const t = isIntegerUnit ? Math.round(rawT) : Math.round(rawT * 10) / 10;
    const c = isIntegerUnit ? Math.round(rawC) : Math.round(rawC * 10) / 10;
    const pct = t > 0 ? Math.round((c / t) * 100) : 100;
    const status: MonthlyDataPoint['status'] = pct >= 95 ? 'Tercapai' : pct >= 80 ? 'Sesuai Target' : 'Perlu Percepatan';

    return {
      month: monthNum,
      monthName: name,
      target: t,
      capaian: c,
      targetFormatted: formatVal(t),
      capaianFormatted: formatVal(c),
      percentage: pct,
      status,
    };
  });

  // 2026: Jan - Okt (Completed), Nov - Des (Scheduled)
  const data2026: MonthlyDataPoint[] = MONTH_NAMES.map((name, i) => {
    const monthNum = i + 1;
    const targetProgress = monthNum / 12;
    const rawT = monthNum === 12 ? options.target2026 : options.target2026 * targetProgress;
    const t = isIntegerUnit ? Math.round(rawT) : Math.round(rawT * 10) / 10;

    if (monthNum <= 10) {
      // Past / Current month up to Oktober (cutoff)
      const actualProgress = monthNum / 10;
      let c: number;
      if (monthNum === 10) {
        c = options.capaian2026Okt;
      } else {
        const rawC = options.capaian2026Okt * actualProgress * (0.95 + (monthNum % 3) * 0.03);
        c = isIntegerUnit ? Math.min(options.capaian2026Okt, Math.round(rawC)) : Math.round(rawC * 10) / 10;
      }
      const pct = t > 0 ? Math.round((c / t) * 100) : 100;
      const status: MonthlyDataPoint['status'] =
        pct >= 95 ? 'Tercapai' : pct >= 75 ? 'Sesuai Target' : 'Perlu Percepatan';

      return {
        month: monthNum,
        monthName: name,
        target: t,
        capaian: c,
        targetFormatted: formatVal(t),
        capaianFormatted: formatVal(c),
        percentage: pct,
        status,
        note: monthNum === 10 ? 'Posisi per 18 Oktober 2026' : undefined,
      };
    } else {
      // Future month Nov - Des
      return {
        month: monthNum,
        monthName: name,
        target: t,
        capaian: null,
        targetFormatted: formatVal(t),
        capaianFormatted: '—',
        status: 'Terjadwal',
        note: 'Proyeksi triwulan IV',
      };
    }
  });

  // 2027: Projections
  const data2027: MonthlyDataPoint[] = MONTH_NAMES.map((name, i) => {
    const monthNum = i + 1;
    const rawT = options.target2027 * (monthNum / 12);
    const t = isIntegerUnit ? Math.round(rawT) : Math.round(rawT * 10) / 10;
    return {
      month: monthNum,
      monthName: name,
      target: t,
      capaian: null,
      targetFormatted: formatVal(t),
      capaianFormatted: '—',
      status: 'Terjadwal',
    };
  });

  return {
    2025: data2025,
    2026: data2026,
    2027: data2027,
  };
}

/**
 * Specialized helper for official PKPN slides (Revitalisasi Satdik & SNT)
 * where monthly progress is tracked specifically at cut-off (Oktober) and year-end target (Desember),
 * with Jan-Sep empty and Nov-Des showing official dashes.
 */
function generateOfficialMonthlyData(options: {
  target2026Formatted: string;
  capaian2026OktFormatted: string;
  percentage2026OktFormatted: string;
  target2026Numeric: number;
  capaian2026OktNumeric: number;
  unit: string;
}): Record<number, MonthlyDataPoint[]> {
  const data2026: MonthlyDataPoint[] = MONTH_NAMES.map((name, i) => {
    const monthNum = i + 1;

    if (monthNum <= 9) {
      // Jan - Sep: Empty in official report table (no target, no capaian reported)
      return {
        month: monthNum,
        monthName: name,
        target: 0,
        capaian: null,
        targetFormatted: '',
        capaianFormatted: '',
        percentageFormatted: '',
        status: 'Terjadwal',
        note: '',
      };
    } else if (monthNum === 10) {
      // Oktober (Posisi Berjalan Saat Ini - capaian cut-off reported)
      return {
        month: monthNum,
        monthName: name,
        target: 0,
        capaian: options.capaian2026OktNumeric,
        targetFormatted: '',
        capaianFormatted: options.capaian2026OktFormatted,
        percentageFormatted: options.percentage2026OktFormatted,
        percentage: parseFloat(options.percentage2026OktFormatted.replace(/[^0-9,.-]/g, '').replace(',', '.')),
        status: 'Sesuai Target',
        note: 'Posisi per 18 Oktober 2026',
      };
    } else if (monthNum === 11) {
      // November: In development / unrecorded
      return {
        month: monthNum,
        monthName: name,
        target: 0,
        capaian: null,
        targetFormatted: '',
        capaianFormatted: '—',
        percentageFormatted: '—',
        status: 'Terjadwal',
        note: '',
      };
    } else {
      // Desember (Target Akhir Tahun reported)
      return {
        month: monthNum,
        monthName: name,
        target: options.target2026Numeric,
        capaian: null,
        targetFormatted: options.target2026Formatted,
        capaianFormatted: '—',
        percentageFormatted: '—',
        status: 'Terjadwal',
        note: '',
      };
    }
  });

  return {
    2025: data2026,
    2026: data2026,
    2027: data2026,
  };
}

/**
 * Specialized helper for Studio Guru monthly data matching official presentation slide
 * where November 2026 has the specific target:
 * "Peluncuran 1 Studio pusat dengan minimal 100 Konten Pembelajaran"
 * and other months are blank without kendala.
 */
function generateStudioGuruMonthlyData(): Record<number, MonthlyDataPoint[]> {
  const data2026: MonthlyDataPoint[] = MONTH_NAMES.map((name, i) => {
    const monthNum = i + 1;
    if (monthNum === 11) {
      // November 2026: Target in official slide
      return {
        month: monthNum,
        monthName: name,
        target: 1,
        capaian: null,
        targetFormatted: 'Peluncuran 1 Studio pusat dengan minimal 100 Konten Pembelajaran',
        capaianFormatted: '',
        percentageFormatted: '',
        status: 'Terjadwal',
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
      status: 'Terjadwal',
      note: '',
    };
  });

  return {
    2025: data2026,
    2026: data2026,
    2027: data2026,
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
    unit: 'satuan pendidikan',
    currentValue: '36.669',
    target2026: '80.282 satuan pendidikan',
    status: 'Capaian 2026',
    subtext: 'Realisasi 2025: 17.508 satdik (136,5% target 2025)',
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
    monthlyData: generateOfficialMonthlyData({
      target2026Formatted: '80.282 satuan pendidikan',
      capaian2026OktFormatted: '36.669 satuan pendidikan',
      percentage2026OktFormatted: '45,7 %',
      target2026Numeric: 80282,
      capaian2026OktNumeric: 36669,
      unit: 'satuan pendidikan',
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
    unit: 'Sekolah Operasional',
    currentValue: '17',
    target2026: '35 SNT Operasional',
    status: 'Capaian 2026',
    subtext: 'Target Kumulatif 2027: 135 unit · 2028: 335 unit · 2029: 500 unit',
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
    monthlyData: generateOfficialMonthlyData({
      target2026Formatted: '35 SNT Operasional',
      capaian2026OktFormatted: '17 Sekolah Operasional',
      percentage2026OktFormatted: '48,6 %',
      target2026Numeric: 35,
      capaian2026OktNumeric: 17,
      unit: 'Sekolah Operasional',
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
    monthlyData: generateOfficialMonthlyData({
      target2026Formatted: '30 unit',
      capaian2026OktFormatted: '30 unit',
      percentage2026OktFormatted: '100 %',
      target2026Numeric: 30,
      capaian2026OktNumeric: 30,
      unit: 'unit',
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
    unit: 'satuan pendidikan',
    currentValue: '42',
    target2026: '30 satuan pendidikan',
    status: 'Capaian 2025 :12 satuan pendidikan; Capaian 2026: 30 satuan pendidikan',
    subtext: 'Capaian 2025 :12 satuan pendidikan; Capaian 2026: 30 satuan pendidikan · Target 2026: 30 satuan pendidikan',
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
    monthlyData: generateOfficialMonthlyData({
      target2026Formatted: '30 satuan pendidikan',
      capaian2026OktFormatted: '42 satuan pendidikan',
      percentage2026OktFormatted: '100 %',
      target2026Numeric: 30,
      capaian2026OktNumeric: 42,
      unit: 'satuan pendidikan',
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
    unit: 'satuan pendidikan',
    currentValue: '3',
    target2026: '4 satuan pendidikan',
    status: 'Capaian 2026',
    subtext: 'Target 2026: 4 satuan pendidikan · Realisasi: 3 satuan pendidikan (75%)',
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
    monthlyData: generateOfficialMonthlyData({
      target2026Formatted: '4 satuan pendidikan',
      capaian2026OktFormatted: '3 satuan pendidikan',
      percentage2026OktFormatted: '75 %',
      target2026Numeric: 4,
      capaian2026OktNumeric: 3,
      unit: 'satuan pendidikan',
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
    status: 'Capaian 2026 (Berproses disalurkan ke 316.535 sekolah)',
    subtext: 'Posisi per 18 Oktober 2026 (Berproses disalurkan ke 316.535 sekolah) · Realisasi 2025: 288.865 unit (100%)',
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
    monthlyData: generateOfficialMonthlyData({
      target2026Formatted: '727.436 unit',
      capaian2026OktFormatted: '727.436 unit',
      percentage2026OktFormatted: '100 %',
      target2026Numeric: 727436,
      capaian2026OktNumeric: 727436,
      unit: 'unit',
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
    currentValue: '1 studio pusat + 110 konten',
    target2026: 'Studio Guru beroperasi penuh',
    status: '1 studio pusat + 110 konten pembelajaran, launching 25 November 2026',
    subtext: 'Target 2026: Studio Guru beroperasi penuh',
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
    monthlyData: generateMonthlyData({
      target2025: 0.56,
      capaian2025: 0.562,
      target2026: 0.57,
      capaian2026Okt: 0.566,
      target2027: 0.575,
      unit: 'poin',
    }),
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
    monthlyData: generateMonthlyData({
      target2025: 102,
      capaian2025: 70.3,
      target2026: 130,
      capaian2026Okt: 105.98,
      target2027: 157,
      unit: 'jt jiwa',
      isCumulative: true,
    }),
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
    monthlyData: generateMonthlyData({
      target2025: 981000,
      capaian2025: 867480,
      target2026: 972000,
      capaian2026Okt: 656517,
      target2027: 963014,
      unit: 'kasus',
      isCumulative: true,
    }),
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
    monthlyData: generateMonthlyData({
      target2025: 21,
      capaian2025: 21,
      target2026: 20,
      capaian2026Okt: 18,
      target2027: 66,
      unit: 'RSUD',
      isCumulative: true,
    }),
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
    monthlyData: generateMonthlyData({
      target2025: 35,
      capaian2025: 32,
      target2026: 50,
      capaian2026Okt: 54.5,
      target2027: 70,
      unit: '%',
      isPercentage: true,
    }),
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
    monthlyData: generateMonthlyData({
      target2025: 20.5,
      capaian2025: 19.8,
      target2026: 18.2,
      capaian2026Okt: 17.6,
      target2027: 16.5,
      unit: '%',
      isPercentage: true,
    }),
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
    monthlyData: generateMonthlyData({
      target2025: 10,
      capaian2025: 8,
      target2026: 16.7,
      capaian2026Okt: 4.89,
      target2027: 25,
      unit: 'jt jiwa',
      isCumulative: true,
    }),
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
    monthlyData: generateMonthlyData({
      target2025: 1500,
      capaian2025: 1200,
      target2026: 2490,
      capaian2026Okt: 656,
      target2027: 3500,
      unit: 'rb jiwa',
      isCumulative: true,
    }),
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
    monthlyData: generateMonthlyData({
      target2025: 1800,
      capaian2025: 1600,
      target2026: 2750,
      capaian2026Okt: 1770,
      target2027: 3500,
      unit: 'rb jiwa',
      isCumulative: true,
    }),
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
    monthlyData: generateMonthlyData({
      target2025: 2000,
      capaian2025: 2000,
      target2026: 5000,
      capaian2026Okt: 4200,
      target2027: 10000,
      unit: 'unit',
      isCumulative: true,
    }),
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
    monthlyData: generateMonthlyData({
      target2025: 100,
      capaian2025: 100,
      target2026: 250,
      capaian2026Okt: 210,
      target2027: 450,
      unit: 'RS',
      isCumulative: true,
    }),
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
    monthlyData: generateMonthlyData({
      target2025: 7200,
      capaian2025: 3350,
      target2026: 60045,
      capaian2026Okt: 21974,
      target2027: 77500,
      unit: 'unit',
      isCumulative: true,
    }),
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
    monthlyData: generateMonthlyData({
      target2025: 5000,
      capaian2025: 1200,
      target2026: 39501,
      capaian2026Okt: 1707,
      target2027: 57027,
      unit: 'unit',
      isCumulative: true,
    }),
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
    monthlyData: generateMonthlyData({
      target2025: 15000,
      capaian2025: 14800,
      target2026: 20544,
      capaian2026Okt: 20267,
      target2027: 21000,
      unit: 'unit',
      isCumulative: true,
    }),
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
    monthlyData: generateMonthlyData({
      target2025: 3200,
      capaian2025: 3176,
      target2026: 2500,
      capaian2026Okt: 2096,
      target2027: 2400,
      unit: 'kejadian',
      isCumulative: true,
    }),
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
    monthlyData: generateMonthlyData({
      target2025: 100,
      capaian2025: 100,
      target2026: 100,
      capaian2026Okt: 100,
      target2027: 100,
      unit: '%',
      isPercentage: true,
    }),
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
    monthlyData: generateMonthlyData({
      target2025: 80,
      capaian2025: 78,
      target2026: 100,
      capaian2026Okt: 99,
      target2027: 100,
      unit: '%',
      isPercentage: true,
    }),
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
    monthlyData: generateMonthlyData({
      target2025: 0.137,
      capaian2025: 0.137,
      target2026: 0.137,
      capaian2026Okt: 0.137,
      target2027: 0.136,
      unit: '% PDB',
      isPercentage: true,
    }),
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
    monthlyData: generateMonthlyData({
      target2025: 8.5,
      capaian2025: 8.25,
      target2026: 7.0,
      capaian2026Okt: 8.07,
      target2027: 6.2,
      unit: '%',
      isPercentage: true,
    }),
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
    monthlyData: generateMonthlyData({
      target2025: 1.2,
      capaian2025: 0.83,
      target2026: 0.5,
      capaian2026Okt: 0.65,
      target2027: 0.0,
      unit: '%',
      isPercentage: true,
    }),
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
    monthlyData: generateMonthlyData({
      target2025: 116754,
      capaian2025: 116754,
      target2026: 120000,
      capaian2026Okt: 45000,
      target2027: 150000,
      unit: 'orang',
      isCumulative: true,
    }),
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
    monthlyData: generateMonthlyData({
      target2025: 36000,
      capaian2025: 36000,
      target2026: 40000,
      capaian2026Okt: 12000,
      target2027: 50000,
      unit: 'orang',
      isCumulative: true,
    }),
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
    monthlyData: generateMonthlyData({
      target2025: 94,
      capaian2025: 94,
      target2026: 94.5,
      capaian2026Okt: 94.2,
      target2027: 95,
      unit: 'poin',
    }),
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
    monthlyData: generateMonthlyData({
      target2025: 69,
      capaian2025: 69,
      target2026: 69.5,
      capaian2026Okt: 69.2,
      target2027: 70,
      unit: 'poin',
    }),
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
    monthlyData: generateMonthlyData({
      target2025: 100,
      capaian2025: 95,
      target2026: 100,
      capaian2026Okt: 75,
      target2027: 120,
      unit: 'unit',
    }),
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
          list.push({
            ...k,
            programId: prog.id,
            programTitle: prog.title,
            pillarId: prog.pillarId,
            tanggalKendala: k.tanggalKendala || '05 Okt 2026',
            tanggalTindakLanjut: k.tanggalTindakLanjut || '14 Okt 2026',
          });
        }
      }
    } else if (prog.kendala && prog.kendala.trim() !== '') {
      const uniqueKey = `${prog.id}-${prog.kendala.slice(0, 30)}`;
      if (!seenKeys.has(uniqueKey)) {
        seenKeys.add(uniqueKey);
        list.push({
          id: `${prog.id}-1`,
          title: `Isu Operasional: ${prog.title}`,
          kendala: prog.kendala,
          tindakLanjut:
            prog.tindakLanjut ||
            'Koordinasi berkala lintas kementerian/lembaga untuk penanganan hambatan dan percepatan realisasi.',
          klTerkait: prog.picKementerian,
          urgensi: 'Sedang',
          tanggalKendala: '10 Okt 2026',
          tanggalTindakLanjut: '18 Okt 2026',
          programId: prog.id,
          programTitle: prog.title,
          pillarId: prog.pillarId,
        });
      }
    }
  }

  return list;
}
