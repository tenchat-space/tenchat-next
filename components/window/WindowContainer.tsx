import React from 'react';
import { Box } from '@mui/material';
import { useWindow } from '@/contexts/WindowContext';
import { VirtualWindow } from './VirtualWindow';
import { AnimatePresence } from 'framer-motion';

export function WindowContainer() {
  const { windows } = useWindow();

  // We always render the container so AnimatePresence can work even when the last window closes
  // But we can return null if no windows AND no exiting windows? 
  // AnimatePresence handles the exit, so we just render it.
  
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
      <AnimatePresence mode="popLayout">
        {windows.filter(w => !w.isMinimized && !w.isPoppedOut).map(win => (
          <VirtualWindow key={win.id} window={win} />
        ))}
      </AnimatePresence>
    </Box>
  );
}
