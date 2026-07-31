'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigationStore } from '@/lib/store';
import { useSiteData } from '@/hooks/useSiteData';

// Layout
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/layout/WhatsAppButton';

// Home Sections
import Hero from '@/components/home/Hero';
import CategorySection from '@/components/home/CategorySection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import Testimonials from '@/components/home/Testimonials';
import FAQSection from '@/components/home/FAQSection';
import InstagramGallery from '@/components/home/InstagramGallery';
import Newsletter from '@/components/home/Newsletter';

// Page Views
import ProductsPage from '@/components/pages/ProductsPage';
import CategoriesPage from '@/components/pages/CategoriesPage';
import ProductDetailPage from '@/components/pages/ProductDetailPage';
import AboutPage from '@/components/pages/AboutPage';
import ContactPage from '@/components/pages/ContactPage';
import FavoritesPage from '@/components/pages/FavoritesPage';
import ProfilePage from '@/components/pages/ProfilePage';
import CartPage from '@/components/pages/CartPage';
import CheckoutPage from '@/components/pages/CheckoutPage';
import FooterPage from '@/components/pages/FooterPage';
import NotFoundPage from '@/components/pages/NotFoundPage';

import type { SiteData } from '@/types/siteData';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

function HomePage({ siteData }: { siteData: SiteData }) {
  return (
    <>
      <Hero slides={siteData.slides} />
      <CategorySection categories={siteData.categories} />
      <FeaturedProducts products={siteData.products} categories={siteData.categories} />
      <Testimonials testimonials={siteData.testimonials} />
      <FAQSection faqs={siteData.faqs} />
      <InstagramGallery images={siteData.instagramImages} />
      <Newsletter />
    </>
  );
}

function PageRouter({ siteData }: { siteData: SiteData }) {
  const { currentPage } = useNavigationStore();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentPage}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.35, ease: 'easeInOut' }}
      >
        {currentPage === 'home' && <HomePage siteData={siteData} />}
        {currentPage === 'products' && <ProductsPage siteData={siteData} />}
        {currentPage === 'categories' && <CategoriesPage siteData={siteData} />}
        {currentPage === 'product-detail' && <ProductDetailPage siteData={siteData} />}
        {currentPage === 'about' && <AboutPage siteData={siteData} />}
        {currentPage === 'contact' && <ContactPage siteData={siteData} />}
        {currentPage === 'favorites' && <FavoritesPage siteData={siteData} />}
        {currentPage === 'profile' && <ProfilePage />}
        {currentPage === 'cart' && <CartPage />}
        {currentPage === 'checkout' && <CheckoutPage />}
        {currentPage === 'footer-page' && <FooterPage siteData={siteData} />}
        {currentPage === 'not-found' && <NotFoundPage />}
      </motion.div>
    </AnimatePresence>
  );
}

export default function AppPage() {
  const { currentPage } = useNavigationStore();
  const { data: siteData, loading } = useSiteData();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [currentPage]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="w-10 h-10 border-3 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar siteData={siteData} />
      <div className="flex-1">
        <PageRouter siteData={siteData} />
      </div>
      <Footer siteData={siteData} />
      <WhatsAppButton siteData={siteData} />
    </div>
  );
}