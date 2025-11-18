/**
 * Social Service (Stub)
 * TODO: Implement stories, posts, follows when needed
 */

export class SocialService {
  async getUserStories(_userId: string): Promise<any[]> {
    console.warn('SocialService: getUserStories not implemented');
    return [];
  }

  async getUserPosts(_userId: string): Promise<any[]> {
    console.warn('SocialService: getUserPosts not implemented');
    return [];
  }

  async getFeedPosts(): Promise<any[]> {
    console.warn('SocialService: getFeedPosts not implemented');
    return [];
  }

  async createStory(_data: any): Promise<any> {
    console.warn('SocialService: createStory not implemented');
    return null;
  }

  async viewStory(_storyId: string, _viewerId: string): Promise<void> {
    console.warn('SocialService: viewStory not implemented');
  }

  async createPost(_data: any): Promise<any> {
    console.warn('SocialService: createPost not implemented');
    return null;
  }

  async reactToPost(_postId: string, _userId: string, _reaction: string): Promise<void> {
    console.warn('SocialService: reactToPost not implemented');
  }

  async addComment(_postId: string, _userId: string, _content: string, _parentCommentId?: string): Promise<any> {
    console.warn('SocialService: addComment not implemented');
    return null;
  }

  async getFollowers(_userId: string): Promise<any[]> {
    console.warn('SocialService: getFollowers not implemented');
    return [];
  }

  async getFollowing(_userId: string): Promise<any[]> {
    console.warn('SocialService: getFollowing not implemented');
    return [];
  }

  async followUser(_followerId: string, _followingId: string): Promise<void> {
    console.warn('SocialService: followUser not implemented');
  }

  async unfollowUser(_followerId: string, _followingId: string): Promise<void> {
    console.warn('SocialService: unfollowUser not implemented');
  }
}

export const socialService = new SocialService();
