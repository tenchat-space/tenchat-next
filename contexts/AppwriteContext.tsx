/**
 * Appwrite Context
 * Provides Appwrite services throughout the app
 */

"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { account } from '@/lib/appwrite/config/client';
import { userService } from '@/lib/appwrite';
import type { Models } from 'appwrite';
import type { User } from '@/lib/appwrite';

interface AppwriteContextType {
  currentAccount: Models.User<Models.Preferences> | null;
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  forceRefreshAuth: () => Promise<void>;
}

export const AppwriteContext = createContext<AppwriteContextType | undefined>(undefined);

export function AppwriteProvider({ children }: { children: React.ReactNode }) {
  const [currentAccount, setCurrentAccount] = useState<Models.User<Models.Preferences> | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check auth on mount and set up polling
  useEffect(() => {
    let mounted = true;
    let pollInterval: NodeJS.Timeout | null = null;

    const checkAuth = async () => {
      try {
        const user = await account.get();
        
        if (!mounted) return;
        
        console.log('[Auth] User found:', user.$id);
        setCurrentAccount(user);
        setIsAuthenticated(true);
        
        // Ensure users row exists and load it (upsert)
        try {
          const dbUser = await userService.upsertUser(user.$id, {
            username: user.name || undefined,
            displayName: user.name || undefined,
            walletAddress: (user.prefs as any)?.walletEth?.toLowerCase?.(),
          } as any);
          if (mounted && dbUser) {
            setCurrentUser(dbUser);
          }
        } catch (error) {
          console.error('[Auth] Error ensuring user row:', error);
        }
      } catch (error) {
        console.log('[Auth] Not authenticated');
        if (mounted) {
          setCurrentAccount(null);
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Check immediately
    checkAuth();

    // Set up polling every 1 second to detect new sessions
    pollInterval = setInterval(checkAuth, 1000);
    
    return () => {
      mounted = false;
      if (pollInterval) clearInterval(pollInterval);
    };
  }, []);

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      await account.deleteSession('current');
      setCurrentAccount(null);
      setCurrentUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('[Auth] Logout error:', error);
      throw error;
    }
  };

  const refreshProfile = async () => {
    if (!currentAccount) return;
    
    try {
      const dbUser = await userService.upsertUser(currentAccount.$id, {
        username: currentAccount.name || undefined,
        displayName: currentAccount.name || undefined,
        walletAddress: (currentAccount.prefs as any)?.walletEth?.toLowerCase?.(),
      } as any);
      if (dbUser) {
        setCurrentUser(dbUser);
      }
    } catch (error) {
      console.error('[Auth] Error refreshing profile:', error);
    }
  };

  const forceRefreshAuth = async () => {
    try {
      const user = await account.get();
      setCurrentAccount(user);
      setIsAuthenticated(true);

      const dbUser = await userService.upsertUser(user.$id, {
        username: user.name || undefined,
        displayName: user.name || undefined,
        walletAddress: (user.prefs as any)?.walletEth?.toLowerCase?.(),
      } as any);
      if (dbUser) {
        setCurrentUser(dbUser);
      }
    } catch (error) {
      console.log('[Auth] Force refresh - no active session');
      setCurrentAccount(null);
      setCurrentUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AppwriteContext.Provider
      value={{
        currentAccount,
        currentUser,
        isAuthenticated,
        isLoading,
        logout,
        refreshProfile,
        forceRefreshAuth,
      }}
    >
      {children}
    </AppwriteContext.Provider>
  );
}

export function useAppwrite() {
  const context = useContext(AppwriteContext);
  if (context === undefined) {
    throw new Error('useAppwrite must be used within an AppwriteProvider');
  }
  return context;
}
