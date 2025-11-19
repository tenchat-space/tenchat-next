export type BorderRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type DepthLevel = 'flat' | 'low' | 'medium' | 'high' | 'extreme';
export type BlurLevel = 'none' | 'low' | 'medium' | 'high';
export type BorderStyle = 'solid' | 'glass' | 'diffuse' | 'neon';

export interface StyleConfig {
  borderRadius: BorderRadius;
  depth: DepthLevel;
  blur: BlurLevel;
  borderStyle: BorderStyle;
  scaleOnHover: boolean;
  activeGlow: boolean;
}

export interface StyleContextType {
  styleConfig: StyleConfig;
  updateStyle: (updates: Partial<StyleConfig>) => void;
  resetStyle: () => void;
}

export const DEFAULT_STYLE: StyleConfig = {
  borderRadius: 'md',
  depth: 'high',
  blur: 'medium',
  borderStyle: 'diffuse',
  scaleOnHover: true,
  activeGlow: true,
};

export const BORDER_RADIUS_VALUES: Record<BorderRadius, number> = {
  none: 0,
  sm: 4,
  md: 12, // Moderate, professional
  lg: 20,
  xl: 32,
  full: 9999,
};

export const DEPTH_SHADOWS: Record<DepthLevel, string> = {
  flat: 'none',
  low: '0 2px 8px rgba(0, 0, 0, 0.15)',
  medium: '0 8px 24px rgba(0, 0, 0, 0.25), 0 2px 4px rgba(0,0,0,0.1)',
  high: '0 16px 48px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)', // 3D feel
  extreme: '0 24px 64px rgba(0, 0, 0, 0.6), 0 8px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
};

export const BLUR_VALUES: Record<BlurLevel, string> = {
  none: 'none',
  low: 'blur(8px)',
  medium: 'blur(16px) saturate(180%)',
  high: 'blur(32px) saturate(200%)',
};
