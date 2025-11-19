"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AnimationLevel, AnimationConfig, ANIMATION_LEVELS, AnimationContextType } from '@/types/animation';

const AnimationContext = createContext<AnimationContextType | undefined>(undefined);

export function AnimationProvider({ children }: { children: ReactNode }) {
  const [level, setLevel] = useState<AnimationLevel>('mid');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Initialize client-side values
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    // Use setTimeout to avoid synchronous setState warning
    setTimeout(() => {
        setPrefersReducedMotion(mediaQuery.matches);
        const saved = localStorage.getItem('tenchat-animation-level');
        if (saved && Object.keys(ANIMATION_LEVELS).includes(saved)) {
            setLevel(saved as AnimationLevel);
        }
    }, 0);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const handleSetLevel = (newLevel: AnimationLevel) => {
    setLevel(newLevel);
    localStorage.setItem('tenchat-animation-level', newLevel);
  };

  // If system prefers reduced motion, force 'none' or 'low' unless explicitly overridden?
  // For now, we'll respect the user setting but default to 'none' if they haven't set one and system says reduce.
  // But here we just use the state. The hook can handle the "effective" config.
  
  const effectiveLevel = prefersReducedMotion && level !== 'none' ? 'low' : level;
  const config = ANIMATION_LEVELS[effectiveLevel];

  return (
    <AnimationContext.Provider
      value={{
        level,
        setLevel: handleSetLevel,
        config,
        isEnabled: effectiveLevel !== 'none',
      }}
    >
      {children}
    </AnimationContext.Provider>
  );
}

export function useAnimationContext() {
  const context = useContext(AnimationContext);
  if (context === undefined) {
    throw new Error('useAnimationContext must be used within an AnimationProvider');
  }
  return context;
}
