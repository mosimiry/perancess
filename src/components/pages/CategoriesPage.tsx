'use client';

import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import BreadcrumbNav from '@/components/shared/BreadcrumbNav';
import { useNavigationStore } from '@/lib/store';
import type { SiteData } from '@/types/siteData';

interface CategoriesPageProps {
  siteData: SiteData;
}

export default function CategoriesPage({ siteData }: CategoriesPageProps) {
  const { navigateTo, selectedCategorySlug } = useNavigationStore();

  const activeCategories = siteData.categories.filter((c) => c.active);

  const handleCategoryClick = (slug: string) => {
    navigateTo('products', undefined, slug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="pt-24 md:pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav items={[]} currentPage="دسته‌بندی‌ها" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl md:text-3xl font-bold text-charcoal mb-8">دسته‌بندی‌ها</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeCategories.map((cat, index) => (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                onClick={() => handleCategoryClick(cat.slug)}
                className={`group relative h-64 md:h-80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-500 text-right ${
                  selectedCategorySlug === cat.slug ? 'ring-2 ring-gold ring-offset-2' : ''
                }`}
              >
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-all duration-500 group-hover:from-black/80" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-white text-xl font-bold mb-2">{cat.name}</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-white/70 text-sm">{cat.productCount} محصول</p>
                    <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-gold transition-colors duration-300">
                      <ArrowLeft size={16} className="text-white" />
                    </span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </main>
  );
}