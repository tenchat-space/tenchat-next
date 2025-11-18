import React, { useRef } from 'react';
import { Box, IconButton, Paper, Stack, Typography, useTheme } from '@mui/material';
import { Close, CropSquare, Minimize, OpenInNew } from '@mui/icons-material';
import { WindowInstance } from '@/types/window';
import { useWindow } from '@/contexts/WindowContext';
import { useDraggable, useResizable } from '@/hooks/useWindowInteraction';

// ...existing code...
// Placeholder for content registry
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ContentRegistry: Record<string, React.ComponentType<any>> = {
  'CHAT': () => <Box p={2}>Chat Content</Box>,
  'CALL': () => <Box p={2}>Call Content</Box>,
  'PROFILE': () => <Box p={2}>Profile Content</Box>,
  'SETTINGS': () => <Box p={2}>Settings Content</Box>,
};

export function VirtualWindow({ window: win }: { window: WindowInstance }) {
  const { focusWindow, moveWindow, resizeWindow, closeWindow, minimizeWindow, maximizeWindow, restoreWindow } = useWindow();
  const theme = useTheme();
  const windowRef = useRef<HTMLDivElement>(null);

  const { position, handleMouseDown: handleDragStart, isDragging } = useDraggable(
    windowRef,
    win.position,
    (pos) => moveWindow(win.id, pos),
    !win.isMaximized
  );

  const { size, handleResizeStart, isResizing } = useResizable(
    windowRef,
    win.size,
    (s) => resizeWindow(win.id, s),
    !win.isMaximized
  );

  const activeTab = win.tabs.find(t => t.id === win.activeTabId) || win.tabs[0];
  
  // Fix: Don't create components in render.
  let content;
  if (activeTab.component) {
      content = activeTab.component;
  } else {
      const RegistryComponent = ContentRegistry[activeTab.type];
      content = RegistryComponent ? <RegistryComponent {...activeTab.props} /> : <Box p={2}>Unknown Content</Box>;
  }

  if (win.isMinimized || win.isPoppedOut) return null;

  return (
    <Paper
// ...existing code...
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); minimizeWindow(win.id); }}>
            <Minimize fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={(e) => { 
              e.stopPropagation(); 
              if (win.isMaximized) {
                  restoreWindow(win.id);
              } else {
                  maximizeWindow(win.id);
              }
          }}>
            {win.isMaximized ? <OpenInNew fontSize="small" sx={{ transform: 'rotate(180deg)' }} /> : <CropSquare fontSize="small" />}
          </IconButton>
          <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); closeWindow(win.id); }}>
            <Close fontSize="small" />
          </IconButton>
        </Stack>
      </Box>

      {/* Window Content */}
      <Box sx={{ flex: 1, overflow: 'auto', bgcolor: 'background.paper', position: 'relative' }}>
        {content}
        
        {/* Resize Handle */}
// ...existing code...


export function VirtualWindow({ window: win }: { window: WindowInstance }) {
  const { focusWindow, moveWindow, resizeWindow, closeWindow, minimizeWindow, maximizeWindow, restoreWindow } = useWindow();
  const theme = useTheme();
  const windowRef = useRef<HTMLDivElement>(null);

  const { position, handleMouseDown: handleDragStart, isDragging } = useDraggable(
    windowRef,
    win.position,
    (pos) => moveWindow(win.id, pos),
    !win.isMaximized
  );

  const { size, handleResizeStart, isResizing } = useResizable(
    windowRef,
    win.size,
    (s) => resizeWindow(win.id, s),
    !win.isMaximized
  );

  const activeTab = win.tabs.find(t => t.id === win.activeTabId) || win.tabs[0];
  const ContentComponent = activeTab.component ? () => <>{activeTab.component}</> : (ContentRegistry[activeTab.type] || (() => <Box p={2}>Unknown Content</Box>));

  if (win.isMinimized || win.isPoppedOut) return null;

  return (
    <Paper
      ref={windowRef}
      elevation={8}
      sx={{
        position: 'fixed',
        left: win.isMaximized ? 0 : position.x,
        top: win.isMaximized ? 0 : position.y,
        width: win.isMaximized ? '100vw' : size.width,
        height: win.isMaximized ? '100vh' : size.height,
        zIndex: win.zIndex,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRadius: win.isMaximized ? 0 : 2,
        border: win.isMaximized ? 'none' : `1px solid ${theme.palette.divider}`,
        transition: isDragging || isResizing ? 'none' : 'all 0.2s ease-out',
        pointerEvents: 'auto',
      }}
      onMouseDown={() => focusWindow(win.id)}
    >
      {/* Window Header / Drag Handle */}
      <Box
        className="window-drag-handle"
        onMouseDown={handleDragStart}
        sx={{
          height: 40,
          bgcolor: 'background.default',
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 1,
          cursor: win.isMaximized ? 'default' : 'grab',
          userSelect: 'none',
          '&:active': { cursor: win.isMaximized ? 'default' : 'grabbing' }
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
            {/* Tabs would go here */}
            <Typography variant="subtitle2" fontWeight="bold" sx={{ px: 1 }}>
                {activeTab.title}
            </Typography>
        </Stack>

        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); minimizeWindow(win.id); }}>
            <Minimize fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); win.isMaximized ? restoreWindow(win.id) : maximizeWindow(win.id); }}>
            {win.isMaximized ? <OpenInNew fontSize="small" sx={{ transform: 'rotate(180deg)' }} /> : <CropSquare fontSize="small" />}
          </IconButton>
          <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); closeWindow(win.id); }}>
            <Close fontSize="small" />
          </IconButton>
        </Stack>
      </Box>

      {/* Window Content */}
      <Box sx={{ flex: 1, overflow: 'auto', bgcolor: 'background.paper', position: 'relative' }}>
        <ContentComponent {...activeTab.props} />
        
        {/* Resize Handle */}
        {!win.isMaximized && (
            <Box
                onMouseDown={(e) => handleResizeStart(e, 'se')}
                sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 16,
                    height: 16,
                    cursor: 'nwse-resize',
                    zIndex: 10,
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 4,
                        right: 4,
                        width: 8,
                        height: 8,
                        borderRight: '2px solid',
                        borderBottom: '2px solid',
                        borderColor: 'text.disabled'
                    }
                }}
            />
        )}
      </Box>
    </Paper>
  );
}
