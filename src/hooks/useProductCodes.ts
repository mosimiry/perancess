'use client';

import { useSyncExternalStore, useCallback } from 'react';

const CODES_KEY = 'perancess_product_codes';

// Maps productId -> productCode. productCode replaces the old `slug` and must be unique.
type CodeMap = Record<string, string>;

export function readProductCodes(): CodeMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = JSON.parse(localStorage.getItem(CODES_KEY) || '{}');
    return raw && typeof raw === 'object' ? (raw as CodeMap) : {};
  } catch {
    return {};
  }
}

// Resolve a product's code, falling back to a stable default when none is set yet.
export function resolveProductCode(id: string, fallbackSeed?: string): string {
  const map = readProductCodes();
  if (map[id]) return map[id];
  // Default code derived from a seed (e.g. former slug) or the id itself.
  return (fallbackSeed && fallbackSeed.trim()) || id;
}

const listeners = new Set<() => void>();
let snapshot: CodeMap = readProductCodes();

function emit(next: CodeMap): void {
  snapshot = next;
  if (typeof window !== 'undefined') {
    localStorage.setItem(CODES_KEY, JSON.stringify(next));
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === CODES_KEY) {
      snapshot = readProductCodes();
      cb();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener('storage', onStorage);
  };
}

function getSnapshot(): CodeMap {
  return snapshot;
}

function getServerSnapshot(): CodeMap {
  return {};
}

export function useProductCodes() {
  const codes = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const getCode = useCallback(
    (id: string, fallbackSeed?: string) => codes[id] || fallbackSeed || id,
    [codes]
  );

  // True when `code` is not already used by a different product.
  const isUnique = useCallback(
    (code: string, excludeId?: string) => {
      const c = code.trim().toLowerCase();
      if (!c) return false;
      return !Object.entries(codes).some(
        ([id, val]) => id !== excludeId && val.trim().toLowerCase() === c
      );
    },
    [codes]
  );

  const setCode = useCallback((id: string, code: string) => {
    const next = { ...readProductCodes(), [id]: code.trim() };
    emit(next);
  }, []);

  const removeCode = useCallback((id: string) => {
    const next = { ...readProductCodes() };
    delete next[id];
    emit(next);
  }, []);

  return { codes, getCode, isUnique, setCode, removeCode };
}
