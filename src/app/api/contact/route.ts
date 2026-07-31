import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST: create a new contact message from a site visitor
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, email, phone, subject, message } = body;

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'فیلدهای نام، ایمیل و پیام الزامی هستند' }, { status: 400 });
  }

  await db.contactMessage.create({
    data: { name, email, phone: phone || '', subject: subject || '', message },
  });

  return NextResponse.json({ success: true });
}

// GET: return all messages sent by a given email (for the contact page "your messages" list)
// Query param: ?email=user@example.com
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'ایمیل الزامی است' }, { status: 400 });
  }

  // Return only messages belonging to this email, newest first
  const messages = await db.contactMessage.findMany({
    where: { email },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      subject: true,
      message: true,
      isRead: true, // status: false = unread (red), true = read (green)
      createdAt: true,
    },
  });

  return NextResponse.json(messages);
}
