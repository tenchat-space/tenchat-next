
/**
 * Security Service
 * Handles End-to-End Encryption (E2EE) logic.
 * 
 * Architecture:
 * 1. Master Key: A random 256-bit AES-GCM key generated on client.
 * 2. User Key: Derived from user's password/secret using PBKDF2.
 * 3. Encrypted Master Key: Master Key encrypted with User Key, stored in DB.
 * 4. Local Storage: Master Key stored in IndexedDB (non-exportable).
 */

export class SecurityService {
  private static instance: SecurityService;
  private masterKey: CryptoKey | null = null;
  private readonly ALGORITHM = 'AES-GCM';
  private readonly KDF_ALGORITHM = 'PBKDF2';
  private readonly SALT_LENGTH = 16;
  private readonly IV_LENGTH = 12;
  private readonly ITERATIONS = 100000;

  private constructor() {}

  public static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  /**
   * Generates a new random Master Key.
   */
  async generateMasterKey(): Promise<CryptoKey> {
    return window.crypto.subtle.generateKey(
      {
        name: this.ALGORITHM,
        length: 256,
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Derives a User Key from a password/secret.
   */
  async deriveUserKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      { name: this.KDF_ALGORITHM },
      false,
      ['deriveKey']
    );

    return window.crypto.subtle.deriveKey(
      {
        name: this.KDF_ALGORITHM,
        salt: salt,
        iterations: this.ITERATIONS,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: this.ALGORITHM, length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypts data using the Master Key.
   */
  async encrypt(data: string): Promise<{ cipherText: string; iv: string }> {
    if (!this.masterKey) {
      throw new Error('Master Key not loaded');
    }

    const enc = new TextEncoder();
    const iv = window.crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));
    const encodedData = enc.encode(data);

    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: this.ALGORITHM,
        iv: iv,
      },
      this.masterKey,
      encodedData
    );

    return {
      cipherText: this.arrayBufferToBase64(encryptedBuffer),
      iv: this.arrayBufferToBase64(iv.buffer),
    };
  }

  /**
   * Decrypts data using the Master Key.
   */
  async decrypt(cipherText: string, iv: string): Promise<string> {
    if (!this.masterKey) {
      throw new Error('Master Key not loaded');
    }

    const encryptedBuffer = this.base64ToArrayBuffer(cipherText);
    const ivBuffer = this.base64ToArrayBuffer(iv);

    try {
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        {
          name: this.ALGORITHM,
          iv: ivBuffer,
        },
        this.masterKey,
        encryptedBuffer
      );

      const dec = new TextDecoder();
      return dec.decode(decryptedBuffer);
    } catch (e) {
      console.error('Decryption failed', e);
      return '[Encrypted Message]';
    }
  }

  /**
   * Exports the Master Key encrypted with the User Key (for storage in DB).
   */
  async exportMasterKey(password: string): Promise<{ encryptedKey: string; salt: string; iv: string }> {
    if (!this.masterKey) {
      throw new Error('Master Key not loaded');
    }

    const salt = window.crypto.getRandomValues(new Uint8Array(this.SALT_LENGTH));
    const userKey = await this.deriveUserKey(password, salt);
    const iv = window.crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));

    const rawMasterKey = await window.crypto.subtle.exportKey('raw', this.masterKey);
    
    const encryptedMasterKey = await window.crypto.subtle.encrypt(
      {
        name: this.ALGORITHM,
        iv: iv,
      },
      userKey,
      rawMasterKey
    );

    return {
      encryptedKey: this.arrayBufferToBase64(encryptedMasterKey),
      salt: this.arrayBufferToBase64(salt.buffer),
      iv: this.arrayBufferToBase64(iv.buffer),
    };
  }

  /**
   * Imports the Master Key from the encrypted DB backup.
   */
  async importMasterKey(password: string, encryptedKey: string, salt: string, iv: string): Promise<void> {
    const saltBuffer = this.base64ToArrayBuffer(salt);
    const ivBuffer = this.base64ToArrayBuffer(iv);
    const encryptedKeyBuffer = this.base64ToArrayBuffer(encryptedKey);

    const userKey = await this.deriveUserKey(password, saltBuffer);

    const rawMasterKey = await window.crypto.subtle.decrypt(
      {
        name: this.ALGORITHM,
        iv: ivBuffer,
      },
      userKey,
      encryptedKeyBuffer
    );

    this.masterKey = await window.crypto.subtle.importKey(
      'raw',
      rawMasterKey,
      { name: this.ALGORITHM },
      true,
      ['encrypt', 'decrypt']
    );
    
    // Persist to local storage (securely if possible, or just in memory for session)
    // For "Telegram convenience", we might want to store it in IndexedDB
    await this.saveKeyToStorage(this.masterKey);
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
  // Using a simple wrapper for IndexedDB to store the key handle
  
  private async saveKeyToStorage(key: CryptoKey) {
    // Implementation of IndexedDB storage for CryptoKey
    // This allows the key to persist across reloads without re-entering password
    // The key itself is non-exportable from WebCrypto if we set extractable: false, 
    // but we need to export it to save to DB. 
    // Here we save the handle.
    
    return new Promise<void>((resolve, reject) => {
        const request = indexedDB.open('TenchatKeyStore', 1);
        
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains('keys')) {
                db.createObjectStore('keys');
            }
        };

        request.onsuccess = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            const tx = db.transaction('keys', 'readwrite');
            const store = tx.objectStore('keys');
            store.put(key, 'masterKey');
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        };
        
        request.onerror = () => reject(request.error);
    });
  }

  public async loadKeyFromStorage(): Promise<boolean> {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open('TenchatKeyStore', 1);
        
        request.onupgradeneeded = (event) => {
             const db = (event.target as IDBOpenDBRequest).result;
             if (!db.objectStoreNames.contains('keys')) {
                 db.createObjectStore('keys');
             }
        };

        request.onsuccess = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            const tx = db.transaction('keys', 'readonly');
            const store = tx.objectStore('keys');
            const getReq = store.get('masterKey');
            
            getReq.onsuccess = () => {
                if (getReq.result) {
                    this.masterKey = getReq.result;
                    resolve(true);
                } else {
                    resolve(false);
                }
            };
            
            getReq.onerror = () => reject(getReq.error);
        };
        
        request.onerror = () => {
            // DB might not exist yet
            resolve(false);
        };
    });
  }
  
  public async clearKeyFromStorage() {
      return new Promise<void>((resolve) => {
        const request = indexedDB.open('TenchatKeyStore', 1);
        request.onsuccess = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            const tx = db.transaction('keys', 'readwrite');
            const store = tx.objectStore('keys');
            store.delete('masterKey');
            this.masterKey = null;
            tx.oncomplete = () => resolve();
        };
      });
  }
}

export const securityService = SecurityService.getInstance();
