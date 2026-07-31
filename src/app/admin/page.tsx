'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminLogin from '@/components/admin/AdminLogin';
import AdminLayout from '@/components/admin/AdminLayout';
import Dashboard from '@/components/admin/Dashboard';
import SlidesManager from '@/components/admin/SlidesManager';
import CategoriesManager from '@/components/admin/CategoriesManager';
import ProductsManager from '@/components/admin/ProductsManager';
import TestimonialsManager from '@/components/admin/TestimonialsManager';
import FaqsManager from '@/components/admin/FaqsManager';
import MessagesManager from '@/components/admin/MessagesManager';
import InstagramManager from '@/components/admin/InstagramManager';
import SettingsManager from '@/components/admin/SettingsManager';
import PagesManager from '@/components/admin/PagesManager';
import OrdersManager from '@/components/admin/OrdersManager';
import { Loader2 } from 'lucide-react';

type AuthState = 'loading' | 'unauthenticated' | 'authenticated';

export default function AdminPage() {
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [token, setToken] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('dashboard');

  // Verify token with server on mount and after credential changes
  const validateToken = useCallback(async (savedToken: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/auth/verify', {
        headers: { Authorization: `Bearer ${savedToken}` },
      });
      return res.ok;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('admin_token');
    if (!saved) {
      // Defer state update to avoid synchronous setState in effect
      const id = requestAnimationFrame(() => setAuthState('unauthenticated'));
      return () => cancelAnimationFrame(id);
    }
    // Verify token is still valid on server
    validateToken(saved).then((valid) => {
      if (valid) {
        setToken(saved);
        setAuthState('authenticated');
      } else {
        localStorage.removeItem('admin_token');
        setAuthState('unauthenticated');
      }
    });
  }, [validateToken]);

  const handleLogin = (t: string) => {
    localStorage.setItem('admin_token', t);
    setToken(t);
    setAuthState('authenticated');
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
    setAuthState('unauthenticated');
  };

  // Force logout (e.g. after credential change)
  const handleForceLogout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
    setAuthState('unauthenticated');
  };

  // Loading state - prevents hydration mismatch
  if (authState === 'loading') {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
      </div>
    );
  }

  if (authState === 'unauthenticated') {
    return <AdminLogin onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard': return <Dashboard token={token!} />;
      case 'slides': return <SlidesManager token={token!} />;
      case 'categories': return <CategoriesManager token={token!} />;
      case 'products': return <ProductsManager token={token!} />;
      case 'orders': return <OrdersManager token={token!} />;
      case 'testimonials': return <TestimonialsManager token={token!} />;
      case 'faqs': return <FaqsManager token={token!} />;
      case 'messages': return <MessagesManager token={token!} />;
      case 'instagram': return <InstagramManager token={token!} />;
      case 'settings': return <SettingsManager token={token!} onForceLogout={handleForceLogout} />;
      case 'pages': return <PagesManager token={token!} />;
      default: return <Dashboard token={token!} />;
    }
  };

  return (
    <AdminLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      onLogout={handleLogout}
      token={token!}
    >
      {renderContent()}
    </AdminLayout>
  );
}