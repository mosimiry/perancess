'use client';

import { useEffect, useState, useRef } from 'react';
import { useProductCodes } from '@/hooks/useProductCodes';
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
import { Plus, Pencil, Trash2, Star, Flame, ImageIcon, X, Upload, Loader2, ChevronUp, ChevronDown } from 'lucide-react';
import ImageUpload from '@/components/shared/ImageUpload';

interface ProductsManagerProps {
  token: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  imageUrl: string;
  images: string;
  description: string;
  sizes: string;
  colors: string;
  isNew: boolean;
  isBestseller: boolean;
  freeShipping: boolean;
  returnGuarantee: boolean;
  rating: number;
  reviewCount: number;
  categoryId: string;
  categoryName?: string;
  order: number;
  active: boolean;
}

interface Category {
  id: string;
  name: string;
}

// Default form values when creating a new product
const emptyForm = {
  name: '', slug: '', productCode: '',
  // Price is stored as a string to allow free editing (deleting all digits, etc.)
  price: '',
  discount: '',
  imageUrl: '',
  images: '[]', // JSON array of image URLs
  description: '',
  sizes: '[]', // JSON array of size strings
  colors: '[]', // JSON array of { name, hex }
  isNew: false, isBestseller: false, freeShipping: false, returnGuarantee: false, rating: 0, reviewCount: 0,
  categoryId: '', order: 0, active: true,
};

// Format a numeric string with thousands separators (Persian locale)
const formatWithCommas = (value: string) => {
  if (!value) return '';
  // Remove any non-digit characters
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  // Parse and format with commas
  return new Intl.NumberFormat('en-US').format(Number(digits));
};

// Format price for display in the products table
const formatPrice = (price: number) =>
  new Intl.NumberFormat('fa-IR').format(price);

export default function ProductsManager({ token }: ProductsManagerProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [codeError, setCodeError] = useState('');

  // productCode overlay (localStorage) — replaces the legacy slug for users
  const { getCode, isUnique, setCode, removeCode } = useProductCodes();

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setProducts(await res.json());
    } catch {
      console.log('Error fetching products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setCategories(await res.json());
    } catch {
      console.log('Error fetching categories');
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [token]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setCodeError('');
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      slug: p.slug,
      productCode: getCode(p.id, p.slug),
      // Show base price (before discount) formatted with commas
      price: p.price ? formatWithCommas(String(p.price)) : '',
      discount: p.discount ? String(p.discount) : '',
      imageUrl: p.imageUrl,
      images: p.images || '[]',
      description: p.description,
      sizes: p.sizes || '[]',
      colors: p.colors || '[]',
      isNew: p.isNew,
      isBestseller: p.isBestseller,
      freeShipping: p.freeShipping ?? false,
      returnGuarantee: p.returnGuarantee ?? false,
      rating: p.rating,
      reviewCount: p.reviewCount,
      categoryId: p.categoryId,
      order: p.order,
      active: p.active,
    });
    setDialogOpen(true);
  };

  // Build the payload to send to the API
  const buildPayload = () => {
    // Strip commas from the formatted price string before sending
    const rawPrice = (form.price || '').toString().replace(/,/g, '').replace(/\D/g, '');
    const priceNum = rawPrice ? Number(rawPrice) : 0;
    const discountNum = form.discount ? Number(form.discount) : 0;
    return {
      name: form.name,
      // slug is kept in sync with productCode under the hood (DB requires it).
      slug: (form.productCode || form.slug || form.name).trim().replace(/\s+/g, '-').toLowerCase(),
      price: priceNum, // base price
      originalPrice: priceNum, // keep base as original for compatibility
      discount: discountNum,
      imageUrl: form.imageUrl,
      images: form.images,
      description: form.description,
      sizes: form.sizes,
      colors: form.colors,
      isNew: form.isNew,
      isBestseller: form.isBestseller,
      freeShipping: form.freeShipping,
      returnGuarantee: form.returnGuarantee,
      rating: form.rating,
      reviewCount: form.reviewCount,
      categoryId: form.categoryId,
      order: form.order,
      active: form.active,
    };
  };

  const handleSave = async () => {
    // Validate productCode: required + unique (replaces slug).
    const code = form.productCode.trim();
    if (!code) {
      setCodeError('کد محصول الزامی است');
      return;
    }
    if (!isUnique(code, editingId || undefined)) {
      setCodeError('این کد محصول قبلاً استفاده شده است');
      return;
    }
    setCodeError('');
    setSaving(true);
    try {
      const url = editingId
        ? `/api/admin/products/${editingId}`
        : '/api/admin/products';
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers,
        body: JSON.stringify(buildPayload()),
      });
      if (res.ok) {
        // Persist productCode in the localStorage overlay, keyed by product id.
        let savedId = editingId;
        if (!savedId) {
          try {
            const created = await res.json();
            savedId = created?.id ?? null;
          } catch {
            savedId = null;
          }
        }
        if (savedId) setCode(savedId, code);
        setDialogOpen(false);
        fetchProducts();
      }
    } catch {
      console.log('Error saving product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await fetch(`/api/admin/products/${deleteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      removeCode(deleteId);
      fetchProducts();
    } catch {
      console.log('Error deleting product');
    } finally {
      setDeleteId(null);
    }
  };

  const handleToggleActive = (p: Product) => {
    // Optimistic update: flip local state instantly, sync in background.
    const next = !p.active;
    setProducts((prev) => prev.map((i) => (i.id === p.id ? { ...i, active: next } : i)));
    fetch(`/api/admin/products/${p.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ ...p, active: next }),
    }).catch(() => {
      setProducts((prev) => prev.map((i) => (i.id === p.id ? { ...i, active: p.active } : i)));
    });
  };

  // ---- Price input handlers (allow deleting all digits, prevent leading zeros) ----
  const handlePriceChange = (raw: string) => {
    // Keep only digits, strip leading zeros, then format with commas
    const digits = raw.replace(/\D/g, '');
    if (!digits) {
      // Allow completely empty value so user can delete the last "0"
      setForm({ ...form, price: '' });
      return;
    }
    // Strip leading zeros (e.g. 060000 -> 60000), but keep a single "0"
    const cleaned = digits.replace(/^0+(?=\d)/, '');
    setForm({ ...form, price: formatWithCommas(cleaned) });
  };

  // ---- Discount input handler (allow deleting all, prevent leading zeros) ----
  const handleDiscountChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '');
    if (!digits) {
      setForm({ ...form, discount: '' });
      return;
    }
    const cleaned = digits.replace(/^0+(?=\d)/, '');
    // Clamp discount to 0-100
    const clamped = Math.min(100, Math.max(0, Number(cleaned)));
    setForm({ ...form, discount: String(clamped) });
  };

  // Computed discounted price shown dynamically in the form
  const computeDiscountedPrice = () => {
    const rawPrice = (form.price || '').toString().replace(/,/g, '').replace(/\D/g, '');
    const base = rawPrice ? Number(rawPrice) : 0;
    const discount = form.discount ? Number(form.discount) : 0;
    if (!base || discount <= 0) return base;
    return Math.round(base * (1 - discount / 100));
  };

  // ---- Multi-image uploader helpers ----
  const parseImages = (json: string): string[] => {
    try { return JSON.parse(json || '[]'); } catch { return []; }
  };
  const setImages = (list: string[]) => setForm({ ...form, images: JSON.stringify(list) });

  const handleAddImage = async (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) { alert('فرمت فایل پشتیبانی نمی‌شود'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('حجم فایل نباید بیشتر از ۵ مگابایت باشد'); return; }
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        const list = parseImages(form.images);
        list.push(data.url);
        setImages(list);
      }
    } catch {
      alert('خطا در آپلود فایل');
    }
  };

  const removeImage = (index: number) => {
    const list = parseImages(form.images);
    list.splice(index, 1);
    setImages(list);
  };

  // Move an image up/down in the list (first image is the main image)
  const moveImage = (index: number, direction: -1 | 1) => {
    const list = parseImages(form.images);
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= list.length) return;
    [list[index], list[newIndex]] = [list[newIndex], list[index]];
    setImages(list);
  };

  // When the main image URL changes, keep it in sync as the first image too
  const handleMainImageChange = (url: string) => {
    setForm({ ...form, imageUrl: url });
    const list = parseImages(form.images);
    if (url) {
      // Ensure main image is always first
      const filtered = list.filter((u) => u !== url);
      setImages([url, ...filtered]);
    }
  };

  // ---- Sizes selector helpers ----
  const parseSizes = (json: string): string[] => {
    try { return JSON.parse(json || '[]'); } catch { return []; }
  };
  const [newSize, setNewSize] = useState('');
  const addSize = () => {
    const val = newSize.trim();
    if (!val) return;
    const list = parseSizes(form.sizes);
    if (!list.includes(val)) list.push(val);
    setForm({ ...form, sizes: JSON.stringify(list) });
    setNewSize('');
  };
  const removeSize = (s: string) => {
    const list = parseSizes(form.sizes).filter((x) => x !== s);
    setForm({ ...form, sizes: JSON.stringify(list) });
  };

  // ---- Colors selector helpers ----
  const parseColors = (json: string): { name: string; hex: string }[] => {
    try { return JSON.parse(json || '[]'); } catch { return []; }
  };
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#000000');
  const addColor = () => {
    const name = newColorName.trim();
    if (!name) return;
    const list = parseColors(form.colors);
    list.push({ name, hex: newColorHex });
    setForm({ ...form, colors: JSON.stringify(list) });
    setNewColorName('');
    setNewColorHex('#000000');
  };
  const removeColor = (i: number) => {
    const list = parseColors(form.colors);
    list.splice(i, 1);
    setForm({ ...form, colors: JSON.stringify(list) });
  };

  // Multi-image upload input ref
  const multiImageInputRef = useRef<HTMLInputElement>(null);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const images = parseImages(form.images);
  const sizes = parseSizes(form.sizes);
  const colors = parseColors(form.colors);
  const discountedPrice = computeDiscountedPrice();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold text-charcoal">مدیریت محصولات ({products.length})</h2>
        <Button onClick={openCreate} className="bg-gold hover:bg-gold-dark text-white">
          <Plus className="w-4 h-4 ml-2" />
          افزودن محصول جدید
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-border/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                <th className="text-right p-3 font-medium text-muted-foreground">تصویر</th>
                <th className="text-right p-3 font-medium text-muted-foreground">نام</th>
                <th className="text-right p-3 font-medium text-muted-foreground hidden md:table-cell">قیمت</th>
                <th className="text-right p-3 font-medium text-muted-foreground hidden lg:table-cell">وضعیت</th>
                <th className="text-right p-3 font-medium text-muted-foreground">برچسب</th>
                <th className="text-right p-3 font-medium text-muted-foreground">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">محصولی یافت نشد</td></tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                    <td className="p-3">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} className="w-14 h-14 object-cover rounded-md border border-border" />
                      ) : (
                        <div className="w-14 h-14 bg-muted rounded-md flex items-center justify-center"><ImageIcon className="w-5 h-5 text-muted-foreground" /></div>
                      )}
                    </td>
                    <td className="p-3">
                      <p className="font-medium text-charcoal">{p.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5" dir="ltr">کد: {getCode(p.id, p.slug)}</p>
                    </td>
                    <td className="p-3 hidden md:table-cell">
                      <div className="flex flex-col">
                        <span className="font-bold text-charcoal">{formatPrice(p.price)} تومان</span>
                        {p.discount && p.discount > 0 ? (
                          <span className="text-xs text-rose">{p.discount}٪ تخفیف</span>
                        ) : null}
                      </div>
                    </td>
                    <td className="p-3 hidden lg:table-cell">
                      <Badge variant={p.active ? 'default' : 'secondary'} className={p.active ? 'bg-emerald-100 text-emerald-700' : ''}>
                        {p.active ? 'فعال' : 'غیرفعال'}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1 flex-wrap">
                        {p.isNew && <Badge className="bg-gold/10 text-gold border-gold/20 text-xs"><Star className="w-3 h-3 ml-1" />جدید</Badge>}
                        {p.isBestseller && <Badge className="bg-rose/10 text-rose border-rose/20 text-xs"><Flame className="w-3 h-3 ml-1" />پرفروش</Badge>}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <Switch checked={p.active} onCheckedChange={() => handleToggleActive(p)} className="data-[state=checked]:bg-gold" />
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(p.id)}><Trash2 className="w-4 h-4" /></Button>
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
        <DialogContent className="sm:max-w-2xl max-h-[90vh]" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'ویرایش محصول' : 'افزودن محصول جدید'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 overflow-y-auto max-h-[65vh] pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>نام محصول</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="نام محصول" />
              </div>
              <div className="space-y-2">
                <Label>کد محصول</Label>
                <Input
                  value={form.productCode}
                  onChange={(e) => { setForm({ ...form, productCode: e.target.value }); setCodeError(''); }}
                  placeholder="مثلاً PRD-1001"
                  dir="ltr"
                />
                {codeError && <p className="text-xs text-destructive">{codeError}</p>}
              </div>
            </div>

            {/* Price + Discount + computed discounted price (main price field removed) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>قیمت (تومان)</Label>
                <Input
                  inputMode="numeric"
                  value={form.price}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  placeholder="0"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label>تخفیف (٪)</Label>
                <Input
                  inputMode="numeric"
                  value={form.discount}
                  onChange={(e) => handleDiscountChange(e.target.value)}
                  placeholder="0"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label>قیمت نهایی (محاسبه)</Label>
                <div className="h-9 flex items-center px-3 rounded-md bg-gold/5 border border-gold/20 text-charcoal font-bold text-sm">
                  {formatPrice(discountedPrice)} تومان
                </div>
              </div>
            </div>

            {/* Main image uploader (kept in sync as first image) */}
            <ImageUpload value={form.imageUrl} onChange={handleMainImageChange} label="تصویر اصلی (همیشه اولین تصویر)" />

            {/* Multi-image uploader replacing the old JSON input */}
            <div className="space-y-2">
              <Label>تصاویر محصول (آپلود چندگانه)</Label>
              <div
                className="border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all border-border hover:border-gold/50 hover:bg-muted/30"
                onClick={() => multiImageInputRef.current?.click()}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-gold" />
                  </div>
                  <p className="text-sm font-medium text-charcoal">کلیک کنید تا تصویر اضافه شود</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG, WebP (حداکثر ۵MB)</p>
                </div>
              </div>
              <input
                ref={multiImageInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = e.target.files;
                  if (!files) return;
                  // Upload each selected file sequentially
                  Array.from(files).forEach((f) => handleAddImage(f));
                  if (multiImageInputRef.current) multiImageInputRef.current.value = '';
                }}
              />
              {images.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2">
                  {images.map((img, i) => (
                    <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
                      <img src={img} alt={`product-${i}`} className="w-full h-full object-cover" />
                      {/* Main image badge */}
                      {i === 0 && (
                        <span className="absolute top-1 right-1 bg-gold text-white text-[10px] px-1.5 py-0.5 rounded">اصلی</span>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); moveImage(i, -1); }}
                          className="w-7 h-7 bg-white/90 rounded flex items-center justify-center"
                          title="بالا"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); moveImage(i, 1); }}
                          className="w-7 h-7 bg-white/90 rounded flex items-center justify-center"
                          title="پایین"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                          className="w-7 h-7 bg-white/90 text-destructive rounded flex items-center justify-center"
                          title="حذف"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>توضیحات</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="توضیحات محصول" rows={3} />
            </div>

            {/* Sizes selector UI (replaces JSON input) */}
            <div className="space-y-2">
              <Label>سایزها</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {sizes.length === 0 && <p className="text-xs text-muted-foreground">سایزی اضافه نشده</p>}
                {sizes.map((s) => (
                  <Badge key={s} className="bg-gold/10 text-gold border-gold/20 gap-1 pr-1">
                    {s}
                    <button type="button" onClick={() => removeSize(s)} className="hover:text-rose">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSize(); } }}
                  placeholder="مثلاً S, M, L, XL"
                />
                <Button type="button" onClick={addSize} className="bg-gold hover:bg-gold-dark text-white">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Colors selector UI (replaces JSON input) */}
            <div className="space-y-2">
              <Label>رنگ‌ها</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {colors.length === 0 && <p className="text-xs text-muted-foreground">رنگی اضافه نشده</p>}
                {colors.map((c, i) => (
                  <div key={i} className="flex items-center gap-1.5 bg-muted/40 border border-border rounded-full pl-1 pr-3 py-1">
                    <span className="w-4 h-4 rounded-full border border-border" style={{ backgroundColor: c.hex }} />
                    <span className="text-xs text-charcoal">{c.name}</span>
                    <button type="button" onClick={() => removeColor(i)} className="hover:text-rose">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 items-center">
                <Input
                  value={newColorName}
                  onChange={(e) => setNewColorName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addColor(); } }}
                  placeholder="نام رنگ (مثلاً مشکی)"
                  className="flex-1"
                />
                <input
                  type="color"
                  value={newColorHex}
                  onChange={(e) => setNewColorHex(e.target.value)}
                  className="h-9 w-12 rounded-md border border-border cursor-pointer bg-transparent"
                  title="انتخاب رنگ"
                />
                <Button type="button" onClick={addColor} className="bg-gold hover:bg-gold-dark text-white">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>دسته‌بندی</Label>
                <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
                  <SelectTrigger><SelectValue placeholder="انتخاب دسته‌بندی" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>ترتیب نمایش</Label>
                {/* Allow clearing the field with backspace: show empty when 0 */}
                <Input inputMode="numeric" value={form.order || ''} onChange={(e) => setForm({ ...form, order: Number(e.target.value.toString().replace(/\D/g, '') || 0) })} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>امتیاز (۱ تا ۵)</Label>
                <Input inputMode="decimal" min={0} max={5} step={0.1} value={form.rating || ''} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>تعداد نظرات</Label>
                <Input inputMode="numeric" value={form.reviewCount || ''} onChange={(e) => setForm({ ...form, reviewCount: Number(e.target.value.toString().replace(/\D/g, '') || 0) })} />
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={form.isNew} onCheckedChange={(c) => setForm({ ...form, isNew: c })} className="data-[state=checked]:bg-gold" />
                <Label className="text-sm">محصول جدید</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.isBestseller} onCheckedChange={(c) => setForm({ ...form, isBestseller: c })} className="data-[state=checked]:bg-rose" />
                <Label className="text-sm">پرفروش</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.active} onCheckedChange={(c) => setForm({ ...form, active: c })} className="data-[state=checked]:bg-emerald-500" />
                <Label className="text-sm">فعال</Label>
              </div>
              {/* Free shipping perk -> shows "ارسال رایگان" under Add to Cart */}
              <div className="flex items-center gap-2">
                <Switch checked={form.freeShipping} onCheckedChange={(c) => setForm({ ...form, freeShipping: c })} className="data-[state=checked]:bg-gold" />
                <Label className="text-sm">ارسال رایگان</Label>
              </div>
              {/* 7-day return guarantee perk -> shows "۷ روز ضمانت بازگشت" under Add to Cart */}
              <div className="flex items-center gap-2">
                <Switch checked={form.returnGuarantee} onCheckedChange={(c) => setForm({ ...form, returnGuarantee: c })} className="data-[state=checked]:bg-gold" />
                <Label className="text-sm">۷ روز ضمانت بازگشت</Label>
              </div>
            </div>

            {/* Save / Cancel buttons (no auto-save) */}
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} className="flex-1 bg-gold hover:bg-gold-dark text-white" disabled={saving}>
                {saving ? <><Loader2 className="w-4 h-4 ml-2 animate-spin" />در حال ذخیره...</> : editingId ? 'بروزرسانی' : 'ذخیره'}
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
            <AlertDialogTitle>حذف محصول</AlertDialogTitle>
            <AlertDialogDescription>آیا از حذف این محصول اطمینان دارید؟ این عمل غیرقابل بازگشت است.</AlertDialogDescription>
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
