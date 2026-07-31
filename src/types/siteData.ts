export interface SiteData {
  slides: { id: string; title: string; subtitle: string; imageUrl: string; order: number; active: boolean }[];
  categories: { id: string; name: string; slug: string; imageUrl: string; productCount: number; order: number; active: boolean }[];
  products: {
    id: string; name: string; slug: string; price: number; originalPrice: number | null; discount: number | null;
    imageUrl: string; images: string; description: string; sizes: string; colors: string;
    isNew: boolean; isBestseller: boolean; freeShipping: boolean; returnGuarantee: boolean; rating: number; reviewCount: number;
    categoryId: string; category: { name: string }; order: number; active: boolean;
  }[];
  testimonials: { id: string; name: string; text: string; rating: number; order: number; active: boolean }[];
  faqs: { id: string; question: string; answer: string; order: number; active: boolean }[];
  instagramImages: { id: string; imageUrl: string; alt: string; order: number; active: boolean }[];
  settings: Record<string, string>;
  pageContents: { id: string; slug: string; title: string; heroTitle: string; heroSubtitle: string; content: string; active: boolean }[];
  // Footer service items act as footer pages with H1 title, slug and JSON content sections
  footerServiceItems: { id: string; title: string; slug: string; content: string; order: number; active: boolean }[];
}
