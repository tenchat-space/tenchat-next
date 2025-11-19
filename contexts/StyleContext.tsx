"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { StyleConfig, StyleContextType, DEFAULT_STYLE } from '@/types/style';
import { THEME_PALETTES, ColorPalette } from '@/types/theme';

interface ExtendedStyleContextType extends StyleContextType {
  availablePalettes: Record<string, { light: ColorPalette; dark: ColorPalette }>;
  registerPalette: (id: string, palette: { light: ColorPalette; dark: ColorPalette }) => void;
}

const StyleContext = createContext<ExtendedStyleContextType | undefined>(undefined);

export function StyleProvider({ children }: { children: ReactNode }) {
  const [styleConfig, setStyleConfig] = useState<StyleConfig>(DEFAULT_STYLE);
  const [availablePalettes, setAvailablePalettes] = useState(THEME_PALETTES);

  useEffect(() => {
    // Load saved style preference
    const saved = localStorage.getItem('tenchat-style-config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setStyleConfig({ ...DEFAULT_STYLE, ...parsed });
      } catch (e) {
        console.error("Failed to parse saved style config", e);
      }
    }

    // Listen for storage changes to sync across windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'tenchat-style-config' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setStyleConfig(prev => ({ ...prev, ...parsed }));
        } catch (err) {
          console.error("Failed to sync style from storage", err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updateStyle = (updates: Partial<StyleConfig>) => {
    setStyleConfig(prev => {
      const newConfig = { ...prev, ...updates };
      localStorage.setItem('tenchat-style-config', JSON.stringify(newConfig));
      return newConfig;
    });
  };

  const resetStyle = () => {
    setStyleConfig(DEFAULT_STYLE);
    localStorage.removeItem('tenchat-style-config');
  };

  const registerPalette = (id: string, palette: { light: ColorPalette; dark: ColorPalette }) => {
    setAvailablePalettes(prev => ({ ...prev, [id]: palette }));
  };

  return (
    <StyleContext.Provider value={{ styleConfig, updateStyle, resetStyle, availablePalettes, registerPalette }}>
      {children}
    </StyleContext.Provider>
  );
}

export function useStyle() {
  const context = useContext(StyleContext);
  if (context === undefined) {
    throw new Error('useStyle must be used within a StyleProvider');
  }
  return context;
}
