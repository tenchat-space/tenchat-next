import React, { useState } from 'react';
import { Box, Button, Typography, Paper, Stack, TextField } from '@mui/material';
import { useKernel } from '@/contexts/KernelContext';
import { useWindow } from '@/contexts/WindowContext';

export function ExtensionManager() {
  const { api, installExtension, extensions } = useKernel();
  const { windows } = useWindow();
  const [targetWindowId, setTargetWindowId] = useState<string>('');

  const handleBlur = () => {
    if (targetWindowId) {
      api.window.blur(targetWindowId, 10);
    }
  };

  const handleUnblur = () => {
    if (targetWindowId) {
      api.window.blur(targetWindowId, 0);
    }
  };

  const handleLock = () => {
    if (targetWindowId) {
      api.window.lock(targetWindowId);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h6" gutterBottom>Extension Kernel Manager</Typography>
      
      <Paper sx={{ p: 2, mb: 3, bgcolor: 'rgba(255,255,255,0.05)' }}>
        <Typography variant="subtitle2" gutterBottom>Active Windows (Kernel View)</Typography>
        <Stack spacing={1}>
          {windows.map(w => (
            <Box 
              key={w.id} 
              onClick={() => setTargetWindowId(w.id)}
              sx={{ 
                p: 1, 
                border: '1px solid',
                borderColor: targetWindowId === w.id ? 'primary.main' : 'divider',
                cursor: 'pointer',
                bgcolor: targetWindowId === w.id ? 'rgba(25, 118, 210, 0.1)' : 'transparent'
              }}
            >
              <Typography variant="body2">{w.tabs[0]?.title} ({w.id})</Typography>
              <Typography variant="caption" color="text.secondary">
                Blurred: {w.isBlurred ? 'Yes' : 'No'} | Locked: {w.isLocked ? 'Yes' : 'No'}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Paper>

      <Stack direction="row" spacing={2} mb={3}>
        <Button variant="contained" color="warning" onClick={handleBlur} disabled={!targetWindowId}>
          Blur Window
        </Button>
        <Button variant="outlined" onClick={handleUnblur} disabled={!targetWindowId}>
          Unblur
        </Button>
        <Button variant="contained" color="error" onClick={handleLock} disabled={!targetWindowId}>
          Lock Window
        </Button>
      </Stack>

      <Typography variant="subtitle2" gutterBottom>Installed Extensions</Typography>
      {extensions.length === 0 ? (
        <Typography variant="body2" color="text.secondary">No extensions installed.</Typography>
      ) : (
        <Stack spacing={1}>
          {extensions.map(ext => (
            <Paper key={ext.id} sx={{ p: 1 }}>
              <Typography variant="body2" fontWeight="bold">{ext.name}</Typography>
              <Typography variant="caption">{ext.description}</Typography>
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
}
