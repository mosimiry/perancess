import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const db = new PrismaClient();

async function seed() {
  console.log('🌱 Seeding database...');

  // Create admin user -- password comes from the environment so a weak
  // default ("admin123") never reaches a production database.
  const initialPassword = process.env.ADMIN_INITIAL_PASSWORD;
  if (!initialPassword) {
    console.warn('\n⚠️  ADMIN_INITIAL_PASSWORD is not set; skipping admin user seeding.\n   Set it in your .env (e.g. ADMIN_INITIAL_PASSWORD="some-long-random-secret").\n');
  } else {
    const hashedPassword = await hash(initialPassword, 10);
    await db.adminUser.upsert({
      where: { username: 'admin' },
      update: {},
      create: { username: 'admin', password: hashedPassword },
    });
    console.log('✅ Admin user created (username: admin)');
  }

  // Create hero slides
  const slides = [
    { title: 'زیبایی شما، سبک ما', subtitle: 'مجموعه‌ای منحصربه‌فرد از لباس‌های لوکس زنانه', imageUrl: '/images/hero-1.png', order: 0, active: true },
    { title: 'شیک و خاص باشید', subtitle: 'جدیدترین کالکشن فصل با بهترین کیفیت', imageUrl: '/images/hero-2.png', order: 1, active: true },
  ];
  for (const s of slides) {
    await db.heroSlide.create({ data: s });
  }
  console.log('✅ Hero slides created');

  // Create categories
  const categoriesData = [
    { name: 'لباس‌های رسمی', slug: 'formal-dresses', imageUrl: '/images/category-dresses.png', description: 'لباس‌های مجلسی و رسمی', productCount: 24, order: 0, active: true },
    { name: 'بلوز و شومیز', slug: 'blouses', imageUrl: '/images/category-accessories.png', description: 'بلوز و شومیز شیک', productCount: 18, order: 1, active: true },
    { name: 'شلوار و دامن', slug: 'trousers-skirts', imageUrl: '/images/category-shoes.png', description: 'شلوار و دامن زنانه', productCount: 15, order: 2, active: true },
    { name: 'اکسسوری', slug: 'accessories', imageUrl: '/images/category-bags.png', description: 'اکسسوری‌های زنانه', productCount: 32, order: 3, active: true },
    { name: 'کیف و کفش', slug: 'bags-shoes', imageUrl: '/images/category-bags.png', description: 'کیف و کفش زنانه', productCount: 21, order: 4, active: true },
  ];

  const createdCategories: Record<string, string> = {};
  for (const c of categoriesData) {
    const cat = await db.category.create({ data: c });
    createdCategories[cat.slug] = cat.id;
  }
  console.log('✅ Categories created');

  // Create products
  const productsData = [
    {
      name: 'لباس شب سفید مجلل', slug: 'white-evening-gown', price: 4850000, originalPrice: 5800000, discount: 16,
      imageUrl: '/images/product-1.png', images: '["/images/product-1.png"]',
      description: 'لباس شب سفید مجلل با جزئیات رزگلد، طراحی منحصربه‌فرد برای مناسبت‌های خاص. پارچه ساتن ابریشمی با دوام بالا.',
      sizes: '["S","M","L","XL"]', colors: '[{"name":"سفید","hex":"#FFFFFF"},{"name":"شیری","hex":"#F5F0E8"}]',
      isNew: true, isBestseller: true, freeShipping: true, returnGuarantee: true, rating: 4.8, reviewCount: 47,
      categoryId: createdCategories['formal-dresses'], order: 0, active: true,
    },
    {
      name: 'بلوز ابریشم آبی ملایم', slug: 'navy-silk-blouse', price: 2180000,
      imageUrl: '/images/product-2.png', images: '["/images/product-2.png"]',
      description: 'بلوز ابریشم نخی با رنگ آبی ملایم، مناسب برای استفاده روزانه و محیط‌های کاری.',
      sizes: '["S","M","L"]', colors: '[{"name":"آبی ملایم","hex":"#1B3A5C"},{"name":"مشکی","hex":"#1A1A1A"}]',
      isNew: false, isBestseller: false, rating: 4.5, reviewCount: 23,
      categoryId: createdCategories['blouses'], order: 1, active: true,
    },
    {
      name: 'دامن پلیسه کرمی', slug: 'cream-pleated-skirt', price: 1950000, originalPrice: 2400000, discount: 19,
      imageUrl: '/images/product-3.png', images: '["/images/product-3.png"]',
      description: 'دامن پلیسه متنی با رنگ کرمی شیک، مناسب برای ست‌های اداری و رسمی.',
      sizes: '["S","M","L","XL"]', colors: '[{"name":"کرمی","hex":"#D4C5A9"},{"name":"صورتی","hex":"#E8C4C4"}]',
      isNew: true, isBestseller: false, rating: 4.6, reviewCount: 31,
      categoryId: createdCategories['trousers-skirts'], order: 2, active: true,
    },
    {
      name: 'لبش مخمل شرابی', slug: 'burgundy-velvet-dress', price: 5200000,
      imageUrl: '/images/product-4.png', images: '["/images/product-4.png"]',
      description: 'لباس مخمل شرابی لوکس، مناسب برای مهمانی‌ها و مراسم عروسی.',
      sizes: '["S","M","L"]', colors: '[{"name":"شرابی","hex":"#722F37"},{"name":"مشکی","hex":"#1A1A1A"}]',
      isNew: false, isBestseller: true, freeShipping: true, returnGuarantee: false, rating: 4.9, reviewCount: 62,
      categoryId: createdCategories['formal-dresses'], order: 3, active: true,
    },
    {
      name: 'بلوز تور مشکی', slug: 'black-lace-blazer', price: 3450000, originalPrice: 4100000, discount: 16,
      imageUrl: '/images/product-5.png', images: '["/images/product-5.png"]',
      description: 'بلوز تور مشکی شیک و زنانه، مناسب برای شب‌های خاص.',
      sizes: '["M","L","XL"]', colors: '[{"name":"مشکی","hex":"#1A1A1A"}]',
      isNew: true, isBestseller: false, rating: 4.7, reviewCount: 18,
      categoryId: createdCategories['blouses'], order: 4, active: true,
    },
    {
      name: 'شلوار پارچه‌ای سبز مریم‌گلی', slug: 'sage-wide-leg-trousers', price: 1680000,
      imageUrl: '/images/product-6.png', images: '["/images/product-6.png"]',
      description: 'شلوار پارچه‌ای گشاد با رنگ سبز مریم‌گلی آرامش‌بخش.',
      sizes: '["S","M","L","XL"]', colors: '[{"name":"سبز مریم‌گلی","hex":"#9CAF88"},{"name":"کرمی","hex":"#D4C5A9"}]',
      isNew: false, isBestseller: false, rating: 4.4, reviewCount: 29,
      categoryId: createdCategories['trousers-skirts'], order: 5, active: true,
    },
  ];

  for (const p of productsData) {
    await db.product.create({ data: p });
  }
  console.log('✅ Products created');

  // Create testimonials
  const testimonialsData = [
    { name: 'سارا احمدی', text: 'کیفیت لباس‌های پرنسس فوق‌العاده‌ست. من چندین بار از این بوتیک خرید کردم و همیشه راضی بودم.', rating: 5, order: 0, active: true },
    { name: 'مریم رضایی', text: 'خدمات مشتریان عالی و ارسال سریع. لباس‌ها دقیقاً مطابق عکس بودند.', rating: 5, order: 1, active: true },
    { name: 'نازنین محمدی', text: 'طرح‌ها بسیار شیک و منحصربه‌فرد هستند. قیمت‌ها نسبت به کیفیت کاملاً مناسب است.', rating: 4, order: 2, active: true },
    { name: 'فاطمه کریمی', text: 'از خریدم بسیار راضی هستم. بسته‌بندی لوکس و مرتب بود.', rating: 5, order: 3, active: true },
  ];
  for (const t of testimonialsData) {
    await db.testimonial.create({ data: t });
  }
  console.log('✅ Testimonials created');

  // Create FAQs
  const faqsData = [
    { question: 'نحوه ارسال سفارشات چگونه است؟', answer: 'سفارشات شما از طریق پست پیشتاز و تیپاکس ارسال می‌شوند. ارسال برای خریدهای بالای ۵۰۰ هزار تومان رایگان است.', order: 0, active: true },
    { question: 'آیا امکان مرجوع کردن کالا وجود دارد؟', answer: 'بله، تا ۷ روز پس از دریافت سفارش، امکان مرجوع کردن کالا بدون قید و شرط وجود دارد.', order: 1, active: true },
    { question: 'راهنمای سایز را چگونه انتخاب کنم؟', answer: 'در صفحه هر محصول، جدول راهنمای سایز دقیق موجود است. همچنین می‌توانید با تماس با پشتیبانی راهنمایی کامل دریافت کنید.', order: 2, active: true },
    { question: 'آیا فروشگاه حضوری هم دارید؟', answer: 'بله، شعبه اصلی ما در تهران، خیابان ولیعصر، پلاک ۱۲۳ قرار دارد. همه روزه از ساعت ۱۰ صبح تا ۹ شب.', order: 3, active: true },
    { question: 'روش‌های پرداخت چیست؟', answer: 'شما می‌توانید از طریق درگاه پرداخت آنلاین، کارت به کارت، و پرداخت در محل خرید خود را انجام دهید.', order: 4, active: true },
  ];
  for (const f of faqsData) {
    await db.fAQ.create({ data: f });
  }
  console.log('✅ FAQs created');

  // Create Instagram images
  const instaData = [
    { imageUrl: '/images/insta-1.png', alt: 'استایل خاص پرنسس', order: 0, active: true },
    { imageUrl: '/images/insta-2.png', alt: 'فضای داخلی بوتیک', order: 1, active: true },
    { imageUrl: '/images/insta-3.png', alt: 'جزئیات لباس', order: 2, active: true },
    { imageUrl: '/images/insta-4.png', alt: 'مجموعه جدید', order: 3, active: true },
    { imageUrl: '/images/insta-5.png', alt: 'بسته‌بندی لوکس', order: 4, active: true },
  ];
  for (const i of instaData) {
    await db.instagramImage.create({ data: i });
  }
  console.log('✅ Instagram images created');

  // Create site settings
  const settingsData = [
    { key: 'brand_name', value: 'پرنسس بوتیک' },
    { key: 'brand_tagline', value: 'بوتیک لوکس زنانه' },
    { key: 'brand_description', value: 'پرنسس بوتیک، مرجع خرید لباس زنانه لوکس و شیک' },
    { key: 'logo_url', value: '/favicon.png' },
    { key: 'princess_logo_url', value: '/favicon.png' },
    // Navbar "Categories" label - editable from admin settings
    { key: 'nav_categories_label', value: 'دسته‌بندی‌ها' },
    { key: 'phone', value: '۰۲۱-۱۲۳۴۵۶۷۸' },
    { key: 'email', value: 'info@perancess.ir' },
    { key: 'address', value: 'تهران، خیابان ولیعصر، پلاک ۱۲۳' },
    { key: 'working_hours', value: 'همه روزه ۱۰ صبح تا ۹ شب' },
    { key: 'whatsapp', value: '989123456789' },
    { key: 'instagram_url', value: 'https://instagram.com/perancess_boutique' },
    { key: 'telegram_url', value: '' },
    { key: 'facebook_url', value: '' },
    { key: 'pinterest_url', value: '' },
  ];
  for (const s of settingsData) {
    await db.siteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }
  console.log('✅ Settings created');

  // Create page contents
  const pagesData = [
    {
      slug: 'about',
      title: 'درباره ما',
      heroTitle: 'درباره ما',
      heroSubtitle: 'داستان پرنسس بوتیک، از عشق به مد و فشن آغاز شد',
      content: 'پرنسس بوتیک در سال ۱۳۹۸ با هدف ارائه بهترین و باکیفیت‌ترین لباس‌های زنانه تأسیس شد. ما معتقدیم هر زنی شایسته پوشیدن لباس‌هایی است که او را زیباتر و اعتمادبه‌نفس‌تر کند.\n\nتیم ما با دقت هر قطعه لباس را انتخاب و بررسی می‌کند تا مطمئن شود بالاترین استانداردهای کیفیت را دارد. ما به تنوع، سبک و راحتی اهمیت ویژه‌ای می‌دهیم.',
      active: true,
    },
    {
      slug: 'contact',
      title: 'تماس با ما',
      heroTitle: 'تماس با ما',
      heroSubtitle: 'خوشحال می‌شویم صدای شما را بشنویم',
      content: '',
      active: true,
    },
  ];
  for (const p of pagesData) {
    await db.pageContent.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    });
  }
  console.log('✅ Page contents created');

  // Create footer service items (each becomes a footer page with H1 title, H3 sections and content)
  const footerServicesData = [
    {
      title: 'نحوه ارسال',
      slug: 'shipping',
      content: JSON.stringify([
        { title: 'زمان ارسال', content: 'سفارشات شما از طریق پست پیشتاز و تیپاکس ارسال می‌شوند. معمولاً بین ۲ تا ۵ روز کاری به دست شما می‌رسد.' },
        { title: 'هزینه ارسال', content: 'ارسال برای خریدهای بالای ۵۰۰ هزار تومان رایگان است. برای خریدهای کمتر، هزینه ارسال بر اساس WEIGHT محاسبه می‌شود.' },
      ]),
      order: 0, active: true,
    },
    {
      title: 'شرایط مرجوعی',
      slug: 'returns',
      content: JSON.stringify([
        { title: 'مدت مرجوعی', content: 'تا ۷ روز پس از دریافت سفارش، امکان مرجوع کردن کالا بدون قید و شرط وجود دارد.' },
        { title: 'شرایط مرجوعی', content: 'کالا باید در بسته‌بندی اصلی و بدون استفاده باشد.' },
      ]),
      order: 1, active: true,
    },
    {
      title: 'راهنمای سایز',
      slug: 'size-guide',
      content: JSON.stringify([
        { title: 'جدول سایز', content: 'در صفحه هر محصول، جدول راهنمای سایز دقیق موجود است.' },
        { title: 'مشاوره', content: 'برای راهنمایی بیشتر با پشتیبانی تماس بگیرید.' },
      ]),
      order: 2, active: true,
    },
    {
      title: 'سیاست حریم خصوصی',
      slug: 'privacy',
      content: JSON.stringify([
        { title: 'حفظ اطلاعات', content: 'ما به حریم خصوصی مشتریان احترام می‌گذاریم و اطلاعات شما را محرمانه نگه می‌داریم.' },
      ]),
      order: 3, active: true,
    },
    {
      title: 'سوالات متداول',
      slug: 'faq',
      content: JSON.stringify([
        { title: 'سوالات رایج', content: 'پاسخ به سوالات متداول در بخش سوالات متداول سایت ارائه شده است.' },
      ]),
      order: 4, active: true,
    },
  ];
  for (const fs of footerServicesData) {
    await db.footerServiceItem.create({ data: fs });
  }
  console.log('✅ Footer service items created');

  console.log('🎉 Seeding complete!');
}

seed()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());