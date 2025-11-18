/**
 * Appwrite Client Configuration
 * Initialized with environment variables
 */

import { Client, Account, Databases, Storage, Functions, TablesDB } from 'appwrite';

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '';
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';

if (!ENDPOINT) {
  console.error('NEXT_PUBLIC_APPWRITE_ENDPOINT is not set. Please configure your environment variables.');
}

if (!PROJECT_ID) {
  console.error('NEXT_PUBLIC_APPWRITE_PROJECT_ID is not set. Please configure your environment variables.');
}

export const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID);

/**
 * Service Instances
 */
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);
// New: TablesDB client for Appwrite Tables service
export const tablesDB = new TablesDB(client);

/**
 * Export client for advanced usage
 */
export { Client };

/**
 * Helper to check if Appwrite is configured
 */
export const isConfigured = (): boolean => {
  return Boolean(ENDPOINT && PROJECT_ID);
};

/**
 * Helper to get current configuration (without sensitive data)
 */
export const getConfig = () => ({
  endpoint: ENDPOINT,
  projectId: PROJECT_ID ? `${PROJECT_ID.substring(0, 8)}...` : 'NOT_SET',
  configured: isConfigured(),
});
