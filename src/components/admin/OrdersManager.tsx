'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Package,
  User,
  MapPin,
  CreditCard,
  Loader2,
  Search,
  Truck,
  Save,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OrdersManagerProps {
  token: string;
}

// Shape returned by GET /api/admin/orders (OrderItem via Prisma include)
interface OrderItem {
  id: string;
  productId: string;
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
  customerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  province: string;
  city: string;
  street: string;
  alley: string;
  plate: string;
  totalPrice: number;
  paymentStatus: string;
  orderStatus: string;
  trackingCode: string | null;
  authority: string | null;
  refId: string | null;
  items: OrderItem[];
  createdAt: string;
}

const ORDER_STATUSES = [
  { value: 'preparing', label: 'در حال آماده‌سازی' },
  { value: 'shipping', label: 'در حال ارسال' },
  { value: 'delivered', label: 'تحویل داده شده' },
];

const ORDER_STATUS_STYLES: Record<string, string> = {
  preparing: 'bg-amber-100 text-amber-700',
  shipping: 'bg-blue-100 text-blue-700',
  delivered: 'bg-emerald-100 text-emerald-700',
};
const ORDER_STATUS_LABELS: Record<string, string> = {
  preparing: 'در حال آماده‌سازی',
  shipping: 'در حال ارسال',
  delivered: 'تحویل داده شده',
};

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  success: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  failed: 'bg-red-100 text-red-700',
};
const PAYMENT_STATUS_LABELS: Record<string, string> = {
  success: 'موفق',
  pending: 'در انتظار',
  failed: 'ناموفق',
};

const formatPrice = (n: number) => new Intl.NumberFormat('fa-IR').format(n) + ' تومان';
const formatDate = (d: string | Date) =>
  new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(d));

export default function OrdersManager({ token }: OrdersManagerProps) {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Order | null>(null);
  const [saving, setSaving] = useState(false);

  // Local editable fields inside the detail dialog
  const [editStatus, setEditStatus] = useState<string>('preparing');
  const [editTracking, setEditTracking] = useState<string>('');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Sync editable fields whenever a new order is opened
  const openOrder = (order: Order) => {
    setSelected(order);
    setEditStatus(order.orderStatus || 'preparing');
    setEditTracking(order.trackingCode || '');
  };

  // Persist status + trackingCode changes for the open order
  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${selected.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderStatus: editStatus, trackingCode: editTracking.trim() || null }),
      });
      if (!res.ok) throw new Error('update failed');
      const updated: Order = await res.json();
      // Single source of truth: replace the order in the list from the server response
      setSelected(updated);
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      toast({ title: 'ذخیره شد', description: 'اطلاعات سفارش بروزرسانی شد.' });
    } catch {
      toast({ title: 'خطا', description: 'ذخیره تغییرات ناموفق بود.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const fullName = (o: Order) => `${o.firstName} ${o.lastName}`.trim() || '—';
  const fullAddress = (o: Order) =>
    [o.province, o.city, o.street, o.alley, o.plate].filter(Boolean).join('، ') || '—';

  // Client-side search across name, email, phone, tracking code and order id tail
  const filtered = orders.filter((o) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      fullName(o).toLowerCase().includes(q) ||
      o.email.toLowerCase().includes(q) ||
      o.phone.toLowerCase().includes(q) ||
      (o.trackingCode || '').toLowerCase().includes(q) ||
      o.id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-charcoal">مدیریت سفارش‌ها</h2>
          <Badge className="bg-gold text-white">{orders.length} سفارش</Badge>
        </div>
        {/* Search box */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجو بر اساس نام، ایمیل، کد رهگیری..."
            className="pr-9"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-border/60">
          <Package className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-muted-foreground">سفارشی یافت نشد</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <motion.button
              key={order.id}
              type="button"
              layout
              onClick={() => openOrder(order)}
              className="w-full text-right bg-white rounded-xl border border-border/60 p-4 hover:shadow-md hover:border-gold/40 transition-all"
            >
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 text-gold" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-charcoal truncate">{fullName(order)}</span>
                      <span className="text-xs text-muted-foreground" dir="ltr">#{order.id.slice(-8)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {order.items.length} کالا • {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${PAYMENT_STATUS_STYLES[order.paymentStatus] || 'bg-muted text-charcoal'}`}>
                    {PAYMENT_STATUS_LABELS[order.paymentStatus] || order.paymentStatus}
                  </span>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${ORDER_STATUS_STYLES[order.orderStatus] || 'bg-muted text-charcoal'}`}>
                    {ORDER_STATUS_LABELS[order.orderStatus] || order.orderStatus}
                  </span>
                  <span className="text-sm font-bold text-charcoal whitespace-nowrap">{formatPrice(order.totalPrice)}</span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {/* Order details dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-lg flex items-center gap-2">
              <Package className="w-5 h-5 text-gold" />
              جزئیات سفارش
              {selected && <span className="text-xs text-muted-foreground font-normal" dir="ltr">#{selected.id.slice(-8)}</span>}
            </DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-5">
              {/* Order creation date */}
              <div className="text-xs text-muted-foreground">
                تاریخ ثبت: {formatDate(selected.createdAt)}
              </div>

              {/* Customer information */}
              <section className="bg-muted/30 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-charcoal mb-1">
                  <User className="w-4 h-4 text-gold" /> اطلاعات مشتری
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <p><span className="text-muted-foreground">نام:</span> {fullName(selected)}</p>
                  <p className="truncate"><span className="text-muted-foreground">ایمیل:</span> <span dir="ltr">{selected.email || '—'}</span></p>
                  <p><span className="text-muted-foreground">تلفن:</span> <span dir="ltr">{selected.phone || '—'}</span></p>
                </div>
              </section>

              {/* Shipping address */}
              <section className="bg-muted/30 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-charcoal mb-1">
                  <MapPin className="w-4 h-4 text-gold" /> آدرس ارسال
                </div>
                <p className="text-sm text-charcoal leading-7">{fullAddress(selected)}</p>
              </section>

              {/* Payment information */}
              <section className="bg-muted/30 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-charcoal mb-1">
                  <CreditCard className="w-4 h-4 text-gold" /> اطلاعات پرداخت
                </div>
                <div className="flex items-center gap-2 flex-wrap text-sm">
                  <span className="text-muted-foreground">وضعیت:</span>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${PAYMENT_STATUS_STYLES[selected.paymentStatus] || 'bg-muted text-charcoal'}`}>
                    {PAYMENT_STATUS_LABELS[selected.paymentStatus] || selected.paymentStatus}
                  </span>
                  {selected.refId && (
                    <span className="text-xs text-muted-foreground" dir="ltr">کد پیگیری: {selected.refId}</span>
                  )}
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-sm text-muted-foreground">مبلغ کل</span>
                  <span className="text-sm font-bold text-charcoal">{formatPrice(selected.totalPrice)}</span>
                </div>
              </section>

              {/* Ordered products */}
              <section className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-charcoal">
                  <Package className="w-4 h-4 text-gold" /> محصولات سفارش داده شده
                </div>
                <div className="rounded-xl border border-border/60 divide-y divide-border/40 overflow-hidden">
                  {selected.items.map((it) => (
                    <div key={it.id} className="p-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                      <div className="col-span-2 sm:col-span-1">
                        <p className="text-muted-foreground text-xs">محصول</p>
                        <p className="text-charcoal font-medium truncate">{it.productName || '—'}</p>
                        {it.productCode && <p className="text-xs text-muted-foreground" dir="ltr">کد: {it.productCode}</p>}
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">سایز</p>
                        <p className="text-charcoal">{it.size || '—'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">رنگ</p>
                        <p className="text-charcoal">{it.color || '—'}</p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-muted-foreground text-xs">تعداد</p>
                        <p className="text-charcoal" dir="ltr">{it.quantity}</p>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <p className="text-muted-foreground text-xs">قیمت واحد</p>
                        <p className="text-charcoal" dir="ltr">{formatPrice(it.price)}</p>
                      </div>
                      <div className="col-span-2 sm:col-span-3 text-left sm:text-left">
                        <p className="text-muted-foreground text-xs">قیمت کل</p>
                        <p className="text-charcoal font-bold" dir="ltr">{formatPrice(it.totalPrice)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Admin controls: status + tracking code */}
              <section className="bg-gold/5 border border-gold/20 rounded-xl p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>وضعیت سفارش</Label>
                    <Select value={editStatus} onValueChange={setEditStatus}>
                      <SelectTrigger><SelectValue placeholder="انتخاب وضعیت" /></SelectTrigger>
                      <SelectContent>
                        {ORDER_STATUSES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5" /> کد رهگیری (اختیاری)
                    </Label>
                    <Input
                      dir="ltr"
                      value={editTracking}
                      onChange={(e) => setEditTracking(e.target.value)}
                      placeholder="کد رهگیری پستی..."
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Save className="w-4 h-4 ml-2" />}
                    ذخیره تغییرات
                  </Button>
                </div>
              </section>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
