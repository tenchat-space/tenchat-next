
import { BackendAdapter, BackendType, ConnectionStatus, NetworkConfig, NetworkMessage } from './types';

export class BackendManager {
  private static instance: BackendManager;
  private activeAdapter: BackendAdapter | null = null;
  private adapters: Map<BackendType, BackendAdapter> = new Map();
  private config: NetworkConfig;
  private messageListeners: ((message: NetworkMessage) => void)[] = [];

  private constructor() {
    // Default config
    this.config = {
      preferredBackend: 'appwrite',
      fallbackEnabled: true,
      p2p: { enabled: true, bootstrapNodes: [] },
      customBackends: []
    };
  }

  public static getInstance(): BackendManager {
    if (!BackendManager.instance) {
      BackendManager.instance = new BackendManager();
    }
    return BackendManager.instance;
  }

  public registerAdapter(adapter: BackendAdapter) {
    this.adapters.set(adapter.type, adapter);
  }

  public async initialize(config?: Partial<NetworkConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }

    await this.switchBackend(this.config.preferredBackend);
  }

  public async switchBackend(type: BackendType): Promise<void> {
    console.log(`[Network] Switching to backend: ${type}`);
    
    if (this.activeAdapter) {
      await this.activeAdapter.disconnect();
    }

    const adapter = this.adapters.get(type);
    if (!adapter) {
      console.warn(`[Network] Adapter ${type} not found. Falling back to P2P if available.`);
      if (type !== 'p2p' && this.adapters.has('p2p')) {
        return this.switchBackend('p2p');
      }
      throw new Error(`Backend adapter ${type} not registered`);
    }

    this.activeAdapter = adapter;
    
    try {
      await this.activeAdapter.connect();
      
      // Re-attach listeners
      this.activeAdapter.onMessage((msg) => {
        this.notifyListeners(msg);
      });

    } catch (error) {
      console.error(`[Network] Failed to connect to ${type}`, error);
      if (this.config.fallbackEnabled && type !== 'p2p') {
        console.log('[Network] Attempting fallback to P2P...');
        return this.switchBackend('p2p');
      }
    }
  }

  public getActiveBackend(): BackendAdapter | null {
    return this.activeAdapter;
  }

  public getStatus(): ConnectionStatus {
    return this.activeAdapter?.getStatus() || 'disconnected';
  }

  public async sendMessage(message: NetworkMessage): Promise<void> {
    if (!this.activeAdapter) {
      throw new Error('No active backend connection');
    }
    
    // Add routing headers if needed
    if (!message.ttl) message.ttl = 10;
    if (!message.path) message.path = [this.activeAdapter.name];

    await this.activeAdapter.sendMessage(message);
  }

  public onMessage(callback: (message: NetworkMessage) => void): () => void {
    this.messageListeners.push(callback);
    return () => {
      this.messageListeners = this.messageListeners.filter(cb => cb !== callback);
    };
  }

  private notifyListeners(message: NetworkMessage) {
    this.messageListeners.forEach(cb => cb(message));
  }
}
