// @generated tenchat-tool: messaging-service@1.0.0 hash: initial DO NOT EDIT DIRECTLY
// Messaging service with E2EE and real-time capabilities

import type {
  IMessagingService,
  DecryptedMessage,
  EncryptedMessage,
  Conversation,
  SessionState,
  ConversationSettings
} from '../types';
import { CryptoService } from './crypto.service';
import { KeyManagementService } from './key-management.service';

export class MessagingService implements IMessagingService {
  private conversations: Map<string, Conversation> = new Map();
  private messages: Map<string, EncryptedMessage[]> = new Map();
  private eventListeners: Map<string, Function[]> = new Map();
  private cryptoService: CryptoService;
  private keyManagementService: KeyManagementService;

  constructor(cryptoService?: CryptoService, keyManagementService?: KeyManagementService) {
    try {
      this.cryptoService = cryptoService || new CryptoService();
      this.keyManagementService = keyManagementService || new KeyManagementService(this.cryptoService);
      this.loadPersistedData();
    } catch (error) {
      console.error('MessagingService constructor failed:', error);
      // Provide stub services to prevent errors
      this.cryptoService = this.cryptoService || ({
        encryptMessage: async () => ({ ciphertext: '', nonce: '' }),
        decryptMessage: async () => '',
        advanceChain: async () => ({ messageKey: '', newChainState: { chainKey: '', messageNumber: 0 } }),
        generateRandomBytes: () => 'stub-data',
        initializeSession: async () => ({ sendingChain: { chainKey: '', messageNumber: 0 }, receivingChains: new Map(), rootKey: '', sessionId: 'stub' })
      } as any);
      this.keyManagementService = this.keyManagementService || ({
        getSessionState: async () => null,
        updateSessionState: async () => {}
      } as any);
    }
  }

  async sendMessage(message: DecryptedMessage): Promise<void> {
    try {
      // Get or create session state with recipient
      let sessionState = await this.keyManagementService.getSessionState(message.recipientId);
      
      if (!sessionState) {
        // Initialize new session using X3DH
        sessionState = await this.initializeSession(message.recipientId);
        await this.keyManagementService.updateSessionState(message.recipientId, sessionState);
      }

      // Advance sending chain and get message key
      const { messageKey, newChainState } = await this.cryptoService.advanceChain(sessionState.sendingChain);
      sessionState.sendingChain = newChainState;

      // Encrypt message content
      const { ciphertext, nonce } = await this.cryptoService.encryptMessage(
        JSON.stringify({
          content: message.content,
          type: message.type,
          metadata: message.metadata
        }),
        messageKey
      );

      // Create JSON envelope: {v: version, c: ciphertext, iv: nonce}
      const envelope = JSON.stringify({
        v: 1,
        c: ciphertext,
        iv: nonce
      });

      // Create encrypted message
      const encryptedMessage: EncryptedMessage = {
        id: message.id,
        senderId: message.senderId,
        recipientId: message.recipientId,
        ciphertext: envelope,
        nonce,
        timestamp: message.timestamp,
        ratchetHeader: JSON.stringify({
          sessionId: sessionState.sessionId,
          messageNumber: sessionState.sendingChain.messageNumber - 1
        }),
        messageNumber: sessionState.sendingChain.messageNumber - 1
      };

      // Store encrypted message
      this.storeMessage(encryptedMessage);

      // Update session state
      await this.keyManagementService.updateSessionState(message.recipientId, sessionState);

      // Emit event for real-time updates
      this.emit('message:sent', encryptedMessage);

      // TODO(ai): Send to backend/relay server
      console.log('Message sent:', encryptedMessage.id);

    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  async getMessages(conversationId: string, limit: number = 50): Promise<EncryptedMessage[]> {
    const messages = this.messages.get(conversationId) || [];
    return messages.slice(-limit).reverse(); // Return most recent messages first
  }

  async createConversation(participants: string[]): Promise<Conversation> {
    const conversationId = typeof crypto !== 'undefined' && crypto.randomUUID ? 
      crypto.randomUUID() : 
      `conv-${Date.now()}-${Math.random()}`;
    const now = new Date();

    const conversation: Conversation = {
      id: conversationId,
      participants,
      type: participants.length === 2 ? 'direct' : 'group',
      metadata: {
        settings: {
          ephemeralEnabled: false,
          notificationsEnabled: true,
          blockchainAnchoringEnabled: false
        }
      },
      createdAt: now,
      updatedAt: now
    };

    this.conversations.set(conversationId, conversation);
    this.messages.set(conversationId, []);
    this.persistData();

    this.emit('conversation:created', conversation);
    return conversation;
  }

  async getConversations(): Promise<Conversation[]> {
    return Array.from(this.conversations.values()).sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
    );
  }

  async markAsRead(conversationId: string, messageId: string): Promise<void> {
    // TODO(ai): Implement read receipt logic
    this.emit('message:read', { conversationId, messageId });
  }

  async getSessionFingerprint(participantId: string): Promise<string | null> {
    try {
      const sessionState = await this.keyManagementService.getSessionState(participantId);
      if (!sessionState) {
        return null;
      }

      const rootKeyBytes = new Uint8Array(
        sessionState.rootKey.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
      );
      
      const hash = await crypto.subtle.digest('SHA-256', rootKeyBytes);
      const hashArray = Array.from(new Uint8Array(hash));
      const fingerprint = hashArray
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
        .slice(0, 16)
        .toUpperCase()
        .match(/.{1,4}/g)
        ?.join(' ') || '';
      
      return fingerprint;
    } catch (error) {
      console.error('Failed to generate session fingerprint:', error);
      return null;
    }
  }

  /**
   * Decrypt received message
   */
  async decryptMessage(encryptedMessage: EncryptedMessage): Promise<DecryptedMessage> {
    try {
      // Get session state
      const sessionState = await this.keyManagementService.getSessionState(encryptedMessage.senderId);
      
      if (!sessionState) {
        throw new Error('No session state found for sender');
      }

      // Parse ratchet header
      const ratchetHeader = JSON.parse(encryptedMessage.ratchetHeader);
      
      // Get or create receiving chain
      let receivingChain = sessionState.receivingChains.get(ratchetHeader.sessionId);
      
      if (!receivingChain) {
        receivingChain = {
          chainKey: sessionState.rootKey,
          messageNumber: 0
        };
        sessionState.receivingChains.set(ratchetHeader.sessionId, receivingChain);
      }

      // Advance chain to get message key
      const { messageKey } = await this.cryptoService.advanceChain(receivingChain);

      // Parse envelope (supports both legacy and JSON formats)
      const { ciphertext, nonce } = this.parseMessageEnvelope(encryptedMessage);

      // Decrypt message
      const decryptedContent = await this.cryptoService.decryptMessage(
        ciphertext,
        messageKey,
        nonce
      );

      const messageData = JSON.parse(decryptedContent);

      return {
        id: encryptedMessage.id,
        senderId: encryptedMessage.senderId,
        recipientId: encryptedMessage.recipientId,
        content: messageData.content,
        timestamp: encryptedMessage.timestamp,
        type: messageData.type,
        metadata: messageData.metadata
      };

    } catch (error) {
      console.error('Failed to decrypt message:', error);
      throw error;
    }
  }

  /**
   * Parse message envelope supporting both formats
   * - New format: JSON {v: 1, c: ciphertext, iv: nonce}
   * - Legacy format: direct ciphertext/nonce fields
   */
  private parseMessageEnvelope(message: EncryptedMessage): { ciphertext: string; nonce: string } {
    try {
      const envelope = JSON.parse(message.ciphertext);
      if (envelope.v === 1 && envelope.c && envelope.iv) {
        return { ciphertext: envelope.c, nonce: envelope.iv };
      }
    } catch {
    }
    
    return { ciphertext: message.ciphertext, nonce: message.nonce };
  }

  /**
   * Initialize new session using simplified X3DH protocol
   * MVP: Uses ECDH with recipient's identity key
   * TODO: Implement full X3DH with signed prekey and one-time prekeys
   */
  private async initializeSession(recipientId: string): Promise<SessionState> {
    const recipientIdentity = await this.getRecipientIdentity(recipientId);
    if (!recipientIdentity) {
      throw new Error(`Cannot find identity for recipient ${recipientId}`);
    }

    const sharedSecret = await this.keyManagementService.deriveSharedSecret(
      recipientIdentity.identityKey
    );
    
    return await this.cryptoService.initializeSession(sharedSecret);
  }

  /**
   * Get recipient's identity bundle
   * MVP: Returns mock identity for testing
   * TODO: Fetch from user directory service or DHT
   */
  private async getRecipientIdentity(recipientId: string): Promise<any> {
    const mockIdentities: Record<string, any> = JSON.parse(
      localStorage.getItem('tenchat_mock_identities') || '{}'
    );
    
    if (mockIdentities[recipientId]) {
      return mockIdentities[recipientId];
    }

    const identity = await this.cryptoService.generateIdentity();
    mockIdentities[recipientId] = identity;
    localStorage.setItem('tenchat_mock_identities', JSON.stringify(mockIdentities));
    
    return identity;
  }

  /**
   * Store message in conversation
   */
  private storeMessage(message: EncryptedMessage): void {
    // Determine conversation ID (for direct messages, use sorted participant IDs)
    const conversationId = this.getConversationId(message.senderId, message.recipientId);
    
    if (!this.messages.has(conversationId)) {
      this.messages.set(conversationId, []);
    }

    this.messages.get(conversationId)!.push(message);

    // Update conversation timestamp
    const conversation = this.conversations.get(conversationId);
    if (conversation) {
      conversation.lastMessage = message;
      conversation.updatedAt = message.timestamp;
    }

    this.persistData();
  }

  /**
   * Get conversation ID for direct messages
   */
  private getConversationId(userId1: string, userId2: string): string {
    return [userId1, userId2].sort().join('|');
  }

  /**
   * Event system for real-time updates
   */
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  /**
   * Persist data to localStorage
   */
  private persistData(): void {
    try {
      const data = {
        conversations: Array.from(this.conversations.entries()),
        messages: Array.from(this.messages.entries()),
        timestamp: Date.now()
      };
      localStorage.setItem('whisperr_messaging_data', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to persist messaging data:', error);
    }
  }

  /**
   * Load persisted data from localStorage
   */
  private loadPersistedData(): void {
    try {
      const stored = localStorage.getItem('whisperr_messaging_data');
      if (stored) {
        const data = JSON.parse(stored);
        
        // Restore conversations
        this.conversations = new Map(data.conversations);
        
        // Restore messages
        this.messages = new Map(data.messages);
        
        // Convert timestamp strings back to Date objects
        for (const conversation of this.conversations.values()) {
          conversation.createdAt = new Date(conversation.createdAt);
          conversation.updatedAt = new Date(conversation.updatedAt);
          if (conversation.lastMessage) {
            conversation.lastMessage.timestamp = new Date(conversation.lastMessage.timestamp);
          }
        }

        for (const messageList of this.messages.values()) {
          messageList.forEach(msg => {
            msg.timestamp = new Date(msg.timestamp);
          });
        }
      }
    } catch (error) {
      console.error('Failed to load persisted messaging data:', error);
    }
  }

  /**
   * Update conversation settings
   */
  async updateConversationSettings(
    conversationId: string, 
    settings: Partial<ConversationSettings>
  ): Promise<void> {
    const conversation = this.conversations.get(conversationId);
    if (conversation) {
      conversation.metadata.settings = { ...conversation.metadata.settings, ...settings };
      conversation.updatedAt = new Date();
      this.persistData();
      this.emit('conversation:updated', conversation);
    }
  }

  /**
   * Get conversation by ID
   */
  getConversation(conversationId: string): Conversation | undefined {
    return this.conversations.get(conversationId);
  }
}

// Service instance will be created in index.ts to avoid circular dependencies