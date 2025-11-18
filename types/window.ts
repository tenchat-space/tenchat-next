import { ReactNode } from 'react';

export type WindowContentType = 'CHAT' | 'CALL' | 'PROFILE' | 'SETTINGS' | 'CUSTOM';

export interface WindowTab {
  id: string;
  title: string;
  type: WindowContentType;
  component?: ReactNode; // For direct component injection
  props?: any;
}

export interface WindowInstance {
  id: string;
  tabs: WindowTab[];
  activeTabId: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMinimized: boolean;
  isMaximized: boolean; // Virtual maximization (fills viewport)
  isPoppedOut: boolean; // Real window pop-out
  zIndex: number;
}

export interface WindowContextType {
  windows: WindowInstance[];
  activeWindowId: string | null;
  openWindow: (item: Omit<WindowTab, 'id'> & { id?: string }, options?: { position?: { x: number, y: number }, size?: { width: number, height: number } }) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  moveWindow: (id: string, position: { x: number; y: number }) => void;
  resizeWindow: (id: string, size: { width: number; height: number }) => void;
  dockWindow: (id: string) => void; // Minimize to pocket
  mergeWindows: (sourceId: string, targetId: string) => void;
  popOutWindow: (id: string) => void; // Open in real window
}
