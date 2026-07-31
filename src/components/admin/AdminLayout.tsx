'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
// Admin sidebar menu items - each maps to a manager section
import { Crown, LayoutDashboard, Image, Grid3X3, ShoppingBag, MessageSquare, HelpCircle, Mail, Instagram, Settings, FileText, LogOut, ChevronRight, Menu, Eye, Package } from 'lucide-react';

// Sidebar navigation items config
const menuItems = [
  { id: 'dashboard', label: 'داشبورد', icon: LayoutDashboard },
  { id: 'slides', label: 'اسلایدر', icon: Image },
  { id: 'categories', label: 'دسته‌بندی‌ها', icon: Grid3X3 },
  { id: 'products', label: 'محصولات', icon: ShoppingBag },
  { id: 'orders', label: 'سفارش‌ها', icon: Package },
  { id: 'testimonials', label: 'نظرات مشتریان', icon: MessageSquare },
  { id: 'faqs', label: 'سوالات متداول', icon: HelpCircle },
  { id: 'messages', label: 'پیام‌ها', icon: Mail },
  { id: 'instagram', label: 'اینستاگرام', icon: Instagram },
  { id: 'settings', label: 'تنظیمات', icon: Settings },
  { id: 'pages', label: 'صفحات', icon: FileText },
];

function SidebarNav({
  activeSection,
  onSectionChange,
  onLogout,
  onCloseMobile,
  collapsed,
}: {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
  onCloseMobile?: () => void;
  collapsed: boolean;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Brand logo block */}
      <div className="p-4 flex items-center gap-3 border-b border-border">
        <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
          <Crown className="w-5 h-5 text-gold" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h2 className="font-bold text-charcoal text-lg whitespace-nowrap">پرنسس</h2>
            <p className="text-xs text-muted-foreground whitespace-nowrap">بوتیک لوکس زنانه</p>
          </div>
        )}
      </div>

      {/* Navigation list */}
      <ScrollArea className="flex-1 py-2">
        <nav className="space-y-1 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  // Switch active section; close mobile drawer if open
                  onSectionChange(item.id);
                  onCloseMobile?.();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? 'bg-gold text-white shadow-sm'
                    : 'text-charcoal/70 hover:bg-gold/10 hover:text-charcoal'
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gold'}`} />
                {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </ScrollArea>

      {/* View Site link - opens site homepage in a new tab */}
      <div className="px-2 pb-2">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
            text-charcoal/70 hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-200 group"
        >
          <Eye className="w-5 h-5 flex-shrink-0 text-emerald-600 group-hover:text-emerald-700" />
          {!collapsed && <span className="whitespace-nowrap">مشاهده سایت</span>}
        </a>
      </div>

      {/* Logout button */}
      <div className="p-2 border-t border-border">
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
            text-destructive/70 hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>خروج</span>}
        </button>
      </div>
    </div>
  );
}

interface AdminLayoutProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
  token: string;
  children: React.ReactNode;
}

export default function AdminLayout({
  activeSection,
  onSectionChange,
  onLogout,
  children,
}: AdminLayoutProps) {
  // Desktop sidebar collapse state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // Mobile sidebar open state
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-cream flex" dir="rtl">
      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile menu toggle button */}
      <button
        type="button"
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 right-4 z-50 lg:hidden bg-white rounded-lg shadow-md p-2 border border-border"
      >
        <Menu className="w-5 h-5 text-charcoal" />
      </button>

      {/* Desktop sidebar */}
      <aside
        className={
          `hidden lg:flex flex-col h-screen sticky top-0 bg-white border-l border-border
          transition-all duration-300 z-30
          ${sidebarCollapsed ? 'w-16' : 'w-60'}`
        }
      >
        <SidebarNav
          activeSection={activeSection}
          onSectionChange={onSectionChange}
          onLogout={onLogout}
          collapsed={sidebarCollapsed}
        />
        {/* Collapse toggle button */}
        <button
          type="button"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -left-3 top-20 w-6 h-6 bg-white border border-border rounded-full flex items-center justify-center
            shadow-sm hover:bg-cream transition-colors z-10"
        >
          <ChevronRight className={`w-3 h-3 text-charcoal transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
        </button>
      </aside>

      {/* Mobile sidebar drawer */}
      <aside
        className={
          `fixed right-0 top-0 h-screen bg-white border-l border-border z-40
          w-60 transition-transform duration-300 lg:hidden
          ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`
        }
      >
        <SidebarNav
          activeSection={activeSection}
          onSectionChange={onSectionChange}
          onLogout={onLogout}
          onCloseMobile={() => setMobileOpen(false)}
          collapsed={false}
        />
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top header bar */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-border h-16 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-3 mr-10 lg:mr-0">
            <h1 className="text-lg font-bold text-charcoal hidden sm:block">
              پنل مدیریت پرنسس
            </h1>
            <span className="text-sm text-muted-foreground hidden md:block">
              — {menuItems.find((i) => i.id === activeSection)?.label || ''}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
              <Crown className="w-4 h-4 text-gold" />
            </div>
            <span className="text-sm font-medium text-charcoal hidden sm:block">مدیر سایت</span>
          </div>
        </header>

        {/* Routed page content */}
        <main className="flex-1 p-4 lg:p-8">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Unused Button import kept for potential header actions */}
      <span className="hidden"><Button /></span>
    </div>
  );
}
