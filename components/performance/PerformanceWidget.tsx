import React from 'react';
import { Box, Typography, Stack, Button, Chip } from '@mui/material';
import { usePerformance } from '@/contexts/PerformanceContext';
import { Speed, CleaningServices } from '@mui/icons-material';

export function PerformanceWidget() {
  const { metrics, mode, config, recommendations, clearClutter } = usePerformance();

  const getHealthColor = (score: number) => {
    if (score > 80) return 'success.main';
    if (score > 50) return 'warning.main';
    return 'error.main';
  };

  return (
    <Box sx={{ p: 2, minWidth: 300 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Speed color="primary" />
            <Typography variant="h6" fontWeight="bold">System Health</Typography>
          </Box>
          <Chip 
            label={`${metrics.score}%`} 
            sx={{ 
              bgcolor: getHealthColor(metrics.score), 
              color: 'black', 
              fontWeight: 'bold' 
            }} 
          />
        </Box>

        {/* Metrics Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary">FPS</Typography>
            <Typography variant="h4" fontWeight="bold" color={metrics.fps < 30 ? 'error.main' : 'text.primary'}>
              {metrics.fps}
            </Typography>
          </Box>
          <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary">Windows</Typography>
            <Typography variant="h4" fontWeight="bold" color={metrics.windowCount > config.maxWindows ? 'warning.main' : 'text.primary'}>
              {metrics.windowCount} <Typography component="span" variant="caption" color="text.secondary">/ {config.maxWindows}</Typography>
            </Typography>
          </Box>
        </Box>

        {/* Mode Indicator */}
        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom>Current Mode</Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip 
              label={mode.toUpperCase()} 
              color="secondary" 
              variant="outlined" 
              size="small" 
            />
            {mode === 'dynamic' && (
              <Typography variant="caption" color="text.secondary">
                (Effective: {config.mode === 'dynamic' ? (metrics.isMobile ? 'LOW' : 'AUTO') : config.mode.toUpperCase()})
              </Typography>
            )}
          </Stack>
        </Box>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <Box sx={{ p: 2, bgcolor: 'rgba(255, 165, 0, 0.1)', borderRadius: 2, border: '1px solid rgba(255, 165, 0, 0.2)' }}>
            <Typography variant="subtitle2" color="warning.main" gutterBottom>Recommendations</Typography>
            <Stack spacing={1}>
              {recommendations.map((rec, i) => (
                <Typography key={i} variant="caption" display="block">• {rec}</Typography>
              ))}
            </Stack>
          </Box>
        )}

        {/* Actions */}
        <Button 
          variant="outlined" 
          color="secondary" 
          startIcon={<CleaningServices />}
          onClick={clearClutter}
          fullWidth
        >
          Clear Clutter
        </Button>
      </Stack>
    </Box>
  );
}
