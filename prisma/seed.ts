import { prisma } from '../lib/prisma';
import { INITIAL_CMS_CARDS } from '../data/initialCmsCards';
import { getProgramDetailData } from '../data/programDetailData';
import { PILLAR_AGREGAT_DATA } from '../data/pillarAgregatData';
import { MAP_INDICATORS, SUG_LOCATIONS } from '../data/mapIndicators';
import {
  BENCANA_RINGKASAN_UTAMA,
  PENGKINIAN_BENCANA_DATA,
} from '../data/bencanaPengkinianData';


const DEFAULT_USERS = [
  {
    id: 'usr_admin_01',
    username: 'admin',
    name: 'Administrator PMK',
    password: process.env.ADMIN_PASSWORD || 'admin123',
    role: 'ADMIN' as const,
    email: 'admin@kemenkopmk.go.id',
  },
  {
    id: 'usr_user_01',
    username: 'user',
    name: 'Pengguna Eksekutif',
    password: process.env.USER_PASSWORD || 'user123',
    role: 'USER' as const,
    email: 'eksekutif@kemenkopmk.go.id',
  },
];

export async function seedAllData() {
  console.log('=== Memulai Migrasi & Seeding Seluruh Data Hardcode ke PostgreSQL ===');

  // 1. Seed Users
  for (const user of DEFAULT_USERS) {
    await prisma.user.upsert({
      where: { username: user.username },
      update: {
        password: user.password,
        name: user.name,
        role: user.role,
        email: user.email,
      },
      create: user,
    });
  }
  console.log('✓ [1/6] Users seeded (Admin & Eksekutif)');

  // 2. Seed DashboardMeta
  await prisma.dashboardMeta.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      title: 'Program Kerja Prioritas Nasional (PKPN)',
      subtitle: 'Kementerian Koordinator Bidang Pembangunan Manusia dan Kebudayaan',
      cutoffDate: '18 Oktober 2026',
      ministerTitle: 'Menteri Koordinator Bidang Pembangunan Manusia dan Kebudayaan (Menko PMK)',
    },
  });
  console.log('✓ [2/6] Dashboard Metadata seeded');

  // 3. Seed PillarCards with Rich Program Details
  let cardCount = 0;
  for (const card of INITIAL_CMS_CARDS) {
    const detail = getProgramDetailData(card.slug || card.id, card.title, card.pillarId);

    await prisma.pillarCard.upsert({
      where: { slug: card.slug },
      update: {
        pillarId: card.pillarId,
        category: card.category,
        title: card.title,
        value: card.value,
        unit: card.unit || detail.unit || '',
        status: card.status,
        target: card.target,
        percent: card.percent,
        subtext: card.subtext || null,
        description: card.description || detail.description || null,
        picKementerian: card.picKementerian || detail.picKementerian || null,
        order: card.order,
        isActive: card.isActive,
        isMilestone: card.isMilestone || false,
        milestoneContent: card.milestoneContent || null,
        kendalaList: (detail.kendalaList as object) || null,
        monthlyData: (detail.monthlyData as object) || null,
        updateLogs: (detail.updateLogs as object) || null,
      },
      create: {
        id: card.id,
        slug: card.slug,
        pillarId: card.pillarId,
        category: card.category,
        title: card.title,
        value: card.value,
        unit: card.unit || detail.unit || '',
        status: card.status,
        target: card.target,
        percent: card.percent,
        subtext: card.subtext || null,
        description: card.description || detail.description || null,
        picKementerian: card.picKementerian || detail.picKementerian || null,
        order: card.order,
        isActive: card.isActive,
        isMilestone: card.isMilestone || false,
        milestoneContent: card.milestoneContent || null,
        kendalaList: (detail.kendalaList as object) || null,
        monthlyData: (detail.monthlyData as object) || null,
        updateLogs: (detail.updateLogs as object) || null,
      },
    });
    cardCount++;
  }
  console.log(`✓ [3/6] Pillar Cards (${cardCount} program & indikator detail) seeded`);

  // 4. Seed PillarAgregat (Data Tahunan 2025–2029)
  for (const pillarKey of Object.keys(PILLAR_AGREGAT_DATA)) {
    const p = PILLAR_AGREGAT_DATA[pillarKey as keyof typeof PILLAR_AGREGAT_DATA];
    await prisma.pillarAgregat.upsert({
      where: { id: p.pillarId },
      update: {
        pillarId: p.pillarId,
        name: p.pillarName,
        badge: p.badge,
        indicators: p.indicators as unknown as object,
      },
      create: {
        id: p.pillarId,
        pillarId: p.pillarId,
        name: p.pillarName,
        badge: p.badge,
        indicators: p.indicators as unknown as object,
      },
    });
  }
  console.log('✓ [4/6] Data Agregat Tahunan (4 Pilar 2025-2029) seeded');

  // 5. Seed Map Indicators & SUG Locations
  for (const ind of MAP_INDICATORS) {
    await prisma.mapIndicator.upsert({
      where: { id: ind.id },
      update: {
        pillarId: ind.pillarId,
        name: ind.name,
        shortName: ind.shortName,
        unit: ind.unit,
        nationalValue: ind.nationalValue,
        target2026: ind.target2026,
        description: ind.description,
        minVal: ind.minVal,
        maxVal: ind.maxVal,
        isLowerBetter: ind.isLowerBetter || false,
        colorScheme: ind.colorScheme,
        isNationalOnly: ind.isNationalOnly || false,
        customRegionType: ind.customRegionType || null,
      },
      create: {
        id: ind.id,
        pillarId: ind.pillarId,
        name: ind.name,
        shortName: ind.shortName,
        unit: ind.unit,
        nationalValue: ind.nationalValue,
        target2026: ind.target2026,
        description: ind.description,
        minVal: ind.minVal,
        maxVal: ind.maxVal,
        isLowerBetter: ind.isLowerBetter || false,
        colorScheme: ind.colorScheme,
        isNationalOnly: ind.isNationalOnly || false,
        customRegionType: ind.customRegionType || null,
      },
    });
  }

  // SUG Locations
  await prisma.sugLocation.deleteMany({});
  for (const loc of SUG_LOCATIONS) {
    await prisma.sugLocation.create({
      data: {
        provinceId: loc.provinceId,
        kodeBps: loc.kodeBps,
        provinceName: loc.provinceName,
        type: loc.type,
        count: loc.count,
        lat: loc.lat,
        lng: loc.lng,
      },
    });
  }
  console.log('✓ [5/6] Map Indicators & Sebaran Lokasi SUG seeded');

  // 6. Seed Bencana Reports
  await prisma.bencanaReport.upsert({
    where: { id: 'default' },
    update: {
      ringkasanUtama: BENCANA_RINGKASAN_UTAMA as unknown as object,
      pengkinianData: PENGKINIAN_BENCANA_DATA as unknown as object,
    },
    create: {
      id: 'default',
      ringkasanUtama: BENCANA_RINGKASAN_UTAMA as unknown as object,
      pengkinianData: PENGKINIAN_BENCANA_DATA as unknown as object,
    },
  });
  console.log('✓ [6/6] Laporan & Pengkinian Bencana Nasional seeded');

  console.log('=== SELURUH DATA BERHASIL DIMIGRASIKAN KE DATABASE POSTGRESQL ===');
}

seedAllData()
  .catch((e) => {
    console.error('Error saat seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
