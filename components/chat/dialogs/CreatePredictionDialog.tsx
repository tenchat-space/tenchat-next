import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  IconButton,
  Typography,
  Box,
  InputAdornment,
  MenuItem
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { PredictionMarket } from '@/types/prediction';

interface CreatePredictionDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (marketData: Partial<PredictionMarket>) => void;
}

export function CreatePredictionDialog({ open, onClose, onCreate }: CreatePredictionDialogProps) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['Yes', 'No']);
  const [duration, setDuration] = useState(24); // Hours
  const [tokenSymbol, setTokenSymbol] = useState('TCH');

  const handleAddOption = () => {
    if (options.length < 4) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = [...options];
      newOptions.splice(index, 1);
      setOptions(newOptions);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCreate = () => {
    if (!question || options.some(o => !o)) return;

    const marketData: Partial<PredictionMarket> = {
      question,
      options: options.map((text, index) => ({
        id: `opt-${index}`,
        text,
        votes: 0,
        poolAmount: 0
      })),
      expiresAt: new Date(Date.now() + duration * 60 * 60 * 1000).toISOString(),
      tokenSymbol,
      status: 'active',
      totalPool: 0
    };

    onCreate(marketData);
    onClose();
    // Reset form
    setQuestion('');
    setOptions(['Yes', 'No']);
    setDuration(24);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create Prediction Market</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            label="Question"
            placeholder="e.g. Will BTC hit $100k by Friday?"
            fullWidth
            multiline
            rows={2}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />

          <Box>
            <Typography variant="subtitle2" gutterBottom>Options</Typography>
            <Stack spacing={2}>
              {options.map((option, index) => (
                <Stack key={index} direction="row" spacing={1}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                  />
                  {options.length > 2 && (
                    <IconButton onClick={() => handleRemoveOption(index)} color="error" size="small">
                      <Delete />
                    </IconButton>
                  )}
                </Stack>
              ))}
              {options.length < 4 && (
                <Button startIcon={<Add />} onClick={handleAddOption} size="small" sx={{ alignSelf: 'flex-start' }}>
                  Add Option
                </Button>
              )}
            </Stack>
          </Box>

          <Stack direction="row" spacing={2}>
            <TextField
              label="Duration"
              type="number"
              fullWidth
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              InputProps={{
                endAdornment: <InputAdornment position="end">Hours</InputAdornment>,
              }}
            />
            <TextField
              select
              label="Currency"
              fullWidth
              value={tokenSymbol}
              onChange={(e) => setTokenSymbol(e.target.value)}
            >
              <MenuItem value="TCH">Tenchat Token (TCH)</MenuItem>
              <MenuItem value="ETH">Ethereum (ETH)</MenuItem>
              <MenuItem value="USDC">USDC</MenuItem>
            </TextField>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          variant="contained" 
          color="secondary" 
          onClick={handleCreate}
          disabled={!question || options.some(o => !o)}
        >
          Create Market
        </Button>
      </DialogActions>
    </Dialog>
  );
}
