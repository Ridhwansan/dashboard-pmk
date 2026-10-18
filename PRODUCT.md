# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary Audience**: Menteri Koordinator Bidang Pembangunan Manusia dan Kebudayaan (Menko PMK) dan jajaran kepemimpinan Kemenko PMK.
- **Secondary Audience**: Asisten Deputi (Asdep) dan unit kerja lintas kementerian/lembaga terkait dalam orkestrasi program.
- **Situation & Job**: Melakukan pemantauan strategis berkala atas Program Kerja Prioritas Nasional (PKPN), mengevaluasi target vs capaian RPJMN 2025–2029, memantau isu kritis dan kendala orkestrasi lintas K/L, serta menelusuri data sasaran terpadu (DTSEN) pada kantong kemiskinan.

## Product Purpose

Dashboard Eksekutif Pengawalan Program Kerja Prioritas Nasional (PKPN) Kemenko PMK dirancang sebagai pusat kendali dan pemantauan terpadu capaian 4 pilar utama pembangunan manusia dan kebudayaan:
1. Pilar Pendidikan (Revitalisasi Sekolah, Digitalisasi, SNT, SUG, Studio Guru)
2. Pilar Kesehatan (CKG, Penuntasan TB, MBG 3B, RSUD, Puskesmas, Labkesmas)
3. Pilar Ketahanan Bencana (Kesiapsiagaan, Huntap/Huntara Sumatera, IPMas, Gerakan ASRI)
4. Pilar Penurunan Kemiskinan (Bansos, Lansia & Disabilitas, MBG Kantong Kemiskinan)

## Positioning

Dashboard keputusan super eksekutif tiga layer:
- **Layer 1 (Super Eksekutif)**: Ringkasan agregasi nasional dalam Bento Grid modern (VividFinance reference) dan Peta Wilayah Indonesia.
- **Layer 2 (Pemantauan PKPN & Isu Strategis)**: Rincian per-pilar mencakup progres wilayah, Tabel Utuh I Target & Capaian 2025–2029, dan Tabel Utuh II Kendala & Tindak Lanjut Orkestrasi verbatim.
- **Layer 3 (Master Data DTSEN)**: Data Terpadu Sasaran bagi Asisten Deputi untuk penelusuran desil 1–5 dan kantong kemiskinan.

## Operating Context

- Digunakan dalam rapat koordinasi menteri, rapat tingkat menteri (RTM), dan pengawasan harian pimpinan Kemenko PMK.
- Cutoff data: 14 Oktober 2026. Kolaborasi resmi bersama Badan Pusat Statistik (BPS).

## Capabilities and Constraints

- **Technical Foundation**: Next.js 16 (App Router), React 19, Tailwind CSS v4, TypeScript, Lucide Icons.
- **Strict Data Rule**: Seluruh data angka, persentase, target (T), capaian (C), tahun (2025–2029), catatan kaki (footnote), dan uraian kendala/tindak lanjut orkestrasi disajikan verbatim sesuai dokumen resmi.
- **Design System**: Typography foundation menggunakan font Plus Jakarta Sans dan gaya Executive Pure White Dashboard yang ringkas, bernapas (breathable), kontras tinggi, dan bebas dari elemen dekoratif redundan.

## Evidence on Hand

- Aset Logo Resmi: Logo Kemenko PMK (`public/images/logo-kemenko-pmk.png`) dan Logo BPS (`public/images/logo-bps.png`).
- Dataset Resmi PKPN: Rincian target dan capaian 2025–2029, catatan kaki, kendala orkestrasi, dan data sasaran DTSEN (`data/dashboardData.ts`).

## Product Principles

1. **Strict Data Fidelity**: Menampilkan data verbatim tanpa interpolasi atau modifikasi angka resmi.
2. **Executive Scanability**: Menyajikan ringkasan visual tingkat tinggi dengan indikator kritis yang segera dapat diidentifikasi.
3. **Structured Depth (3-Layer Hierarchy)**: Menghubungkan agregasi nasional (Layer 1) ke detail analitis pilar (Layer 2) dan data sasaran operasional (Layer 3).
4. **Action-Oriented Orchestration**: Menegaskan status kendala regulasi (RTM, Perpres, Inpres, ABT) guna percepatan tindak lanjut lintas kementerian/lembaga.
