
import { ReactNode } from 'react';

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
  | 'system:notification';

export interface TenchatAPI {
  window: WindowAPI;
  messaging: MessagingAPI;
  system: SystemAPI;
}

export interface WindowAPI {
  open: (config: WindowConfig) => Promise<string>; // Returns window ID
  close: (id: string) => Promise<void>;
  minimize: (id: string) => Promise<void>;
  maximize: (id: string) => Promise<void>;
  blur: (id: string, amount: number) => Promise<void>; // Visual effect
  lock: (id: string) => Promise<void>; // Biometric lock
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
  onReceive: (callback: (msg: any) => void) => () => void; // Returns unsubscribe
}

export interface SystemAPI {
  notify: (msg: string) => void;
}

export interface ExtensionInstance {
  manifest: ExtensionManifest;
  api: TenchatAPI;
  onInit: () => void;
  onDestroy: () => void;
}
