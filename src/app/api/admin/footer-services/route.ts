import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/auth';
import { db } from '@/lib/db';

// Fields allowed when creating/updating a footer service item (footer page)
const ALLOWED_FIELDS = ['title', 'slug', 'content', 'order', 'active'];

export async function GET(request: NextRequest) {
  if (!getAuthFromRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const items = await db.footerServiceItem.findMany({ orderBy: { order: 'asc' } });
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  if (!getAuthFromRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  // Keep only whitelisted fields
  const data: Record<string, any> = {};
  for (const key of ALLOWED_FIELDS) {
    if (body[key] !== undefined) data[key] = body[key];
  }
  const item = await db.footerServiceItem.create({ data });
  return NextResponse.json(item, { status: 201 });
}
