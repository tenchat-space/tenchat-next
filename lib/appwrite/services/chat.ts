
import { ID, Query, Permission, Role } from 'appwrite';
import { tablesDB, account } from '../config/client';
import { securityService } from '@/lib/security';
import { 
    Messages, 
    Conversations, 
    MessagesContentType, 
    MessagesStatus,
    ConversationsType
} from '@/types/appwrite.d';

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
        replyToId?: string
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

        const messages = result.rows as unknown as Messages[];

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
        if (type === ConversationsType.DIRECT) {
            // This is a simplified check. In a real app, we'd query for existing convs with these exact participants.
            // For now, we'll just create a new one.
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
                Permission.read(Role.users()), // Or specific users
                Permission.write(Role.users())
            ]
        });

        return result as unknown as Conversations;
    }

    /**
     * Get user's conversations.
     */
    async getConversations(): Promise<Conversations[]> {
        const user = await account.get();
        
        const result = await tablesDB.listRows({
            databaseId: DATABASE_ID,
            tableId: TABLES.CONVERSATIONS,
            queries: [
                Query.contains('participantIds', [user.$id]),
                Query.orderDesc('updatedAt')
            ]
        });

        return result.rows as unknown as Conversations[];
    }

    private async updateConversationLastMessage(conversationId: string, text: string, senderId: string) {
        try {
            await tablesDB.updateRow({
                databaseId: DATABASE_ID,
                tableId: TABLES.CONVERSATIONS,
                rowId: conversationId,
                data: {
                    lastMessageText: text, // We might want to encrypt this too or leave generic
                    lastMessageAt: new Date().toISOString(),
                    lastMessageSenderId: senderId,
                    updatedAt: new Date().toISOString()
                }
            });
        } catch (e) {
            console.error('Failed to update conversation last message', e);
        }
    }
}

export const chatService = new ChatService();
