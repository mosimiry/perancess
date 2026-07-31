'use client';

import SectionTitle from '@/components/shared/SectionTitle';
import ProductCard from './ProductCard';
import { useNavigationStore } from '@/lib/store';
import { transformApiProduct } from '@/lib/transformApiProduct';
import type { Product } from '@/types';
import type { SiteData } from '@/types/siteData';

interface FeaturedProductsProps {
  products: SiteData['products'];
  categories: SiteData['categories'];
}

export default function FeaturedProducts({ products, categories }: FeaturedProductsProps) {
  const { navigateTo } = useNavigationStore();

  const activeProducts = products
    .filter((p) => p.active)
    .slice(0, 6)
    .map((p) => transformApiProduct(p, categories));

  const handleProductClick = (product: Product) => {
    navigateTo('product-detail', product.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle title="محصولات ویژه" subtitle="برترین انتخاب‌های این فصل" />

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {activeProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              onNavigate={handleProductClick}
              index={index}
            />
          ))}
        </div>

        <div className="text-center mt-10">
          <button
            onClick={() => { navigateTo('products'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="inline-flex items-center gap-2 bg-charcoal text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-charcoal/80 transition-all duration-300 hover:shadow-lg"
          >
            مشاهده همه محصولات
          </button>
        </div>
      </div>
    </section>
  );
}