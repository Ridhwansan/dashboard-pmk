import { cookies } from 'next/headers';
import crypto from 'crypto';
import { prisma } from './prisma';

export type UserRole = 'ADMIN' | 'USER';

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  email?: string;
}

export const AUTH_COOKIE_NAME = 'pmk_auth_token';
const AUTH_SECRET = process.env.AUTH_SECRET || 'pmk_super_secret_auth_key_2026';

// Standard default accounts
export const DEFAULT_USERS: Record<string, { password: string; user: AuthUser }> = {
  admin: {
    password: process.env.ADMIN_PASSWORD || 'admin123',
    user: {
      id: 'usr_admin_01',
      username: 'admin',
      name: 'Administrator PMK',
      role: 'ADMIN',
      email: 'admin@kemenkopmk.go.id',
    },
  },
  user: {
    password: process.env.USER_PASSWORD || 'user123',
    user: {
      id: 'usr_user_01',
      username: 'user',
      name: 'Pengguna Eksekutif',
      role: 'USER',
      email: 'eksekutif@kemenkopmk.go.id',
    },
  },
};

/**
 * Sign session payload to tamper-proof string: base64(payload).signature
 */
export function signSession(user: AuthUser, expiresInMs: number = 7 * 24 * 60 * 60 * 1000): string {
  const payload = {
    ...user,
    exp: Date.now() + expiresInMs,
  };
  const jsonStr = JSON.stringify(payload);
  const base64 = Buffer.from(jsonStr).toString('base64url');
  const signature = crypto.createHmac('sha256', AUTH_SECRET).update(base64).digest('base64url');
  return `${base64}.${signature}`;
}

/**
 * Verify and decode session token
 */
export function verifySession(token: string | null | undefined): AuthUser | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [base64, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', AUTH_SECRET).update(base64).digest('base64url');

  if (signature !== expectedSig) {
    return null; // Tampered token
  }

  try {
    const raw = Buffer.from(base64, 'base64url').toString('utf-8');
    const parsed = JSON.parse(raw);
    if (parsed.exp && Date.now() > parsed.exp) {
      return null; // Expired
    }
    return {
      id: parsed.id,
      username: parsed.username,
      name: parsed.name,
      role: parsed.role,
      email: parsed.email,
    };
  } catch {
    return null;
  }
}

/**
 * Authenticate credentials against default accounts or Prisma database
 */
export async function authenticateCredentials(
  username: string,
  pass: string
): Promise<AuthUser | null> {
  const cleanUsername = username.trim().toLowerCase();

  // 1. Check default hardcoded accounts first (always reliable)
  const defaultAcc = DEFAULT_USERS[cleanUsername];
  if (defaultAcc && defaultAcc.password === pass) {
    return defaultAcc.user;
  }

  // 2. Fallback to Prisma database lookup if available
  try {
    const dbUser = await prisma.user.findFirst({
      where: {
        OR: [{ username: cleanUsername }, { email: cleanUsername }],
      },
    });

    if (dbUser && dbUser.password === pass) {
      return {
        id: dbUser.id,
        username: dbUser.username,
        name: dbUser.name,
        role: dbUser.role as UserRole,
        email: dbUser.email || undefined,
      };
    }
  } catch {
    // Database check skipped or failed
  }

  return null;
}

/**
 * Get current session user from Next.js server cookie store
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    return verifySession(token);
  } catch {
    return null;
  }
}

/**
 * Check if session has ADMIN role
 */
export function isAdmin(user: AuthUser | null): boolean {
  return user?.role === 'ADMIN';
}

