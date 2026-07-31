'use client';

import { motion } from 'framer-motion';
import { Home, ArrowRight } from 'lucide-react';
import { useNavigationStore } from '@/lib/store';

export default function NotFoundPage() {
  const { navigateTo } = useNavigationStore();

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-8xl md:text-9xl font-bold text-gold/20 mb-4">۴۰۴</h1>
        <h2 className="text-xl md:text-2xl font-bold text-charcoal mb-4">صفحه مورد نظر یافت نشد</h2>
        <p className="text-sm md:text-base text-muted-foreground mb-8 max-w-md mx-auto leading-7">
          متأسفانه صفحه‌ای که به دنبال آن هستید وجود ندارد یا حذف شده است.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => { navigateTo('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="bg-gold hover:bg-gold-dark text-white px-8 py-3 rounded-full text-sm font-medium transition-all duration-300 hover:shadow-lg flex items-center gap-2"
          >
            <Home size={16} />
            بازگشت به خانه
          </button>
          <button
            onClick={() => { navigateTo('products'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="border border-border text-charcoal px-8 py-3 rounded-full text-sm font-medium hover:bg-muted transition-all duration-300 flex items-center gap-2"
          >
            <ArrowRight size={16} />
            محصولات
          </button>
        </div>
      </motion.div>
    </main>
  );
}