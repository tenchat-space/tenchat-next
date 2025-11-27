// @generated tenchat-tool: blockchain-service@1.0.0 hash: initial DO NOT EDIT DIRECTLY
// Blockchain anchoring service with provider abstraction

import { createWalletClient, custom, http } from 'viem'
import { mainnet } from 'viem/chains'
import type { 
  INotarizationService, 
  IChainClient, 
  BlockchainAnchor, 
  PaymentTransaction 
} from '../../types';
import { CryptoService } from './crypto.service';

/**
 * Abstract blockchain provider interface
 */
export interface BlockchainProvider {
  name: string;
  estimateGas(operation: string): Promise<string>;
  submitTransaction(tx: any): Promise<string>;
  getBlockHeight(): Promise<number>;
  getTransactionStatus(txHash: string): Promise<'pending' | 'confirmed' | 'failed'>;
  buildAnchorTransaction(merkleRoot: string): Promise<any>;
  buildPaymentTransaction(to: string, amount: string): Promise<any>;
}

/**
 * Mock Ethereum provider for demo
 */
class MockEthereumProvider implements BlockchainProvider {
  name = 'ethereum';
  private mockBlockHeight = 18500000;
  private mockTransactions: Map<string, { status: string; timestamp: number }> = new Map();
  private cryptoService: CryptoService;

  constructor(cryptoService?: CryptoService) {
    try {
      this.cryptoService = cryptoService || new CryptoService();
    } catch (error) {
      console.error('MockEthereumProvider constructor failed:', error);
      this.cryptoService = { hash: async (data: string) => btoa(data).slice(0, 32) } as any;
    }
  }

  async estimateGas(operation: string): Promise<string> {
    // Mock gas estimation
    const gasEstimates = {
      anchor: '45000',
      payment: '21000',
      default: '30000'
    };
    
    return gasEstimates[operation as keyof typeof gasEstimates] || gasEstimates.default;
  }

  async submitTransaction(tx: any): Promise<string> {
    const txHash = '0x' + await this.cryptoService.hash(JSON.stringify(tx));
    
    this.mockTransactions.set(txHash, {
      status: 'pending',
      timestamp: Date.now()
    });

    // Simulate confirmation after 30 seconds
    setTimeout(() => {
      const tx = this.mockTransactions.get(txHash);
      if (tx) {
        tx.status = 'confirmed';
      }
    }, 30000);

    return txHash;
  }

  async getBlockHeight(): Promise<number> {
    return this.mockBlockHeight++;
  }

  async getTransactionStatus(txHash: string): Promise<'pending' | 'confirmed' | 'failed'> {
    const tx = this.mockTransactions.get(txHash);
    return (tx?.status as any) || 'failed';
  }

  async buildAnchorTransaction(merkleRoot: string): Promise<any> {
    return {
      to: '0x742d35Cc6634C0532925a3b8D', // Mock contract address
      data: `0xa9059cbb${merkleRoot.slice(2)}`, // Mock function call
      gasLimit: '45000',
      gasPrice: '20000000000' // 20 gwei
    };
  }

  async buildPaymentTransaction(to: string, amount: string): Promise<any> {
    return {
      to,
      value: amount,
      gasLimit: '21000',
      gasPrice: '20000000000'
    };
  }
}

/**
 * Circuit breaker for provider reliability
 */
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private readonly maxFailures = 5;
  private readonly resetTimeout = 60000; // 1 minute

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.isOpen()) {
      throw new Error('Circuit breaker is open');
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private isOpen(): boolean {
    const now = Date.now();
    
    if (this.failures >= this.maxFailures) {
      if (now - this.lastFailureTime > this.resetTimeout) {
        this.reset();
        return false;
      }
      return true;
    }
    
    return false;
  }

  private onSuccess(): void {
    this.failures = 0;
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
  }

  private reset(): void {
    this.failures = 0;
    this.lastFailureTime = 0;
  }
}

/**
 * Blockchain client with provider abstraction and circuit breaker
 */
export class ChainClient implements IChainClient {
  private providers: BlockchainProvider[] = [];
  private currentProviderIndex = 0;
  private circuitBreaker = new CircuitBreaker();
  private gasCache: Map<string, { price: string; timestamp: number }> = new Map();
  private readonly gasCacheTimeout = 30000; // 30 seconds
  private walletClient: any | null = null;
  private connectedAddress: string | null = null;

  constructor(cryptoService?: CryptoService) {
    try {
      // Initialize with mock providers
      this.providers = [
        new MockEthereumProvider(cryptoService)
      ];
    } catch (error) {
      console.error('ChainClient constructor failed:', error);
      // Provide minimal fallback
      this.providers = [];
    }
  }

  async estimateGas(operation: string): Promise<string> {
    const cacheKey = `${operation}-${await this.getCurrentProvider().getBlockHeight()}`;
    const cached = this.gasCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.gasCacheTimeout) {
      return cached.price;
    }

    const price = await this.circuitBreaker.execute(async () => {
      return await this.getCurrentProvider().estimateGas(operation);
    });

    this.gasCache.set(cacheKey, { price, timestamp: Date.now() });
    return price;
  }

  async submitTransaction(tx: any): Promise<string> {
    return await this.circuitBreaker.execute(async () => {
      return await this.getCurrentProvider().submitTransaction(tx);
    });
  }

  async getBlockHeight(): Promise<number> {
    return await this.circuitBreaker.execute(async () => {
      return await this.getCurrentProvider().getBlockHeight();
    });
  }

  async getTransactionStatus(txHash: string): Promise<'pending' | 'confirmed' | 'failed'> {
    return await this.circuitBreaker.execute(async () => {
      return await this.getCurrentProvider().getTransactionStatus(txHash);
    });
  }

  private getCurrentProvider(): BlockchainProvider {
    return this.providers[this.currentProviderIndex];
  }

  private failoverToNextProvider(): void {
    this.currentProviderIndex = (this.currentProviderIndex + 1) % this.providers.length;
  }

  async connectWallet(): Promise<string> {
    const ethProvider = (window as any).ethereum;
    if (typeof ethProvider === 'undefined') {
      throw new Error('MetaMask is not installed.');
    }

    this.walletClient = createWalletClient({
      chain: mainnet,
      transport: custom(ethProvider)
    });

    const [address] = await this.walletClient.requestAddresses();
    this.connectedAddress = address;
    return address;
  }

  async disconnectWallet(): Promise<void> {
    this.walletClient = null;
    this.connectedAddress = null;
  }

  getConnectedAddress(): string | null {
    return this.connectedAddress;
  }
}

/**
 * Notarization service for blockchain anchoring
 */
export class NotarizationService implements INotarizationService {
  private chainClient: ChainClient = {
    submitTransaction: async () => 'stub-tx',
    getBlockHeight: async () => 0,
    getTransactionStatus: async () => 'confirmed',
  } as any;
  private pendingAnchors: Map<string, string[]> = new Map();
  private anchors: BlockchainAnchor[] = [];
  private batchSize = 1000; // Maximum messages per batch
  private batchTimeout = 10 * 60 * 1000; // 10 minutes
  private cryptoService: CryptoService = { hash: async () => 'stub-hash' } as any;

  constructor(cryptoService?: CryptoService, chainClient?: ChainClient) {
    try {
      this.cryptoService = cryptoService || new CryptoService();
      this.chainClient = chainClient || new ChainClient(this.cryptoService);
      this.scheduleBatchProcessing();
      this.loadPersistedAnchors();
    } catch (error) {
      console.error('NotarizationService constructor failed:', error);
    }
  }

  async anchorMessages(messageHashes: string[]): Promise<BlockchainAnchor> {
    try {
      // Build Merkle tree from message hashes
      const merkleRoot = await this.buildMerkleTree(messageHashes);
      
      // Create anchor transaction
      const provider = this.chainClient as any;
      const tx = await provider.getCurrentProvider().buildAnchorTransaction(merkleRoot);
      
      // Submit to blockchain
      const txHash = await this.chainClient.submitTransaction(tx);
      const blockHeight = await this.chainClient.getBlockHeight();

      const anchor: BlockchainAnchor = {
        merkleRoot,
        blockHeight,
        txHash,
        timestamp: new Date(),
        messageHashes: [...messageHashes]
      };

      this.anchors.push(anchor);
      this.persistAnchors();

      return anchor;
    } catch (error) {
      console.error('Failed to anchor messages:', error);
      throw error;
    }
  }

  async verifyAnchor(anchor: BlockchainAnchor): Promise<boolean> {
    try {
      // Verify transaction exists and is confirmed
      const status = await this.chainClient.getTransactionStatus(anchor.txHash);
      
      if (status !== 'confirmed') {
        return false;
      }

      // Verify Merkle root
      const calculatedRoot = await this.buildMerkleTree(anchor.messageHashes);
      return calculatedRoot === anchor.merkleRoot;
    } catch {
      return false;
    }
  }

  async getAnchorHistory(): Promise<BlockchainAnchor[]> {
    return [...this.anchors].reverse(); // Most recent first
  }

  /**
   * Add message hash to pending batch
   */
  async queueMessageForAnchoring(messageHash: string, conversationId: string): Promise<void> {
    if (!this.pendingAnchors.has(conversationId)) {
      this.pendingAnchors.set(conversationId, []);
    }

    this.pendingAnchors.get(conversationId)!.push(messageHash);
  }

  /**
   * Build Merkle tree from message hashes
   */
  private async buildMerkleTree(hashes: string[]): Promise<string> {
    if (hashes.length === 0) {
      return '';
    }

    if (hashes.length === 1) {
      return hashes[0];
    }

    let currentLevel = [...hashes];

    while (currentLevel.length > 1) {
      const nextLevel: string[] = [];

      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = currentLevel[i + 1] || left; // Duplicate if odd number
        const combined = await this.cryptoService.hash(left + right);
        nextLevel.push(combined);
      }

      currentLevel = nextLevel;
    }

    return currentLevel[0];
  }

  /**
   * Schedule periodic batch processing
   */
  private scheduleBatchProcessing(): void {
    setInterval(async () => {
      await this.processPendingBatches();
    }, this.batchTimeout);
  }

  /**
   * Process pending message batches for anchoring
   */
  private async processPendingBatches(): Promise<void> {
    if (this.pendingAnchors.size === 0) {
      return;
    }

    try {
      // Collect all pending messages
      const allPendingHashes: string[] = [];
      
      for (const hashes of this.pendingAnchors.values()) {
        allPendingHashes.push(...hashes);
      }

      if (allPendingHashes.length === 0) {
        return;
      }

      // Process in batches
      for (let i = 0; i < allPendingHashes.length; i += this.batchSize) {
        const batch = allPendingHashes.slice(i, i + this.batchSize);
        await this.anchorMessages(batch);
      }

      // Clear pending anchors
      this.pendingAnchors.clear();

    } catch (error) {
      console.error('Failed to process pending batches:', error);
    }
  }

  /**
   * Persist anchors to localStorage
   */
  private persistAnchors(): void {
    try {
      localStorage.setItem('whisperr_anchors', JSON.stringify(this.anchors));
    } catch (error) {
      console.error('Failed to persist anchors:', error);
    }
  }

  /**
   * Load persisted anchors from localStorage
   */
  private loadPersistedAnchors(): void {
    try {
      const stored = localStorage.getItem('whisperr_anchors');
      if (stored) {
        const anchors = JSON.parse(stored);
        this.anchors = anchors.map((anchor: any) => ({
          ...anchor,
          timestamp: new Date(anchor.timestamp)
        }));
      }
    } catch (error) {
      console.error('Failed to load persisted anchors:', error);
    }
  }
}

// Service instances will be created in index.ts to avoid circular dependencies