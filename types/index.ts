// @generated tenchat-tool: core-types@1.0.0 hash: initial DO NOT EDIT DIRECTLY
// Core type definitions for TenChat platform

export interface ApiVersion {
  major: number;
  minor: number;
  patch: number;
}

export interface ServiceContract {
  name: string;
  version: ApiVersion;
  schema: string;
  endpoints: string[];
}

// User and Identity Types
export interface Identity {
  id: string;
  publicKey: string;
  identityKey: string;
  signedPreKey: string;
  oneTimePreKeys: string[];
}

export interface User {
  id: string;
  displayName: string;
  identity: Identity;
  createdAt: Date;
  lastSeen: Date;
}

// Message Types
export interface EncryptedMessage {
  id: string;
  senderId: string;
  recipientId: string;
  ciphertext: string;
  nonce: string;
  timestamp: Date;
  ratchetHeader: string;
  messageNumber: number;
}

export interface DecryptedMessage {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'media' | 'file' | 'gift';
  metadata?: Record<string, any>;
}

// Conversation Types
export interface Conversation {
  id: string;
  participants: string[];
  type: 'direct' | 'group';
  metadata: ConversationMetadata;
  lastMessage?: EncryptedMessage;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationMetadata {
  name?: string;
  avatar?: string;
  description?: string;
  settings: ConversationSettings;
}

export interface ConversationSettings {
  ephemeralEnabled: boolean;
  ephemeralTtl?: number;
  notificationsEnabled: boolean;
  blockchainAnchoringEnabled: boolean;
}

// Cryptographic Types
export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

export interface SessionState {
  sendingChain: ChainState;
  receivingChains: Map<string, ChainState>;
  rootKey: string;
  sessionId: string;
}

export interface ChainState {
  chainKey: string;
  messageNumber: number;
}

// Blockchain Types
export interface BlockchainAnchor {
  merkleRoot: string;
  blockHeight: number;
  txHash: string;
  timestamp: Date;
  messageHashes: string[];
}

export interface PaymentTransaction {
  id: string;
  fromUserId: string;
  toUserId: string;
  amount: string;
  currency: string;
  status: 'pending' | 'confirmed' | 'failed';
  txHash?: string;
  createdAt: Date;
}

// Plugin Types
export interface Plugin {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  manifest: PluginManifest;
  enabled: boolean;
}

export interface PluginManifest {
  permissions: Permission[];
  hooks: HookDefinition[];
  transports?: TransportDefinition[];
  bots?: BotDefinition[];
}

export interface Permission {
  type: 'messaging' | 'contacts' | 'media' | 'payments' | 'storage';
  description: string;
  required: boolean;
}

export interface HookDefinition {
  event: string;
  handler: string;
  priority: number;
}

export interface TransportDefinition {
  name: string;
  protocols: string[];
  configuration: Record<string, any>;
}

export interface BotDefinition {
  name: string;
  triggers: string[];
  permissions: Permission[];
}

// Service Provider Interfaces
export interface IAuthService {
  loginWithWallet(email: string): Promise<AuthResult>;
  logout(): Promise<void>;
  refreshToken(): Promise<string>;
  getCurrentUser(): Promise<User | null>;
}

export interface IMessagingService {
  sendMessage(message: DecryptedMessage): Promise<void>;
  getMessages(conversationId: string, limit: number): Promise<EncryptedMessage[]>;
  createConversation(participants: string[]): Promise<Conversation>;
  getConversations(): Promise<Conversation[]>;
  markAsRead(conversationId: string, messageId: string): Promise<void>;
}

export interface IKeyManagementService {
  generateIdentityKeys(): Promise<Identity>;
  rotatePreKeys(): Promise<void>;
  getSessionState(userId: string): Promise<SessionState | null>;
  updateSessionState(userId: string, state: SessionState): Promise<void>;
  deriveSharedSecret(theirPublicKey: string): Promise<string>;
}

export interface IMediaService {
  uploadMedia(file: File, encryption: boolean): Promise<string>;
  downloadMedia(url: string, decryptionKey?: string): Promise<Blob>;
  generateThumbnail(file: File): Promise<string>;
}

export interface IPaymentService {
  createTransaction(toUserId: string, amount: string): Promise<PaymentTransaction>;
  getBalance(): Promise<string>;
  getTransactionHistory(): Promise<PaymentTransaction[]>;
}

export interface INotarizationService {
  anchorMessages(messageHashes: string[]): Promise<BlockchainAnchor>;
  verifyAnchor(anchor: BlockchainAnchor): Promise<boolean>;
  getAnchorHistory(): Promise<BlockchainAnchor[]>;
}

export interface IChainClient {
  estimateGas(operation: string): Promise<string>;
  submitTransaction(tx: any): Promise<string>;
  getBlockHeight(): Promise<number>;
  getTransactionStatus(txHash: string): Promise<'pending' | 'confirmed' | 'failed'>;
}

// Auth Types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterInfo {
  username: string;
  password: string;
  displayName: string;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
  message?: string;
}

// Event Types
export interface SystemEvent {
  type: string;
  timestamp: Date;
  data: any;
  source: string;
}

// Migration Types
export interface Migration {
  version: string;
  description: string;
  up: () => Promise<void>;
  down: () => Promise<void>;
}

export interface MigrationState {
  currentVersion: string;
  pendingMigrations: Migration[];
  appliedMigrations: string[];
}