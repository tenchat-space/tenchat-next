import type { ThemeOptions } from '@mui/material/styles';

export const tenchatThemeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    background: {
      default: '#0c040b',
      paper: '#130b1f',
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
      primary: '#fcf0d6',
      secondary: '#fde68a',
    },
    divider: '#facc15',
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
          boxShadow: '0 10px 30px rgba(7,10,30,0.65)',
          position: 'relative',
          overflow: 'hidden',
        },
        containedPrimary: {
          backgroundImage: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
        },
        containedSecondary: {
          backgroundImage: 'linear-gradient(135deg, #facc15, #eab308)',
          color: '#05010c',
          boxShadow: '0 25px 40px rgba(250,204,21,0.4)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage:
            'linear-gradient(160deg, rgba(124, 58, 237, 0.5), rgba(15, 23, 42, 0.95))',
          border: '1px solid rgba(250, 204, 21, 0.35)',
          boxShadow: '0 35px 65px rgba(4, 0, 12, 0.75)',
          backdropFilter: 'blur(18px)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          boxShadow: '0 18px 40px rgba(7,3,18,0.5)',
          borderRadius: 16,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          margin: '0.35rem 0',
          backgroundColor: 'rgba(15,23,42,0.45)',
          boxShadow: '0 20px 40px rgba(4,0,12,0.6), inset 0 -1px 0 rgba(250,204,21,0.2)',
        },
      },
    },
  },
};

