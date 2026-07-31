'use client';

import { useState } from 'react';
import AdminLogin from './AdminLogin';
import AdminLayout from './AdminLayout';
import Dashboard from './Dashboard';
import SlidesManager from './SlidesManager';
import CategoriesManager from './CategoriesManager';
import ProductsManager from './ProductsManager';
import TestimonialsManager from './TestimonialsManager';
import FaqsManager from './FaqsManager';
import MessagesManager from './MessagesManager';
import InstagramManager from './InstagramManager';
import SettingsManager from './SettingsManager';
import PagesManager from './PagesManager';

export default function AdminPanel() {
  const [token, setToken] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('dashboard');

  if (!token) {
    return <AdminLogin onLogin={(t) => setToken(t)} />;
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard': return <Dashboard token={token} />;
      case 'slides': return <SlidesManager token={token} />;
      case 'categories': return <CategoriesManager token={token} />;
      case 'products': return <ProductsManager token={token} />;
      case 'testimonials': return <TestimonialsManager token={token} />;
      case 'faqs': return <FaqsManager token={token} />;
      case 'messages': return <MessagesManager token={token} />;
      case 'instagram': return <InstagramManager token={token} />;
      case 'settings': return <SettingsManager token={token} />;
      case 'pages': return <PagesManager token={token} />;
      default: return <Dashboard token={token} />;
    }
  };

  return (
    <AdminLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      onLogout={() => setToken(null)}
      token={token}
    >
      {renderContent()}
    </AdminLayout>
  );
}