import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest, invalidateAllTokens } from '@/lib/auth';
import { db } from '@/lib/db';
import { compare } from 'bcryptjs';
import { hash } from 'bcryptjs';

export async function POST(request: NextRequest) {
  if (!getAuthFromRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { currentPassword, newUsername, newPassword } = await request.json();

  const admin = await db.adminUser.findFirst();
  if (!admin) return NextResponse.json({ error: 'Admin not found' }, { status: 404 });

  const valid = await compare(currentPassword, admin.password);
  if (!valid) return NextResponse.json({ error: 'رمز عبور فعلی اشتباه است' }, { status: 400 });

  const updateData: any = {};
  if (newUsername) {
    const existing = await db.adminUser.findUnique({ where: { username: newUsername } });
    if (existing && existing.id !== admin.id) {
      return NextResponse.json({ error: 'این نام کاربری قبلاً استفاده شده است' }, { status: 400 });
    }
    updateData.username = newUsername;
  }
  if (newPassword) {
    updateData.password = await hash(newPassword, 10);
  }

  await db.adminUser.update({ where: { id: admin.id }, data: updateData });

  // Invalidate all tokens so admin must re-login with new credentials
  invalidateAllTokens();

  return NextResponse.json({ success: true, mustRelogin: true });
}