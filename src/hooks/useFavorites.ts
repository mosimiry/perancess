'use client';

import { useSyncExternalStore, useCallback } from 'react';

const FAVORITES_KEY = 'perancess_favorites';

// ---- localStorage-backed favorites store (no backend) ----

function readFavorites(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
    return Array.isArray(raw) ? raw.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

const listeners = new Set<() => void>();
let snapshot: string[] = readFavorites();

function emit(next: string[]): void {
  snapshot = next;
  if (typeof window !== 'undefined') {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === FAVORITES_KEY) {
      snapshot = readFavorites();
      cb();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener('storage', onStorage);
  };
}

function getSnapshot(): string[] {
  return snapshot;
}

function getServerSnapshot(): string[] {
  return [];
}

export function useFavorites() {
  const favorites = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const isFavorite = useCallback(
    (id: string) => favorites.includes(id),
    [favorites]
  );

  const toggleFavorite = useCallback((id: string) => {
    const current = readFavorites();
    const next = current.includes(id)
      ? current.filter((x) => x !== id)
      : [...current, id];
    emit(next);
  }, []);

  const removeFavorite = useCallback((id: string) => {
    emit(readFavorites().filter((x) => x !== id));
  }, []);

  const clearFavorites = useCallback(() => {
    emit([]);
  }, []);

  return {
    favorites,
    count: favorites.length,
    isFavorite,
    toggleFavorite,
    removeFavorite,
    clearFavorites,
  };
}
