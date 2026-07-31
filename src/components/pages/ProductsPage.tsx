'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Grid3X3, LayoutGrid, Search, X } from 'lucide-react';
import BreadcrumbNav from '@/components/shared/BreadcrumbNav';
import ProductCard from '@/components/home/ProductCard';
import { useNavigationStore } from '@/lib/store';
import { transformApiProduct } from '@/lib/transformApiProduct';
import type { Product } from '@/types';
import type { SiteData } from '@/types/siteData';

type SortOption = 'newest' | 'cheapest' | 'expensive' | 'bestseller';

interface ProductsPageProps {
  siteData: SiteData;
}

export default function ProductsPage({ siteData }: ProductsPageProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [gridCols, setGridCols] = useState<2 | 3>(3);
  const { navigateTo, searchQuery, setSearchQuery } = useNavigationStore();

  const allProducts = useMemo(
    () => siteData.products.filter((p) => p.active).map((p) => transformApiProduct(p, siteData.categories)),
    [siteData]
  );

  const activeCategories = useMemo(
    () => siteData.categories.filter((c) => c.active),
    [siteData]
  );

  const handleProductClick = (product: Product) => {
    navigateTo('product-detail', product.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredProducts = useMemo(() => {
    let result = activeCategory === 'all'
      ? [...allProducts]
      : allProducts.filter((p) => p.categorySlug === activeCategory);

    // Search by product name OR productCode (case-insensitive)
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.productCode.toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case 'cheapest':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'expensive':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'bestseller':
        result.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
    }
    return result;
  }, [activeCategory, sortBy, allProducts, searchQuery]);

  const sortLabels: Record<SortOption, string> = {
    newest: 'جدیدترین',
    cheapest: 'ارزان‌ترین',
    expensive: 'گران‌ترین',
    bestseller: 'پرفروش‌ترین',
  };

  return (
    <main className="pt-24 md:pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav items={[]} currentPage="محصولات" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl md:text-3xl font-bold text-charcoal mb-8">همه محصولات</h1>

          {/* Search box: by product name or product code */}
          <div className="relative mb-8 max-w-xl">
            <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو بر اساس نام محصول یا کد محصول..."
              className="w-full bg-muted/60 border border-border rounded-full pr-11 pl-11 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-charcoal transition-colors"
                aria-label="پاک کردن جستجو"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            {/* Category filters */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeCategory === 'all'
                    ? 'bg-charcoal text-white'
                    : 'bg-muted text-charcoal hover:bg-charcoal/10'
                }`}
              >
                همه
              </button>
              {activeCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.slug)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    activeCategory === cat.slug
                      ? 'bg-charcoal text-white'
                      : 'bg-muted text-charcoal hover:bg-charcoal/10'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Sort & Grid */}
            <div className="flex items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-muted border-0 rounded-lg px-4 py-2 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-gold"
              >
                {Object.entries(sortLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <div className="hidden md:flex items-center gap-1 bg-muted rounded-lg p-1">
                <button
                  onClick={() => setGridCols(2)}
                  className={`p-2 rounded-md transition-colors text-charcoal ${gridCols === 2 ? 'bg-white shadow-sm' : 'hover:text-gold'}`}
                  aria-label="دو ستونه"
                >
                  <Grid3X3 size={16} />
                </button>
                <button
                  onClick={() => setGridCols(3)}
                  className={`p-2 rounded-md transition-colors text-charcoal ${gridCols === 3 ? 'bg-white shadow-sm' : 'hover:text-gold'}`}
                  aria-label="سه ستونه"
                >
                  <LayoutGrid size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Results count */}
          <p className="text-sm text-muted-foreground mb-6">
            {filteredProducts.length} محصول یافت شد
          </p>

          {/* Product Grid */}
          {filteredProducts.length > 0 ? (
            <div className={`grid gap-4 md:gap-6 ${
              gridCols === 2 ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-2 md:grid-cols-3'
            }`}>
              {filteredProducts.map((product, index) => (
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
              <p className="text-lg text-muted-foreground mb-4">محصولی یافت نشد</p>
              <button
                onClick={() => setActiveCategory('all')}
                className="text-gold hover:underline text-sm"
              >
                مشاهده همه محصولات
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}