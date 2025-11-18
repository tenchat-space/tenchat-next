import React from 'react';
import { AppwriteContext } from '@/contexts/AppwriteContext';
import { Models } from 'appwrite';

// Default mock state
export const defaultMockState = {
  currentAccount: {
    $id: 'mock-user-id',
    $createdAt: new Date().toISOString(),
    $updatedAt: new Date().toISOString(),
    name: 'Storybook User',
    registration: new Date().toISOString(),
    status: true,
    passwordUpdate: new Date().toISOString(),
    email: 'user@example.com',
    phone: '',
    emailVerification: true,
    phoneVerification: false,
    mfa: false,
    prefs: {},
    labels: [],
    targets: [] as Models.Target[],
    accessedAt: new Date().toISOString(),
  } as Models.User<Models.Preferences>,
  currentUser: {
    $id: 'mock-db-user-id',
    $sequence: 0,
    $collectionId: 'mock-collection',
    $databaseId: 'mock-database',
    $permissions: [],
    $createdAt: new Date().toISOString(),
    $updatedAt: new Date().toISOString(),
    id: 'mock-user-id',
    username: 'storybook_user',
    displayName: 'Storybook User',
    walletAddress: '0x123...abc',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  isAuthenticated: true,
  isLoading: false,
  logout: async () => {},
  refreshProfile: async () => {},
  forceRefreshAuth: async () => {},
};

interface MockAppwriteProviderProps {
  children: React.ReactNode;
  value?: Partial<typeof defaultMockState>;
}

export const MockAppwriteProvider = ({ children, value }: MockAppwriteProviderProps) => {
  const mergedValue = { ...defaultMockState, ...value };

  return (
    <AppwriteContext.Provider value={mergedValue}>
      {children}
    </AppwriteContext.Provider>
  );
};
