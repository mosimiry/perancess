'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, Loader2, MessageSquare } from 'lucide-react';
import BreadcrumbNav from '@/components/shared/BreadcrumbNav';
import { useContactMessages } from '@/hooks/useContactMessages';
import type { SiteData } from '@/types/siteData';

interface ContactPageProps {
  siteData: SiteData;
}

// A previously sent message shown below the contact form
interface SentMessage {
  id: string;
  name: string;
  subject: string;
  message: string;
  isRead: boolean; // status: false = unread (red), true = read (green)
  createdAt: string;
}

const formatDate = (date: string) =>
  new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(new Date(date));

export default function ContactPage({ siteData }: ContactPageProps) {
  const pageContent = siteData.pageContents.find((p) => p.slug === 'contact' && p.active);
  const { settings } = siteData;

  const heroTitle = pageContent?.heroTitle || 'تماس با ما';
  const heroSubtitle = pageContent?.heroSubtitle || 'خوشحال می‌شویم صدای شما را بشنویم';

  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Contact messages are persisted in localStorage (no backend).
  const { messages, addMessage } = useContactMessages();

  // Messages previously sent by the current user (matched by email).
  const sentMessages = useMemo(() => {
    const email = form.email.trim().toLowerCase();
    if (!email) return [];
    return messages.filter((m) => m.email.trim().toLowerCase() === email);
  }, [messages, form.email]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = 'نام الزامی است';
    if (!form.email.trim()) newErrors.email = 'ایمیل الزامی است';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'ایمیل نامعتبر است';
    if (!form.message.trim()) newErrors.message = 'پیام الزامی است';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    // Save the message to localStorage as UNREAD.
    addMessage({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      subject: form.subject.trim(),
      message: form.message.trim(),
    });
    setSubmitted(true);
    // Keep the email so the user immediately sees their message list below.
    setForm((f) => ({ ...f, name: '', phone: '', subject: '', message: '' }));
    setSubmitting(false);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const contactInfo = [
    { icon: MapPin, title: 'آدرس', value: settings.address || 'تهران، خیابان ولیعصر، پلاک ۱۲۳' },
    { icon: Phone, title: 'تلفن', value: settings.phone || '۰۲۱-۱۲۳۴۵۶۷۸', dir: 'ltr' as const },
    { icon: Mail, title: 'ایمیل', value: settings.email || 'info@perancess.ir', dir: 'ltr' as const },
    { icon: Clock, title: 'ساعات کاری', value: settings.working_hours || 'همه روزه ۱۰ صبح تا ۹ شب' },
  ];

  return (
    <main className="pt-20">
      {/* Hero */}
      <section className="relative h-72 md:h-96 bg-gradient-to-bl from-charcoal via-charcoal/90 to-rose/30 flex items-center justify-center">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <BreadcrumbNav items={[]} currentPage="تماس با ما" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-charcoal mb-6">ارسال پیام</h2>

              {submitted && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-50 text-green-700 rounded-xl p-4 mb-6 flex items-center gap-3 text-sm"
                >
                  <CheckCircle size={20} />
                  پیام شما با موفقیت ارسال شد. به زودی با شما تماس خواهیم گرفت.
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">نام و نام خانوادگی *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className={`w-full bg-muted/50 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold transition-all ${errors.name ? 'border-red-400' : 'border-border'}`}
                      placeholder="نام خود را وارد کنید"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">ایمیل *</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      dir="ltr"
                      className={`w-full bg-muted/50 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold transition-all text-left ${errors.email ? 'border-red-400' : 'border-border'}`}
                      placeholder="email@example.com"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">شماره تماس</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold transition-all"
                      placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">موضوع</label>
                    <input
                      type="text"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold transition-all"
                      placeholder="موضوع پیام"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">پیام *</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    rows={5}
                    className={`w-full bg-muted/50 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold transition-all resize-none ${errors.message ? 'border-red-400' : 'border-border'}`}
                    placeholder="پیام خود را بنویسید..."
                  />
                  {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-gold hover:bg-gold-dark disabled:opacity-60 text-white px-8 py-3 rounded-xl text-sm font-medium transition-all duration-300 hover:shadow-lg hover:shadow-gold/20 flex items-center gap-2"
                >
                  {submitting ? (
                    <><Loader2 size={16} className="animate-spin" />در حال ارسال...</>
                  ) : (
                    <><Send size={16} />ارسال پیام</>
                  )}
                </button>
              </form>

              {/* Sent messages list - shown below the form, with read/unread status */}
              {sentMessages.length > 0 && (
                <div className="mt-8 pt-6 border-t border-border">
                  <h3 className="text-base font-bold text-charcoal mb-4 flex items-center gap-2">
                    <MessageSquare size={18} className="text-gold" />
                    پیام‌های ارسالی شما
                  </h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto pl-1">
                    {sentMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`rounded-xl border p-4 ${msg.isRead ? 'border-emerald-200 bg-emerald-50/30' : 'border-red-200 bg-red-50/30'}`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <p className="font-medium text-sm text-charcoal">{msg.subject || 'بدون موضوع'}</p>
                          {/* Status badge: Red = Unread, Green = Read */}
                          <span className={`flex items-center gap-1.5 text-xs ${msg.isRead ? 'text-emerald-600' : 'text-red-600'}`}>
                            <span className={`w-2 h-2 rounded-full ${msg.isRead ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            {msg.isRead ? 'خوانده‌شده' : 'خوانده‌نشده'}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-6 mb-2">{msg.message}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(msg.createdAt)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {contactInfo.map((info) => (
              <div key={info.title} className="bg-white rounded-2xl p-6 shadow-sm flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                  <info.icon size={20} className="text-gold" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-charcoal mb-1">{info.title}</p>
                  <p className="text-sm text-muted-foreground leading-6" dir={info.dir}>{info.value}</p>
                </div>
              </div>
            ))}

            {/* Map placeholder */}
            <div className="bg-muted rounded-2xl h-48 flex items-center justify-center">
              <div className="text-center">
                <MapPin size={32} className="text-gold/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">نقشه فروشگاه</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
