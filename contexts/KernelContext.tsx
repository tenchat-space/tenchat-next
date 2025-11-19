"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useWindow } from './WindowContext';
import { TenchatAPI, WindowAPI, WindowConfig, ExtensionManifest } from '@/types/extension';

interface KernelContextType {
  api: TenchatAPI;
  installExtension: (manifest: ExtensionManifest, script: string) => Promise<void>;
  extensions: ExtensionManifest[];
}

const KernelContext = createContext<KernelContextType | undefined>(undefined);

export function KernelProvider({ children }: { children: ReactNode }) {
  const windowContext = useWindow();
  const [extensions, setExtensions] = useState<ExtensionManifest[]>([]);

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
  const messagingApi = {
    send: async (content: string, recipient: string) => {
      console.log(`[Kernel] Sending message to ${recipient}: ${content}`);
    },
    onReceive: (callback: (msg: unknown) => void) => {
      return () => {};
    }
  };

  // 3. Implement System API
  const systemApi = {
    notify: (msg: string) => {
      console.log(`[Kernel] Notification: ${msg}`);
    }
  };

  const api: TenchatAPI = {
    window: windowApi,
    messaging: messagingApi,
    system: systemApi
  };

  const installExtension = async (manifest: ExtensionManifest, script: string) => {
    console.log(`Installing extension: ${manifest.name}`);
    setExtensions(prev => [...prev, manifest]);
    
    // In a real implementation, we would:
    // 1. Validate permissions
    // 2. Store script in IndexedDB/LocalStorage
    // 3. Execute 'onInit' in a sandbox
    
    // For now, we just log it.
    try {
        // Dangerous! Only for demo. Real implementation needs iframe/worker sandbox.
        // const func = new Function('api', script);
        // func(api);
    } catch (e) {
        console.error("Failed to install extension", e);
    }
  };

  return (
    <KernelContext.Provider value={{ api, installExtension, extensions }}>
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
