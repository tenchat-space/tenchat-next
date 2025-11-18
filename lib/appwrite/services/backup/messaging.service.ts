/**
 * Messaging Service
 * Handles conversations and messages
 */

import { ID, Query } from 'appwrite';
import { tablesDB } from '../config/client';
import { DATABASE_IDS, MAIN_COLLECTIONS } from '../config/constants';
import type { Conversations, Messages } from '@/types/appwrite.d';

export class MessagingService {
  private readonly databaseId = DATABASE_IDS.MAIN;
  private readonly conversationsTable = MAIN_COLLECTIONS.CONVERSATIONS;
  private readonly messagesTable = MAIN_COLLECTIONS.MESSAGES;

  async createConversation(data: Partial<Conversations>): Promise<Conversations> {
    return await tablesDB.createRow({
      databaseId: this.databaseId,
      tableId: this.conversationsTable,
      rowId: ID.unique(),
      data: {
        ...data,
        participantCount: data.participantIds?.length || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    }) as Conversations;
  }

  async getConversation(conversationId: string): Promise<Conversations | null> {
    try {
      return await tablesDB.getRow({
        databaseId: this.databaseId,
        tableId: this.conversationsTable,
        rowId: conversationId
      }) as Conversations;
    } catch (error) {
      console.error('Error getting conversation:', error);
      return null;
    }
  }

  async getUserConversations(userId: string, limit = 50): Promise<Conversations[]> {
    try {
      const response = await tablesDB.listRows({
        databaseId: this.databaseId,
        tableId: this.conversationsTable,
        queries: [
          Query.search('participantIds', userId),
          Query.orderDesc('lastMessageAt'),
          Query.limit(limit),
        ]
      });
      return response.rows as Conversations[];
    } catch (error) {
      console.error('Error getting user conversations:', error);
      return [];
    }
  }

  async updateConversation(conversationId: string, data: Partial<Conversations>): Promise<Conversations> {
    return await tablesDB.updateRow({
      databaseId: this.databaseId,
      tableId: this.conversationsTable,
      rowId: conversationId,
      data: {
        ...data,
        updatedAt: new Date().toISOString(),
      }
    }) as Conversations;
  }

  async sendMessage(data: Partial<Messages>): Promise<Messages> {
    const message = await tablesDB.createRow({
      databaseId: this.databaseId,
      tableId: this.messagesTable,
      rowId: ID.unique(),
      data: {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    }) as Messages;

    if (data.conversationId) {
      await this.updateConversation(data.conversationId, {
        lastMessageId: message.$id,
        lastMessageText: data.plainText || '',
        lastMessageAt: message.createdAt,
        lastMessageSenderId: data.senderId,
      });
    }

    return message;
  }

  async getMessages(conversationId: string, limit = 50, offset = 0): Promise<Messages[]> {
    try {
      const response = await tablesDB.listRows({
        databaseId: this.databaseId,
        tableId: this.messagesTable,
        queries: [
          Query.equal('conversationId', conversationId),
          Query.orderDesc('createdAt'),
          Query.limit(limit),
          Query.offset(offset),
        ]
      });
      return response.rows as Messages[];
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  }

  async updateMessageStatus(messageId: string, status: string, userId?: string): Promise<Messages> {
    const message = await tablesDB.getRow({
      databaseId: this.databaseId,
      tableId: this.messagesTable,
      rowId: messageId
    }) as Messages;

    const updates: any = { status };

    if (userId) {
      if (status === 'read') {
        updates.readBy = [...(message.readBy || []), userId];
      } else if (status === 'delivered') {
        updates.deliveredTo = [...(message.deliveredTo || []), userId];
      }
    }

    return await tablesDB.updateRow({
      databaseId: this.databaseId,
      tableId: this.messagesTable,
      rowId: messageId,
      data: updates
    }) as Messages;
  }

  async deleteMessage(messageId: string, userId: string): Promise<Messages> {
    const message = await tablesDB.getRow({
      databaseId: this.databaseId,
      tableId: this.messagesTable,
      rowId: messageId
    }) as Messages;

    return await tablesDB.updateRow({
      databaseId: this.databaseId,
      tableId: this.messagesTable,
      rowId: messageId,
      data: {
        deletedFor: [...(message.deletedFor || []), userId],
        deletedAt: new Date().toISOString(),
      }
    }) as Messages;
  }

  async addReaction(messageId: string, userId: string, emoji: string): Promise<Messages> {
    const message = await tablesDB.getRow({
      databaseId: this.databaseId,
      tableId: this.messagesTable,
      rowId: messageId
    }) as Messages;

    const reactions = message.reactions ? JSON.parse(message.reactions) : {};
    if (!reactions[emoji]) reactions[emoji] = [];
    if (!reactions[emoji].includes(userId)) reactions[emoji].push(userId);

    return await tablesDB.updateRow({
      databaseId: this.databaseId,
      tableId: this.messagesTable,
      rowId: messageId,
      data: { reactions: JSON.stringify(reactions) }
    }) as Messages;
  }

  async togglePin(conversationId: string, userId: string): Promise<Conversations> {
    const conversation = await this.getConversation(conversationId);
    if (!conversation) throw new Error('Conversation not found');

    const isPinned = conversation.isPinned || [];
    const newIsPinned = isPinned.includes(userId)
      ? isPinned.filter(id => id !== userId)
      : [...isPinned, userId];

    return await this.updateConversation(conversationId, { isPinned: newIsPinned });
  }

  async toggleMute(conversationId: string, userId: string): Promise<Conversations> {
    const conversation = await this.getConversation(conversationId);
    if (!conversation) throw new Error('Conversation not found');

    const isMuted = conversation.isMuted || [];
    const newIsMuted = isMuted.includes(userId)
      ? isMuted.filter(id => id !== userId)
      : [...isMuted, userId];

    return await this.updateConversation(conversationId, { isMuted: newIsMuted });
  }

  async markAsRead(conversationId: string, userId: string): Promise<Conversations> {
    const conversation = await this.getConversation(conversationId);
    if (!conversation) throw new Error('Conversation not found');

    const unreadCount = conversation.unreadCount ? JSON.parse(conversation.unreadCount) : {};
    unreadCount[userId] = 0;

    return await this.updateConversation(conversationId, {
      unreadCount: JSON.stringify(unreadCount),
    });
  }

  async searchMessages(conversationId: string, query: string, limit = 20): Promise<Messages[]> {
    try {
      const response = await tablesDB.listRows({
        databaseId: this.databaseId,
        tableId: this.messagesTable,
        queries: [
          Query.equal('conversationId', conversationId),
          Query.search('plainText', query),
          Query.limit(limit),
        ]
      });
      return response.rows as Messages[];
    } catch (error) {
      console.error('Error searching messages:', error);
      return [];
    }
  }
}

export const messagingService = new MessagingService();
