import { useState, useEffect } from 'react';
import { COLOR_PALETTES, ColorPalette } from '@/lib/color-palettes';

type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    // Get theme from localStorage or default to 'light'
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme;
      }
      // Check system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light';
  });

  const [paletteId, setPaletteId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('paletteId') || 'default';
    }
    return 'default';
  });

  const activePalette = COLOR_PALETTES.find(p => p.id === paletteId) || COLOR_PALETTES[0];

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);

    // Apply color palette CSS variables
    Object.entries(activePalette.colors).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

  }, [theme, activePalette]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const setPalette = (id: string) => {
    setPaletteId(id);
    localStorage.setItem('paletteId', id);
  };

  return { theme, toggleTheme, paletteId, setPalette, activePalette };
}