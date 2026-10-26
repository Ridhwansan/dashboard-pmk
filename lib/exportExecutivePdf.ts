import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PILLAR_AGREGAT_DATA } from '@/data/pillarAgregatData';
import { getKendalaListByPillar, PillarKendalaItem } from '@/data/programDetailData';
import { DASHBOARD_META } from '@/data/dashboardData';
import { MapPillarId } from '@/data/mapIndicators';

interface PillarConfig {
  id: Exclude<MapPillarId, 'all'>;
  title: string;
  badge: string;
  color: [number, number, number]; // RGB
  colorHex: string;
  description: string;
}

const PILLARS_CONFIG: PillarConfig[] = [
  {
    id: 'pendidikan',
    title: 'PKPN Pendidikan & Pelatihan Vokasi',
    badge: 'Pilar 1',
    color: [29, 78, 216], // Blue-700
    colorHex: '#1D4ED8',
    description: 'Peningkatan akses, kualitas infrastruktur sekolah, digitalisasi pembelajaran, dan penguatan kompetensi tenaga pendidik.',
  },
  {
    id: 'kesehatan',
    title: 'PKPN Kesehatan & Kesejahteraan',
    badge: 'Pilar 2',
    color: [4, 120, 87], // Emerald-700
    colorHex: '#047857',
    description: 'Akselerasi deteksi dini melalui Cek Kesehatan Gratis, eliminasi Tuberkulosis, revitalisasi faskes rujukan, dan penurunan stunting.',
  },
  {
    id: 'bencana',
    title: 'PKPN Kesiapsiagaan & Penanggulangan Bencana',
    badge: 'Pilar 3',
    color: [180, 83, 9], // Amber-700 / Warm Earth
    colorHex: '#B45309',
    description: 'Akselerasi rehabilitasi-rekonstruksi pascabencana, pemenuhan hunian tetap, mitigasi karhutla, dan penguatan sistem peringatan dini.',
  },
  {
    id: 'kemiskinan',
    title: 'PKPN Penurunan Kemiskinan & Perlindungan Sosial',
    badge: 'Pilar 4',
    color: [185, 28, 28], // Red-700
    colorHex: '#B91C1C',
    description: 'Penuntasan kemiskinan ekstrem, ketepatan sasaran bansos terintegrasi DTSEN, perlindungan lansia/disabilitas, dan graduasi mandiri.',
  },
];

/**
 * Loads an image from URL into an HTMLImageElement safely
 */
function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/**
 * Generates an executive summary PDF of all 4 pillars covering
 * high-level indicators, kendala, and strategic follow-ups.
 */
export async function generateExecutiveSummaryPdf(options?: {
  specificPillar?: Exclude<MapPillarId, 'all'>;
}): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // ~210 mm
  const pageHeight = doc.internal.pageSize.getHeight(); // ~297 mm
  const marginX = 14;
  const contentWidth = pageWidth - marginX * 2; // ~182 mm

  // Pre-load official logo if available
  const logoImg = await loadImage('/images/logo-kemenko-pmk-official.png');

  // Pillars to render
  const pillarsToRender = options?.specificPillar
    ? PILLARS_CONFIG.filter((p) => p.id === options.specificPillar)
    : PILLARS_CONFIG;

  const isFullReport = !options?.specificPillar;

  // ==========================================
  // PAGE 1: COVER & EXECUTIVE OVERVIEW
  // ==========================================
  if (isFullReport) {
    drawExecutiveCoverPage(doc, logoImg, pageWidth, pageHeight, marginX, contentWidth);
    doc.addPage();
  }

  // ==========================================
  // PER-PILLAR PAGES (GAMBARAN BESAR PER PILAR)
  // ==========================================
  pillarsToRender.forEach((pillarConfig, index) => {
    if (index > 0) {
      doc.addPage();
    }
    drawPillarSummaryPage(doc, pillarConfig, pageWidth, pageHeight, marginX, contentWidth);
  });

  // ==========================================
  // ADD NUMBERING AND RUNNING FOOTER TO ALL PAGES
  // ==========================================
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Skip running header on Page 1 if full report
    if (!isFullReport || i > 1) {
      // Running Header Line
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.setLineWidth(0.3);
      doc.line(marginX, 12, pageWidth - marginX, 12);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text(
        'KEMENKO PMK  |  RINGKASAN EKSEKUTIF CAPAIAN, KENDALA & TINDAK LANJUT PKPN 2026',
        marginX,
        9.5
      );
      doc.text(`Cut-off: ${DASHBOARD_META.cutoffDate}`, pageWidth - marginX, 9.5, {
        align: 'right',
      });
    }

    // Running Footer Line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(marginX, pageHeight - 12, pageWidth - marginX, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(
      'Dokumen Resmi Terbatas — Pusat Pemantauan Program Prioritas Nasional (Kemenko PMK)',
      marginX,
      pageHeight - 7.5
    );

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105); // slate-600
    doc.text(`Halaman ${i} dari ${totalPages}`, pageWidth - marginX, pageHeight - 7.5, {
      align: 'right',
    });
  }

  // Save the PDF
  const filename = options?.specificPillar
    ? `Ringkasan_Eksekutif_PKPN_${options.specificPillar.toUpperCase()}_2026.pdf`
    : `Ringkasan_Eksekutif_PKPN_PMK_2026.pdf`;

  doc.save(filename);
}

/**
 * Draws the high-level Executive Cover / Overview Page
 */
function drawExecutiveCoverPage(
  doc: jsPDF,
  logoImg: HTMLImageElement | null,
  pageWidth: number,
  pageHeight: number,
  marginX: number,
  contentWidth: number
) {
  let currentY = 16;

  // 1. Top Decorative Brand Bar
  doc.setFillColor(15, 23, 42); // slate-900 (deep navy)
  doc.rect(0, 0, pageWidth, 5, 'F');
  doc.setFillColor(217, 119, 6); // gold amber
  doc.rect(0, 5, pageWidth, 1.5, 'F');

  // 2. Official Header with Logo
  if (logoImg) {
    try {
      doc.addImage(logoImg, 'PNG', marginX, currentY, 18, 18);
    } catch {
      // Fallback if addImage fails
      drawLogoBadgeFallback(doc, marginX, currentY);
    }
  } else {
    drawLogoBadgeFallback(doc, marginX, currentY);
  }

  const textStartX = marginX + 22;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text('KEMENTERIAN KOORDINATOR BIDANG', textStartX, currentY + 4);
  doc.text('PEMBANGUNAN MANUSIA DAN KEBUDAYAAN', textStartX, currentY + 8.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text('REPUBLIK INDONESIA', textStartX, currentY + 13);

  currentY += 24;

  // Divider line
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(0.6);
  doc.line(marginX, currentY, marginX + contentWidth, currentY);

  currentY += 10;

  // 3. Document Title Block
  doc.setFillColor(248, 250, 252); // slate-50
  doc.roundedRect(marginX, currentY, contentWidth, 32, 3, 3, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(marginX, currentY, contentWidth, 32, 3, 3, 'S');

  // Left accent ribbon on title box
  doc.setFillColor(15, 23, 42);
  doc.rect(marginX, currentY, 3, 32, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('RINGKASAN EKSEKUTIF LINTAS PILAR', marginX + 8, currentY + 9);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(29, 78, 216); // blue-700
  doc.text('Capaian Kinerja, Isu Kendala Strategis & Rekomendasi Tindak Lanjut PKPN 2026', marginX + 8, currentY + 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Pusat Pemantauan Kebijakan Program Prioritas Nasional  ·  Tanggal Pemutakhiran Data: ${DASHBOARD_META.cutoffDate}`,
    marginX + 8,
    currentY + 24
  );

  currentY += 40;

  // 4. Executive Introduction Note
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('A. PENGANTAR EKSEKUTIF KOORDINASI PMK', marginX, currentY);

  currentY += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const introText =
    'Laporan Ringkasan Eksekutif ini menyajikan sintesis tingkat tinggi atas capaian indikator kinerja utama, identifikasi isu kendala kritis di tingkat lapangan dan regulasi, serta rumusan rekomendasi tindak lanjut strategis lintas kementerian/lembaga di bawah koordinasi Kementerian Koordinator Bidang Pembangunan Manusia dan Kebudayaan. Pemantauan difokuskan pada 4 pilar prioritas pembangunan nasional demi memastikan akselerasi pencapaian target tahun 2026 tepat sasaran, akuntabel, dan berdaya guna bagi masyarakat.';
  const splitIntro = doc.splitTextToSize(introText, contentWidth);
  doc.text(splitIntro, marginX, currentY);

  currentY += splitIntro.length * 4.2 + 8;

  // 5. High-Level KPI Summary Grid (4 Pillars Cards)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('B. GAMBARAN UMUM CAPAIAN 4 PILAR PRIORITAS', marginX, currentY);

  currentY += 6;

  const cardWidth = (contentWidth - 6) / 2; // 2 columns
  const cardHeight = 36;

  PILLARS_CONFIG.forEach((pillar, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cardX = marginX + col * (cardWidth + 6);
    const cardY = currentY + row * (cardHeight + 6);

    // Card background
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(cardX, cardY, cardWidth, cardHeight, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.roundedRect(cardX, cardY, cardWidth, cardHeight, 2, 2, 'S');

    // Colored top border accent
    doc.setFillColor(pillar.color[0], pillar.color[1], pillar.color[2]);
    doc.rect(cardX + 2, cardY, cardWidth - 4, 1.8, 'F');

    // Pillar Badge & Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(pillar.color[0], pillar.color[1], pillar.color[2]);
    doc.text(pillar.badge.toUpperCase(), cardX + 4, cardY + 6.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(pillar.title.replace('PKPN ', ''), cardX + 4, cardY + 11.5);

    // Count of indicators and kendala
    const pData = PILLAR_AGREGAT_DATA[pillar.id];
    const indCount = pData?.indicators?.length || 0;
    const kendalaList = getKendalaListByPillar(pillar.id);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(
      `Cakupan: ${indCount} Indikator Kunci  |  ${kendalaList.length} Isu Kendala`,
      cardX + 4,
      cardY + 16.5
    );

    // Description text (wrap inside card)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    const splitDesc = doc.splitTextToSize(pillar.description, cardWidth - 8);
    doc.text(splitDesc, cardX + 4, cardY + 21.5);
  });

  currentY += 2 * (cardHeight + 6) + 6;

  // 6. Executive Callout Box at Bottom of Cover Page
  doc.setFillColor(254, 243, 199); // amber-100
  doc.roundedRect(marginX, currentY, contentWidth, 22, 2.5, 2.5, 'F');
  doc.setDrawColor(245, 158, 11); // amber-500
  doc.setLineWidth(0.5);
  doc.roundedRect(marginX, currentY, contentWidth, 22, 2.5, 2.5, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(146, 64, 14); // amber-900
  doc.text('PETUNJUK MEMBACA DOKUMEN RINGKASAN EKSEKUTIF:', marginX + 5, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(120, 53, 15); // amber-950
  const guideText =
    'Setiap lembar halaman berikutnya memuat rincian gambaran besar per pilar, mencakup: (1) Matriks tabel indikator utama dengan target, realisasi, dan persentase capaian tahun 2026; serta (2) Matriks isu kendala kritis beserta rekomendasi tindak lanjut penanganan lintas K/L.';
  const splitGuide = doc.splitTextToSize(guideText, contentWidth - 10);
  doc.text(splitGuide, marginX + 5, currentY + 11.5);
}

/**
 * Draws a dedicated page for a single pillar with:
 * 1. Pillar Header & Description
 * 2. High-level indicators table (Target 2026, Realisasi 2026, % Capaian, Status)
 * 3. Structured Obstacles (Kendala) & Strategic Follow-ups (Tindak Lanjut)
 */
function drawPillarSummaryPage(
  doc: jsPDF,
  pillar: PillarConfig,
  pageWidth: number,
  pageHeight: number,
  marginX: number,
  contentWidth: number
) {
  let currentY = 18;

  // 1. Pillar Header Banner
  doc.setFillColor(pillar.color[0], pillar.color[1], pillar.color[2]);
  doc.roundedRect(marginX, currentY, contentWidth, 18, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(`${pillar.badge.toUpperCase()} · PRIORITAS NASIONAL`, marginX + 6, currentY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text(pillar.title, marginX + 6, currentY + 13);

  currentY += 23;

  // Description / Strategic Direction
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  const splitDesc = doc.splitTextToSize(`Fokus Strategis: ${pillar.description}`, contentWidth);
  doc.text(splitDesc, marginX, currentY);

  currentY += splitDesc.length * 3.8 + 4;

  // 2. Section Heading: Tabel Indikator Kunci
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('I. IKHTISAR TARGET & REALISASI INDIKATOR PRIORITAS (2026)', marginX, currentY);

  currentY += 4;

  // Prepare table data from PILLAR_AGREGAT_DATA
  const pData = PILLAR_AGREGAT_DATA[pillar.id];
  const indicators = pData?.indicators || [];

  const tableHead = [['No', 'Indikator Program Prioritas', 'Target 2026', 'Realisasi 2026', '% Capaian']];
  const tableBody = indicators.map((ind, idx) => {
    const yr2026 = ind.years?.[2026];
    const targetStr = yr2026?.target ? `${yr2026.target} ${ind.unit || ''}`.trim() : '—';
    const capaianStr = yr2026?.capaian ? `${yr2026.capaian} ${ind.unit || ''}`.trim() : '—';
    const percentStr = yr2026?.percent || '—';

    return [
      String(idx + 1),
      ind.name,
      targetStr,
      capaianStr,
      percentStr,
    ];
  });

  // Render indicators table with autoTable
  autoTable(doc, {
    startY: currentY,
    margin: { left: marginX, right: marginX },
    head: tableHead,
    body: tableBody,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42], // Deep Navy slate-900
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'center',
      cellPadding: 2,
    },
    bodyStyles: {
      fontSize: 7.2,
      textColor: [30, 41, 59],
      cellPadding: 1.8,
      lineColor: [226, 232, 240],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 84 },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 35, halign: 'right' },
      4: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      // Highlight % Capaian column with appropriate color
      if (data.section === 'body' && data.column.index === 4) {
        const val = String(data.cell.raw || '');
        if (val.includes('100') || parseFloat(val) >= 90) {
          data.cell.styles.textColor = [4, 120, 87]; // green
        } else if (parseFloat(val) < 50 && val !== '—') {
          data.cell.styles.textColor = [185, 28, 28]; // red
        } else {
          data.cell.styles.textColor = [29, 78, 216]; // blue
        }
      }
    },
  });

  // Get final Y position after table
  const finalTableY = (doc as any).lastAutoTable?.finalY || currentY + 40;
  currentY = finalTableY + 8;

  // 3. Section Heading: Isu Kendala & Tindak Lanjut
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('II. RANGKUMAN ISU KENDALA STRATEGIS & REKOMENDASI TINDAK LANJUT', marginX, currentY);

  currentY += 4;

  // Fetch kendala items for this pillar
  const kendalaList = getKendalaListByPillar(pillar.id);

  if (kendalaList.length === 0) {
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(marginX, currentY, contentWidth, 14, 2, 2, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Tidak ada isu kendala kritis yang terdata pada pilar ini.', marginX + 4, currentY + 8);
    return;
  }

  // Build Kendala & Tindak Lanjut Table (Simple, clean, without K/L column)
  const kendalaHead = [['No', 'Indikator & Isu Kendala Pelaksanaan', 'Rekomendasi Tindak Lanjut Strategis']];
  const kendalaBody = kendalaList.map((item: PillarKendalaItem, idx: number) => {
    const obstacleCell = `${item.title}\n(${item.programTitle})\n\n${item.kendala}`;
    const actionCell = item.tindakLanjut;

    return [String(idx + 1), obstacleCell, actionCell];
  });

  autoTable(doc, {
    startY: currentY,
    margin: { left: marginX, right: marginX },
    head: kendalaHead,
    body: kendalaBody,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59], // slate-800
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'center',
      cellPadding: 2,
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [30, 41, 59],
      cellPadding: 2.2,
      lineColor: [226, 232, 240],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 87 },
      2: { cellWidth: 87 },
    },
  });
}

/**
 * Fallback badge when logo image cannot be rendered
 */
function drawLogoBadgeFallback(doc: jsPDF, x: number, y: number) {
  doc.setFillColor(15, 23, 42);
  doc.circle(x + 9, y + 9, 8.5, 'F');
  doc.setFillColor(217, 119, 6);
  doc.circle(x + 9, y + 9, 7.5, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(255, 255, 255);
  doc.text('PMK', x + 9, y + 10, { align: 'center' });
}
