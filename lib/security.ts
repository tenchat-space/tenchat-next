/**
 * Security Service - Wallet-Based E2EE
 * 
 * Architecture:
 * - Encryption Key is derived deterministically from a wallet signature
 * - User signs a specific message once, and we derive an AES-256 key from that signature
 * - The key is cached in IndexedDB for the session (no password needed)
 * - If user clears storage or switches devices, they just sign again with same wallet
 * 
 * This approach provides:
 * 1. Seamless UX - no passwords or recovery phrases to manage
 * 2. Wallet-bound security - only the wallet owner can decrypt
 * 3. Cross-device support - same wallet = same encryption key
 * 4. No server-side key storage needed
 */

import { keccak256, toBytes, recoverPublicKey, type Hex } from 'viem';

// Deterministic message for key derivation - DO NOT CHANGE after production launch
// Changing this would invalidate all existing encrypted messages
const ENCRYPTION_KEY_MESSAGE = `Tenchat E2EE Key Derivation

By signing this message, you are generating your encryption key for Tenchat.

This signature will be used to derive your personal encryption key.
Your messages will be encrypted end-to-end.

Important:
- This does NOT authorize any blockchain transactions
- This does NOT give Tenchat access to your funds
- Only sign this on the official Tenchat application

Domain: tenchat.app
Version: 1
Chain ID: Any`;

export interface WalletSigner {
  address: string;
  signMessage: (message: string) => Promise<Hex>;
}

export interface EncryptionState {
  isReady: boolean;
  walletAddress: string | null;
  error: string | null;
}

export class SecurityService {
  private static instance: SecurityService;
  private encryptionKey: CryptoKey | null = null;
  private walletAddress: string | null = null;
  private readonly ALGORITHM = 'AES-GCM';
  private readonly IV_LENGTH = 12;
  private readonly DB_NAME = 'TenchatEncryption';
  private readonly DB_VERSION = 2;

  private constructor() {}

  public static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  /**
   * Get current encryption state
   */
  getState(): EncryptionState {
    return {
      isReady: this.encryptionKey !== null,
      walletAddress: this.walletAddress,
      error: null
    };
  }

  /**
   * Check if encryption is ready for use
   */
  isReady(): boolean {
    return this.encryptionKey !== null;
  }

  /**
   * Initialize encryption from wallet signature.
   * This is the ONLY way to set up encryption - no passwords.
   */
  async initializeFromWallet(signer: WalletSigner): Promise<void> {
    try {
      // 1. Request signature from wallet
      const signature = await signer.signMessage(ENCRYPTION_KEY_MESSAGE);
      
      // 2. Derive encryption key from signature using HKDF
      const keyMaterial = await this.deriveKeyFromSignature(signature);
      
      // 3. Create AES-GCM key
      this.encryptionKey = await window.crypto.subtle.importKey(
        'raw',
        keyMaterial.buffer as ArrayBuffer,
        { name: this.ALGORITHM },
        false, // non-extractable for security
        ['encrypt', 'decrypt']
      );
      
      // 4. Store wallet address for reference
      this.walletAddress = signer.address;
      
      // 5. Persist to IndexedDB (key + wallet address)
      await this.saveToStorage(keyMaterial, signer.address);
      
      console.log('Encryption initialized for wallet:', signer.address);
    } catch (error) {
      console.error('Failed to initialize encryption from wallet:', error);
      throw new Error('Failed to initialize encryption. Please try signing again.');
    }
  }

  /**
   * Derive a 256-bit key from the wallet signature using HKDF.
   */
  private async deriveKeyFromSignature(signature: Hex): Promise<Uint8Array> {
    // Convert signature to bytes
    const signatureBytes = toBytes(signature);
    
    // Use HKDF to derive a proper encryption key
    // Salt is derived from the message hash for determinism
    const salt = toBytes(keccak256(toBytes(ENCRYPTION_KEY_MESSAGE)));
    const info = new TextEncoder().encode('tenchat-e2ee-v1');
    
    // Import signature as key material - cast to ArrayBuffer for TypeScript
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      signatureBytes.buffer as ArrayBuffer,
      'HKDF',
      false,
      ['deriveBits']
    );
    
    // Derive 256 bits (32 bytes) for AES-256 - cast buffers for TypeScript
    const derivedBits = await window.crypto.subtle.deriveBits(
      {
        name: 'HKDF',
        salt: salt.buffer as ArrayBuffer,
        info: info.buffer as ArrayBuffer,
        hash: 'SHA-256'
      },
      keyMaterial,
      256
    );
    
    return new Uint8Array(derivedBits);
  }

  /**
   * Encrypts data using the wallet-derived key.
   */
  async encrypt(data: string): Promise<{ cipherText: string; iv: string }> {
    if (!this.encryptionKey) {
      throw new Error('Encryption not initialized. Please connect your wallet first.');
    }

    const enc = new TextEncoder();
    const iv = window.crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));
    const encodedData = enc.encode(data);

    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: this.ALGORITHM,
        iv: iv as BufferSource,
      },
      this.encryptionKey,
      encodedData
    );

    return {
      cipherText: this.arrayBufferToBase64(encryptedBuffer),
      iv: this.arrayBufferToBase64(iv.buffer),
    };
  }

  /**
   * Decrypts data using the wallet-derived key.
   */
  async decrypt(cipherText: string, iv: string): Promise<string> {
    if (!this.encryptionKey) {
      throw new Error('Encryption not initialized. Please connect your wallet first.');
    }

    const encryptedBuffer = this.base64ToArrayBuffer(cipherText);
    const ivBuffer = this.base64ToArrayBuffer(iv);

    try {
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        {
          name: this.ALGORITHM,
          iv: ivBuffer as BufferSource,
        },
        this.encryptionKey,
        encryptedBuffer as BufferSource
      );

      const dec = new TextDecoder();
      return dec.decode(decryptedBuffer);
    } catch (e) {
      console.error('Decryption failed', e);
      return '[Encrypted Message]';
    }
  }

  // --- Helpers ---

  private arrayBufferToBase64(buffer: ArrayBuffer | ArrayBufferLike): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): Uint8Array {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes;
  }

  // --- Storage (IndexedDB) ---

  private async saveToStorage(keyMaterial: Uint8Array, walletAddress: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        // Delete old stores if upgrading from password-based system
        if (db.objectStoreNames.contains('keys')) {
          db.deleteObjectStore('keys');
        }
        if (!db.objectStoreNames.contains('encryption')) {
          db.createObjectStore('encryption');
        }
      };

      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const tx = db.transaction('encryption', 'readwrite');
        const store = tx.objectStore('encryption');
        
        // Store key material and wallet address
        store.put({
          keyMaterial: Array.from(keyMaterial), // Store as array for IndexedDB
          walletAddress: walletAddress,
          createdAt: Date.now()
        }, 'encryptionData');
        
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Load encryption key from storage if available.
   * Returns true if key was loaded, false if wallet signature is needed.
   */
  public async loadFromStorage(): Promise<boolean> {
    return new Promise((resolve) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (db.objectStoreNames.contains('keys')) {
          db.deleteObjectStore('keys');
        }
        if (!db.objectStoreNames.contains('encryption')) {
          db.createObjectStore('encryption');
        }
      };

      request.onsuccess = async (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('encryption')) {
          resolve(false);
          return;
        }
        
        const tx = db.transaction('encryption', 'readonly');
        const store = tx.objectStore('encryption');
        const getReq = store.get('encryptionData');
        
        getReq.onsuccess = async () => {
          if (getReq.result && getReq.result.keyMaterial) {
            try {
              const keyMaterial = new Uint8Array(getReq.result.keyMaterial);
              
              this.encryptionKey = await window.crypto.subtle.importKey(
                'raw',
                keyMaterial,
                { name: this.ALGORITHM },
                false,
                ['encrypt', 'decrypt']
              );
              
              this.walletAddress = getReq.result.walletAddress;
              resolve(true);
            } catch (e) {
              console.error('Failed to restore encryption key:', e);
              resolve(false);
            }
          } else {
            resolve(false);
          }
        };
        
        getReq.onerror = () => resolve(false);
      };
      
      request.onerror = () => resolve(false);
    });
  }

  /**
   * Clear encryption data from storage.
   * Called when user disconnects wallet or wants to reset encryption.
   */
  public async clearStorage(): Promise<void> {
    return new Promise((resolve) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (db.objectStoreNames.contains('encryption')) {
          const tx = db.transaction('encryption', 'readwrite');
          const store = tx.objectStore('encryption');
          store.delete('encryptionData');
          tx.oncomplete = () => {
            this.encryptionKey = null;
            this.walletAddress = null;
            resolve();
          };
        } else {
          resolve();
        }
      };
      
      request.onerror = () => resolve();
    });
  }

  /**
   * Get the message that needs to be signed for key derivation.
   * Useful for UI to show users what they're signing.
   */
  public getSigningMessage(): string {
    return ENCRYPTION_KEY_MESSAGE;
  }
}

export const securityService = SecurityService.getInstance();
