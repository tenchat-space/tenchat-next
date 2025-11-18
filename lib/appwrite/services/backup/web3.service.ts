/**
 * Web3 Service
 * Handles wallets, NFTs, and crypto transactions
 */

import { ID, Query } from 'appwrite';
import { tablesDB } from '../config/client';
import { DATABASE_IDS, WEB3_COLLECTIONS } from '../config/constants';
import type { Wallets, Nfts, CryptoTransactions, TokenGifts, TokenHoldings } from '@/types/appwrite.d';

export class Web3Service {
  private readonly databaseId = DATABASE_IDS.WEB3;

  async connectWallet(userId: string, address: string, chain: string, walletType: string): Promise<Wallets> {
    return await tablesDB.createRow({
      databaseId: this.databaseId,
      tableId: WEB3_COLLECTIONS.WALLETS,
      rowId: ID.unique(),
      data: {
        userId,
        address,
        chain,
        walletType,
        isPrimary: false,
        isVerified: false,
        nftsCount: 0,
        addedAt: new Date().toISOString(),
      }
    }) as Wallets;
  }

  async getUserWallets(userId: string): Promise<Wallets[]> {
    try {
      const response = await tablesDB.listRows({
        databaseId: this.databaseId,
        tableId: WEB3_COLLECTIONS.WALLETS,
        queries: [Query.equal('userId', userId)]
      });
      return response.rows as Wallets[];
    } catch (error) {
      console.error('Error getting user wallets:', error);
      return [];
    }
  }

  async setPrimaryWallet(walletId: string, userId: string): Promise<void> {
    const wallets = await this.getUserWallets(userId);
    for (const wallet of wallets) {
      if (wallet.isPrimary) {
        await tablesDB.updateRow({
          databaseId: this.databaseId,
          tableId: WEB3_COLLECTIONS.WALLETS,
          rowId: wallet.$id,
          data: { isPrimary: false }
        });
      }
    }

    await tablesDB.updateRow({
      databaseId: this.databaseId,
      tableId: WEB3_COLLECTIONS.WALLETS,
      rowId: walletId,
      data: { isPrimary: true }
    });
  }

  async addNFT(userId: string, nftData: Partial<Nfts>): Promise<Nfts> {
    return await tablesDB.createRow({
      databaseId: this.databaseId,
      tableId: WEB3_COLLECTIONS.NFTS,
      rowId: ID.unique(),
      data: {
        userId,
        ...nftData,
        isHidden: false,
        isProfilePicture: false,
        acquiredAt: new Date().toISOString(),
        lastSynced: new Date().toISOString(),
      }
    }) as Nfts;
  }

  async getUserNFTs(userId: string, limit = 50): Promise<Nfts[]> {
    try {
      const response = await tablesDB.listRows({
        databaseId: this.databaseId,
        tableId: WEB3_COLLECTIONS.NFTS,
        queries: [
          Query.equal('userId', userId),
          Query.equal('isHidden', false),
          Query.limit(limit),
        ]
      });
      return response.rows as Nfts[];
    } catch (error) {
      console.error('Error getting user NFTs:', error);
      return [];
    }
  }

  async setNFTAsProfilePicture(nftId: string, userId: string): Promise<void> {
    const nfts = await this.getUserNFTs(userId);
    for (const nft of nfts) {
      if (nft.isProfilePicture) {
        await tablesDB.updateRow({
          databaseId: this.databaseId,
          tableId: WEB3_COLLECTIONS.NFTS,
          rowId: nft.$id,
          data: { isProfilePicture: false }
        });
      }
    }

    await tablesDB.updateRow({
      databaseId: this.databaseId,
      tableId: WEB3_COLLECTIONS.NFTS,
      rowId: nftId,
      data: { isProfilePicture: true }
    });
  }

  async recordTransaction(txData: Partial<CryptoTransactions>): Promise<CryptoTransactions> {
    return await tablesDB.createRow({
      databaseId: this.databaseId,
      tableId: WEB3_COLLECTIONS.CRYPTO_TRANSACTIONS,
      rowId: ID.unique(),
      data: {
        ...txData,
        status: 'pending',
        createdAt: new Date().toISOString(),
      }
    }) as CryptoTransactions;
  }

  async updateTransactionStatus(txId: string, status: string, blockNumber?: number): Promise<void> {
    await tablesDB.updateRow({
      databaseId: this.databaseId,
      tableId: WEB3_COLLECTIONS.CRYPTO_TRANSACTIONS,
      rowId: txId,
      data: {
        status,
        blockNumber: blockNumber || null,
      }
    });
  }

  async getUserTransactions(userId: string, limit = 50): Promise<CryptoTransactions[]> {
    try {
      const response = await tablesDB.listRows({
        databaseId: this.databaseId,
        tableId: WEB3_COLLECTIONS.CRYPTO_TRANSACTIONS,
        queries: [
          Query.equal('userId', userId),
          Query.orderDesc('timestamp'),
          Query.limit(limit),
        ]
      });
      return response.rows as CryptoTransactions[];
    } catch (error) {
      console.error('Error getting transactions:', error);
      return [];
    }
  }

  async createGift(giftData: Partial<TokenGifts>): Promise<TokenGifts> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    return await tablesDB.createRow({
      databaseId: this.databaseId,
      tableId: WEB3_COLLECTIONS.TOKEN_GIFTS,
      rowId: ID.unique(),
      data: {
        ...giftData,
        status: 'pending',
        expiresAt: expiresAt.toISOString(),
        createdAt: new Date().toISOString(),
      }
    }) as TokenGifts;
  }

  async claimGift(giftId: string, claimTxHash: string): Promise<void> {
    await tablesDB.updateRow({
      databaseId: this.databaseId,
      tableId: WEB3_COLLECTIONS.TOKEN_GIFTS,
      rowId: giftId,
      data: {
        status: 'claimed',
        claimTxHash,
        claimedAt: new Date().toISOString(),
      }
    });
  }

  async getPendingGifts(userId: string): Promise<TokenGifts[]> {
    try {
      const response = await tablesDB.listRows({
        databaseId: this.databaseId,
        tableId: WEB3_COLLECTIONS.TOKEN_GIFTS,
        queries: [
          Query.equal('recipientId', userId),
          Query.equal('status', 'pending'),
        ]
      });
      return response.rows as TokenGifts[];
    } catch (error) {
      console.error('Error getting pending gifts:', error);
      return [];
    }
  }

  async updateHoldings(userId: string, holdingsData: Partial<TokenHoldings>): Promise<TokenHoldings> {
    const existing = await tablesDB.listRows({
      databaseId: this.databaseId,
      tableId: WEB3_COLLECTIONS.TOKEN_HOLDINGS,
      queries: [
        Query.equal('userId', userId),
        Query.equal('chain', holdingsData.chain!),
        Query.equal('tokenAddress', holdingsData.tokenAddress!),
        Query.limit(1),
      ]
    });

    if (existing.rows.length > 0) {
      return await tablesDB.updateRow({
        databaseId: this.databaseId,
        tableId: WEB3_COLLECTIONS.TOKEN_HOLDINGS,
        rowId: existing.rows[0].$id,
        data: {
          ...holdingsData,
          lastSynced: new Date().toISOString(),
        }
      }) as TokenHoldings;
    }

    return await tablesDB.createRow({
      databaseId: this.databaseId,
      tableId: WEB3_COLLECTIONS.TOKEN_HOLDINGS,
      rowId: ID.unique(),
      data: {
        userId,
        ...holdingsData,
        decimals: holdingsData.decimals || 18,
        lastSynced: new Date().toISOString(),
      }
    }) as TokenHoldings;
  }

  async getUserHoldings(userId: string, chain?: string): Promise<TokenHoldings[]> {
    try {
      const queries = [Query.equal('userId', userId)];
      if (chain) queries.push(Query.equal('chain', chain));

      const response = await tablesDB.listRows({
        databaseId: this.databaseId,
        tableId: WEB3_COLLECTIONS.TOKEN_HOLDINGS,
        queries
      });
      return response.rows as TokenHoldings[];
    } catch (error) {
      console.error('Error getting holdings:', error);
      return [];
    }
  }
}

export const web3Service = new Web3Service();
