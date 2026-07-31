'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Lock, MapPin, ShoppingBag, AlertCircle } from 'lucide-react';
import BreadcrumbNav from '@/components/shared/BreadcrumbNav';
import LoginModal from '@/components/auth/LoginModal';
import { Button } from '@/components/ui/button';
import { useNavigationStore } from '@/lib/store';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/data';

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  province: string;
  city: string;
  street: string;
  alley: string;
  plate: string;
}

const emptyForm: FormState = {
  firstName: '', lastName: '', email: '', phone: '',
  province: '', city: '', street: '', alley: '', plate: '',
};

export default function CheckoutPage() {
  const { navigateTo } = useNavigationStore();
  const { user } = useAuth();
  const { items, total } = useCart();

  const [loginOpen, setLoginOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  // Prefill name/email from the authenticated user (fields start empty otherwise)
  useEffect(() => {
    if (user) {
      const parts = (user.name || '').trim().split(' ');
      setForm((f) => ({
        ...f,
        email: f.email || user.email,
        firstName: f.firstName || (parts[0] || ''),
        lastName: f.lastName || (parts.slice(1).join(' ') || ''),
      }));
    }
  }, [user]);

  const set = (k: keyof FormState, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = 'نام الزامی است';
    if (!form.lastName.trim()) e.lastName = 'نام خانوادگی الزامی است';
    if (!form.email.trim()) e.email = 'ایمیل الزامی است';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'ایمیل نامعتبر است';
    // Phone: exactly 11 digits, must start with 0
    if (!/^0\d{10}$/.test(form.phone.trim())) e.phone = 'شماره تماس باید ۱۱ رقم و با ۰ شروع شود';
    if (!form.province.trim()) e.province = 'استان الزامی است';
    if (!form.city.trim()) e.city = 'شهر الزامی است';
    if (!form.street.trim()) e.street = 'خیابان الزامی است';
    if (!form.plate.trim()) e.plate = 'پلاک الزامی است';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePay = async () => {
    setServerError('');
    if (items.length === 0) {
      setServerError('سبد خرید خالی است');
      return;
    }
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/payment/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: form,
          items: items.map((i) => ({
            productId: i.productId,
            productCode: i.productCode,
            productName: i.name,
            color: i.color || '',
            size: i.size || '',
            quantity: i.quantity,
            price: i.price,
          })),
        }),
      });
      const data = await res.json();
      if (res.ok && data?.url) {
        // Redirect to the Zarinpal payment gateway
        window.location.href = data.url;
        return;
      }
      setServerError(data?.error || 'خطا در ایجاد پرداخت');
    } catch {
      setServerError('خطای شبکه. لطفاً دوباره تلاش کنید.');
    } finally {
      setSubmitting(false);
    }
  };

  const field = (
    key: keyof FormState,
    label: string,
    opts: { dir?: 'ltr' | 'rtl'; placeholder?: string; type?: string } = {}
  ) => (
    <div>
      <label className="block text-sm font-medium text-charcoal mb-2">{label}</label>
      <input
        type={opts.type || 'text'}
        value={form[key]}
        onChange={(e) => set(key, e.target.value)}
        dir={opts.dir}
        placeholder={opts.placeholder}
        className={`w-full bg-muted/50 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold transition-all ${
          errors[key] ? 'border-red-400' : 'border-border'
        }`}
      />
      {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
    </div>
  );

  return (
    <main className="pt-24 md:pt-28 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav items={[]} currentPage="تکمیل خرید" />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-2xl md:text-3xl font-bold text-charcoal mb-8">تکمیل خرید و پرداخت</h1>

          {/* AUTH GATE: force login/registration before continuing */}
          {!user ? (
            <div className="bg-white rounded-2xl border border-border/60 p-8 text-center max-w-lg mx-auto">
              <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center">
                <Lock className="w-6 h-6 text-gold" />
              </div>
              <h2 className="text-lg font-bold text-charcoal mb-2">برای ادامه وارد شوید</h2>
              <p className="text-sm text-muted-foreground mb-6">
                برای تکمیل خرید ابتدا باید وارد حساب کاربری خود شوید یا ثبت‌نام کنید.
              </p>
              <Button onClick={() => setLoginOpen(true)} className="bg-gold hover:bg-gold-dark text-white">
                ورود / ثبت‌نام
              </Button>
              <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <ShoppingBag className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="text-lg text-muted-foreground mb-4">سبد خرید شما خالی است</p>
              <button
                onClick={() => { navigateTo('products'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="text-gold hover:underline text-sm"
              >
                مشاهده محصولات
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* User info form */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-border/60 p-6 md:p-8 space-y-5">
                <h2 className="text-lg font-bold text-charcoal">اطلاعات خریدار</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {field('firstName', 'نام *')}
                  {field('lastName', 'نام خانوادگی *')}
                  {field('email', 'ایمیل *', { dir: 'ltr', placeholder: 'email@example.com', type: 'email' })}
                  {field('phone', 'شماره تماس *', { dir: 'ltr', placeholder: '09123456789' })}
                </div>

                <div className="pt-2">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin size={18} className="text-gold" />
                    <h3 className="text-sm font-bold text-charcoal">آدرس تحویل</h3>
                  </div>
                  {/* Address format guide */}
                  <div className="flex items-start gap-2 bg-gold/5 text-charcoal/80 rounded-lg p-3 text-xs mb-4">
                    <AlertCircle size={14} className="text-gold mt-0.5 flex-shrink-0" />
                    <span>راهنما: لطفاً آدرس را به‌صورت جداگانه وارد کنید — استان، شهر، خیابان، کوچه و پلاک.</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {field('province', 'استان *', { placeholder: 'مثلاً تهران' })}
                    {field('city', 'شهر *', { placeholder: 'مثلاً تهران' })}
                    {field('street', 'خیابان *', { placeholder: 'مثلاً ولیعصر' })}
                    {field('alley', 'کوچه', { placeholder: 'مثلاً کوچه بهار' })}
                    {field('plate', 'پلاک *', { placeholder: 'مثلاً ۱۲۳', dir: 'ltr' })}
                  </div>
                </div>

                {serverError && (
                  <div className="bg-red-50 text-red-700 rounded-xl p-3 text-sm flex items-center gap-2">
                    <AlertCircle size={16} />
                    {serverError}
                  </div>
                )}
              </div>

              {/* Summary + Pay */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl border border-border/60 p-6 sticky top-28 space-y-4">
                  <h2 className="text-lg font-bold text-charcoal">خلاصه پرداخت</h2>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {items.map((i) => (
                      <div key={i.productId} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground truncate ml-2">{i.name} × {i.quantity}</span>
                        <span className="text-charcoal whitespace-nowrap">{formatPrice(i.price * i.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-sm pt-4 border-t border-border">
                    <span className="text-muted-foreground">مبلغ قابل پرداخت</span>
                    <span className="font-bold text-charcoal">{formatPrice(total)}</span>
                  </div>
                  <Button
                    onClick={handlePay}
                    disabled={submitting}
                    className="w-full bg-gold hover:bg-gold-dark text-white"
                  >
                    {submitting ? (
                      <><Loader2 size={16} className="animate-spin ml-2" />در حال انتقال به درگاه...</>
                    ) : (
                      <>پرداخت</>
                    )}
                  </Button>
                  <p className="text-[11px] text-muted-foreground text-center">پرداخت امن از طریق درگاه زرین‌پال</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
