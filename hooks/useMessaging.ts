/**
 * Messaging Hooks
 * React hooks for messaging functionality
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { chatService, realtimeService } from '@/lib/appwrite';
import { MessagesContentType } from '@/types/appwrite-enums';
import type { Conversations, Messages } from '@/types/appwrite-models';

export type Conversation = Conversations;
export type ChatMessage = Messages;

export interface TypingIndicator {
  isTyping: boolean;
  userId: string;
  conversationId: string;
}

export function useConversations(userId: string, options?: { userName?: string }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const displayName = useMemo(() => options?.userName || 'You', [options]);
  
  // Self conversation logic might need adjustment based on how backend handles it
  // For now, we'll keep the UI logic but ensure types match
  const selfConversation = useMemo(() => {
    if (!userId) return null;
    return {
      $id: `self-${userId}`,
      name: `${displayName} (You)`,
      participantIds: [userId],
      lastMessageText: 'Private notes with yourself',
      // Add required fields with defaults to satisfy type
      type: 'direct',
      creatorId: userId,
      adminIds: [userId],
      moderatorIds: [],
      participantCount: 1,
      maxParticipants: 1,
      isEncrypted: true,
      encryptionVersion: '1',
      isPinned: [],
      isMuted: [],
      isArchived: [],
      lastMessageId: null,
      lastMessageAt: new Date().toISOString(),
      lastMessageSenderId: userId,
      unreadCount: '0',
      settings: null,
      isPublic: false,
      inviteLink: null,
      inviteLinkExpiry: null,
      category: null,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      $collectionId: 'conversations',
      $databaseId: 'chat',
      $createdAt: new Date().toISOString(),
      $updatedAt: new Date().toISOString(),
      $permissions: []
    } as unknown as Conversation;
  }, [displayName, userId]);

  const ensureSelfConversation = useCallback(
    (list: Conversation[]) => {
      if (!selfConversation) return list;
      const filtered = list.filter((conv) => conv.$id !== selfConversation.$id);
      return [selfConversation, ...filtered];
    },
    [selfConversation]
  );

  const loadConversations = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      const convs = await chatService.getConversations();
      setConversations(ensureSelfConversation(convs));
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to load conversations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, ensureSelfConversation]);

  useEffect(() => {
    loadConversations();

    // Subscribe to real-time updates
    const unsubscribe = realtimeService.subscribeToConversations<Conversation>((event) => {
      const conversation = event.payload;

      if (event.events.includes('databases.*.collections.*.documents.*.create')) {
        setConversations(prev => ensureSelfConversation([conversation, ...prev.filter((c) => c.$id !== conversation.$id)]));
      } else if (event.events.includes('databases.*.collections.*.documents.*.update')) {
        setConversations(prev =>
          ensureSelfConversation(prev.map(c => c.$id === conversation.$id ? conversation : c))
        );
      } else if (event.events.includes('databases.*.collections.*.documents.*.delete')) {
        setConversations(prev => ensureSelfConversation(prev.filter(c => c.$id !== conversation.$id)));
      }
    });

    return () => {
      unsubscribe();
    };
  }, [loadConversations, ensureSelfConversation]);

  const createConversation = useCallback(async (participantIds: string[], name?: string) => {
    try {
      const newConv = await chatService.createConversation(participantIds, undefined, name);
      setConversations(prev => ensureSelfConversation([newConv, ...prev]));
      return newConv;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [ensureSelfConversation]);

  // Pin/Mute not yet implemented in chatService, keeping placeholders or removing
  const pinConversation = useCallback(async (conversationId: string, userId: string) => {
    // TODO: Implement in chatService
    console.warn('pinConversation not implemented');
  }, []);

  const muteConversation = useCallback(async (conversationId: string, userId: string) => {
    // TODO: Implement in chatService
    console.warn('muteConversation not implemented');
  }, []);

  return {
    conversations,
    isLoading,
    error,
    loadConversations,
    createConversation,
    pinConversation,
    muteConversation,
  };
}

export function useMessages(conversationId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadMessages = useCallback(async () => {
    if (!conversationId) return;
    
    try {
      setIsLoading(true);
      const msgs = await chatService.getMessages(conversationId);
      setMessages(msgs); // chatService already reverses them to be chronological if needed, or we check UI needs
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to load messages:', err);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    loadMessages();

    // Subscribe to real-time message updates
    const unsubscribe = realtimeService.subscribeToMessages<ChatMessage>(conversationId, (event) => {
      const message = event.payload;
      
      // We need to decrypt real-time messages too!
      // This is tricky because the payload comes encrypted.
      // We might need to handle decryption here or in the service.
      // For now, let's just reload messages on new message to ensure decryption happens via service.
      // Or better, manually decrypt here if we had access to securityService.
      
      if (event.events.includes('databases.*.collections.*.documents.*.create')) {
         // Reloading is safer for now to ensure decryption
         loadMessages();
      } else if (event.events.includes('databases.*.collections.*.documents.*.update')) {
         loadMessages();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [conversationId, loadMessages]);

  type SendMessagePayload = {
    content: string;
    type?: MessagesContentType;
    replyToId?: string;
    metadata?: Record<string, unknown> | string;
  };

  const sendMessage = useCallback(async (payload: SendMessagePayload) => {
    if (!conversationId) {
      throw new Error('Conversation ID is required to send a message.');
    }

    try {
      const metadataString = typeof payload.metadata === 'string'
        ? payload.metadata
        : payload.metadata
          ? JSON.stringify(payload.metadata)
          : undefined;

      const newMsg = await chatService.sendMessage(
        conversationId,
        payload.content,
        payload.type ?? MessagesContentType.TEXT,
        payload.replyToId,
        metadataString
      );
      return newMsg;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [conversationId]);

  const addReaction = useCallback(async () => {
    // TODO: Implement in chatService
    console.warn('addReaction not implemented');
  }, []);

  const markAsRead = useCallback(async () => {
    // TODO: Implement in chatService
    console.warn('markAsRead not implemented');
  }, []);

  return {
    messages,
    isLoading,
    error,
    loadMessages,
    sendMessage,
    addReaction,
    markAsRead,
  };
}

export function useTypingIndicator(conversationId: string, userId: string) {
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = realtimeService.subscribeToTyping<TypingIndicator>(conversationId, (event) => {
      const indicator = event.payload;
      
      if (indicator.isTyping && indicator.userId !== userId) {
        setTypingUsers(prev => 
          prev.includes(indicator.userId) ? prev : [...prev, indicator.userId]
        );
      } else {
        setTypingUsers(prev => prev.filter(id => id !== indicator.userId));
      }
    });

    return () => {
      unsubscribe();
    };
  }, [conversationId, userId]);

  return typingUsers;
}
