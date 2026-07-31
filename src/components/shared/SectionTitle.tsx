'use client';

import { motion } from 'framer-motion';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  light?: boolean;
}

export default function SectionTitle({ title, subtitle, centered = true, light = false }: SectionTitleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`mb-10 md:mb-14 ${centered ? 'text-center' : ''}`}
    >
      <h2
        className={`text-2xl md:text-3xl lg:text-4xl font-bold mb-3 ${
          light ? 'text-white' : 'text-charcoal'
        }`}
      >
        {title}
      </h2>
      <div className={`flex items-center gap-3 ${centered ? 'justify-center' : ''}`}>
        <span className="block w-8 h-0.5 bg-gold" />
        <span className="block w-2 h-2 rounded-full bg-gold" />
        <span className="block w-8 h-0.5 bg-gold" />
      </div>
      {subtitle && (
        <p
          className={`mt-4 text-sm md:text-base max-w-xl ${centered ? 'mx-auto' : ''} ${
            light ? 'text-white/70' : 'text-muted-foreground'
          }`}
        >
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}