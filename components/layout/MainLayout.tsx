"use client";

import { useEffect, useMemo, useState } from "react";
import { Box } from "@mui/material";
import { useAppwrite } from "@/contexts/AppwriteContext";
import { useConversations, type Conversation } from "@/hooks/useMessaging";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { MainSidebar } from "@/components/navigation/MainSidebar";
import { ConversationList } from "@/components/chat/sidebar/ConversationList";
import { ChatWindow } from "@/components/chat/window/ChatWindow";
import { ProfilePanel } from "@/components/chat/info/ProfilePanel";

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

  const [activeLeftId, setActiveLeftId] = useState("chats");
  const [activeRightId, setActiveRightId] = useState("profile");
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  // Fetch conversations
  const { conversations, isLoading: convLoading } = useConversations(legacyUserId);

  // Determine active conversation
  const conversation = useMemo(
    () => selectedConversation || conversations[0] || null,
    [selectedConversation, conversations]
  );

  // Handle Auth Dialog
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
        setAuthDialogOpen(true);
    } else if (isAuthenticated) {
        setAuthDialogOpen(false);
    }
  }, [isAuthenticated, isLoading]);

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversation(conv);
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
          />
        );
      case 'stories':
        return <StoriesList />;
      case 'channels':
        return <ChannelList />;
      case 'contacts':
        return <ContactList />;
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
          />
        );
    }
  };

  return (
    <>
      <Box
        component="section"
        sx={{
          display: "flex",
          height: "100dvh",
          width: "100%",
          bgcolor: "background.default",
          overflow: "hidden",
        }}
      >
        <MainSidebar
          activeLeftId={activeLeftId}
          setActiveLeftId={setActiveLeftId}
          activeRightId={activeRightId}
          setActiveRightId={setActiveRightId}
        />

        {/* List Panel Area */}
        {renderListPanel()}

        <ChatWindow
          conversation={conversation}
          currentUserId={legacyUserId}
          isAuthenticated={isAuthenticated}
          onConnect={() => setAuthDialogOpen(true)}
        />

        <ProfilePanel
          currentAccount={currentAccount}
          logout={logout}
        />
      </Box>

      <AuthDialog open={authDialogOpen} onClose={() => setAuthDialogOpen(false)} />
    </>
  );
}
