export interface MonthlyDataPoint {
  month: number;
  monthName: string;
  target: number;
  capaian: number | null;
  targetFormatted: string;
  capaianFormatted: string;
  percentage?: number;
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
  const formatVal = (val: number | null) => {
    if (val === null) return '—';
    if (options.isPercentage) {
      return `${val.toLocaleString('id-ID', { maximumFractionDigits: 1 })}%`;
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
    const t = Math.round(options.target2025 * progressRatio * 10) / 10;
    const c = Math.round(options.capaian2025 * (progressRatio * (0.92 + Math.sin(monthNum) * 0.08)) * 10) / 10;
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
    const t = Math.round(options.target2026 * targetProgress * 10) / 10;

    if (monthNum <= 10) {
      // Past / Current month up to Oktober (cutoff)
      const actualProgress = monthNum / 10;
      // Add slight realistic variation
      const c =
        monthNum === 10
          ? options.capaian2026Okt
          : Math.round(options.capaian2026Okt * actualProgress * (0.95 + (monthNum % 3) * 0.03) * 10) / 10;
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
    const t = Math.round(options.target2027 * (monthNum / 12) * 10) / 10;
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

export const PROGRAM_DETAILS_DATA: Record<string, ProgramDetailData> = {
  // =========================================================================
  // PILAR 1: PENDIDIKAN
  // =========================================================================
  'revitalisasi_satdik': {
    id: 'revitalisasi_satdik',
    title: 'Revitalisasi Sarana dan Prasarana Sekolah/Madrasah',
    pillarId: 'pendidikan',
    pillarTitle: 'Pendidikan',
    category: 'Infrastruktur Sekolah',
    description:
      'Program peningkatan kualitas dan kelayakan sarana-prasarana sekolah melalui rehabilitasi dan pembangunan fasilitas pendidikan untuk mendukung pemerataan akses dan mutu pembelajaran.',
    picKementerian: 'Kemendikdasmen, Kemenag, Kementerian PUPR, Kemendagri',
    unit: 'satuan pendidikan',
    currentValue: '36.669',
    target2026: '80.282 satuan pendidikan',
    status: 'Capaian 2026 (45,7%)',
    subtext: 'Realisasi 2025: 17.508 satuan pendidikan (136,5% target 2025)',
    kendala: 'ABT 7.131 madrasah belum disetujui; 41 madrasah terdampak bencana butuh penanganan mendesak.',
    tindakLanjut:
      'Percepatan persetujuan Anggaran Belanja Tambahan (ABT), realokasi bantuan darurat sekolah terdampak bencana, dan penerbitan Instruksi Mendagri untuk dukungan pemda.',
    kendalaList: [
      {
        id: 1,
        title: 'Persetujuan Anggaran Belanja Tambahan (ABT) untuk 7.131 Madrasah',
        kendala: 'Pengusulan alokasi Anggaran Belanja Tambahan (ABT) untuk 7.131 madrasah swasta dan negeri masih menunggu persetujuan definitif dari Kementerian Keuangan. Ketiadaan kepastian DIPA tambahan berpotensi menunda target serah terima fisik pekerjaan konstruksi tahun anggaran berjalan.',
        tindakLanjut: 'Percepatan rapat koordinasi tingkat menteri (RTM) Kemenko PMK bersama Kemenkeu dan Kemenag guna menyepakati alokasi prioritas dan mekanisme revisi anggaran belanja.',
        klTerkait: 'Kemenkeu, Kemenag, Kemenko PMK',
      },
      {
        id: 2,
        title: 'Penanganan Darurat 41 Madrasah & Sekolah Terdampak Bencana Alam',
        kendala: 'Sebanyak 41 madrasah di kawasan rawan bencana (Sumatera Barat dan NTT) mengalami kerusakan struktur berat dan membutuhkan relokasi tapak lahan baru yang bebas dari zona bahaya sesar aktif.',
        tindakLanjut: 'Penerbitan instruksi bersama Mendagri dan Menteri ATR/BPN untuk penetapan status lahan relokasi aman oleh pemerintah daerah serta penyaluran dana siap pakai BNPB.',
        klTerkait: 'BNPB, Kemendagri, Kementerian ATR/BPN',
      },
      {
        id: 3,
        title: 'Kapasitas Pengadaan & Komitmen APBD Pemerintah Daerah',
        kendala: 'Disparitas kesiapan unit kerja pengadaan barang/jasa di dinas pendidikan kabupaten/kota 3T yang mengakibatkan keterlambatan verifikasi teknis dan validasi lapangan sekolah sasaran.',
        tindakLanjut: 'Pemberian pendampingan teknis dan probity audit oleh BPKP dan Kemendikdasmen pada 50 kabupaten prioritas percepatan.',
        klTerkait: 'Kemendikdasmen, BPKP, Pemda',
      },
    ],
    monthlyData: generateMonthlyData({
      target2025: 12825,
      capaian2025: 17508,
      target2026: 80282,
      capaian2026Okt: 36669,
      target2027: 99423,
      unit: 'satdik',
      isCumulative: true,
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
    unit: 'satuan pendidikan',
    currentValue: '17',
    target2026: '35 satuan pendidikan',
    status: 'Capaian 2026 (48,6%)',
    subtext: 'Target Kumulatif 2027: 135 satuan pendidikan · 2029: 500 unit · Capaian Nasional',
    kendala: 'RPerpres SNT belum ditetapkan; terkendala kesiapan legalitas lahan dan ketersediaan guru tetap.',
    tindakLanjut:
      'Percepatan pengesahan RPerpres SNT: finalisasi harmonisasi regulasi, kepastian status Proyek Strategis Nasional (PSN), penataan formasi guru, dan kepastian NPSN.',
    monthlyData: generateMonthlyData({
      target2025: 10,
      capaian2025: 10,
      target2026: 35,
      capaian2026Okt: 17,
      target2027: 135,
      unit: 'unit',
      isCumulative: true,
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
    unit: 'satuan pendidikan',
    currentValue: '46',
    target2026: '34 satuan pendidikan',
    status: 'Capaian 2026 (46 Unit)',
    subtext: 'Terdiri dari 42 unit SUGT (15 provinsi) dan 4 unit SUGB (4 provinsi)',
    kendala: 'Perpres Tunjangan Guru dan Tenaga Kependidikan (GTK) SUG belum ditetapkan.',
    tindakLanjut:
      'Percepatan penetapan Perpres Tunjangan GTK SUG, penegasan pembagian kewenangan pembiayaan, dan penyelesaian fisik kampus.',
    monthlyData: generateMonthlyData({
      target2025: 16,
      capaian2025: 14,
      target2026: 34,
      capaian2026Okt: 46,
      target2027: 55,
      unit: 'satdik',
      isCumulative: true,
    }),
  },

  'sug_transformasi': {
    id: 'sug_transformasi',
    title: 'Sekolah Unggul Garuda Transformasi (SUGT)',
    pillarId: 'pendidikan',
    pillarTitle: 'Pendidikan',
    category: 'Transformasi Mutu Sekolah',
    description:
      'Program pengembangan sekolah menengah atas unggulan melalui transformasi SMA yang sudah ada, dengan penguatan pendidikan sains dan teknologi untuk menyiapkan talenta berprestasi dan berdaya saing global di 15 provinsi (42 unit total).',
    picKementerian: 'Kemendikdasmen, Bappenas, Kemenkeu',
    unit: 'satuan pendidikan',
    currentValue: '42',
    target2026: '30 satuan pendidikan',
    status: 'Capaian 2026: 42 Unit (15 Provinsi)',
    subtext: 'Sebaran: Aceh (3), Sumut (1), Sumsel (2), DKI (6), Banten (4), Jabar (7), Jateng (6), DIY (3), Jatim (2), Kalsel (1), Kaltim (2), Gorontalo (1), Sulsel (2), Maluku (1), Papua Barat Daya (1)',
    kendala: 'Kebutuhan standar akreditasi internasional dan penyelarasan tunjangan guru pembina riset.',
    tindakLanjut:
      'Pemberian asistensi teknis riset siswa, sertifikasi laboratorium sains, dan integrasi dengan perguruan tinggi mitra terkemuka.',
    monthlyData: generateMonthlyData({
      target2025: 12,
      capaian2025: 12,
      target2026: 30,
      capaian2026Okt: 42,
      target2027: 50,
      unit: 'satdik',
      isCumulative: true,
    }),
  },

  'sug_baru': {
    id: 'sug_baru',
    title: 'Sekolah Unggul Garuda Baru (SUGB)',
    pillarId: 'pendidikan',
    pillarTitle: 'Pendidikan',
    category: 'Pendidikan Keunggulan',
    description:
      'Program pengembangan sekolah menengah atas unggulan melalui pembangunan Sekolah Garuda Baru berasrama dengan kurikulum sains & teknologi global di 4 provinsi (Bangka Belitung, Kalimantan Utara, Sulawesi Tenggara, Nusa Tenggara Timur).',
    picKementerian: 'Kemendikdasmen, Kemenkeu, Kementerian PUPR, Setneg',
    unit: 'satuan pendidikan',
    currentValue: '4',
    target2026: '4 satuan pendidikan',
    status: 'Capaian 2026: 4 Unit (4 Provinsi)',
    subtext: 'Sebaran: Kepulauan Bangka Belitung (1), Kalimantan Utara (1), Sulawesi Tenggara (1), Nusa Tenggara Timur (1)',
    kendala: 'Perpres Tunjangan Guru dan Tenaga Kependidikan (GTK) SUG belum ditetapkan.',
    tindakLanjut:
      'Percepatan penetapan Perpres Tunjangan GTK SUG, penegasan pembagian kewenangan pembiayaan, dan penyelesaian fisik kampus percontohan.',
    monthlyData: generateMonthlyData({
      target2025: 4,
      capaian2025: 2,
      target2026: 4,
      capaian2026Okt: 4,
      target2027: 5,
      unit: 'satdik',
      isCumulative: true,
    }),
  },

  'digitalisasi_pendidikan': {
    id: 'digitalisasi_pendidikan',
    title: 'Digitalisasi Pembelajaran',
    pillarId: 'pendidikan',
    pillarTitle: 'Pendidikan',
    category: 'Teknologi Pembelajaran',
    description:
      'Program transformasi pembelajaran melalui penyediaan interactive flat panel, konten pembelajaran digital, dan infrastruktur teknologi informasi untuk mewujudkan pembelajaran yang interaktif dan merata.',
    picKementerian: 'Kemendikdasmen, Kemenkomdigi, Kemenkeu',
    unit: 'unit perangkat',
    currentValue: '727.436',
    target2026: '727.436 unit',
    status: 'Capaian 2026 (100% Berproses)',
    subtext: 'Realisasi 2025: 288.865 unit terdistribusi 100% · Capaian Nasional',
    kendala: 'Tantangan logistik moda transportasi pulau terluar dan keandalan daya listrik di sekolah pedalaman.',
    tindakLanjut:
      'Koordinasi jalur distribusi perintis dengan Kemenhub, serta penyediaan paket panel surya hemat energi bagi sekolah off-grid.',
    monthlyData: generateMonthlyData({
      target2025: 288865,
      capaian2025: 288865,
      target2026: 727436,
      capaian2026Okt: 727436,
      target2027: 850000,
      unit: 'unit',
      isCumulative: true,
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
    unit: 'tahap',
    currentValue: 'Penyiapan',
    target2026: 'Peluncuran Nov 2027',
    status: 'Tahap Penyiapan',
    subtext: 'Target Peluncuran: November 2027 · Operasionalisasi Nasional: 2028 · Capaian Nasional',
    kendala: 'Standardisasi kurikulum produksi modul digital dan kesiapan studio percontohan wilayah.',
    tindakLanjut:
      'Finalisasi pedoman teknis studio guru dan workshop konten digital bersama perguruan tinggi LPTK mitra.',
    monthlyData: generateMonthlyData({
      target2025: 50,
      capaian2025: 50,
      target2026: 70,
      capaian2026Okt: 50,
      target2027: 100,
      unit: 'tahap',
      isPercentage: true,
    }),
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
    kendala: 'Disparitas capaian literasi dan numerasi antar-wilayah serta beban stunting balita masa lalu.',
    tindakLanjut:
      'Penguatan kurikulum fondasi di jenjang PAUD-SD kelas awal dan sinkronisasi intervensi spesifik kesehatan ibu-anak.',
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
      'Pemberian Makanan Bergizi Gratis (MBG) bernutrisi lengkap bagi balita usia 6-59 bulan non-PAUD pada kantong kemiskinan dan kawasan rawan pangan.',
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
      'Suplementasi dan pemenuhan gizi seimbang bagi ibu hamil berisiko KEK (Kurang Energi Kronis) untuk mencegah BBLR dan stunting sejak dini.',
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
      'Bantuan makanan bergizi tinggi protein hewani dan mikro-nutrien bagi ibu menyusui hingga usia bayi 6 bulan untuk menjamin kualitas ASI eksklusif.',
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
    kendala: 'Pemeliharaan fasilitas sanitasi air bersih di lokasi huntara padat penghuni.',
    tindakLanjut:
      'Penyaluran bantuan biaya operasional sanitasi berkala dan pengawasan kesehatan lingkungan oleh puskesmas.',
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
    kendala: 'Kenaikan harga pangan beras dan keterlambatan penyaluran bansos adaptif di wilayah kantong pedesaan.',
    tindakLanjut:
      'Penguatan operasi pasar cadangan pangan beras pemerintah dan integrasi sasaran intervensi MBG pada desil 1–2.',
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
    kendala: 'Fasilitas transportasi umum ramah lansia belum merata di luar pulau Jawa.',
    tindakLanjut:
      'Penyusunan standar pedoman fasilitas publik ramah lansia dan ramah disabilitas di terminal serta puskesmas daerah.',
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
    kendala: 'Keterbatasan kuota bantuan alat bantu dengar, kursi roda adaptif, dan kruk di daerah 3T.',
    tindakLanjut:
      'Perluasan program bantuan alat bantu berbasis asesmen kebutuhan sentra Kemensos di daerah.',
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
  sug: 'sekolah_unggul_garuda',
  sug_semua: 'sekolah_unggul_garuda',
  // Kesehatan
  penuntasan_tb: 'tb',
  revitalisasi_rsud: 'rsud',
  cek_kesehatan_gratis: 'ckg',
  mbg_kesehatan: 'mbg_3b',
  // Bencana
  rehabilitasi_sumatera: 'rehabilitasi_rekonstruksi_sumatera',
  rehabilitasi_dan_rekonstruksi_sumatera: 'rehabilitasi_rekonstruksi_sumatera',
  huntara_bencana: 'huntara',
  huntap_bencana: 'huntap',
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
