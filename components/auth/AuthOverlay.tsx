"use client";

import { useState } from 'react';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import { useAppwrite } from '@/contexts/AppwriteContext';

export function AuthOverlay() {
  const { isAuthenticated, isLoading, forceRefreshAuth } = useAppwrite();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // If loading or already authenticated, don't show overlay
  if (isLoading || isAuthenticated) return null;

  const handleLogin = () => {
    const authSubdomain = process.env.NEXT_PUBLIC_AUTH_SUBDOMAIN || 'auth';
    const domain = process.env.NEXT_PUBLIC_DOMAIN || 'tenchat.space';
    const authUrl = `https://${authSubdomain}.${domain}/login`;
    
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      authUrl,
      'TenChatAuth',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    if (popup) {
      setIsAuthenticating(true);
      const timer = setInterval(() => {
        if (popup.closed) {
          clearInterval(timer);
          setIsAuthenticating(false);
          forceRefreshAuth();
        }
      }, 500);
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <Typography variant="h4" sx={{ mb: 2, color: 'white', fontWeight: 'bold' }}>
        Welcome to TenChat
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, color: 'rgba(255,255,255,0.8)' }}>
        Please sign in to continue
      </Typography>
      
      <Button
        variant="contained"
        size="large"
        onClick={handleLogin}
        disabled={isAuthenticating}
        sx={{
          px: 4,
          py: 1.5,
          borderRadius: 4,
          bgcolor: 'primary.main',
          '&:hover': { bgcolor: 'primary.dark' }
        }}
      >
        {isAuthenticating ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
      </Button>
    </Box>
  );
}
