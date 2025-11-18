/**
 * Social Service  
 * Handles stories, posts, comments, and follows
 */

import { ID, Query } from 'appwrite';
import { tablesDB } from '../config/client';
import { DATABASE_IDS, SOCIAL_COLLECTIONS } from '../config/constants';
import type { Stories, StoryViews, Posts, PostReactions, Comments, Follows } from '@/types/appwrite.d';

export class SocialService {
  private readonly databaseId = DATABASE_IDS.SOCIAL;

  async createStory(data: Partial<Stories>): Promise<Stories> {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    return await tablesDB.createRow({
      databaseId: this.databaseId,
      tableId: SOCIAL_COLLECTIONS.STORIES,
      rowId: ID.unique(),
      data: {
        ...data,
        viewCount: 0,
        reactionCount: 0,
        replyCount: 0,
        shareCount: 0,
        expiresAt: expiresAt.toISOString(),
        createdAt: new Date().toISOString(),
      }
    }) as Stories;
  }

  async getUserStories(userId: string): Promise<Stories[]> {
    try {
      const response = await tablesDB.listRows({
        databaseId: this.databaseId,
        tableId: SOCIAL_COLLECTIONS.STORIES,
        queries: [
          Query.equal('userId', userId),
          Query.greaterThan('expiresAt', new Date().toISOString()),
          Query.orderDesc('createdAt'),
        ]
      });
      return response.rows as Stories[];
    } catch (error) {
      console.error('Error getting user stories:', error);
      return [];
    }
  }

  async viewStory(storyId: string, viewerId: string): Promise<void> {
    try {
      const existing = await tablesDB.listRows({
        databaseId: this.databaseId,
        tableId: SOCIAL_COLLECTIONS.STORY_VIEWS,
        queries: [
          Query.equal('storyId', storyId),
          Query.equal('viewerId', viewerId),
          Query.limit(1),
        ]
      });

      if (existing.rows.length > 0) return;

      await tablesDB.createRow({
        databaseId: this.databaseId,
        tableId: SOCIAL_COLLECTIONS.STORY_VIEWS,
        rowId: ID.unique(),
        data: {
          storyId,
          viewerId,
          watchDuration: 0,
          completedView: false,
          viewedAt: new Date().toISOString(),
        }
      });

      const story = await tablesDB.getRow({
        databaseId: this.databaseId,
        tableId: SOCIAL_COLLECTIONS.STORIES,
        rowId: storyId
      }) as Stories;

      await tablesDB.updateRow({
        databaseId: this.databaseId,
        tableId: SOCIAL_COLLECTIONS.STORIES,
        rowId: storyId,
        data: {
          viewCount: (story.viewCount || 0) + 1,
          viewerIds: [...(story.viewerIds || []), viewerId],
        }
      });
    } catch (error) {
      console.error('Error recording story view:', error);
    }
  }

  async createPost(data: Partial<Posts>): Promise<Posts> {
    return await tablesDB.createRow({
      databaseId: this.databaseId,
      tableId: SOCIAL_COLLECTIONS.POSTS,
      rowId: ID.unique(),
      data: {
        ...data,
        likeCount: 0,
        commentCount: 0,
        shareCount: 0,
        viewCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    }) as Posts;
  }

  async getFeedPosts(limit = 20, offset = 0): Promise<Posts[]> {
    try {
      const response = await tablesDB.listRows({
        databaseId: this.databaseId,
        tableId: SOCIAL_COLLECTIONS.POSTS,
        queries: [
          Query.orderDesc('createdAt'),
          Query.limit(limit),
          Query.offset(offset),
        ]
      });
      return response.rows as Posts[];
    } catch (error) {
      console.error('Error getting feed posts:', error);
      return [];
    }
  }

  async getUserPosts(userId: string, limit = 20): Promise<Posts[]> {
    try {
      const response = await tablesDB.listRows({
        databaseId: this.databaseId,
        tableId: SOCIAL_COLLECTIONS.POSTS,
        queries: [
          Query.equal('userId', userId),
          Query.orderDesc('createdAt'),
          Query.limit(limit),
        ]
      });
      return response.rows as Posts[];
    } catch (error) {
      console.error('Error getting user posts:', error);
      return [];
    }
  }

  async reactToPost(postId: string, userId: string, reaction: string): Promise<void> {
    try {
      const existing = await tablesDB.listRows({
        databaseId: this.databaseId,
        tableId: SOCIAL_COLLECTIONS.POST_REACTIONS,
        queries: [
          Query.equal('postId', postId),
          Query.equal('userId', userId),
          Query.limit(1),
        ]
      });

      if (existing.rows.length > 0) {
        await tablesDB.updateRow({
          databaseId: this.databaseId,
          tableId: SOCIAL_COLLECTIONS.POST_REACTIONS,
          rowId: existing.rows[0].$id,
          data: { reaction }
        });
        return;
      }

      await tablesDB.createRow({
        databaseId: this.databaseId,
        tableId: SOCIAL_COLLECTIONS.POST_REACTIONS,
        rowId: ID.unique(),
        data: {
          postId,
          userId,
          reaction,
          createdAt: new Date().toISOString(),
        }
      });

      const post = await tablesDB.getRow({
        databaseId: this.databaseId,
        tableId: SOCIAL_COLLECTIONS.POSTS,
        rowId: postId
      }) as Posts;

      await tablesDB.updateRow({
        databaseId: this.databaseId,
        tableId: SOCIAL_COLLECTIONS.POSTS,
        rowId: postId,
        data: {
          likeCount: (post.likeCount || 0) + 1,
        }
      });
    } catch (error) {
      console.error('Error reacting to post:', error);
    }
  }

  async addComment(postId: string, userId: string, content: string, parentCommentId?: string): Promise<Comments> {
    const comment = await tablesDB.createRow({
      databaseId: this.databaseId,
      tableId: SOCIAL_COLLECTIONS.COMMENTS,
      rowId: ID.unique(),
      data: {
        postId,
        userId,
        content,
        parentCommentId: parentCommentId || null,
        mentions: [],
        likeCount: 0,
        replyCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    }) as Comments;

    const post = await tablesDB.getRow({
      databaseId: this.databaseId,
      tableId: SOCIAL_COLLECTIONS.POSTS,
      rowId: postId
    }) as Posts;

    await tablesDB.updateRow({
      databaseId: this.databaseId,
      tableId: SOCIAL_COLLECTIONS.POSTS,
      rowId: postId,
      data: {
        commentCount: (post.commentCount || 0) + 1,
      }
    });

    return comment;
  }

  async followUser(followerId: string, followingId: string): Promise<Follows> {
    return await tablesDB.createRow({
      databaseId: this.databaseId,
      tableId: SOCIAL_COLLECTIONS.FOLLOWS,
      rowId: ID.unique(),
      data: {
        followerId,
        followingId,
        status: 'accepted',
        isCloseFriend: false,
        notificationsEnabled: true,
        createdAt: new Date().toISOString(),
      }
    }) as Follows;
  }

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    const follows = await tablesDB.listRows({
      databaseId: this.databaseId,
      tableId: SOCIAL_COLLECTIONS.FOLLOWS,
      queries: [
        Query.equal('followerId', followerId),
        Query.equal('followingId', followingId),
        Query.limit(1),
      ]
    });

    if (follows.rows.length > 0) {
      await tablesDB.deleteRow({
        databaseId: this.databaseId,
        tableId: SOCIAL_COLLECTIONS.FOLLOWS,
        rowId: follows.rows[0].$id
      });
    }
  }

  async getFollowers(userId: string, limit = 50): Promise<Follows[]> {
    try {
      const response = await tablesDB.listRows({
        databaseId: this.databaseId,
        tableId: SOCIAL_COLLECTIONS.FOLLOWS,
        queries: [
          Query.equal('followingId', userId),
          Query.limit(limit),
        ]
      });
      return response.rows as Follows[];
    } catch (error) {
      console.error('Error getting followers:', error);
      return [];
    }
  }

  async getFollowing(userId: string, limit = 50): Promise<Follows[]> {
    try {
      const response = await tablesDB.listRows({
        databaseId: this.databaseId,
        tableId: SOCIAL_COLLECTIONS.FOLLOWS,
        queries: [
          Query.equal('followerId', userId),
          Query.limit(limit),
        ]
      });
      return response.rows as Follows[];
    } catch (error) {
      console.error('Error getting following:', error);
      return [];
    }
  }
}

export const socialService = new SocialService();
