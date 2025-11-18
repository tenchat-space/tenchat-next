/**
 * Messaging Hooks
 * React hooks for messaging functionality
 */

import { useState, useEffect, useCallback } from 'react';
import { messagingService, realtimeService } from '@/lib/appwrite';

export interface Conversation {
  $id: string;
  name?: string | null;
  participantIds?: string[];
  lastMessageText?: string | null;
}

export interface ChatMessage {
  $id: string;
  senderId: string;
  content: string;
  conversationId: string;
  contentType?: string;
}

export function useConversations(userId: string) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadConversations = useCallback(async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      const convs = await messagingService.getUserConversations(userId);
      setConversations(convs);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to load conversations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadConversations();

    // Subscribe to real-time updates
    const unsubscribe = realtimeService.subscribeToConversations((event) => {
        const conversation = event.payload as Conversation;
      
      if (event.events.includes('databases.*.collections.*.documents.*.create')) {
        setConversations(prev => [conversation, ...prev]);
      } else if (event.events.includes('databases.*.collections.*.documents.*.update')) {
        setConversations(prev =>
          prev.map(c => c.$id === conversation.$id ? conversation : c)
        );
      } else if (event.events.includes('databases.*.collections.*.documents.*.delete')) {
        setConversations(prev => prev.filter(c => c.$id !== conversation.$id));
      }
    });

    return () => {
      unsubscribe();
    };
  }, [loadConversations]);

  const createConversation = useCallback(async (data: Partial<Conversation>) => {
    try {
      const newConv = await messagingService.createConversation(data);
      setConversations(prev => [newConv, ...prev]);
      return newConv;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  const pinConversation = useCallback(async (conversationId: string, userId: string) => {
    try {
      await messagingService.togglePin(conversationId, userId);
      await loadConversations();
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [loadConversations]);

  const muteConversation = useCallback(async (conversationId: string, userId: string) => {
    try {
      await messagingService.toggleMute(conversationId, userId);
      await loadConversations();
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [loadConversations]);

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
      const msgs = await messagingService.getMessages(conversationId);
      setMessages(msgs.reverse()); // Reverse to show oldest first
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
    const unsubscribe = realtimeService.subscribeToMessages(conversationId, (event) => {
      const message = event.payload as ChatMessage;
      
      if (event.events.includes('databases.*.collections.*.documents.*.create')) {
        setMessages(prev => [...prev, message]);
      } else if (event.events.includes('databases.*.collections.*.documents.*.update')) {
        setMessages(prev =>
          prev.map(m => m.$id === message.$id ? message : m)
        );
      }
    });

    return () => {
      unsubscribe();
    };
  }, [conversationId, loadMessages]);

  const sendMessage = useCallback(async (data: Partial<ChatMessage>) => {
    try {
      const newMsg = await messagingService.sendMessage({
        ...data,
        conversationId,
      });
      // Message will be added via real-time subscription
      return newMsg;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [conversationId]);

  const addReaction = useCallback(async (messageId: string, userId: string, emoji: string) => {
    try {
      await messagingService.addReaction(messageId, userId, emoji);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  const markAsRead = useCallback(async (userId: string) => {
    try {
      await messagingService.markAsRead(conversationId, userId);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [conversationId]);

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
    const unsubscribe = realtimeService.subscribeToTyping(conversationId, (event) => {
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
