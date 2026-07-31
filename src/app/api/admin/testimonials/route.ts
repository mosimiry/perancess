import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  if (!getAuthFromRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const testimonials = await db.testimonial.findMany({ orderBy: { order: 'asc' } });
  return NextResponse.json(testimonials);
}

export async function POST(request: NextRequest) {
  if (!getAuthFromRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const testimonial = await db.testimonial.create({ data: body });
  return NextResponse.json(testimonial, { status: 201 });
}