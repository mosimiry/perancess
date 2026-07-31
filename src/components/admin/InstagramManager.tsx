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
import { Plus, Pencil, Trash2, GripVertical, ImageIcon, Instagram } from 'lucide-react';
import ImageUpload from '@/components/shared/ImageUpload';

interface InstagramManagerProps {
  token: string;
}

interface InstagramImage {
  id: string;
  imageUrl: string;
  alt: string;
  order: number;
  active: boolean;
}

const emptyForm = { imageUrl: '', alt: '', order: 0, active: true };

export default function InstagramManager({ token }: InstagramManagerProps) {
  const [items, setItems] = useState<InstagramImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/admin/instagram', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setItems(await res.json());
    } catch {
      console.log('Error fetching instagram images');
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

  const openEdit = (item: InstagramImage) => {
    setEditingId(item.id);
    setForm({
      imageUrl: item.imageUrl,
      alt: item.alt,
      order: item.order,
      active: item.active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = editingId
        ? `/api/admin/instagram/${editingId}`
        : '/api/admin/instagram';
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
      console.log('Error saving instagram image');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await fetch(`/api/admin/instagram/${deleteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchItems();
    } catch {
      console.log('Error deleting instagram image');
    } finally {
      setDeleteId(null);
    }
  };

  const handleToggleActive = (item: InstagramImage) => {
    // Optimistic update: flip local state instantly, sync in background.
    const next = !item.active;
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, active: next } : i)));
    fetch(`/api/admin/instagram/${item.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ ...item, active: next }),
    }).catch(() => {
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, active: item.active } : i)));
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-charcoal flex items-center gap-2">
          <Instagram className="w-5 h-5" />
          گالری اینستاگرام
        </h2>
        <Button onClick={openCreate} className="bg-gold hover:bg-gold-dark text-white">
          <Plus className="w-4 h-4 ml-2" />
          افزودن تصویر جدید
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white rounded-xl border border-border/60">
            <Instagram className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-muted-foreground">تصویری وجود ندارد</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="group relative bg-white rounded-xl border border-border/60 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square relative">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.alt || ''} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                )}
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    <Button variant="secondary" size="icon" className="h-9 w-9" onClick={() => openEdit(item)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="secondary" size="icon" className="h-9 w-9 text-destructive" onClick={() => setDeleteId(item.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {/* Badges */}
                <div className="absolute top-2 right-2 flex flex-col gap-1">
                  <Badge variant={item.active ? 'default' : 'secondary'} className={item.active ? 'bg-emerald-100 text-emerald-700 text-xs' : 'text-xs'}>
                    {item.active ? 'فعال' : 'غیرفعال'}
                  </Badge>
                  <Badge variant="outline" className="bg-white/80 text-xs">
                    {item.order}
                  </Badge>
                </div>
              </div>
              <div className="p-2 flex items-center justify-between">
                <p className="text-xs text-muted-foreground truncate">{item.alt || 'بدون توضیحات'}</p>
                <Switch
                  checked={item.active}
                  onCheckedChange={() => handleToggleActive(item)}
                  className="data-[state=checked]:bg-gold scale-75"
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'ویرایش تصویر' : 'افزودن تصویر جدید'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <ImageUpload value={form.imageUrl} onChange={(url) => setForm({ ...form, imageUrl: url })} label="تصویر" />
            {form.imageUrl && (
              <div className="rounded-lg overflow-hidden border border-border">
                <img src={form.imageUrl} alt="preview" className="w-full h-48 object-cover" />
              </div>
            )}
            <div className="space-y-2">
              <Label>متن جایگزین (Alt)</Label>
              <Input value={form.alt} onChange={(e) => setForm({ ...form, alt: e.target.value })} placeholder="توضیح تصویر" />
            </div>
            <div className="space-y-2">
              <Label>ترتیب نمایش</Label>
              {/* Allow clearing with backspace: show empty when 0 */}
              <Input inputMode="numeric" value={form.order || ''} onChange={(e) => setForm({ ...form, order: Number(e.target.value.toString().replace(/\D/g, '') || 0) })} />
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
            <AlertDialogTitle>حذف تصویر</AlertDialogTitle>
            <AlertDialogDescription>آیا از حذف این تصویر اطمینان دارید؟</AlertDialogDescription>
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