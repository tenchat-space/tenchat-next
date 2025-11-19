"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { StyleConfig, StyleContextType, DEFAULT_STYLE } from '@/types/style';

const StyleContext = createContext<StyleContextType | undefined>(undefined);

export function StyleProvider({ children }: { children: ReactNode }) {
  const [styleConfig, setStyleConfig] = useState<StyleConfig>(DEFAULT_STYLE);

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

  return (
    <StyleContext.Provider value={{ styleConfig, updateStyle, resetStyle }}>
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
