'use client';

import { useSyncExternalStore, useCallback } from 'react';

const MESSAGES_KEY = 'perancess_contact_messages';

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  isRead: boolean; // false = unread, true = read
  createdAt: string;
}

function readMessages(): ContactMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = JSON.parse(localStorage.getItem(MESSAGES_KEY) || '[]');
    return Array.isArray(raw) ? (raw as ContactMessage[]) : [];
  } catch {
    return [];
  }
}

const listeners = new Set<() => void>();
let snapshot: ContactMessage[] = readMessages();

function emit(next: ContactMessage[]): void {
  snapshot = next;
  if (typeof window !== 'undefined') {
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(next));
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === MESSAGES_KEY) {
      snapshot = readMessages();
      cb();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener('storage', onStorage);
  };
}

function getSnapshot(): ContactMessage[] {
  return snapshot;
}

function getServerSnapshot(): ContactMessage[] {
  return [];
}

export function useContactMessages() {
  const messages = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const addMessage = useCallback(
    (data: Omit<ContactMessage, 'id' | 'isRead' | 'createdAt'>): ContactMessage => {
      const msg: ContactMessage = {
        ...data,
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      // newest first
      emit([msg, ...readMessages()]);
      return msg;
    },
    []
  );

  const toggleRead = useCallback((id: string) => {
    emit(readMessages().map((m) => (m.id === id ? { ...m, isRead: !m.isRead } : m)));
  }, []);

  const setRead = useCallback((id: string, isRead: boolean) => {
    emit(readMessages().map((m) => (m.id === id ? { ...m, isRead } : m)));
  }, []);

  const removeMessage = useCallback((id: string) => {
    emit(readMessages().filter((m) => m.id !== id));
  }, []);

  return { messages, addMessage, toggleRead, setRead, removeMessage };
}
