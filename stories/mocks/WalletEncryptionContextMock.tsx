'use client';

/**
 * Mock Wallet Encryption Context for Storybook
 */

import React, { ReactNode } from 'react';
import { WalletEncryptionProvider } from '@/contexts/WalletEncryptionContext';

// Simple mock provider that wraps the real provider
// In Storybook, the wallet won't be available, so encryption will be "not ready"
export function MockWalletEncryptionProvider({ children }: { children: ReactNode }) {
  return <WalletEncryptionProvider>{children}</WalletEncryptionProvider>;
}

// Mock values for testing different states
export const mockEncryptionReady = {
  isEncryptionReady: true,
  isInitializing: false,
  encryptionWalletAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  error: null,
  initializeEncryption: async () => {},
  clearEncryption: async () => {},
  walletMatches: () => true,
  signingMessage: 'Mock signing message for Storybook',
};

export const mockEncryptionNotReady = {
  isEncryptionReady: false,
  isInitializing: false,
  encryptionWalletAddress: null,
  error: null,
  initializeEncryption: async () => {},
  clearEncryption: async () => {},
  walletMatches: () => false,
  signingMessage: 'Mock signing message for Storybook',
};
