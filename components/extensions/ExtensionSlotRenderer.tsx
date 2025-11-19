import React from 'react';
import { Box, Stack } from '@mui/material';
import { useKernel } from '@/contexts/KernelContext';
import { ExtensionSlot } from '@/types/extension';

interface ExtensionSlotProps {
  slot: ExtensionSlot;
  direction?: 'row' | 'column';
  spacing?: number;
}

export function ExtensionSlotRenderer({ slot, direction = 'column', spacing = 1 }: ExtensionSlotProps) {
  const { registeredWidgets } = useKernel();
  const widgets = registeredWidgets[slot] || [];

  if (widgets.length === 0) return null;

  return (
    <Stack direction={direction} spacing={spacing} alignItems="center">
      {widgets.map((widget, index) => (
        <Box key={`${slot}-${index}`}>
          {widget}
        </Box>
      ))}
    </Stack>
  );
}
