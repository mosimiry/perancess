import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/auth';
import { db } from '@/lib/db';

const VALID_STATUSES = ['preparing', 'shipping', 'delivered'];

// PUT /api/admin/orders/[id] — update orderStatus (admin only)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!getAuthFromRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const orderStatus = String(body?.orderStatus || '');

  if (!VALID_STATUSES.includes(orderStatus)) {
    return NextResponse.json({ error: 'وضعیت نامعتبر است' }, { status: 400 });
  }

  // trackingCode is an optional, admin-only nullable field. Only persist it
  // when the caller explicitly provides the key (string or null).
  const data: { orderStatus: string; trackingCode?: string | null } = { orderStatus };
  if (Object.prototype.hasOwnProperty.call(body, 'trackingCode')) {
    const raw = body?.trackingCode;
    data.trackingCode = typeof raw === 'string' && raw.trim() ? raw.trim() : null;
  }

  const order = await db.order.update({
    where: { id },
    data,
    include: { items: true },
  });

  return NextResponse.json(order);
}
