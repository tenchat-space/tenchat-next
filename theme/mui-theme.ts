import type { ThemeOptions } from '@mui/material/styles';
import { THEME_PALETTES } from '@/types/theme';

export const getThemeOptions = (mode: 'light' | 'dark', paletteId: string = 'default'): ThemeOptions => {
  const paletteGroup = THEME_PALETTES[paletteId] || THEME_PALETTES['default'];
  const p = paletteGroup[mode];

  return {
    palette: {
      mode,
      ...p,
      divider: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
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
      borderRadius: 24,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarColor: mode === 'dark' ? "#333 #050505" : "#ccc #f0f0f0",
            "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
              backgroundColor: "transparent",
              width: 6,
              height: 6,
            },
            "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
              borderRadius: 8,
              backgroundColor: mode === 'dark' ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
              minHeight: 24,
            },
            "&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus": {
              backgroundColor: mode === 'dark' ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)",
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            padding: '10px 24px',
            boxShadow: mode === 'dark' ? '0 0 0 1px rgba(255,255,255,0.05) inset' : '0 0 0 1px rgba(0,0,0,0.05) inset',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: `0 4px 20px ${p.primary.main}40, 0 0 0 1px ${mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} inset`,
            },
          },
          containedPrimary: {
            background: `linear-gradient(135deg, ${p.primary.main}, ${p.primary.dark})`,
            border: '1px solid rgba(255,255,255,0.1)',
            '&:hover': {
              background: `linear-gradient(135deg, ${p.primary.light}, ${p.primary.main})`,
              boxShadow: `0 8px 25px ${p.primary.main}66`,
            },
          },
          containedSecondary: {
            background: `linear-gradient(135deg, ${p.secondary.main}, ${p.secondary.dark})`,
            color: p.secondary.contrastText,
            border: '1px solid rgba(255,255,255,0.2)',
            '&:hover': {
              background: `linear-gradient(135deg, ${p.secondary.light}, ${p.secondary.main})`,
              boxShadow: `0 8px 25px ${p.secondary.main}66`,
            },
          },
          outlined: {
            borderColor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            backdropFilter: 'blur(10px)',
            '&:hover': {
              borderColor: mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
              backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: p.background.paper,
            backdropFilter: 'blur(24px) saturate(180%)',
            border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.06)',
            boxShadow: mode === 'dark' ? '0 8px 32px rgba(0, 0, 0, 0.4)' : '0 8px 32px rgba(0, 0, 0, 0.1)',
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
              backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
              borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
              transform: 'scale(1.01)',
            },
            '&.Mui-selected': {
              backgroundColor: `${p.primary.main}1f`, // 12% opacity
              borderColor: `${p.primary.main}4d`, // 30% opacity
              boxShadow: `0 4px 20px ${p.primary.main}26`, // 15% opacity
              '&:hover': {
                backgroundColor: `${p.primary.main}2e`, // 18% opacity
              },
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 24,
            background: mode === 'dark' 
              ? 'linear-gradient(160deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)'
              : 'linear-gradient(160deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.5) 100%)',
            backdropFilter: 'blur(20px)',
            border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.05)',
            boxShadow: mode === 'dark' ? '0 8px 32px rgba(0, 0, 0, 0.2)' : '0 8px 32px rgba(0, 0, 0, 0.05)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 16,
              backgroundColor: mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.5)',
              transition: 'all 0.3s ease',
              '& fieldset': {
                borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
              },
              '&:hover fieldset': {
                borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
              },
              '&.Mui-focused': {
                backgroundColor: mode === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.8)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                '& fieldset': {
                  borderColor: p.primary.main,
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
            border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
            background: mode === 'dark'
              ? 'linear-gradient(160deg, rgba(20, 20, 25, 0.9) 0%, rgba(10, 10, 15, 0.95) 100%)'
              : 'linear-gradient(160deg, rgba(255, 255, 255, 0.9) 0%, rgba(240, 240, 245, 0.95) 100%)',
          },
        },
      },
    },
  };
};

export const tenchatThemeOptions = getThemeOptions('dark', 'default');

