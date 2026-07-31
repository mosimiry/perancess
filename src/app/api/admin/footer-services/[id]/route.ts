import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/auth';
import { db } from '@/lib/db';

// Fields allowed when updating a footer service item
const ALLOWED_FIELDS = ['title', 'slug', 'content', 'order', 'active'];

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!getAuthFromRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  // Keep only whitelisted fields (prevents passing unexpected fields)
  const data: Record<string, any> = {};
  for (const key of ALLOWED_FIELDS) {
    if (body[key] !== undefined) data[key] = body[key];
  }
  const item = await db.footerServiceItem.update({ where: { id }, data });
  return NextResponse.json(item);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!getAuthFromRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  await db.footerServiceItem.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
