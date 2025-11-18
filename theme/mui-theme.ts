import type { ThemeOptions } from '@mui/material/styles';

export const tenchatThemeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    background: {
      default: '#05010c',
      paper: '#12051f',
    },
    primary: {
      main: '#7c3aed',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#facc15',
      contrastText: '#05010c',
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
          fontWeight: 600,
        },
        containedPrimary: {
          backgroundImage: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
        },
        containedSecondary: {
          backgroundImage: 'linear-gradient(135deg, #facc15, #eab308)',
          color: '#05010c',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(180deg, rgba(124, 58, 237, 0.2), rgba(15, 23, 42, 0.8))',
          border: '1px solid rgba(250, 204, 21, 0.25)',
        },
      },
    },
  },
};

