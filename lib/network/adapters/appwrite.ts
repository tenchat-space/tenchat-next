
import { BackendAdapter, BackendType, ConnectionStatus, NetworkMessage } from '../types';
import { client, account } from '@/lib/appwrite/config/client';

export class AppwriteAdapter implements BackendAdapter {
  type: BackendType = 'appwrite';
  name = 'TenChat Cloud (Appwrite)';
  private status: ConnectionStatus = 'disconnected';
  private realtimeUnsubscribe: (() => void) | null = null;
  private messageCallback: ((message: NetworkMessage) => void) | null = null;

  async connect(): Promise<void> {
    this.status = 'connecting';
    try {
      // Check session
      await account.get();
      this.status = 'connected';
      
      // Subscribe to realtime channels
      // In a real app, we'd subscribe to `databases.${DB_ID}.collections.${MESSAGES_ID}.documents`
      this.realtimeUnsubscribe = client.subscribe('documents', (response) => {
        if (response.events.includes('databases.*.collections.*.documents.*.create')) {
           const payload = response.payload as Record<string, unknown>;
           // Transform payload to NetworkMessage
           const msg: NetworkMessage = {
             id: payload.$id as string,
             type: (payload.type as 'chat' | 'system') || 'chat',
             senderId: payload.senderId as string,
             recipientId: payload.recipientId as string,
             content: payload.content as string,
             timestamp: new Date(payload.$createdAt as string).getTime(),
             signature: (payload.signature as string) || '',
             metadata: payload.metadata as Record<string, unknown>
           };
           
           if (this.messageCallback) {
             this.messageCallback(msg);
           }
        }
      });

    } catch (e) {
      this.status = 'error';
      throw e;
    }
  }

  async disconnect(): Promise<void> {
    if (this.realtimeUnsubscribe) {
      this.realtimeUnsubscribe();
      this.realtimeUnsubscribe = null;
    }
    this.status = 'disconnected';
  }

  getStatus(): ConnectionStatus {
    return this.status;
  }

  async sendMessage(message: NetworkMessage): Promise<void> {
    // In a real implementation, we would write to the Appwrite database
    // await databases.createDocument(DB_ID, MESSAGES_COLLECTION_ID, ID.unique(), message);
    console.log('[AppwriteAdapter] Sending message to cloud:', message.id);
  }

  onMessage(callback: (message: NetworkMessage) => void): () => void {
    this.messageCallback = callback;
    return () => {
      this.messageCallback = null;
    };
  }

  async authenticate(): Promise<unknown> {
    return await account.get();
  }
}
