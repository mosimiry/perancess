import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  if (!getAuthFromRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const images = await db.instagramImage.findMany({ orderBy: { order: 'asc' } });
  return NextResponse.json(images);
}

export async function POST(request: NextRequest) {
  if (!getAuthFromRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const image = await db.instagramImage.create({ data: body });
  return NextResponse.json(image, { status: 201 });
}