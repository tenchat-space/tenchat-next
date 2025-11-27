
import { ID, Query, Permission, Role } from 'appwrite';
import { tablesDB, account } from '../config/client';
import { securityService } from '@/lib/security';
import { 
    MessagesContentType,
    MessagesStatus,
    ConversationsType
} from '@/types/appwrite-enums';
import type { 
    Messages, 
    Conversations 
} from '@/types/appwrite-models';

const DATABASE_ID = 'chat'; // From appwrite.config.json
const TABLES = {
    MESSAGES: 'messages',
    CONVERSATIONS: 'conversations',
    PARTICIPANTS: 'participants' // Assuming this exists or is handled via array in conversations
};

export class ChatService {
    
    /**
     * Send a secure, encrypted message.
     */
    async sendMessage(
        conversationId: string, 
        content: string, 
        type: MessagesContentType = MessagesContentType.TEXT,
        replyToId?: string,
        metadata?: string
    ): Promise<Messages> {
        const user = await account.get();
        
        // 1. Encrypt content
        const { cipherText, iv } = await securityService.encrypt(content);
        
        // 2. Prepare payload
        // We store the IV with the content, e.g., "iv:cipherText" or use a separate metadata field if available.
        // Since the schema has 'metadata' field, we could use that, but 'content' is the main payload.
        // Let's prepend IV to content for simplicity: "IV|CIPHERTEXT"
        const encryptedPayload = `${iv}|${cipherText}`;

        const messageData: Partial<Messages> = {
            conversationId,
            senderId: user.$id,
            content: encryptedPayload,
            contentType: type,
            status: MessagesStatus.SENT,
            metadata: metadata ?? null,
            createdAt: new Date().toISOString(),
            mediaUrls: [],
            mediaFileIds: [],
            mentions: [],
            links: [],
            readBy: [user.$id],
            deliveredTo: [user.$id],
            deletedFor: [],
            replyToMessageId: replyToId
        };

        // 3. Save to TableDB
        const result = await tablesDB.createRow({
            databaseId: DATABASE_ID,
            tableId: TABLES.MESSAGES,
            rowId: ID.unique(),
            data: messageData
        });

        // 4. Update conversation last message
        await this.updateConversationLastMessage(conversationId, "Encrypted Message", user.$id);

        return result as unknown as Messages;
    }

    /**
     * Get messages for a conversation and decrypt them.
     */
    async getMessages(conversationId: string, limit = 50, offset = 0): Promise<Messages[]> {
        const result = await tablesDB.listRows({
            databaseId: DATABASE_ID,
            tableId: TABLES.MESSAGES,
            queries: [
                Query.equal('conversationId', conversationId),
                Query.orderDesc('createdAt'),
                Query.limit(limit),
                Query.offset(offset)
            ]
        });

        const messages = (result as unknown as { rows: Messages[] }).rows;

        // Decrypt all messages
        const decryptedMessages = await Promise.all(messages.map(async (msg) => {
            try {
                if (msg.content && msg.content.includes('|')) {
                    const [iv, cipherText] = msg.content.split('|');
                    const decryptedContent = await securityService.decrypt(cipherText, iv);
                    return { ...msg, content: decryptedContent };
                }
                return msg;
            } catch (e) {
                console.error(`Failed to decrypt message ${msg.$id}`, e);
                return { ...msg, content: '[Decryption Error]' };
            }
        }));

        return decryptedMessages.reverse(); // Return in chronological order
    }

    /**
     * Create a new conversation (Direct or Group).
     */
    async createConversation(
        participantIds: string[], 
        type: ConversationsType = ConversationsType.DIRECT,
        name?: string,
        options?: {
            description?: string;
            isPublic?: boolean;
            avatarUrl?: string;
        }
    ): Promise<Conversations> {
        const user = await account.get();
        const allParticipants = [...new Set([...participantIds, user.$id])];

        // Check if direct conversation already exists
        if (type === ConversationsType.DIRECT && participantIds.length === 1) {
             const existing = await this.getDirectConversation(user.$id, participantIds[0]);
             if (existing) return existing;
        }

        const conversationData: Partial<Conversations> = {
            type,
            name,
            creatorId: user.$id,
            participantIds: allParticipants,
            adminIds: [user.$id],
            participantCount: allParticipants.length,
            isEncrypted: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            tags: [],
            isPinned: [],
            isMuted: [],
            isArchived: [],
            description: options?.description,
            isPublic: options?.isPublic ?? false,
            avatarUrl: options?.avatarUrl
        };

        const result = await tablesDB.createRow({
            databaseId: DATABASE_ID,
            tableId: TABLES.CONVERSATIONS,
            rowId: ID.unique(),
            data: conversationData,
            permissions: [
                Permission.read(Role.users()),
                Permission.write(Role.users())
            ]
        });

        return result as unknown as Conversations;
    }

    /**
     * Helper to find existing direct conversation
     */
    async getDirectConversation(userId1: string, userId2: string): Promise<Conversations | null> {
        try {
            const result = await tablesDB.listRows({
                databaseId: DATABASE_ID,
                tableId: TABLES.CONVERSATIONS,
                queries: [
                    Query.equal('type', ConversationsType.DIRECT),
                    Query.search('participantIds', userId2),
                    Query.limit(100)
                ]
            });
            
            const rows = (result as unknown as { rows: Conversations[] }).rows;
            return rows.find(conv => 
                conv.participantIds.includes(userId1) && 
                conv.participantIds.includes(userId2) && 
                conv.participantIds.length === 2
            ) || null;
        } catch (e) {
            console.error('Error finding direct conversation:', e);
            return null;
        }
    }

    /**
     * Get or create a direct conversation between two users
     */
    async getOrCreateDirectConversation(userId1: string, userId2: string): Promise<Conversations> {
        const existing = await this.getDirectConversation(userId1, userId2);
        if (existing) return existing;
        return this.createConversation([userId2], ConversationsType.DIRECT);
    }

    async sendGift(
        conversationId: string,
        senderId: string,
        giftType: string,
        amount: number,
        token?: string,
        message?: string
    ): Promise<Messages> {
        const metadata = JSON.stringify({
            giftType,
            amount,
            token: token || 'ETH',
            timestamp: Date.now(),
        });
        
        return await this.sendMessage(
            conversationId,
            message || `Sent a ${giftType} gift`,
            MessagesContentType.TOKEN_GIFT,
            undefined,
            metadata
        );
    }

    async sendCryptoTransaction(
        conversationId: string,
        senderId: string,
        txHash: string,
        amount: string,
        token: string,
        chain: string
    ): Promise<Messages> {
        const metadata = JSON.stringify({
            txHash,
            amount,
            token,
            chain,
            timestamp: Date.now(),
        });

        return await this.sendMessage(
            conversationId,
            `Sent ${amount} ${token}`,
            MessagesContentType.CRYPTO_TX,
            undefined,
            metadata
        );
    }

    async togglePin(conversationId: string, userId: string): Promise<boolean> {
        try {
            // 1. Get conversation
            const conversation = await tablesDB.getRow({
                databaseId: DATABASE_ID,
                tableId: TABLES.CONVERSATIONS,
                rowId: conversationId
            }) as unknown as Conversations;

            if (!conversation) return false;

            // 2. Toggle user ID in isPinned array
            let isPinned = conversation.isPinned || [];
            if (isPinned.includes(userId)) {
                isPinned = isPinned.filter(id => id !== userId);
            } else {
                isPinned.push(userId);
            }

            // 3. Update
            await tablesDB.updateRow({
                databaseId: DATABASE_ID,
                tableId: TABLES.CONVERSATIONS,
                rowId: conversationId,
                data: { isPinned }
            });

            return true;
        } catch (error) {
            console.error('Error toggling pin:', error);
            return false;
        }
    }

    async toggleMute(conversationId: string, userId: string): Promise<boolean> {
        try {
            const conversation = await tablesDB.getRow({
                databaseId: DATABASE_ID,
                tableId: TABLES.CONVERSATIONS,
                rowId: conversationId
            }) as unknown as Conversations;

            if (!conversation) return false;

            let isMuted = conversation.isMuted || [];
            if (isMuted.includes(userId)) {
                isMuted = isMuted.filter(id => id !== userId);
            } else {
                isMuted.push(userId);
            }

            await tablesDB.updateRow({
                databaseId: DATABASE_ID,
                tableId: TABLES.CONVERSATIONS,
                rowId: conversationId,
                data: { isMuted }
            });

            return true;
        } catch (error) {
            console.error('Error toggling mute:', error);
            return false;
        }
    }

    async addReaction(
        _messageId: string,
        _userId: string,
        _emoji: string
    ): Promise<boolean> {
        console.warn('ChatService: addReaction not implemented. Proposal for REACTIONS table created.');
        return false;
    }

    async markAsRead(conversationId: string, userId: string): Promise<boolean> {
        // Optimistic implementation: we should ideally update all unread messages
        // But for performance, we might just want to update a "lastReadAt" on a relation table.
        // Since we don't have a relation table in CHAT_TABLES, we'll try to update the 'readBy' of the last 20 messages.
        try {
            const result = await tablesDB.listRows({
                databaseId: DATABASE_ID,
                tableId: TABLES.MESSAGES,
                queries: [
                    Query.equal('conversationId', conversationId),
                    Query.orderDesc('createdAt'),
                    Query.limit(20)
                ]
            });
            
            const messages = (result as unknown as { rows: Messages[] }).rows;
            const unreadMessages = messages.filter(msg => !msg.readBy?.includes(userId));

            await Promise.all(unreadMessages.map(msg => {
                const readBy = [...(msg.readBy || []), userId];
                return tablesDB.updateRow({
                    databaseId: DATABASE_ID,
                    tableId: TABLES.MESSAGES,
                    rowId: msg.$id,
                    data: { readBy }
                });
            }));

            return true;
        } catch (error) {
            console.error('Error marking as read:', error);
            return false;
        }
    }


    /**
     * Get user's conversations.
     */
    async getConversations(): Promise<Conversations[]> {
        const user = await account.get();
        
        const result = await tablesDB.listRows(
            DATABASE_ID,
            TABLES.CONVERSATIONS,
            [
                Query.contains('participantIds', [user.$id]),
                Query.orderDesc('updatedAt')
            ]
        );

        return (result as unknown as { rows: Conversations[] }).rows;
    }

    private async updateConversationLastMessage(conversationId: string, text: string, senderId: string) {
        try {
            await tablesDB.updateRow(
                DATABASE_ID,
                TABLES.CONVERSATIONS,
                conversationId,
                {
                    lastMessageText: text, // We might want to encrypt this too or leave generic
                    lastMessageAt: new Date().toISOString(),
                    lastMessageSenderId: senderId,
                    updatedAt: new Date().toISOString()
                }
            );
        } catch (e) {
            console.error('Failed to update conversation last message', e);
        }
    }
}

export const chatService = new ChatService();
