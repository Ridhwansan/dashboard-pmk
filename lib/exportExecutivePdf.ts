import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PILLAR_AGREGAT_DATA } from '@/data/pillarAgregatData';
import { getKendalaListByPillar, PillarKendalaItem } from '@/data/programDetailData';
import { DASHBOARD_META } from '@/data/dashboardData';
import { MapPillarId } from '@/data/mapIndicators';
import { CmsCardItem } from '@/types/cms';
import { INITIAL_CMS_CARDS } from '@/data/initialCmsCards';

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
  cards?: CmsCardItem[];
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

  // Fetch or use live CMS cards to respect includeInPdf settings
  let allCards: CmsCardItem[] = options?.cards || [];
  if (allCards.length === 0 && typeof window !== 'undefined') {
    try {
      const res = await fetch(`/api/cards?all=true&_t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data) && json.data.length > 0) {
          allCards = json.data;
        }
      }
    } catch (err) {
      console.warn('Could not fetch cards from /api/cards, fallback to INITIAL_CMS_CARDS:', err);
    }
  }

  if (allCards.length === 0) {
    allCards = INITIAL_CMS_CARDS;
  }

  // Also apply any locally applied settings if available
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('pmk_pdf_settings');
      if (saved) {
        const map = JSON.parse(saved) as Record<string, boolean>;
        allCards = allCards.map((c) => ({
          ...c,
          includeInPdf: map[c.id] !== undefined ? map[c.id] : (c.slug && map[c.slug] !== undefined ? map[c.slug] : c.includeInPdf),
        }));
      }
    } catch (e) {
      console.warn('Could not read pmk_pdf_settings from localStorage:', e);
    }
  }

  // Pre-load official logo if available
  const logoImg = await loadImage('/images/logo-pmk-garuda.png');

  // Pillars to render
  const pillarsToRender = options?.specificPillar
    ? PILLARS_CONFIG.filter((p) => p.id === options.specificPillar)
    : PILLARS_CONFIG;

  const isFullReport = !options?.specificPillar;

  // ==========================================
  // PAGE 1: COVER & EXECUTIVE OVERVIEW
  // ==========================================
  if (isFullReport) {
    drawExecutiveCoverPage(doc, logoImg, pageWidth, pageHeight, marginX, contentWidth, allCards);
    doc.addPage();
  }

  // ==========================================
  // PER-PILLAR PAGES (GAMBARAN BESAR PER PILAR)
  // ==========================================
  pillarsToRender.forEach((pillarConfig, index) => {
    if (index > 0) {
      doc.addPage();
    }
    drawPillarSummaryPage(doc, pillarConfig, pageWidth, pageHeight, marginX, contentWidth, allCards);
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
  contentWidth: number,
  cards: CmsCardItem[]
) {
  let currentY = 16;

  // 1. Top Decorative Brand Bar
  doc.setFillColor(15, 23, 42); // slate-900 (deep navy)
  doc.rect(0, 0, pageWidth, 5, 'F');
  doc.setFillColor(217, 119, 6); // gold amber
  doc.rect(0, 5, pageWidth, 1.5, 'F');

  // 2. Official Header with Transparent Logo (Gambar 2, No Background)
  const logoSize = 20;
  if (logoImg) {
    try {
      doc.addImage(logoImg, 'PNG', marginX, currentY, logoSize, logoSize);
    } catch {
      drawLogoBadgeFallback(doc, marginX, currentY);
    }
  } else {
    drawLogoBadgeFallback(doc, marginX, currentY);
  }

  const textStartX = marginX + logoSize + 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('KEMENTERIAN KOORDINATOR BIDANG', textStartX, currentY + 5.5);
  doc.text('PEMBANGUNAN MANUSIA DAN KEBUDAYAAN', textStartX, currentY + 10.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text('REPUBLIK INDONESIA', textStartX, currentY + 16);

  currentY += logoSize + 6;

  // Divider line
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(0.6);
  doc.line(marginX, currentY, marginX + contentWidth, currentY);

  currentY += 14;

  // 3. Document Title Block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(217, 119, 6); // amber-600 gold
  doc.text('LAPORAN RINGKASAN EKSEKUTIF', marginX, currentY);

  currentY += 7;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('CAPAIAN KINERJA & TINDAK LANJUT STRATEGIS', marginX, currentY);

  currentY += 6.5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(29, 78, 216); // blue-700
  doc.text('PROGRAM PRIORITAS NASIONAL (PKPN) 4 PILAR', marginX, currentY);

  currentY += 12;

  // 4. Concise Executive Statement Box (Simple, focused on 4-pillar report per date)
  const briefingBoxHeight = 30;
  doc.setFillColor(248, 250, 252); // slate-50
  doc.roundedRect(marginX, currentY, contentWidth, briefingBoxHeight, 2.5, 2.5, 'F');
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.4);
  doc.roundedRect(marginX, currentY, contentWidth, briefingBoxHeight, 2.5, 2.5, 'S');

  // Left accent bar
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(marginX, currentY, 3, briefingBoxHeight, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('RINGKASAN EKSEKUTIF', marginX + 7, currentY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const statementText =
    `Dokumen ini menyajikan ringkasan eksekutif capaian indikator kinerja utama serta rekomendasi tindak lanjut strategis lintas kementerian/lembaga pada 4 Pilar Program Prioritas Nasional (PKPN) per ${DASHBOARD_META.cutoffDate} di bawah koordinasi Kementerian Koordinator Bidang Pembangunan Manusia dan Kebudayaan. Rincian tabel capaian indikator dan matriks kendala disajikan secara komprehensif pada lembar halaman berikutnya untuk setiap pilar.`;
  const splitStatement = doc.splitTextToSize(statementText, contentWidth - 14);
  doc.text(splitStatement, marginX + 7, currentY + 13.5);

  currentY += briefingBoxHeight + 12;

  // 5. Minimalist 4 Pillars Scope Strip (No bulky sections or long descriptions)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('CAKUPAN 4 PILAR PEMBANGUNAN PMK', marginX, currentY);

  currentY += 5;

  const cardWidth = (contentWidth - 6) / 2;
  const cardHeight = 22;

  PILLARS_CONFIG.forEach((pillar, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cardX = marginX + col * (cardWidth + 6);
    const cardY = currentY + row * (cardHeight + 6);

    // Minimal card container
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(cardX, cardY, cardWidth, cardHeight, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.roundedRect(cardX, cardY, cardWidth, cardHeight, 2, 2, 'S');

    // Colored accent left border
    doc.setFillColor(pillar.color[0], pillar.color[1], pillar.color[2]);
    doc.rect(cardX, cardY, 2.5, cardHeight, 'F');

    // Badge
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(pillar.color[0], pillar.color[1], pillar.color[2]);
    doc.text(pillar.badge.toUpperCase(), cardX + 6, cardY + 6.5);

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(pillar.title.replace('PKPN ', ''), cardX + 6, cardY + 11.5);

    // Stats based on included indicators
    const pData = PILLAR_AGREGAT_DATA[pillar.id];
    const pillarIncludedCards = cards.filter(
      (c) => c.pillarId === pillar.id && c.isActive !== false && c.includeInPdf !== false
    );
    const indCount = pillarIncludedCards.length;
    const allKendalaList = getKendalaListByPillar(pillar.id);
    const includedTitles = new Set(pillarIncludedCards.map((c) => c.title.toLowerCase().trim()));
    const includedSlugs = new Set(pillarIncludedCards.map((c) => (c.slug || c.id).toLowerCase().trim()));
    const kendalaCount = pillarIncludedCards.length > 0
      ? allKendalaList.filter(
          (k) =>
            includedTitles.has(k.programTitle.toLowerCase().trim()) ||
            includedSlugs.has((k.programId || '').toLowerCase().trim()) ||
            includedTitles.has(k.title.toLowerCase().trim())
        ).length
      : 0;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `${indCount} Indikator Kunci  ·  ${kendalaCount} Isu Kendala Strategis`,
      cardX + 6,
      cardY + 16.5
    );
  });

  currentY += 2 * (cardHeight + 6) + 10;

  // 6. Metadata Footer Card
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(marginX, currentY, contentWidth, 22, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.roundedRect(marginX, currentY, contentWidth, 22, 2, 2, 'S');

  const metaCols = [
    {
      label: 'TANGGAL DATA',
      val: `Per ${DASHBOARD_META.cutoffDate}`,
    },
    {
      label: 'UNIT KOORDINASI',
      val: 'Kemenko Bidang PMK',
    },
    {
      label: 'SIFAT DOKUMEN',
      val: 'Resmi Terbatas (Eksekutif)',
    },
    {
      label: 'SUMBER DATA',
      val: 'Pusat Pemantauan PKPN',
    },
  ];

  const colW = (contentWidth - 8) / 4;
  metaCols.forEach((m, idx) => {
    const cx = marginX + 4 + idx * colW;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(100, 116, 139);
    doc.text(m.label, cx, currentY + 7.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(m.val, cx, currentY + 14.5);
  });
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
  contentWidth: number,
  cards: CmsCardItem[]
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

  // Filter cards for this pillar where isActive !== false and includeInPdf !== false
  const pData = PILLAR_AGREGAT_DATA[pillar.id];
  const activeCards = cards.filter(
    (c) => c.pillarId === pillar.id && c.isActive !== false && c.includeInPdf !== false
  );

  const tableHead = [['No', 'Indikator Program Prioritas', 'Target 2026', 'Realisasi 2026', '% Capaian']];
  let tableBody: string[][] = [];

  if (activeCards.length > 0) {
    tableBody = activeCards.map((card, idx) => {
      const agregatInd = pData?.indicators?.find(
        (ind) => ind.id === card.id || ind.id === card.slug || ind.mapIndicatorId === card.slug
      );
      const yr2026 = agregatInd?.years?.[2026];

      let targetStr = '—';
      if (yr2026?.target) {
        targetStr = `${yr2026.target} ${agregatInd?.unit || card.unit || ''}`.trim();
      } else if (card.target) {
        targetStr = card.target.replace(/^Target(\s*2026)?:\s*/i, '').trim();
      }

      let capaianStr = '—';
      if (yr2026?.capaian) {
        capaianStr = `${yr2026.capaian} ${agregatInd?.unit || card.unit || ''}`.trim();
      } else if (card.value) {
        capaianStr = `${card.value} ${card.unit && !card.value.includes(card.unit) ? card.unit : ''}`.trim();
      }

      let percentStr = '—';
      if (yr2026?.percent) {
        percentStr = yr2026.percent;
      } else if (card.percent !== null && card.percent !== undefined) {
        percentStr = `${card.percent}%`;
      }

      return [
        String(idx + 1),
        card.title,
        targetStr,
        capaianStr,
        percentStr,
      ];
    });
  } else {
    tableBody = [
      ['—', 'Tidak ada indikator yang disertakan dalam ringkasan untuk pilar ini.', '—', '—', '—'],
    ];
  }

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
  const finalTableY = (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY || currentY + 40;
  currentY = finalTableY + 8;

  // 3. Section Heading: Isu Kendala & Tindak Lanjut
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('II. RANGKUMAN ISU KENDALA STRATEGIS & REKOMENDASI TINDAK LANJUT', marginX, currentY);

  currentY += 4;

  // Fetch kendala items for this pillar, filtering only included programs
  const allKendalaList = getKendalaListByPillar(pillar.id);
  const includedTitles = new Set(activeCards.map((c) => c.title.toLowerCase().trim()));
  const includedSlugs = new Set(activeCards.map((c) => (c.slug || c.id).toLowerCase().trim()));

  const kendalaList = activeCards.length > 0
    ? allKendalaList.filter(
        (k) =>
          includedTitles.has(k.programTitle.toLowerCase().trim()) ||
          includedSlugs.has((k.programId || '').toLowerCase().trim()) ||
          includedTitles.has(k.title.toLowerCase().trim())
      )
    : [];

  if (kendalaList.length === 0) {
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(marginX, currentY, contentWidth, 14, 2, 2, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(
      activeCards.length === 0
        ? 'Tidak ada indikator aktif yang disertakan untuk pilar ini.'
        : 'Tidak ada isu kendala kritis yang terdata untuk indikator terpilih.',
      marginX + 4,
      currentY + 8
    );
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
  doc.circle(x + 10, y + 10, 9.5, 'F');
  doc.setFillColor(217, 119, 6);
  doc.circle(x + 10, y + 10, 8.5, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text('PMK', x + 10, y + 11.5, { align: 'center' });
}
