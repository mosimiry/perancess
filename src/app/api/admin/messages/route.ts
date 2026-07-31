import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  if (!getAuthFromRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const unread = searchParams.get('unread');

  const messages = await db.contactMessage.findMany({
    where: unread === '1' ? { isRead: false } : undefined,
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(messages);
}