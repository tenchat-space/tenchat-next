"use client";

import { ThemeProvider, CssBaseline } from "@mui/material";
import { useMemo } from "react";
import { createTheme } from "@mui/material/styles";
import { tenchatThemeOptions } from "@/theme/mui-theme";

interface TenchatThemeProviderProps {
  children: React.ReactNode;
}

export function TenchatThemeProvider({ children }: TenchatThemeProviderProps) {
  const theme = useMemo(() => createTheme(tenchatThemeOptions), []);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

