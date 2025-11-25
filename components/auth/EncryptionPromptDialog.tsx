'use client';

/**
 * Encryption Prompt Dialog
 * 
 * Shows when user needs to enable wallet-based encryption to use chat features.
 * Two-step flow:
 * 1. If no wallet connected to Appwrite account, prompt to connect
 * 2. If wallet connected, prompt to sign for encryption key derivation
 */

import React, { useState, useEffect } from 'react';
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
  Link as LinkIcon,
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
  const { 
    hasWalletConnected,
    connectedWalletAddress,
    initializeEncryption, 
    connectWallet,
    isInitializing, 
    isConnectingWallet,
    error, 
    signingMessage 
  } = useWalletEncryption();
  
  // Calculate initial step based on wallet connection and dialog open state
  const initialStep = hasWalletConnected ? 1 : 0;
  const [activeStep, setActiveStep] = useState(initialStep);
  const [localError, setLocalError] = useState<string | null>(null);

  // Reset step when dialog opens
  const prevOpenRef = React.useRef(open);
  if (open && !prevOpenRef.current) {
    // Dialog just opened, reset to initial step
    if (activeStep !== initialStep) {
      setActiveStep(initialStep);
    }
  }
  prevOpenRef.current = open;

  const steps = hasWalletConnected 
    ? ['Sign Message', 'Encryption Active']
    : ['Connect Wallet', 'Sign Message', 'Encryption Active'];

  const handleConnectWallet = async () => {
    setLocalError(null);
    try {
      await connectWallet();
      setActiveStep(1); // Move to sign step
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : 'Failed to connect wallet');
    }
  };

  const handleSignForEncryption = async () => {
    setLocalError(null);
    const signStepIndex = hasWalletConnected ? 0 : 1;
    setActiveStep(signStepIndex);
    
    try {
      await initializeEncryption();
      setActiveStep(signStepIndex + 1); // Move to success step
      // Wait a moment to show success before closing
      setTimeout(() => {
        onSuccess?.();
        onClose();
        setActiveStep(0);
      }, 1500);
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : 'Failed to enable encryption');
      setActiveStep(signStepIndex);
    }
  };

  const handleClose = () => {
    if (!isInitializing && !isConnectingWallet) {
      setActiveStep(0);
      setLocalError(null);
      onClose();
    }
  };

  const isLoading = isInitializing || isConnectingWallet;
  const currentError = error || localError;

  // Determine which step content to show
  const getStepContent = () => {
    const effectiveStep = hasWalletConnected ? activeStep + 1 : activeStep;
    
    // Step 0: Connect Wallet (only if not connected)
    if (effectiveStep === 0) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
            To use encrypted messaging, you need to connect a wallet to your account first.
          </Typography>

          <Paper
            elevation={0}
            sx={{
              p: 3,
              bgcolor: alpha(theme.palette.warning.main, 0.05),
              border: '1px solid',
              borderColor: alpha(theme.palette.warning.main, 0.2),
              borderRadius: 2,
              textAlign: 'center',
              mb: 3,
            }}
          >
            <AccountBalanceWallet sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Wallet Connected
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Connect your MetaMask or other Ethereum wallet to continue.
            </Typography>
          </Paper>

          <Button
            variant="contained"
            color="secondary"
            fullWidth
            onClick={handleConnectWallet}
            disabled={isLoading}
            startIcon={isConnectingWallet ? <CircularProgress size={20} color="inherit" /> : <LinkIcon />}
            sx={{ py: 1.5 }}
          >
            {isConnectingWallet ? 'Connecting...' : 'Connect Wallet'}
          </Button>
        </motion.div>
      );
    }

    // Step 1: Sign Message
    if (effectiveStep === 1) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          {connectedWalletAddress && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: alpha(theme.palette.success.main, 0.1),
                border: '1px solid',
                borderColor: alpha(theme.palette.success.main, 0.3),
                borderRadius: 2,
                mb: 3,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Connected Wallet
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'success.main' }}>
                {connectedWalletAddress}
              </Typography>
            </Paper>
          )}

          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
            Sign a message with your wallet to generate your encryption key.
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
              What you&apos;ll sign:
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

          <Button
            variant="contained"
            color="secondary"
            fullWidth
            onClick={handleSignForEncryption}
            disabled={isLoading}
            startIcon={isInitializing ? <CircularProgress size={20} color="inherit" /> : <Lock />}
            sx={{ py: 1.5 }}
          >
            {isInitializing ? 'Waiting for signature...' : 'Sign & Enable Encryption'}
          </Button>
        </motion.div>
      );
    }

    // Step 2: Success
    return (
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
    );
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
        <Stepper activeStep={hasWalletConnected ? activeStep : activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <AnimatePresence mode="wait">
          {getStepContent()}
        </AnimatePresence>

        {currentError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {currentError}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        {!isLoading && activeStep < steps.length - 1 && (
          <Button onClick={handleClose} color="inherit">
            Cancel
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
