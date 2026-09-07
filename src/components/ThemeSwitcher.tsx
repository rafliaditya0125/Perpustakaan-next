'use client';

import React, { useSyncExternalStore } from 'react';
import { Sun, Moon } from 'lucide-react';

const THEME_KEY = 'perpustakaan-theme';
type ThemeMode = 'light' | 'dark';

function applyTheme(theme: ThemeMode) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
  } else {
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
  }
  root.setAttribute('data-theme-preference', theme);
}

function subscribeTheme(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    mediaQuery.removeEventListener('change', callback);
  };
}

function getThemeSnapshot(): ThemeMode {
  try {
    const stored = window.localStorage.getItem(THEME_KEY);
    if (stored === 'dark' || stored === 'light') {
      return stored;
    }
    // Default mengikuti sistem perangkat
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function useIsClient(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export default function ThemeSwitcher() {
  const isClient = useIsClient();
  const theme = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    () => 'light'
  );

  const handleToggle = () => {
    const nextTheme: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    try {
      window.localStorage.setItem(THEME_KEY, nextTheme);
    } catch {
      // ignore
    }
    applyTheme(nextTheme);
    window.dispatchEvent(new Event('storage'));
  };

  if (!isClient) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      title={theme === 'dark' ? 'Mode Gelap — Klik untuk beralih ke Mode Terang' : 'Mode Terang — Klik untuk beralih ke Mode Gelap'}
      aria-label={theme === 'dark' ? 'Mode Gelap — Klik untuk beralih ke Mode Terang' : 'Mode Terang — Klik untuk beralih ke Mode Gelap'}
      className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-slate-200/90 bg-white/95 text-slate-700 shadow-lg shadow-slate-300/30 backdrop-blur-md transition-all duration-200 hover:scale-105 hover:border-indigo-400 hover:text-indigo-600 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-800/90 dark:bg-slate-900/95 dark:text-slate-200 dark:shadow-2xl dark:shadow-black/50 dark:hover:border-indigo-400 dark:hover:text-white cursor-pointer"
    >
      {theme === 'light' ? (
        <Sun className="h-5 w-5 text-amber-500 transition-transform duration-200" />
      ) : (
        <Moon className="h-5 w-5 text-indigo-400 transition-transform duration-200" />
      )}
    </button>
  );
}
