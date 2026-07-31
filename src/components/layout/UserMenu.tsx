'use client';

import { useState } from 'react';
import { User as UserIcon, UserCircle, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigationStore } from '@/lib/store';
import LoginModal from '@/components/auth/LoginModal';

interface UserMenuProps {
  isTransparent: boolean;
  /** 'icon' for the header, 'full' for the mobile sheet row. */
  variant?: 'icon' | 'full';
}

export default function UserMenu({ isTransparent, variant = 'icon' }: UserMenuProps) {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const { navigateTo } = useNavigationStore();
  const [modalOpen, setModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast({ title: 'خارج شدید', description: 'با موفقیت از حساب خود خارج شدید.' });
  };

  const goToProfile = () => {
    navigateTo('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const iconBtnClass = `p-2 rounded-full transition-colors duration-300 ${
    isTransparent ? 'text-white hover:bg-white/10' : 'text-charcoal hover:bg-muted'
  }`;

  const displayName = user?.name?.trim() || user?.email?.split('@')[0] || 'کاربر';

  // ---- Mobile sheet variant ----
  if (variant === 'full') {
    if (user) {
      return (
        <div className="px-6 py-4 border-t border-border space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10 text-gold">
              <UserIcon size={20} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-charcoal">{displayName}</p>
              <p className="truncate text-xs text-muted-foreground" dir="ltr">
                {user.email}
              </p>
            </div>
          </div>
          <button
            onClick={goToProfile}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-charcoal hover:bg-muted transition-colors"
          >
            <UserCircle size={18} />
            پروفایل من
          </button>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/5 transition-colors"
          >
            <LogOut size={18} />
            خروج از حساب
          </button>
        </div>
      );
    }
    return (
      <div className="px-6 py-4 border-t border-border">
        <button
          onClick={() => setModalOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-gold py-2.5 text-sm font-medium text-white hover:bg-gold-dark transition-colors"
        >
          <UserIcon size={18} />
          ورود / ثبت‌نام
        </button>
        <LoginModal open={modalOpen} onOpenChange={setModalOpen} />
      </div>
    );
  }

  // ---- Header icon variant ----
  if (!user) {
    return (
      <>
        <button className={iconBtnClass} aria-label="ورود به حساب کاربری" onClick={() => setModalOpen(true)}>
          <UserIcon size={20} />
        </button>
        <LoginModal open={modalOpen} onOpenChange={setModalOpen} />
      </>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={iconBtnClass} aria-label="منوی حساب کاربری">
          <UserCircle size={22} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-charcoal">{displayName}</span>
            <span className="truncate text-xs font-normal text-muted-foreground" dir="ltr">
              {user.email}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onClick={goToProfile}>
          <UserCircle size={16} className="ml-2" />
          پروفایل من
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut size={16} className="ml-2" />
          خروج از حساب
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
