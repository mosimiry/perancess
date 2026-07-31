'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Pencil, FileText, BookOpen, PhoneCall } from 'lucide-react';

interface PagesManagerProps {
  token: string;
}

interface PageContent {
  id: string;
  slug: string;
  title: string;
  heroTitle: string;
  heroSubtitle: string;
  content: string;
  updatedAt?: string;
}

const pageIcons: Record<string, React.ReactNode> = {
  about: <BookOpen className="w-6 h-6" />,
  contact: <PhoneCall className="w-6 h-6" />,
};

const pageLabels: Record<string, string> = {
  about: 'درباره ما',
  contact: 'تماس با ما',
};

const emptyForm = { title: '', heroTitle: '', heroSubtitle: '', content: '' };

export default function PagesManager({ token }: PagesManagerProps) {
  const [pages, setPages] = useState<PageContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<PageContent | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchPages = async () => {
    try {
      const res = await fetch('/api/admin/pages', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setPages(await res.json());
    } catch {
      console.log('Error fetching pages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPages(); }, [token]);

  const openEdit = (page: PageContent) => {
    setEditingPage(page);
    setForm({
      title: page.title,
      heroTitle: page.heroTitle,
      heroSubtitle: page.heroSubtitle,
      content: page.content,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingPage) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/pages/${editingPage.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ ...editingPage, ...form }),
      });
      if (res.ok) {
        setDialogOpen(false);
        fetchPages();
      }
    } catch {
      console.log('Error saving page');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-charcoal">مدیریت صفحات</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pages.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white rounded-xl border border-border/60">
            <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-muted-foreground">صفحه‌ای یافت نشد</p>
          </div>
        ) : (
          pages.map((page) => (
            <Card key={page.id} className="border-border/60 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-gold flex-shrink-0">
                    {pageIcons[page.slug] || <FileText className="w-6 h-6" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-charcoal">
                        {pageLabels[page.slug] || page.slug}
                      </h3>
                      <Badge variant="secondary" className="text-xs">{page.slug}</Badge>
                    </div>
                    {page.heroTitle && (
                      <p className="text-sm text-charcoal mt-1 font-medium">{page.heroTitle}</p>
                    )}
                    {page.heroSubtitle && (
                      <p className="text-sm text-muted-foreground mt-0.5 truncate">{page.heroSubtitle}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                      {page.content ? page.content.substring(0, 120) + '...' : 'بدون محتوا'}
                    </p>
                  </div>
                  <Button variant="outline" size="icon" className="h-9 w-9 flex-shrink-0" onClick={() => openEdit(page)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh]" dir="rtl">
          <DialogHeader>
            <DialogTitle>
              ویرایش {editingPage ? (pageLabels[editingPage.slug] || editingPage.slug) : 'صفحه'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 overflow-y-auto max-h-[65vh] pr-1">
            <div className="space-y-2">
              <Label>عنوان صفحه</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="عنوان صفحه"
              />
            </div>
            <div className="space-y-2">
              <Label>عنوان اصلی (Hero Title)</Label>
              <Input
                value={form.heroTitle}
                onChange={(e) => setForm({ ...form, heroTitle: e.target.value })}
                placeholder="عنوان بنر بالای صفحه"
              />
            </div>
            <div className="space-y-2">
              <Label>زیرعنوان (Hero Subtitle)</Label>
              <Input
                value={form.heroSubtitle}
                onChange={(e) => setForm({ ...form, heroSubtitle: e.target.value })}
                placeholder="زیرعنوان بنر بالای صفحه"
              />
            </div>
            <div className="space-y-2">
              <Label>محتوای صفحه</Label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="محتوای اصلی صفحه"
                rows={10}
                className="min-h-[200px]"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleSave}
                className="flex-1 bg-gold hover:bg-gold-dark text-white"
                disabled={saving}
              >
                {saving ? 'در حال ذخیره...' : 'بروزرسانی'}
              </Button>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>انصراف</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
