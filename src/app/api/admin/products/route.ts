import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/auth';
import { db } from '@/lib/db';

// Fields allowed when creating a product (prevents passing unexpected fields)
const ALLOWED_FIELDS = [
  'name', 'slug', 'price', 'originalPrice', 'discount',
  'imageUrl', 'images', 'description', 'sizes', 'colors',
  'isNew', 'isBestseller', 'freeShipping', 'returnGuarantee', 'rating', 'reviewCount',
  'active', 'order', 'categoryId',
];

export async function GET(request: NextRequest) {
  if (!getAuthFromRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get('categoryId');

  const products = await db.product.findMany({
    where: categoryId ? { categoryId } : undefined,
    include: { category: { select: { name: true } } },
    orderBy: { order: 'asc' },
  });
  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  if (!getAuthFromRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  // Only keep whitelisted fields to avoid Prisma errors on unknown columns
  const data: Record<string, any> = {};
  for (const key of ALLOWED_FIELDS) {
    if (body[key] !== undefined) data[key] = body[key];
  }
  const product = await db.product.create({ data });
  return NextResponse.json(product, { status: 201 });
}
