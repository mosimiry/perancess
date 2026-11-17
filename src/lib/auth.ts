import { compare } from 'bcryptjs';
import { db } from './db';
import { createHmac, randomBytes, randomUUID, timingSafeEqual } from 'crypto';

// ---------------------------------------------------------------------------
// Secret: read from environment. Falls back to a per-process random secret in
// development so the app still boots even if ADMIN_SECRET is not set, but in
// production (or when a persistent secret is available) the token will survive
// server restarts and work across multiple instances.
// ---------------------------------------------------------------------------
const SECRET =
  (process.env.ADMIN_SECRET && process.env.ADMIN_SECRET.trim()) ||
  (process.env.NODE_ENV !== 'production' ? randomBytes(32).toString('hex') : '');

if (process.env.NODE_ENV === 'production' && !SECRET) {
  console.warn('⚠  ADMIN_SECRET is not set in production; tokens will be ephemeral.');
}

const TOKEN_TTL = 24 * 60 * 60 * 1000; // 24 hours

interface TokenPayload {
  userId: string;
  createdAt: number;
  nonce: string;
}

// In-memory blacklist of explicitly invalidated token nonces (e.g. after a
// credential change). Entries are kept short-lived (TTL past their original
// expiry are dropped on each check so memory does not grow forever).
const revokedNonces = new Map<string, number>(); // nonce -> expiresAt

function sign(payloadB64: string): string {
  return createHmac('sha256', SECRET).update(payloadB64).digest('base64url');
}

function encodeToken(p: TokenPayload): string {
  const payloadB64 = Buffer.from(JSON.stringify(p), 'utf8').toString('base64url');
  const sig = sign(payloadB64);
  return `${payloadB64}.${sig}`;
}

function decodeToken(token: string): TokenPayload | null {
  if (typeof token !== 'string') return null;
  const dotIdx = token.lastIndexOf('.');
  if (dotIdx <= 0) return null;
  const payloadB64 = token.slice(0, dotIdx);
  const sig = token.slice(dotIdx + 1);
  if (!payloadB64 || !sig) return null;

  const expected = sign(payloadB64);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  let payload: TokenPayload;
  try {
    payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8')) as TokenPayload;
  } catch {
    return null;
  }
  if (!payload || typeof payload.userId !== 'string' || typeof payload.createdAt !== 'number') return null;
  return payload;
}

export async function loginAdmin(username: string, password: string): Promise<{ success: boolean; token?: string; error?: string }> {
  const admin = await db.adminUser.findUnique({ where: { username } });
  if (!admin) return { success: false, error: 'نام کاربری یا رمز عبور اشتباه است' };

  const valid = await compare(password, admin.password);
  if (!valid) return { success: false, error: 'نام کاربری یا رمز عبور اشتباه است' };

  const payload: TokenPayload = {
    userId: admin.id,
    createdAt: Date.now(),
    nonce: randomUUID(),
  };
  return { success: true, token: encodeToken(payload) };
}

// Returns the verified payload when the token is valid, otherwise null.
export function verifyTokenPayload(token: string): TokenPayload | null {
  const payload = decodeToken(token);
  if (!payload) return null;
  if (Date.now() - payload.createdAt > TOKEN_TTL) return null;
  // Check the in-memory revocation list
  const rev = revokedNonces.get(payload.nonce);
  if (rev && rev > Date.now()) return null;
  return payload;
}

export function verifyToken(token: string): boolean {
  return verifyTokenPayload(token) !== null;
}

export function invalidateAllTokens(): void {
  // Mark every nonce currently in the revocation list as expired past its TTL
  // (effectively clearing it) AND bump a global "not-before" timestamp so
  // tokens issued earlier than now are rejected.
  revokedNonces.clear();
  globalThis.__ADMIN_TOKENS_NOT_BEFORE__ = Date.now();
}

export function getAuthFromRequest(request: Request): boolean {
  const auth = request.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return false;
  const payload = verifyTokenPayload(auth.slice(7));
  if (!payload) return false;
  // Optional global "not-before" gate used by invalidateAllTokens().
  const nbf = (globalThis as any).__ADMIN_TOKENS_NOT_BEFORE__ as number | undefined;
  if (nbf && payload.createdAt < nbf) return false;
  return true;
}
