'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { UserCircle, Mail, User as UserIcon, Heart, LogOut, CalendarDays, Package, Loader2, Truck } from 'lucide-react';
import BreadcrumbNav from '@/components/shared/BreadcrumbNav';
import { Button } from '@/components/ui/button';
import { useNavigationStore } from '@/lib/store';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { useToast } from '@/hooks/use-toast';

// Order shape returned by /api/orders
interface OrderItem {
  id: string;
  productCode: string;
  productName: string;
  color: string;
  size: string;
  quantity: number;
  price: number;
  totalPrice: number;
}
interface Order {
  id: string;
  totalPrice: number;
  paymentStatus: string;
  orderStatus: string;
  trackingCode: string | null;
  createdAt: string;
  items: OrderItem[];
}

const ORDER_STATUS_LABELS: Record<string, string> = {
  preparing: 'در حال آماده‌سازی',
  shipping: 'در حال ارسال',
  delivered: 'تحویل داده شده',
};

const ORDER_STATUS_STYLES: Record<string, string> = {
  preparing: 'bg-amber-100 text-amber-700',
  shipping: 'bg-blue-100 text-blue-700',
  delivered: 'bg-emerald-100 text-emerald-700',
};

const formatPrice = (n: number) => new Intl.NumberFormat('fa-IR').format(n) + ' تومان';
const formatDate = (d: string) =>
  new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(d));

export default function ProfilePage() {
  const { navigateTo } = useNavigationStore();
  const { user, logout } = useAuth();
  const { count } = useFavorites();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Fetch the logged-in user's own orders (security: filtered by their email)
  useEffect(() => {
    if (!user?.email) return;
    setLoadingOrders(true);
    fetch(`/api/orders?email=${encodeURIComponent(user.email)}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]))
      .finally(() => setLoadingOrders(false));
  }, [user?.email]);

  // If not logged in, send the user back home.
  useEffect(() => {
    if (mounted && !user) {
      navigateTo('home');
    }
  }, [mounted, user, navigateTo]);

  if (!mounted || !user) return null;

  const displayName = user.name?.trim() || user.email.split('@')[0];

  const handleLogout = () => {
    logout();
    toast({ title: 'خارج شدید', description: 'با موفقیت از حساب خود خارج شدید.' });
    navigateTo('home');
  };

  return (
    <main className="pt-24 md:pt-28 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav items={[]} currentPage="پروفایل من" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl md:text-3xl font-bold text-charcoal mb-8">پروفایل من</h1>

          <div className="bg-white rounded-2xl border border-border/60 overflow-hidden shadow-sm">
            {/* Header banner */}
            <div className="bg-gradient-to-l from-gold to-gold-dark px-6 py-8 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center">
                <UserCircle className="text-white" size={36} />
              </div>
              <div className="min-w-0">
                <p className="text-xl font-bold text-white truncate">{displayName}</p>
                <p className="text-sm text-white/85 truncate" dir="ltr">{user.email}</p>
              </div>
            </div>

            {/* Info rows */}
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 rounded-xl bg-muted/50 px-4 py-3">
                <UserIcon size={18} className="text-gold" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">نام</p>
                  <p className="text-sm font-medium text-charcoal">{user.name?.trim() || '—'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-muted/50 px-4 py-3">
                <Mail size={18} className="text-gold" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">ایمیل</p>
                  <p className="text-sm font-medium text-charcoal truncate" dir="ltr">{user.email}</p>
                </div>
              </div>

              <button
                onClick={() => { navigateTo('favorites'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="w-full flex items-center gap-3 rounded-xl bg-muted/50 px-4 py-3 hover:bg-muted transition-colors text-right"
              >
                <Heart size={18} className="text-gold" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">علاقه‌مندی‌ها</p>
                  <p className="text-sm font-medium text-charcoal">{count} محصول</p>
                </div>
              </button>

              <div className="flex items-center gap-3 rounded-xl bg-muted/50 px-4 py-3">
                <CalendarDays size={18} className="text-gold" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">وضعیت حساب</p>
                  <p className="text-sm font-medium text-emerald-600">فعال</p>
                </div>
              </div>

              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full text-destructive border-destructive/30 hover:bg-destructive/5 hover:text-destructive"
              >
                <LogOut size={16} className="ml-2" />
                خروج از حساب
              </Button>
            </div>
          </div>

          {/* My Orders */}
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <Package size={20} className="text-gold" />
              <h2 className="text-lg font-bold text-charcoal">سفارش‌های من</h2>
            </div>

            {loadingOrders ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground gap-2">
                <Loader2 size={16} className="animate-spin" /> در حال بارگذاری سفارش‌ها...
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-2xl border border-border/60 text-muted-foreground">
                هنوز سفارشی ثبت نکرده‌اید
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white rounded-2xl border border-border/60 p-5">
                    <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground" dir="ltr">#{order.id.slice(-8)}</span>
                        <span className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</span>
                      </div>
                      <span className={`text-xs font-medium px-3 py-1 rounded-full ${ORDER_STATUS_STYLES[order.orderStatus] || 'bg-muted text-charcoal'}`}>
                        {ORDER_STATUS_LABELS[order.orderStatus] || order.orderStatus}
                      </span>
                    </div>
                    <div className="divide-y divide-border/40">
                      {order.items.map((it) => (
                        <div key={it.id} className="flex items-center justify-between py-2 text-sm">
                          <div className="min-w-0">
                            <p className="text-charcoal truncate">{it.productName}</p>
                            <p className="text-xs text-muted-foreground" dir="ltr">کد: {it.productCode} × {it.quantity}</p>
                            {(it.size || it.color) && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {it.size && <span>سایز: {it.size}</span>}
                                {it.size && it.color && <span> • </span>}
                                {it.color && <span>رنگ: {it.color}</span>}
                              </p>
                            )}
                          </div>
                          <span className="text-charcoal whitespace-nowrap">{formatPrice(it.totalPrice)}</span>
                        </div>
                      ))}
                    </div>
                    {/* Tracking code — only shown when admin has provided one */}
                    {order.trackingCode && (
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/40 text-sm">
                        <Truck size={16} className="text-gold flex-shrink-0" />
                        <span className="text-muted-foreground">کد رهگیری:</span>
                        <span className="font-medium text-charcoal" dir="ltr">{order.trackingCode}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-3 mt-1 border-t border-border">
                      <span className="text-sm text-muted-foreground">مبلغ کل</span>
                      <span className="text-sm font-bold text-charcoal">{formatPrice(order.totalPrice)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
