/**
 * Realtime Service
 * Handles real-time subscriptions
 */

import { client } from '../config/client';
import { DATABASE_IDS, MAIN_COLLECTIONS } from '../config/constants';

export class RealtimeService {
  /**
   * Subscribe to messages in a conversation
   */
  subscribeToMessages(conversationId: string, callback: (event: any) => void) {
    return client.subscribe(
      `databases.${DATABASE_IDS.MAIN}.collections.${MAIN_COLLECTIONS.MESSAGES}.documents`,
      (response) => {
        const message = response.payload;
        if (message.conversationId === conversationId) {
          callback(response);
        }
      }
    );
  }

  /**
   * Subscribe to typing indicators
   */
  subscribeToTyping(conversationId: string, callback: (event: any) => void) {
    return client.subscribe(
      `databases.${DATABASE_IDS.MAIN}.collections.${MAIN_COLLECTIONS.TYPING_INDICATORS}.documents`,
      (response) => {
        const indicator = response.payload;
        if (indicator.conversationId === conversationId) {
          callback(response);
        }
      }
    );
  }

  /**
   * Subscribe to presence updates
   */
  subscribeToPresence(callback: (event: any) => void) {
    return client.subscribe(
      `databases.${DATABASE_IDS.MAIN}.collections.${MAIN_COLLECTIONS.PRESENCE}.documents`,
      callback
    );
  }

  /**
   * Subscribe to user's conversations
   */
  subscribeToConversations(callback: (event: any) => void) {
    return client.subscribe(
      `databases.${DATABASE_IDS.MAIN}.collections.${MAIN_COLLECTIONS.CONVERSATIONS}.documents`,
      callback
    );
  }

  /**
   * Subscribe to stories
   */
  subscribeToStories(userId: string, callback: (event: any) => void) {
    return client.subscribe(
      `databases.${DATABASE_IDS.SOCIAL}.collections.stories.documents`,
      (response) => {
        const story = response.payload;
        if (story.userId === userId) {
          callback(response);
        }
      }
    );
  }

  /**
   * Subscribe to notifications
   */
  subscribeToNotifications(userId: string, callback: (event: any) => void) {
    return client.subscribe(
      `databases.${DATABASE_IDS.ANALYTICS}.collections.notifications.documents`,
      (response) => {
        const notification = response.payload;
        if (notification.userId === userId) {
          callback(response);
        }
      }
    );
  }
}

export const realtimeService = new RealtimeService();
