/**
 * Appwrite Configuration
 * Central export for configuration modules
 */

export * from './client';
export * from './constants';

// Re-export for convenience
export { client, account, databases, storage, functions } from './client';
export {
  DATABASE_IDS,
  // New terminology
  CHAT_TABLES,
  WHISPERRNOTE_TABLES,
  TABLES,
  BUCKET_IDS,
  getDatabaseForTable,
  // Backward-compatible aliases
  CHAT_COLLECTIONS,
  WHISPERRNOTE_COLLECTIONS,
  COLLECTIONS,
  getDatabaseForCollection
} from './constants';
