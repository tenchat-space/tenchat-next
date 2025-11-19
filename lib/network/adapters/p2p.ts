
import { BackendAdapter, BackendType, ConnectionStatus, NetworkMessage, Peer } from '../types';
import { Transport } from '../transports/types';
import { BluetoothTransport } from '../transports/bluetooth';

export class P2PAdapter implements BackendAdapter {
  type: BackendType = 'p2p';
  name = 'TenChat Mesh (P2P)';
  private status: ConnectionStatus = 'disconnected';
  private peers: Map<string, Peer> = new Map();
  private messageCallback: ((message: NetworkMessage) => void) | null = null;
  private transports: Transport[] = [];

  constructor() {
    // Initialize transports
    const bt = new BluetoothTransport();
    if (bt.isSupported()) {
      this.transports.push(bt);
    }
    // Add WebRTC, etc. here
  }

  async connect(): Promise<void> {
    this.status = 'connecting';
    console.log('[P2P] Initializing mesh network...');
    
    // Connect all transports
    await Promise.all(this.transports.map(t => t.connect().catch(e => console.warn(`[P2P] Transport ${t.name} failed:`, e))));
    
    this.status = 'connected';
    console.log(`[P2P] Connected to mesh. Active transports: ${this.transports.length}`);
    
    // Start discovery loop
    this.startDiscovery();
  }

  async disconnect(): Promise<void> {
    this.status = 'disconnected';
    this.peers.clear();
    await Promise.all(this.transports.map(t => t.disconnect()));
  }

  getStatus(): ConnectionStatus {
    return this.status;
  }

  async sendMessage(message: NetworkMessage): Promise<void> {
    if (this.status !== 'connected') throw new Error('P2P not connected');

    const data = new TextEncoder().encode(JSON.stringify(message));

    // Logic for "jumping" / routing
    // 1. Check if recipient is directly connected via any transport
    // For now, broadcast to all transports (flood)
    // In real impl: Routing table lookup
    
    console.log(`[P2P] Broadcasting message ${message.id} via ${this.transports.length} transports`);
    
    await Promise.all(this.transports.map(t => 
      t.send(data, message.recipientId).catch(e => console.error(`[P2P] Send failed on ${t.name}`, e))
    ));
  }

  onMessage(callback: (message: NetworkMessage) => void): () => void {
    this.messageCallback = callback;
    
    // Hook up transport listeners
    this.transports.forEach(t => {
      t.onMessage((data, _senderId) => {
        try {
          const json = new TextDecoder().decode(data);
          const msg = JSON.parse(json) as NetworkMessage;
          // Verify signature, etc.
          if (this.messageCallback) this.messageCallback(msg);
        } catch (e) {
          console.error('[P2P] Failed to parse message', e);
        }
      });
    });

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
