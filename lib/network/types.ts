
export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';

export type BackendType = 'appwrite' | 'p2p' | 'custom';

export interface NetworkMessage {
  id: string;
  type: 'chat' | 'system' | 'ack' | 'handshake';
  senderId: string;
  recipientId: string;
  content: string; // Encrypted payload
  timestamp: number;
  signature: string;
  metadata?: Record<string, unknown>;
  // Routing headers
  ttl?: number; // Time to live (hops)
  path?: string[]; // Path taken
}

export interface Peer {
  id: string;
  address: string; // IP, Multiaddr, or Relay ID
  publicKey: string;
  lastSeen: number;
  status: 'active' | 'inactive';
}

export interface BackendAdapter {
  type: BackendType;
  name: string;
  
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getStatus(): ConnectionStatus;
  
  // Messaging
  sendMessage(message: NetworkMessage): Promise<void>;
  onMessage(callback: (message: NetworkMessage) => void): () => void;
  
  // Identity/Auth
  authenticate(): Promise<unknown>;
  
  // Discovery (for P2P)
  findPeers?(): Promise<Peer[]>;
}

export interface NetworkConfig {
  preferredBackend: BackendType;
  fallbackEnabled: boolean;
  p2p: {
    enabled: boolean;
    bootstrapNodes: string[];
  };
  customBackends: {
    url: string;
    apiKey?: string;
  }[];
}
