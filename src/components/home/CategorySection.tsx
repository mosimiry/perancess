'use client';

import { motion } from 'framer-motion';
import SectionTitle from '@/components/shared/SectionTitle';
import { useNavigationStore } from '@/lib/store';

interface CategorySectionProps {
  categories: { id: string; name: string; slug: string; imageUrl: string; productCount: number; active: boolean }[];
}

export default function CategorySection({ categories }: CategorySectionProps) {
  const { navigateTo } = useNavigationStore();

  const activeCategories = categories.filter((c) => c.active);

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle title="دسته‌بندی‌ها" subtitle="محصولات مورد علاقه خود را پیدا کنید" />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {activeCategories.map((cat, index) => (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              onClick={() => { navigateTo('categories', undefined, cat.slug); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-500"
            >
              <img
                src={cat.imageUrl}
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-all duration-500 group-hover:from-black/80" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-semibold text-sm md:text-base mb-1">{cat.name}</h3>
                <p className="text-white/70 text-xs">{cat.productCount} محصول</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}