/**
 * Messaging Service
 * Handles conversations and messages in the chat database
 */

import { ID, Query } from 'appwrite';
import { tablesDB } from '../config/client';
import { DATABASE_IDS, CHAT_TABLES } from '../config/constants';
import type { Models } from 'appwrite';

// Extended Conversation interface
export interface Conversation extends Models.Document {
  type: 'direct' | 'group' | 'channel' | 'broadcast' | 'community';
  name?: string | null;
  description?: string | null;
  lastMessageText?: string | null;
  creatorId: string;
  participantIds: string[];
  adminIds: string[];
  lastMessageAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Extended Message interface
export interface Message extends Models.Document {
  conversationId: string;
  senderId: string;
  content: string;
  contentType: string;
  status?: string;
  metadata?: Record<string, any>;
  replyToId?: string;
  createdAt?: string;
}

export class MessagingService {
  private readonly databaseId = DATABASE_IDS.CHAT;
  private readonly conversationsCollection = CHAT_TABLES.CONVERSATIONS;
  private readonly messagesCollection = CHAT_TABLES.MESSAGES;

  /**
   * Create a new conversation
   */
  async createConversation(data: Partial<Conversation>): Promise<Conversation> {
    const result = await tablesDB.createRow({
      databaseId: this.databaseId,
      tableId: this.conversationsCollection,
      rowId: ID.unique(),
      data: {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
    return result as unknown as Conversation;
  }

  /**
   * Get or create a direct conversation between two users
   */
  async getOrCreateDirectConversation(userId1: string, userId2: string): Promise<Conversation> {
    try {
      // Search for existing direct conversation using TablesDB
      const response = await tablesDB.listRows({
        databaseId: this.databaseId,
        tableId: this.conversationsCollection,
        queries: [
          Query.equal('type', 'direct'),
          Query.search('participantIds', userId1),
          Query.limit(100),
        ],
      });

      const rows = (response as any).rows || [];

      // Find conversation with both users
      const existing = rows.find((conv: any) => {
        const participants = conv.participantIds || [];
        return participants.includes(userId1) && participants.includes(userId2) && participants.length === 2;
      });

      if (existing) {
        return existing as Conversation;
      }

      // Create new conversation
      return await this.createConversation({
        type: 'direct',
        creatorId: userId1,
        participantIds: [userId1, userId2],
        adminIds: [userId1, userId2],
      });
    } catch (error) {
      console.error('Error getting or creating conversation:', error);
      throw error;
    }
  }

  /**
   * Get conversation by ID
   */
  async getConversation(conversationId: string): Promise<Conversation | null> {
    try {
      const conversation = await tablesDB.getRow({
        databaseId: this.databaseId,
        tableId: this.conversationsCollection,
        rowId: conversationId,
      });
      return conversation as unknown as Conversation;
    } catch (error) {
      console.error('Error getting conversation:', error);
      return null;
    }
  }

  /**
   * Get all conversations for a user
   */
  async getUserConversations(userId: string, limit = 50): Promise<Conversation[]> {
    try {
      const response = await tablesDB.listRows({
        databaseId: this.databaseId,
        tableId: this.conversationsCollection,
        queries: [
          Query.search('participantIds', userId),
          Query.orderDesc('lastMessageAt'),
          Query.limit(limit),
        ],
      });
      return (response as any).rows as Conversation[];
    } catch (error) {
      console.error('Error getting user conversations:', error);
      return [];
    }
  }

  /**
   * Send a message in a conversation
   */
  async sendMessage(data: Partial<Message>): Promise<Message> {
    const message = await tablesDB.createRow({
      databaseId: this.databaseId,
      tableId: this.messagesCollection,
      rowId: ID.unique(),
      data: {
        ...data,
        status: 'sent',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });

    if (data.conversationId) {
      await tablesDB.updateRow({
        databaseId: this.databaseId,
        tableId: this.conversationsCollection,
        rowId: data.conversationId,
        data: {
          lastMessageText: data.content,
          lastMessageAt: new Date().toISOString(),
        },
      });
    }

    return message as unknown as Message;
  }

  /**
   * Send a gift message
   */
  async sendGift(
    conversationId: string,
    senderId: string,
    giftType: string,
    amount: number,
    token?: string,
    message?: string
  ): Promise<Message> {
    return await this.sendMessage({
      conversationId,
      senderId,
      content: message || `Sent a ${giftType} gift`,
      contentType: 'token_gift',
      metadata: {
        giftType,
        amount,
        token: token || 'ETH',
        timestamp: Date.now(),
      },
    });
  }

  /**
   * Send a crypto transaction message
   */
  async sendCryptoTransaction(
    conversationId: string,
    senderId: string,
    txHash: string,
    amount: string,
    token: string,
    chain: string
  ): Promise<Message> {
    return await this.sendMessage({
      conversationId,
      senderId,
      content: `Sent ${amount} ${token}`,
      contentType: 'crypto_tx',
      metadata: {
        txHash,
        amount,
        token,
        chain,
        timestamp: Date.now(),
      },
    });
  }

  async togglePin(_conversationId: string, _userId: string): Promise<boolean> {
    return true;
  }

  async toggleMute(_conversationId: string, _userId: string): Promise<boolean> {
    return true;
  }

  /**
   * Get messages for a conversation
   */
  async getConversationMessages(conversationId: string, limit = 50, offset = 0): Promise<Message[]> {
    try {
      const response = await tablesDB.listRows({
        databaseId: this.databaseId,
        tableId: this.messagesCollection,
        queries: [
          Query.equal('conversationId', conversationId),
          Query.orderDesc('createdAt'),
          Query.limit(limit),
          Query.offset(offset),
        ],
      });
      return (response as any).rows as Message[];
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  }

  async getMessages(conversationId: string, limit = 50, offset = 0): Promise<Message[]> {
    return this.getConversationMessages(conversationId, limit, offset);
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(conversationId: string): Promise<boolean> {
    try {
      await tablesDB.deleteRow({
        databaseId: this.databaseId,
        tableId: this.conversationsCollection,
        rowId: conversationId,
      });
      return true;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      return false;
    }
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(conversationId: string, userId: string): Promise<boolean> {
    try {
      // This would typically update message read status
      // For now, we'll just return true
      return true;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return false;
    }
  }

  async addReaction(
    _messageId: string,
    _userId: string,
    _emoji: string
  ): Promise<boolean> {
    return true;
  }

  async markAsRead(_conversationId: string, _userId: string): Promise<boolean> {
    return true;
  }
}

export const messagingService = new MessagingService();
