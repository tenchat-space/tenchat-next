import { useState } from "react";
import {
  Box,
  Button,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Conversation, useMessages } from "@/hooks/useMessaging";

interface ChatWindowProps {
  conversation: Conversation | null;
  currentUserId: string;
  isAuthenticated: boolean;
  onConnect: () => void;
}

export function ChatWindow({
  conversation,
  currentUserId,
  isAuthenticated,
  onConnect,
}: ChatWindowProps) {
  const { messages, isLoading, sendMessage } = useMessages(conversation?.$id || "");
  const [composer, setComposer] = useState("");

  const handleSendMessage = async () => {
    if (!conversation || !composer.trim()) return;
    try {
      await sendMessage({
        conversationId: conversation.$id,
        senderId: currentUserId,
        content: composer.trim(),
        contentType: "text",
      });
      setComposer("");
    } catch (error) {
      console.error("Message send failed", error);
    }
  };

  const formatConversationLabel = (conv: Conversation) => {
    if (conv.name) return conv.name;
    if (conv.participantIds?.length === 2) {
      const other = conv.participantIds.find((id) => id !== currentUserId);
      return other || "Direct chat";
    }
    return "Tenchat room";
  };

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
        backgroundImage:
          "radial-gradient(circle at top right, rgba(250,204,21,0.15), transparent 55%), linear-gradient(160deg, rgba(124,58,237,0.7), transparent 65%)",
      }}
    >
      <Box sx={{ p: 3, borderBottom: 1, borderColor: "divider" }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack>
            <Typography variant="h5" sx={{ color: "secondary.main" }}>
              {conversation ? formatConversationLabel(conversation) : "Welcome to Tenchat"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isAuthenticated ? "Encrypted chat" : "Connect to your wallet to unlock messaging"}
            </Typography>
          </Stack>
          <Button
            variant="contained"
            color="secondary"
            onClick={onConnect}
            disabled={isAuthenticated}
          >
            {isAuthenticated ? "Connected" : "Connect"}
          </Button>
        </Stack>
      </Box>

      <Box sx={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <Box sx={{ flex: 1, overflowY: "auto", p: 3 }}>
          {isLoading ? (
            <Typography color="text.secondary">Loading messages...</Typography>
          ) : messages.length === 0 ? (
            <Typography color="text.secondary">
              {conversation ? "No messages yet. Say hello!" : "Select a conversation to begin."}
            </Typography>
          ) : (
            <Stack spacing={2}>
              {messages.map((message) => {
                const isSelf = message.senderId === currentUserId;
                return (
                  <Paper
                    key={message.$id}
                    sx={{
                      p: 2,
                      bgcolor: isSelf ? "primary.main" : "secondary.main",
                      color: isSelf ? "primary.contrastText" : "secondary.contrastText",
                      alignSelf: isSelf ? "flex-end" : "flex-start",
                      maxWidth: "70%",
                      boxShadow: "0 5px 20px rgba(7,3,18,0.4)",
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {isSelf ? "You" : message.senderId}
                    </Typography>
                    <Typography>{message.content}</Typography>
                  </Paper>
                );
              })}
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
              disabled={!conversation || !isAuthenticated}
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                borderRadius: 2,
                border: "1px solid rgba(250, 204, 21, 0.3)",
              }}
            />
            <Button
              variant="contained"
              color="secondary"
              onClick={handleSendMessage}
              disabled={!conversation || !isAuthenticated}
            >
              Send
            </Button>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}

