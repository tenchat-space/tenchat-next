/**
 * Web3 Service
 * Handles wallets and token holdings
 */

import { ID, Query } from 'appwrite';
import { tablesDB } from '../config/client';
import { DATABASE_IDS, WEB3_COLLECTIONS } from '../config/constants';

type Web3Row = Record<string, any>;

export class Web3Service {
  private readonly databaseId = DATABASE_IDS.CHAT;

  /**
   * Get user wallets
   */
  async getUserWallets(userId: string): Promise<Web3Row[]> {
    try {
      const response = await tablesDB.listRows({
        databaseId: this.databaseId,
        tableId: WEB3_COLLECTIONS.WALLETS,
        queries: [
          Query.equal('userId', userId),
          Query.orderDesc('lastActive')
        ]
      });
      return response.rows as Web3Row[];
    } catch (error) {
      console.error('Error getting user wallets:', error);
      return [];
    }
  }

  /**
   * Connect wallet (Create/Update)
   */
  async connectWallet(
    userId: string,
    address: string,
    chain: string,
    walletType: string
  ): Promise<Web3Row> {
    try {
      // Check if wallet exists
      const existing = await tablesDB.listRows({
        databaseId: this.databaseId,
        tableId: WEB3_COLLECTIONS.WALLETS,
        queries: [
          Query.equal('userId', userId),
          Query.equal('address', address),
          Query.limit(1)
        ]
      });

      if (existing.rows.length > 0) {
        // Update last active
        const wallet = existing.rows[0];
        const updated = await tablesDB.updateRow({
            databaseId: this.databaseId,
            tableId: WEB3_COLLECTIONS.WALLETS,
            rowId: wallet.$id,
            data: {
                lastActive: new Date().toISOString()
            }
        });
        return updated as unknown as Web3Row;
      }

      // Create new wallet
      const newWallet = await tablesDB.createRow({
        databaseId: this.databaseId,
        tableId: WEB3_COLLECTIONS.WALLETS,
        rowId: ID.unique(),
        data: {
          userId,
          address,
          chain,
          walletType,
          isPrimary: false, // Default false, unless first wallet?
          lastActive: new Date().toISOString(),
          connectedAt: new Date().toISOString()
        }
      });
      return newWallet as unknown as Web3Row;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  }

  /**
   * Set primary wallet
   */
  async setPrimaryWallet(walletId: string, userId: string): Promise<void> {
    try {
      // 1. Unset current primary
      const currentPrimary = await tablesDB.listRows({
        databaseId: this.databaseId,
        tableId: WEB3_COLLECTIONS.WALLETS,
        queries: [
          Query.equal('userId', userId),
          Query.equal('isPrimary', true)
        ]
      });

      for (const wallet of currentPrimary.rows) {
        await tablesDB.updateRow({
          databaseId: this.databaseId,
          tableId: WEB3_COLLECTIONS.WALLETS,
          rowId: wallet.$id,
          data: { isPrimary: false }
        });
      }

      // 2. Set new primary
      await tablesDB.updateRow({
        databaseId: this.databaseId,
        tableId: WEB3_COLLECTIONS.WALLETS,
        rowId: walletId,
        data: { isPrimary: true }
      });
    } catch (error) {
      console.error('Error setting primary wallet:', error);
      throw error;
    }
  }

  async getUserNFTs(_userId: string): Promise<any[]> {
    console.warn('Web3Service: getUserNFTs not implemented. Proposal for NFTs table created.');
    return [];
  }

  async addNFT(_userId: string, _data: Record<string, any>): Promise<any> {
    console.warn('Web3Service: addNFT not implemented. Proposal for NFTs table created.');
    return null;
  }

  async setNFTAsProfilePicture(_nftId: string, _userId: string): Promise<void> {
    console.warn('Web3Service: setNFTAsProfilePicture not implemented. Proposal for NFTs table created.');
  }

  async getUserTransactions(_userId: string): Promise<any[]> {
    console.warn('Web3Service: getUserTransactions not implemented. Proposal for TRANSACTIONS table created.');
    return [];
  }

  async recordTransaction(_data: Record<string, any>): Promise<any> {
    console.warn('Web3Service: recordTransaction not implemented. Proposal for TRANSACTIONS table created.');
    return null;
  }

  async updateTransactionStatus(_txId: string, _status: string, _blockNumber?: number): Promise<void> {
    console.warn('Web3Service: updateTransactionStatus not implemented. Proposal for TRANSACTIONS table created.');
  }

  async getPendingGifts(_userId: string): Promise<any[]> {
    console.warn('Web3Service: getPendingGifts not implemented. Proposal for TOKEN_GIFTS table created.');
    return [];
  }

  async createGift(_data: Record<string, any>): Promise<any> {
    console.warn('Web3Service: createGift not implemented. Proposal for TOKEN_GIFTS table created.');
    return null;
  }

  async claimGift(_giftId: string, _claimTxHash: string): Promise<void> {
    console.warn('Web3Service: claimGift not implemented. Proposal for TOKEN_GIFTS table created.');
  }

  /**
   * Get user holdings
   */
  async getUserHoldings(userId: string, chain?: string): Promise<Web3Row[]> {
    try {
        const queries = [Query.equal('userId', userId)];
        if (chain) queries.push(Query.equal('chain', chain));

        const response = await tablesDB.listRows({
            databaseId: this.databaseId,
            tableId: WEB3_COLLECTIONS.TOKEN_HOLDINGS,
            queries
        });
        return response.rows as Web3Row[];
    } catch (error) {
        console.error('Error getting holdings:', error);
        return [];
    }
  }

  /**
   * Update holdings
   */
  async updateHoldings(userId: string, data: Record<string, any>): Promise<void> {
    try {
        // Check if holding exists for token+chain
        const existing = await tablesDB.listRows({
            databaseId: this.databaseId,
            tableId: WEB3_COLLECTIONS.TOKEN_HOLDINGS,
            queries: [
                Query.equal('userId', userId),
                Query.equal('tokenAddress', data.tokenAddress),
                Query.equal('chain', data.chain),
                Query.limit(1)
            ]
        });

        if (existing.rows.length > 0) {
            await tablesDB.updateRow({
                databaseId: this.databaseId,
                tableId: WEB3_COLLECTIONS.TOKEN_HOLDINGS,
                rowId: existing.rows[0].$id,
                data: {
                    ...data,
                    updatedAt: new Date().toISOString()
                }
            });
        } else {
            await tablesDB.createRow({
                databaseId: this.databaseId,
                tableId: WEB3_COLLECTIONS.TOKEN_HOLDINGS,
                rowId: ID.unique(),
                data: {
                    userId,
                    ...data,
                    updatedAt: new Date().toISOString()
                }
            });
        }
    } catch (error) {
        console.error('Error updating holdings:', error);
    }
  }
}

export const web3Service = new Web3Service();
