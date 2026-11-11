import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

declare global {
  // eslint-disable-next-line no-var, @typescript-eslint/no-explicit-any
  var prisma: (PrismaClient & Record<string, any>) | undefined;
}

// Otomatis memilih database Vercel atau database lokal
const connectionString =
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_DATABASE_URL_POOLED ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5432/dashboard_pmk?schema=public';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const prisma: PrismaClient & Record<string, any> =
  global.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;