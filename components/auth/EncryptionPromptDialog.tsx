'use client';

/**
 * Encryption Prompt Dialog
 * 
 * Shows when user needs to enable wallet-based encryption to use chat features.
 * Explains what they're signing and guides them through the process.
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  alpha,
} from '@mui/material';
import {
  Lock,
  AccountBalanceWallet,
  Security,
  Check,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { useWalletEncryption } from '@/contexts/WalletEncryptionContext';

interface EncryptionPromptDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EncryptionPromptDialog({ open, onClose, onSuccess }: EncryptionPromptDialogProps) {
  const theme = useTheme();
  const { initializeEncryption, isInitializing, error, signingMessage } = useWalletEncryption();
  const [activeStep, setActiveStep] = useState(0);
  const [localError, setLocalError] = useState<string | null>(null);

  const steps = ['Connect Wallet', 'Sign Message', 'Encryption Active'];

  const handleInitialize = async () => {
    setLocalError(null);
    setActiveStep(1);
    
    try {
      await initializeEncryption();
      setActiveStep(2);
      // Wait a moment to show success before closing
      setTimeout(() => {
        onSuccess?.();
        onClose();
        setActiveStep(0);
      }, 1500);
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : 'Failed to enable encryption');
      setActiveStep(0);
    }
  };

  const handleClose = () => {
    if (!isInitializing) {
      setActiveStep(0);
      setLocalError(null);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: alpha(theme.palette.background.paper, 0.95),
          backdropFilter: 'blur(20px)',
        },
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Lock sx={{ fontSize: 48, color: 'secondary.main' }} />
          </motion.div>
        </Box>
        <Typography variant="h5" fontWeight={700}>
          Enable End-to-End Encryption
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <AnimatePresence mode="wait">
          {activeStep === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
                To use encrypted messaging, you need to sign a message with your wallet.
                This creates your personal encryption key.
              </Typography>

              {/* Benefits */}
              <Box sx={{ display: 'grid', gap: 2, mb: 3 }}>
                {[
                  { icon: <Security />, title: 'End-to-End Encrypted', desc: 'Only you can read your messages' },
                  { icon: <AccountBalanceWallet />, title: 'Wallet-Bound', desc: 'Your key is tied to your wallet' },
                  { icon: <Check />, title: 'No Passwords', desc: 'No recovery phrases to remember' },
                ].map((item, i) => (
                  <Paper
                    key={i}
                    elevation={0}
                    sx={{
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      border: '1px solid',
                      borderColor: alpha(theme.palette.primary.main, 0.1),
                      borderRadius: 2,
                    }}
                  >
                    <Box sx={{ color: 'secondary.main' }}>{item.icon}</Box>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600}>{item.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{item.desc}</Typography>
                    </Box>
                  </Paper>
                ))}
              </Box>

              {/* What you're signing */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: alpha(theme.palette.warning.main, 0.05),
                  border: '1px solid',
                  borderColor: alpha(theme.palette.warning.main, 0.2),
                  borderRadius: 2,
                  mb: 2,
                }}
              >
                <Typography variant="subtitle2" color="warning.main" fontWeight={600} gutterBottom>
                  What you'll sign:
                </Typography>
                <Typography
                  variant="caption"
                  component="pre"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'monospace',
                    fontSize: '0.7rem',
                    color: 'text.secondary',
                    maxHeight: 120,
                    overflow: 'auto',
                  }}
                >
                  {signingMessage}
                </Typography>
              </Paper>
            </motion.div>
          )}

          {activeStep === 1 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress color="secondary" size={48} sx={{ mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Waiting for wallet...
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Please sign the message in your wallet to enable encryption.
                </Typography>
              </Box>
            </motion.div>
          )}

          {activeStep === 2 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  <Check sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                </motion.div>
                <Typography variant="h6" color="success.main" gutterBottom>
                  Encryption Enabled!
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Your messages are now end-to-end encrypted.
                </Typography>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>

        {(error || localError) && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error || localError}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        {activeStep === 0 && (
          <>
            <Button onClick={handleClose} color="inherit">
              Cancel
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleInitialize}
              disabled={isInitializing}
              startIcon={<AccountBalanceWallet />}
            >
              Connect & Sign
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
