import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { getAuthFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  // Only authenticated admins may upload files (used by admin panel image pickers).
  if (!getAuthFromRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'فایلی ارسال نشده است' }, { status: 400 });
    }

    // Validate file type (SVG removed: it can contain <script> payloads).
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'فرمت فایل پشتیبانی نمی‌شود' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'حجم فایل نباید بیشتر از ۵ مگابایت باشد' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const ext = path.extname(file.name).toLowerCase() || '.png';
    const safeExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext) ? ext : '.png';
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${safeExt}`;

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, uniqueName);
    await writeFile(filePath, buffer);

    return NextResponse.json({
      url: `/uploads/${uniqueName}`,
      filename: uniqueName,
    });
  } catch {
    return NextResponse.json({ error: 'خطا در آپلود فایل' }, { status: 500 });
  }
}