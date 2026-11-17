'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, X, ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
}

export default function ImageUpload({ value, onChange, label, className = '' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('فرمت فایل پشتیبانی نمی‌شود');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('حجم فایل نباید بیشتر از ۵ مگابایت باشد');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
      const headers: HeadersInit = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/upload', { method: 'POST', body: formData, headers });
      if (res.ok) {
        const data = await res.json();
        onChange(data.url);
      } else {
        const data = await res.json();
        alert(data.error || 'خطا در آپلود');
      }
    } catch {
      alert('خطا در آپلود فایل');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  const handleRemove = () => {
    onChange('');
  };

  return (
    <div className={className}>
      {label && <p className="text-sm font-medium text-charcoal mb-2">{label}</p>}

      {value ? (
        <div className="relative rounded-xl overflow-hidden border border-border group">
          <img src={value} alt="uploaded" className="w-full h-48 object-cover" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fileRef.current?.click()}
              >
                <Upload className="w-4 h-4 ml-1" />
                تغییر
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleRemove}
                className="text-destructive"
              >
                <X className="w-4 h-4 ml-1" />
                حذف
              </Button>
            </div>
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          )}
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
            ${dragOver ? 'border-gold bg-gold/5' : 'border-border hover:border-gold/50 hover:bg-muted/30'}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 text-gold animate-spin" />
              <p className="text-sm text-muted-foreground">در حال آپلود...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-gold" />
              </div>
              <div>
                <p className="text-sm font-medium text-charcoal">کلیک کنید یا فایل بکشید</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WebP, GIF (حداکثر ۵MB)</p>
              </div>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}