import type { ThemeOptions } from '@mui/material/styles';

export const tenchatThemeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    background: {
      default: '#050505', // Deep, almost black
      paper: 'rgba(20, 20, 25, 0.6)', // Glassy
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
    divider: 'rgba(255, 255, 255, 0.08)',
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
    borderRadius: 24, // More rounded for modern feel
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: "#333 #050505",
          "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
            backgroundColor: "transparent",
            width: 6,
            height: 6,
          },
          "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
            borderRadius: 8,
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            minHeight: 24,
          },
          "&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus": {
            backgroundColor: "rgba(255, 255, 255, 0.2)",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          padding: '10px 24px',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.05) inset',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 20px rgba(139, 92, 246, 0.25), 0 0 0 1px rgba(255,255,255,0.1) inset',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
          border: '1px solid rgba(255,255,255,0.1)',
          '&:hover': {
            background: 'linear-gradient(135deg, #9f7aea, #7c3aed)',
            boxShadow: '0 8px 25px rgba(139, 92, 246, 0.4)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #facc15, #ca8a04)',
          color: '#000',
          border: '1px solid rgba(255,255,255,0.2)',
          '&:hover': {
            background: 'linear-gradient(135deg, #fde047, #eab308)',
            boxShadow: '0 8px 25px rgba(250, 204, 21, 0.4)',
          },
        },
        outlined: {
          borderColor: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
          '&:hover': {
            borderColor: 'rgba(255,255,255,0.2)',
            backgroundColor: 'rgba(255,255,255,0.03)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(15, 15, 20, 0.65)',
          backdropFilter: 'blur(24px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        },
        elevation1: {
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        },
        elevation4: {
          boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          margin: '4px 8px',
          padding: '12px 16px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          border: '1px solid transparent',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            borderColor: 'rgba(255, 255, 255, 0.05)',
            transform: 'scale(1.01)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(139, 92, 246, 0.12)',
            borderColor: 'rgba(139, 92, 246, 0.3)',
            boxShadow: '0 4px 20px rgba(139, 92, 246, 0.15)',
            '&:hover': {
              backgroundColor: 'rgba(139, 92, 246, 0.18)',
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          background: 'linear-gradient(160deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 16,
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            transition: 'all 0.3s ease',
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.08)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.15)',
            },
            '&.Mui-focused': {
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              '& fieldset': {
                borderColor: '#8b5cf6',
                borderWidth: 1,
              },
            },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 28,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'linear-gradient(160deg, rgba(20, 20, 25, 0.9) 0%, rgba(10, 10, 15, 0.95) 100%)',
        },
      },
    },
  },
};
