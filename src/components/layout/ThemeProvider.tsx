'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface PaletteDefinition {
  id: string;
  name: string;
  primary: string;
  accent: string;
  bg: string;
  text: string;
  border: string;
  cardBg: string;
}

export const PALETTES_MAP: Record<string, PaletteDefinition> = {
  'royal-white': {
    id: 'royal-white',
    name: 'Royal Ivory & Kannauj Gold',
    primary: '#111827',
    accent: '#D4AF37',
    bg: '#FFFFFF',
    text: '#111827',
    border: '#E5E7EB',
    cardBg: '#FFFFFF',
  },
  'burgundy-rose': {
    id: 'burgundy-rose',
    name: 'Rose Burgundy & Cream',
    primary: '#7A1840',
    accent: '#D45A7A',
    bg: '#FAFAFA',
    text: '#111827',
    border: '#E5E7EB',
    cardBg: '#FFFFFF',
  },
  'obsidian-gold': {
    id: 'obsidian-gold',
    name: 'Obsidian Oud & Amber Gold',
    primary: '#1F2937',
    accent: '#D4AF37',
    bg: '#FFFFFF',
    text: '#111827',
    border: '#E5E7EB',
    cardBg: '#FFFFFF',
  },
  'emerald-sage': {
    id: 'emerald-sage',
    name: 'Emerald Botanical & Sage',
    primary: '#0B3C2D',
    accent: '#38A169',
    bg: '#F9FBF9',
    text: '#111827',
    border: '#E5E7EB',
    cardBg: '#FFFFFF',
  },
};

interface ThemeContextType {
  activeThemeId: string;
  palette: PaletteDefinition;
  setTheme: (themeId: string, customColors?: Partial<PaletteDefinition>, customCss?: string) => Promise<void>;
  customCss: string;
}

const ThemeContext = createContext<ThemeContextType>({
  activeThemeId: 'royal-white',
  palette: PALETTES_MAP['royal-white'],
  setTheme: async () => {},
  customCss: '',
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [activeThemeId, setActiveThemeId] = useState('royal-white');
  const [customPalette, setCustomPalette] = useState<PaletteDefinition | null>(null);
  const [customCss, setCustomCss] = useState('');

  const injectCustomCss = (css: string) => {
    if (typeof document === 'undefined') return;
    let styleEl = document.getElementById('roseoil-custom-css');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'roseoil-custom-css';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = css || '';
  };

  const applyPalette = (themeId: string, overrides?: Partial<PaletteDefinition>) => {
    const basePalette = PALETTES_MAP[themeId] || PALETTES_MAP['royal-white'];
    const palette = { ...basePalette, ...overrides };

    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.style.setProperty('--bg-color', palette.bg);
      root.style.setProperty('--primary-color', palette.primary);
      root.style.setProperty('--accent-color', palette.accent);
      root.style.setProperty('--text-color', palette.text);
      root.style.setProperty('--border-color', palette.border);
      root.style.setProperty('--card-bg', palette.cardBg);
    }
  };

  const fetchTheme = async () => {
    try {
      const res = await fetch('/api/admin/theme');
      const data = await res.json();
      if (data.success) {
        const themeId = data.activeTheme || 'royal-white';
        setActiveThemeId(themeId);

        const overrides: Partial<PaletteDefinition> = {};
        if (data.custom_primary) overrides.primary = data.custom_primary;
        if (data.custom_accent) overrides.accent = data.custom_accent;
        if (data.custom_bg) overrides.bg = data.custom_bg;
        if (data.custom_text) overrides.text = data.custom_text;
        if (data.custom_border) overrides.border = data.custom_border;
        if (data.custom_card_bg) overrides.cardBg = data.custom_card_bg;

        if (Object.keys(overrides).length > 0) {
          setCustomPalette({ ...PALETTES_MAP[themeId], ...overrides });
        }

        applyPalette(themeId, overrides);
        setCustomCss(data.custom_css || '');
        injectCustomCss(data.custom_css || '');
      } else {
        applyPalette('royal-white');
      }
    } catch (e) {
      applyPalette('royal-white');
    }
  };

  useEffect(() => {
    fetchTheme();

    const handleCustomThemeEvent = (e: CustomEvent) => {
      const newThemeId = e.detail?.themeId;
      const css = e.detail?.customCss;
      if (newThemeId && PALETTES_MAP[newThemeId]) {
        setActiveThemeId(newThemeId);
        applyPalette(newThemeId, e.detail?.customColors);
      }
      if (css !== undefined) {
        setCustomCss(css);
        injectCustomCss(css);
      }
    };

    window.addEventListener('themeChanged' as any, handleCustomThemeEvent);
    return () => {
      window.removeEventListener('themeChanged' as any, handleCustomThemeEvent);
    };
  }, []);

  const setTheme = async (
    themeId: string,
    customColors?: Partial<PaletteDefinition>,
    css?: string
  ) => {
    if (!PALETTES_MAP[themeId]) return;
    setActiveThemeId(themeId);
    applyPalette(themeId, customColors);
    if (css !== undefined) {
      setCustomCss(css);
      injectCustomCss(css);
    }

    // Save to database/memory via API
    try {
      await fetch('/api/admin/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          themeId,
          custom_primary: customColors?.primary,
          custom_accent: customColors?.accent,
          custom_bg: customColors?.bg,
          custom_text: customColors?.text,
          custom_border: customColors?.border,
          custom_card_bg: customColors?.cardBg,
          custom_css: css !== undefined ? css : customCss,
        }),
      });

      window.dispatchEvent(
        new CustomEvent('themeChanged', {
          detail: { themeId, customColors, customCss: css },
        })
      );
    } catch (e) {
      console.error(e);
    }
  };

  const currentPalette = customPalette || PALETTES_MAP[activeThemeId] || PALETTES_MAP['royal-white'];

  return (
    <ThemeContext.Provider
      value={{
        activeThemeId,
        palette: currentPalette,
        setTheme,
        customCss,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
