/**
 * Appwrite Configuration Constants
 * Loaded from environment variables
 * 
 * Architecture:
 * - WHISPERRNOTE Database: User management (shared with base app)
 * - CHAT Database: All chat-specific features
 */

// Validate required env vars
const requiredEnvVars = [
  'NEXT_PUBLIC_APPWRITE_ENDPOINT',
  'NEXT_PUBLIC_APPWRITE_PROJECT_ID',
  'NEXT_PUBLIC_DATABASE_WHISPERRNOTE',
  'NEXT_PUBLIC_DATABASE_CHAT',
] as const;

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.warn(`Missing required environment variable: ${envVar}`);
  }
});

const envOr = (primary?: string, secondary?: string, fallback = ''): string => {
  if (primary) return primary;
  if (secondary) return secondary;
  return fallback;
};

// ============================================
// DATABASE IDS
// ============================================
// Read strictly from env (no hardcoded defaults)
export const DATABASE_IDS = {
  WHISPERRNOTE: process.env.NEXT_PUBLIC_DATABASE_WHISPERRNOTE as string,
  CHAT: process.env.NEXT_PUBLIC_DATABASE_CHAT as string,
} as const;

// ============================================
// TABLE IDS - WHISPERRNOTE DATABASE
// ============================================
export const WHISPERRNOTE_TABLES = {
  // Intentionally left without USERS: users table belongs to chat database
} as const;

// ============================================
// TABLE IDS - CHAT DATABASE
// ============================================
export const CHAT_TABLES = {
  // Core Chat
  CONVERSATIONS: envOr(
    process.env.NEXT_PUBLIC_TABLE_CONVERSATIONS,
    process.env.NEXT_PUBLIC_COLLECTION_CONVERSATIONS,
    'conversations'
  ),
  MESSAGES: envOr(
    process.env.NEXT_PUBLIC_TABLE_MESSAGES,
    process.env.NEXT_PUBLIC_COLLECTION_MESSAGES,
    'messages'
  ),
  MESSAGE_QUEUE: envOr(
    process.env.NEXT_PUBLIC_TABLE_MESSAGE_QUEUE,
    process.env.NEXT_PUBLIC_COLLECTION_MESSAGE_QUEUE,
    'messageQueue'
  ),
  CONTACTS: envOr(
    process.env.NEXT_PUBLIC_TABLE_CONTACTS,
    process.env.NEXT_PUBLIC_COLLECTION_CONTACTS,
    'contacts'
  ),
  TYPING_INDICATORS: envOr(
    process.env.NEXT_PUBLIC_TABLE_TYPING_INDICATORS,
    process.env.NEXT_PUBLIC_COLLECTION_TYPING_INDICATORS,
    'typingIndicators'
  ),
  PRESENCE: envOr(
    process.env.NEXT_PUBLIC_TABLE_PRESENCE,
    process.env.NEXT_PUBLIC_COLLECTION_PRESENCE,
    'presence'
  ),

  // Users (lives in chat DB)
  USERS: envOr(
    process.env.NEXT_PUBLIC_TABLE_USERS,
    process.env.NEXT_PUBLIC_COLLECTION_USERS,
    'users'
  ),

  // Social Features
  STORIES: envOr(
    process.env.NEXT_PUBLIC_TABLE_STORIES,
    process.env.NEXT_PUBLIC_COLLECTION_STORIES,
    'stories'
  ),
  STORY_VIEWS: envOr(
    process.env.NEXT_PUBLIC_TABLE_STORY_VIEWS,
    process.env.NEXT_PUBLIC_COLLECTION_STORY_VIEWS,
    'storyViews'
  ),
  POSTS: envOr(
    process.env.NEXT_PUBLIC_TABLE_POSTS,
    process.env.NEXT_PUBLIC_COLLECTION_POSTS,
    'posts'
  ),
  FOLLOWS: envOr(
    process.env.NEXT_PUBLIC_TABLE_FOLLOWS,
    process.env.NEXT_PUBLIC_COLLECTION_FOLLOWS,
    'follows'
  ),

  // Web3 Features
  WALLETS: envOr(
    process.env.NEXT_PUBLIC_TABLE_WALLETS,
    process.env.NEXT_PUBLIC_COLLECTION_WALLETS,
    'wallets'
  ),
  TOKEN_HOLDINGS: envOr(
    process.env.NEXT_PUBLIC_TABLE_TOKEN_HOLDINGS,
    process.env.NEXT_PUBLIC_COLLECTION_TOKEN_HOLDINGS,
    'tokenHoldings'
  ),

  // Content Features
  STICKERS: envOr(
    process.env.NEXT_PUBLIC_TABLE_STICKERS,
    process.env.NEXT_PUBLIC_COLLECTION_STICKERS,
    'stickers'
  ),
  STICKER_PACKS: envOr(
    process.env.NEXT_PUBLIC_TABLE_STICKER_PACKS,
    process.env.NEXT_PUBLIC_COLLECTION_STICKER_PACKS,
    'stickerPacks'
  ),
  USER_STICKERS: envOr(
    process.env.NEXT_PUBLIC_TABLE_USER_STICKERS,
    process.env.NEXT_PUBLIC_COLLECTION_USER_STICKERS,
    'userStickers'
  ),
  GIFS: envOr(
    process.env.NEXT_PUBLIC_TABLE_GIFS,
    process.env.NEXT_PUBLIC_COLLECTION_GIFS,
    'gifs'
  ),
  POLLS: envOr(
    process.env.NEXT_PUBLIC_TABLE_POLLS,
    process.env.NEXT_PUBLIC_COLLECTION_POLLS,
    'polls'
  ),
  AR_FILTERS: envOr(
    process.env.NEXT_PUBLIC_TABLE_AR_FILTERS,
    process.env.NEXT_PUBLIC_COLLECTION_AR_FILTERS,
    'arFilters'
  ),
  MEDIA_LIBRARY: envOr(
    process.env.NEXT_PUBLIC_TABLE_MEDIA_LIBRARY,
    process.env.NEXT_PUBLIC_COLLECTION_MEDIA_LIBRARY,
    'mediaLibrary'
  ),
} as const;

// ============================================
// STORAGE BUCKET IDS
// ============================================
export const BUCKET_IDS = {
  COVERS: process.env.NEXT_PUBLIC_BUCKET_COVERS as string,
  MESSAGES: process.env.NEXT_PUBLIC_BUCKET_MESSAGES as string,
  STORIES: process.env.NEXT_PUBLIC_BUCKET_STORIES as string,
  POSTS: process.env.NEXT_PUBLIC_BUCKET_POSTS as string,
  NFTS: process.env.NEXT_PUBLIC_BUCKET_NFTS as string,
  STICKERS: process.env.NEXT_PUBLIC_BUCKET_STICKERS as string,
  FILTERS: process.env.NEXT_PUBLIC_BUCKET_FILTERS as string,
  GIFS: process.env.NEXT_PUBLIC_BUCKET_GIFS as string,
  VOICE: process.env.NEXT_PUBLIC_BUCKET_VOICE as string,
  VIDEO: process.env.NEXT_PUBLIC_BUCKET_VIDEO as string,
  DOCUMENTS: process.env.NEXT_PUBLIC_BUCKET_DOCUMENTS as string,
} as const;

// ============================================
// UNIFIED TABLES (for convenience)
// ============================================
export const TABLES = {
  ...WHISPERRNOTE_TABLES,
  ...CHAT_TABLES,
} as const;

// ============================================
// TYPE EXPORTS
// ============================================
export type DatabaseId = typeof DATABASE_IDS[keyof typeof DATABASE_IDS];
export type TableId = typeof TABLES[keyof typeof TABLES];
export type BucketId = typeof BUCKET_IDS[keyof typeof BUCKET_IDS];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get database ID for a table
 */
export const getDatabaseForTable = (tableId: string): DatabaseId => {
  // All current tables, including USERS, live in chat database
  return DATABASE_IDS.CHAT;
};

// ---------------------------------------------------------------------------
// Backward-compatibility exports (Collections terminology)
// ---------------------------------------------------------------------------
export const WHISPERRNOTE_COLLECTIONS = WHISPERRNOTE_TABLES;
export const CHAT_COLLECTIONS = CHAT_TABLES;
export const COLLECTIONS = TABLES;
export type CollectionId = TableId;
export const getDatabaseForCollection = getDatabaseForTable;

/**
 * Check if configuration is valid
 */
export const isConfigurationValid = (): boolean => {
  return requiredEnvVars.every((envVar) => Boolean(process.env[envVar]));
};

/**
 * Get all missing environment variables
 */
export const getMissingEnvVars = (): string[] => {
  return requiredEnvVars.filter((envVar) => !process.env[envVar]);
};
