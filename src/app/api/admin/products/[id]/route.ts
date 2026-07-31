import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/auth';
import { db } from '@/lib/db';

const ALLOWED_FIELDS = [
  'name', 'slug', 'price', 'originalPrice', 'discount',
  'imageUrl', 'images', 'description', 'sizes', 'colors',
  'isNew', 'isBestseller', 'freeShipping', 'returnGuarantee', 'rating', 'reviewCount',
  'active', 'order', 'categoryId',
];

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!getAuthFromRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const product = await db.product.findUnique({
    where: { id },
    include: { category: { select: { name: true } } },
  });
  if (!product) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(product);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!getAuthFromRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  // Only pass fields that exist in the Prisma schema
  const data: Record<string, any> = {};
  for (const key of ALLOWED_FIELDS) {
    if (body[key] !== undefined) {
      data[key] = body[key];
    }
  }

  const product = await db.product.update({ where: { id }, data });
  return NextResponse.json(product);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!getAuthFromRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  await db.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
}