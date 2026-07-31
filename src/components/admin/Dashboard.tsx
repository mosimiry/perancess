'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingBag, Grid3X3, MessageSquare, Mail, Star, Eye } from 'lucide-react';

interface DashboardProps {
  token: string;
}

interface StatCard {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const formatDate = (date: Date | string) =>
  new Intl.DateTimeFormat('fa-IR').format(new Date(date));

export default function Dashboard({ token }: DashboardProps) {
  const [stats, setStats] = useState<StatCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentMessages, setRecentMessages] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [productsRes, categoriesRes, testimonialsRes, messagesRes] = await Promise.all([
          fetch('/api/admin/products', { headers }),
          fetch('/api/admin/categories', { headers }),
          fetch('/api/admin/testimonials', { headers }),
          fetch('/api/admin/messages', { headers }),
        ]);

        const products = productsRes.ok ? await productsRes.json() : [];
        const categories = categoriesRes.ok ? await categoriesRes.json() : [];
        const testimonials = testimonialsRes.ok ? await testimonialsRes.json() : [];
        const messages = messagesRes.ok ? await messagesRes.json() : [];

        const unread = (messages || []).filter((m: any) => !m.isRead).length;

        setStats([
          {
            title: 'محصولات',
            value: Array.isArray(products) ? products.length : 0,
            icon: <ShoppingBag className="w-6 h-6" />,
            color: 'text-gold',
            bgColor: 'bg-gold/10',
          },
          {
            title: 'دسته‌بندی‌ها',
            value: Array.isArray(categories) ? categories.length : 0,
            icon: <Grid3X3 className="w-6 h-6" />,
            color: 'text-rose',
            bgColor: 'bg-rose/10',
          },
          {
            title: 'نظرات مشتریان',
            value: Array.isArray(testimonials) ? testimonials.length : 0,
            icon: <MessageSquare className="w-6 h-6" />,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50',
          },
          {
            title: 'پیام‌های خوانده‌نشده',
            value: unread,
            icon: <Mail className="w-6 h-6" />,
            color: 'text-amber-600',
            bgColor: 'bg-amber-50',
          },
        ]);

        const recent = (messages || []).slice(0, 5).map((m: any) => ({
          id: m.id,
          name: m.name,
          subject: m.subject,
          date: m.createdAt,
          isRead: m.isRead,
        }));
        setRecentMessages(recent);
      } catch {
        console.log('Error fetching dashboard stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-charcoal">داشبورد</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-charcoal">داشبورد</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="border-border/60 hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-3xl font-bold text-charcoal mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center ${stat.color}`}>
                {stat.icon}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Messages */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold text-charcoal flex items-center gap-2">
            <Eye className="w-5 h-5 text-gold" />
            آخرین پیام‌ها
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentMessages.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">پیامی یافت نشد</p>
          ) : (
            <div className="space-y-3">
              {recentMessages.map((msg: any) => (
                <div
                  key={msg.id}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                    msg.isRead ? 'bg-muted/30' : 'bg-gold/5 border border-gold/20'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-charcoal">{msg.name}</span>
                      {!msg.isRead && (
                        <span className="w-2 h-2 rounded-full bg-gold" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate mt-0.5">{msg.subject}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap mr-3">
                    {formatDate(msg.date)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Info */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold text-charcoal flex items-center gap-2">
            <Star className="w-5 h-5 text-gold" />
            راهنمای سریع
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="p-3 rounded-lg bg-muted/30">
              <p className="font-medium text-charcoal">مدیریت اسلایدر</p>
              <p className="text-muted-foreground mt-1">تصاویر و متن‌های اصلی صفحه اول را ویرایش کنید</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30">
              <p className="font-medium text-charcoal">مدیریت محصولات</p>
              <p className="text-muted-foreground mt-1">محصولات جدید اضافه و موجودی را بروزرسانی کنید</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30">
              <p className="font-medium text-charcoal">تنظیمات سایت</p>
              <p className="text-muted-foreground mt-1">اطلاعات تماس، شبکه‌های اجتماعی و ساعات کاری</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}