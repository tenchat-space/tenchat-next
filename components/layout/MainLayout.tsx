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

export function MainLayout() {
  const { currentAccount, currentUser, isAuthenticated, isLoading, logout } = useAppwrite();

  // Prepare legacy user object for compatibility if needed,
  // though we try to use IDs directly where possible.
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
    // Only show dialog if loading is done and user is not authenticated.
    // We use a timeout to avoid immediate flash or conflict with hydration if needed,
    // but here we just trust the isLoading flag.
    if (!isLoading && !isAuthenticated) {
        setAuthDialogOpen(true);
    } else if (isAuthenticated) {
        setAuthDialogOpen(false);
    }
  }, [isAuthenticated, isLoading]);

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversation(conv);
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
        }}
      >
        <MainSidebar
          activeLeftId={activeLeftId}
          setActiveLeftId={setActiveLeftId}
          activeRightId={activeRightId}
          setActiveRightId={setActiveRightId}
        />

        <ConversationList
          conversations={conversations}
          isLoading={convLoading}
          selectedConversation={conversation}
          onSelectConversation={handleSelectConversation}
          legacyUserId={legacyUserId}
        />

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
