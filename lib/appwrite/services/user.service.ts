/**
 * User Service
 * Handles user data from the chat database
 */

import { Query, ID } from 'appwrite';
import { tablesDB, account } from '../config/client';
import { DATABASE_IDS, CHAT_TABLES } from '../config/constants';
import type { Users } from '@/types/appwrite.d';
import type { Models } from 'appwrite';

export interface User extends Models.Document {
  id: string;
  username?: string;
  displayName?: string;
  walletAddress?: string;
  createdAt?: string;
  updatedAt?: string;
}

export class UserService {
  private readonly databaseId = DATABASE_IDS.CHAT;
  private readonly usersCollection = CHAT_TABLES.USERS;

  /**
   * Get user by ID from database
   */
  async getUser(userId: string): Promise<User | null> {
    try {
      const user = await tablesDB.getRow({
        databaseId: this.databaseId,
        tableId: this.usersCollection,
        rowId: userId,
      });
      return user as unknown as User;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  // Note: users table does not store email; use account service for email

  /**
   * Get user by username - robust search
   */
  async getUserByUsername(username: string): Promise<User | null> {
    try {
      // Try exact match first
      let response: any = await tablesDB.listRows({
        databaseId: this.databaseId,
        tableId: this.usersCollection,
        queries: [Query.equal('username', username), Query.limit(1)],
      });

      if (response.rows?.length > 0) {
        return response.rows[0] as User;
      }

      // Try case-insensitive search
      response = await tablesDB.listRows({
        databaseId: this.databaseId,
        tableId: this.usersCollection,
        queries: [Query.search('username', username), Query.limit(1)],
      });

      if (response.rows?.length > 0) {
        return response.rows[0] as User;
      }

      // Last resort: get all and filter
      response = await tablesDB.listRows({
        databaseId: this.databaseId,
        tableId: this.usersCollection,
        queries: [Query.limit(100)],
      });

      const found = (response.rows || []).find((doc: any) =>
        doc.username?.toLowerCase() === username.toLowerCase()
      );

      return (found as User) || null;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return null;
    }
  }

  /**
   * Get user by wallet address
   */
  async getUserByWallet(walletAddress: string): Promise<User | null> {
    try {
      const response = await tablesDB.listRows({
        databaseId: this.databaseId,
        tableId: this.usersCollection,
        queries: [Query.equal('walletAddress', walletAddress.toLowerCase()), Query.limit(1)],
      });
      const rows = (response as any).rows || [];
      return (rows[0] as User) || null;
    } catch (error) {
      console.error('Error getting user by wallet:', error);
      return null;
    }
  }

  /**
   * Search users by username (partial match) - robust with fallbacks
   */
  async searchUsers(searchTerm: string, limit = 20): Promise<User[]> {
    try {
      // Try search first
      let response: any = await tablesDB.listRows({
        databaseId: this.databaseId,
        tableId: this.usersCollection,
        queries: [
          Query.search('username', searchTerm),
          Query.limit(limit),
        ],
      });
      
      // If search returns nothing, try startsWith
      if (!response.rows || response.rows.length === 0) {
        response = await tablesDB.listRows({
          databaseId: this.databaseId,
          tableId: this.usersCollection,
          queries: [
            Query.startsWith('username', searchTerm),
            Query.limit(limit),
          ],
        });
      }
      
      // If still nothing, try contains (case-insensitive)
      if (!response.rows || response.rows.length === 0) {
        response = await tablesDB.listRows({
          databaseId: this.databaseId,
          tableId: this.usersCollection,
          queries: [
            Query.limit(100), // Get more to filter manually
          ],
        });

        // Filter manually for case-insensitive contains
        const filtered = (response.rows || []).filter((doc: any) =>
          doc.username?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return filtered.slice(0, limit) as User[];
      }
      
      return (response.rows || []) as User[];
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }

  /**
   * Check if username is available
   */
  async isUsernameAvailable(username: string): Promise<boolean> {
    try {
      const user = await this.getUserByUsername(username);
      return !user;
    } catch (error) {
      console.error('Error checking username availability:', error);
      return false;
    }
  }

  /**
   * Update username for current user (updates both account and database)
   */
  async updateUsername(userId: string, newUsername: string): Promise<boolean> {
    try {
      // Check if username is available
      const isAvailable = await this.isUsernameAvailable(newUsername);
      if (!isAvailable) {
        throw new Error('Username already taken');
      }

      // Update Appwrite account name
      await account.updateName(newUsername);

      // Update database record
      await tablesDB.updateRow({
        databaseId: this.databaseId,
        tableId: this.usersCollection,
        rowId: userId,
        data: {
          username: newUsername,
          displayName: newUsername,
          updatedAt: new Date().toISOString(),
        },
      });

      return true;
    } catch (error) {
      console.error('Error updating username:', error);
      throw error;
    }
  }

  /**
   * Create or update user record in database
   */
  async upsertUser(userId: string, data: Partial<Users>): Promise<User> {
    try {
      // Try to get existing user
      const existingUser = await this.getUser(userId);
      
      if (existingUser) {
        // Update existing user
        const updated = await tablesDB.updateRow({
          databaseId: this.databaseId,
          tableId: this.usersCollection,
          rowId: userId,
          data: {
            ...data,
            updatedAt: new Date().toISOString(),
          },
        });
        return updated as unknown as User;
      } else {
        // Create new user
        const created = await tablesDB.createRow({
          databaseId: this.databaseId,
          tableId: this.usersCollection,
          rowId: userId,
          data: {
            ...data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        });
        return created as unknown as User;
      }
    } catch (error) {
      console.error('Error upserting user:', error);
      throw error;
    }
  }

  /**
   * Generate shareable profile link
   */
  generateProfileLink(username: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/chat?username=${encodeURIComponent(username)}`;
  }

  /**
   * Generate QR code data for user profile
   */
  generateQRCodeData(username: string, walletAddress?: string): string {
    const data = {
      type: 'profile',
      username,
      walletAddress,
      timestamp: Date.now(),
    };
    return JSON.stringify(data);
  }

  /**
   * Generate QR code data for crypto payment request
   */
  generatePaymentQRCode(walletAddress: string, amount?: string, token?: string, chain?: string): string {
    const data = {
      type: 'payment',
      walletAddress,
      amount,
      token: token || 'ETH',
      chain: chain || 'ethereum',
      timestamp: Date.now(),
    };
    return JSON.stringify(data);
  }

  /**
   * Parse QR code data
   */
  parseQRCodeData(qrData: string): { type: string; [key: string]: any } | null {
    try {
      const data = JSON.parse(qrData);
      return data;
    } catch (error) {
      console.error('Error parsing QR code:', error);
      return null;
    }
  }
}

export const userService = new UserService();
