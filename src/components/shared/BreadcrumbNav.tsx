'use client';

import { ChevronLeft, Home } from 'lucide-react';
import { useNavigationStore } from '@/lib/store';

interface BreadcrumbItem {
  label: string;
  slug: string;
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
  currentPage: string;
}

export default function BreadcrumbNav({ items, currentPage }: BreadcrumbNavProps) {
  const { navigateTo } = useNavigationStore();

  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6" aria-label="مسیر ناوبری">
      <button
        onClick={() => { navigateTo('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        className="hover:text-gold transition-colors flex items-center gap-1"
      >
        <Home size={14} />
        <span>خانه</span>
      </button>
      {items.map((item) => (
        <span key={item.slug} className="flex items-center gap-2">
          <ChevronLeft size={14} className="rotate-180" />
          <button
            onClick={() => { navigateTo(item.slug as any); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="hover:text-gold transition-colors"
          >
            {item.label}
          </button>
        </span>
      ))}
      <span className="flex items-center gap-2">
        <ChevronLeft size={14} className="rotate-180" />
        <span className="text-foreground font-medium">{currentPage}</span>
      </span>
    </nav>
  );
}