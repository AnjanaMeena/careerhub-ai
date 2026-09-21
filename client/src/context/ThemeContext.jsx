import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const THEMES = [
  { key: 'purple', label: 'Purple', emoji: '💜', color: '#7c3aed', isDark: false },
  { key: 'dark', label: 'Dark', emoji: '🌙', color: '#a78bfa', isDark: true },
  { key: 'light', label: 'Light', emoji: '☀️', color: '#6366f1', isDark: false },
  { key: 'teal', label: 'Teal', emoji: '🌊', color: '#0d9488', isDark: false },
];

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem('careerhub_theme');
    if (saved && THEMES.some(t => t.key === saved)) return saved;
    return 'purple';
  });

  const setTheme = (newTheme) => {
    if (THEMES.some(t => t.key === newTheme)) {
      setThemeState(newTheme);
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    localStorage.setItem('careerhub_theme', theme);

    // Toggle dark class for Tailwind dark: variants
    const themeObj = THEMES.find(t => t.key === theme);
    if (themeObj?.isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const currentTheme = THEMES.find(t => t.key === theme) || THEMES[0];
  const isDark = currentTheme.isDark;

  // Get CSS variable values for use in JS (e.g., chart colors)
  const getChartColors = () => {
    const style = getComputedStyle(document.documentElement);
    return {
      chart1: style.getPropertyValue('--color-chart-1')?.trim() || '#7c3aed',
      chart2: style.getPropertyValue('--color-chart-2')?.trim() || '#a78bfa',
      chart3: style.getPropertyValue('--color-chart-3')?.trim() || '#c4b5fd',
      chart4: style.getPropertyValue('--color-chart-4')?.trim() || '#8b5cf6',
      chart5: style.getPropertyValue('--color-chart-5')?.trim() || '#6d28d9',
    };
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES, isDark, currentTheme, getChartColors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
