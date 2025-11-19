"use client";

import { ThemeProvider, CssBaseline } from "@mui/material";
import { useMemo } from "react";
import { createTheme } from "@mui/material/styles";
import { tenchatThemeOptions } from "@/theme/mui-theme";
import { useStyle } from "@/contexts/StyleContext";
import { BORDER_RADIUS_VALUES, DEPTH_SHADOWS, BLUR_VALUES } from "@/types/style";

interface TenchatThemeProviderProps {
  children: React.ReactNode;
}

export function TenchatThemeProvider({ children }: TenchatThemeProviderProps) {
  const { styleConfig } = useStyle();

  const theme = useMemo(() => {
    const radius = BORDER_RADIUS_VALUES[styleConfig.borderRadius];
    const shadow = DEPTH_SHADOWS[styleConfig.depth];
    const blur = BLUR_VALUES[styleConfig.blur];
    
    // Create a base theme to override
    const baseTheme = createTheme({
      ...tenchatThemeOptions,
      shape: {
        borderRadius: radius,
      },
      components: {
        ...tenchatThemeOptions.components,
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
              backgroundColor: styleConfig.borderStyle === 'glass' 
                ? 'rgba(20, 20, 25, 0.6)' 
                : 'rgba(15, 15, 20, 0.85)', // More solid if not glass
              backdropFilter: blur,
              border: styleConfig.borderStyle === 'diffuse' 
                ? '1px solid rgba(255, 255, 255, 0.03)' // Very subtle for diffuse
                : '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: shadow,
              transition: 'box-shadow 0.3s ease-in-out, border-color 0.3s ease-in-out',
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: radius, // Match global radius or slightly less? Let's match for consistency
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: 'none',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: styleConfig.scaleOnHover ? 'translateY(-1px)' : 'none',
                boxShadow: styleConfig.activeGlow ? '0 4px 12px rgba(139, 92, 246, 0.25)' : 'none',
              },
            },
            containedPrimary: {
               background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
               '&:hover': {
                 background: 'linear-gradient(135deg, #9f7aea, #7c3aed)',
                 boxShadow: styleConfig.activeGlow ? '0 8px 20px rgba(139, 92, 246, 0.4)' : 'none',
               }
            },
            containedSecondary: {
               background: 'linear-gradient(135deg, #facc15, #ca8a04)',
               color: '#000',
               '&:hover': {
                 background: 'linear-gradient(135deg, #fde047, #eab308)',
                 boxShadow: styleConfig.activeGlow ? '0 8px 20px rgba(250, 204, 21, 0.4)' : 'none',
               }
            }
          }
        },
        MuiDialog: {
          styleOverrides: {
            paper: {
              borderRadius: radius + 4, // Slightly more rounded for dialogs
              boxShadow: DEPTH_SHADOWS['extreme'], // Always high depth for dialogs
              backdropFilter: blur,
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }
          }
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: radius,
              backdropFilter: blur,
              boxShadow: shadow,
            }
          }
        }
      },
    });

    return baseTheme;
  }, [styleConfig]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

