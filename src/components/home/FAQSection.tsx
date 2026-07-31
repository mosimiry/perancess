'use client';

import { motion } from 'framer-motion';
import SectionTitle from '@/components/shared/SectionTitle';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface FAQSectionProps {
  faqs: { id: string; question: string; answer: string; active: boolean }[];
}

export default function FAQSection({ faqs }: FAQSectionProps) {
  const activeFaqs = faqs.filter((f) => f.active);

  if (activeFaqs.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle title="سوالات متداول" subtitle="پاسخ سوالات رایج شما" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {activeFaqs.map((faq) => (
              <AccordionItem
                key={faq.id}
                value={faq.id}
                className="bg-muted/50 rounded-xl px-6 border-0 data-[state=open]:bg-gold/5 data-[state=open]:shadow-sm transition-all duration-300"
              >
                <AccordionTrigger className="text-sm md:text-base font-semibold text-charcoal hover:text-gold hover:no-underline py-5 text-right">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-7 pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}