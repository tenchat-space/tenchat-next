
import { BackendAdapter, BackendType, ConnectionStatus, NetworkMessage, Peer } from '../types';

export class P2PAdapter implements BackendAdapter {
  type: BackendType = 'p2p';
  name = 'TenChat Mesh (P2P)';
  private status: ConnectionStatus = 'disconnected';
  private peers: Map<string, Peer> = new Map();
  private messageCallback: ((message: NetworkMessage) => void) | null = null;

  async connect(): Promise<void> {
    this.status = 'connecting';
    console.log('[P2P] Initializing mesh network...');
    
    // Simulate bootstrapping
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    this.status = 'connected';
    console.log('[P2P] Connected to mesh. Discovered 0 peers.');
    
    // Start discovery loop
    this.startDiscovery();
  }

  async disconnect(): Promise<void> {
    this.status = 'disconnected';
    this.peers.clear();
  }

  getStatus(): ConnectionStatus {
    return this.status;
  }

  async sendMessage(message: NetworkMessage): Promise<void> {
    if (this.status !== 'connected') throw new Error('P2P not connected');

    // Logic for "jumping" / routing
    // 1. Check if recipient is directly connected
    if (this.peers.has(message.recipientId)) {
      console.log(`[P2P] Sending directly to peer ${message.recipientId}`);
      // In real impl: WebRTC data channel send
    } else {
      // 2. Gossip / Flood / Route
      console.log(`[P2P] Recipient ${message.recipientId} not found directly. Relaying via mesh (TTL: ${message.ttl})`);
      // In real impl: Send to all connected peers with decremented TTL
    }
  }

  onMessage(callback: (message: NetworkMessage) => void): () => void {
    this.messageCallback = callback;
    return () => {
      this.messageCallback = null;
    };
  }

  async authenticate(): Promise<unknown> {
    // P2P auth usually involves signing a challenge with a private key
    return { publicKey: 'mock-pub-key' };
  }

  async findPeers(): Promise<Peer[]> {
    return Array.from(this.peers.values());
  }

  private startDiscovery() {
    // Mock discovery
    setInterval(() => {
      if (this.status === 'connected' && Math.random() > 0.7) {
        const newPeerId = `peer-${Math.floor(Math.random() * 1000)}`;
        if (!this.peers.has(newPeerId)) {
          console.log(`[P2P] Discovered new peer: ${newPeerId}`);
          this.peers.set(newPeerId, {
            id: newPeerId,
            address: '192.168.1.x',
            publicKey: 'mock-key',
            lastSeen: Date.now(),
            status: 'active'
          });
        }
      }
    }, 5000);
  }
}
