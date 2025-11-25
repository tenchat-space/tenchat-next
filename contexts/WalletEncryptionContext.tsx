'use client';

/**
 * Wallet Encryption Context
 * 
 * Manages the connection between wallet authentication and E2EE.
 * Uses the same wallet pattern as auth IDMS - wallet is stored in account.prefs.walletEth
 * 
 * Flow:
 * 1. Check if user has wallet connected (account.prefs.walletEth)
 * 2. If connected, prompt to sign encryption key derivation message
 * 3. Derive AES key from signature, cache in IndexedDB
 * 4. If no wallet, prompt user to connect wallet first (via auth app or inline)
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { securityService, type WalletSigner } from '@/lib/security';
import { account, functions } from '@/lib/appwrite/config/client';
import type { Hex } from 'viem';

// Extend window type for ethereum provider
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on?: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener?: (event: string, callback: (...args: unknown[]) => void) => void;
    };
  }
}

interface WalletEncryptionContextType {
  /** Whether encryption is initialized and ready */
  isEncryptionReady: boolean;
  /** Whether we're currently initializing encryption */
  isInitializing: boolean;
  /** Whether a wallet is connected to the Appwrite account */
  hasWalletConnected: boolean;
  /** The wallet address connected to Appwrite account (from prefs) */
  connectedWalletAddress: string | null;
  /** The wallet address used for encryption (should match connected) */
  encryptionWalletAddress: string | null;
  /** Error message if initialization failed */
  error: string | null;
  /** Connect wallet to Appwrite account (like auth IDMS) */
  connectWallet: () => Promise<void>;
  /** Disconnect wallet from Appwrite account */
  disconnectWallet: () => Promise<void>;
  /** Initialize encryption by prompting wallet signature */
  initializeEncryption: () => Promise<void>;
  /** Clear encryption (but keep wallet connected) */
  clearEncryption: () => Promise<void>;
  /** Check if the connected wallet matches the encryption wallet */
  walletMatches: (address: string) => boolean;
  /** The signing message that will be shown to users */
  signingMessage: string;
  /** Refresh wallet status from Appwrite */
  refreshWalletStatus: () => Promise<void>;
  /** Whether wallet connection is loading */
  isConnectingWallet: boolean;
}

const WalletEncryptionContext = createContext<WalletEncryptionContextType | null>(null);

interface WalletEncryptionProviderProps {
  children: ReactNode;
}

export function WalletEncryptionProvider({ children }: WalletEncryptionProviderProps) {
  const [isEncryptionReady, setIsEncryptionReady] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [connectedWalletAddress, setConnectedWalletAddress] = useState<string | null>(null);
  const [encryptionWalletAddress, setEncryptionWalletAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hasWalletConnected = connectedWalletAddress !== null;

  /**
   * Load wallet status from Appwrite account prefs
   */
  const refreshWalletStatus = useCallback(async () => {
    try {
      const user = await account.get();
      const walletEth = user.prefs?.walletEth || null;
      setConnectedWalletAddress(walletEth);
    } catch {
      // User not logged in or error
      setConnectedWalletAddress(null);
    }
  }, []);

  // Load wallet status and encryption from storage on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        // Check Appwrite for connected wallet
        await refreshWalletStatus();
        
        // Try to load encryption from storage
        const loaded = await securityService.loadFromStorage();
        if (loaded) {
          const state = securityService.getState();
          setIsEncryptionReady(state.isReady);
          setEncryptionWalletAddress(state.walletAddress);
        }
      } catch (e) {
        console.error('Failed to initialize wallet encryption:', e);
      }
    };

    initialize();
  }, [refreshWalletStatus]);

  /**
   * Connect wallet to Appwrite account (using auth IDMS pattern)
   * This uses window.ethereum and verifies via Appwrite Functions
   */
  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      setError('MetaMask not installed. Please install MetaMask browser extension.');
      return;
    }

    setIsConnectingWallet(true);
    setError(null);

    try {
      // 1. Request wallet connection
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      }) as string[];

      if (!accounts || accounts.length === 0) {
        throw new Error('No wallet account selected');
      }

      const walletAddress = accounts[0];

      // 2. Get current user
      const user = await account.get();

      // 3. Create message for user to sign (same pattern as auth IDMS)
      const timestamp = Date.now();
      const baseMessage = `auth-${timestamp}`;
      const fullMessage = `Sign this message to authenticate: ${baseMessage}`;

      // 4. User signs the message in their wallet
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [fullMessage, walletAddress],
      }) as string;

      // 5. Call connect-wallet endpoint for server verification
      const functionId = process.env.NEXT_PUBLIC_APPWRITE_FUNCTION_ID;
      if (functionId) {
        const execution = await functions.createExecution(
          functionId,
          JSON.stringify({
            userId: user.$id,
            address: walletAddress,
            signature,
            message: baseMessage,
          }),
          false,
          '/connect-wallet'
        );

        const response = JSON.parse(execution.responseBody);

        if (execution.responseStatusCode !== 200) {
          throw new Error(response.error || 'Failed to connect wallet');
        }
      } else {
        // Fallback: directly update prefs if no function configured
        // This is less secure but works for development
        const currentPrefs = user.prefs || {};
        await account.updatePrefs({
          ...currentPrefs,
          walletEth: walletAddress,
        });
      }

      setConnectedWalletAddress(walletAddress);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to connect wallet';
      setError(errorMessage);
      console.error('Wallet connection failed:', e);
      throw e;
    } finally {
      setIsConnectingWallet(false);
    }
  }, []);

  /**
   * Disconnect wallet from Appwrite account
   */
  const disconnectWallet = useCallback(async () => {
    setIsConnectingWallet(true);
    setError(null);

    try {
      // Get current user and ALL prefs
      const user = await account.get();
      const currentPrefs = user.prefs || {};

      // Remove only the wallet pref, preserve all others
      const updatedPrefs = { ...currentPrefs };
      delete updatedPrefs.walletEth;

      await account.updatePrefs(updatedPrefs);

      setConnectedWalletAddress(null);
      
      // Also clear encryption since wallet is disconnected
      await securityService.clearStorage();
      setIsEncryptionReady(false);
      setEncryptionWalletAddress(null);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to disconnect wallet';
      setError(errorMessage);
      throw e;
    } finally {
      setIsConnectingWallet(false);
    }
  }, []);

  /**
   * Initialize encryption by prompting user to sign with their connected wallet
   */
  const initializeEncryption = useCallback(async () => {
    if (!connectedWalletAddress) {
      setError('No wallet connected. Please connect a wallet first.');
      return;
    }

    if (!window.ethereum) {
      setError('MetaMask not installed. Please install MetaMask browser extension.');
      return;
    }

    setIsInitializing(true);
    setError(null);

    try {
      // Request accounts to ensure wallet is connected
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      }) as string[];

      if (!accounts || accounts.length === 0) {
        throw new Error('No wallet account available');
      }

      const walletAddress = accounts[0];

      // Verify the connected wallet matches the Appwrite-connected wallet
      if (walletAddress.toLowerCase() !== connectedWalletAddress.toLowerCase()) {
        throw new Error(
          `Please switch to the wallet connected to your account: ${connectedWalletAddress.substring(0, 6)}...${connectedWalletAddress.substring(38)}`
        );
      }

      // Create a signer adapter for the security service
      const signer: WalletSigner = {
        address: walletAddress,
        signMessage: async (message: string): Promise<Hex> => {
          const signature = await window.ethereum!.request({
            method: 'personal_sign',
            params: [message, walletAddress],
          }) as Hex;
          return signature;
        },
      };

      // Initialize encryption with the wallet signature
      await securityService.initializeFromWallet(signer);

      setIsEncryptionReady(true);
      setEncryptionWalletAddress(walletAddress);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to initialize encryption';
      setError(errorMessage);
      console.error('Encryption initialization failed:', e);
      throw e;
    } finally {
      setIsInitializing(false);
    }
  }, [connectedWalletAddress]);

  /**
   * Clear encryption (but keep wallet connected to Appwrite)
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
    hasWalletConnected,
    connectedWalletAddress,
    encryptionWalletAddress,
    error,
    connectWallet,
    disconnectWallet,
    initializeEncryption,
    clearEncryption,
    walletMatches,
    signingMessage: securityService.getSigningMessage(),
    refreshWalletStatus,
    isConnectingWallet,
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
