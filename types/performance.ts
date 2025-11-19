export type PerformanceMode = 'low' | 'medium' | 'high' | 'dynamic';

export interface PerformanceMetrics {
  fps: number;
  windowCount: number;
  screenSize: { width: number; height: number };
  isMobile: boolean;
  score: number; // 0-100 health score
}

export interface PerformanceConfig {
  mode: PerformanceMode;
  maxWindows: number;
  enableBlur: boolean;
  enableAnimations: boolean;
  animationLevel: 'none' | 'low' | 'mid' | 'high';
  enableShadows: boolean;
  enableTranslucency: boolean;
  textureQuality: 'low' | 'high';
}

export interface PerformanceContextType {
  mode: PerformanceMode;
  setMode: (mode: PerformanceMode) => void;
  metrics: PerformanceMetrics;
  config: PerformanceConfig;
  recommendations: string[];
  clearClutter: () => void;
}

export const PERFORMANCE_PRESETS: Record<Exclude<PerformanceMode, 'dynamic'>, Partial<PerformanceConfig>> = {
  low: {
    maxWindows: 2,
    enableBlur: false,
    enableAnimations: false,
    animationLevel: 'none',
    enableShadows: false,
    enableTranslucency: false,
    textureQuality: 'low',
  },
  medium: {
    maxWindows: 4,
    enableBlur: true,
    enableAnimations: true,
    animationLevel: 'low',
    enableShadows: true,
    enableTranslucency: true,
    textureQuality: 'high',
  },
  high: {
    maxWindows: 8, // Soft cap, hard cap might be higher
    enableBlur: true,
    enableAnimations: true,
    animationLevel: 'high',
    enableShadows: true,
    enableTranslucency: true,
    textureQuality: 'high',
  },
};
