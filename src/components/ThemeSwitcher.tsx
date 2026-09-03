'use client';

import { useEffect, useState } from 'react';
import { Monitor, Sun, Moon } from 'lucide-react';

const THEME_KEY = 'perpustakaan-theme';
const THEMES = ['system', 'light', 'dark'] as const;
type ThemeOption = (typeof THEMES)[number];

function applyTheme(theme: ThemeOption, prefersDark: boolean) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const isDark = theme === 'dark' || (theme === 'system' && prefersDark);

  if (isDark) {
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
  } else {
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
  }
  root.setAttribute('data-theme-preference', theme);
}

export default function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<ThemeOption>('system');
  const [systemIsDark, setSystemIsDark] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemIsDark(mediaQuery.matches);

    const stored = window.localStorage.getItem(THEME_KEY) as ThemeOption | null;
    const initialTheme: ThemeOption =
      stored && (THEMES as readonly string[]).includes(stored) ? stored : 'system';

    setTheme(initialTheme);
    applyTheme(initialTheme, mediaQuery.matches);
    setMounted(true);

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemIsDark(e.matches);
      const currentStored = (window.localStorage.getItem(THEME_KEY) as ThemeOption) || 'system';
      if (currentStored === 'system') {
        applyTheme('system', e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const handleToggle = () => {
    const currentIndex = THEMES.indexOf(theme);
    const nextTheme = THEMES[(currentIndex + 1) % THEMES.length];
    setTheme(nextTheme);
    window.localStorage.setItem(THEME_KEY, nextTheme);
    applyTheme(nextTheme, systemIsDark);
  };

  if (!mounted) {
    return null;
  }

  const tooltipMap: Record<ThemeOption, string> = {
    system: `Mode Sistem (${systemIsDark ? 'Device: Gelap' : 'Device: Terang'}) — Klik 1x untuk beralih ke Mode Terang`,
    light: 'Mode Terang — Klik 1x untuk beralih ke Mode Gelap',
    dark: 'Mode Gelap — Klik 1x untuk beralih ke Mode Sistem',
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      title={tooltipMap[theme]}
      aria-label={tooltipMap[theme]}
      className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-slate-200/90 bg-white/95 text-slate-700 shadow-lg shadow-slate-300/30 backdrop-blur-md transition-all duration-200 hover:scale-105 hover:border-indigo-400 hover:text-indigo-600 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-800/90 dark:bg-slate-900/95 dark:text-slate-200 dark:shadow-2xl dark:shadow-black/50 dark:hover:border-indigo-400 dark:hover:text-white cursor-pointer"
    >
      {theme === 'system' && <Monitor className="h-5 w-5 transition-transform duration-200" />}
      {theme === 'light' && <Sun className="h-5 w-5 text-amber-500 transition-transform duration-200" />}
      {theme === 'dark' && <Moon className="h-5 w-5 text-indigo-400 transition-transform duration-200" />}
    </button>
  );
}
