import type { ThemeOptions } from '@mui/material/styles';

export const tenchatThemeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    background: {
      default: '#030711',
      paper: '#111827',
    },
    primary: {
      main: '#7c3aed',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#a855f7',
      contrastText: '#ffffff',
    },
    text: {
      primary: '#f8fafc',
      secondary: '#94a3b8',
    },
    divider: '#374151',
  },
  typography: {
    fontFamily: 'var(--font-geist-sans, "Inter", system-ui, sans-serif)',
    button: {
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid #1f2937',
        },
      },
    },
  },
};

