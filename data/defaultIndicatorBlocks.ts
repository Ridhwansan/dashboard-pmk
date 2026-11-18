import { DetailBlockConfig, MapPointMarker } from '@/types/cms';
import { INITIAL_CMS_CARDS, CmsCardItem } from './initialCmsCards';

export const REVITALISASI_SATDIK_BLOCKS: DetailBlockConfig[] = [
  {
    id: 'kpi_revitalisasi',
    type: 'kpi_cards',
    title: 'Indikator Utama Revitalisasi Sekolah dan Madrasah',
    subtitle: 'Kondisi awal • Kebutuhan • Progres • Hasil dan Manfaat',
    width: 'full',
    order: 1,
    enabled: true,
    data: {
      mode: 'comparator',
      items: [
        {
          id: 'kpi1',
          label: 'Sekolah Sasaran',
          val2025: '18.400',
          val2026: '20.500',
          unit: 'sekolah',
          subtext: 'Satuan: sekolah',
          delta: '+11,4%',
        },
        {
          id: 'kpi2',
          label: 'Ruang Ditangani',
          val2025: '23.000',
          val2026: '26.100',
          unit: 'ruang',
          subtext: 'Satuan: ruang',
          delta: '+13,5%',
        },
        {
          id: 'kpi3',
          label: 'Anggaran Terealisasi',
          val2025: 'Rp4,7 T',
          val2026: 'Rp5,5 T',
          unit: 'rupiah',
          subtext: 'Satuan: rupiah',
          delta: '+17,0%',
        },
        {
          id: 'kpi4',
          label: 'Siswa Penerima Manfaat',
          val2025: '1,24 jt',
          val2026: '1,46 jt',
          unit: 'siswa',
          subtext: 'Satuan: siswa',
          delta: '+17,7%',
        },
      ],
    },
  },
  {
    id: 'peta_revitalisasi',
    type: 'spatial_map',
    title: 'PERSEBARAN SEKOLAH SASARAN',
    subtitle: 'Sebaran sekolah penerima program berdasarkan titik lokasi di Indonesia',
    width: 'half',
    order: 2,
    enabled: true,
    data: {
      mapMode: 'points',
      centerLat: -2.5,
      centerLng: 118.0,
      zoom: 5,
      legendTitle: 'Sebaran Program Revitalisasi',
      markers: [
        { id: 'm1', name: 'SDN 01 Banda Aceh', kabKota: 'Kota Banda Aceh', provinsi: 'Aceh', lat: 5.5483, lng: 95.3238, year: 2025, status: 'Selesai 2025', note: '120 siswa terdampak' },
        { id: 'm2', name: 'SMPN 03 Medan Baru', kabKota: 'Kota Medan', provinsi: 'Sumatera Utara', lat: 3.5952, lng: 98.6722, year: 2026, status: 'Rehab 2026', note: '240 siswa sasaran' },
        { id: 'm3', name: 'SDN 05 Padang Barat', kabKota: 'Kota Padang', provinsi: 'Sumatera Barat', lat: -0.9471, lng: 100.4172, year: 2025, status: 'Selesai 2025', note: '85 siswa' },
        { id: 'm4', name: 'SMPN 01 Palembang', kabKota: 'Kota Palembang', provinsi: 'Sumatera Selatan', lat: -2.9761, lng: 104.7754, year: 2026, status: 'Rehab 2026', note: '190 siswa' },
        { id: 'm5', name: 'SDN Menteng 01 Jakarta', kabKota: 'Jakarta Pusat', provinsi: 'DKI Jakarta', lat: -6.1975, lng: 106.8327, year: 2025, status: 'Selesai 2025', note: '310 siswa' },
        { id: 'm6', name: 'SMPN 02 Bandung Wetan', kabKota: 'Kota Bandung', provinsi: 'Jawa Barat', lat: -6.9175, lng: 107.6191, year: 2026, status: 'Rehab 2026', note: '280 siswa' },
        { id: 'm7', name: 'SDN Candisari 01', kabKota: 'Kota Semarang', provinsi: 'Jawa Tengah', lat: -6.9667, lng: 110.4167, year: 2025, status: 'Selesai 2025', note: '175 siswa' },
        { id: 'm8', name: 'SMPN 05 Surabaya Pusat', kabKota: 'Kota Surabaya', provinsi: 'Jawa Timur', lat: -7.2575, lng: 112.7521, year: 2026, status: 'Rehab 2026', note: '320 siswa' },
        { id: 'm9', name: 'SDN 02 Denpasar Timur', kabKota: 'Kota Denpasar', provinsi: 'Bali', lat: -8.6705, lng: 115.2126, year: 2025, status: 'Selesai 2025', note: '110 siswa' },
        { id: 'm10', name: 'SMPN 01 Pontianak Kota', kabKota: 'Kota Pontianak', provinsi: 'Kalimantan Barat', lat: -0.0263, lng: 109.3425, year: 2026, status: 'Rehab 2026', note: '145 siswa' },
        { id: 'm11', name: 'SDN 001 Balikpapan Kota', kabKota: 'Kota Balikpapan', provinsi: 'Kalimantan Timur', lat: -1.2379, lng: 116.8529, year: 2026, status: 'Rehab 2026', note: '205 siswa' },
        { id: 'm12', name: 'SMPN 06 Makassar Barat', kabKota: 'Kota Makassar', provinsi: 'Sulawesi Selatan', lat: -5.1477, lng: 119.4327, year: 2025, status: 'Selesai 2025', note: '260 siswa' },
        { id: 'm13', name: 'SDN 01 Manado Malalayang', kabKota: 'Kota Manado', provinsi: 'Sulawesi Utara', lat: 1.4748, lng: 124.8421, year: 2026, status: 'Rehab 2026', note: '95 siswa' },
        { id: 'm14', name: 'SMPN 02 Teluk Ambon', kabKota: 'Kota Ambon', provinsi: 'Maluku', lat: -3.6547, lng: 128.1906, year: 2025, status: 'Selesai 2025', note: '80 siswa' },
        { id: 'm15', name: 'SD Inpres Jayapura Utara', kabKota: 'Kota Jayapura', provinsi: 'Papua', lat: -2.5337, lng: 140.7181, year: 2026, status: 'Rehab 2026', note: '130 siswa' },
      ],
    },
  },
  {
    id: 'kondisi_kerusakan_ruang',
    type: 'category_bars',
    title: 'KONDISI AWAL: RUANG MENURUT TINGKAT KERUSAKAN',
    subtitle: 'Jumlah ruang teridentifikasi berdasarkan tingkat kerusakan (2025 vs 2026)',
    width: 'half',
    order: 3,
    enabled: true,
    data: {
      chartTitle: 'Tingkat Kerusakan Ruang',
      description: 'Perbandingan jumlah ruang rusak ringan, sedang, dan berat',
      unit: 'ruang',
      categories: [
        { id: 'c1', name: 'Rusak ringan', val2025: 32000, val2026: 30500, val2025Label: '32.000', val2026Label: '30.500' },
        { id: 'c2', name: 'Rusak sedang', val2025: 21000, val2026: 23000, val2025Label: '21.000', val2026Label: '23.000' },
        { id: 'c3', name: 'Rusak berat', val2025: 14000, val2026: 16200, val2025Label: '14.000', val2026Label: '16.200' },
      ],
    },
  },
  {
    id: 'progres_fisik_keuangan',
    type: 'progress_metrics',
    title: 'PROGRES FISIK DAN KEUANGAN',
    subtitle: 'Rata-rata progres pekerjaan pada periode pengamatan',
    width: 'third',
    order: 4,
    enabled: true,
    data: {
      title: 'Progres Pekerjaan',
      items: [
        { id: 'p1', label: 'Fisik', val2025: 78, val2026: 84, deltaLabel: '+6 pp', unit: '%' },
        { id: 'p2', label: 'Keuangan', val2025: 74, val2026: 80, deltaLabel: '+6 pp', unit: '%' },
      ],
    },
  },
  {
    id: 'hasil_pekerjaan_manfaat',
    type: 'category_bars',
    title: 'HASIL PEKERJAAN DAN MANFAAT',
    subtitle: 'Keluaran fisik dan siswa penerima manfaat',
    width: 'third',
    order: 5,
    enabled: true,
    data: {
      chartTitle: 'Keluaran Fisik & Manfaat',
      categories: [
        { id: 'h1', name: 'Ruang selesai (ruang)', val2025: 19800, val2026: 22100, val2025Label: '19.800', val2026Label: '22.100' },
        { id: 'h2', name: 'Siswa penerima (x10k jiwa)', val2025: 12400, val2026: 14600, val2025Label: '1,24 jt', val2026Label: '1,46 jt' },
      ],
    },
  },
  {
    id: 'lokasi_perhatian_revitalisasi',
    type: 'watchlist',
    title: 'LOKASI YANG MEMERLUKAN PERHATIAN',
    subtitle: 'Contoh hasil penyaringan berdasarkan progres dan kendala',
    width: 'third',
    order: 6,
    enabled: true,
    data: {
      title: 'Penyaringan Lokasi Perhatian',
      actionDirection: 'Percepatan • Serah terima • Pemanfaatan',
      items: [
        {
          id: 'w1',
          title: 'SEKOLAH A',
          location: 'Kabupaten A',
          findings: 'Progres fisik <40% di bawah rencana target kerja pelaksana',
          action: 'Percepatan pekerjaan konstruksi fisik',
          statusSeverity: 'danger',
        },
        {
          id: 'w2',
          title: 'SEKOLAH B',
          location: 'Kabupaten B',
          findings: 'Pekerjaan selesai • proses serah terima belum tuntas',
          action: 'Penyelesaian administrasi serah terima',
          statusSeverity: 'warning',
        },
        {
          id: 'w3',
          title: 'SEKOLAH C',
          location: 'Kabupaten C',
          findings: 'Bangunan selesai berdiri • belum dimanfaatkan optimal',
          action: 'Verifikasi kesiapan mebeler & pemanfaatan ruang',
          statusSeverity: 'warning',
        },
      ],
    },
  },
  {
    id: 'insight_revitalisasi',
    type: 'insight_callout',
    title: 'INSIGHT UTAMA',
    width: 'full',
    order: 7,
    enabled: true,
    data: {
      title: 'INSIGHT UTAMA',
      insights: [
        'Jumlah ruang ditangani meningkat 13,5% dibandingkan 2025.',
        'Progres fisik naik 6 poin persentase; progres keuangan naik 6 poin persentase.',
        'Prioritas pemantauan: percepatan pekerjaan, serah terima, dan pemanfaatan ruang.',
      ],
    },
  },
];

export const SNT_OPERASIONAL_BLOCKS: DetailBlockConfig[] = [
  {
    id: 'kpi_snt',
    type: 'kpi_cards',
    title: 'SEKOLAH NASIONAL TERINTEGRASI',
    subtitle: 'Kesiapan lokasi • Progres pembangunan • Kapasitas • Operasional',
    width: 'full',
    order: 1,
    enabled: true,
    data: {
      mode: 'multi',
      items: [
        { id: 'snt1', label: 'LOKASI SNT', value: '42', subtext: '42 lokasi teridentifikasi' },
        { id: 'snt2', label: 'LAHAN SIAP', value: '31', subtext: 'dari 42 lokasi sasaran' },
        { id: 'snt3', label: 'KAPASITAS SISWA', value: '21.000', subtext: 'daya tampung' },
        { id: 'snt4', label: 'SISWA AKTIF', value: '12.600', subtext: '60% kapasitas' },
        { id: 'snt5', label: 'KETERSEDIAAN GURU', value: '84%', subtext: '1.050 dari 1.250' },
      ],
    },
  },
  {
    id: 'peta_snt',
    type: 'spatial_map',
    title: '01 PERSEBARAN LOKASI SNT',
    subtitle: 'Lokasi SNT • Titik sebaran contoh di Indonesia',
    width: 'half',
    order: 2,
    enabled: true,
    data: {
      mapMode: 'points',
      centerLat: -2.5,
      centerLng: 118.0,
      zoom: 5,
      legendTitle: 'Titik Sebaran Lokasi SNT',
      markers: [
        { id: 's1', name: 'SNT Terpadu Aceh Besar', kabKota: 'Aceh Besar', provinsi: 'Aceh', lat: 5.3828, lng: 95.4512, year: 2025, status: 'Beroperasi', note: '320 siswa' },
        { id: 's2', name: 'SNT Toba Samosir', kabKota: 'Toba', provinsi: 'Sumatera Utara', lat: 2.3833, lng: 99.1333, year: 2026, status: 'Konstruksi', note: '450 siswa' },
        { id: 's3', name: 'SNT Padang Pariaman', kabKota: 'Padang Pariaman', provinsi: 'Sumatera Barat', lat: -0.6333, lng: 100.2833, year: 2025, status: 'Beroperasi', note: '300 siswa' },
        { id: 's4', name: 'SNT Banten Terpadu', kabKota: 'Serang', provinsi: 'Banten', lat: -6.4058, lng: 106.064, year: 2026, status: 'Konstruksi', note: '480 siswa' },
        { id: 's5', name: 'SNT Gunung Kidul', kabKota: 'Gunung Kidul', provinsi: 'DI Yogyakarta', lat: -7.9667, lng: 110.6000, year: 2025, status: 'Beroperasi', note: '520 siswa' },
        { id: 's6', name: 'SNT Banyuwangi Unggulan', kabKota: 'Banyuwangi', provinsi: 'Jawa Timur', lat: -8.2192, lng: 114.3691, year: 2026, status: 'Konstruksi', note: '510 siswa' },
        { id: 's7', name: 'SNT Lombok Timur', kabKota: 'Lombok Timur', provinsi: 'NTB', lat: -8.6500, lng: 116.5333, year: 2025, status: 'Beroperasi', note: '290 siswa' },
        { id: 's8', name: 'SNT Sambas Perbatasan', kabKota: 'Sambas', provinsi: 'Kalimantan Barat', lat: 1.3667, lng: 109.3000, year: 2026, status: 'Konstruksi', note: '340 siswa' },
        { id: 's9', name: 'SNT Penajam IKN', kabKota: 'Penajam Paser Utara', provinsi: 'Kalimantan Timur', lat: -0.9000, lng: 116.7000, year: 2026, status: 'Konstruksi', note: '600 siswa' },
        { id: 's10', name: 'SNT Bone Terpadu', kabKota: 'Bone', provinsi: 'Sulawesi Selatan', lat: -4.5386, lng: 120.3283, year: 2025, status: 'Beroperasi', note: '410 siswa' },
        { id: 's11', name: 'SNT Minahasa Utara', kabKota: 'Minahasa Utara', provinsi: 'Sulawesi Utara', lat: 1.4000, lng: 124.9667, year: 2026, status: 'Lahan', note: '380 siswa' },
        { id: 's12', name: 'SNT Sorong Raya', kabKota: 'Kota Sorong', provinsi: 'Papua Barat Daya', lat: -0.8762, lng: 131.2558, year: 2026, status: 'Konstruksi', note: '280 siswa' },
      ],
    },
  },
  {
    id: 'pipeline_snt',
    type: 'milestone_pipeline',
    title: '02 KESIAPAN TAHAPAN PEMBANGUNAN',
    subtitle: 'Pemenuhan milestone per lokasi • 2026',
    width: 'half',
    order: 3,
    enabled: true,
    data: {
      title: 'Pemenuhan Milestone per Lokasi',
      stages: [
        { id: 'stg1', name: 'Lahan siap', count: 31, total: 42, percent: 74, status: 'completed' },
        { id: 'stg2', name: 'Perencanaan', count: 34, total: 42, percent: 81, status: 'completed' },
        { id: 'stg3', name: 'Pembangunan', count: 20, total: 42, percent: 48, status: 'in_progress' },
        { id: 'stg4', name: 'Operasional', count: 8, total: 42, percent: 19, status: 'in_progress' },
      ],
    },
  },
  {
    id: 'progres_snt',
    type: 'progress_metrics',
    title: '03 PROGRES PEMBANGUNAN',
    subtitle: 'Perbandingan progres fisik dan keuangan',
    width: 'third',
    order: 4,
    enabled: true,
    data: {
      title: 'Progres Pembangunan',
      items: [
        { id: 'snt_p1', label: 'Fisik', val2025: 52, val2026: 68, deltaLabel: '+16 pp', unit: '%' },
        { id: 'snt_p2', label: 'Keuangan', val2025: 50, val2026: 64, deltaLabel: '+14 pp', unit: '%' },
      ],
    },
  },
  {
    id: 'kapasitas_snt',
    type: 'category_bars',
    title: '04 KAPASITAS DAN PEMANFAATAN',
    subtitle: 'Kapasitas siswa dibanding siswa aktif',
    width: 'third',
    order: 5,
    enabled: true,
    data: {
      chartTitle: 'Pemanfaatan Kapasitas',
      unit: 'siswa',
      categories: [
        { id: 'sc1', name: 'Siswa aktif', val2025: 9800, val2026: 12600, val2025Label: '9.800', val2026Label: '12.600' },
        { id: 'sc2', name: 'Kapasitas asrama', val2025: 6000, val2026: 8400, val2025Label: '6.000', val2026Label: '8.400' },
      ],
    },
  },
  {
    id: 'sdm_snt',
    type: 'category_bars',
    title: '05 OPERASIONAL DAN SDM',
    subtitle: 'Kebutuhan dan ketersediaan guru',
    width: 'third',
    order: 6,
    enabled: true,
    data: {
      chartTitle: 'Ketersediaan Guru',
      categories: [
        { id: 'sg1', name: 'Ketersediaan Guru', val2025: 850, val2026: 1050, val2025Label: '850', val2026Label: '1.050' },
        { id: 'sg2', name: 'Kebutuhan Guru', val2025: 1250, val2026: 1250, val2025Label: '1.250', val2026Label: '1.250' },
      ],
    },
  },
  {
    id: 'watchlist_snt',
    type: 'watchlist',
    title: '06 LOKASI DAN ISU YANG MEMERLUKAN PERHATIAN',
    subtitle: 'Penyaringan deviasi progres dan isu di lapangan',
    width: 'half',
    order: 7,
    enabled: true,
    data: {
      title: 'Lokasi dan Isu Kritis',
      actionDirection: 'Koordinasi Pemda • Percepatan Pekerjaan',
      items: [
        {
          id: 'sw1',
          title: 'LOKASI SNT A',
          location: 'Sumatera Utara',
          findings: 'Legalitas lahan hibah belum tuntas dari pemerintah daerah',
          action: 'Koordinasi pemda & percepatan sertifikasi lahan ATR/BPN',
          statusSeverity: 'danger',
        },
        {
          id: 'sw2',
          title: 'LOKASI SNT B',
          location: 'Kalimantan Timur',
          findings: 'Jadwal konstruksi fisik tertinggal 12 pp dari master plan',
          action: 'Percepatan shift kerja kontraktor pelaksana di lapangan',
          statusSeverity: 'warning',
        },
      ],
    },
  },
  {
    id: 'insight_snt',
    type: 'insight_callout',
    title: 'INSIGHT UTAMA',
    width: 'half',
    order: 8,
    enabled: true,
    data: {
      title: 'INSIGHT UTAMA',
      insights: [
        'Progres fisik meningkat 16 poin persentase dibanding 2025.',
        'Kapasitas siswa terpakai sekitar 60% dari total daya tampung.',
        'Ketersediaan guru masih memiliki kesenjangan 200 orang.',
      ],
    },
  },
];

/**
 * Generic map markers builder per pillar
 */
function getMapMarkersForPillar(pillarId: string, indicatorTitle: string): MapPointMarker[] {
  if (pillarId === 'kesehatan') {
    return [
      { id: 'm1', name: 'RSUD Cut Nyak Dhien', kabKota: 'Aceh Barat', provinsi: 'Aceh', lat: 4.1442, lng: 96.1264, year: 2025, status: 'Faskes Rujukan', note: `Layanan ${indicatorTitle}` },
      { id: 'm2', name: 'Puskesmas Teladan Medan', kabKota: 'Kota Medan', provinsi: 'Sumatera Utara', lat: 3.5952, lng: 98.6722, year: 2026, status: 'Aktif Berjalan', note: `Intervensi ${indicatorTitle}` },
      { id: 'm3', name: 'Sentra Gizi & Posyandu Padang', kabKota: 'Kota Padang', provinsi: 'Sumatera Barat', lat: -0.9471, lng: 100.4172, year: 2025, status: 'Beroperasi', note: '85 sasaran terlayani' },
      { id: 'm4', name: 'Puskesmas Dempo Palembang', kabKota: 'Kota Palembang', provinsi: 'Sumatera Selatan', lat: -2.9761, lng: 104.7754, year: 2026, status: 'Aktif 2026', note: '190 sasaran terdaftar' },
      { id: 'm5', name: 'RSUD Pasar Minggu', kabKota: 'Jakarta Selatan', provinsi: 'DKI Jakarta', lat: -6.2847, lng: 106.8436, year: 2025, status: 'Faskes Inti', note: '310 sasaran' },
      { id: 'm6', name: 'Puskesmas Sukajadi Bandung', kabKota: 'Kota Bandung', provinsi: 'Jawa Barat', lat: -6.8875, lng: 107.5951, year: 2026, status: 'Penambahan Sarpras', note: '280 sasaran' },
      { id: 'm7', name: 'RSUD Tugurejo Semarang', kabKota: 'Kota Semarang', provinsi: 'Jawa Tengah', lat: -6.9867, lng: 110.3567, year: 2025, status: 'Rujukan Tipe B/C', note: '175 sasaran' },
      { id: 'm8', name: 'RSUD Dr. Soewandhie Surabaya', kabKota: 'Kota Surabaya', provinsi: 'Jawa Timur', lat: -7.2475, lng: 112.7621, year: 2026, status: 'Pelayanan Penuh', note: '320 sasaran' },
      { id: 'm9', name: 'Sentra Gizi Denpasar', kabKota: 'Kota Denpasar', provinsi: 'Bali', lat: -8.6705, lng: 115.2126, year: 2025, status: 'Operasional', note: '110 sasaran' },
      { id: 'm10', name: 'Puskesmas Pasir Panjang Kupang', kabKota: 'Kota Kupang', provinsi: 'NTT', lat: -10.1672, lng: 123.5970, year: 2026, status: 'Prioritas Percepatan', note: 'Wilayah sasaran utama' },
      { id: 'm11', name: 'Puskesmas Kampung Bali Pontianak', kabKota: 'Kota Pontianak', provinsi: 'Kalimantan Barat', lat: -0.0263, lng: 109.3425, year: 2026, status: 'Aktif Berjalan', note: '145 sasaran' },
      { id: 'm12', name: 'RSUD Abdul Wahab Sjahranie Samarinda', kabKota: 'Kota Samarinda', provinsi: 'Kalimantan Timur', lat: -0.4948, lng: 117.1436, year: 2026, status: 'Rujukan Utama Kaltim', note: '205 sasaran' },
      { id: 'm13', name: 'Sentra Layanan Tamalate Makassar', kabKota: 'Kota Makassar', provinsi: 'Sulawesi Selatan', lat: -5.1677, lng: 119.4127, year: 2025, status: 'Beroperasi', note: '260 sasaran' },
      { id: 'm14', name: 'RSUD Dr. Haulussy Ambon', kabKota: 'Kota Ambon', provinsi: 'Maluku', lat: -3.7047, lng: 128.1706, year: 2025, status: 'Rujukan Kepulauan', note: '80 sasaran' },
      { id: 'm15', name: 'Puskesmas Abepura Jayapura', kabKota: 'Kota Jayapura', provinsi: 'Papua', lat: -2.5937, lng: 140.6681, year: 2026, status: 'Penguatan Layanan', note: '130 sasaran' },
    ];
  }

  if (pillarId === 'bencana') {
    return [
      { id: 'm1', name: 'Posko Siaga Bencana Aceh Besar', kabKota: 'Kab. Aceh Besar', provinsi: 'Aceh', lat: 5.3883, lng: 95.4238, year: 2025, status: 'Siaga Penuh', note: `Monitoring ${indicatorTitle}` },
      { id: 'm2', name: 'Shelter Huntara Lembah Anai', kabKota: 'Kab. Tanah Datar', provinsi: 'Sumatera Barat', lat: -0.4671, lng: 100.3572, year: 2025, status: 'Huntara Selesai', note: 'Hunian sementara korban banjir lahar dingin' },
      { id: 'm3', name: 'Posko Siaga Karhutla Riau', kabKota: 'Kab. Kampar', provinsi: 'Riau', lat: 0.3371, lng: 101.2178, year: 2026, status: 'Satgas Siaga', note: 'Patroli terpadu Manggala Agni' },
      { id: 'm4', name: 'Posko Penanggulangan Karhutla Sumsel', kabKota: 'Kab. Ogan Ilir', provinsi: 'Sumatera Selatan', lat: -3.3761, lng: 104.6754, year: 2026, status: 'Siaga Darurat', note: 'Pemadaman darat dan udara' },
      { id: 'm5', name: 'Huntap Relokasi Pasca Gempa Cianjur', kabKota: 'Kab. Cianjur', provinsi: 'Jawa Barat', lat: -6.8275, lng: 107.1391, year: 2025, status: 'Hunian Tetap Huni', note: 'Konstruksi RISHA tahan gempa' },
      { id: 'm6', name: 'Posko Banjir & Rob Demak', kabKota: 'Kab. Demak', provinsi: 'Jawa Tengah', lat: -6.8967, lng: 110.6367, year: 2026, status: 'Penanganan Tanggul', note: 'Penguatan tanggul sungai' },
      { id: 'm7', name: 'Pos Pantau & Huntara Semeru', kabKota: 'Kab. Lumajang', provinsi: 'Jawa Timur', lat: -8.1375, lng: 113.2221, year: 2025, status: 'Pemanfaatan Huntara', note: 'Pemantauan aktivitas vulkanik' },
      { id: 'm8', name: 'Posko Tanggap Erupsi Lewotobi', kabKota: 'Kab. Flores Timur', provinsi: 'NTT', lat: -8.5372, lng: 122.7770, year: 2026, status: 'Penanganan Pengungsi', note: 'Dapur umum dan logistik kesehatan' },
      { id: 'm9', name: 'Posko Siaga Karhutla Kubu Raya', kabKota: 'Kab. Kubu Raya', provinsi: 'Kalimantan Barat', lat: -0.1263, lng: 109.4425, year: 2026, status: 'Pemadaman Gambut', note: 'Water bombing & sekat kanal' },
      { id: 'm10', name: 'Satgas Terpadu Karhutla Palangkaraya', kabKota: 'Kota Palangkaraya', provinsi: 'Kalimantan Tengah', lat: -2.2161, lng: 113.9167, year: 2026, status: 'Siaga 1', note: 'Pembasahan lahan gambut rawan' },
      { id: 'm11', name: 'Pusat Logistik Regional Bencana Makassar', kabKota: 'Kota Makassar', provinsi: 'Sulawesi Selatan', lat: -5.1477, lng: 119.4327, year: 2025, status: 'Sentra Logistik BNPB', note: 'Buffer stock logistik kawasan timur' },
      { id: 'm12', name: 'Huntap Pasca Bencana Palu-Sigi', kabKota: 'Kab. Sigi', provinsi: 'Sulawesi Tengah', lat: -0.9917, lng: 119.9207, year: 2025, status: 'Pemanfaatan Huntap', note: 'Pemulihan penghidupan warga' },
      { id: 'm13', name: 'Posko Siaga Bencana Sentani', kabKota: 'Kab. Jayapura', provinsi: 'Papua', lat: -2.5737, lng: 140.5181, year: 2026, status: 'Siaga Banjir Bandang', note: 'Rehabilitasi DAS cycloop' },
    ];
  }

  if (pillarId === 'kemiskinan') {
    return [
      { id: 'm1', name: 'Sentra Layanan Sosial Darussa’adah', kabKota: 'Kota Banda Aceh', provinsi: 'Aceh', lat: 5.5483, lng: 95.3238, year: 2025, status: 'Penyaluran Aktif', note: `Layanan ${indicatorTitle}` },
      { id: 'm2', name: 'Lokus Prioritas P3KE Deli Serdang', kabKota: 'Kab. Deli Serdang', provinsi: 'Sumatera Utara', lat: 3.5552, lng: 98.7222, year: 2026, status: 'Graduasi KPM', note: 'Intervensi pemberdayaan ekonomi' },
      { id: 'm3', name: 'Sentra Permakanan & Bansos Padang', kabKota: 'Kota Padang', provinsi: 'Sumatera Barat', lat: -0.9471, lng: 100.4172, year: 2025, status: 'Tersalurkan 100%', note: 'Penyaluran berkala Desil 1–2' },
      { id: 'm4', name: 'Sentra Budi Perkasa Palembang', kabKota: 'Kota Palembang', provinsi: 'Sumatera Selatan', lat: -2.9761, lng: 104.7754, year: 2026, status: 'Penyaluran 2026', note: 'Rehabilitasi sosial & permakanan' },
      { id: 'm5', name: 'Lokus Perlinsos Terpadu Cilincing', kabKota: 'Jakarta Utara', provinsi: 'DKI Jakarta', lat: -6.1275, lng: 106.9427, year: 2025, status: 'Terverifikasi DTSEN', note: 'Pemberian jaminan sosial' },
      { id: 'm6', name: 'Sentra Bantuan Sosial Cirebon', kabKota: 'Kab. Cirebon', provinsi: 'Jawa Barat', lat: -6.7575, lng: 108.5551, year: 2026, status: 'Penyaluran Tahap II', note: 'Bantuan tepat sasaran' },
      { id: 'm7', name: 'Kantong Kemiskinan Ekstrem Kebumen', kabKota: 'Kab. Kebumen', provinsi: 'Jawa Tengah', lat: -7.6667, lng: 109.6567, year: 2025, status: 'Intervensi Konvergensi', note: 'Penanganan kemiskinan ekstrem terpadu' },
      { id: 'm8', name: 'Lokus Graduasi KPM Bojonegoro', kabKota: 'Kab. Bojonegoro', provinsi: 'Jawa Timur', lat: -7.1575, lng: 111.8821, year: 2026, status: 'Pemberdayaan KPM', note: 'Modal usaha mandiri' },
      { id: 'm9', name: 'Sentra P3KE Lombok Timur', kabKota: 'Kab. Lombok Timur', provinsi: 'NTB', lat: -8.6269, lng: 116.5366, year: 2025, status: 'Penyaluran Reguler', note: 'Bantuan pangan & modal usaha' },
      { id: 'm10', name: 'Lokus Kemiskinan Ekstrem TTS', kabKota: 'Kab. Timor Tengah Selatan', provinsi: 'NTT', lat: -9.8572, lng: 124.2770, year: 2026, status: 'Prioritas Nasional', note: 'Akselerasi sanitasi & bansos pangan' },
      { id: 'm11', name: 'Sentra Disabilitas Singkawang', kabKota: 'Kota Singkawang', provinsi: 'Kalimantan Barat', lat: 0.9063, lng: 108.9925, year: 2026, status: 'Penyaluran Aktif', note: 'Bantuan permakanan & alat bantu' },
      { id: 'm12', name: 'Lokus Pesisir Barito Kuala', kabKota: 'Kab. Barito Kuala', provinsi: 'Kalimantan Selatan', lat: -3.0167, lng: 114.6133, year: 2025, status: 'Terjangkau Bantuan', note: 'Kelompok masyarakat rentan' },
      { id: 'm13', name: 'Lokus Pemberdayaan Pesisir Bone', kabKota: 'Kab. Bone', provinsi: 'Sulawesi Selatan', lat: -4.5477, lng: 120.3327, year: 2025, status: 'Intervensi Bansos', note: 'Penerima manfaat program' },
      { id: 'm14', name: 'Sentra Insyaf Ambon', kabKota: 'Kota Ambon', provinsi: 'Maluku', lat: -3.6547, lng: 128.1906, year: 2025, status: 'Aktif Berjalan', note: 'Perlindungan lansia & disabilitas' },
      { id: 'm15', name: 'Lokus Afirmasi Yahukimo', kabKota: 'Kab. Yahukimo', provinsi: 'Papua Pegunungan', lat: -4.4337, lng: 139.5181, year: 2026, status: 'Jangkauan Khusus 3T', note: 'Distribusi bansos langsung' },
    ];
  }

  // Default Pendidikan
  return [
    { id: 'm1', name: 'SDN 01 Banda Aceh', kabKota: 'Kota Banda Aceh', provinsi: 'Aceh', lat: 5.5483, lng: 95.3238, year: 2025, status: 'Selesai 2025', note: `Sasaran ${indicatorTitle}` },
    { id: 'm2', name: 'SMPN 03 Medan Baru', kabKota: 'Kota Medan', provinsi: 'Sumatera Utara', lat: 3.5952, lng: 98.6722, year: 2026, status: 'Rehab 2026', note: '240 siswa sasaran' },
    { id: 'm3', name: 'SDN 05 Padang Barat', kabKota: 'Kota Padang', provinsi: 'Sumatera Barat', lat: -0.9471, lng: 100.4172, year: 2025, status: 'Selesai 2025', note: '85 siswa' },
    { id: 'm4', name: 'SMPN 01 Palembang', kabKota: 'Kota Palembang', provinsi: 'Sumatera Selatan', lat: -2.9761, lng: 104.7754, year: 2026, status: 'Rehab 2026', note: '190 siswa' },
    { id: 'm5', name: 'SDN Menteng 01 Jakarta', kabKota: 'Jakarta Pusat', provinsi: 'DKI Jakarta', lat: -6.1975, lng: 106.8327, year: 2025, status: 'Selesai 2025', note: '310 siswa' },
    { id: 'm6', name: 'SMPN 02 Bandung Wetan', kabKota: 'Kota Bandung', provinsi: 'Jawa Barat', lat: -6.9175, lng: 107.6191, year: 2026, status: 'Rehab 2026', note: '280 siswa' },
    { id: 'm7', name: 'SDN Candisari 01', kabKota: 'Kota Semarang', provinsi: 'Jawa Tengah', lat: -6.9667, lng: 110.4167, year: 2025, status: 'Selesai 2025', note: '175 siswa' },
    { id: 'm8', name: 'SMPN 05 Surabaya Pusat', kabKota: 'Kota Surabaya', provinsi: 'Jawa Timur', lat: -7.2575, lng: 112.7521, year: 2026, status: 'Rehab 2026', note: '320 siswa' },
    { id: 'm9', name: 'SDN 02 Denpasar Timur', kabKota: 'Kota Denpasar', provinsi: 'Bali', lat: -8.6705, lng: 115.2126, year: 2025, status: 'Selesai 2025', note: '110 siswa' },
    { id: 'm10', name: 'SMPN 01 Pontianak Kota', kabKota: 'Kota Pontianak', provinsi: 'Kalimantan Barat', lat: -0.0263, lng: 109.3425, year: 2026, status: 'Rehab 2026', note: '145 siswa' },
    { id: 'm11', name: 'SDN 001 Balikpapan Kota', kabKota: 'Kota Balikpapan', provinsi: 'Kalimantan Timur', lat: -1.2379, lng: 116.8529, year: 2026, status: 'Rehab 2026', note: '205 siswa' },
    { id: 'm12', name: 'SMPN 06 Makassar Barat', kabKota: 'Kota Makassar', provinsi: 'Sulawesi Selatan', lat: -5.1477, lng: 119.4327, year: 2025, status: 'Selesai 2025', note: '260 siswa' },
    { id: 'm13', name: 'SDN 01 Manado Malalayang', kabKota: 'Kota Manado', provinsi: 'Sulawesi Utara', lat: 1.4748, lng: 124.8421, year: 2026, status: 'Rehab 2026', note: '95 siswa' },
    { id: 'm14', name: 'SMPN 02 Teluk Ambon', kabKota: 'Kota Ambon', provinsi: 'Maluku', lat: -3.6547, lng: 128.1906, year: 2025, status: 'Selesai 2025', note: '80 siswa' },
    { id: 'm15', name: 'SD Inpres Jayapura Utara', kabKota: 'Kota Jayapura', provinsi: 'Papua', lat: -2.5337, lng: 140.7181, year: 2026, status: 'Rehab 2026', note: '130 siswa' },
  ];
}

/**
 * Builds the modern modular detail blocks for any indicator across all pillars.
 */
export function generateDynamicBlocksForIndicator(
  indicatorId: string,
  cardData?: Partial<CmsCardItem> | null
): DetailBlockConfig[] {
  const card =
    cardData ||
    INITIAL_CMS_CARDS.find((c) => c.id === indicatorId || c.slug === indicatorId) ||
    INITIAL_CMS_CARDS.find(
      (c) =>
        c.id.toLowerCase() === indicatorId.toLowerCase() ||
        c.slug?.toLowerCase() === indicatorId.toLowerCase() ||
        indicatorId.toLowerCase().includes(c.id.toLowerCase()) ||
        c.id.toLowerCase().includes(indicatorId.toLowerCase())
    );

  const cardObj = card as Record<string, unknown> | undefined;
  const title = card?.title || indicatorId;
  const pillarId = (card?.pillarId || 'pendidikan') as 'pendidikan' | 'kesehatan' | 'bencana' | 'kemiskinan';
  const rawValue = cardObj?.value ?? cardObj?.currentValue ?? '—';
  const value = rawValue !== undefined && rawValue !== null ? String(rawValue) : '—';
  const unit = card?.unit || 'Unit';
  const rawTarget = cardObj?.target ?? cardObj?.target2026 ?? 'Target 2026: 100%';
  const target = String(rawTarget);
  const status = card?.status || 'Realisasi 2026';
  const percent = card?.percent;
  const pic =
    card?.picKementerian ||
    (pillarId === 'pendidikan'
      ? 'Kemendikdasmen, Kemenag'
      : pillarId === 'kesehatan'
      ? 'Kementerian Kesehatan, BKKBN'
      : pillarId === 'bencana'
      ? 'BNPB, Kemensos'
      : 'Kementerian Sosial, Bappenas');

  const isMilestone = Boolean(
    card?.isMilestone ||
      value === '—' ||
      !/\d/.test(value) ||
      indicatorId.startsWith('isu_') ||
      indicatorId === 'studio_guru'
  );

  // 1. KPI Cards
  const kpiBlock: DetailBlockConfig = {
    id: `kpi_${indicatorId}`,
    type: 'kpi_cards',
    title: `Indikator Utama: ${title}`,
    subtitle: `${status} • Koordinasi ${pic.split(',')[0]}`,
    width: 'full',
    order: 1,
    enabled: true,
    data: {
      mode: 'comparator',
      items: [
        {
          id: 'k1',
          label: 'Realisasi Berjalan',
          val2025: '—',
          val2026: value,
          unit: unit,
          subtext: `Satuan: ${unit}`,
        },
        {
          id: 'k2',
          label: 'Target Kinerja',
          val2025: '—',
          val2026: target.replace(/^Target\s*\d*:\s*/i, '') || target,
          unit: unit,
          subtext: 'Target Pelaksanaan 2026',
        },
        {
          id: 'k3',
          label: 'Tingkat Capaian',
          val2025: '—',
          val2026: percent !== null && percent !== undefined ? `${percent}%` : 'Tercapai',
          unit: '%',
          subtext: 'Tahap Berjalan',
        },
        {
          id: 'k4',
          label: 'Instansi Pelaksana',
          val2025: '—',
          val2026: pic.split(',')[0].trim(),
          unit: 'K/L',
          subtext: pic.split(',').slice(1).join(', ').trim() || 'Kemenko PMK',
        },
      ],
    },
  };

  // 2. Spatial Map
  const mapTitle =
    pillarId === 'pendidikan'
      ? 'PERSEBARAN LOKASI PROGRAM PENDIDIKAN'
      : pillarId === 'kesehatan'
      ? 'SEBARAN FASILITAS & INTERVENSI KESEHATAN'
      : pillarId === 'bencana'
      ? 'PETA SEBARAN RISIKO & LOKASI TANGGAP BENCANA'
      : 'SEBARAN LOKASI PENYALURAN & KANTONG KEMISKINAN';

  const mapSubtitle =
    pillarId === 'pendidikan'
      ? 'Sebaran lokasi satuan pendidikan dan kampus penerima program di Indonesia'
      : pillarId === 'kesehatan'
      ? 'Sebaran faskes, rumah sakit, dan lokus prioritas penanganan kesehatan'
      : pillarId === 'bencana'
      ? 'Titik kejadian, shelter huntara/huntap, dan posko siaga bencana BNPB'
      : 'Peta sebaran lokus intervensi perlindungan sosial dan graduasi ekonomi KPM';

  const mapBlock: DetailBlockConfig = {
    id: `map_${indicatorId}`,
    type: 'spatial_map',
    title: mapTitle,
    subtitle: mapSubtitle,
    width: 'half',
    order: 2,
    enabled: true,
    data: {
      mapMode: 'points',
      centerLat: -2.5,
      centerLng: 118.0,
      zoom: 5,
      legendTitle: `Sebaran ${title}`,
      markers: getMapMarkersForPillar(pillarId, title),
    },
  };

  // 3. Category Breakdown or Milestone Pipeline
  let block3: DetailBlockConfig;
  if (isMilestone) {
    block3 = {
      id: `pipeline_${indicatorId}`,
      type: 'milestone_pipeline',
      title: 'TAHAPAN KESIAPAN & PELAKSANAAN PROGRAM',
      subtitle: 'Pemenuhan milestone pelaksanaan • Posisi 2026',
      width: 'half',
      order: 3,
      enabled: true,
      data: {
        title: 'Tahapan Kesiapan',
        stages: [
          { id: 's1', name: 'Penyiapan Regulasi & Pedoman Teknis', count: 42, total: 42, status: 'completed' },
          { id: 's2', name: 'Koordinasi Wilayah & Validasi Sasaran', count: 36, total: 42, status: 'in_progress' },
          { id: 's3', name: 'Pelaksanaan & Penyaluran Intervensi', count: 28, total: 42, status: 'in_progress' },
          { id: 's4', name: 'Monitoring, Evaluasi & Pemanfaatan', count: 18, total: 42, status: 'in_progress' },
        ],
      },
    };
  } else {
    let catTitle = 'KOMPARASI DATA SASARAN';
    let catDesc = 'Perbandingan sebaran sasaran menurut kelompok intervensi';
    let categories = [
      { id: 'c1', name: 'Wilayah Barat (Sumatera & Jawa)', val2025: 4800, val2026: 6200, val2025Label: '4.800', val2026Label: '6.200' },
      { id: 'c2', name: 'Wilayah Tengah (Kalimantan & Bali-Nusra)', val2025: 3100, val2026: 4100, val2025Label: '3.100', val2026Label: '4.100' },
      { id: 'c3', name: 'Wilayah Timur (Sulawesi, Maluku, Papua)', val2025: 2200, val2026: 3100, val2025Label: '2.200', val2026Label: '3.100' },
    ];

    if (pillarId === 'pendidikan') {
      catTitle = 'KOMPARASI CAPAIAN MENURUT TINGKAT PENDIDIKAN';
      catDesc = 'Distribusi penerima program per jenjang pendidikan (2025 vs 2026)';
      categories = [
        { id: 'c1', name: 'Jenjang PAUD & Pendidikan Dasar', val2025: 12500, val2026: 15400, val2025Label: '12.500', val2026Label: '15.400' },
        { id: 'c2', name: 'Jenjang Pendidikan Menengah Pertama', val2025: 8400, val2026: 10800, val2025Label: '8.400', val2026Label: '10.800' },
        { id: 'c3', name: 'Jenjang Menengah Atas & Kejuruan', val2025: 6100, val2026: 8200, val2025Label: '6.100', val2026Label: '8.200' },
      ];
    } else if (pillarId === 'kesehatan') {
      catTitle = 'SEBARAN CAKUPAN MENURUT FASILITAS PELAYANAN';
      catDesc = 'Distribusi layanan kesehatan berdasarkan zonasi fasilitas';
      categories = [
        { id: 'c1', name: 'Fasilitas Kawasan Perkotaan', val2025: 9800, val2026: 12400, val2025Label: '9.800', val2026Label: '12.400' },
        { id: 'c2', name: 'Fasilitas Kawasan Perdesaan', val2025: 7500, val2026: 9800, val2025Label: '7.500', val2026Label: '9.800' },
        { id: 'c3', name: 'Fasilitas Daerah Terpencil / 3T', val2025: 3900, val2026: 5600, val2025Label: '3.900', val2026Label: '5.600' },
      ];
    } else if (pillarId === 'bencana') {
      catTitle = 'SEBARAN INTERVENSI MENURUT ZONA RISIKO';
      catDesc = 'Rincian titik pantau dan logistik penanganan bencana';
      categories = [
        { id: 'c1', name: 'Zona Risiko Tinggi (Pesisir & Sesar)', val2025: 850, val2026: 1120, val2025Label: '850', val2026Label: '1.120' },
        { id: 'c2', name: 'Zona Rawan Karhutla & Hidrometeorologi', val2025: 620, val2026: 890, val2025Label: '620', val2026Label: '890' },
        { id: 'c3', name: 'Zona Rehabilitasi Pasca Bencana', val2025: 410, val2026: 640, val2025Label: '410', val2026Label: '640' },
      ];
    } else if (pillarId === 'kemiskinan') {
      catTitle = 'CAKUPAN PENERIMA MANFAAT MENURUT DESIL';
      catDesc = 'Perlindungan sosial berdasarkan basis data P3KE / DTSEN';
      categories = [
        { id: 'c1', name: 'Desil 1 (Sangat Miskin)', val2025: 14200, val2026: 17800, val2025Label: '14.200', val2026Label: '17.800' },
        { id: 'c2', name: 'Desil 2 (Miskin)', val2025: 11500, val2026: 13900, val2025Label: '11.500', val2026Label: '13.900' },
        { id: 'c3', name: 'Desil 3–4 (Rentan Miskin)', val2025: 8100, val2026: 10400, val2025Label: '8.100', val2026Label: '10.400' },
      ];
    }

    block3 = {
      id: `cats_${indicatorId}`,
      type: 'category_bars',
      title: catTitle,
      subtitle: catDesc,
      width: 'half',
      order: 3,
      enabled: true,
      data: {
        chartTitle: catTitle,
        description: catDesc,
        unit: unit,
        categories,
      },
    };
  }

  // 4. Progress Metrics Block
  const progressBlock: DetailBlockConfig = {
    id: `progress_${indicatorId}`,
    type: 'progress_metrics',
    title: 'PROGRES FISIK DAN KEUANGAN',
    subtitle: 'Rata-rata progres pekerjaan pada periode pengamatan',
    width: 'third',
    order: 4,
    enabled: true,
    data: {
      title: 'Realisasi Kinerja',
      items: [
        {
          id: 'pm1',
          label: 'Fisik / Pelaksanaan',
          val2025: 68,
          val2026: 84,
          deltaLabel: '+16 pp',
          unit: '%',
        },
        {
          id: 'pm2',
          label: 'Keuangan / Anggaran',
          val2025: 64,
          val2026: 80,
          deltaLabel: '+16 pp',
          unit: '%',
        },
      ],
    },
  };

  // 5. Watchlist Block
  const kendalaList = cardObj?.kendalaList;
  let watchlistItems = [
    {
      id: 'w1',
      title: 'ISU LAPANGAN 1',
      location: 'Pemerintah Daerah & Wilayah Sasaran',
      findings: 'Koordinasi pemadanan data dan verifikasi teknis pelaksanaan di tingkat kabupaten/kota',
      action: 'Akselerasi koordinasi lintas OPD dan pendampingan lapangan',
      statusSeverity: 'warning' as const,
    },
    {
      id: 'w2',
      title: 'ISU LAPANGAN 2',
      location: 'K/L Pengampu & Pelaksana Teknis',
      findings: 'Ketepatan jadwal realisasi anggaran dan pemenuhan target administratif',
      action: 'Monitoring mingguan dan pengawalan orkestrasi Kemenko PMK',
      statusSeverity: 'danger' as const,
    },
  ];

  if (Array.isArray(kendalaList) && kendalaList.length > 0) {
    watchlistItems = kendalaList.map((item, idx: number) => {
      const k = item as Record<string, unknown>;
      return {
        id: `w_${idx}`,
        title: (k.title as string) || `KENDALA #${idx + 1}`,
        location: (k.klTerkait as string) || 'K/L Terkait & Daerah',
        findings: (k.kendala as string) || 'Kendala operasional di lapangan',
        action: (k.tindakLanjut as string) || 'Percepatan koordinasi penyelesaian',
        statusSeverity: idx === 0 ? ('warning' as const) : ('danger' as const),
      };
    });
  }

  const watchlistBlock: DetailBlockConfig = {
    id: `watchlist_${indicatorId}`,
    type: 'watchlist',
    title: 'LOKASI & ISU YANG MEMERLUKAN PERHATIAN',
    subtitle: 'Penyaringan deviasi progres dan kendala lapangan',
    width: 'third',
    order: 5,
    enabled: true,
    data: {
      title: 'Isu Strategis Pelaksanaan',
      items: watchlistItems,
    },
  };

  // 6. Insight Block
  const insightBlock: DetailBlockConfig = {
    id: `insight_${indicatorId}`,
    type: 'insight_callout',
    title: 'INSIGHT UTAMA',
    width: 'third',
    order: 6,
    enabled: true,
    data: {
      title: 'INSIGHT UTAMA',
      insights: [
        `Realisasi ${title} tahun 2026 menunjukkan percepatan dengan pencapaian ${percent ? `${percent}%` : 'sesuai target tahun berjalan'}.`,
        `Koordinasi pengawalan bersama ${pic} difokuskan pada sinkronisasi data sasaran dan penanganan hambatan administratif.`,
        'Kemenko PMK memastikan orkestrasi pemantauan berjalan berkesinambungan agar manfaat program dirasakan langsung oleh masyarakat.',
      ],
    },
  };

  return [kpiBlock, mapBlock, block3, progressBlock, watchlistBlock, insightBlock];
}

/**
 * Helper to get default blocks for an indicator if configured, or dynamically generate them.
 */
export function getDefaultDetailBlocks(
  indicatorId: string,
  customMeta?: Partial<CmsCardItem> | null
): DetailBlockConfig[] {
  if (indicatorId === 'revitalisasi_satdik') {
    return REVITALISASI_SATDIK_BLOCKS;
  }
  if (indicatorId === 'snt_operasional') {
    return SNT_OPERASIONAL_BLOCKS;
  }

  return generateDynamicBlocksForIndicator(indicatorId, customMeta);
}
