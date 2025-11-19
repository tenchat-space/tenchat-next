"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { useAppwrite } from "@/contexts/AppwriteContext";
import { useConversations, type Conversation } from "@/hooks/useMessaging";
import { useWindowBridge } from "@/hooks/useWindowBridge";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { AuthOverlay } from "@/components/auth/AuthOverlay";
import { MainSidebar } from "@/components/navigation/MainSidebar";
import { BottomNav } from "@/components/navigation/BottomNav";
import { ConversationList } from "@/components/chat/sidebar/ConversationList";
import { ChatWindow } from "@/components/chat/window/ChatWindow";
import { ProfilePanel } from "@/components/chat/info/ProfilePanel";
import { WalletPanel } from "@/components/chat/info/WalletPanel";
import { SettingsDialog } from "@/components/settings/SettingsDialog";
import { NewChatDialog } from "@/components/chat/dialogs/NewChatDialog";
import { CreateChannelDialog } from "@/components/chat/dialogs/CreateChannelDialog";
import { StoryViewer } from "@/components/chat/window/StoryViewer";

// Views
import { StoriesList } from "@/components/chat/sidebar/views/StoriesList";
import { ChannelList } from "@/components/chat/sidebar/views/ChannelList";
import { ContactList } from "@/components/chat/sidebar/views/ContactList";
import { CallHistory } from "@/components/chat/sidebar/views/CallHistory";

export function MainLayout() {
  const { currentAccount, currentUser, isAuthenticated, isLoading, logout } = useAppwrite();

  const legacyUserId = useMemo(() => {
    return currentAccount?.$id || currentUser?.id || "";
  }, [currentAccount, currentUser]);
  const displayName = useMemo(() => {
    return currentAccount?.name || currentUser?.displayName || "You";
  }, [currentAccount, currentUser]);

  const [activeLeftId, setActiveLeftId] = useState("chats");
  const [activeRightId, setActiveRightId] = useState("profile");
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  
  // Dialog states
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [createChannelOpen, setCreateChannelOpen] = useState(false);
  const [storyViewerOpen, setStoryViewerOpen] = useState(false);

  // Fetch conversations
  const { conversations, isLoading: convLoading } = useConversations(legacyUserId, {
    userName: displayName,
  });
  const { openChatWindow, openCallWindow } = useWindowBridge();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Determine active conversation
  const conversation = useMemo(
    () => selectedConversation || conversations[0] || null,
    [selectedConversation, conversations]
  );

  // Handle Auth Dialog
  // useEffect(() => {
  //   if (!isLoading && !isAuthenticated) {
  //       setAuthDialogOpen(true);
  //   } else if (isAuthenticated) {
  //       setAuthDialogOpen(false);
  //   }
  // }, [isAuthenticated, isLoading]);

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversation(conv);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('application/tenchat-item');
    if (!data) return;

    try {
      const item = JSON.parse(data);
      if (item.type === 'chat') {
        const conv = conversations.find(c => c.$id === item.id);
        if (conv) {
          openChatWindow({
            conversation: conv,
            currentUserId: legacyUserId,
            isAuthenticated,
            onConnect: () => setAuthDialogOpen(true),
          });
        }
      } else if (item.type === 'call') {
        openCallWindow({
          callId: item.data.id,
          participant: item.data.name,
          type: item.data.type,
          status: item.data.status,
        });
      }
    } catch (err) {
      console.error('Failed to parse dropped item', err);
    }
  };

  const renderListPanel = () => {
    switch (activeLeftId) {
      case 'chats':
        return (
          <ConversationList
            conversations={conversations}
            isLoading={convLoading}
            selectedConversation={conversation}
            onSelectConversation={handleSelectConversation}
            legacyUserId={legacyUserId}
            isAuthenticated={isAuthenticated}
            onConnect={() => setAuthDialogOpen(true)}
          />
        );
      case 'stories':
        return <StoriesList onViewStory={() => setStoryViewerOpen(true)} />;
      case 'channels':
        return <ChannelList onCreateChannel={() => setCreateChannelOpen(true)} />;
      case 'contacts':
        return <ContactList onAddContact={() => setNewChatOpen(true)} />;
      case 'calls':
        return <CallHistory />;
      default:
        return (
          <ConversationList
            conversations={conversations}
            isLoading={convLoading}
            selectedConversation={conversation}
            onSelectConversation={handleSelectConversation}
            legacyUserId={legacyUserId}
            isAuthenticated={isAuthenticated}
            onConnect={() => setAuthDialogOpen(true)}
          />
        );
    }
  };

  return (
    <>
      <Box
        component="section"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        sx={{
          display: "flex",
          height: "100dvh",
          width: "100%",
          bgcolor: "background.default",
          overflow: "hidden",
          filter: !isAuthenticated && !isLoading ? 'blur(8px)' : 'none',
          pointerEvents: !isAuthenticated && !isLoading ? 'none' : 'auto',
          transition: 'filter 0.3s ease',
          flexDirection: isMobile ? "column" : "row",
        }}
      >
        {!isMobile && (
          <MainSidebar
            activeLeftId={activeLeftId}
            setActiveLeftId={setActiveLeftId}
            activeRightId={activeRightId}
            setActiveRightId={(id) => {
              if (id === 'settings') {
                  setSettingsOpen(true);
              } else {
                  setActiveRightId(id);
              }
            }}
          />
        )}

        {/* List Panel Area - Hidden on mobile if chat is open, or handled differently */}
        <Box sx={{ 
          display: isMobile && conversation ? 'none' : 'block',
          width: isMobile ? '100%' : 'auto',
          height: isMobile ? 'calc(100% - 80px)' : '100%', // Space for bottom nav
        }}>
          {renderListPanel()}
        </Box>

        {/* Chat Window - Full screen on mobile */}
        <Box sx={{ 
          flex: 1, 
          display: isMobile && !conversation ? 'none' : 'flex',
          height: isMobile ? 'calc(100% - 80px)' : '100%',
          position: 'relative'
        }}>
          <ChatWindow
            conversation={conversation}
            currentUserId={legacyUserId}
            isAuthenticated={isAuthenticated}
            onConnect={() => setAuthDialogOpen(true)}
          />
        </Box>

        {/* Right Panel Area - Hidden on mobile usually, or drawer */}
        {!isMobile && activeRightId === 'profile' && (
            <ProfilePanel
              currentAccount={currentAccount}
              logout={logout}
              onOpenSettings={() => setSettingsOpen(true)}
            />
        )}
        {!isMobile && activeRightId === 'wallet' && (
            <WalletPanel />
        )}

        {isMobile && (
          <BottomNav
            activeLeftId={activeLeftId}
            setActiveLeftId={(id) => {
              setActiveLeftId(id);
              // If switching tabs, clear conversation to show list
              if (id !== 'chats') setSelectedConversation(null);
            }}
            activeRightId={activeRightId}
            setActiveRightId={(id) => {
              if (id === 'settings') {
                  setSettingsOpen(true);
              } else {
                  setActiveRightId(id);
              }
            }}
          />
        )}
      </Box>

      {/* Dialogs and Overlays */}
      <AuthOverlay />
      <AuthDialog open={authDialogOpen} onClose={() => setAuthDialogOpen(false)} />
      
      <SettingsDialog 
        open={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
        currentUser={currentAccount} 
      />

      <NewChatDialog 
        open={newChatOpen}
        onClose={() => setNewChatOpen(false)}
      />

      <CreateChannelDialog 
        open={createChannelOpen}
        onClose={() => setCreateChannelOpen(false)}
      />

      <StoryViewer 
        open={storyViewerOpen}
        onClose={() => setStoryViewerOpen(false)}
      />
    </>
  );
}
