"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  BookmarkOutlined,
  ChatBubbleOutline,
  GroupsOutlined,
  NotificationsNone,
  PersonAddOutlined,
  PersonOutline,
  SettingsOutlined,
  WalletOutlined,
} from "@mui/icons-material";
import { useAppwrite } from "@/contexts/AppwriteContext";
import { useConversations, useMessages } from "@/hooks/useMessaging";
import { Conversations } from "@/types/appwrite.d";
import { AuthDialog } from "@/components/auth/AuthDialog";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const leftItems: SidebarItem[] = [
  { id: "chats", label: "Chats", icon: <ChatBubbleOutline /> },
  { id: "stories", label: "Stories", icon: <BookmarkOutlined /> },
  { id: "channels", label: "Channels", icon: <GroupsOutlined /> },
  { id: "contacts", label: "Contacts", icon: <PersonAddOutlined /> },
  { id: "calls", label: "Calls", icon: <NotificationsNone /> },
];

const rightItems: SidebarItem[] = [
  { id: "profile", label: "Profile", icon: <PersonOutline /> },
  { id: "wallet", label: "Wallet", icon: <WalletOutlined /> },
  { id: "settings", label: "Settings", icon: <SettingsOutlined /> },
];

export function MainLayout() {
  const { currentAccount, currentUser, isAuthenticated, isLoading, logout } = useAppwrite();
  const legacyUser = useMemo(() => {
    if (!currentAccount && !currentUser) return null;
    return {
      id: currentAccount?.$id || currentUser?.id || "",
      displayName: currentAccount?.name || currentUser?.displayName || "Tenchat User",
      createdAt: currentAccount?.$createdAt ? new Date(currentAccount.$createdAt) : new Date(),
      lastSeen: currentUser?.lastSeen ? new Date(currentUser.lastSeen) : new Date(),
      identity: currentAccount
        ? {
            id: currentAccount.$id,
            publicKey: "",
            identityKey: "",
            signedPreKey: "",
            oneTimePreKeys: [],
          }
        : {
            id: currentUser?.id || "",
            publicKey: "",
            identityKey: "",
            signedPreKey: "",
            oneTimePreKeys: [],
          },
    };
  }, [currentAccount, currentUser]);

  const [activeLeftId, setActiveLeftId] = useState("chats");
  const [activeRightId, setActiveRightId] = useState("profile");
  const [selectedConversation, setSelectedConversation] = useState<Conversations | null>(null);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  const { conversations, isLoading: convLoading } = useConversations(legacyUser?.id || "");
  const conversation = useMemo(
    () => selectedConversation || conversations[0] || null,
    [selectedConversation, conversations]
  );

  const { messages, isLoading: messagesLoading, sendMessage } = useMessages(conversation?.$id || "");

  const [composer, setComposer] = useState("");

  useEffect(() => {
    if (!isLoading) {
      setAuthDialogOpen(!isAuthenticated);
    }
  }, [isAuthenticated, isLoading]);

  const handleSelectConversation = (conv: Conversations) => {
    setSelectedConversation(conv);
  };

  const handleSendMessage = async () => {
    if (!conversation || !composer.trim()) return;
    try {
      await sendMessage({
        conversationId: conversation.$id,
        senderId: legacyUser?.id || "",
        content: composer.trim(),
        contentType: "text",
      });
      setComposer("");
    } catch (error) {
      console.error("Message send failed", error);
    }
  };

  const formatConversationLabel = (conv: Conversations) => {
    if (conv.name) return conv.name;
    if (conv.participantIds?.length === 2) {
      const other = conv.participantIds.find((id) => id !== legacyUser?.id);
      return other || "Direct chat";
    }
    return "Tenchat room";
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
        <Stack
          spacing={2}
          sx={{
            width: 88,
            bgcolor: "background.paper",
            borderRight: 1,
            borderColor: "divider",
            px: 1,
            py: 2,
            alignItems: "center",
            backgroundImage: "linear-gradient(180deg, rgba(250,204,21,0.15), transparent)",
          }}
        >
          {leftItems.map((item) => (
            <IconButton
              key={item.id}
              color={activeLeftId === item.id ? "primary" : "default"}
              onClick={() => setActiveLeftId(item.id)}
              size="large"
            >
              {item.icon}
            </IconButton>
          ))}
          <Divider flexItem sx={{ mt: 2 }} />
          {rightItems.map((item) => (
            <IconButton
              key={item.id}
              color={activeRightId === item.id ? "primary" : "default"}
              onClick={() => setActiveRightId(item.id)}
              size="large"
            >
              {item.icon}
            </IconButton>
          ))}
        </Stack>

        <Box
          sx={{
            width: 320,
            bgcolor: "background.paper",
            borderRight: 1,
            borderColor: "divider",
            backgroundImage: "linear-gradient(180deg, rgba(124,58,237,0.15), rgba(15,23,42,0.95))",
          }}
        >
          <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
            <Typography variant="h6" sx={{ color: "secondary.main" }}>
              Conversations
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {conversations.length} chats
            </Typography>
          </Box>

          <List
            sx={{
              maxHeight: "calc(100dvh - 120px)",
              overflow: "auto",
              backgroundColor: "background.paper",
              borderRadius: 2,
              boxShadow: "0 10px 30px rgba(7,3,18,0.6)",
            }}
          >
            {convLoading ? (
              <Typography sx={{ p: 2 }} color="text.secondary">
                Loading conversations...
              </Typography>
            ) : conversations.length === 0 ? (
              <Typography sx={{ p: 2 }} color="text.secondary">
                Connect to Tenchat to see your conversations.
              </Typography>
            ) : (
              conversations.map((conv) => (
                <ListItemButton
                  key={conv.$id}
                  selected={conversation?.$id === conv.$id}
                  onClick={() => handleSelectConversation(conv)}
                >
                  <ListItemText
                    primary={formatConversationLabel(conv)}
                    secondary={conv.lastMessageText || "No messages yet"}
                  />
                </ListItemButton>
              ))
            )}
          </List>
        </Box>

        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            bgcolor: "background.default",
          }}
        >
          <Box sx={{ p: 3, borderBottom: 1, borderColor: "divider" }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack>
                <Typography variant="h5">
                  {conversation ? formatConversationLabel(conversation) : "Welcome to Tenchat"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {isAuthenticated ? "Encrypted chat" : "Connect to your wallet to unlock messaging"}
                </Typography>
              </Stack>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => setAuthDialogOpen(true)}
            disabled={isAuthenticated}
          >
            {isAuthenticated ? "Connected" : "Connect"}
          </Button>
            </Stack>
          </Box>

          <Box sx={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <Box sx={{ flex: 1, overflowY: "auto", p: 3 }}>
              {messagesLoading ? (
                <Typography color="text.secondary">Loading messages...</Typography>
              ) : messages.length === 0 ? (
                <Typography color="text.secondary">
                  {conversation ? "No messages yet. Say hello!" : "Select a conversation to begin."}
                </Typography>
              ) : (
                <Stack spacing={2}>
                  {messages.map((message) => (
                    <Paper
                      key={message.$id}
                      sx={{
                        p: 2,
                        bgcolor: message.senderId === legacyUser?.id ? "primary.main" : "background.paper",
                        color: message.senderId === legacyUser?.id ? "primary.contrastText" : "text.primary",
                        alignSelf: message.senderId === legacyUser?.id ? "flex-end" : "flex-start",
                        maxWidth: "70%",
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {message.senderId === legacyUser?.id ? "You" : message.senderId}
                      </Typography>
                      <Typography>{message.content}</Typography>
                    </Paper>
                  ))}
                </Stack>
              )}
            </Box>

            <Divider />

            <Box sx={{ p: 2 }}>
              <Stack direction="row" spacing={2}>
                <TextField
                  fullWidth
                  placeholder="Write a secure message..."
                  value={composer}
                  onChange={(event) => setComposer(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
              <Button variant="contained" color="secondary" onClick={handleSendMessage}>
                Send
              </Button>
              </Stack>
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            width: 280,
            bgcolor: "background.paper",
            borderLeft: 1,
            borderColor: "divider",
            p: 3,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <Avatar src="">
              {currentAccount?.name?.[0] || "U"}
            </Avatar>
            <Box>
              <Typography variant="subtitle1">
                {currentAccount?.name || "Guest"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {currentAccount?.email || "Not signed in"}
              </Typography>
            </Box>
            <IconButton onClick={logout}>
              <SettingsOutlined />
            </IconButton>
          </Stack>

          <Button variant="outlined" onClick={logout}>
            Logout
          </Button>

          <Divider />

          <Stack spacing={1}>
            <Typography variant="subtitle2" sx={{ color: "secondary.main" }}>
              Right panel quick actions
            </Typography>
            <Button fullWidth variant="contained" color="secondary">
              Create channel
            </Button>
            <Button fullWidth variant="outlined" sx={{ borderColor: "secondary.main", color: "secondary.main" }}>
              Wallet / NFTs
            </Button>
          </Stack>
        </Box>
      </Box>

      <AuthDialog open={authDialogOpen} onClose={() => setAuthDialogOpen(false)} />
    </>
  );
}

