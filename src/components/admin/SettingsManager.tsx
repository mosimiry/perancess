'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Save, Loader2, Building2, Phone, Mail, Clock, Share2, Crown, Shield, Plus, Trash2, GripVertical, ListChecks } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ImageUpload from '@/components/shared/ImageUpload';

interface SettingsManagerProps {
  token: string;
  onForceLogout?: () => void;
}

interface Setting {
  key: string;
  value: string;
  label: string;
  group: string;
}

interface FooterSection {
  title: string; // H3 section title
  content: string; // section body content
}
interface FooterServiceItem {
  id: string;
  title: string; // H1 page title
  slug: string; // URL slug
  content: string; // JSON array of FooterSection
  order: number;
  active: boolean;
}

const settingsDefinitions: Omit<Setting, 'value'>[] = [
  // Brand Info
  { key: 'brand_name', label: 'نام برند', group: 'brand' },
  { key: 'brand_tagline', label: 'شعار برند', group: 'brand' },
  { key: 'brand_description', label: 'توضیحات برند', group: 'brand' },
  { key: 'logo_url', label: 'آدرس لوگو', group: 'brand' },
  // Navbar labels - the "Categories" item label shown in the navbar (editable)
  { key: 'nav_categories_label', label: 'عنوان منوی «دسته‌بندی‌ها» در نوار بالا', group: 'brand' },
  // Contact Info
  { key: 'phone', label: 'شماره تلفن', group: 'contact' },
  { key: 'email', label: 'ایمیل', group: 'contact' },
  { key: 'address', label: 'آدرس', group: 'contact' },
  { key: 'working_hours', label: 'ساعات کاری', group: 'contact' },
  { key: 'whatsapp', label: 'شماره واتساپ', group: 'contact' },
  // Social Links
  { key: 'instagram_url', label: 'آدرس اینستاگرام', group: 'social' },
  { key: 'telegram_url', label: 'آدرس تلگرام', group: 'social' },
  { key: 'facebook_url', label: 'آدرس فیس‌بوک', group: 'social' },
  { key: 'pinterest_url', label: 'آدرس پینترست', group: 'social' },
];

const groupInfo: Record<string, { title: string; icon: React.ReactNode }> = {
  brand: { title: 'اطلاعات برند', icon: <Building2 className="w-5 h-5 text-gold" /> },
  contact: { title: 'اطلاعات تماس', icon: <Phone className="w-5 h-5 text-gold" /> },
  social: { title: 'شبکه‌های اجتماعی', icon: <Share2 className="w-5 h-5 text-gold" /> },
};

export default function SettingsManager({ token, onForceLogout }: SettingsManagerProps) {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Credentials state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [credSaving, setCredSaving] = useState(false);

  // Footer service items state (each item is a footer page with H1 title + H3 sections + content)
  const [serviceItems, setServiceItems] = useState<FooterServiceItem[]>([]);
  const [serviceLoading, setServiceLoading] = useState(true);
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  // serviceForm holds the editable footer page fields
  const [serviceForm, setServiceForm] = useState<{ title: string; slug: string; sections: FooterSection[]; order: number; active: boolean }>({ title: '', slug: '', sections: [], order: 0, active: true });
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [deleteServiceId, setDeleteServiceId] = useState<string | null>(null);
  const [serviceSaving, setServiceSaving] = useState(false);

  const { toast } = useToast();

  const authHeaders = { Authorization: `Bearer ${token}` };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings', { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        const map: Record<string, string> = {};
        if (Array.isArray(data)) {
          data.forEach((s: any) => { map[s.key] = s.value || ''; });
        }
        setSettings(map);
      }
    } catch {
      console.log('Error fetching settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchServiceItems = async () => {
    try {
      const res = await fetch('/api/admin/footer-services', { headers: authHeaders });
      if (res.ok) setServiceItems(await res.json());
    } catch {
      console.log('Error fetching footer services');
    } finally {
      setServiceLoading(false);
    }
  };

  useEffect(() => { fetchSettings(); fetchServiceItems(); }, [token]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.entries(settings).map(([key, value]) => ({ key, value }))),
      });
      if (res.ok) {
        toast({ title: 'تنظیمات ذخیره شد', description: 'تمامی تنظیمات با موفقیت بروزرسانی شدند.' });
      }
    } catch {
      console.log('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleCredentialsChange = async () => {
    if (!currentPassword) {
      toast({ title: 'خطا', description: 'لطفاً رمز عبور فعلی را وارد کنید', variant: 'destructive' });
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      toast({ title: 'خطا', description: 'رمز عبور جدید و تکرار آن مطابقت ندارند', variant: 'destructive' });
      return;
    }
    if (!newUsername && !newPassword) {
      toast({ title: 'خطا', description: 'حداقل یکی از فیلدهای نام کاربری یا رمز عبور جدید را وارد کنید', variant: 'destructive' });
      return;
    }

    setCredSaving(true);
    try {
      const res = await fetch('/api/admin/auth/change-credentials', {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newUsername, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: 'موفق', description: 'اطلاعات ورود بروزرسانی شد. لطفاً دوباره وارد شوید.' });
        setCurrentPassword('');
        setNewUsername('');
        setNewPassword('');
        setConfirmPassword('');
        // Force logout after a short delay
        setTimeout(() => onForceLogout?.(), 1500);
      } else {
        toast({ title: 'خطا', description: data.error || 'خطا در بروزرسانی اطلاعات', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'خطا', description: 'خطا در برقراری ارتباط با سرور', variant: 'destructive' });
    } finally {
      setCredSaving(false);
    }
  };

  // Footer service items handlers
  const openCreateService = () => {
    setEditingServiceId(null);
    setServiceForm({ title: '', slug: '', sections: [{ title: '', content: '' }], order: serviceItems.length, active: true });
    setServiceDialogOpen(true);
  };

  const openEditService = (item: FooterServiceItem) => {
    setEditingServiceId(item.id);
    // Parse existing content sections (JSON array of { title, content })
    let sections: FooterSection[] = [];
    try { sections = JSON.parse(item.content || '[]'); } catch { sections = []; }
    if (sections.length === 0) sections = [{ title: '', content: '' }];
    setServiceForm({ title: item.title, slug: item.slug, sections, order: item.order, active: item.active });
    setServiceDialogOpen(true);
  };

  // Update a single footer section field by index
  const updateSection = (index: number, field: keyof FooterSection, value: string) => {
    setServiceForm((prev) => {
      const next = [...prev.sections];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, sections: next };
    });
  };
  const addSection = () => {
    setServiceForm((prev) => ({ ...prev, sections: [...prev.sections, { title: '', content: '' }] }));
  };
  const removeSection = (index: number) => {
    setServiceForm((prev) => ({ ...prev, sections: prev.sections.filter((_, i) => i !== index) }));
  };

  const handleSaveService = async () => {
    setServiceSaving(true);
    try {
      // Build payload with H1 title, slug and JSON sections content
      const payload = {
        title: serviceForm.title,
        slug: serviceForm.slug,
        content: JSON.stringify(serviceForm.sections.filter((s) => s.title || s.content)),
        order: serviceForm.order,
        active: serviceForm.active,
      };
      const url = editingServiceId
        ? `/api/admin/footer-services/${editingServiceId}`
        : '/api/admin/footer-services';
      const res = await fetch(url, {
        method: editingServiceId ? 'PUT' : 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setServiceDialogOpen(false);
        fetchServiceItems();
      }
    } catch {
      console.log('Error saving service item');
    } finally {
      setServiceSaving(false);
    }
  };

  const handleDeleteService = async () => {
    if (!deleteServiceId) return;
    try {
      await fetch(`/api/admin/footer-services/${deleteServiceId}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      fetchServiceItems();
    } catch {
      console.log('Error deleting service item');
    } finally {
      setDeleteServiceId(null);
    }
  };

  const handleToggleServiceActive = (item: FooterServiceItem) => {
    // Optimistic update: flip local state instantly, sync in background.
    const next = !item.active;
    setServiceItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, active: next } : i)));
    fetch(`/api/admin/footer-services/${item.id}`, {
      method: 'PUT',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...item, active: next }),
    }).catch(() => {
      setServiceItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, active: item.active } : i)));
    });
  };


  if (loading || serviceLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const groups = ['brand', 'contact', 'social'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-charcoal">تنظیمات سایت</h2>
        <Button onClick={handleSave} className="bg-gold hover:bg-gold-dark text-white" disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Save className="w-4 h-4 ml-2" />}
          {saving ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}
        </Button>
      </div>

      {/* Logo Upload */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-charcoal flex items-center gap-2">
            <Crown className="w-5 h-5 text-gold" />
            تصویر لوگو
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUpload
            value={settings['princess_logo_url'] || ''}
            onChange={(url) => updateSetting('princess_logo_url', url)}
          />
          <p className="text-xs text-muted-foreground mt-2">این تصویر در نوار بالایی سایت و فوتر نمایش داده می‌شود.</p>
        </CardContent>
      </Card>

      <Separator className="my-4" />

      {groups.map((group, gi) => {
        const info = groupInfo[group];
        const groupSettings = settingsDefinitions.filter((s) => s.group === group);

        return (
          <div key={group}>
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-charcoal flex items-center gap-2">
                  {info.icon}
                  {info.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {groupSettings.map((def) => (
                  <div key={def.key} className="space-y-1.5">
                    <Label className="text-sm text-muted-foreground">{def.label}</Label>
                    <Input
                      value={settings[def.key] || ''}
                      onChange={(e) => updateSetting(def.key, e.target.value)}
                      placeholder={def.label}
                      dir={def.key.includes('url') || def.key === 'email' ? 'ltr' : 'rtl'}
                      className="bg-cream/30"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
            {gi < groups.length - 1 && <Separator className="my-4" />}
          </div>
        );
      })}

      <Separator className="my-4" />

      {/* Footer Service Items Management */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-charcoal flex items-center gap-2">
              <ListChecks className="w-5 h-5 text-gold" />
              خدمات مشتریان (فوتر)
            </CardTitle>
            <Button onClick={openCreateService} size="sm" className="bg-gold hover:bg-gold-dark text-white">
              <Plus className="w-4 h-4 ml-1" />
              افزودن
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {serviceItems.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">موردی وجود ندارد</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {serviceItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/40">
                  <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-charcoal">{item.title}</p>
                    {item.slug && <p className="text-xs text-muted-foreground" dir="ltr">/{item.slug}</p>}
                  </div>
                  <Badge variant={item.active ? 'default' : 'secondary'} className={item.active ? 'bg-emerald-100 text-emerald-700 text-xs' : 'text-xs'}>
                    {item.active ? 'فعال' : 'غیرفعال'}
                  </Badge>
                  <Switch checked={item.active} onCheckedChange={() => handleToggleServiceActive(item)} className="data-[state=checked]:bg-gold scale-75" />
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditService(item)} title="ویرایش">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteServiceId(item.id)} title="حذف">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Service Item Dialog (footer page editor: H1 title + H3 sections + content) */}
      <Dialog open={serviceDialogOpen} onOpenChange={setServiceDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh]" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editingServiceId ? 'ویرایش صفحه فوتر' : 'افزودن صفحه فوتر جدید'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 overflow-y-auto max-h-[65vh] pr-1">
            {/* H1 page title */}
            <div className="space-y-1.5">
              <Label>عنوان صفحه (H1)</Label>
              <Input
                value={serviceForm.title}
                onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                placeholder="مثلاً: نحوه ارسال"
              />
            </div>
            {/* URL slug used by the footer-page route */}
            <div className="space-y-1.5">
              <Label>اسلاگ (URL)</Label>
              <Input
                value={serviceForm.slug}
                onChange={(e) => setServiceForm({ ...serviceForm, slug: e.target.value })}
                placeholder="مثلاً: shipping"
                dir="ltr"
              />
            </div>
            {/* H3 sections with content - dynamic list */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>بخش‌های صفحه (H3 + محتوا)</Label>
                <Button type="button" size="sm" variant="outline" onClick={addSection}>
                  <Plus className="w-4 h-4 ml-1" />
                  افزودن بخش
                </Button>
              </div>
              {serviceForm.sections.map((sec, i) => (
                <div key={i} className="p-3 rounded-lg border border-border bg-muted/20 space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      value={sec.title}
                      onChange={(e) => updateSection(i, 'title', e.target.value)}
                      placeholder="عنوان بخش (H3)"
                      className="flex-1"
                    />
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeSection(i)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <Textarea
                    value={sec.content}
                    onChange={(e) => updateSection(i, 'content', e.target.value)}
                    placeholder="محتوای این بخش"
                    rows={3}
                  />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>ترتیب نمایش</Label>
                <Input
                  inputMode="numeric"
                  value={serviceForm.order}
                  onChange={(e) => setServiceForm({ ...serviceForm, order: Number(e.target.value.toString().replace(/\D/g, '') || 0) })}
                />
              </div>
              <div className="flex items-center justify-between pt-6">
                <Label>فعال</Label>
                <Switch checked={serviceForm.active} onCheckedChange={(c) => setServiceForm({ ...serviceForm, active: c })} className="data-[state=checked]:bg-gold" />
              </div>
            </div>
            {/* Save / Cancel buttons (no auto-save) */}
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSaveService} className="flex-1 bg-gold hover:bg-gold-dark text-white" disabled={serviceSaving}>
                {serviceSaving ? <><Loader2 className="w-4 h-4 ml-2 animate-spin" />در حال ذخیره...</> : 'ذخیره'}
              </Button>
              <Button variant="outline" onClick={() => setServiceDialogOpen(false)}>انصراف</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Service Item Delete Confirmation */}
      <AlertDialog open={!!deleteServiceId} onOpenChange={(open) => !open && setDeleteServiceId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف آیتم</AlertDialogTitle>
            <AlertDialogDescription>آیا از حذف این آیتم اطمینان دارید؟</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteService} className="bg-destructive hover:bg-destructive/90">حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Separator className="my-4" />

      {/* Admin Credentials Change */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-charcoal flex items-center gap-2">
            <Shield className="w-5 h-5 text-gold" />
            تغییر نام کاربری و رمز عبور
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">رمز عبور فعلی</Label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="رمز عبور فعلی خود را وارد کنید"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">نام کاربری جدید</Label>
            <Input
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="نام کاربری جدید (اختیاری)"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">رمز عبور جدید</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="رمز عبور جدید (اختیاری)"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">تکرار رمز عبور جدید</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="تکرار رمز عبور جدید"
              />
            </div>
          </div>
          <Button
            onClick={handleCredentialsChange}
            className="bg-gold hover:bg-gold-dark text-white"
            disabled={credSaving}
          >
            {credSaving ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Shield className="w-4 h-4 ml-2" />}
            {credSaving ? 'در حال بروزرسانی...' : 'بروزرسانی اطلاعات'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}