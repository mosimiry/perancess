'use client';

import { motion } from 'framer-motion';
import { Award, Gem, Heart, Star, Users, TrendingUp } from 'lucide-react';
import BreadcrumbNav from '@/components/shared/BreadcrumbNav';
import type { SiteData } from '@/types/siteData';

const features = [
  { icon: Gem, title: 'کیفیت برتر', description: 'استفاده از بهترین پارچه‌ها و متریال‌های لوکس برای تولید لباس‌های با دوام و زیبا.' },
  { icon: Star, title: 'طراحی منحصربه‌فرد', description: 'هر قطعه لباس با دقت و خلاقیت طراحی شده تا شما را متمایز کند.' },
  { icon: Heart, title: 'خدمات ویژه', description: 'تیم پشتیبانی ما همیشه آماده پاسخگویی و راهنمایی به شما عزیزان است.' },
];

const stats = [
  { number: '۵+', label: 'سال تجربه' },
  { number: '۱۰۰۰+', label: 'مشتری راضی' },
  { number: '۲۰۰+', label: 'محصول منحصربه‌فرد' },
  { number: '۹۸٪', label: 'رضایت مشتریان' },
];

interface AboutPageProps {
  siteData: SiteData;
}

export default function AboutPage({ siteData }: AboutPageProps) {
  const pageContent = siteData.pageContents.find((p) => p.slug === 'about' && p.active);

  const heroTitle = pageContent?.heroTitle || 'درباره ما';
  const heroSubtitle = pageContent?.heroSubtitle || 'داستان پرنسس بوتیک، از عشق به مد و فشن آغاز شد';

  return (
    <main className="pt-20">
      {/* Hero */}
      <section className="relative h-72 md:h-96 bg-gradient-to-bl from-charcoal via-charcoal/90 to-gold/30 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center px-4"
        >
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">{heroTitle}</h1>
          <p className="text-white/80 text-sm md:text-base max-w-xl mx-auto leading-7">
            {heroSubtitle}
          </p>
        </motion.div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 md:py-24">
          <BreadcrumbNav items={[]} currentPage="درباره ما" />

          {/* Story / Dynamic Content */}
          {pageContent?.content ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center mb-16"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-charcoal mb-6">داستان ما</h2>
              {pageContent.content.split('\n').filter(Boolean).map((paragraph, i) => (
                <p key={i} className="text-sm md:text-base text-muted-foreground leading-8 mb-4">
                  {paragraph}
                </p>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center mb-16"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-charcoal mb-6">داستان ما</h2>
              <p className="text-sm md:text-base text-muted-foreground leading-8 mb-4">
                پرنسس بوتیک در سال ۱۳۹۸ با هدف ارائه بهترین و باکیفیت‌ترین لباس‌های زنانه تأسیس شد. ما معتقدیم هر زنی شایسته پوشیدن لباس‌هایی است که او را زیباتر و اعتمادبه‌نفس‌تر کند.
              </p>
              <p className="text-sm md:text-base text-muted-foreground leading-8">
                تیم ما با دقت هر قطعه لباس را انتخاب و بررسی می‌کند تا مطمئن شود بالاترین استانداردهای کیفیت را دارد. ما به تنوع، سبک و راحتی اهمیت ویژه‌ای می‌دهیم.
              </p>
            </motion.div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center p-6 bg-white rounded-2xl shadow-sm"
              >
                <p className="text-2xl md:text-3xl font-bold text-gold mb-1">{stat.number}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="text-center p-8 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-5">
                  <feature.icon size={28} className="text-gold" />
                </div>
                <h3 className="text-lg font-semibold text-charcoal mb-3">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-7">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}