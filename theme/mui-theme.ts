import type { ThemeOptions } from '@mui/material/styles';

export const tenchatThemeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    background: {
      default: '#0c040b',
      paper: 'rgba(19, 11, 31, 0.6)', // More transparent for glass effect
    },
    primary: {
      main: '#8b5cf6', // Violet 500
      light: '#a78bfa',
      dark: '#7c3aed',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#facc15', // Yellow 400
      light: '#fde047',
      dark: '#eab308',
      contrastText: '#05010c',
    },
    text: {
      primary: '#fefce8', // Yellow 50
      secondary: '#fef08a', // Yellow 200
    },
    divider: 'rgba(250, 204, 21, 0.15)',
  },
  typography: {
    fontFamily: 'var(--font-geist-sans, "Inter", system-ui, sans-serif)',
    h5: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h6: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #facc15, #eab308)',
          color: '#05010c',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(19, 11, 31, 0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          margin: '4px 8px',
          padding: '10px 16px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: 'rgba(139, 92, 246, 0.08)',
            transform: 'translateX(4px)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(139, 92, 246, 0.15)',
            borderLeft: '3px solid #facc15',
            '&:hover': {
              backgroundColor: 'rgba(139, 92, 246, 0.2)',
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        },
      },
    },
  },
};
