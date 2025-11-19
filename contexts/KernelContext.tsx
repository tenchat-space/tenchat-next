"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useWindow } from './WindowContext';
import { 
  TenchatAPI, 
  WindowAPI, 
  WindowConfig, 
  ExtensionManifest,
  UIAPI,
  StorageAPI,
  UserAPI,
  AIAPI,
  SystemAPI,
  BlockchainAPI,
  ExtensionSlot,
  ExtensionPermission,
  MessagingAPI
} from '@/types/extension';

interface KernelContextType {
  api: TenchatAPI;
  installExtension: (manifest: ExtensionManifest, script: string) => Promise<void>;
  extensions: ExtensionManifest[];
  // Internal registry for UI components
  registeredWidgets: Record<string, ReactNode[]>;
}

const PRE_INSTALLED_EXTENSIONS: ExtensionManifest[] = [
  {
    id: 'ext-core-ai',
    name: 'TenRizzBot',
    version: '1.0.0',
    description: 'Advanced AI assistant with deep system integration.',
    author: 'TenChat Core',
    permissions: ['system:notification', 'storage:read', 'storage:write'],
  },
  {
    id: 'ext-core-chain',
    name: 'TenProtocol Plugin',
    version: '1.0.0',
    description: 'Blockchain integration and wallet management.',
    author: 'TenChat Core',
    permissions: ['storage:read', 'storage:write'],
  }
];

const KernelContext = createContext<KernelContextType | undefined>(undefined);

export function KernelProvider({ children }: { children: ReactNode }) {
  const windowContext = useWindow();
  const [extensions, setExtensions] = useState<ExtensionManifest[]>(PRE_INSTALLED_EXTENSIONS);
  const [registeredWidgets, setRegisteredWidgets] = useState<Record<string, ReactNode[]>>({});

  // 1. Implement the Window API
  const windowApi: WindowAPI = {
    open: async (config: WindowConfig) => {
      return new Promise((resolve) => {
        // We need to generate an ID or let openWindow return it.
        // Currently openWindow is void, but we can pass an ID.
        const id = `ext-win-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        windowContext.openWindow({
          id,
          title: config.title,
          type: 'CUSTOM', // We might need a generic 'EXTENSION' type
          component: config.component, // This works for internal, but for scripts we need a sandbox wrapper
          props: { scriptUrl: config.scriptUrl }
        }, {
          size: { width: config.width || 400, height: config.height || 500 },
          position: config.x && config.y ? { x: config.x, y: config.y } : undefined
        });
        
        resolve(id);
      });
    },
    close: async (id: string) => {
      windowContext.closeWindow(id);
    },
    minimize: async (id: string) => {
      windowContext.minimizeWindow(id);
    },
    maximize: async (id: string) => {
      windowContext.maximizeWindow(id);
    },
    blur: async (id: string, amount: number) => {
      windowContext.setWindowBlur(id, amount > 0, amount);
    },
    lock: async (id: string) => {
      // Toggle lock state. In a real app, this would trigger a biometric challenge first.
      // For now, we just lock it. To unlock, we'd need an 'unlock' method or toggle.
      // Let's assume this method sets it to locked.
      windowContext.setWindowLock(id, true);
    }
  };

  // 2. Implement Messaging API (Placeholder)
  const messagingApi: MessagingAPI = {
    send: async (content: string, recipient: string) => {
      console.log(`[Kernel] Sending message to ${recipient}: ${content}`);
    },
    onReceive: (callback: (msg: unknown) => void) => {
      // In real implementation, subscribe to websocket/event bus
      return () => {};
    }
  };

  // 3. Implement UI API
  const uiApi: UIAPI = {
    showToast: (message: string, type = 'info') => {
      console.log(`[Toast] ${type}: ${message}`);
      // TODO: Connect to global toast provider
    },
    registerWidget: (slot: ExtensionSlot, component: ReactNode) => {
      setRegisteredWidgets(prev => ({
        ...prev,
        [slot]: [...(prev[slot] || []), component]
      }));
    },
    registerMenuItem: (location, label, action) => {
      console.log(`[Menu] Registered ${label} at ${location}`);
    }
  };

  // 4. Implement Storage API
  const storageApi: StorageAPI = {
    get: async function<T>(key: string): Promise<T | null> {
      const val = localStorage.getItem(`ext_storage_${key}`);
      return val ? JSON.parse(val) : null;
    },
    set: async function<T>(key: string, value: T) {
      localStorage.setItem(`ext_storage_${key}`, JSON.stringify(value));
    },
    remove: async (key: string) => {
      localStorage.removeItem(`ext_storage_${key}`);
    }
  };

  // 5. Implement User API
  const userApi: UserAPI = {
    getCurrentUser: async () => {
      // Mock data - should come from AuthContext
      return { id: 'user-1', name: 'Demo User' };
    }
  };

  // 6. Implement AI API
  const aiApi: AIAPI = {
    summarize: async (text: string) => {
      return `Summary of: ${text.substring(0, 20)}...`;
    },
    suggestReply: async (context: string[]) => {
      return ["Sounds good!", "I'll check it out.", "Can we talk later?"];
    },
    // Core only methods
    generateCompletion: async (prompt: string) => {
      // In a real app, this would call a local LLM or secure backend
      console.log(`[Core AI] Generating completion for: ${prompt}`);
      return "This is a secure, zero-knowledge generated response.";
    },
    analyzeSentiment: async (text: string) => {
      return 0.8; // Positive
    }
  };

  // 7. Implement System API
  const systemApi: SystemAPI = {
    getVersion: () => '1.0.0-alpha',
    getPlatform: () => 'web',
    requestPermission: async (permission: ExtensionPermission) => {
      // TODO: Show permission dialog
      return true;
    },
    notify: (msg: string) => {
      console.log(`[System Notification] ${msg}`);
    },
    // Core only methods
    accessKernelMemory: async () => {
      console.warn("[System] Accessing kernel memory (Restricted)");
      return { heap: "secure_data" };
    },
    manageExtensions: async () => {
      console.log("[System] Opening extension manager");
    }
  };

  // 8. Implement Blockchain API (Core Only)
  const blockchainApi: BlockchainAPI = {
    connect: async () => {
      console.log("[Blockchain] Connecting wallet...");
      return true;
    },
    signMessage: async (message: string) => {
      console.log("[Blockchain] Signing message securely");
      return "0x_signed_hash";
    },
    verifyZKProof: async (proof: unknown) => {
      console.log("[Blockchain] Verifying Zero-Knowledge Proof");
      return true;
    },
    getWalletState: async () => {
      return { address: "0x123...core", chainId: 1 };
    }
  };

  // The full API (for Core use)
  const coreApi: TenchatAPI = {
    window: windowApi,
    messaging: messagingApi,
    ui: uiApi,
    storage: storageApi,
    user: userApi,
    ai: aiApi,
    system: systemApi,
    blockchain: blockchainApi
  };

  // Helper to get API for a specific extension
  const getApiForExtension = (manifest: ExtensionManifest): TenchatAPI => {
    const isCore = manifest.id.startsWith('ext-core-');
    
    if (isCore) {
      return coreApi;
    }

    // Return restricted API for user extensions
    return {
      window: windowApi,
      messaging: messagingApi,
      ui: uiApi,
      storage: storageApi,
      user: userApi,
      ai: {
        summarize: aiApi.summarize,
        suggestReply: aiApi.suggestReply
      },
      // System API is restricted/hidden
      system: {
        getVersion: systemApi.getVersion,
        getPlatform: systemApi.getPlatform,
        requestPermission: systemApi.requestPermission,
        notify: systemApi.notify
      }
      // No blockchain access
    };
  };

  const installExtension = async (manifest: ExtensionManifest, script: string) => {
    console.log(`Installing extension: ${manifest.name}`);
    setExtensions(prev => [...prev, manifest]);
    
    try {
        // When we execute the extension, we would pass the scoped API:
        const scopedApi = getApiForExtension(manifest);
        console.log("Extension installed with API scope:", Object.keys(scopedApi));
        // const func = new Function('api', script);
        // func(scopedApi);
    } catch (e) {
        console.error("Failed to install extension", e);
    }
  };

  return (
    <KernelContext.Provider value={{ api: coreApi, installExtension, extensions, registeredWidgets }}>
      {children}
    </KernelContext.Provider>
  );
}

export function useKernel() {
  const context = useContext(KernelContext);
  if (context === undefined) {
    throw new Error('useKernel must be used within a KernelProvider');
  }
  return context;
}
