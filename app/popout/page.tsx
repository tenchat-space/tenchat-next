
"use client";

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { TenchatThemeProvider } from '@/components/providers/TenchatThemeProvider';

// Registry of components that can be popped out
// In a real app, this would be a dynamic registry or lazy loaded
import { CallWindow } from '@/components/window/CallWindow';
import { ChatWindow } from '@/components/chat/window/ChatWindow';
// Import other components as needed

function PopoutContent() {
  const searchParams = useSearchParams();
  const [component, setComponent] = useState<React.ReactNode>(null);

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
          // Add other cases
          default:
            comp = <div>Unknown component type: {state.type}</div>;
        }
        
        // Use a timeout to break the synchronous update cycle if needed, 
        // or just accept it's an initialization effect.
        // For strict mode compliance:
        setTimeout(() => setComponent(comp), 0);
        
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
    <TenchatThemeProvider>
      <Suspense fallback={<CircularProgress />}>
        <PopoutContent />
      </Suspense>
    </TenchatThemeProvider>
  );
}
