/**
 * Appwrite Integration
 * Main export file for Appwrite services and configuration
 */

// Export client and services
export { client, account, databases, storage, functions, isConfigured, getConfig } from './config/client';

// Export constants
export {
  DATABASE_IDS,
  // New terminology
  WHISPERRNOTE_TABLES,
  CHAT_TABLES,
  BUCKET_IDS,
  TABLES,
  getDatabaseForTable,
  isConfigurationValid,
  getMissingEnvVars,
} from './config/constants';

// Export all services
export * from './services';

// Export types
export type { DatabaseId, TableId as CollectionId, TableId, BucketId } from './config/constants';

// Backward-compatible re-exports
export {
  WHISPERRNOTE_COLLECTIONS,
  CHAT_COLLECTIONS,
  COLLECTIONS,
  getDatabaseForCollection
} from './config/constants';
export type { User } from './services/user.service';
export type { Conversation, Message } from './services/messaging.service';
export type { Contact } from './services/contacts.service';
