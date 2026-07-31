'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronRight, ChevronLeft, Quote } from 'lucide-react';
import SectionTitle from '@/components/shared/SectionTitle';

interface TestimonialsProps {
  testimonials: { id: string; name: string; text: string; rating: number; active: boolean }[];
}

export default function Testimonials({ testimonials }: TestimonialsProps) {
  const activeTestimonials = testimonials.filter((t) => t.active);
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((prev) => (prev + 1) % activeTestimonials.length);
  const prev = () => setCurrent((prev) => (prev - 1 + activeTestimonials.length) % activeTestimonials.length);

  if (activeTestimonials.length === 0) return null;

  const currentTestimonial = activeTestimonials[current];

  return (
    <section className="py-16 md:py-24 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle title="نظرات مشتریان" subtitle="آنچه مشتریان ما می‌گویند" />

        <div className="max-w-3xl mx-auto relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl p-8 md:p-10 shadow-sm"
            >
              <Quote size={32} className="text-gold/30 mb-4" />
              <p className="text-base md:text-lg leading-8 text-charcoal mb-6">
                {currentTestimonial.text}
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-charcoal">{currentTestimonial.name}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < currentTestimonial.rating ? 'text-gold fill-gold' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold font-bold text-lg">
                  {currentTestimonial.name.charAt(0)}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-charcoal hover:bg-gold hover:text-white hover:border-gold transition-all duration-300"
              aria-label="نظر قبلی"
            >
              <ChevronRight size={18} />
            </button>
            <div className="flex items-center gap-2">
              {activeTestimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`transition-all duration-300 rounded-full ${
                    i === current ? 'w-6 h-2 bg-gold' : 'w-2 h-2 bg-gold/30'
                  }`}
                  aria-label={`نظر ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-charcoal hover:bg-gold hover:text-white hover:border-gold transition-all duration-300"
              aria-label="نظر بعدی"
            >
              <ChevronLeft size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}