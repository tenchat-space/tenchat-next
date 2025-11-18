/**
 * Content Service
 * Handles stickers, GIFs, AR filters, and media library
 */

import { ID, Query } from 'appwrite';
import { tablesDB } from '../config/client';
import { DATABASE_IDS, CONTENT_COLLECTIONS } from '../config/constants';
import type { Stickers, StickerPacks, UserStickers, Gifs, Polls, ArFilters, MediaLibrary } from '@/types/appwrite.d';

export class ContentService {
  private readonly databaseId = DATABASE_IDS.CONTENT;

  // ==================== Stickers ====================

  /**
   * Get all sticker packs
   */
  async getStickerPacks(limit = 50): Promise<StickerPacks[]> {
    try {
      const response = await tablesDB.listRows({
        databaseId: this.databaseId,
        tableId: CONTENT_COLLECTIONS.STICKER_PACKS,
        queries: [
          Query.equal('isActive', true),
          Query.orderDesc('createdAt'),
          Query.limit(limit),
        ]
      });
      return response.rows as StickerPacks[];
    } catch (error) {
      console.error('Error getting sticker packs:', error);
      return [];
    }
  }

  /**
   * Get stickers in a pack
   */
  async getStickersInPack(packId: string): Promise<Stickers[]> {
    try {
      const response = await tablesDB.listRows({
        databaseId: this.databaseId,
        tableId: CONTENT_COLLECTIONS.STICKERS,
        queries: [
          Query.equal('packId', packId),
          Query.orderAsc('order'),
        ]
      });
      return response.rows as Stickers[];
    } catch (error) {
      console.error('Error getting stickers:', error);
      return [];
    }
  }

  /**
   * Get user's stickers
   */
  async getUserStickers(userId: string): Promise<UserStickers[]> {
    try {
      const response = await tablesDB.listRows({
        databaseId: this.databaseId,
        tableId: CONTENT_COLLECTIONS.USER_STICKERS,
        queries: [Query.equal('userId', userId)]
      });
      return response.rows as UserStickers[];
    } catch (error) {
      console.error('Error getting user stickers:', error);
      return [];
    }
  }

  /**
   * Add sticker pack to user
   */
  async addStickerPack(userId: string, packId: string): Promise<UserStickers> {
    return await tablesDB.createRow({
      databaseId: this.databaseId,
      tableId: CONTENT_COLLECTIONS.USER_STICKERS,
      rowId: ID.unique(),
      data: {
        userId,
        stickerPackId: packId,
        usageCount: 0,
        addedAt: new Date().toISOString(),
      }
    }) as UserStickers;
  }

  // ==================== GIFs ====================

  /**
   * Search GIFs
   */
  async searchGifs(query: string, limit = 30): Promise<Gifs[]> {
    try {
      const response = await tablesDB.listRows({
        databaseId: this.databaseId,
        tableId: CONTENT_COLLECTIONS.GIFS,
        queries: [
          Query.search('tags', query),
          Query.limit(limit),
        ]
      });
      return response.rows as Gifs[];
    } catch (error) {
      console.error('Error searching GIFs:', error);
      return [];
    }
  }

  /**
   * Get trending GIFs
   */
  async getTrendingGifs(limit = 30): Promise<Gifs[]> {
    try {
      const response = await tablesDB.listRows({
        databaseId: this.databaseId,
        tableId: CONTENT_COLLECTIONS.GIFS,
        queries: [
          Query.orderDesc('usageCount'),
          Query.limit(limit),
        ]
      });
      return response.rows as Gifs[];
    } catch (error) {
      console.error('Error getting trending GIFs:', error);
      return [];
    }
  }

  /**
   * Record GIF usage
   */
  async recordGifUsage(gifId: string): Promise<void> {
    try {
      const gif = await tablesDB.getRow({
        databaseId: this.databaseId,
        tableId: CONTENT_COLLECTIONS.GIFS,
        rowId: gifId
      }) as Gifs;

      await tablesDB.updateRow({
        databaseId: this.databaseId,
        tableId: CONTENT_COLLECTIONS.GIFS,
        rowId: gifId,
        data: {
          usageCount: (gif.usageCount || 0) + 1,
        }
      });
    } catch (error) {
      console.error('Error recording GIF usage:', error);
    }
  }

  // ==================== AR Filters ====================

  /**
   * Get all AR filters
   */
  async getARFilters(limit = 50): Promise<ArFilters[]> {
    try {
      const response = await tablesDB.listRows({
        databaseId: this.databaseId,
        tableId: CONTENT_COLLECTIONS.AR_FILTERS,
        queries: [
          Query.equal('isActive', true),
          Query.orderDesc('createdAt'),
          Query.limit(limit),
        ]
      });
      return response.rows as ArFilters[];
    } catch (error) {
      console.error('Error getting AR filters:', error);
      return [];
    }
  }

  /**
   * Record filter usage
   */
  async recordFilterUsage(filterId: string): Promise<void> {
    try {
      const filter = await tablesDB.getRow({
        databaseId: this.databaseId,
        tableId: CONTENT_COLLECTIONS.AR_FILTERS,
        rowId: filterId
      }) as ArFilters;

      await tablesDB.updateRow({
        databaseId: this.databaseId,
        tableId: CONTENT_COLLECTIONS.AR_FILTERS,
        rowId: filterId,
        data: {
          usageCount: (filter.usageCount || 0) + 1,
        }
      });
    } catch (error) {
      console.error('Error recording filter usage:', error);
    }
  }

  // ==================== Polls ====================

  /**
   * Create a poll
   */
  async createPoll(data: Partial<Polls>): Promise<Polls> {
    return await tablesDB.createRow({
      databaseId: this.databaseId,
      tableId: CONTENT_COLLECTIONS.POLLS,
      rowId: ID.unique(),
      data: {
        ...data,
        totalVotes: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    }) as Polls;
  }

  /**
   * Vote on a poll
   */
  async votePoll(pollId: string, userId: string, optionIndex: number): Promise<Polls> {
    const poll = await tablesDB.getRow({
      databaseId: this.databaseId,
      tableId: CONTENT_COLLECTIONS.POLLS,
      rowId: pollId
    }) as Polls;

    const voters = poll.voterIds || [];
    if (voters.includes(userId)) {
      throw new Error('User has already voted');
    }

    const results = poll.results || poll.options.map(() => 0);
    results[optionIndex] = (results[optionIndex] || 0) + 1;

    return await tablesDB.updateRow({
      databaseId: this.databaseId,
      tableId: CONTENT_COLLECTIONS.POLLS,
      rowId: pollId,
      data: {
        results,
        voterIds: [...voters, userId],
        totalVotes: (poll.totalVotes || 0) + 1,
        updatedAt: new Date().toISOString(),
      }
    }) as Polls;
  }

  /**
   * Get poll results
   */
  async getPoll(pollId: string): Promise<Polls | null> {
    try {
      return await tablesDB.getRow({
        databaseId: this.databaseId,
        tableId: CONTENT_COLLECTIONS.POLLS,
        rowId: pollId
      }) as Polls;
    } catch (error) {
      console.error('Error getting poll:', error);
      return null;
    }
  }

  // ==================== Media Library ====================

  /**
   * Get user's media library
   */
  async getUserMedia(userId: string, mediaType?: string, limit = 50): Promise<MediaLibrary[]> {
    try {
      const queries = [
        Query.equal('userId', userId),
        Query.orderDesc('uploadedAt'),
        Query.limit(limit),
      ];

      if (mediaType) {
        queries.push(Query.equal('mediaType', mediaType));
      }

      const response = await tablesDB.listRows({
        databaseId: this.databaseId,
        tableId: CONTENT_COLLECTIONS.MEDIA_LIBRARY,
        queries,
      });
      return response.rows as MediaLibrary[];
    } catch (error) {
      console.error('Error getting user media:', error);
      return [];
    }
  }

  /**
   * Add media to library
   */
  async addMedia(data: Partial<MediaLibrary>): Promise<MediaLibrary> {
    return await tablesDB.createRow({
      databaseId: this.databaseId,
      tableId: CONTENT_COLLECTIONS.MEDIA_LIBRARY,
      rowId: ID.unique(),
      data: {
        ...data,
        uploadedAt: new Date().toISOString(),
      }
    }) as MediaLibrary;
  }

  /**
   * Delete media from library
   */
  async deleteMedia(mediaId: string): Promise<void> {
    await tablesDB.deleteRow({
      databaseId: this.databaseId,
      tableId: CONTENT_COLLECTIONS.MEDIA_LIBRARY,
      rowId: mediaId
    });
  }
}

export const contentService = new ContentService();
