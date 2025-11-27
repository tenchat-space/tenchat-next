/**
 * Social Hooks
 * React hooks for social features (stories, posts, follows)
 */

import { useState, useEffect, useCallback } from 'react';
import { socialService, realtimeService } from '@/lib/appwrite';
import type { Stories, Posts, Follows } from '@/types/appwrite-models';

export function useStories(userId?: string) {
  const [stories, setStories] = useState<Stories[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadStories = useCallback(async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      const userStories = await socialService.getUserStories(userId);
      setStories(userStories);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to load stories:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadStories();
  }, [loadStories]);

  const createStory = useCallback(async (data: Partial<Stories>) => {
    try {
      const newStory = await socialService.createStory(data);
      if (newStory) {
        setStories(prev => [newStory, ...prev]);
      }
      return newStory;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  const viewStory = useCallback(async (storyId: string, viewerId: string) => {
    try {
      await socialService.viewStory(storyId, viewerId);
    } catch (err) {
      console.error('Failed to record story view:', err);
    }
  }, []);

  return {
    stories,
    isLoading,
    error,
    loadStories,
    createStory,
    viewStory,
  };
}

export function usePosts(userId?: string) {
  const [posts, setPosts] = useState<Posts[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      const allPosts = userId 
        ? await socialService.getUserPosts(userId)
        : await socialService.getFeedPosts();
      setPosts(allPosts);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to load posts:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const createPost = useCallback(async (data: Partial<Posts>) => {
    try {
      const newPost = await socialService.createPost(data);
      if (newPost) {
        setPosts(prev => [newPost, ...prev]);
      }
      return newPost;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  const reactToPost = useCallback(async (postId: string, userId: string, reaction: string) => {
    try {
      await socialService.reactToPost(postId, userId, reaction);
      await loadPosts(); // Reload to get updated counts
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [loadPosts]);

  const addComment = useCallback(async (
    postId: string,
    userId: string,
    content: string,
    parentCommentId?: string
  ) => {
    try {
      const comment = await socialService.addComment(postId, userId, content, parentCommentId);
      await loadPosts(); // Reload to get updated counts
      return comment;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [loadPosts]);

  return {
    posts,
    isLoading,
    error,
    loadPosts,
    createPost,
    reactToPost,
    addComment,
  };
}

export function useFollows(userId: string) {
  const [followers, setFollowers] = useState<Follows[]>([]);
  const [following, setFollowing] = useState<Follows[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadFollows = useCallback(async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      const [followersList, followingList] = await Promise.all([
        socialService.getFollowers(userId),
        socialService.getFollowing(userId),
      ]);
      setFollowers(followersList);
      setFollowing(followingList);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to load follows:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadFollows();
  }, [loadFollows]);

  const followUser = useCallback(async (followerId: string, followingId: string) => {
    try {
      await socialService.followUser(followerId, followingId);
      await loadFollows();
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [loadFollows]);

  const unfollowUser = useCallback(async (followerId: string, followingId: string) => {
    try {
      await socialService.unfollowUser(followerId, followingId);
      await loadFollows();
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [loadFollows]);

  const isFollowing = useCallback((targetUserId: string) => {
    return following.some(f => f.followingId === targetUserId);
  }, [following]);

  return {
    followers,
    following,
    isLoading,
    error,
    loadFollows,
    followUser,
    unfollowUser,
    isFollowing,
    followerCount: followers.length,
    followingCount: following.length,
  };
}
