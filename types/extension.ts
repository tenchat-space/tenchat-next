
import { ReactNode } from 'react';
import { ThemeMode, ColorPalette } from './theme';

export type ExtensionId = string;

export interface ExtensionManifest {
  id: ExtensionId;
  name: string;
  version: string;
  description: string;
  author: string;
  permissions: ExtensionPermission[];
  entryPoint?: string; // For script-based extensions
}

export type ExtensionPermission = 
  | 'window:manage' 
  | 'window:create'
  | 'messaging:read' 
  | 'messaging:send'
  | 'storage:read'
  | 'storage:write'
  | 'system:notification'
  | 'theme:control';

export interface TenchatAPI {
  // User Space APIs (Exposed to Extensions)
  window: WindowAPI;
  messaging: MessagingAPI;
  ui: UIAPI;
  storage: StorageAPI;
  user: UserAPI;
  ai: AIAPI;
  theme: ThemeAPI;
  
  // System Space APIs (Restricted to Core/Privileged Extensions)
  system?: SystemAPI;
  blockchain?: BlockchainAPI;
  network?: NetworkAPI;
}

export interface ThemeAPI {
  getMode: () => ThemeMode;
  getPalette: () => string;
  setPalette: (paletteId: string) => Promise<void>;
  setMode: (mode: ThemeMode) => Promise<void>;
}

export interface NetworkAPI {
  getStatus: () => 'connected' | 'connecting' | 'disconnected' | 'error';
  getBackendType: () => 'appwrite' | 'p2p' | 'custom';
  switchBackend: (type: 'appwrite' | 'p2p' | 'custom') => Promise<void>;
}

export interface BlockchainAPI {
  connect: () => Promise<boolean>;
  signMessage: (message: string) => Promise<string>;
  verifyZKProof: (proof: unknown, publicInputs: unknown) => Promise<boolean>;
  getWalletState: () => Promise<{ address: string; chainId: number }>;
}

export interface WindowAPI {
  open: (config: WindowConfig) => Promise<string>;
  close: (id: string) => Promise<void>;
  minimize: (id: string) => Promise<void>;
  maximize: (id: string) => Promise<void>;
  blur: (id: string, amount: number) => Promise<void>;
  lock: (id: string) => Promise<void>;
  // Future: screenshot, record, etc.
}

export interface UIAPI {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  registerWidget: (slot: ExtensionSlot, component: ReactNode) => void;
  registerMenuItem: (location: 'context-menu' | 'sidebar' | 'settings', label: string, action: () => void) => void;
}

export type ExtensionSlot = 
  | 'chat_header_action' 
  | 'chat_input_action' 
  | 'sidebar_panel' 
  | 'window_titlebar';

export interface StorageAPI {
  get: <T>(key: string) => Promise<T | null>;
  set: <T>(key: string, value: T) => Promise<void>;
  remove: (key: string) => Promise<void>;
}

export interface UserAPI {
  getCurrentUser: () => Promise<{ id: string; name: string } | null>;
  // No sensitive data like keys exposed here
}

export interface AIAPI {
  summarize: (text: string) => Promise<string>;
  suggestReply: (context: string[]) => Promise<string[]>;
  // Core only
  generateCompletion?: (prompt: string, context: unknown) => Promise<string>;
  analyzeSentiment?: (text: string) => Promise<number>;
}

export interface WindowConfig {
  title: string;
  component?: ReactNode; // For internal extensions
  scriptUrl?: string; // For external extensions
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  type?: string;
}

export interface MessagingAPI {
  send: (content: string, recipient: string) => Promise<void>;
  onReceive: (callback: (msg: unknown) => void) => () => void; // Returns unsubscribe
}

export interface SystemAPI {
  // Read-only system info (Public)
  getVersion: () => string;
  getPlatform: () => string;
  
  // Restricted actions (Core Only)
  requestPermission: (permission: ExtensionPermission) => Promise<boolean>;
  accessKernelMemory?: () => Promise<unknown>;
  manageExtensions?: () => Promise<void>;
  notify: (msg: string) => void;
  
  // System Theme Control
  registerPalette?: (id: string, palette: { light: ColorPalette; dark: ColorPalette }) => void;
}

export interface ExtensionInstance {
  manifest: ExtensionManifest;
  api: TenchatAPI;
  onInit: () => void;
  onDestroy: () => void;
}

