'use client';

import { useEffect, useState } from 'react';
import { Monitor, Sun, Moon } from 'lucide-react';

const THEME_KEY = 'perpustakaan-theme';
const themes = ['system', 'light', 'dark'] as const;

type ThemeOption = (typeof themes)[number];

function applyTheme(theme: ThemeOption) {
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  if (theme === 'system') {
    root.removeAttribute('data-theme');
    document.documentElement.setAttribute('data-theme', 'system');
  }
}

function getStoredTheme(): ThemeOption {
  if (typeof window === 'undefined') return 'system';
  const stored = window.localStorage.getItem(THEME_KEY) as ThemeOption | null;
  return (stored && (themes as readonly string[]).includes(stored)) ? stored : 'system';
}

const iconByTheme: Record<ThemeOption, typeof Monitor> = {
  system: Monitor,
  light: Sun,
  dark: Moon,
};

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<ThemeOption>('system');

  useEffect(() => {
    const stored = getStoredTheme();
    setTheme(stored);
    applyTheme(stored);
  }, []);

  const handleClick = () => {
    const nextTheme = themes[(themes.indexOf(theme) + 1) % themes.length];
    setTheme(nextTheme);
    window.localStorage.setItem(THEME_KEY, nextTheme);
    applyTheme(nextTheme);
  };

  const Icon = iconByTheme[theme];
  const tooltipMap: Record<ThemeOption, string> = {
    system: 'Mode system (klik untuk light)',
    light: 'Mode light (klik untuk dark)',
    dark: 'Mode dark (klik untuk system)',
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="theme-switcher fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full border border-slate-700/80 bg-slate-950/90 text-slate-100 shadow-[0_18px_50px_-30px_rgba(15,23,42,0.9)] transition hover:border-indigo-400 hover:text-white hover:bg-slate-900/95 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
      aria-label={tooltipMap[theme]}
      title={tooltipMap[theme]}
    >
      <Icon className="h-7 w-7" />
    </button>
  );
}
