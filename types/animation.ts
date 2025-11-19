export type AnimationLevel = 'none' | 'low' | 'mid' | 'high';

export interface AnimationConfig {
  duration: number;
  stiffness: number;
  damping: number;
  mass: number;
  scale: number;
  opacity: number;
}

export interface AnimationContextType {
  level: AnimationLevel;
  setLevel: (level: AnimationLevel) => void;
  config: AnimationConfig;
  isEnabled: boolean;
}

export const ANIMATION_LEVELS: Record<AnimationLevel, AnimationConfig> = {
  none: {
    duration: 0,
    stiffness: 1000,
    damping: 100,
    mass: 1,
    scale: 1,
    opacity: 1,
  },
  low: {
    duration: 0.2,
    stiffness: 200,
    damping: 25,
    mass: 1,
    scale: 0.98,
    opacity: 0.9,
  },
  mid: {
    duration: 0.4,
    stiffness: 120,
    damping: 15,
    mass: 1,
    scale: 0.95,
    opacity: 0.5,
  },
  high: {
    duration: 0.6,
    stiffness: 80,
    damping: 12,
    mass: 1.2,
    scale: 0.9,
    opacity: 0,
  },
};
