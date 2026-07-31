export interface Product {
  id: string;
  name: string;
  productCode: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  images: string[];
  category: string;
  categorySlug: string;
  description: string;
  sizes: string[];
  colors: ProductColor[];
  isNew?: boolean;
  isBestseller?: boolean;
  // Per-product purchase perks displayed under the "Add to Cart" button
  freeShipping?: boolean;
  returnGuarantee?: boolean;
  rating: number;
  reviewCount: number;
}

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  productCount: number;
}

export interface Testimonial {
  id: string;
  name: string;
  text: string;
  rating: number;
  avatar?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface NavItem {
  label: string;
  slug: string;
}

export type PageView =
  | 'home'
  | 'products'
  | 'categories'
  | 'product-detail'
  | 'about'
  | 'contact'
  | 'favorites' // user favorites (localStorage)
  | 'profile' // logged-in user profile (localStorage)
  | 'cart' // shopping cart
  | 'checkout' // checkout + payment flow
  | 'footer-page' // dynamic footer pages (shipping, returns, etc.)
  | 'not-found';