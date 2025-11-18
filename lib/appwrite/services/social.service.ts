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
}

export const socialService = new SocialService();
