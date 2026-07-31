import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const [slides, categories, products, testimonials, faqs, instagramImages, settings, pageContents, footerServiceItems] =
    await Promise.all([
      db.heroSlide.findMany({ where: { active: true }, orderBy: { order: 'asc' } }),
      db.category.findMany({ where: { active: true }, orderBy: { order: 'asc' } }),
      db.product.findMany({
        where: { active: true },
        include: { category: { select: { name: true } } },
        orderBy: { order: 'asc' },
      }),
      db.testimonial.findMany({ where: { active: true }, orderBy: { order: 'asc' } }),
      db.fAQ.findMany({ where: { active: true }, orderBy: { order: 'asc' } }),
      db.instagramImage.findMany({ where: { active: true }, orderBy: { order: 'asc' } }),
      db.siteSetting.findMany(),
      db.pageContent.findMany({ where: { active: true } }),
      db.footerServiceItem.findMany({ where: { active: true }, orderBy: { order: 'asc' } }),
    ]);

  const settingsObj: Record<string, string> = {};
  for (const s of settings) {
    settingsObj[s.key] = s.value;
  }

  return NextResponse.json({
    slides,
    categories,
    products,
    testimonials,
    faqs,
    instagramImages,
    settings: settingsObj,
    pageContents,
    footerServiceItems,
  });
}