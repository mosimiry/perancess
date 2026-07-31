'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigationStore } from '@/lib/store';

interface HeroProps {
  slides: { id: string; title: string; subtitle: string; imageUrl: string; order: number; active: boolean }[];
}

const fallbackSlides = [
  { id: 'fallback-1', title: 'زیبایی شما، سبک ما', subtitle: 'مجموعه‌ای منحصربه‌فرد از لباس‌های لوکس زنانه', imageUrl: '/images/hero-1.png', order: 0, active: true },
  { id: 'fallback-2', title: 'شیک و خاص باشید', subtitle: 'جدیدترین کالکشن فصل با بهترین کیفیت', imageUrl: '/images/hero-2.png', order: 1, active: true },
];

export default function Hero({ slides }: HeroProps) {
  const activeSlides = (slides && slides.length > 0 ? slides : fallbackSlides).filter((s) => s.active);
  const [current, setCurrent] = useState(0);
  const { navigateTo } = useNavigationStore();

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % activeSlides.length);
  }, [activeSlides.length]);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const slide = activeSlides[current];

  return (
    <section className="relative h-screen min-h-[600px] max-h-[900px] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0"
        >
          <img
            src={slide.imageUrl}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-black/60 via-black/40 to-black/30" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-2xl"
            >
              <motion.p
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="text-gold-light text-sm md:text-base font-medium tracking-wider mb-4"
              >
                پرنسس بوتیک
              </motion.p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                {slide.title}
              </h1>
              <p className="text-base md:text-lg text-white/80 mb-8 leading-8">
                {slide.subtitle}
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={() => { navigateTo('products'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="bg-charcoal hover:bg-charcoal/80 text-white px-8 py-3 rounded-full text-sm font-medium transition-all duration-300 hover:shadow-lg"
                >
                  مشاهده مجموعه
                </Button>
                <Button
                  onClick={() => { navigateTo('about'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  variant="outline"
                  className="bg-charcoal/70 border-charcoal text-white hover:bg-charcoal hover:text-white px-8 py-3 rounded-full text-sm font-medium transition-all duration-300"
                >
                  درباره ما
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
        {activeSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`transition-all duration-300 rounded-full ${
              i === current ? 'w-8 h-2 bg-gold' : 'w-2 h-2 bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`اسلاید ${i + 1}`}
          />
        ))}
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
      >
        <ChevronDown size={24} className="text-white/60" />
      </motion.div>
    </section>
  );
}