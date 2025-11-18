/**
 * Profile Service
 * Handles user profile operations
 */

import { ID, Query } from 'appwrite';
import { tablesDB } from '../config/client';
import { DATABASE_IDS, MAIN_COLLECTIONS } from '../config/constants';
import type { Profiles } from '@/types/appwrite.d';

export class ProfileService {
  private readonly databaseId = DATABASE_IDS.MAIN;
  private readonly tableId = MAIN_COLLECTIONS.PROFILES;

  /**
   * Get profile by user ID
   */
  async getProfile(userId: string): Promise<Profiles | null> {
    try {
      const response = await tablesDB.listRows({
        databaseId: this.databaseId,
        tableId: this.tableId,
        queries: [Query.equal('userId', userId), Query.limit(1)]
      });
      return (response.rows[0] as Profiles) || null;
    } catch (error) {
      console.error('Error getting profile:', error);
      return null;
    }
  }

  /**
   * Get profile by document ID
   */
  async getProfileById(id: string): Promise<Profiles | null> {
    try {
      return await tablesDB.getRow({
        databaseId: this.databaseId,
        tableId: this.tableId,
        rowId: id
      }) as Profiles;
    } catch (error) {
      console.error('Error getting profile by ID:', error);
      return null;
    }
  }

  /**
   * Create a new profile
   */
  async createProfile(userId: string, data: Partial<Profiles>): Promise<Profiles> {
    return await tablesDB.createRow({
      databaseId: this.databaseId,
      tableId: this.tableId,
      rowId: ID.unique(),
      data: {
        userId,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    }) as Profiles;
  }

  /**
   * Update profile
   */
  async updateProfile(rowId: string, data: Partial<Profiles>): Promise<Profiles> {
    return await tablesDB.updateRow({
      databaseId: this.databaseId,
      tableId: this.tableId,
      rowId,
      data: {
        ...data,
        updatedAt: new Date().toISOString(),
      }
    }) as Profiles;
  }

  /**
   * Update online status
   */
  async updateOnlineStatus(rowId: string, isOnline: boolean): Promise<Profiles> {
    return await this.updateProfile(rowId, {
      isOnline,
      lastSeen: new Date().toISOString(),
    });
  }

  /**
   * Search profiles by username
   */
  async searchProfiles(username: string, limit = 10): Promise<Profiles[]> {
    try {
      const response = await tablesDB.listRows({
        databaseId: this.databaseId,
        tableId: this.tableId,
        queries: [Query.search('username', username), Query.limit(limit)]
      });
      return response.rows as Profiles[];
    } catch (error) {
      console.error('Error searching profiles:', error);
      return [];
    }
  }

  /**
   * Get online users
   */
  async getOnlineUsers(limit = 50): Promise<Profiles[]> {
    try {
      const response = await tablesDB.listRows({
        databaseId: this.databaseId,
        tableId: this.tableId,
        queries: [Query.equal('isOnline', true), Query.limit(limit)]
      });
      return response.rows as Profiles[];
    } catch (error) {
      console.error('Error getting online users:', error);
      return [];
    }
  }

  /**
   * Update user XP and level
   */
  async addXP(rowId: string, xpToAdd: number): Promise<Profiles> {
    const profile = await this.getProfileById(rowId);
    if (!profile) throw new Error('Profile not found');

    const newXP = (profile.xp || 0) + xpToAdd;
    const newLevel = Math.floor(newXP / 1000) + 1;

    return await this.updateProfile(rowId, {
      xp: newXP,
      level: newLevel,
    });
  }

  /**
   * Update streak
   */
  async updateStreak(rowId: string): Promise<Profiles> {
    const profile = await this.getProfileById(rowId);
    if (!profile) throw new Error('Profile not found');

    const newStreak = (profile.streakDays || 0) + 1;

    return await this.updateProfile(rowId, {
      streakDays: newStreak,
    });
  }

  /**
   * Add badge to user
   */
  async addBadge(rowId: string, badgeId: string): Promise<Profiles> {
    const profile = await this.getProfileById(rowId);
    if (!profile) throw new Error('Profile not found');

    const badges = profile.badges || [];
    if (badges.includes(badgeId)) return profile;

    return await this.updateProfile(rowId, {
      badges: [...badges, badgeId],
    });
  }

  /**
   * Delete profile
   */
  async deleteProfile(rowId: string): Promise<void> {
    await tablesDB.deleteRow({
      databaseId: this.databaseId,
      tableId: this.tableId,
      rowId
    });
  }
}

export const profileService = new ProfileService();
