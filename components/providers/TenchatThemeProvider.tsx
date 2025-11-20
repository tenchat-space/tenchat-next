"use client";

import { ThemeProvider, CssBaseline, useMediaQuery } from "@mui/material";
import { useMemo } from "react";
import { createTheme } from "@mui/material/styles";
import { getThemeOptions } from "@/theme/mui-theme";
import { useStyle } from "@/contexts/StyleContext";
import { BORDER_RADIUS_VALUES, DEPTH_SHADOWS, BLUR_VALUES } from "@/types/style";

interface TenchatThemeProviderProps {
  children: React.ReactNode;
}

export function TenchatThemeProvider({ children }: TenchatThemeProviderProps) {
  const { styleConfig } = useStyle();
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = useMemo(() => {
    const mode = styleConfig.themeMode === 'system' 
      ? (prefersDarkMode ? 'dark' : 'light') 
      : styleConfig.themeMode;

    const baseThemeOptions = getThemeOptions(mode, styleConfig.paletteId);
    
    const primaryMainColor = (baseThemeOptions.palette?.primary as { main?: string })?.main || '#1976d2';

    const radius = BORDER_RADIUS_VALUES[styleConfig.borderRadius];
    const shadow = DEPTH_SHADOWS[styleConfig.depth];
    const blur = BLUR_VALUES[styleConfig.blur];
    
    // Create a base theme to override
    const baseTheme = createTheme({
      ...baseThemeOptions,
      shape: {
        borderRadius: radius,
      },
      components: {
        ...baseThemeOptions.components,
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
              // Use palette color but adjust opacity if needed for glass effect
              backgroundColor: styleConfig.borderStyle === 'glass' 
                ? baseThemeOptions.palette?.background?.paper 
                : (mode === 'dark' ? 'rgba(15, 15, 20, 0.95)' : 'rgba(255, 255, 255, 0.95)'),
              backdropFilter: blur,
              border: styleConfig.borderStyle === 'diffuse' 
                ? (mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.03)' : '1px solid rgba(0, 0, 0, 0.03)')
                : (mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)'),
              boxShadow: shadow,
              transition: 'box-shadow 0.3s ease-in-out, border-color 0.3s ease-in-out, background-color 0.3s ease',
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            ...baseThemeOptions.components?.MuiButton?.styleOverrides,
            root: {
              ...(baseThemeOptions.components?.MuiButton?.styleOverrides?.root as any),
              borderRadius: radius,
              '&:hover': {
                ...(baseThemeOptions.components?.MuiButton?.styleOverrides?.root as any)['&:hover'],
                transform: styleConfig.scaleOnHover ? 'translateY(-1px)' : 'none',
                boxShadow: styleConfig.activeGlow 
                  ? (mode === 'dark' ? `0 4px 12px ${primaryMainColor}40` : `0 4px 12px ${primaryMainColor}40`)
                  : 'none',
              },
            },
          }
        },
        MuiDialog: {
          styleOverrides: {
            paper: {
              borderRadius: radius + 4,
              boxShadow: DEPTH_SHADOWS['extreme'],
              backdropFilter: blur,
              border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.05)',
              background: mode === 'dark'
                ? 'linear-gradient(160deg, rgba(20, 20, 25, 0.9) 0%, rgba(10, 10, 15, 0.95) 100%)'
                : 'linear-gradient(160deg, rgba(255, 255, 255, 0.9) 0%, rgba(240, 240, 245, 0.95) 100%)',
            }
          }
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: radius,
              backdropFilter: blur,
              boxShadow: shadow,
              background: mode === 'dark' 
                ? 'linear-gradient(160deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)'
                : 'linear-gradient(160deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.5) 100%)',
            }
          }
        }
      },
    });

    return baseTheme;
  }, [styleConfig, prefersDarkMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

