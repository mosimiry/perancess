'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, Search, Heart, ShoppingBag } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { useNavigationStore } from '@/lib/store';
import { useFavorites } from '@/hooks/useFavorites';
import { useCart } from '@/hooks/useCart';
import UserMenu from './UserMenu';
import type { PageView } from '@/types';
import type { SiteData } from '@/types/siteData';
import Image from 'next/image';

interface NavbarProps {
  siteData: SiteData;
}

export default function Navbar({ siteData }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { currentPage, navigateTo } = useNavigationStore();
  const { count: favoritesCount } = useFavorites();
  const { count: cartCount } = useCart();

  const isHome = currentPage === 'home';
  // Transparent navbar only on homepage top
  const isTransparent = isHome && !scrolled;

  const settings = siteData?.settings || {};
  const logoUrl = settings.princess_logo_url || settings.logo_url || '/favicon.png';
  const brandName = settings.brand_name || 'پرنسس';
  // Navbar "Categories" label - editable from Admin Settings (nav_categories_label)
  const categoriesLabel = settings.nav_categories_label || 'دسته‌بندی‌ها';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNav = (slug: string) => {
    navigateTo(slug as PageView);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navbar items - "Products" sits BETWEEN Categories and About Us
  const navItems = [
    { label: 'خانه', slug: 'home' },
    { label: categoriesLabel, slug: 'categories' },
    { label: 'محصولات', slug: 'products' },
    { label: 'درباره ما', slug: 'about' },
    { label: 'تماس با ما', slug: 'contact' },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isTransparent
          ? 'bg-transparent'
          : 'bg-white/95 backdrop-blur-md shadow-sm'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.slug}
                onClick={() => handleNav(item.slug)}
                className={`relative text-sm font-medium transition-colors duration-300 py-1 ${
                  currentPage === item.slug
                    ? 'text-gold'
                    : isTransparent
                    ? 'text-white hover:text-gold-light'
                    : 'text-charcoal hover:text-gold'
                }`}
              >
                {item.label}
                {currentPage === item.slug && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute -bottom-1 right-0 left-0 h-0.5 bg-gold rounded-full"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Logo */}
          <button
            onClick={() => handleNav('home')}
            className="flex items-center gap-2"
          >
            {logoUrl.startsWith('/favicon') ? (
              <Image
                src={logoUrl}
                alt={brandName}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <img
                src={logoUrl}
                alt={brandName}
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
            )}
            <span
              className={`text-xl md:text-2xl font-bold transition-colors duration-300 ${
                isTransparent ? 'text-gold-light' : 'text-gold'
              }`}
            >
              {brandName}
            </span>
          </button>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => handleNav('products')}
              className={`p-2 rounded-full transition-colors duration-300 ${
                isTransparent
                  ? 'text-white hover:bg-white/10'
                  : 'text-charcoal hover:bg-muted'
              }`}
              aria-label="جستجو"
            >
              <Search size={20} />
            </button>
            <button
              onClick={() => handleNav('favorites')}
              className={`relative hidden md:flex p-2 rounded-full transition-colors duration-300 ${
                currentPage === 'favorites'
                  ? 'text-gold'
                  : isTransparent
                  ? 'text-white hover:bg-white/10'
                  : 'text-charcoal hover:bg-muted'
              }`}
              aria-label="علاقه‌مندی‌ها"
            >
              <Heart size={20} className={favoritesCount > 0 ? 'fill-current' : ''} />
              {favoritesCount > 0 && (
                <span className="absolute -top-0.5 -left-0.5 min-w-4 h-4 px-1 bg-gold text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </button>

            {/* User account */}
            <UserMenu isTransparent={isTransparent} />

            <button
              onClick={() => handleNav('cart')}
              className={`relative p-2 rounded-full transition-colors duration-300 ${
                currentPage === 'cart'
                  ? 'text-gold'
                  : isTransparent
                  ? 'text-white hover:bg-white/10'
                  : 'text-charcoal hover:bg-muted'
              }`}
              aria-label="سبد خرید"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -left-0.5 min-w-4 h-4 px-1 bg-gold text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button
                  className={`md:hidden p-2 rounded-full transition-colors duration-300 ${
                    isTransparent
                      ? 'text-white hover:bg-white/10'
                      : 'text-charcoal hover:bg-muted'
                  }`}
                  aria-label="منو"
                >
                  <Menu size={22} />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 bg-white p-0">
                <SheetTitle className="sr-only">منوی ناوبری</SheetTitle>
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between p-6 border-b border-border">
                    <div className="flex items-center gap-2">
                      {logoUrl.startsWith('/favicon') ? (
                        <Image src={logoUrl} alt={brandName} width={32} height={32} className="rounded-full" />
                      ) : (
                        <img src={logoUrl} alt={brandName} width={32} height={32} className="rounded-full object-cover" />
                      )}
                      <span className="text-lg font-bold text-gold">{brandName}</span>
                    </div>
                  </div>
                  <div className="flex-1 py-4">
                    {navItems.map((item) => (
                      <button
                        key={item.slug}
                        onClick={() => handleNav(item.slug)}
                        className={`w-full text-right px-6 py-3.5 text-base font-medium transition-colors duration-200 ${
                          currentPage === item.slug
                            ? 'text-gold bg-gold/5 border-r-2 border-gold'
                            : 'text-charcoal hover:text-gold hover:bg-muted/50'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                    {/* Favorites entry (mobile) */}
                    <button
                      onClick={() => handleNav('favorites')}
                      className={`w-full text-right px-6 py-3.5 text-base font-medium transition-colors duration-200 flex items-center justify-between ${
                        currentPage === 'favorites'
                          ? 'text-gold bg-gold/5 border-r-2 border-gold'
                          : 'text-charcoal hover:text-gold hover:bg-muted/50'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Heart size={18} className={favoritesCount > 0 ? 'fill-current text-gold' : ''} />
                        علاقه‌مندی‌ها
                      </span>
                      {favoritesCount > 0 && (
                        <span className="min-w-5 h-5 px-1.5 bg-gold text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {favoritesCount}
                        </span>
                      )}
                    </button>
                  </div>
                  <UserMenu isTransparent={false} variant="full" />
                  <div className="p-6 border-t border-border">
                    <p className="text-xs text-muted-foreground text-center">پرنسس بوتیک © ۱۴۰۳</p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </motion.header>
  );
}
