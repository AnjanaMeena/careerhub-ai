import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeSwitcher = () => {
  const { theme, setTheme, themes } = useTheme();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-xl text-theme-text-secondary hover:bg-surface-hover transition-colors"
        title="Change theme"
      >
        <Palette className="w-5 h-5" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-surface rounded-2xl shadow-xl border border-theme-border overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2">
            <p className="text-[10px] uppercase tracking-wider font-bold text-theme-text-muted px-3 py-1.5">
              Choose Theme
            </p>
            {themes.map((t) => (
              <button
                key={t.key}
                onClick={() => { setTheme(t.key); setOpen(false); }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  theme === t.key
                    ? 'bg-primary/10 text-primary'
                    : 'text-theme-text hover:bg-surface-hover'
                }`}
              >
                <div
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: t.color,
                    borderColor: theme === t.key ? t.color : 'transparent'
                  }}
                >
                  {theme === t.key && <Check className="w-3 h-3 text-white" />}
                </div>
                <span>{t.emoji} {t.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;
