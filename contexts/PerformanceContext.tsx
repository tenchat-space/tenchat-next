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
  
  const { windows, closeWindow, activeWindowId } = useWindow();
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

  const getSortedWindowsByImportance = useCallback(() => {
    return [...windows].sort((a, b) => {
      // 1. Performance Window (Highest Priority)
      const aIsPerf = a.tabs.some(t => t.type === 'PERFORMANCE');
      const bIsPerf = b.tabs.some(t => t.type === 'PERFORMANCE');
      if (aIsPerf && !bIsPerf) return 1;
      if (!aIsPerf && bIsPerf) return -1;

      // 2. Active Window (High Priority)
      if (a.id === activeWindowId) return 1;
      if (b.id === activeWindowId) return -1;

      // 3. Last Interaction (Recent is better)
      return (a.lastInteraction || 0) - (b.lastInteraction || 0);
    });
  }, [windows, activeWindowId]);

  // Enforce limits automatically
  useEffect(() => {
    const limit = config.maxWindows;
    if (windows.length > limit) {
      const sorted = getSortedWindowsByImportance();
      // The start of the array has the least important windows (Oldest interaction, not active, not perf)
      const toCloseCount = windows.length - limit;
      const toClose = sorted.slice(0, toCloseCount);
      
      // Use a timeout to avoid immediate closing during render cycles or rapid updates
      const timer = setTimeout(() => {
        toClose.forEach(w => closeWindow(w.id));
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [windows.length, config.maxWindows, getSortedWindowsByImportance, closeWindow]);

  const clearClutter = useCallback(() => {
    // Aggressively clean up: Keep only Active + Performance + maybe 1 recent
    const sorted = getSortedWindowsByImportance();
    // We want to keep the most important ones.
    // Let's say we keep max 2 windows (Active + Perf or Active + 1 Recent)
    const keepCount = 2; 
    
    if (windows.length <= keepCount) return;

    // We want to close everything except the last 'keepCount' items in the sorted array
    // (Since sorted is Ascending importance, the end has the most important)
    const toClose = sorted.slice(0, windows.length - keepCount);
    
    toClose.forEach(w => closeWindow(w.id));
  }, [getSortedWindowsByImportance, windows.length, closeWindow]);

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
