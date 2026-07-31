'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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

interface CategoriesManagerProps {
  token: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  description: string;
  productCount: number;
  order: number;
  active: boolean;
}

const emptyForm = { name: '', slug: '', imageUrl: '', description: '', productCount: 0, order: 0, active: true };

export default function CategoriesManager({ token }: CategoriesManagerProps) {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/admin/categories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setItems(await res.json());
    } catch {
      console.log('Error fetching categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, [token]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (item: Category) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      slug: item.slug,
      imageUrl: item.imageUrl,
      description: item.description,
      productCount: item.productCount,
      order: item.order,
      active: item.active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = editingId
        ? `/api/admin/categories/${editingId}`
        : '/api/admin/categories';
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers,
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setDialogOpen(false);
        fetchItems();
      }
    } catch {
      console.log('Error saving category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/categories/${deleteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchItems();
    } catch {
      console.log('Error deleting category');
    } finally {
      setDeleteId(null);
    }
  };

  const handleToggleActive = (item: Category) => {
    // Optimistic update: flip local state instantly, sync in background.
    const next = !item.active;
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, active: next } : i)));
    fetch(`/api/admin/categories/${item.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ ...item, active: next }),
    }).catch(() => {
      // Revert on failure
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, active: item.active } : i)));
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
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-charcoal">مدیریت دسته‌بندی‌ها</h2>
        <Button onClick={openCreate} className="bg-gold hover:bg-gold-dark text-white">
          <Plus className="w-4 h-4 ml-2" />
          افزودن دسته‌بندی جدید
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-border/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                <th className="text-right p-3 font-medium text-muted-foreground">ترتیب</th>
                <th className="text-right p-3 font-medium text-muted-foreground">تصویر</th>
                <th className="text-right p-3 font-medium text-muted-foreground">نام</th>
                <th className="text-right p-3 font-medium text-muted-foreground hidden md:table-cell">اسلاگ</th>
                <th className="text-right p-3 font-medium text-muted-foreground hidden lg:table-cell">تعداد محصولات</th>
                <th className="text-right p-3 font-medium text-muted-foreground">وضعیت</th>
                <th className="text-right p-3 font-medium text-muted-foreground">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">دسته‌بندی‌ای یافت نشد</td></tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                    <td className="p-3"><div className="flex items-center gap-1 text-muted-foreground"><GripVertical className="w-4 h-4" />{item.order}</div></td>
                    <td className="p-3">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-14 h-14 object-cover rounded-md border border-border" />
                      ) : (
                        <div className="w-14 h-14 bg-muted rounded-md flex items-center justify-center"><ImageIcon className="w-5 h-5 text-muted-foreground" /></div>
                      )}
                    </td>
                    <td className="p-3 font-medium text-charcoal">{item.name}</td>
                    <td className="p-3 text-muted-foreground hidden md:table-cell font-mono text-xs" dir="ltr">{item.slug}</td>
                    <td className="p-3 text-center hidden lg:table-cell"><Badge variant="secondary">{item.productCount}</Badge></td>
                    <td className="p-3">
                      <Badge variant={item.active ? 'default' : 'secondary'} className={item.active ? 'bg-emerald-100 text-emerald-700' : ''}>
                        {item.active ? 'فعال' : 'غیرفعال'}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <Switch checked={item.active} onCheckedChange={() => handleToggleActive(item)} className="data-[state=checked]:bg-gold" />
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(item.id)}><Trash2 className="w-4 h-4" /></Button>
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
        <DialogContent className="sm:max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'ویرایش دسته‌بندی' : 'افزودن دسته‌بندی جدید'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="space-y-2">
              <Label>نام دسته‌بندی</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="مثلاً: لباس مجلسی" />
            </div>
            <div className="space-y-2">
              <Label>اسلاگ (_slug)</Label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="example-slug" dir="ltr" />
            </div>
            <ImageUpload value={form.imageUrl} onChange={(url) => setForm({ ...form, imageUrl: url })} />
            <div className="space-y-2">
              <Label>توضیحات</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="توضیحات دسته‌بندی" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ترتیب نمایش</Label>
                {/* Allow clearing with backspace: show empty when 0 */}
                <Input inputMode="numeric" value={form.order || ''} onChange={(e) => setForm({ ...form, order: Number(e.target.value.toString().replace(/\D/g, '') || 0) })} />
              </div>
              <div className="space-y-2">
                <Label>تعداد محصولات</Label>
                <Input inputMode="numeric" value={form.productCount || ''} onChange={(e) => setForm({ ...form, productCount: Number(e.target.value.toString().replace(/\D/g, '') || 0) })} />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>فعال</Label>
              <Switch checked={form.active} onCheckedChange={(checked) => setForm({ ...form, active: checked })} className="data-[state=checked]:bg-gold" />
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
            <AlertDialogTitle>حذف دسته‌بندی</AlertDialogTitle>
            <AlertDialogDescription>آیا از حذف این دسته‌بندی اطمینان دارید؟ این عمل غیرقابل بازگشت است.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
