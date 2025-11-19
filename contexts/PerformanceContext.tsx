"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { PerformanceMode, PerformanceMetrics, PerformanceConfig, PerformanceContextType, PERFORMANCE_PRESETS } from '@/types/performance';
import { useWindow } from './WindowContext';

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

export function PerformanceProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<PerformanceMode>('dynamic');
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    windowCount: 0,
    screenSize: { width: 1920, height: 1080 },
    isMobile: false,
    score: 100,
  });
  const [recommendations, setRecommendations] = useState<string[]>([]);
  
  const { windows, closeWindow } = useWindow();
  const frameCount = useRef(0);
  const lastTime = useRef(0);
  const requestRef = useRef<number>(0);

  // FPS Counter
  useEffect(() => {
    const animate = (time: number) => {
      if (lastTime.current === 0) lastTime.current = time;
      
      frameCount.current++;
      if (time - lastTime.current >= 1000) {
        const fps = frameCount.current;
        setMetrics(prev => ({ ...prev, fps }));
        frameCount.current = 0;
        lastTime.current = time;
      }
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  // Update metrics based on environment and windows
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isMobile = width < 768;
      setMetrics(prev => ({ ...prev, screenSize: { width, height }, isMobile }));
    };

    handleResize(); // Initial
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Use setTimeout to avoid synchronous setState warning
    const timer = setTimeout(() => {
        setMetrics(prev => ({ ...prev, windowCount: windows.length }));
    }, 0);
    return () => clearTimeout(timer);
  }, [windows.length]);

  // Calculate Health Score and Recommendations
  useEffect(() => {
    const timer = setTimeout(() => {
        let score = 100;
        const recs: string[] = [];

        if (metrics.fps < 30) {
        score -= 30;
        recs.push("Low FPS detected. Consider switching to 'Low' performance mode.");
        } else if (metrics.fps < 50) {
        score -= 10;
        }

        if (metrics.windowCount > 4) {
        score -= 20;
        recs.push("High window count. Close unused windows to improve performance.");
        }

        if (metrics.isMobile && metrics.windowCount > 0) {
        score -= 40;
        recs.push("Virtual windows are not recommended on mobile devices.");
        }

        setMetrics(prev => ({ ...prev, score: Math.max(0, score) }));
        setRecommendations(recs);
    }, 0);
    return () => clearTimeout(timer);
  }, [metrics.fps, metrics.windowCount, metrics.isMobile]);

  // Determine Effective Config
  const getConfig = (): PerformanceConfig => {
    let effectiveMode: Exclude<PerformanceMode, 'dynamic'> = 'medium';

    if (mode === 'dynamic') {
      if (metrics.isMobile) {
        effectiveMode = 'low';
      } else if (metrics.fps < 45) {
        effectiveMode = 'low';
      } else if (metrics.fps > 55 && metrics.windowCount < 5) {
        effectiveMode = 'high';
      } else {
        effectiveMode = 'medium';
      }
    } else {
      effectiveMode = mode;
    }

    const preset = PERFORMANCE_PRESETS[effectiveMode];
    
    // Hard overrides
    let maxWindows = preset.maxWindows ?? 4;
    if (metrics.isMobile) maxWindows = 0; // Hard cap for mobile
    else if (metrics.screenSize.width < 1200) maxWindows = Math.min(maxWindows, 3); // Smaller screens

    return {
      mode,
      maxWindows,
      enableBlur: preset.enableBlur ?? true,
      enableAnimations: preset.enableAnimations ?? true,
      animationLevel: preset.animationLevel ?? 'mid',
      enableShadows: preset.enableShadows ?? true,
      enableTranslucency: preset.enableTranslucency ?? true,
      textureQuality: preset.textureQuality ?? 'high',
    };
  };

  const config = getConfig();

  const clearClutter = useCallback(() => {
    const limit = config.maxWindows;
    const currentCount = windows.length;
    
    // If we are within limits, just close minimized ones as a cleanup action
    if (currentCount <= limit) {
        const minimized = windows.filter(w => w.isMinimized);
        minimized.forEach(w => closeWindow(w.id));
        return;
    }

    let windowsToRemove = currentCount - limit;
    const idsToRemove: Set<string> = new Set();

    // 1. Target minimized windows first
    const minimized = windows.filter(w => w.isMinimized);
    for (const w of minimized) {
        if (windowsToRemove <= 0) break;
        idsToRemove.add(w.id);
        windowsToRemove--;
    }

    // 2. If still need to remove, target oldest windows (assuming index 0 is oldest/bottom)
    // We avoid closing the active window (usually last) if possible, unless we have to.
    if (windowsToRemove > 0) {
        // Filter out already marked ones
        const candidates = windows.filter(w => !idsToRemove.has(w.id));
        
        // Remove from start (oldest)
        for (const w of candidates) {
            if (windowsToRemove <= 0) break;
            idsToRemove.add(w.id);
            windowsToRemove--;
        }
    }

    idsToRemove.forEach(id => closeWindow(id));
  }, [windows, closeWindow, config.maxWindows]);

  return (
    <PerformanceContext.Provider value={{ mode, setMode, metrics, config, recommendations, clearClutter }}>
      {children}
    </PerformanceContext.Provider>
  );
}

export function usePerformance() {
  const context = useContext(PerformanceContext);
  if (context === undefined) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
}
