'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, GripVertical, ImageIcon } from 'lucide-react';
import ImageUpload from '@/components/shared/ImageUpload';

interface SlidesManagerProps {
  token: string;
}

interface Slide {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  order: number;
  active: boolean;
}

const emptyForm = { title: '', subtitle: '', imageUrl: '', order: 0, active: true };

export default function SlidesManager({ token }: SlidesManagerProps) {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchSlides = async () => {
    try {
      const res = await fetch('/api/admin/slides', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setSlides(await res.json());
    } catch {
      console.log('Error fetching slides');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSlides(); }, [token]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (slide: Slide) => {
    setEditingId(slide.id);
    setForm({
      title: slide.title,
      subtitle: slide.subtitle,
      imageUrl: slide.imageUrl,
      order: slide.order,
      active: slide.active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = editingId
        ? `/api/admin/slides/${editingId}`
        : '/api/admin/slides';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, { method, headers, body: JSON.stringify(form) });
      if (res.ok) {
        setDialogOpen(false);
        fetchSlides();
      } else {
        console.log('Error saving slide');
      }
    } catch {
      console.log('Error saving slide');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/slides/${deleteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchSlides();
    } catch {
      console.log('Error deleting slide');
    } finally {
      setDeleteId(null);
    }
  };

  const handleToggleActive = (slide: Slide) => {
    // Optimistic update: flip local state instantly, sync in background.
    const next = !slide.active;
    setSlides((prev) => prev.map((s) => (s.id === slide.id ? { ...s, active: next } : s)));
    fetch(`/api/admin/slides/${slide.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ ...slide, active: next }),
    }).catch(() => {
      setSlides((prev) => prev.map((s) => (s.id === slide.id ? { ...s, active: slide.active } : s)));
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-charcoal">مدیریت اسلایدر</h2>
        <Button onClick={openCreate} className="bg-gold hover:bg-gold-dark text-white">
          <Plus className="w-4 h-4 ml-2" />
          افزودن اسلاید جدید
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-border/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                <th className="text-right p-3 font-medium text-muted-foreground">ترتیب</th>
                <th className="text-right p-3 font-medium text-muted-foreground">تصویر</th>
                <th className="text-right p-3 font-medium text-muted-foreground">عنوان</th>
                <th className="text-right p-3 font-medium text-muted-foreground hidden md:table-cell">زیرعنوان</th>
                <th className="text-right p-3 font-medium text-muted-foreground">وضعیت</th>
                <th className="text-right p-3 font-medium text-muted-foreground">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {slides.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground">
                    اسلایدی وجود ندارد
                  </td>
                </tr>
              ) : (
                slides.map((slide) => (
                  <tr key={slide.id} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <GripVertical className="w-4 h-4" />
                        {slide.order}
                      </div>
                    </td>
                    <td className="p-3">
                      {slide.imageUrl ? (
                        <img src={slide.imageUrl} alt={slide.title} className="w-16 h-10 object-cover rounded-md border border-border" />
                      ) : (
                        <div className="w-16 h-10 bg-muted rounded-md flex items-center justify-center">
                          <ImageIcon className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                    </td>
                    <td className="p-3 font-medium text-charcoal">{slide.title}</td>
                    <td className="p-3 text-muted-foreground hidden md:table-cell max-w-[200px] truncate">{slide.subtitle}</td>
                    <td className="p-3">
                      <Badge variant={slide.active ? 'default' : 'secondary'} className={slide.active ? 'bg-emerald-100 text-emerald-700' : ''}>
                        {slide.active ? 'فعال' : 'غیرفعال'}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <Switch
                          checked={slide.active}
                          onCheckedChange={() => handleToggleActive(slide)}
                          className="data-[state=checked]:bg-gold"
                        />
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(slide)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(slide.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'ویرایش اسلاید' : 'افزودن اسلاید جدید'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>عنوان</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="عنوان اسلاید"
              />
            </div>
            <div className="space-y-2">
              <Label>زیرعنوان</Label>
              <Input
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                placeholder="زیرعنوان اسلاید"
              />
            </div>
            <ImageUpload value={form.imageUrl} onChange={(url) => setForm({ ...form, imageUrl: url })} />
            <div className="space-y-2">
              <Label>ترتیب نمایش</Label>
              {/* Allow clearing the field with backspace: show empty when 0 */}
              <Input
                inputMode="numeric"
                value={form.order || ''}
                onChange={(e) => setForm({ ...form, order: Number(e.target.value.toString().replace(/\D/g, '') || 0) })}
                placeholder="0"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>فعال</Label>
              <Switch
                checked={form.active}
                onCheckedChange={(checked) => setForm({ ...form, active: checked })}
                className="data-[state=checked]:bg-gold"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} className="flex-1 bg-gold hover:bg-gold-dark text-white" disabled={saving}>
                {saving ? 'در حال ذخیره...' : editingId ? 'بروزرسانی' : 'ذخیره'}
              </Button>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>انصراف</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف اسلاید</AlertDialogTitle>
            <AlertDialogDescription>
              آیا از حذف این اسلاید اطمینان دارید؟ این عمل غیرقابل بازگشت است.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}