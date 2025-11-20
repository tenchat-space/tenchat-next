
"use client";

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { TenchatThemeProvider } from '@/components/providers/TenchatThemeProvider';
import { AppwriteProvider } from "@/contexts/AppwriteContext";
import { AnimationProvider } from "@/contexts/AnimationContext";
import { StyleProvider } from "@/contexts/StyleContext";
import { ContextMenuProvider } from "@/contexts/ContextMenuContext";
import { WindowSystem } from '@/components/window/WindowSystem';

// Registry of components that can be popped out
// In a real app, this would be a dynamic registry or lazy loaded
import { CallWindow } from '@/components/window/CallWindow';
import { ChatWindow } from '@/components/chat/window/ChatWindow';
import { SettingsWindow } from '@/components/settings/SettingsWindow';
import { PerformanceWidget } from '@/components/performance/PerformanceWidget';
import { ExtensionManager } from '@/components/extensions/ExtensionManager';
// Import other components as needed

interface PopoutState {
  id?: string;
  title?: string;
  type?: string;
  props?: Record<string, unknown>;
}

function PopoutContent() {
  const searchParams = useSearchParams();
  const [component, setComponent] = useState<React.ReactNode>(null);
  const [popoutState, setPopoutState] = useState<PopoutState | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    channelRef.current = new BroadcastChannel('tenchat-popout');

    const handleBeforeUnload = () => {
      if (channelRef.current && popoutState?.id) {
        channelRef.current.postMessage({ type: 'popout-closed', windowId: popoutState.id });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Send message on unmount as well, just in case
      if (channelRef.current && popoutState?.id) {
        channelRef.current.postMessage({ type: 'popout-closed', windowId: popoutState.id });
      }
      channelRef.current?.close();
      channelRef.current = null;
    };
  }, [popoutState?.id]);

  useEffect(() => {
    const stateStr = searchParams.get('state');
    if (stateStr) {
      try {
        const state = JSON.parse(decodeURIComponent(stateStr));
        
        // Factory logic
        let comp = null;
        switch (state.type) {
          case 'CALL':
            comp = <CallWindow {...state.props} />;
            break;
          case 'CHAT':
            comp = <ChatWindow {...state.props} />;
            break;
          case 'SETTINGS':
            comp = <SettingsWindow />;
            break;
          case 'PERFORMANCE':
            comp = <PerformanceWidget />;
            break;
          case 'EXTENSION_MANAGER':
            comp = <ExtensionManager />;
            break;
          // Add other cases
          default:
            comp = <div>Unknown component type: {state.type}</div>;
        }
        
        // Use a timeout to break the synchronous update cycle if needed, 
        // or just accept it's an initialization effect.
        // For strict mode compliance:
        setTimeout(() => {
          setComponent(comp);
          setPopoutState(state);
        }, 0);
        
        // Set title
        document.title = state.title || 'TenChat Window';
      } catch (e) {
        console.error("Failed to restore window state", e);
      }
    }
  }, [searchParams]);

  if (!component) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ height: '100vh', bgcolor: 'background.default' }}>
      {component}
    </Box>
  );
}

export default function PopoutPage() {
  return (
    <StyleProvider>
      <TenchatThemeProvider>
        <AnimationProvider>
          <AppwriteProvider>
            <ContextMenuProvider>
              <WindowSystem>
                <Suspense fallback={<CircularProgress />}>
                  <PopoutContent />
                </Suspense>
              </WindowSystem>
            </ContextMenuProvider>
          </AppwriteProvider>
        </AnimationProvider>
      </TenchatThemeProvider>
    </StyleProvider>
  );
}
