import { client } from '../config/client';
import { DATABASE_IDS, CHAT_TABLES } from '../config/constants';

export class RealtimeService {
  /**
   * Subscribe to user's conversations.
   */
  subscribeToConversations(callback: (event: any) => void) {
    return client.subscribe(
      `databases.${DATABASE_IDS.CHAT}.collections.${CHAT_TABLES.CONVERSATIONS}.documents`,
      callback
    );
  }

  /**
   * Subscribe to messages within a conversation.
   */
  subscribeToMessages(conversationId: string, callback: (event: any) => void) {
    return client.subscribe(
      `databases.${DATABASE_IDS.CHAT}.collections.${CHAT_TABLES.MESSAGES}.documents`,
      (response) => {
        const message = response.payload as any;
        if (message.conversationId === conversationId) {
          callback(response);
        }
      }
    );
  }

  /**
   * Subscribe to typing indicators for a conversation.
   */
  subscribeToTyping(conversationId: string, callback: (event: any) => void) {
    return client.subscribe(
      `databases.${DATABASE_IDS.CHAT}.collections.${CHAT_TABLES.TYPING_INDICATORS}.documents`,
      (response) => {
        const indicator = response.payload as any;
        if (indicator.conversationId === conversationId) {
          callback(response);
        }
      }
    );
  }
}

export const realtimeService = new RealtimeService();
