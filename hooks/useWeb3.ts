/**
 * Web3 Hooks
 * React hooks for Web3 functionality (wallets, NFTs, crypto)
 */

import { useState, useEffect, useCallback } from 'react';
import { web3Service } from '@/lib/appwrite';

interface Wallet {
  id: string;
  isPrimary?: boolean;
  [key: string]: any;
}

interface NFT {
  id: string;
  isProfilePicture?: boolean;
  [key: string]: any;
}

type CryptoTransaction = Record<string, any>;
type TokenGift = Record<string, any>;
type TokenHolding = Record<string, any>;

export function useWallets(userId: string) {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadWallets = useCallback(async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      const userWallets = await web3Service.getUserWallets(userId);
      setWallets(userWallets);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to load wallets:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadWallets();
  }, [loadWallets]);

  const connectWallet = useCallback(async (
    address: string,
    chain: string,
    walletType: string
  ) => {
    try {
      const newWallet = await web3Service.connectWallet(userId, address, chain, walletType);
      setWallets(prev => [...prev, newWallet]);
      return newWallet;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [userId]);

  const setPrimary = useCallback(async (walletId: string) => {
    try {
      await web3Service.setPrimaryWallet(walletId, userId);
      await loadWallets();
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [userId, loadWallets]);

  const primaryWallet = wallets.find(w => w.isPrimary);

  return {
    wallets,
    primaryWallet,
    isLoading,
    error,
    loadWallets,
    connectWallet,
    setPrimary,
  };
}

export function useNFTs(userId: string) {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadNFTs = useCallback(async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      const userNfts = await web3Service.getUserNFTs(userId);
      setNfts(userNfts);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to load NFTs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadNFTs();
  }, [loadNFTs]);

  const addNFT = useCallback(async (nftData: Partial<NFT>) => {
    try {
      const newNft = await web3Service.addNFT(userId, nftData);
      setNfts(prev => [...prev, newNft]);
      return newNft;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [userId]);

  const setAsProfilePicture = useCallback(async (nftId: string) => {
    try {
      await web3Service.setNFTAsProfilePicture(nftId, userId);
      await loadNFTs();
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [userId, loadNFTs]);

  const profileNFT = nfts.find(n => n.isProfilePicture);

  return {
    nfts,
    profileNFT,
    isLoading,
    error,
    loadNFTs,
    addNFT,
    setAsProfilePicture,
  };
}

export function useTransactions(userId: string) {
  const [transactions, setTransactions] = useState<CryptoTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadTransactions = useCallback(async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      const txs = await web3Service.getUserTransactions(userId);
      setTransactions(txs);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to load transactions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const recordTransaction = useCallback(async (txData: Partial<CryptoTransaction>) => {
    try {
      const newTx = await web3Service.recordTransaction({
        ...txData,
        userId,
      });
      setTransactions(prev => [newTx, ...prev]);
      return newTx;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [userId]);

  const updateStatus = useCallback(async (txId: string, status: string, blockNumber?: number) => {
    try {
      await web3Service.updateTransactionStatus(txId, status, blockNumber);
      await loadTransactions();
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [loadTransactions]);

  return {
    transactions,
    isLoading,
    error,
    loadTransactions,
    recordTransaction,
    updateStatus,
  };
}

export function useTokenGifts(userId: string) {
  const [pendingGifts, setPendingGifts] = useState<TokenGift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadPendingGifts = useCallback(async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      const gifts = await web3Service.getPendingGifts(userId);
      setPendingGifts(gifts);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to load pending gifts:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadPendingGifts();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(loadPendingGifts, 30000);
    return () => clearInterval(interval);
  }, [loadPendingGifts]);

  const createGift = useCallback(async (giftData: Partial<TokenGift>) => {
    try {
      const newGift = await web3Service.createGift({
        ...giftData,
        senderId: userId,
      });
      return newGift;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [userId]);

  const claimGift = useCallback(async (giftId: string, claimTxHash: string) => {
    try {
      await web3Service.claimGift(giftId, claimTxHash);
      await loadPendingGifts();
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [loadPendingGifts]);

  return {
    pendingGifts,
    isLoading,
    error,
    loadPendingGifts,
    createGift,
    claimGift,
    hasPendingGifts: pendingGifts.length > 0,
  };
}

export function useTokenHoldings(userId: string, chain?: string) {
  const [holdings, setHoldings] = useState<TokenHolding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadHoldings = useCallback(async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      const userHoldings = await web3Service.getUserHoldings(userId, chain);
      setHoldings(userHoldings);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to load holdings:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, chain]);

  useEffect(() => {
    loadHoldings();
  }, [loadHoldings]);

  const updateHolding = useCallback(async (holdingData: Partial<TokenHolding>) => {
    try {
      await web3Service.updateHoldings(userId, holdingData);
      await loadHoldings();
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [userId, loadHoldings]);

  const totalValue = holdings.reduce((sum, h) => {
    const balance = parseFloat(h.balance || '0');
    const price = h.usdPrice || 0;
    return sum + (balance * price);
  }, 0);

  return {
    holdings,
    totalValue,
    isLoading,
    error,
    loadHoldings,
    updateHolding,
  };
}
