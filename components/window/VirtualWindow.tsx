"use client";

import React, { useRef } from 'react';
import { Box, IconButton, Paper, Stack, Typography } from '@mui/material';
import { Close, CropSquare, Minimize, OpenInNew } from '@mui/icons-material';
import { WindowInstance, WindowContentType } from '@/types/window';
import { useWindow } from '@/contexts/WindowContext';
import { useDraggable, useResizable } from '@/hooks/useWindowInteraction';
import { ChatWindow } from '@/components/chat/window/ChatWindow';
import { CallWindow } from '@/components/window/CallWindow';
import { motion } from 'framer-motion';
import { useWindowAnimation } from '@/hooks/useMotionConfig';
import { useVisualFeedback } from '@/hooks/useVisualFeedback';

const MotionPaper = motion(Paper);
const MotionIconButton = motion(IconButton);

const DefaultContentRegistry: Record<WindowContentType, React.ComponentType<Record<string, unknown>>> = {
  CHAT: (props) => {
    const typedProps = props as unknown as React.ComponentProps<typeof ChatWindow>;
    return <ChatWindow {...typedProps} />;
  },
  CALL: (props) => {
    const typedProps = props as unknown as React.ComponentProps<typeof CallWindow>;
    return <CallWindow {...typedProps} />;
  },
  PROFILE: () => <Box p={2}>Profile content</Box>,
  SETTINGS: () => <Box p={2}>Settings content</Box>,
  CUSTOM: () => <Box p={2}>Custom content</Box>,
};

const fallbackContent = (type: WindowContentType, props?: Record<string, unknown>) => {
  const Component = DefaultContentRegistry[type];
  if (!Component) return <Box p={2}>Unknown content</Box>;
  return <Component {...props} />;
};

export function VirtualWindow({ window: win }: { window: WindowInstance }) {
  const { focusWindow, moveWindow, resizeWindow, closeWindow, minimizeWindow, maximizeWindow, restoreWindow } = useWindow();
  const windowRef = useRef<HTMLDivElement>(null);
  const variants = useWindowAnimation();
  const feedback = useVisualFeedback();

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

  const activeTab = win.tabs.find((t) => t.id === win.activeTabId) || win.tabs[0];
  if (!activeTab) return null;

  const content = activeTab.component ?? fallbackContent(activeTab.type, activeTab.props);

  // We don't return null here for minimized/popped out because WindowContainer filters them
  // and AnimatePresence needs the component to exist to animate it out.
  
  return (
    <MotionPaper
      ref={windowRef}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
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
        // Let the theme handle border radius and border style via MuiPaper overrides
        // Only override for maximized state
        borderRadius: win.isMaximized ? 0 : undefined, 
        border: win.isMaximized ? 'none' : undefined,
        
        // Remove transition for position/size if we are dragging/resizing, 
        // but we might want to keep it for the entrance/exit animation?
        // Framer motion handles the entrance/exit via variants.
        // The 'transition' in sx might conflict with framer motion's transform animations?
        // Framer motion uses transform. sx uses left/top/width/height.
        // So they should be orthogonal.
        transition: isDragging || isResizing ? 'none' : 'box-shadow 0.2s, border-color 0.2s', 
        pointerEvents: 'auto',
      }}
      onMouseDown={() => focusWindow(win.id)}
    >
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
          '&:active': { cursor: win.isMaximized ? 'default' : 'grabbing' },
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="subtitle2" fontWeight="bold" sx={{ px: 1 }}>
            {activeTab.title}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={0.5}>
          <MotionIconButton 
            size="small" 
            onClick={(e) => { e.stopPropagation(); minimizeWindow(win.id); }}
            {...feedback}
          >
            <Minimize fontSize="small" />
          </MotionIconButton>
          <MotionIconButton 
            size="small" 
            onClick={(e) => {
              e.stopPropagation();
              if (win.isMaximized) {
                restoreWindow(win.id);
              } else {
                maximizeWindow(win.id);
              }
            }}
            {...feedback}
          >
            {win.isMaximized ? <OpenInNew fontSize="small" sx={{ transform: 'rotate(180deg)' }} /> : <CropSquare fontSize="small" />}
          </MotionIconButton>
          <MotionIconButton 
            size="small" 
            color="error" 
            onClick={(e) => { e.stopPropagation(); closeWindow(win.id); }}
            {...feedback}
          >
            <Close fontSize="small" />
          </MotionIconButton>
        </Stack>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto', bgcolor: 'background.paper', position: 'relative' }}>
        {content}

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
                borderColor: 'text.disabled',
              },
            }}
          />
        )}
      </Box>
    </MotionPaper>
  );
}
