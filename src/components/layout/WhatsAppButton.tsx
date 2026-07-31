'use client';

import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import type { SiteData } from '@/types/siteData';

interface WhatsAppButtonProps {
  siteData: SiteData;
}

export default function WhatsAppButton({ siteData }: WhatsAppButtonProps) {
  const settings = siteData?.settings || {};
  const whatsappNumber = settings.whatsapp || '982112345678';
  const cleanNumber = whatsappNumber.replace(/\D/g, '');
  const href = `https://wa.me/${cleanNumber}`;

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 left-6 z-40 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 group"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      aria-label="تماس از طریق واتساپ"
    >
      <MessageCircle size={26} className="text-white" />
      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full">
        <span className="absolute inset-0 rounded-full bg-red-500 animate-ping" />
      </span>
    </motion.a>
  );
}