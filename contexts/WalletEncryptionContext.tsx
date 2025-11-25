'use client';

/**
 * Wallet Encryption Context
 * 
 * Manages the connection between wallet authentication and E2EE.
 * Provides hooks for checking encryption readiness and prompting users to enable it.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { securityService, type WalletSigner, type EncryptionState } from '@/lib/security';
import { createWalletClient, custom, type WalletClient, type Hex } from 'viem';
import { mainnet } from 'viem/chains';

interface WalletEncryptionContextType {
  /** Whether encryption is initialized and ready */
  isEncryptionReady: boolean;
  /** Whether we're currently initializing encryption */
  isInitializing: boolean;
  /** The wallet address used for encryption */
  encryptionWalletAddress: string | null;
  /** Error message if initialization failed */
  error: string | null;
  /** Initialize encryption by prompting wallet signature */
  initializeEncryption: () => Promise<void>;
  /** Clear encryption (disconnect) */
  clearEncryption: () => Promise<void>;
  /** Check if the connected wallet matches the encryption wallet */
  walletMatches: (address: string) => boolean;
  /** The signing message that will be shown to users */
  signingMessage: string;
}

const WalletEncryptionContext = createContext<WalletEncryptionContextType | null>(null);

interface WalletEncryptionProviderProps {
  children: ReactNode;
}

export function WalletEncryptionProvider({ children }: WalletEncryptionProviderProps) {
  const [isEncryptionReady, setIsEncryptionReady] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [encryptionWalletAddress, setEncryptionWalletAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load encryption from storage on mount
  useEffect(() => {
    const loadEncryption = async () => {
      try {
        const loaded = await securityService.loadFromStorage();
        if (loaded) {
          const state = securityService.getState();
          setIsEncryptionReady(state.isReady);
          setEncryptionWalletAddress(state.walletAddress);
        }
      } catch (e) {
        console.error('Failed to load encryption from storage:', e);
      }
    };

    loadEncryption();
  }, []);

  /**
   * Get a wallet client from the browser's ethereum provider
   */
  const getWalletClient = useCallback(async (): Promise<WalletClient | null> => {
    if (typeof window === 'undefined') return null;
    
    const ethereum = (window as any).ethereum;
    if (!ethereum) {
      throw new Error('No Ethereum wallet detected. Please install MetaMask or another wallet.');
    }

    // Request account access
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts available. Please connect your wallet.');
    }

    const walletClient = createWalletClient({
      chain: mainnet, // Chain doesn't matter for signatures
      transport: custom(ethereum),
      account: accounts[0],
    });

    return walletClient;
  }, []);

  /**
   * Initialize encryption by prompting user to sign with their wallet
   */
  const initializeEncryption = useCallback(async () => {
    setIsInitializing(true);
    setError(null);

    try {
      const walletClient = await getWalletClient();
      if (!walletClient || !walletClient.account) {
        throw new Error('Could not get wallet client');
      }

      const address = walletClient.account.address;
      
      // Create a signer adapter for the security service
      const signer: WalletSigner = {
        address,
        signMessage: async (message: string): Promise<Hex> => {
          const signature = await walletClient.signMessage({
            account: walletClient.account!,
            message,
          });
          return signature;
        },
      };

      // Initialize encryption with the wallet signature
      await securityService.initializeFromWallet(signer);

      setIsEncryptionReady(true);
      setEncryptionWalletAddress(address);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to initialize encryption';
      setError(errorMessage);
      console.error('Encryption initialization failed:', e);
      throw e;
    } finally {
      setIsInitializing(false);
    }
  }, [getWalletClient]);

  /**
   * Clear encryption and disconnect
   */
  const clearEncryption = useCallback(async () => {
    await securityService.clearStorage();
    setIsEncryptionReady(false);
    setEncryptionWalletAddress(null);
    setError(null);
  }, []);

  /**
   * Check if a given wallet address matches the encryption wallet
   */
  const walletMatches = useCallback((address: string): boolean => {
    if (!encryptionWalletAddress) return false;
    return address.toLowerCase() === encryptionWalletAddress.toLowerCase();
  }, [encryptionWalletAddress]);

  const value: WalletEncryptionContextType = {
    isEncryptionReady,
    isInitializing,
    encryptionWalletAddress,
    error,
    initializeEncryption,
    clearEncryption,
    walletMatches,
    signingMessage: securityService.getSigningMessage(),
  };

  return (
    <WalletEncryptionContext.Provider value={value}>
      {children}
    </WalletEncryptionContext.Provider>
  );
}

/**
 * Hook to access wallet encryption state and methods
 */
export function useWalletEncryption(): WalletEncryptionContextType {
  const context = useContext(WalletEncryptionContext);
  if (!context) {
    throw new Error('useWalletEncryption must be used within a WalletEncryptionProvider');
  }
  return context;
}

/**
 * Hook that throws if encryption is not ready
 * Useful for components that require encryption to function
 */
export function useRequireEncryption(): WalletEncryptionContextType {
  const context = useWalletEncryption();
  
  useEffect(() => {
    if (!context.isEncryptionReady && !context.isInitializing) {
      console.warn('Encryption is not enabled. Some features may not work.');
    }
  }, [context.isEncryptionReady, context.isInitializing]);

  return context;
}
