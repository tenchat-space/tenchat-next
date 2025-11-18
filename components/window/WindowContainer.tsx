import React from 'react';
import { Box } from '@mui/material';
import { useWindow } from '@/contexts/WindowContext';
import { VirtualWindow } from './VirtualWindow';

export function WindowContainer() {
  const { windows } = useWindow();

  if (windows.length === 0) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none', // Allow clicks to pass through to underlying app
        zIndex: 1300, // Above sidebar and other UI
      }}
    >
      {windows.map(win => (
        <VirtualWindow key={win.id} window={win} />
      ))}
    </Box>
  );
}
