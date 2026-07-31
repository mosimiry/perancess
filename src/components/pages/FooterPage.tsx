'use client';

import { motion } from 'framer-motion';
import BreadcrumbNav from '@/components/shared/BreadcrumbNav';
import { useNavigationStore } from '@/lib/store';
import type { SiteData } from '@/types/siteData';

interface FooterPageProps {
  siteData: SiteData;
}

// Renders a dynamic footer page (e.g. shipping, returns, privacy)
// Each footer page has an H1 title and a list of H3 sections with content.
export default function FooterPage({ siteData }: FooterPageProps) {
  const { selectedFooterPageSlug, navigateTo } = useNavigationStore();

  // Find the footer service item matching the selected slug
  const page = siteData.footerServiceItems.find((i) => i.slug === selectedFooterPageSlug);

  // Parse the JSON sections array
  let sections: { title: string; content: string }[] = [];
  try {
    sections = JSON.parse(page?.content || '[]');
  } catch {
    sections = [];
  }

  if (!page) {
    return (
      <main className="pt-24 md:pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          <p className="text-xl text-muted-foreground">صفحه مورد نظر یافت نشد</p>
          <button
            onClick={() => { navigateTo('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="mt-4 text-gold hover:underline"
          >
            بازگشت به خانه
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-24 md:pt-28 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav items={[]} currentPage={page.title} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* H1 page title */}
          <h1 className="text-2xl md:text-3xl font-bold text-charcoal mb-8">{page.title}</h1>

          {/* H3 sections with their content */}
          {sections.length > 0 ? (
            <div className="space-y-8">
              {sections.map((sec, i) => (
                <motion.section
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="bg-white rounded-2xl p-6 md:p-8 shadow-sm"
                >
                  {sec.title && (
                    <h2 className="text-lg md:text-xl font-bold text-charcoal mb-4">{sec.title}</h2>
                  )}
                  <div className="text-sm md:text-base text-muted-foreground leading-8 whitespace-pre-wrap">
                    {sec.content}
                  </div>
                </motion.section>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm text-center text-muted-foreground">
              محتوایی برای این صفحه ثبت نشده است.
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
