"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { WindowContextType, WindowInstance, WindowTab } from '@/types/window';

const WindowContext = createContext<WindowContextType | undefined>(undefined);

export function WindowProvider({ children }: { children: ReactNode }) {
  const [windows, setWindows] = useState<WindowInstance[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [nextZIndex, setNextZIndex] = useState(1000);

  const focusWindow = useCallback((id: string) => {
    setActiveWindowId(id);
    setWindows(prev => prev.map(w => {
      if (w.id === id) {
        return { ...w, zIndex: nextZIndex, lastInteraction: Date.now() };
      }
      return w;
    }));
    setNextZIndex(prev => prev + 1);
  }, [nextZIndex]);

  const openWindow = useCallback((item: Omit<WindowTab, 'id'> & { id?: string }, options?: { position?: { x: number, y: number }, size?: { width: number, height: number } }) => {
    const newId = item.id || `window-${Date.now()}`;
    
    // Check if window with this ID already exists (if ID provided)
    if (item.id) {
        const existing = windows.find(w => w.id === item.id || w.tabs.some(t => t.id === item.id));
        if (existing) {
            if (existing.isMinimized) {
                restoreWindow(existing.id);
            }
            focusWindow(existing.id);
            return;
        }
    }

    const newTab: WindowTab = {
      id: item.id || `tab-${Date.now()}`,
      title: item.title,
      type: item.type,
      component: item.component,
      props: item.props,
    };

    const newWindow: WindowInstance = {
      id: newId,
      tabs: [newTab],
      activeTabId: newTab.id,
      position: options?.position || { x: 100 + (windows.length * 20), y: 100 + (windows.length * 20) },
      size: options?.size || { width: 400, height: 500 },
      isMinimized: false,
      isMaximized: false,
      isPoppedOut: false,
      zIndex: nextZIndex,
      lastInteraction: Date.now(),
      isBlurred: false,
      blurAmount: 0,
      isLocked: false,
    };

    setWindows(prev => [...prev, newWindow]);
    setNextZIndex(prev => prev + 1);
    setActiveWindowId(newId);
  }, [windows, nextZIndex, focusWindow]);

  const closeWindow = useCallback((id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
  }, [activeWindowId]);

  const minimizeWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: true } : w));
    if (activeWindowId === id) setActiveWindowId(null);
  }, [activeWindowId]);

  const maximizeWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMaximized: true, isMinimized: false } : w));
    focusWindow(id);
  }, [focusWindow]);

  const restoreWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: false, isMaximized: false } : w));
    focusWindow(id);
  }, [focusWindow]);

  const moveWindow = useCallback((id: string, position: { x: number; y: number }) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, position } : w));
  }, []);

  const resizeWindow = useCallback((id: string, size: { width: number; height: number }) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, size } : w));
  }, []);

  const dockWindow = useCallback((id: string) => {
      minimizeWindow(id);
  }, [minimizeWindow]);

  const mergeWindows = useCallback((sourceId: string, targetId: string) => {
      setWindows(prev => {
          const source = prev.find(w => w.id === sourceId);
          const target = prev.find(w => w.id === targetId);
          if (!source || !target) return prev;

          const newTabs = [...target.tabs, ...source.tabs];
          
          // Remove source, update target
          return prev
              .filter(w => w.id !== sourceId)
              .map(w => w.id === targetId ? { ...w, tabs: newTabs, activeTabId: source.activeTabId } : w);
      });
      focusWindow(targetId);
  }, [focusWindow]);

  const popOutWindow = useCallback((id: string) => {
      const windowInstance = windows.find(w => w.id === id);
      if (!windowInstance) return;

      // Serialize state
      const state = encodeURIComponent(JSON.stringify({
        title: windowInstance.tabs[0].title,
        type: windowInstance.tabs[0].type,
        props: windowInstance.tabs[0].props
      }));

      // Open real window
      const width = windowInstance.size.width;
      const height = windowInstance.size.height;
      const left = window.screenX + windowInstance.position.x;
      const top = window.screenY + windowInstance.position.y;

      const popup = window.open(
        `/popout?state=${state}`, 
        id, 
        `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`
      );

      if (popup) {
        // Mark as popped out in state (hides it from virtual desktop but keeps it alive in logic if needed)
        setWindows(prev => prev.map(w => w.id === id ? { ...w, isPoppedOut: true } : w));
        
        // Optional: Setup BroadcastChannel for bi-directional sync
      }
  }, [windows]);

  const setWindowBlur = useCallback((id: string, blurred: boolean, amount: number = 10) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isBlurred: blurred, blurAmount: amount } : w));
  }, []);

  const setWindowLock = useCallback((id: string, locked: boolean) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isLocked: locked } : w));
  }, []);

  return (
    <WindowContext.Provider value={{
      windows,
      activeWindowId,
      openWindow,
      closeWindow,
      minimizeWindow,
      maximizeWindow,
      restoreWindow,
      focusWindow,
      moveWindow,
      resizeWindow,
      dockWindow,
      mergeWindows,
      popOutWindow,
      setWindowBlur,
      setWindowLock
    }}>
      {children}
    </WindowContext.Provider>
  );
}

export function useWindow() {
  const context = useContext(WindowContext);
  if (context === undefined) {
    throw new Error('useWindow must be used within a WindowProvider');
  }
  return context;
}
