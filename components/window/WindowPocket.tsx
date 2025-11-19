import React from 'react';
import { Box, Paper, Tooltip, Typography, Stack } from '@mui/material';
import { useWindow } from '@/contexts/WindowContext';
import { useTheme, alpha } from '@mui/material/styles';

export function WindowPocket() {
  const theme = useTheme();
  const { windows, restoreWindow } = useWindow();
  const minimizedWindows = windows.filter(w => w.isMinimized);

  if (minimizedWindows.length === 0) return null;

  const pocketBg = alpha(theme.palette.background.paper, 0.8);

  return (
    <Paper
      elevation={4}
      sx={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1400,
        borderRadius: 4,
        p: 1,
        bgcolor: pocketBg,
        backdropFilter: 'blur(8px)',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Stack direction="row" spacing={1}>
        {minimizedWindows.map(win => {
            const activeTab = win.tabs.find(t => t.id === win.activeTabId) || win.tabs[0];
            return (
                <Tooltip key={win.id} title={activeTab.title} arrow placement="top">
                    <Box
                        onClick={() => restoreWindow(win.id)}
                        sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            bgcolor: 'background.paper',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            border: '1px solid',
                            borderColor: 'divider',
                            transition: 'transform 0.2s',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: 2
                            }
                        }}
                    >
                        <Typography variant="caption" fontWeight="bold">
                            {activeTab.title.substring(0, 2).toUpperCase()}
                        </Typography>
                    </Box>
                </Tooltip>
            );
        })}
      </Stack>
    </Paper>
  );
}
