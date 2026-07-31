'use client';

import { motion } from 'framer-motion';
import { Instagram } from 'lucide-react';
import SectionTitle from '@/components/shared/SectionTitle';

interface InstagramGalleryProps {
  images: { id: string; imageUrl: string; alt: string; active: boolean }[];
}

export default function InstagramGallery({ images }: InstagramGalleryProps) {
  const activeImages = images.filter((img) => img.active);

  if (activeImages.length === 0) return null;

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle title="ما را در اینستاگرام دنبال کنید" subtitle="@perancess_boutique" />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          {activeImages.map((img, index) => (
            <motion.a
              key={img.id}
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              whileHover={{ scale: 1.03 }}
              className="group relative aspect-square rounded-xl overflow-hidden"
            >
              <img
                src={img.imageUrl}
                alt={img.alt}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-500 flex items-center justify-center">
                <Instagram size={28} className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}