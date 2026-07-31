import type { Product, Category, Testimonial, FAQ, NavItem } from '@/types';

export const navItems: NavItem[] = [
  { label: 'خانه', slug: 'home' },
  { label: 'محصولات', slug: 'products' },
  { label: 'دسته‌بندی‌ها', slug: 'categories' },
  { label: 'درباره ما', slug: 'about' },
  { label: 'تماس با ما', slug: 'contact' },
];

export const categories: Category[] = [
  { id: '1', name: 'لباس‌های رسمی', slug: 'formal-dresses', image: '/images/category-dresses.png', productCount: 24 },
  { id: '2', name: 'بلوز و شومیز', slug: 'blouses', image: '/images/category-accessories.png', productCount: 18 },
  { id: '3', name: 'شلوار و دامن', slug: 'trousers-skirts', image: '/images/category-shoes.png', productCount: 15 },
  { id: '4', name: 'اکسسوری', slug: 'accessories', image: '/images/category-bags.png', productCount: 32 },
  { id: '5', name: 'کیف و کفش', slug: 'bags-shoes', image: '/images/category-bags.png', productCount: 21 },
];

export const products: Product[] = [
  {
    id: '1',
    name: 'لباس شب سفید مجلل',
    productCode: 'PRD-1001',
    price: 4850000,
    originalPrice: 5800000,
    discount: 16,
    image: '/images/product-1.png',
    images: ['/images/product-1.png'],
    category: 'لباس‌های رسمی',
    categorySlug: 'formal-dresses',
    description: 'لباس شب سفید مجلل با جزئیات رزگلد، طراحی منحصربه‌فرد برای مناسبت‌های خاص. پارچه ساتن ابریشمی با دوام بالا و برش عالی که شکم شما را جمع می‌کند.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'سفید', hex: '#FFFFFF' }, { name: 'شیری', hex: '#F5F0E8' }],
    isNew: true,
    isBestseller: true,
    rating: 4.8,
    reviewCount: 47,
  },
  {
    id: '2',
    name: 'بلوز ابریشم آبی ملایم',
    productCode: 'PRD-1002',
    price: 2180000,
    image: '/images/product-2.png',
    images: ['/images/product-2.png'],
    category: 'بلوز و شومیز',
    categorySlug: 'blouses',
    description: 'بلوز ابریشم نخی با رنگ آبی ملایم، مناسب برای استفاده روزانه و محیط‌های کاری. طراحی کلاسیک و شیک.',
    sizes: ['S', 'M', 'L'],
    colors: [{ name: 'آبی ملایم', hex: '#1B3A5C' }, { name: 'مشکی', hex: '#1A1A1A' }],
    rating: 4.5,
    reviewCount: 23,
  },
  {
    id: '3',
    name: 'دامن پلیسه کرمی',
    productCode: 'PRD-1003',
    price: 1950000,
    originalPrice: 2400000,
    discount: 19,
    image: '/images/product-3.png',
    images: ['/images/product-3.png'],
    category: 'شلوار و دامن',
    categorySlug: 'trousers-skirts',
    description: 'دامن پلیسه متنی با رنگ کرمی شیک، مناسب برای ست‌های اداری و رسمی. پارچه سبک و راحت.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'کرمی', hex: '#D4C5A9' }, { name: 'صورتی', hex: '#E8C4C4' }],
    isNew: true,
    rating: 4.6,
    reviewCount: 31,
  },
  {
    id: '4',
    name: 'لبش مخمل شرابی',
    productCode: 'PRD-1004',
    price: 5200000,
    image: '/images/product-4.png',
    images: ['/images/product-4.png'],
    category: 'لباس‌های رسمی',
    categorySlug: 'formal-dresses',
    description: 'لباس مخمل شرابی لوکس، مناسب برای مهمانی‌ها و مراسم عروسی. رنگ شرابی عمیق و ماندگار.',
    sizes: ['S', 'M', 'L'],
    colors: [{ name: 'شرابی', hex: '#722F37' }, { name: 'مشکی', hex: '#1A1A1A' }],
    isBestseller: true,
    rating: 4.9,
    reviewCount: 62,
  },
  {
    id: '5',
    name: 'بلوز تور مشکی',
    productCode: 'PRD-1005',
    price: 3450000,
    originalPrice: 4100000,
    discount: 16,
    image: '/images/product-5.png',
    images: ['/images/product-5.png'],
    category: 'بلوز و شومیز',
    categorySlug: 'blouses',
    description: 'بلوز تور مشکی شیک و زنانه، مناسب برای شب‌های خاص. طراحی ظریف با جزئیات دست‌دوز.',
    sizes: ['M', 'L', 'XL'],
    colors: [{ name: 'مشکی', hex: '#1A1A1A' }],
    isNew: true,
    rating: 4.7,
    reviewCount: 18,
  },
  {
    id: '6',
    name: 'شلوار پارچه‌ای سبز مریم‌گلی',
    productCode: 'PRD-1006',
    price: 1680000,
    image: '/images/product-6.png',
    images: ['/images/product-6.png'],
    category: 'شلوار و دامن',
    categorySlug: 'trousers-skirts',
    description: 'شلوار پارچه‌ای گشاد با رنگ سبز مریم‌گلی آرامش‌بخش. طراحی مدرن و راحت برای استفاده روزانه.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'سبز مریم‌گلی', hex: '#9CAF88' }, { name: 'کرمی', hex: '#D4C5A9' }],
    rating: 4.4,
    reviewCount: 29,
  },
];

export const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'سارا احمدی',
    text: 'کیفیت لباس‌های پرنسس فوق‌العاده‌ست. من چندین بار از این بوتیک خرید کردم و همیشه راضی بودم. پارچه‌ها بسیار مرغوب و دوخت‌ها عالی هستند.',
    rating: 5,
  },
  {
    id: '2',
    name: 'مریم رضایی',
    text: 'خدمات مشتریان عالی و ارسال سریع. لباس‌ها دقیقاً مطابق عکس بودند. حتماً دوباره خرید می‌کنم.',
    rating: 5,
  },
  {
    id: '3',
    name: 'نازنین محمدی',
    text: 'طرح‌ها بسیار شیک و منحصربه‌فرد هستند. قیمت‌ها نسبت به کیفیت کاملاً مناسب است. پرنسس بهترین بوتیک آنلاین است.',
    rating: 4,
  },
  {
    id: '4',
    name: 'فاطمه کریمی',
    text: 'از خریدم بسیار راضی هستم. بسته‌بندی لوکس و مرتب بود. لباس به موقع رسید و سایز آن کاملاً مناسب بود.',
    rating: 5,
  },
];

export const faqs: FAQ[] = [
  {
    id: '1',
    question: 'نحوه ارسال سفارشات چگونه است؟',
    answer: 'سفارشات شما از طریق پست پیشتاز و تیپاکس ارسال می‌شوند. ارسال برای خریدهای بالای ۵۰۰ هزار تومان رایگان است. معمولاً بین ۲ تا ۵ روز کاری به دست شما می‌رسد.',
  },
  {
    id: '2',
    question: 'آیا امکان مرجوع کردن کالا وجود دارد؟',
    answer: 'بله، تا ۷ روز پس از دریافت سفارش، امکان مرجوع کردن کالا بدون قید و شرط وجود دارد. کالا باید در بسته‌بندی اصلی و بدون استفاده باشد.',
  },
  {
    id: '3',
    question: 'راهنمای سایز را چگونه انتخاب کنم؟',
    answer: 'در صفحه هر محصول، جدول راهنمای سایز دقیق موجود است. همچنین می‌توانید با تماس با پشتیبانی، راهنمایی کامل دریافت کنید.',
  },
  {
    id: '4',
    question: 'آیا فروشگاه حضوری هم دارید؟',
    answer: 'بله، شعبه اصلی ما در تهران، خیابان ولیعصر، پلاک ۱۲۳ قرار دارد. همه روزه از ساعت ۱۰ صبح تا ۹ شب پذیرای شما هستیم.',
  },
  {
    id: '5',
    question: 'روش‌های پرداخت چیست؟',
    answer: 'شما می‌توانید از طریق درگاه پرداخت آنلاین، کارت به کارت، و پرداخت در محل خرید خود را انجام دهید.',
  },
];

export const instagramImages = [
  { id: '1', src: '/images/insta-1.png', alt: 'استایل خاص پرنسس' },
  { id: '2', src: '/images/insta-2.png', alt: 'فضای داخلی بوتیک' },
  { id: '3', src: '/images/insta-3.png', alt: 'جزئیات لباس' },
  { id: '4', src: '/images/insta-4.png', alt: 'مجموعه جدید' },
  { id: '5', src: '/images/insta-5.png', alt: 'بسته‌بندی لوکس' },
];

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
}

export function getProductByCode(productCode: string): Product | undefined {
  return products.find((p) => p.productCode === productCode);
}

export function getProductsByCategory(categorySlug: string): Product[] {
  return products.filter((p) => p.categorySlug === categorySlug);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}