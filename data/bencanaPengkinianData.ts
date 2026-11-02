export interface BencanaPengkinianItem {
  no: number;
  provinsiLokasi: string;
  dampak: string;
  status: string;
  isEmergencyStatus?: boolean;
  kondisiMutakhir: string;
  detailLaphar: string;
}

export interface BencanaRingkasanUtama {
  kejadianBaru: number;
  pengkinianData: number;
  totalKejadianSignifikan: number;
  provinsiTerdampak: number;
  rekapBencana: {
    karhutla: number;
    kekeringan: number;
    banjir: number;
    lainnya: string;
  };
  narasiDominasi: string;
}

export const BENCANA_RINGKASAN_UTAMA: BencanaRingkasanUtama = {
  kejadianBaru: 4,
  pengkinianData: 16,
  totalKejadianSignifikan: 20,
  provinsiTerdampak: 13,
  rekapBencana: {
    karhutla: 7,
    kekeringan: 6,
    banjir: 4,
    lainnya: '1 BANJIR, ANGIN PUTING BELIUNG, TPA',
  },
  narasiDominasi:
    'Kejadian didominasi oleh Kebakaran Hutan dan Lahan (Karhutla) dengan 7 kejadian, diikuti oleh 6 kejadian Kekeringan, 4 kejadian Banjir, serta masing-masing 1 kejadian Gempa Bumi, Kebakaran TPA, dan Angin Puting Beliung.',
};

export const PENGKINIAN_BENCANA_DATA: BencanaPengkinianItem[] = [
  {
    no: 1,
    provinsiLokasi: 'Kota Subulussalam, Prov. Aceh',
    dampak: 'Banjir: ± 469 KK terdampak, ± 177 unit rumah terdampak',
    status: '-',
    isEmergencyStatus: false,
    kondisiMutakhir:
      'Sebagian gampong air sudah surut, dan sebagian lagi air masih menggenangi pemukiman warga',
    detailLaphar: 'Detail: Entry nomor 5 laphar 27/10/2026',
  },
  {
    no: 2,
    provinsiLokasi: 'Kab. Bangka Selatan, Prov. Kep. Bangka Belitung',
    dampak: 'Karhutla: ± 470 KK / 1.528 jiwa terdampak, ± 92 KK / 307 jiwa mengungsi',
    status: '-',
    isEmergencyStatus: false,
    kondisiMutakhir: '85 unit tenda huntara ditempati oleh pengungsi sejumlah 92 KK',
    detailLaphar: 'Detail: Entry nomor 6 laphar 27/10/2026',
  },
  {
    no: 3,
    provinsiLokasi: 'Riau, Prov. Riau',
    dampak:
      'Karhutla: Estimasi luas lahan terbakar ± 20.714,53 ha (BPBDPK Riau, 01 januari s.d 27 oktober 2026), Luas lahan terbakar (target yang akan dipadamkan) per 27 Okt 2026 ± 0,5 ha',
    status: 'Siaga Darurat TMT 13/02/2026 s.d 30/11/2026',
    isEmergencyStatus: true,
    kondisiMutakhir:
      'Target luas lahan yang dipadamkan per 27 Okt 2026 ± 0,5 ha; luas yang berhasil dipadamkan 0,5 ha; sisa luasan lahan yang masih dalam penanganan 0 ha.',
    detailLaphar: 'Detail: Entry nomor 19 laphar 27/10/2026',
  },
  {
    no: 4,
    provinsiLokasi: 'Jambi, Prov. Jambi',
    dampak:
      'Karhutla: Estimasi luas lahan terbakar seluas ± 5.167,84 ha (berdasarkan Sipongi Kemenhut + laporan BPBD s.d 27 oktober 2026), Luas lahan terbakar (target yang akan dipadamkan) per 27 Okt 2026 ± 73.5 ha',
    status: 'Siaga Darurat TMT 27/04/2026 s.d 30/11/2026',
    isEmergencyStatus: true,
    kondisiMutakhir:
      'Target luas lahan yang dipadamkan per 27 Okt 2026 ± 73.5 ha, luas yang berhasil dipadamkan ± 15,5 ha; sisa luas lahan yang masih dalam penanganan ± 58 ha.',
    detailLaphar: 'Detail: Entry nomor 18 laphar 27/10/2026',
  },
  {
    no: 5,
    provinsiLokasi: 'Kab. Kuningan, Prov. Jawa Barat',
    dampak: 'Lahan terbakar masih dalam pendataan',
    status: 'Siaga Darurat TMT 01/10/2026 s.d 31/10/2026',
    isEmergencyStatus: true,
    kondisiMutakhir:
      'Pantauan satgas darat, tidak ada temuan asap pada hari ini, 27 Okt 2026 dan hujan secara merata telah turun di Kawasan Gn. Ciremai.',
    detailLaphar: 'Detail: Entry nomor 16 laphar 27/10/2026',
  },
  {
    no: 6,
    provinsiLokasi: 'Kab. Sragen, Prov. Jawa Tengah',
    dampak: '± 5.500 KK / ± 18.495 jiwa terdampak',
    status: 'Siaga Darurat TMT 01/06/2026 s.d 31/12/2026',
    isEmergencyStatus: true,
    kondisiMutakhir:
      'BPBD melaksanakan pendistribusian air bersih sebanyak 12 Tangki / 56.000 Liter.',
    detailLaphar: 'Detail: Entry nomor 7 laphar 27/10/2026',
  },
  {
    no: 7,
    provinsiLokasi: 'Kab. Boyolali, Prov. Jawa Tengah',
    dampak: 'Kekeringan: ± 12.022 KK / 57.311 jiwa terdampak (pendataan)',
    status: 'Siaga Darurat TMT 21/07/2026 s.d 31/10/2026',
    isEmergencyStatus: true,
    kondisiMutakhir:
      'BPBD Kab. Boyolali telah mendistribusikan bantuan air bersih dengan volume sebanyak 22 tangki (122.000 liter) kepada warga.',
    detailLaphar: 'Detail: Entry nomor 12 laphar 27/10/2026',
  },
  {
    no: 8,
    provinsiLokasi: 'Kab. Klaten, Prov. Jawa Tengah',
    dampak: 'Kekeringan: ± 5.136 KK / 17.127 Jiwa terdampak (pendataan)',
    status: 'Siaga Darurat TMT 01/08/2026 s.d 31/10/2026',
    isEmergencyStatus: true,
    kondisiMutakhir:
      'BPBD Kab Klaten melaksanakan kegiatan pendistribusian air bersih sebanyak 18 Tangki / 90.000 Liter Penerima manfaat per-hari ini 935 KK / 3.136 Jiwa.',
    detailLaphar: 'Detail: Entry nomor 13 laphar 27/10/2026',
  },
  {
    no: 9,
    provinsiLokasi: 'Kab. Nganjuk, Prov. Jawa Timur',
    dampak: 'Kekeringan: ± 397 KK / 1.269 jiwa terdampak',
    status: 'Siaga Darurat TMT 07/10/2026 s.d 01/12/2026',
    isEmergencyStatus: true,
    kondisiMutakhir:
      'BPBD melakukan distribusi air bersih di Dusun Sendang Gogor Desa Ngepung sebanyak : 8.000 liter (289 KK 962 Jiwa).',
    detailLaphar: 'Detail: Entry nomor 9 laphar 27/10/2026',
  },
  {
    no: 10,
    provinsiLokasi: 'Kota Malang, Prov. Jawa Timur',
    dampak: 'Kebakaran TPA Supit: ± 15,5 ha lahan terbakar',
    status: 'Siaga Darurat TMT 07/10/2026 s.d 01/12/2026',
    isEmergencyStatus: true,
    kondisiMutakhir:
      'Tim Gabungan akan melanjutkan upaya pembasahan lokasi yang masih terdapat kepulan asap.',
    detailLaphar: 'Detail: Entry nomor 20 laphar 27/10/2026',
  },
  {
    no: 11,
    provinsiLokasi: 'Prov. Nusa Tenggara Timur',
    dampak:
      'Gempa Bumi: 156 (seratus lima puluh enam) jiwa MD, ± 17.707 KK terdampak, luka-luka: ± 1.620 jiwa (pendataan), ± 27.345 jiwa mengungsi',
    status: 'Transisi darurat ke pemulihan TMT 27/09/2026 s.d 27/12/2026',
    isEmergencyStatus: true,
    kondisiMutakhir:
      'Hasil sementara Progres Huntara per tanggal 27 Oktober 2026 di 7 Kabupaten terdampak yang sudah terbangun 100% sebanyak 240 unit.',
    detailLaphar: 'Detail: Entry nomor 14 laphar 27/10/2026',
  },
  {
    no: 12,
    provinsiLokasi: 'Kab. Banjar, Prov. Kalimantan Selatan',
    dampak: 'Angin Puting Beliung: ± 35 KK terdampak',
    status: '-',
    isEmergencyStatus: false,
    kondisiMutakhir:
      'Data nama warga, jumlah KK dan jiwa, tingkat kerusakan rumah, serta kondisi fasilitas pendidikan masih dalam proses pendataan dan verifikasi lebih lanjut.',
    detailLaphar: 'Detail: Entry nomor 4 laphar 27/10/2026',
  },
  {
    no: 13,
    provinsiLokasi: 'Kab. Bulukumba, Prov. Sulawesi Selatan',
    dampak: 'Kekeringan: 445 KK / 1.730 jiwa terdampak',
    status: '-',
    isEmergencyStatus: false,
    kondisiMutakhir:
      'BPBD menyalurkan bantuan air bersih 46.600 liter kepada 207 KK/830 jiwa di Ds. Benteng Palioi, Kec. Kindang.',
    detailLaphar: 'Detail: Entry nomor 2 laphar 27/10/2026',
  },
  {
    no: 14,
    provinsiLokasi: 'Kab. Toraja Utara, Prov. Sulawesi Selatan',
    dampak: 'Karhutla: ± 7 ha lahan terbakar',
    status: '-',
    isEmergencyStatus: false,
    kondisiMutakhir: 'Api berhasil dipadamkan.',
    detailLaphar: 'Detail: Entry nomor 10 laphar 27/10/2026',
  },
  {
    no: 15,
    provinsiLokasi: 'Kab. Bone, Prov. Sulawesi Selatan',
    dampak: 'Kekeringan: ± 805 KK / 3.723 jiwa terdampak',
    status: '-',
    isEmergencyStatus: false,
    kondisiMutakhir: 'BPBD Kab. Bone menyalurkan air sebanyak 85.100 liter.',
    detailLaphar: 'Detail: Entry nomor 21 laphar 27/10/2026',
  },
  {
    no: 16,
    provinsiLokasi: 'Kab. Seram Bagian Barat, Prov. Maluku',
    dampak: 'Kekeringan: ± 95 KK / 297 jiwa terdampak (pendataan)',
    status: '-',
    isEmergencyStatus: false,
    kondisiMutakhir:
      '± 95 KK / 297 jiwa terdampak (masih dalam pendataan) dengan rincian.',
    detailLaphar: 'Detail: Entry nomor 1 laphar 27/10/2026',
  },
];

