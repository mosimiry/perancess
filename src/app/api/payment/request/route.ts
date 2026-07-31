import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requestPayment, getMerchantId, ZARINPAL_STARTPAY } from '@/lib/zarinpal';

// POST /api/payment/request
// Body: { customer: {...}, items: [{ productId, productCode, productName, color, size, quantity, price }] }
//
// Two modes:
//   1) FAKE MODE  — when NEXT_PUBLIC_ZARINPAL_MERCHANT_ID === "YOUR_MERCHANT_ID":
//      Zarinpal is NOT called. The order is created and immediately marked paid
//      (paymentStatus 'success', authority "MOCK-<id>", refId "MOCK") and a
//      success response with a relative result URL is returned.
//   2) REAL MODE  — otherwise: a pending order is created and Zarinpal is asked
//      for an Authority (sandbox endpoints when ZARINPAL_SANDBOX=true). The
//      existing /verify route confirms the payment and keeps the order on
//      success / removes it on failure (so a persisted order only ever
//      represents a successful payment).
//
// The whole handler runs inside try/catch so it can never crash the server.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const customer = body?.customer || {};
    const items: Array<{
      productId?: string;
      productCode?: string;
      productName?: string;
      color?: string;
      size?: string;
      quantity?: number;
      price?: number;
    }> = Array.isArray(body?.items) ? body.items : [];

    // ----- Data validation (keep existing checkout flow) -----
    const firstName = String(customer.firstName || '').trim();
    const lastName = String(customer.lastName || '').trim();
    const email = String(customer.email || '').trim().toLowerCase();
    const phone = String(customer.phone || '').trim();
    // Structured address fields
    const province = String(customer.province || '').trim();
    const city = String(customer.city || '').trim();
    const street = String(customer.street || '').trim();
    const alley = String(customer.alley || '').trim();
    const plate = String(customer.plate || '').trim();

    // Required: name, lastName, email, phone, address (province/city/street/plate)
    if (!firstName) {
      return NextResponse.json({ success: false, message: 'نام الزامی است' }, { status: 400 });
    }
    if (!lastName) {
      return NextResponse.json({ success: false, message: 'نام خانوادگی الزامی است' }, { status: 400 });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, message: 'ایمیل نامعتبر است' }, { status: 400 });
    }
    // Phone: must be exactly 11 digits and start with 0
    if (!/^0\d{10}$/.test(phone)) {
      return NextResponse.json(
        { success: false, message: 'شماره تماس باید ۱۱ رقم و با ۰ شروع شود' },
        { status: 400 }
      );
    }
    if (!province || !city || !street || !plate) {
      return NextResponse.json({ success: false, message: 'آدرس کامل الزامی است' }, { status: 400 });
    }
    if (items.length === 0) {
      return NextResponse.json({ success: false, message: 'سبد خرید خالی است' }, { status: 400 });
    }

    // Compute total server-side (never trust the client total)
    const totalPrice = items.reduce(
      (sum, it) => sum + Number(it.price || 0) * Number(it.quantity || 0),
      0
    );
    if (totalPrice <= 0) {
      return NextResponse.json({ success: false, message: 'مبلغ سفارش نامعتبر است' }, { status: 400 });
    }

    const fullName = `${firstName} ${lastName}`.trim();

    // Upsert the customer (keyed by email) so the order can be linked to a user
    const cust = await db.customer.upsert({
      where: { email },
      update: { name: fullName, phone, province, city, street, alley, plate },
      create: { name: fullName, email, phone, province, city, street, alley, plate },
    });

    // Shared order item payload (name, code, size, color, quantity, price)
    const itemsCreate = items.map((it) => ({
      productId: String(it.productId || ''),
      productCode: String(it.productCode || ''),
      productName: String(it.productName || ''),
      color: String(it.color || ''),
      size: String(it.size || ''),
      quantity: Number(it.quantity || 1),
      price: Number(it.price || 0),
      totalPrice: Number(it.price || 0) * Number(it.quantity || 1),
    }));

    const merchantId = getMerchantId();

    // -----------------------------------------------------------------------
    // 1) FAKE MODE: merchant id not configured yet -> skip Zarinpal entirely.
    // Create the order already marked as paid and return a relative result URL.
    // -----------------------------------------------------------------------
    if (merchantId === 'YOUR_MERCHANT_ID') {
      const order = await db.order.create({
        data: {
          customerId: cust.id,
          firstName,
          lastName,
          email,
          phone,
          province,
          city,
          street,
          alley,
          plate,
          totalPrice,
          paymentStatus: 'success', // canonical "paid" state in this project
          orderStatus: 'preparing',
          refId: 'MOCK',
          items: { create: itemsCreate },
        },
      });

      // Set the mock authority (authority = "MOCK-" + orderId)
      const mockAuthority = `MOCK-${order.id}`;
      await db.order.update({
        where: { id: order.id },
        data: { authority: mockAuthority },
      });

      return NextResponse.json({
        success: true,
        mock: true,
        url: `/payment/result?Status=OK&Authority=${mockAuthority}`,
        orderId: order.id,
      });
    }

    // -----------------------------------------------------------------------
    // 2) REAL MODE: create a pending order, then ask Zarinpal for an Authority.
    // (Sandbox endpoints are used automatically when ZARINPAL_SANDBOX=true.)
    // -----------------------------------------------------------------------
    const order = await db.order.create({
      data: {
        customerId: cust.id,
        firstName,
        lastName,
        email,
        phone,
        province,
        city,
        street,
        alley,
        plate,
        totalPrice,
        paymentStatus: 'pending',
        orderStatus: 'preparing',
        items: { create: itemsCreate },
      },
    });

    const origin = request.nextUrl.origin;
    const callbackUrl = `${origin}/payment/result`;

    const result = await requestPayment({
      amount: totalPrice,
      description: `سفارش پرنسس بوتیک #${order.id}`,
      callbackUrl,
      email,
      mobile: phone,
    });

    if (!result.ok || !result.authority) {
      // Gateway request failed -> mark order failed so it is not treated as valid
      await db.order.update({ where: { id: order.id }, data: { paymentStatus: 'failed' } });
      return NextResponse.json(
        { success: false, message: result.error || 'اتصال به درگاه ناموفق بود' },
        { status: 502 }
      );
    }

    // Store the Authority so /verify can find this order on callback
    await db.order.update({ where: { id: order.id }, data: { authority: result.authority } });

    return NextResponse.json({
      success: true,
      url: `${ZARINPAL_STARTPAY}${result.authority}`,
      authority: result.authority,
      orderId: order.id,
    });
  } catch (error) {
    // Never crash the server: log the real error and return a safe response.
    console.error('PAYMENT ERROR:', error);
    return NextResponse.json({ success: false, message: 'Payment failed' }, { status: 500 });
  }
}
