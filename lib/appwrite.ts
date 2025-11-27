/**
 * Appwrite Integration
 * Central export for all Appwrite functionality
 */

// Export client and core services
export { client, account, databases, storage, functions, isConfigured, getConfig } from './appwrite/config/client';

// Export constants
export * from './appwrite/config/constants';

// Export service instances
export {
  authService,
  userService,
  contactsService,
  storageService,
  web3Service,
  socialService,
  realtimeService,
  chatService,
} from './appwrite/services';

// Export service classes
export {
  AuthService,
  UserService,
  MessagingService,
  ContactsService,
  StorageService,
  Web3Service,
  SocialService,
  RealtimeService,
  ChatService,
} from './appwrite/services';

// Export types
export type {
  User,
  Conversation,
  Message,
  Contact,
} from './appwrite/services';

export type { DatabaseId, CollectionId, BucketId } from './appwrite/config/constants';
