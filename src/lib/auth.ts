import { compare } from 'bcryptjs';
import { db } from './db';
import { randomUUID } from 'crypto';

const tokens = new Map<string, { userId: string; createdAt: number }>();

const TOKEN_TTL = 24 * 60 * 60 * 1000; // 24 hours

export async function loginAdmin(username: string, password: string): Promise<{ success: boolean; token?: string; error?: string }> {
  const admin = await db.adminUser.findUnique({ where: { username } });
  if (!admin) return { success: false, error: 'نام کاربری اشتباه است' };

  const valid = await compare(password, admin.password);
  if (!valid) return { success: false, error: 'رمز عبور اشتباه است' };

  const token = randomUUID();
  tokens.set(token, { userId: admin.id, createdAt: Date.now() });
  return { success: true, token };
}

export function verifyToken(token: string): boolean {
  const data = tokens.get(token);
  if (!data) return false;
  if (Date.now() - data.createdAt > TOKEN_TTL) {
    tokens.delete(token);
    return false;
  }
  return true;
}

export function invalidateAllTokens(): void {
  tokens.clear();
}

export function getAuthFromRequest(request: Request): boolean {
  const auth = request.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return false;
  return verifyToken(auth.slice(7));
}