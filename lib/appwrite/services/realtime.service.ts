import { RealtimeResponseEvent } from 'appwrite';
import { client } from '../config/client';
import { DATABASE_IDS, CHAT_TABLES } from '../config/constants';

export class RealtimeService {
  /**
   * Subscribe to user's conversations.
   */
  subscribeToConversations<T extends object>(callback: (event: RealtimeResponseEvent<T>) => void) {
    return client.subscribe<T>(
      `databases.${DATABASE_IDS.CHAT}.collections.${CHAT_TABLES.CONVERSATIONS}.documents`,
      callback
    );
  }

  /**
   * Subscribe to messages within a conversation.
   */
  subscribeToMessages<T extends { conversationId: string }>(conversationId: string, callback: (event: RealtimeResponseEvent<T>) => void) {
    return client.subscribe<T>(
      `databases.${DATABASE_IDS.CHAT}.collections.${CHAT_TABLES.MESSAGES}.documents`,
      (response) => {
        if (response.payload.conversationId === conversationId) {
          callback(response);
        }
      }
    );
  }

  /**
   * Subscribe to typing indicators for a conversation.
   */
  subscribeToTyping<T extends { conversationId: string }>(conversationId: string, callback: (event: RealtimeResponseEvent<T>) => void) {
    return client.subscribe<T>(
      `databases.${DATABASE_IDS.CHAT}.collections.${CHAT_TABLES.TYPING_INDICATORS}.documents`,
      (response) => {
        if (response.payload.conversationId === conversationId) {
          callback(response);
        }
      }
    );
  }
}

export const realtimeService = new RealtimeService();
