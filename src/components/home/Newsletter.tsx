'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail('');
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  return (
    <section className="py-16 md:py-24 bg-charcoal relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-gold/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold/5 rounded-full translate-x-1/3 translate-y-1/3" />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            عضویت در خبرنامه
          </h2>
          <p className="text-sm md:text-base text-white/70 mb-8 leading-7">
            از جدیدترین محصولات و تخفیف‌های ویژه باخبر شوید
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ایمیل خود را وارد کنید"
              className="flex-1 bg-white/10 border border-white/20 rounded-full px-6 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all duration-300"
              dir="ltr"
              required
            />
            <Button
              type="submit"
              className="bg-gold hover:bg-gold-dark text-white px-8 py-3 rounded-full text-sm font-medium transition-all duration-300 shrink-0"
            >
              {submitted ? (
                <span className="flex items-center gap-2">
                  <CheckCircle size={16} />
                  ثبت شد
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send size={16} />
                  عضویت
                </span>
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}