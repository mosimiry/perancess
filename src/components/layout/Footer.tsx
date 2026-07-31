'use client';

import { Instagram, Send, Phone, MapPin, Clock, Mail, Copy, Check } from 'lucide-react';
import { useNavigationStore } from '@/lib/store';
import type { PageView } from '@/types';
import type { SiteData } from '@/types/siteData';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface FooterProps {
  siteData: SiteData;
}

export default function Footer({ siteData }: FooterProps) {
  const { navigateTo } = useNavigationStore();
  const { toast } = useToast();
  const [phoneCopied, setPhoneCopied] = useState(false);

  const settings = siteData?.settings || {};
  const footerServiceItems = siteData?.footerServiceItems || [];

  const logoUrl = settings.princess_logo_url || settings.logo_url || '/favicon.png';
  const brandName = settings.brand_name || 'پرنسس';
  const brandDescription = settings.brand_description || 'پرنسس بوتیک، مرجع خرید لباس زنانه لوکس و شیک. ما با ارائه مجموعه‌ای از بهترین برندهای مد و فشن، تجربه خریدی منحصربه‌فرد را برای شما فراهم می‌کنیم.';
  const phone = settings.phone || '۰۲۱-۱۲۳۴۵۶۷۸';
  const email = settings.email || 'info@perancess.ir';
  const address = settings.address || 'تهران، خیابان ولیعصر، پلاک ۱۲۳';
  const workingHours = settings.working_hours || 'همه روزه ۱۰ - ۲۱';
  const instagramUrl = settings.instagram_url || '#';
  const telegramUrl = settings.telegram_url || '#';
  const whatsappNumber = settings.whatsapp || '982112345678';

  const handleNav = (slug: string) => {
    navigateTo(slug as PageView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigate to a dynamic footer page using its slug
  const handleFooterPage = (slug: string) => {
    navigateTo('footer-page', undefined, undefined, slug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const copyPhone = () => {
    navigator.clipboard.writeText(phone).then(() => {
      setPhoneCopied(true);
      toast({ title: 'کپی شد', description: 'شماره تلفن در کلیپبورد کپی شد.' });
      setTimeout(() => setPhoneCopied(false), 2000);
    });
  };

  const renderLogo = (size: number) => {
    if (logoUrl.startsWith('/favicon')) {
      return <img src={logoUrl} alt={brandName} width={size} height={size} className="rounded-full" />;
    }
    return <img src={logoUrl} alt={brandName} width={size} height={size} className="rounded-full object-cover" />;
  };

  return (
    <footer className="bg-charcoal text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              {renderLogo(36)}
              <span className="text-xl font-bold text-gold">{brandName}</span>
            </div>
            <p className="text-sm leading-7 text-white/70 mb-6">
              {brandDescription}
            </p>
            <div className="flex items-center gap-3">
              {instagramUrl !== '#' && (
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold transition-colors duration-300" aria-label="اینستاگرام">
                  <Instagram size={16} />
                </a>
              )}
              {telegramUrl !== '#' && (
                <a href={telegramUrl} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold transition-colors duration-300" aria-label="تلگرام">
                  <Send size={16} />
                </a>
              )}
              {whatsappNumber && (
                <a href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold transition-colors duration-300" aria-label="واتساپ">
                  <Phone size={16} />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-base font-semibold text-gold mb-5">دسترسی سریع</h3>
            <ul className="space-y-3">
              {[
                { label: 'خانه', slug: 'home' },
                { label: 'محصولات', slug: 'products' },
                { label: 'دسته‌بندی‌ها', slug: 'categories' },
                { label: 'درباره ما', slug: 'about' },
                { label: 'تماس با ما', slug: 'contact' },
              ].map((item) => (
                <li key={item.slug}>
                  <button
                    onClick={() => handleNav(item.slug)}
                    className="text-sm text-white/70 hover:text-gold transition-colors duration-200"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service - each item links to its footer page */}
          <div>
            <h3 className="text-base font-semibold text-gold mb-5">خدمات مشتریان</h3>
            <ul className="space-y-3">
              {footerServiceItems.length > 0 ? (
                footerServiceItems.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => handleFooterPage(item.slug)}
                      className="text-sm text-white/70 hover:text-gold transition-colors duration-200 text-right"
                    >
                      {item.title}
                    </button>
                  </li>
                ))
              ) : (
                <>
                  {['نحوه ارسال', 'شرایط مرجوعی', 'راهنمای سایز', 'سیاست حریم خصوصی', 'سوالات متداول'].map((item) => (
                    <li key={item}>
                      <span className="text-sm text-white/70 transition-colors duration-200">
                        {item}
                      </span>
                    </li>
                  ))}
                </>
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-base font-semibold text-gold mb-5">ارتباط با ما</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-gold mt-1 shrink-0" />
                <span className="text-sm text-white/70 leading-6">{address}</span>
              </li>
              <li
                className="flex items-center gap-3 cursor-pointer group"
                onClick={copyPhone}
                title="کپی شماره تلفن"
              >
                <div className="relative">
                  <Phone size={16} className="text-gold shrink-0" />
                  {phoneCopied && (
                    <Check size={10} className="text-emerald-400 absolute -top-1 -right-1" />
                  )}
                </div>
                <span className="text-sm text-white/70 group-hover:text-gold transition-colors" dir="ltr">{phone}</span>
                <Copy size={12} className="text-white/40 group-hover:text-gold transition-colors shrink-0" />
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-gold shrink-0" />
                <a href={`mailto:${email}`} className="text-sm text-white/70 hover:text-gold transition-colors duration-200" dir="ltr">{email}</a>
              </li>
              <li className="flex items-center gap-3">
                <Clock size={16} className="text-gold shrink-0" />
                <span className="text-sm text-white/70">{workingHours}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/50">
              © ۱۴۰۳ {brandName}. تمامی حقوق محفوظ است.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-xs text-white/50">پرداخت امن</span>
              <span className="text-xs text-white/50">ارسال سریع</span>
              <span className="text-xs text-white/50">ضمانت اصالت</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}