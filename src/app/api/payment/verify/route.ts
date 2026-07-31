import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPayment } from '@/lib/zarinpal';

// GET /api/payment/verify?Authority=...&Status=OK|NOK
// Verifies the payment with Zarinpal. On success the order is marked paid;
// on failure the pending order is removed (no order is kept for failed payments).
export async function GET(request: NextRequest) {
  const authority = request.nextUrl.searchParams.get('Authority') || '';
  const status = request.nextUrl.searchParams.get('Status') || '';

  if (!authority) {
    return NextResponse.json({ ok: false, error: 'پارامتر Authority یافت نشد' }, { status: 400 });
  }

  const order = await db.order.findUnique({ where: { authority }, include: { items: true } });
  if (!order) {
    return NextResponse.json({ ok: false, error: 'سفارش یافت نشد' }, { status: 404 });
  }

  // If already verified, return success idempotently
  if (order.paymentStatus === 'success') {
    return NextResponse.json({ ok: true, order });
  }

  // User cancelled or gateway returned a non-OK status
  if (status !== 'OK') {
    await db.order.delete({ where: { id: order.id } }).catch(() => {});
    return NextResponse.json({ ok: false, error: 'پرداخت توسط کاربر لغو شد یا ناموفق بود' });
  }

  const result = await verifyPayment(order.totalPrice, authority);

  if (!result.ok) {
    // Do NOT keep an order for a failed/unverified payment
    await db.order.delete({ where: { id: order.id } }).catch(() => {});
    return NextResponse.json({ ok: false, error: result.error || 'تایید پرداخت ناموفق بود' });
  }

  const updated = await db.order.update({
    where: { id: order.id },
    data: { paymentStatus: 'success', refId: result.refId || null },
    include: { items: true },
  });

  return NextResponse.json({ ok: true, order: updated, refId: result.refId });
}
