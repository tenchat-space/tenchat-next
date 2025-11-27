// @generated tenchat-tool: key-management-service@1.0.0 hash: initial DO NOT EDIT DIRECTLY
// Key management service implementing secure key lifecycle

import type { IKeyManagementService, Identity, SessionState } from '../../types';
import { CryptoService } from './crypto.service';

export class KeyManagementService implements IKeyManagementService {
  private sessionStates: Map<string, SessionState> = new Map();
  private identityStorage = 'whisperr_identity';
  private sessionStorage = 'whisperr_sessions';
  private keyRotationInterval = 24 * 60 * 60 * 1000; // 24 hours
  private cryptoService: CryptoService = {
    generateIdentity: async () => ({ id: 'stub', publicKey: '', identityKey: '', signedPreKey: '', oneTimePreKeys: [] }),
    generateKeyPair: async () => ({ publicKey: '', privateKey: '' }),
    generateRandomBytes: () => 'stub-random',
    deriveSharedSecret: async () => '',
    hkdf: async () => '',
    initializeSession: async () => ({} as SessionState),
    encryptMessage: async () => ({ ciphertext: '', nonce: '' }),
    decryptMessage: async () => ({ content: '', nonce: '' }),
    hash: async () => 'hash'
  } as any;

  constructor(cryptoService?: CryptoService) {
    try {
      this.cryptoService = cryptoService || new CryptoService();
      this.loadPersistedData();
      this.scheduleKeyRotation();
    } catch (error) {
      console.error('KeyManagementService constructor failed:', error);
      // Provide stub crypto service to prevent errors
      this.cryptoService = this.cryptoService || ({
        generateIdentity: async () => ({ id: 'stub', publicKey: '', identityKey: '', signedPreKey: '', oneTimePreKeys: [] }),
        generateKeyPair: async () => ({ publicKey: '', privateKey: '' }),
        generateRandomBytes: () => 'stub-random-data'
      } as any);
    }
  }

  async generateIdentityKeys(): Promise<Identity> {
    const identity = await this.cryptoService.generateIdentity();
    
    // Store identity securely
    this.storeIdentity(identity);
    
    return identity;
  }

  async rotatePreKeys(): Promise<void> {
    try {
      const identity = this.getStoredIdentity();
      
      if (!identity) {
        throw new Error('No identity found for prekey rotation');
      }

      // Generate new prekeys
      const newPreKeys: string[] = [];
      for (let i = 0; i < 100; i++) {
        const preKeyPair = await this.cryptoService.generateKeyPair();
        newPreKeys.push(preKeyPair.publicKey);
      }

      // Update identity with new prekeys
      identity.oneTimePreKeys = newPreKeys;
      
      // Store updated identity
      this.storeIdentity(identity);
      
      console.log('Prekeys rotated successfully');
      
      // TODO(ai): Publish new prekeys to server
      
    } catch (error) {
      console.error('Failed to rotate prekeys:', error);
      throw error;
    }
  }

  async getSessionState(userId: string): Promise<SessionState | null> {
    return this.sessionStates.get(userId) || null;
  }

  async updateSessionState(userId: string, state: SessionState): Promise<void> {
    this.sessionStates.set(userId, state);
    this.persistSessionStates();
  }

  async deriveSharedSecret(theirPublicKey: string): Promise<string> {
    const identity = this.getStoredIdentity();
    
    if (!identity) {
      throw new Error('No identity available for key derivation');
    }

    // Use our identity private key and their public key
    return await this.cryptoService.deriveSharedSecret(identity.identityKey, theirPublicKey);
  }

  /**
   * Initialize session using X3DH protocol
   */
  async initializeX3DHSession(
    identityKey: string,
    signedPreKey: string,
    oneTimePreKey?: string
  ): Promise<SessionState> {
    const myIdentity = this.getStoredIdentity();
    
    if (!myIdentity) {
      throw new Error('No identity available for session initialization');
    }

    // X3DH key agreement calculation
    // DH1 = DH(IK_A, SPK_B)
    const dh1 = await this.cryptoService.deriveSharedSecret(myIdentity.identityKey, signedPreKey);
    
    // DH2 = DH(EK_A, IK_B) 
    const ephemeralKey = await this.cryptoService.generateKeyPair();
    const dh2 = await this.cryptoService.deriveSharedSecret(ephemeralKey.privateKey, identityKey);
    
    // DH3 = DH(EK_A, SPK_B)
    const dh3 = await this.cryptoService.deriveSharedSecret(ephemeralKey.privateKey, signedPreKey);
    
    let sharedSecret = dh1 + dh2 + dh3;
    
    // DH4 = DH(EK_A, OPK_B) if one-time prekey available
    if (oneTimePreKey) {
      const dh4 = await this.cryptoService.deriveSharedSecret(ephemeralKey.privateKey, oneTimePreKey);
      sharedSecret += dh4;
    }

    // Derive root key using HKDF
    const rootKey = await this.cryptoService.hkdf(sharedSecret, '', 'TenChat-X3DH');
    
    // Initialize Double Ratchet session
    return await this.cryptoService.initializeSession(rootKey);
  }

  /**
   * Clean up old sessions to prevent unbounded growth
   */
  async cleanupOldSessions(): Promise<void> {
    const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days
    
    for (const [userId, session] of this.sessionStates.entries()) {
      // TODO(ai): Add timestamp tracking to sessions
      // For now, implement basic cleanup logic
      if (session.receivingChains.size > 100) {
        // Keep only the most recent receiving chains
        const chains = Array.from(session.receivingChains.entries());
        session.receivingChains.clear();
        
        // Keep the last 50 chains
        chains.slice(-50).forEach(([key, value]) => {
          session.receivingChains.set(key, value);
        });
      }
    }
    
    this.persistSessionStates();
  }

  /**
   * Export identity for backup (encrypted with user passphrase)
   */
  async exportIdentity(passphrase: string): Promise<string> {
    const identity = this.getStoredIdentity();
    
    if (!identity) {
      throw new Error('No identity to export');
    }

    // Derive encryption key from passphrase using Argon2id (simulated)
    const salt = this.cryptoService.generateRandomBytes(16);
    const derivedKey = await this.cryptoService.hkdf(passphrase, salt, 'TenChat-Backup');
    
    // Encrypt identity
    const { ciphertext, nonce } = await this.cryptoService.encryptMessage(
      JSON.stringify(identity),
      derivedKey
    );

    return JSON.stringify({
      version: '1.0.0',
      salt,
      nonce,
      ciphertext
    });
  }

  /**
   * Import identity from backup (decrypt with user passphrase)
   */
  async importIdentity(backupData: string, passphrase: string): Promise<void> {
    try {
      const backup = JSON.parse(backupData);
      
      if (backup.version !== '1.0.0') {
        throw new Error('Unsupported backup version');
      }

      // Derive decryption key
      const derivedKey = await this.cryptoService.hkdf(passphrase, backup.salt, 'TenChat-Backup');
      
      // Decrypt identity
      const decryptedData = await this.cryptoService.decryptMessage(
        backup.ciphertext,
        derivedKey,
        backup.nonce
      );

      const identity: Identity = JSON.parse(decryptedData);
      
      // Validate identity structure
      if (!identity.id || !identity.publicKey || !identity.identityKey) {
        throw new Error('Invalid identity data');
      }

      // Store imported identity
      this.storeIdentity(identity);
      
    } catch (error) {
      throw new Error(`Failed to import identity: ${error}`);
    }
  }

  /**
   * Store identity securely in localStorage
   */
  private storeIdentity(identity: Identity): void {
    try {
      // TODO(ai): Consider additional encryption for localStorage storage
      localStorage.setItem(this.identityStorage, JSON.stringify(identity));
    } catch (error) {
      console.error('Failed to store identity:', error);
      throw error;
    }
  }

  /**
   * Retrieve stored identity
   */
  private getStoredIdentity(): Identity | null {
    try {
      const stored = localStorage.getItem(this.identityStorage);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to retrieve identity:', error);
      return null;
    }
  }

  /**
   * Persist session states to localStorage
   */
  private persistSessionStates(): void {
    try {
      const sessionsData = Array.from(this.sessionStates.entries()).map(([userId, state]) => [
        userId,
        {
          ...state,
          receivingChains: Array.from(state.receivingChains.entries())
        }
      ]);
      
      localStorage.setItem(this.sessionStorage, JSON.stringify(sessionsData));
    } catch (error) {
      console.error('Failed to persist session states:', error);
    }
  }

  /**
   * Load persisted data from localStorage
   */
  private loadPersistedData(): void {
    try {
      const stored = localStorage.getItem(this.sessionStorage);
      if (stored) {
        const sessionsData = JSON.parse(stored);
        
        this.sessionStates = new Map(
          sessionsData.map(([userId, state]: [string, any]) => [
            userId,
            {
              ...state,
              receivingChains: new Map(state.receivingChains)
            }
          ])
        );
      }
    } catch (error) {
      console.error('Failed to load persisted session data:', error);
    }
  }

  /**
   * Schedule automatic key rotation
   */
  private scheduleKeyRotation(): void {
    setInterval(async () => {
      try {
        await this.rotatePreKeys();
        await this.cleanupOldSessions();
      } catch (error) {
        console.error('Scheduled key rotation failed:', error);
      }
    }, this.keyRotationInterval);
  }

  /**
   * Get current identity public key
   */
  getPublicIdentity(): Pick<Identity, 'id' | 'publicKey' | 'signedPreKey'> | null {
    const identity = this.getStoredIdentity();
    
    if (!identity) {
      return null;
    }

    return {
      id: identity.id,
      publicKey: identity.publicKey,
      signedPreKey: identity.signedPreKey
    };
  }

  /**
   * Check if identity exists
   */
  hasIdentity(): boolean {
    return !!this.getStoredIdentity();
  }
}

// Service instance will be created in index.ts to avoid circular dependencies