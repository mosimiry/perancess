'use client';

import { useSyncExternalStore, useCallback } from 'react';

const CART_KEY = 'perancess_cart';

export interface CartItem {
  productId: string;
  productCode: string;
  name: string;
  image: string;
  price: number; // unit price
  quantity: number;
  // Selected variant (optional) — captured on the product detail page
  color?: string;
  size?: string;
}

function readCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    return Array.isArray(raw) ? (raw as CartItem[]) : [];
  } catch {
    return [];
  }
}

const listeners = new Set<() => void>();
let snapshot: CartItem[] = readCart();

function emit(next: CartItem[]): void {
  snapshot = next;
  if (typeof window !== 'undefined') {
    localStorage.setItem(CART_KEY, JSON.stringify(next));
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === CART_KEY) {
      snapshot = readCart();
      cb();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener('storage', onStorage);
  };
}

function getSnapshot(): CartItem[] {
  return snapshot;
}

function getServerSnapshot(): CartItem[] {
  return [];
}

export function useCart() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>, qty = 1) => {
    const current = readCart();
    const existing = current.find((c) => c.productId === item.productId);
    if (existing) {
      emit(
        current.map((c) =>
          c.productId === item.productId ? { ...c, quantity: c.quantity + qty } : c
        )
      );
    } else {
      emit([...current, { ...item, quantity: qty }]);
    }
  }, []);

  const increase = useCallback((productId: string) => {
    emit(readCart().map((c) => (c.productId === productId ? { ...c, quantity: c.quantity + 1 } : c)));
  }, []);

  const decrease = useCallback((productId: string) => {
    emit(
      readCart()
        .map((c) => (c.productId === productId ? { ...c, quantity: c.quantity - 1 } : c))
        .filter((c) => c.quantity > 0)
    );
  }, []);

  const removeItem = useCallback((productId: string) => {
    emit(readCart().filter((c) => c.productId !== productId));
  }, []);

  const clearCart = useCallback(() => emit([]), []);

  const count = items.reduce((sum, c) => sum + c.quantity, 0);
  const total = items.reduce((sum, c) => sum + c.price * c.quantity, 0);

  return { items, count, total, addItem, increase, decrease, removeItem, clearCart };
}
