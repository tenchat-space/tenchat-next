/**
 * Social Service
 * Handles stories, posts, and followers
 */

import { ID, Query } from 'appwrite';
import { tablesDB } from '../config/client';
import { DATABASE_IDS, SOCIAL_COLLECTIONS } from '../config/constants';

import type { Stories, Posts, Follows, StoryViews } from '@/types/appwrite-models';

export class SocialService {
  private readonly databaseId = DATABASE_IDS.CHAT;

  /**
   * Get user stories (active only)
   */
  async getUserStories(userId: string): Promise<Stories[]> {
    try {
      const response = await tablesDB.listRows({
        databaseId: this.databaseId,
        tableId: SOCIAL_COLLECTIONS.STORIES,
        queries: [
          Query.equal('userId', userId),
          Query.greaterThan('expiresAt', new Date().toISOString()),
          Query.orderDesc('createdAt')
        ]
      });
      return response.rows as unknown as Stories[];
    } catch (error) {
      console.error('Error getting user stories:', error);
      return [];
    }
  }

  /**
   * Create a story
   */
  async createStory(data: Partial<Stories>): Promise<Stories | null> {
    try {
      if (!data.userId || !data.mediaUrl || !data.contentType) {
        throw new Error('Missing required fields');
      }

      // Default 24h expiration
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      
      const result = await tablesDB.createRow({
        databaseId: this.databaseId,
        tableId: SOCIAL_COLLECTIONS.STORIES,
        rowId: ID.unique(),
        data: {
          ...data,
          expiresAt,
          createdAt: new Date().toISOString(),
          views: 0
        }
      });
      return result as unknown as Stories;
    } catch (error) {
      console.error('Error creating story:', error);
      return null;
    }
  }

  /**
   * View a story
   */
  async viewStory(storyId: string, viewerId: string): Promise<void> {
    try {
      // Check if already viewed
      const existing = await tablesDB.listRows({
        databaseId: this.databaseId,
        tableId: SOCIAL_COLLECTIONS.STORY_VIEWS,
        queries: [
          Query.equal('storyId', storyId),
          Query.equal('viewerId', viewerId),
          Query.limit(1)
        ]
      });

      if (existing.rows.length > 0) return;

      // Create view record
      await tablesDB.createRow({
        databaseId: this.databaseId,
        tableId: SOCIAL_COLLECTIONS.STORY_VIEWS,
        rowId: ID.unique(),
        data: {
          storyId,
          viewerId,
          viewedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error viewing story:', error);
    }
  }

  /**
   * Get user posts
   */
  async getUserPosts(userId: string): Promise<Posts[]> {
    try {
      const response = await tablesDB.listRows({
        databaseId: this.databaseId,
        tableId: SOCIAL_COLLECTIONS.POSTS,
        queries: [
          Query.equal('userId', userId),
          Query.orderDesc('createdAt')
        ]
      });
      return response.rows as unknown as Posts[];
    } catch (error) {
      console.error('Error getting user posts:', error);
      return [];
    }
  }

  /**
   * Get feed posts
   */
  async getFeedPosts(): Promise<Posts[]> {
    try {
      // For now, just global feed
      const response = await tablesDB.listRows({
        databaseId: this.databaseId,
        tableId: SOCIAL_COLLECTIONS.POSTS,
        queries: [
          Query.orderDesc('createdAt'),
          Query.limit(20)
        ]
      });
      return response.rows as unknown as Posts[];
    } catch (error) {
      console.error('Error getting feed posts:', error);
      return [];
    }
  }

  /**
   * Create a post
   */
  async createPost(data: Partial<Posts>): Promise<Posts | null> {
    try {
      if (!data.userId) {
        throw new Error('Missing user ID');
      }

      const result = await tablesDB.createRow({
        databaseId: this.databaseId,
        tableId: SOCIAL_COLLECTIONS.POSTS,
        rowId: ID.unique(),
        data: {
          ...data,
          likes: [], // Array of user IDs
          createdAt: new Date().toISOString()
        }
      });
      return result as unknown as Posts;
    } catch (error) {
      console.error('Error creating post:', error);
      return null;
    }
  }

  /**
   * React to post (Placeholder - requires COMMENTS/REACTIONS table)
   */
  async reactToPost(postId: string, userId: string, reaction: string): Promise<void> {
    console.warn('SocialService: reactToPost not implemented. Proposal for REACTIONS table created.');
  }

  /**
   * Add comment (Placeholder - requires COMMENTS table)
   */
  async addComment(postId: string, userId: string, content: string, parentCommentId?: string): Promise<any> {
    console.warn('SocialService: addComment not implemented. Proposal for COMMENTS table created.');
    return null;
  }

  /**
   * Get followers
   */
  async getFollowers(userId: string): Promise<Follows[]> {
    try {
      const response = await tablesDB.listRows({
        databaseId: this.databaseId,
        tableId: SOCIAL_COLLECTIONS.FOLLOWS,
        queries: [
          Query.equal('followingId', userId)
        ]
      });
      return response.rows as unknown as Follows[];
    } catch (error) {
      console.error('Error getting followers:', error);
      return [];
    }
  }

  /**
   * Get following
   */
  async getFollowing(userId: string): Promise<Follows[]> {
    try {
      const response = await tablesDB.listRows({
        databaseId: this.databaseId,
        tableId: SOCIAL_COLLECTIONS.FOLLOWS,
        queries: [
          Query.equal('followerId', userId)
        ]
      });
      return response.rows as unknown as Follows[];
    } catch (error) {
      console.error('Error getting following:', error);
      return [];
    }
  }

  /**
   * Follow user
   */
  async followUser(followerId: string, followingId: string): Promise<void> {
    try {
      // Check if already following
      const existing = await tablesDB.listRows({
        databaseId: this.databaseId,
        tableId: SOCIAL_COLLECTIONS.FOLLOWS,
        queries: [
          Query.equal('followerId', followerId),
          Query.equal('followingId', followingId),
          Query.limit(1)
        ]
      });

      if (existing.rows.length > 0) return;

      await tablesDB.createRow({
        databaseId: this.databaseId,
        tableId: SOCIAL_COLLECTIONS.FOLLOWS,
        rowId: ID.unique(),
        data: {
          followerId,
          followingId,
          createdAt: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error following user:', error);
    }
  }

  /**
   * Unfollow user
   */
  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    try {
      const existing = await tablesDB.listRows({
        databaseId: this.databaseId,
        tableId: SOCIAL_COLLECTIONS.FOLLOWS,
        queries: [
          Query.equal('followerId', followerId),
          Query.equal('followingId', followingId),
          Query.limit(1)
        ]
      });

      if (existing.rows.length === 0) return;

      const rowId = existing.rows[0].$id;
      await tablesDB.deleteRow({
        databaseId: this.databaseId,
        tableId: SOCIAL_COLLECTIONS.FOLLOWS,
        rowId
      });
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  }
}

export const socialService = new SocialService();
