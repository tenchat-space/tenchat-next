import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  TrendingUp,
  AccessTime,
  CheckCircle
} from '@mui/icons-material';
import { PredictionMarket } from '@/types/prediction';
import { useTheme, alpha } from '@mui/material/styles';

interface PredictionCardProps {
  market: PredictionMarket;
  onBet?: (optionId: string, amount: number) => void;
  /** Reserved for future use */
  isSelf?: boolean;
}

export function PredictionCard({ market, onBet }: PredictionCardProps) {
  const theme = useTheme();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [betAmount, setBetAmount] = useState('');
  const [betDialogOpen, setBetDialogOpen] = useState(false);

  const handleOptionClick = (optionId: string) => {
    if (market.status !== 'active') return;
    setSelectedOption(optionId);
    setBetDialogOpen(true);
  };

  const handlePlaceBet = () => {
    if (selectedOption && betAmount && onBet) {
      onBet(selectedOption, parseFloat(betAmount));
      setBetDialogOpen(false);
      setBetAmount('');
      setSelectedOption(null);
    }
  };

  const totalPool = market.totalPool || 1; // Avoid division by zero

  const getStatusColor = () => {
    switch (market.status) {
      case 'active': return 'success';
      case 'closed': return 'warning';
      case 'resolved': return 'info';
      default: return 'default';
    }
  };

  return (
    <Card 
      sx={{ 
        maxWidth: 320, 
        bgcolor: alpha(theme.palette.background.paper, 0.9),
        backdropFilter: 'blur(10px)',
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        boxShadow: theme.shadows[4]
      }}
    >
      <Box sx={{ 
        p: 2, 
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
      }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
          <Stack direction="row" spacing={1} alignItems="center">
            <TrendingUp color="secondary" fontSize="small" />
            <Typography variant="caption" fontWeight={700} color="secondary.main">
              PREDICTION MARKET
            </Typography>
          </Stack>
          <Chip 
            label={market.status.toUpperCase()} 
            size="small" 
            color={getStatusColor()} 
            sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }} 
          />
        </Stack>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 1, lineHeight: 1.3 }}>
          {market.question}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
          <AccessTime fontSize="small" color="action" sx={{ fontSize: 14 }} />
          <Typography variant="caption" color="text.secondary">
            Expires: {new Date(market.expiresAt).toLocaleDateString()}
          </Typography>
          <Typography variant="caption" color="text.secondary">•</Typography>
          <Typography variant="caption" color="text.secondary">
            Pool: {market.totalPool} {market.tokenSymbol}
          </Typography>
        </Stack>
      </Box>

      <CardContent sx={{ p: 2 }}>
        <Stack spacing={1.5}>
          {market.options.map((option) => {
            const percentage = Math.round((option.poolAmount / totalPool) * 100) || 0;
            const isWinner = market.status === 'resolved' && market.resolvedOptionId === option.id;
            
            return (
              <Box 
                key={option.id}
                onClick={() => handleOptionClick(option.id)}
                sx={{ 
                  position: 'relative',
                  p: 1.5,
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                  cursor: market.status === 'active' ? 'pointer' : 'default',
                  overflow: 'hidden',
                  '&:hover': {
                    bgcolor: market.status === 'active' ? alpha(theme.palette.action.hover, 0.1) : 'transparent',
                    borderColor: market.status === 'active' ? 'secondary.main' : 'divider'
                  },
                  bgcolor: isWinner ? alpha(theme.palette.success.main, 0.1) : 'transparent',
                  borderColor: isWinner ? 'success.main' : undefined
                }}
              >
                {/* Progress Bar Background */}
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    left: 0, 
                    top: 0, 
                    bottom: 0, 
                    width: `${percentage}%`, 
                    bgcolor: alpha(theme.palette.secondary.main, 0.08),
                    zIndex: 0
                  }} 
                />
                
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {isWinner && <CheckCircle fontSize="small" color="success" />}
                    <Typography variant="body2" fontWeight={600}>
                      {option.text}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" fontWeight={700} color="secondary.main">
                    {percentage}%
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ position: 'relative', zIndex: 1 }}>
                  {option.poolAmount} {market.tokenSymbol}
                </Typography>
              </Box>
            );
          })}
        </Stack>
      </CardContent>

      {/* Bet Dialog */}
      <Dialog open={betDialogOpen} onClose={() => setBetDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Place Bet</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            How much do you want to bet on &ldquo;{market.options.find(o => o.id === selectedOption)?.text}&rdquo;?
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Amount"
            type="number"
            fullWidth
            variant="outlined"
            value={betAmount}
            onChange={(e) => setBetAmount(e.target.value)}
            InputProps={{
              endAdornment: <InputAdornment position="end">{market.tokenSymbol}</InputAdornment>,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBetDialogOpen(false)}>Cancel</Button>
          <Button onClick={handlePlaceBet} variant="contained" color="secondary">
            Place Bet
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
