export type ThemeMode = 'light' | 'dark' | 'system';

export interface ColorPalette {
  id: string;
  name: string;
  primary: {
    main: string;
    light: string;
    dark: string;
    contrastText: string;
  };
  secondary: {
    main: string;
    light: string;
    dark: string;
    contrastText: string;
  };
  background: {
    default: string;
    paper: string;
  };
  text: {
    primary: string;
    secondary: string;
  };
}

export const THEME_PALETTES: Record<string, { light: ColorPalette; dark: ColorPalette }> = {
  default: {
    dark: {
      id: 'default-dark',
      name: 'Cosmic Void',
      primary: { main: '#8b5cf6', light: '#a78bfa', dark: '#7c3aed', contrastText: '#ffffff' },
      secondary: { main: '#facc15', light: '#fde047', dark: '#eab308', contrastText: '#05010c' },
      background: { default: '#050505', paper: 'rgba(20, 20, 25, 0.6)' },
      text: { primary: '#fefce8', secondary: '#fef08a' },
    },
    light: {
      id: 'default-light',
      name: 'Cosmic Day',
      primary: { main: '#7c3aed', light: '#8b5cf6', dark: '#6d28d9', contrastText: '#ffffff' },
      secondary: { main: '#eab308', light: '#facc15', dark: '#ca8a04', contrastText: '#000000' },
      background: { default: '#f8fafc', paper: 'rgba(255, 255, 255, 0.8)' },
      text: { primary: '#0f172a', secondary: '#334155' },
    }
  },
  ocean: {
    dark: {
      id: 'ocean-dark',
      name: 'Deep Ocean',
      primary: { main: '#0ea5e9', light: '#38bdf8', dark: '#0284c7', contrastText: '#ffffff' },
      secondary: { main: '#14b8a6', light: '#2dd4bf', dark: '#0d9488', contrastText: '#000000' },
      background: { default: '#0f172a', paper: 'rgba(15, 23, 42, 0.6)' },
      text: { primary: '#f0f9ff', secondary: '#bae6fd' },
    },
    light: {
      id: 'ocean-light',
      name: 'Ocean Breeze',
      primary: { main: '#0284c7', light: '#0ea5e9', dark: '#0369a1', contrastText: '#ffffff' },
      secondary: { main: '#0d9488', light: '#14b8a6', dark: '#0f766e', contrastText: '#ffffff' },
      background: { default: '#f0f9ff', paper: 'rgba(255, 255, 255, 0.8)' },
      text: { primary: '#0c4a6e', secondary: '#0369a1' },
    }
  },
  forest: {
    dark: {
      id: 'forest-dark',
      name: 'Midnight Forest',
      primary: { main: '#22c55e', light: '#4ade80', dark: '#16a34a', contrastText: '#ffffff' },
      secondary: { main: '#84cc16', light: '#a3e635', dark: '#65a30d', contrastText: '#000000' },
      background: { default: '#052e16', paper: 'rgba(2, 44, 34, 0.6)' },
      text: { primary: '#f0fdf4', secondary: '#bbf7d0' },
    },
    light: {
      id: 'forest-light',
      name: 'Morning Woods',
      primary: { main: '#16a34a', light: '#22c55e', dark: '#15803d', contrastText: '#ffffff' },
      secondary: { main: '#65a30d', light: '#84cc16', dark: '#4d7c0f', contrastText: '#ffffff' },
      background: { default: '#f0fdf4', paper: 'rgba(255, 255, 255, 0.8)' },
      text: { primary: '#064e3b', secondary: '#14532d' },
    }
  },
  sunset: {
    dark: {
      id: 'sunset-dark',
      name: 'Dusk',
      primary: { main: '#f43f5e', light: '#fb7185', dark: '#e11d48', contrastText: '#ffffff' },
      secondary: { main: '#f97316', light: '#fb923c', dark: '#ea580c', contrastText: '#000000' },
      background: { default: '#2a0a12', paper: 'rgba(67, 20, 30, 0.6)' },
      text: { primary: '#fff1f2', secondary: '#fecdd3' },
    },
    light: {
      id: 'sunset-light',
      name: 'Dawn',
      primary: { main: '#e11d48', light: '#f43f5e', dark: '#be123c', contrastText: '#ffffff' },
      secondary: { main: '#ea580c', light: '#f97316', dark: '#c2410c', contrastText: '#ffffff' },
      background: { default: '#fff1f2', paper: 'rgba(255, 255, 255, 0.8)' },
      text: { primary: '#881337', secondary: '#9f1239' },
    }
  }
};
