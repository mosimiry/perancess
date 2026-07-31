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
import { Plus, Pencil, Trash2, GripVertical, HelpCircle } from 'lucide-react';

interface FaqsManagerProps {
  token: string;
}

interface Faq {
  id: string;
  question: string;
  answer: string;
  order: number;
  active: boolean;
}

const emptyForm = { question: '', answer: '', order: 0, active: true };

export default function FaqsManager({ token }: FaqsManagerProps) {
  const [items, setItems] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/admin/faqs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setItems(await res.json());
    } catch {
      console.log('Error fetching FAQs');
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

  const openEdit = (item: Faq) => {
    setEditingId(item.id);
    setForm({
      question: item.question,
      answer: item.answer,
      order: item.order,
      active: item.active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = editingId
        ? `/api/admin/faqs/${editingId}`
        : '/api/admin/faqs';
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
      console.log('Error saving FAQ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await fetch(`/api/admin/faqs/${deleteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchItems();
    } catch {
      console.log('Error deleting FAQ');
    } finally {
      setDeleteId(null);
    }
  };

  const handleToggleActive = (item: Faq) => {
    // Optimistic update: flip local state instantly, sync in background.
    const next = !item.active;
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, active: next } : i)));
    fetch(`/api/admin/faqs/${item.id}`, {
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
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-charcoal">مدیریت سوالات متداول</h2>
        <Button onClick={openCreate} className="bg-gold hover:bg-gold-dark text-white">
          <Plus className="w-4 h-4 ml-2" />
          افزودن سوال جدید
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-border/60 overflow-hidden">
        <div className="divide-y divide-border/40">
          {items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <HelpCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
              سوال متداولی وجود ندارد
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="p-4 hover:bg-muted/20 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="flex items-center gap-1 text-muted-foreground mt-1">
                    <GripVertical className="w-4 h-4" />
                    <span className="text-xs">{item.order}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-charcoal">{item.question}</p>
                      <Badge variant={item.active ? 'default' : 'secondary'} className={item.active ? 'bg-emerald-100 text-emerald-700' : ''}>
                        {item.active ? 'فعال' : 'غیرفعال'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.answer}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Switch checked={item.active} onCheckedChange={() => handleToggleActive(item)} className="data-[state=checked]:bg-gold" />
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(item.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'ویرایش سوال' : 'افزودن سوال جدید'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>سوال</Label>
              <Input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} placeholder="سوال را وارد کنید" />
            </div>
            <div className="space-y-2">
              <Label>پاسخ</Label>
              <Textarea value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} placeholder="پاسخ را وارد کنید" rows={4} />
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
            <AlertDialogTitle>حذف سوال</AlertDialogTitle>
            <AlertDialogDescription>آیا از حذف این سوال اطمینان دارید؟</AlertDialogDescription>
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
