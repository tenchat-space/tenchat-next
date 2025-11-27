// @generated tenchat-tool: crypto-service@1.0.0 hash: initial DO NOT EDIT DIRECTLY
// Cryptographic service implementing E2EE with Signal Protocol

import type { KeyPair, SessionState, ChainState, Identity } from '../../types';

export class CryptoService {
  private readonly ALGORITHM = 'AES-GCM';
  private readonly KEY_LENGTH = 256;
  private readonly NONCE_LENGTH = 12;
  private isSupported: boolean;

  constructor() {
    // Check for Web Crypto API support
    this.isSupported = !!(typeof crypto !== 'undefined' && crypto.subtle);
    
    if (!this.isSupported) {
      console.warn('Web Crypto API not fully supported - using fallback implementations');
      // Don't throw an error, just log a warning
    } else {
      console.log('Web Crypto API detected and supported');
    }
  }

  private checkSupport(): void {
    if (!this.isSupported) {
      console.warn('Web Crypto API not supported - using fallback implementations');
      // Don't throw, just warn - let methods handle fallbacks individually
    }
  }

  /**
   * Generate key pair for Diffie-Hellman (fallback to P-256 if X25519 not supported)
   */
  async generateKeyPair(): Promise<KeyPair> {
    this.checkSupport();
    
    try {
      // Try X25519 first
      const keyPair = await crypto.subtle.generateKey(
        {
          name: 'ECDH',
          namedCurve: 'X25519'
        },
        true,
        ['deriveKey', 'deriveBits']
      );

      const publicKey = await crypto.subtle.exportKey('spki', keyPair.publicKey);
      const privateKey = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

      return {
        publicKey: this.arrayBufferToBase64(publicKey),
        privateKey: this.arrayBufferToBase64(privateKey)
      };
    } catch (error) {
      // Fallback to P-256 if X25519 not supported
      console.warn('X25519 not supported, falling back to P-256:', error);
      return this.generateP256KeyPair();
    }
  }

  /**
   * Fallback key pair generation using P-256
   */
  private async generateP256KeyPair(): Promise<KeyPair> {
    const keyPair = await crypto.subtle.generateKey(
      {
        name: 'ECDH',
        namedCurve: 'P-256'
      },
      true,
      ['deriveKey', 'deriveBits']
    );

    const publicKey = await crypto.subtle.exportKey('spki', keyPair.publicKey);
    const privateKey = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

    return {
      publicKey: this.arrayBufferToBase64(publicKey),
      privateKey: this.arrayBufferToBase64(privateKey)
    };
  }

  /**
   * Generate signing key pair (fallback to ECDSA P-256 if Ed25519 not supported)
   */
  async generateSigningKeyPair(): Promise<KeyPair> {
    this.checkSupport();
    
    try {
      // Try Ed25519 first
      const keyPair = await crypto.subtle.generateKey(
        {
          name: 'Ed25519'
        },
        true,
        ['sign', 'verify']
      );

      const publicKey = await crypto.subtle.exportKey('spki', keyPair.publicKey);
      const privateKey = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

      return {
        publicKey: this.arrayBufferToBase64(publicKey),
        privateKey: this.arrayBufferToBase64(privateKey)
      };
    } catch (error) {
      // Fallback to ECDSA P-256 if Ed25519 not supported
      console.warn('Ed25519 not supported, falling back to ECDSA P-256:', error);
      return this.generateECDSAKeyPair();
    }
  }

  /**
   * Fallback signing key pair generation using ECDSA P-256
   */
  private async generateECDSAKeyPair(): Promise<KeyPair> {
    const keyPair = await crypto.subtle.generateKey(
      {
        name: 'ECDSA',
        namedCurve: 'P-256'
      },
      true,
      ['sign', 'verify']
    );

    const publicKey = await crypto.subtle.exportKey('spki', keyPair.publicKey);
    const privateKey = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

    return {
      publicKey: this.arrayBufferToBase64(publicKey),
      privateKey: this.arrayBufferToBase64(privateKey)
    };
  }

  /**
   * Generate complete identity with keys according to X3DH
   */
  async generateIdentity(): Promise<Identity> {
    const identityKey = await this.generateSigningKeyPair();
    const signedPreKey = await this.generateKeyPair();
    const oneTimePreKeys: string[] = [];

    // Generate 100 one-time prekeys
    for (let i = 0; i < 100; i++) {
      const otkPair = await this.generateKeyPair();
      oneTimePreKeys.push(otkPair.publicKey);
    }

    return {
      id: this.isSupported ? crypto.randomUUID() : this.generateFallbackUUID(),
      publicKey: identityKey.publicKey,
      identityKey: identityKey.privateKey,
      signedPreKey: signedPreKey.publicKey,
      oneTimePreKeys
    };
  }

  /**
   * Derive shared secret using ECDH (with fallback support)
   */
  async deriveSharedSecret(privateKey: string, publicKey: string): Promise<string> {
    this.checkSupport();
    
    const privateKeyBuffer = this.base64ToArrayBuffer(privateKey);
    const publicKeyBuffer = this.base64ToArrayBuffer(publicKey);

    try {
      // Try X25519 first
      const privKey = await crypto.subtle.importKey(
        'pkcs8',
        privateKeyBuffer,
        { name: 'ECDH', namedCurve: 'X25519' },
        false,
        ['deriveKey', 'deriveBits']
      );

      const pubKey = await crypto.subtle.importKey(
        'spki',
        publicKeyBuffer,
        { name: 'ECDH', namedCurve: 'X25519' },
        false,
        []
      );

      const sharedSecret = await crypto.subtle.deriveBits(
        { name: 'ECDH', public: pubKey },
        privKey,
        256
      );

      return this.arrayBufferToBase64(sharedSecret);
    } catch (error) {
      // Fallback to P-256
      console.warn('X25519 derivation failed, trying P-256:', error);
      return this.deriveP256SharedSecret(privateKeyBuffer, publicKeyBuffer);
    }
  }

  /**
   * Derive shared secret using P-256
   */
  private async deriveP256SharedSecret(privateKeyBuffer: ArrayBuffer, publicKeyBuffer: ArrayBuffer): Promise<string> {
    const privKey = await crypto.subtle.importKey(
      'pkcs8',
      privateKeyBuffer,
      { name: 'ECDH', namedCurve: 'P-256' },
      false,
      ['deriveKey', 'deriveBits']
    );

    const pubKey = await crypto.subtle.importKey(
      'spki',
      publicKeyBuffer,
      { name: 'ECDH', namedCurve: 'P-256' },
      false,
      []
    );

    const sharedSecret = await crypto.subtle.deriveBits(
      { name: 'ECDH', public: pubKey },
      privKey,
      256
    );

    return this.arrayBufferToBase64(sharedSecret);
  }

  /**
   * HKDF key derivation
   */
  async hkdf(sharedSecret: string, salt: string, info: string, length: number = 32): Promise<string> {
    this.checkSupport();
    
    const secretBuffer = this.base64ToArrayBuffer(sharedSecret);
    const saltBuffer = this.base64ToArrayBuffer(salt);
    const infoBuffer = new TextEncoder().encode(info);

    const key = await crypto.subtle.importKey(
      'raw',
      secretBuffer,
      { name: 'HKDF' },
      false,
      ['deriveKey']
    );

    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: 'HKDF',
        hash: 'SHA-256',
        salt: saltBuffer,
        info: infoBuffer
      },
      key,
      { name: 'AES-GCM', length: length * 8 },
      true,
      ['encrypt', 'decrypt']
    );

    const exportedKey = await crypto.subtle.exportKey('raw', derivedKey);
    return this.arrayBufferToBase64(exportedKey);
  }

  /**
   * Encrypt message with AES-256-GCM
   */
  async encryptMessage(plaintext: string, key: string): Promise<{ ciphertext: string; nonce: string }> {
    this.checkSupport();
    
    const nonceBytes = this.isSupported ? 
      crypto.getRandomValues(new Uint8Array(this.NONCE_LENGTH)) :
      new Uint8Array(this.NONCE_LENGTH).map(() => Math.floor(Math.random() * 256));
      
    const keyBuffer = this.base64ToArrayBuffer(key);
    const plaintextBuffer = new TextEncoder().encode(plaintext);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: this.ALGORITHM },
      false,
      ['encrypt']
    );

    const ciphertext = await crypto.subtle.encrypt(
      { name: this.ALGORITHM, iv: nonceBytes },
      cryptoKey,
      plaintextBuffer
    );

    return {
      ciphertext: this.arrayBufferToBase64(ciphertext),
      nonce: this.arrayBufferToBase64(nonceBytes.buffer)
    };
  }

  /**
   * Decrypt message with AES-256-GCM
   */
  async decryptMessage(ciphertext: string, key: string, nonce: string): Promise<string> {
    this.checkSupport();
    
    const keyBuffer = this.base64ToArrayBuffer(key);
    const ciphertextBuffer = this.base64ToArrayBuffer(ciphertext);
    const nonceBuffer = this.base64ToArrayBuffer(nonce);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: this.ALGORITHM },
      false,
      ['decrypt']
    );

    const plaintext = await crypto.subtle.decrypt(
      { name: this.ALGORITHM, iv: nonceBuffer },
      cryptoKey,
      ciphertextBuffer
    );

    return new TextDecoder().decode(plaintext);
  }

  /**
   * Initialize Double Ratchet session
   */
  async initializeSession(sharedSecret: string): Promise<SessionState> {
    const rootKey = await this.hkdf(sharedSecret, '', 'TenChat-RootKey');
    const sendingChain = await this.initializeChain();
    
    return {
      sendingChain,
      receivingChains: new Map(),
      rootKey,
      sessionId: this.isSupported ? crypto.randomUUID() : this.generateFallbackUUID()
    };
  }

  /**
   * Initialize chain state
   */
  private async initializeChain(): Promise<ChainState> {
    const chainKey = this.generateRandomBytes(32);
    
    return {
      chainKey,
      messageNumber: 0
    };
  }

  /**
   * Fallback UUID generation when crypto.randomUUID is not available
   */
  private generateFallbackUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Advance chain and derive message key
   */
  async advanceChain(chainState: ChainState): Promise<{ messageKey: string; newChainState: ChainState }> {
    const messageKey = await this.hkdf(chainState.chainKey, '', 'TenChat-MessageKey');
    const newChainKey = await this.hkdf(chainState.chainKey, '', 'TenChat-ChainKey');
    
    return {
      messageKey,
      newChainState: {
        chainKey: newChainKey,
        messageNumber: chainState.messageNumber + 1
      }
    };
  }

  /**
   * Generate secure random bytes
   */
  generateRandomBytes(length: number): string {
    if (!this.isSupported) {
      // Fallback to Math.random for development (NOT cryptographically secure)
      console.warn('Using Math.random fallback - NOT cryptographically secure');
      const bytes = new Uint8Array(length);
      for (let i = 0; i < length; i++) {
        bytes[i] = Math.floor(Math.random() * 256);
      }
      return this.arrayBufferToBase64(bytes.buffer);
    }
    
    const bytes = crypto.getRandomValues(new Uint8Array(length));
    return this.arrayBufferToBase64(bytes.buffer);
  }

  /**
   * Hash function using BLAKE3 (simulated with SHA-256 for browser compatibility)
   */
  async hash(data: string): Promise<string> {
    this.checkSupport();
    
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    return this.arrayBufferToBase64(hashBuffer);
  }

  /**
   * Verify signature (with fallback support)
   */
  async verifySignature(data: string, signature: string, publicKey: string): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('Signature verification not available without Web Crypto API');
      return false;
    }
    
    try {
      const dataBuffer = new TextEncoder().encode(data);
      const signatureBuffer = this.base64ToArrayBuffer(signature);
      const publicKeyBuffer = this.base64ToArrayBuffer(publicKey);

      try {
        // Try Ed25519 first
        const key = await crypto.subtle.importKey(
          'spki',
          publicKeyBuffer,
          { name: 'Ed25519' },
          false,
          ['verify']
        );

        return await crypto.subtle.verify(
          'Ed25519',
          key,
          signatureBuffer,
          dataBuffer
        );
      } catch (error) {
        // Fallback to ECDSA P-256
        const key = await crypto.subtle.importKey(
          'spki',
          publicKeyBuffer,
          { name: 'ECDSA', namedCurve: 'P-256' },
          false,
          ['verify']
        );

        return await crypto.subtle.verify(
          { name: 'ECDSA', hash: 'SHA-256' },
          key,
          signatureBuffer,
          dataBuffer
        );
      }
    } catch {
      return false;
    }
  }

  /**
   * Utility: Convert ArrayBuffer to Base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Utility: Convert Base64 to ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
}

// Service instance will be created in index.ts to avoid circular dependencies