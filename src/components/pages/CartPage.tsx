'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import BreadcrumbNav from '@/components/shared/BreadcrumbNav';
import { useNavigationStore } from '@/lib/store';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/data';

export default function CartPage() {
  const { navigateTo } = useNavigationStore();
  const { items, total, count, increase, decrease, removeItem } = useCart();

  return (
    <main className="pt-24 md:pt-28 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav items={[]} currentPage="سبد خرید" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl md:text-3xl font-bold text-charcoal mb-8">سبد خرید</h1>

          {items.length === 0 ? (
            <div className="text-center py-20">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <ShoppingBag className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="text-lg text-muted-foreground mb-4">سبد خرید شما خالی است</p>
              <button
                onClick={() => { navigateTo('products'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="inline-flex items-center gap-2 bg-charcoal text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-charcoal/80 transition-all duration-300"
              >
                مشاهده محصولات
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="bg-white rounded-2xl border border-border/60 p-4 flex items-center gap-4"
                  >
                    <div className="relative w-20 h-24 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-charcoal truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5" dir="ltr">کد: {item.productCode}</p>
                      <p className="text-sm font-bold text-charcoal mt-1">{formatPrice(item.price)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-destructive hover:bg-destructive/5 p-1.5 rounded-lg transition-colors"
                        aria-label="حذف"
                      >
                        <Trash2 size={16} />
                      </button>
                      <div className="flex items-center gap-1 bg-muted rounded-lg">
                        <button
                          onClick={() => increase(item.productId)}
                          className="p-2 hover:text-gold transition-colors"
                          aria-label="افزایش"
                        >
                          <Plus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => decrease(item.productId)}
                          className="p-2 hover:text-gold transition-colors"
                          aria-label="کاهش"
                        >
                          <Minus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl border border-border/60 p-6 sticky top-28 space-y-4">
                  <h2 className="text-lg font-bold text-charcoal">خلاصه سفارش</h2>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">تعداد اقلام</span>
                    <span className="font-medium text-charcoal">{count}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm pb-4 border-b border-border">
                    <span className="text-muted-foreground">مبلغ کل</span>
                    <span className="font-bold text-charcoal">{formatPrice(total)}</span>
                  </div>
                  <button
                    onClick={() => { navigateTo('checkout'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="w-full bg-gold hover:bg-gold-dark text-white py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    تایید و تکمیل خرید
                    <ArrowLeft size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
