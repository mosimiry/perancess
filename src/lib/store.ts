import { create } from 'zustand';
import type { PageView } from '@/types';

interface NavigationState {
  currentPage: PageView;
  selectedProductId: string | null;
  selectedCategorySlug: string | null;
  // Slug of the footer page being viewed (for 'footer-page' PageView)
  selectedFooterPageSlug: string | null;
  // Product search query (by name or productCode), shared header <-> products page
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  setCurrentPage: (page: PageView) => void;
  setSelectedProduct: (id: string | null) => void;
  setSelectedCategory: (slug: string | null) => void;
  setSelectedFooterPageSlug: (slug: string | null) => void;
  navigateTo: (page: PageView, productId?: string, categorySlug?: string, footerPageSlug?: string) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  currentPage: 'home',
  selectedProductId: null,
  selectedCategorySlug: null,
  selectedFooterPageSlug: null,
  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setSelectedProduct: (id) => set({ selectedProductId: id }),
  setSelectedCategory: (slug) => set({ selectedCategorySlug: slug }),
  setSelectedFooterPageSlug: (slug) => set({ selectedFooterPageSlug: slug }),
  navigateTo: (page, productId, categorySlug, footerPageSlug) => set({
    currentPage: page,
    selectedProductId: productId ?? null,
    selectedCategorySlug: categorySlug ?? null,
    selectedFooterPageSlug: footerPageSlug ?? null,
  }),
}));
