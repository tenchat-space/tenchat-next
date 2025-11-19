import React, { useState } from 'react';
import { Box, Button, Typography, Paper, Stack, TextField, Chip } from '@mui/material';
import { useKernel } from '@/contexts/KernelContext';
import { useWindow } from '@/contexts/WindowContext';
import { ExtensionManifest } from '@/types/extension';
import { useTheme, alpha } from '@mui/material/styles';

export function ExtensionManager() {
  const { api, installExtension, extensions } = useKernel();
  const { windows } = useWindow();
  const [targetWindowId, setTargetWindowId] = useState<string>('');
  const theme = useTheme();

  const paperBg = alpha(theme.palette.text.primary, 0.05);
  const selectedBg = alpha(theme.palette.primary.main, 0.1);

  // Demo: Install a sample extension that adds a button to the chat header
  const installDemoExtension = () => {
    const manifest: ExtensionManifest = {
      id: 'demo-ext-1',
      name: 'Quick Actions',
      version: '1.0.0',
      description: 'Adds a quick action button to chat header',
      author: 'Tenchat Team',
      permissions: ['window:create']
    };

    // In a real scenario, the component would be loaded dynamically.
    // Here we simulate the registration effect.
    api.ui.registerWidget('chat_header_action', (
      <Button 
        key="demo-btn" 
        variant="contained" 
        color="success" 
        size="small"
        onClick={() => api.ui.showToast('Action from Extension!', 'success')}
      >
        Ext Action
      </Button>
    ));

    installExtension(manifest, '');
  };

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
      
      <Paper sx={{ p: 2, mb: 3, bgcolor: paperBg }}>
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
                bgcolor: targetWindowId === w.id ? selectedBg : 'transparent'
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
      
      <Button variant="outlined" onClick={installDemoExtension} sx={{ mb: 2 }}>
        Install Demo Extension (Adds Widget)
      </Button>

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
