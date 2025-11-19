import React from 'react';
import { Box, Typography, Stack, Button, Chip } from '@mui/material';
import { usePerformance } from '@/contexts/PerformanceContext';
import { Speed, CleaningServices } from '@mui/icons-material';
import { useTheme, alpha } from '@mui/material/styles';

export function PerformanceWidget() {
  const { metrics, mode, setMode, config, recommendations, clearClutter } = usePerformance();
  const theme = useTheme();

  const getHealthColor = (score: number) => {
    if (score > 80) return 'success.main';
    if (score > 50) return 'warning.main';
    return 'error.main';
  };

  const cardBg = alpha(theme.palette.text.primary, 0.05);

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
          <Box sx={{ p: 2, bgcolor: cardBg, borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary">FPS</Typography>
            <Typography variant="h4" fontWeight="bold" color={metrics.fps < 30 ? 'error.main' : 'text.primary'}>
              {metrics.fps}
            </Typography>
          </Box>
          <Box sx={{ p: 2, bgcolor: cardBg, borderRadius: 2 }}>
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
          <Box sx={{ p: 2, bgcolor: alpha(theme.palette.warning.main, 0.1), borderRadius: 2, border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}` }}>
            <Typography variant="subtitle2" color="warning.main" gutterBottom>Recommendations</Typography>
            <Stack spacing={1}>
              {recommendations.map((rec, i) => (
                <Typography key={i} variant="caption" display="block">• {rec}</Typography>
              ))}
            </Stack>
          </Box>
        )}

        {/* Actions */}
        <Box>
            <Typography variant="caption" color="text.secondary" gutterBottom>Quick Actions</Typography>
            <Stack spacing={1}>
                <Button 
                variant="outlined" 
                color="secondary" 
                startIcon={<CleaningServices />}
                onClick={clearClutter}
                fullWidth
                size="small"
                >
                Clear Clutter
                </Button>
                
                <Stack direction="row" spacing={1}>
                    <Button 
                        variant={mode === 'low' ? 'contained' : 'outlined'} 
                        color="success" 
                        onClick={() => setMode('low')}
                        fullWidth
                        size="small"
                        sx={{ textTransform: 'none' }}
                    >
                        Save Power
                    </Button>
                    <Button 
                        variant={mode === 'high' ? 'contained' : 'outlined'} 
                        color="error" 
                        onClick={() => setMode('high')}
                        fullWidth
                        size="small"
                        sx={{ textTransform: 'none' }}
                    >
                        Boost
                    </Button>
                </Stack>
                <Button 
                    variant={mode === 'dynamic' ? 'contained' : 'outlined'} 
                    color="info" 
                    onClick={() => setMode('dynamic')}
                    fullWidth
                    size="small"
                    sx={{ textTransform: 'none' }}
                >
                    Auto (Dynamic)
                </Button>
            </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
