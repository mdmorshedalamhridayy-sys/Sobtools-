import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { ThemeAccentColor } from '../types';
import { fetchSiteSettings } from '../services/cmsService';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  accentColor: ThemeAccentColor;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setAccentColor: (color: ThemeAccentColor) => void;
}

const ACCENT_COLOR_MAP: Record<ThemeAccentColor, { hex: string; rgb: string; name: string }> = {
  indigo: { hex: '#6366f1', rgb: '99, 102, 241', name: 'Indigo Electric' },
  cyan: { hex: '#06b6d4', rgb: '6, 182, 212', name: 'Cyan Cyber' },
  emerald: { hex: '#10b981', rgb: '16, 185, 129', name: 'Emerald Growth' },
  purple: { hex: '#8b5cf6', rgb: '139, 92, 246', name: 'Purple Royalty' },
  amber: { hex: '#f59e0b', rgb: '245, 158, 11', name: 'Amber Gold' },
  rose: { hex: '#f43f5e', rgb: '244, 63, 94', name: 'Rose Crimson' },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem('sobtools_theme');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {}
    return 'dark'; // Default
  });

  const [accentColor, setAccentColorState] = useState<ThemeAccentColor>(() => {
    try {
      const saved = localStorage.getItem('sobtools_accent');
      if (saved && saved in ACCENT_COLOR_MAP) return saved as ThemeAccentColor;
    } catch {}
    return 'indigo';
  });

  // Sync initial settings from Firestore siteSettings/general
  useEffect(() => {
    fetchSiteSettings().then((settings) => {
      if (settings) {
        // If user hasn't explicitly overridden theme in localStorage, use site default
        const hasLocalTheme = Boolean(localStorage.getItem('sobtools_theme'));
        if (!hasLocalTheme && (settings.defaultTheme === 'dark' || settings.defaultTheme === 'light')) {
          setThemeState(settings.defaultTheme);
        }
        if (settings.themeAccentColor && settings.themeAccentColor in ACCENT_COLOR_MAP) {
          setAccentColorState(settings.themeAccentColor);
        }
      }
    }).catch(() => {});
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('sobtools_theme', newTheme);
    } catch {}
  }, []);

  const setAccentColor = useCallback((newAccent: ThemeAccentColor) => {
    setAccentColorState(newAccent);
    try {
      localStorage.setItem('sobtools_accent', newAccent);
    } catch {}
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('sobtools_theme', next);
      } catch {}
      return next;
    });
  }, []);

  // Apply dark/light class and accent attributes to root HTML element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }

    root.setAttribute('data-theme', theme);
    root.setAttribute('data-accent', accentColor);

    const config = ACCENT_COLOR_MAP[accentColor] || ACCENT_COLOR_MAP.indigo;
    root.style.setProperty('--color-primary', config.hex);
    root.style.setProperty('--color-primary-rgb', config.rgb);
  }, [theme, accentColor]);

  const value = useMemo(
    () => ({ theme, accentColor, toggleTheme, setTheme, setAccentColor }),
    [theme, accentColor, toggleTheme, setTheme, setAccentColor]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export { ACCENT_COLOR_MAP };
