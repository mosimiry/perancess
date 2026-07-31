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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Plus, Pencil, Trash2, Star, User } from 'lucide-react';

interface TestimonialsManagerProps {
  token: string;
}

interface Testimonial {
  id: string;
  name: string;
  text: string;
  rating: number;
  order: number;
  active: boolean;
}

const emptyForm = { name: '', text: '', rating: 5, order: 0, active: true };

export default function TestimonialsManager({ token }: TestimonialsManagerProps) {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/admin/testimonials', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setItems(await res.json());
    } catch {
      console.log('Error fetching testimonials');
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

  const openEdit = (item: Testimonial) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      text: item.text,
      rating: item.rating,
      order: item.order,
      active: item.active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = editingId
        ? `/api/admin/testimonials/${editingId}`
        : '/api/admin/testimonials';
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
      console.log('Error saving testimonial');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await fetch(`/api/admin/testimonials/${deleteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchItems();
    } catch {
      console.log('Error deleting testimonial');
    } finally {
      setDeleteId(null);
    }
  };

  const handleToggleActive = (item: Testimonial) => {
    // Optimistic update: flip local state instantly, sync in background.
    const next = !item.active;
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, active: next } : i)));
    fetch(`/api/admin/testimonials/${item.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ ...item, active: next }),
    }).catch(() => {
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, active: item.active } : i)));
    });
  };

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`w-4 h-4 ${i < rating ? 'text-gold fill-gold' : 'text-gray-300'}`} />
      ))}
    </div>
  );

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
        <h2 className="text-xl font-bold text-charcoal">مدیریت نظرات مشتریان</h2>
        <Button onClick={openCreate} className="bg-gold hover:bg-gold-dark text-white">
          <Plus className="w-4 h-4 ml-2" />
          افزودن نظر جدید
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground bg-white rounded-xl border border-border/60">
            نظری وجود ندارد
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-border/60 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-gold" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-charcoal">{item.name}</p>
                    <div className="mt-1">{renderStars(item.rating)}</div>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{item.text}</p>
                  </div>
                </div>
                <Badge variant={item.active ? 'default' : 'secondary'} className={item.active ? 'bg-emerald-100 text-emerald-700 flex-shrink-0' : ''}>
                  {item.active ? 'فعال' : 'غیرفعال'}
                </Badge>
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/40">
                <div className="flex items-center gap-1">
                  <Switch checked={item.active} onCheckedChange={() => handleToggleActive(item)} className="data-[state=checked]:bg-gold" />
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(item.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'ویرایش نظر' : 'افزودن نظر جدید'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>نام مشتری</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="نام مشتری" />
            </div>
            <div className="space-y-2">
              <Label>متن نظر</Label>
              <Textarea value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} placeholder="متن نظر مشتری" rows={4} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>امتیاز</Label>
                <Select value={String(form.rating)} onValueChange={(v) => setForm({ ...form, rating: Number(v) })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[5, 4, 3, 2, 1].map((r) => (
                      <SelectItem key={r} value={String(r)}>{'⭐'.repeat(r)} ({r})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>ترتیب نمایش</Label>
                {/* Allow clearing with backspace: show empty when 0 */}
                <Input inputMode="numeric" value={form.order || ''} onChange={(e) => setForm({ ...form, order: Number(e.target.value.toString().replace(/\D/g, '') || 0) })} />
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
            <AlertDialogTitle>حذف نظر</AlertDialogTitle>
            <AlertDialogDescription>آیا از حذف این نظر اطمینان دارید؟</AlertDialogDescription>
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
