'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Heart, Trash2 } from 'lucide-react';
import BreadcrumbNav from '@/components/shared/BreadcrumbNav';
import ProductCard from '@/components/home/ProductCard';
import { useNavigationStore } from '@/lib/store';
import { useFavorites } from '@/hooks/useFavorites';
import { transformApiProduct } from '@/lib/transformApiProduct';
import type { Product } from '@/types';
import type { SiteData } from '@/types/siteData';

interface FavoritesPageProps {
  siteData: SiteData;
}

export default function FavoritesPage({ siteData }: FavoritesPageProps) {
  const { navigateTo } = useNavigationStore();
  const { favorites, count, clearFavorites } = useFavorites();

  const favoriteProducts = useMemo(() => {
    const set = new Set(favorites);
    return siteData.products
      .filter((p) => set.has(p.id))
      .map((p) => transformApiProduct(p, siteData.categories));
  }, [favorites, siteData]);

  const handleProductClick = (product: Product) => {
    navigateTo('product-detail', product.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="pt-24 md:pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav items={[]} currentPage="علاقه‌مندی‌ها" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gold/10 flex items-center justify-center">
                <Heart className="w-5 h-5 text-gold fill-gold" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-charcoal">علاقه‌مندی‌ها</h1>
                <p className="text-sm text-muted-foreground">{count} محصول</p>
              </div>
            </div>
            {count > 0 && (
              <button
                onClick={clearFavorites}
                className="inline-flex items-center gap-2 text-sm text-destructive hover:bg-destructive/5 px-3 py-2 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
                حذف همه
              </button>
            )}
          </div>

          {favoriteProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {favoriteProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onNavigate={handleProductClick}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Heart className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="text-lg text-muted-foreground mb-4">هنوز محصولی به علاقه‌مندی‌ها اضافه نکرده‌اید</p>
              <button
                onClick={() => { navigateTo('products'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="inline-flex items-center gap-2 bg-charcoal text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-charcoal/80 transition-all duration-300"
              >
                مشاهده محصولات
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
