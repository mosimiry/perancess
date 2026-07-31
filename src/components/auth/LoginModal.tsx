'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User as UserIcon, Eye, EyeOff } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Mode = 'login' | 'register';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const { login, register } = useAuth();
  const { toast } = useToast();

  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const reset = () => {
    setName('');
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setError('');
    setMode('login');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('لطفاً همه فیلدها را پر کنید');
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setError('ایمیل معتبر وارد کنید');
      return;
    }
    if (password.length < 6) {
      setError('رمز عبور باید حداقل ۶ کاراکتر باشد');
      return;
    }

    const result =
      mode === 'login'
        ? login(email.trim(), password)
        : register(email.trim(), password, name.trim());

    if (!result.ok) {
      setError(result.error);
      return;
    }

    toast({
      title: mode === 'login' ? 'خوش آمدید 🌸' : 'حساب شما ساخته شد 🌸',
      description: 'با موفقیت وارد شدید.',
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none bg-white" dir="rtl">
        <div className="bg-gradient-to-l from-gold to-gold-dark px-6 py-7 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
            <UserIcon className="text-white" size={26} />
          </div>
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-xl font-bold text-white">
              {mode === 'login' ? 'ورود به حساب کاربری' : 'ساخت حساب کاربری'}
            </DialogTitle>
            <DialogDescription className="text-sm text-white/85">
              {mode === 'login'
                ? 'برای ادامه، ایمیل و رمز عبور خود را وارد کنید'
                : 'برای عضویت، اطلاعات زیر را تکمیل کنید'}
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6" noValidate>
          <AnimatePresence mode="wait">
            {mode === 'register' && (
              <motion.div
                key="name"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1.5"
              >
                <Label htmlFor="auth-name" className="text-charcoal">
                  نام (اختیاری)
                </Label>
                <div className="relative">
                  <UserIcon size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="auth-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="نام شما"
                    className="pr-10"
                    autoComplete="name"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-1.5">
            <Label htmlFor="auth-email" className="text-charcoal">
              ایمیل
            </Label>
            <div className="relative">
              <Mail size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="pr-10"
                autoComplete={mode === 'login' ? 'email' : 'off'}
                dir="ltr"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="auth-password" className="text-charcoal">
              رمز عبور
            </Label>
            <div className="relative">
              <Lock size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pr-10 pl-10"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-charcoal transition-colors"
                aria-label={showPassword ? 'پنهان کردن رمز' : 'نمایش رمز'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
                role="alert"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <Button type="submit" className="w-full bg-gold hover:bg-gold-dark text-white font-medium">
            {mode === 'login' ? 'ورود' : 'ثبت‌نام'}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {mode === 'login' ? 'حساب کاربری ندارید؟ ' : 'قبلاً ثبت‌نام کرده‌اید؟ '}
            <button
              type="button"
              onClick={() => {
                // Switch mode and clear all fields so Sign Up starts EMPTY (no prefill).
                setMode(mode === 'login' ? 'register' : 'login');
                setName('');
                setEmail('');
                setPassword('');
                setShowPassword(false);
                setError('');
              }}
              className="font-medium text-gold hover:text-gold-dark transition-colors"
            >
              {mode === 'login' ? 'ثبت‌نام کنید' : 'وارد شوید'}
            </button>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
