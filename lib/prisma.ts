import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var, @typescript-eslint/no-explicit-any
  var prisma: (PrismaClient & Record<string, any>) | undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const prisma: PrismaClient & Record<string, any> =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;

