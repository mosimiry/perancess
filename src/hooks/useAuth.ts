'use client';

import { useSyncExternalStore, useCallback } from 'react';

export interface AuthUser {
  email: string;
  name: string;
}

interface StoredUser extends AuthUser {
  passwordHash: string;
}

export type AuthResult = { ok: true } | { ok: false; error: string };

const USERS_KEY = 'perancess_users';
const SESSION_KEY = 'perancess_session';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Lightweight non-reversible hash so raw passwords are never kept in localStorage.
function hashPassword(pw: string): string {
  let h = 5381;
  for (let i = 0; i < pw.length; i++) {
    h = (Math.imul(33, h) ^ pw.charCodeAt(i)) >>> 0;
  }
  return `${h.toString(36)}:${pw.length}`;
}

function readUsers(): StoredUser[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]') as StoredUser[];
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Default storefront account seeded on first load: abcd@email.com / abcd123
const DEFAULT_EMAIL = 'abcd@email.com';
const DEFAULT_PASSWORD = 'abcd123';

function ensureDefaultUser(): void {
  if (typeof window === 'undefined') return;
  try {
    const users = readUsers();
    if (!users.some((u) => u.email === DEFAULT_EMAIL)) {
      writeUsers([
        ...users,
        { email: DEFAULT_EMAIL, name: 'کاربر پرنسس', passwordHash: hashPassword(DEFAULT_PASSWORD) },
      ]);
    }
  } catch {
    // ignore seeding errors
  }
}

// Seed the default account as soon as this module loads on the client.
ensureDefaultUser();

function readSession(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null') as AuthUser | null;
  } catch {
    return null;
  }
}

const listeners = new Set<() => void>();
let snapshot: AuthUser | null = readSession();

function setSession(user: AuthUser | null): void {
  snapshot = user;
  if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  else localStorage.removeItem(SESSION_KEY);
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === SESSION_KEY) {
      snapshot = readSession();
      cb();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener('storage', onStorage);
  };
}

function getSnapshot(): AuthUser | null {
  return snapshot;
}

function getServerSnapshot(): AuthUser | null {
  return null;
}

export function useAuth() {
  const user = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const register = useCallback((email: string, password: string, name = ''): AuthResult => {
    const e = email.trim().toLowerCase();
    if (!e || !password) return { ok: false, error: 'لطفاً همه فیلدها را پر کنید' };
    if (!EMAIL_RE.test(e)) return { ok: false, error: 'ایمیل معتبر وارد کنید' };
    if (password.length < 6) return { ok: false, error: 'رمز عبور باید حداقل ۶ کاراکتر باشد' };

    const users = readUsers();
    if (users.some((u) => u.email === e)) {
      return { ok: false, error: 'این ایمیل قبلاً ثبت شده است' };
    }

    const newUser: StoredUser = { email: e, name: name.trim(), passwordHash: hashPassword(password) };
    writeUsers([...users, newUser]);
    setSession({ email: newUser.email, name: newUser.name });
    return { ok: true };
  }, []);

  const login = useCallback((email: string, password: string): AuthResult => {
    const e = email.trim().toLowerCase();
    if (!e || !password) return { ok: false, error: 'لطفاً همه فیلدها را پر کنید' };
    if (!EMAIL_RE.test(e)) return { ok: false, error: 'ایمیل معتبر وارد کنید' };

    const found = readUsers().find((u) => u.email === e);
    if (!found || found.passwordHash !== hashPassword(password)) {
      return { ok: false, error: 'ایمیل یا رمز عبور اشتباه است' };
    }

    setSession({ email: found.email, name: found.name });
    return { ok: true };
  }, []);

  const logout = useCallback((): void => {
    setSession(null);
  }, []);

  return { user, register, login, logout };
}
