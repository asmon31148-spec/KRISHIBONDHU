'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  resolvedTheme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
});

const THEME_STORAGE_KEY = 'krishibondhu-theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');
  const [mounted, setMounted] = useState(false);

  // Helper to sync html class and meta theme-color to avoid system bar mismatch
  const applyTheme = useCallback((activeTheme: ResolvedTheme) => {
    const root = document.documentElement;
    if (activeTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }

    // Update dynamic meta theme-color for seamless status bar integration on mobile
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    const color = activeTheme === 'dark' ? '#0B1711' : '#F9F7F2';
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', color);
    }
  }, []);

  useEffect(() => {
    // 1. Initial read from localStorage
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    const initialTheme: Theme = saved && ['light', 'dark', 'system'].includes(saved) ? saved : 'system';
    setThemeState(initialTheme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const systemTheme: ResolvedTheme = mediaQuery.matches ? 'dark' : 'light';
    const computed = initialTheme === 'system' ? systemTheme : initialTheme;
    setResolvedTheme(computed);
    applyTheme(computed);
    setMounted(true);

    // 2. Listen to system preference changes when in 'system' mode
    const handler = (e: MediaQueryListEvent) => {
      const currentStored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
      if (!currentStored || currentStored === 'system') {
        const newResolved: ResolvedTheme = e.matches ? 'dark' : 'light';
        setResolvedTheme(newResolved);
        applyTheme(newResolved);
      }
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [applyTheme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);

    let nextResolved: ResolvedTheme = 'light';
    if (newTheme === 'system') {
      nextResolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      nextResolved = newTheme;
    }

    setResolvedTheme(nextResolved);
    applyTheme(nextResolved);
  }, [applyTheme]);

  const toggleTheme = useCallback(() => {
    const next = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  }, [resolvedTheme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme: mounted ? resolvedTheme : 'light', setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
