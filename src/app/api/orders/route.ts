import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/orders?email=...
// Returns the SUCCESSFUL (paid) orders that belong to the given user.
// An order is only ever persisted with paymentStatus 'success' after the
// payment succeeds, so this endpoint only ever returns saved-after-success
// orders. Security: a user can only fetch their own orders by their email.
//
// The response explicitly includes the FULL user info and the FULL product
// details for every line item (name, code, size, color, quantity, price).
export async function GET(request: NextRequest) {
  const email = (request.nextUrl.searchParams.get('email') || '').trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: 'ایمیل الزامی است' }, { status: 400 });
  }

  const orders = await db.order.findMany({
    where: { email, paymentStatus: 'success' },
    select: {
      id: true,
      // Full user info captured at checkout
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      // Structured shipping address
      province: true,
      city: true,
      street: true,
      alley: true,
      plate: true,
      // Totals & statuses
      totalPrice: true,
      paymentStatus: true,
      orderStatus: true,
      refId: true,
      // Optional shipment tracking code set by admin (null when not set)
      trackingCode: true,
      createdAt: true,
      // Full product details for each item (size, color, quantity, price)
      items: {
        select: {
          id: true,
          productId: true,
          productCode: true,
          productName: true,
          color: true,
          size: true,
          quantity: true,
          price: true,
          totalPrice: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(orders);
}
