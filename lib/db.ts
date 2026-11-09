import fs from 'fs';
import path from 'path';
import { prisma } from './prisma';
import { calculatePercentage } from './calcPercent';
import { INITIAL_CMS_CARDS, CmsCardItem } from '../data/initialCmsCards';
import { getProgramDetailData } from '../data/programDetailData';
import { DEFAULT_USERS } from './auth';
import { DASHBOARD_META } from '../data/dashboardData';
import { SUG_LOCATIONS, SugLocation } from '../data/mapIndicators';
import {
  BENCANA_RINGKASAN_UTAMA,
  PENGKINIAN_BENCANA_DATA,
} from '../data/bencanaPengkinianData';

const DATA_DIR = path.join(process.cwd(), 'data');
const JSON_FILE_PATH = path.join(DATA_DIR, 'cmsCardsData.json');

// Memory cache for fallback mode
let memoryCards: CmsCardItem[] | null = null;
let isPrismaAvailable: boolean | null = null;

/**
 * Check if Prisma PostgreSQL is reachable
 */
export async function testPrismaConnection(): Promise<boolean> {
  if (isPrismaAvailable !== null) return isPrismaAvailable;
  try {
    await prisma.$queryRaw`SELECT 1`;
    isPrismaAvailable = true;
    return true;
  } catch {
    isPrismaAvailable = false;
    return false;
  }
}

/**
 * Initialize fallback JSON file if it doesn't exist
 */
export function ensureJsonFile(): CmsCardItem[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const createEnriched = () =>
      INITIAL_CMS_CARDS.map((card) => {
        const detail = getProgramDetailData(card.slug || card.id, card.title, card.pillarId);
        return {
          ...card,
          description: card.description || detail.description,
          picKementerian: card.picKementerian || detail.picKementerian,
          kendalaList: card.kendalaList || detail.kendalaList,
          monthlyData: card.monthlyData || detail.monthlyData,
          updateLogs: card.updateLogs || detail.updateLogs,
        };
      });

    if (!fs.existsSync(JSON_FILE_PATH)) {
      const enriched = createEnriched();
      fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(enriched, null, 2), 'utf-8');
      memoryCards = enriched;
      return memoryCards;
    }
    if (!memoryCards || memoryCards.length === 0) {
      try {
        const raw = fs.readFileSync(JSON_FILE_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          memoryCards = parsed;
        }
      } catch {
        memoryCards = null;
      }
    }
    if (!memoryCards || memoryCards.length === 0) {
      const enriched = createEnriched();
      fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(enriched, null, 2), 'utf-8');
      memoryCards = enriched;
    }
    return memoryCards;
  } catch (error) {
    console.error('Error reading fallback JSON file, using in-memory store:', error);
    if (!memoryCards || memoryCards.length === 0) {
      memoryCards = INITIAL_CMS_CARDS.map((card) => {
        const detail = getProgramDetailData(card.slug || card.id, card.title, card.pillarId);
        return {
          ...card,
          description: card.description || detail.description,
          picKementerian: card.picKementerian || detail.picKementerian,
        };
      });
    }
    return memoryCards;
  }
}

/**
 * Persist cards to fallback JSON file
 */
function saveJsonFile(cards: CmsCardItem[]): void {
  try {
    memoryCards = cards;
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(cards, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing fallback JSON file:', error);
  }
}

export interface GetCardsFilter {
  pillarId?: 'pendidikan' | 'kesehatan' | 'bencana' | 'kemiskinan' | string;
  category?: 'PKPN' | 'Isu Strategis' | string;
  onlyActive?: boolean;
}

/**
 * Safely format arbitrary JSON object or null for Prisma
 */
function toJsonInput(val: unknown): object | null {
  if (val === null || val === undefined) return null;
  if (typeof val === 'object') return val as object;
  return null;
}

type PillarCardCreatePayload = {
  slug: string;
  pillarId: string;
  title: string;
  [key: string]: unknown;
};

/**
 * Safely map Prisma PillarCard record (or raw record) to CmsCardItem
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toCmsCardItem(r: any): CmsCardItem {
  return {
    id: r.id,
    slug: r.slug,
    pillarId: r.pillarId as CmsCardItem['pillarId'],
    category: r.category as CmsCardItem['category'],
    title: r.title,
    value: r.value,
    unit: r.unit || '',
    status: r.status,
    target: r.target,
    percent: r.percent,
    subtext: r.subtext || undefined,
    description: r.description || undefined,
    picKementerian: r.picKementerian || undefined,
    order: r.order,
    isActive: r.isActive,
    isMilestone: r.isMilestone,
    milestoneContent: r.milestoneContent || undefined,
    annualTargets: r.annualTargets || undefined,
    monthlyData: r.monthlyData || undefined,
    kendalaList: r.kendalaList || undefined,
    updateLogs: r.updateLogs || undefined,
  };
}

/**
 * Get cards filtered by pillar, category, and active status from PostgreSQL or fallback
 */
export async function getCards(filter?: GetCardsFilter): Promise<CmsCardItem[]> {
  const useDb = await testPrismaConnection();

  if (useDb) {
    try {
      const where: Record<string, unknown> = {};
      if (filter?.pillarId) where.pillarId = filter.pillarId;
      if (filter?.category) where.category = filter.category;
      if (filter?.onlyActive !== false) where.isActive = true;

      const rows = await prisma.pillarCard.findMany({
        where,
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      });

      // If database is empty, seed it with INITIAL_CMS_CARDS
      const totalCount = await prisma.pillarCard.count();
      if (totalCount === 0) {
        await seedPrismaDatabase();
        return getCards(filter);
      }

      return rows.map(toCmsCardItem);
    } catch (err) {
      console.warn('Prisma getCards query failed, switching to JSON fallback:', err);
      isPrismaAvailable = false;
    }
  }

  // Fallback to JSON / In-memory store
  const allCards = ensureJsonFile();
  return allCards
    .filter((c) => {
      if (filter?.pillarId && c.pillarId !== filter.pillarId) return false;
      if (filter?.category && c.category !== filter.category) return false;
      if (filter?.onlyActive !== false && !c.isActive) return false;
      return true;
    })
    .sort((a, b) => a.order - b.order);
}

/**
 * Get single card by id
 */
export async function getCardById(id: string): Promise<CmsCardItem | null> {
  const useDb = await testPrismaConnection();
  if (useDb) {
    try {
      const r = await prisma.pillarCard.findFirst({
        where: {
          OR: [{ id }, { slug: id }],
        },
      });
      if (!r) return null;
      return toCmsCardItem(r);
    } catch {
      isPrismaAvailable = false;
    }
  }

  const all = ensureJsonFile();
  return all.find((c) => c.id === id || c.slug === id) || null;
}

/**
 * Update card and automatically calculate percentage if target & value change
 */
export async function updateCard(
  id: string,
  patch: Partial<CmsCardItem>
): Promise<CmsCardItem | null> {
  const existing = await getCardById(id);
  if (!existing) return null;

  // Auto-calculate percentage if value or target are updated, or respect explicit patch.percent
  const nextValue = patch.value !== undefined ? patch.value : existing.value;
  const nextTarget = patch.target !== undefined ? patch.target : existing.target;
  let nextPercent = existing.percent;

  if (patch.percent !== undefined) {
    nextPercent = patch.percent;
  } else if (patch.value !== undefined || patch.target !== undefined) {
    nextPercent = calculatePercentage(nextValue, nextTarget);
  }

  const updated: CmsCardItem = {
    ...existing,
    ...patch,
    value: nextValue,
    target: nextTarget,
    percent: nextPercent,
  };

  const useDb = await testPrismaConnection();
  if (useDb) {
    try {
      const updatePayload: Record<string, unknown> = {
        title: updated.title,
        value: updated.value,
        unit: updated.unit || '',
        status: updated.status,
        target: updated.target,
        percent: updated.percent,
        subtext: updated.subtext || null,
        description: updated.description || null,
        picKementerian: updated.picKementerian || null,
        order: updated.order,
        isActive: updated.isActive,
        isMilestone: updated.isMilestone || false,
        milestoneContent: updated.milestoneContent || null,
        annualTargets: toJsonInput(updated.annualTargets),
        monthlyData: toJsonInput(updated.monthlyData),
        kendalaList: toJsonInput(updated.kendalaList),
        updateLogs: toJsonInput(updated.updateLogs),
      };

      const r = await prisma.pillarCard.update({
        where: { id: existing.id },
        data: updatePayload,
      });

      return toCmsCardItem(r);
    } catch {
      isPrismaAvailable = false;
    }
  }

  // Update in JSON
  const all = ensureJsonFile();
  const index = all.findIndex((c) => c.id === existing.id || c.slug === id);
  if (index !== -1) {
    all[index] = updated;
    saveJsonFile(all);
    return updated;
  }
  return null;
}

/**
 * Toggle card isActive (visibility on Ikhtisar)
 */
export async function toggleCardActive(id: string): Promise<CmsCardItem | null> {
  const existing = await getCardById(id);
  if (!existing) return null;
  return updateCard(id, { isActive: !existing.isActive });
}

/**
 * Create a new Pillar Card
 */
export async function createCard(
  card: Omit<CmsCardItem, 'id'> & { id?: string }
): Promise<CmsCardItem> {
  const id = card.id || `card_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const slug = card.slug || id;
  const percent =
    card.percent !== undefined
      ? card.percent
      : calculatePercentage(card.value, card.target);

  const newCard: CmsCardItem = {
    ...card,
    id,
    slug,
    percent,
  };

  const useDb = await testPrismaConnection();
  if (useDb) {
    try {
      const createPayload: PillarCardCreatePayload = {
        id: newCard.id,
        slug: newCard.slug,
        pillarId: newCard.pillarId,
        category: newCard.category,
        title: newCard.title,
        value: newCard.value,
        unit: newCard.unit || '',
        status: newCard.status,
        target: newCard.target,
        percent: newCard.percent,
        subtext: newCard.subtext || null,
        description: newCard.description || null,
        picKementerian: newCard.picKementerian || null,
        order: newCard.order || 0,
        isActive: newCard.isActive ?? true,
        isMilestone: newCard.isMilestone || false,
        milestoneContent: newCard.milestoneContent || null,
        annualTargets: toJsonInput(newCard.annualTargets),
        monthlyData: toJsonInput(newCard.monthlyData),
        kendalaList: toJsonInput(newCard.kendalaList),
        updateLogs: toJsonInput(newCard.updateLogs),
      };

      const r = await prisma.pillarCard.create({
        data: createPayload,
      });

      return toCmsCardItem(r);
    } catch {
      isPrismaAvailable = false;
    }
  }

  const all = ensureJsonFile();
  all.push(newCard);
  saveJsonFile(all);
  return newCard;
}

/**
 * Delete a card
 */
export async function deleteCard(id: string): Promise<boolean> {
  const useDb = await testPrismaConnection();
  if (useDb) {
    try {
      await prisma.pillarCard.deleteMany({
        where: {
          OR: [{ id }, { slug: id }],
        },
      });
      return true;
    } catch {
      isPrismaAvailable = false;
    }
  }

  const all = ensureJsonFile();
  const next = all.filter((c) => c.id !== id && c.slug !== id);
  if (next.length !== all.length) {
    saveJsonFile(next);
    return true;
  }
  return false;
}

/**
 * Reset all cards to official initial dataset
 */
export async function resetCards(): Promise<CmsCardItem[]> {
  const useDb = await testPrismaConnection();
  if (useDb) {
    try {
      await prisma.pillarCard.deleteMany({});
      await seedPrismaDatabase();
      return getCards({ onlyActive: false });
    } catch {
      isPrismaAvailable = false;
    }
  }

  const enriched = INITIAL_CMS_CARDS.map((card) => {
    const detail = getProgramDetailData(card.slug || card.id, card.title, card.pillarId);
    return {
      ...card,
      description: card.description || detail.description,
      picKementerian: card.picKementerian || detail.picKementerian,
      kendalaList: card.kendalaList || detail.kendalaList,
      monthlyData: card.monthlyData || detail.monthlyData,
      updateLogs: card.updateLogs || detail.updateLogs,
    };
  });

  saveJsonFile(enriched);
  return enriched;
}

/**
 * Get Dashboard Metadata from PostgreSQL or fallback
 */
export async function getDashboardMetadata() {
  const useDb = await testPrismaConnection();
  if (useDb) {
    try {
      const meta = await prisma.dashboardMeta.findUnique({ where: { id: 'default' } });
      if (meta) {
        return {
          title: meta.title,
          subtitle: meta.subtitle,
          cutoffDate: meta.cutoffDate,
          ministerTitle: meta.ministerTitle,
        };
      }
    } catch {
      // fallback
    }
  }
  return DASHBOARD_META;
}

/**
 * Get Disaster (Kebencanaan) Report from PostgreSQL or fallback
 */
export async function getBencanaData() {
  const useDb = await testPrismaConnection();
  if (useDb) {
    try {
      const report = await prisma.bencanaReport.findUnique({ where: { id: 'default' } });
      if (report) {
        return {
          ringkasanUtama: report.ringkasanUtama,
          pengkinianData: report.pengkinianData,
          vervalData: report.vervalData,
        };
      }
    } catch {
      // fallback
    }
  }
  return {
    ringkasanUtama: BENCANA_RINGKASAN_UTAMA,
    pengkinianData: PENGKINIAN_BENCANA_DATA,
    vervalData: null,
  };
}

interface PrismaSugLocation {
  provinceId: string;
  kodeBps: string;
  provinceName: string;
  type: string;
  count: number;
  lat: number;
  lng: number;
}

/**
 * Get SUG Locations from PostgreSQL or fallback
 */
export async function getSugLocations(): Promise<SugLocation[]> {
  const useDb = await testPrismaConnection();
  if (useDb) {
    try {
      const locs = await prisma.sugLocation.findMany();
      if (Array.isArray(locs) && locs.length > 0) {
        return locs.map((l: PrismaSugLocation) => ({
          provinceId: l.provinceId,
          kodeBps: l.kodeBps,
          provinceName: l.provinceName,
          type: (l.type === 'SUGB' ? 'SUGB' : 'SUGT') as 'SUGT' | 'SUGB',
          count: l.count,
          lat: l.lat,
          lng: l.lng,
        }));
      }
    } catch {
      // fallback
    }
  }
  return SUG_LOCATIONS;
}

/**
 * Seed initial cards, users, and metadata into Prisma PostgreSQL
 */
export async function seedPrismaDatabase(): Promise<void> {
  try {
    // 1. Seed Default Users
    for (const key of Object.keys(DEFAULT_USERS)) {
      const u = DEFAULT_USERS[key];
      await prisma.user.upsert({
        where: { username: u.user.username },
        update: {
          password: u.password,
          name: u.user.name,
          role: u.user.role,
          email: u.user.email,
        },
        create: {
          id: u.user.id,
          username: u.user.username,
          password: u.password,
          name: u.user.name,
          role: u.user.role,
          email: u.user.email,
        },
      });
    }

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

    // 3. Seed All Pillar Cards with Program Details
    for (const card of INITIAL_CMS_CARDS) {
      const detail = getProgramDetailData(card.slug || card.id, card.title, card.pillarId);

      const seedUpdatePayload: Record<string, unknown> = {
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
        annualTargets: toJsonInput(card.annualTargets),
        kendalaList: toJsonInput(detail.kendalaList),
        monthlyData: toJsonInput(detail.monthlyData),
        updateLogs: toJsonInput(detail.updateLogs),
      };

      const seedCreatePayload: PillarCardCreatePayload = {
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
        annualTargets: toJsonInput(card.annualTargets),
        kendalaList: toJsonInput(detail.kendalaList),
        monthlyData: toJsonInput(detail.monthlyData),
        updateLogs: toJsonInput(detail.updateLogs),
      };

      await prisma.pillarCard.upsert({
        where: { slug: card.slug },
        update: seedUpdatePayload,
        create: seedCreatePayload,
      });
    }

    // 4. Seed Bencana Reports
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

    // 5. Seed SUG Locations
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
  } catch (err) {
    console.error('Failed to seed Prisma database:', err);
  }
}
