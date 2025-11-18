import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { Conversation } from "@/hooks/useMessaging";

interface ConversationListProps {
  conversations: Conversation[];
  isLoading: boolean;
  selectedConversation: Conversation | null;
  onSelectConversation: (conv: Conversation) => void;
  legacyUserId?: string;
}

export function ConversationList({
  conversations,
  isLoading,
  selectedConversation,
  onSelectConversation,
  legacyUserId,
}: ConversationListProps) {
  const formatConversationLabel = (conv: Conversation) => {
    if (conv.name) return conv.name;
    if (conv.participantIds?.length === 2) {
      const other = conv.participantIds.find((id) => id !== legacyUserId);
      return other || "Direct chat";
    }
    return "Tenchat room";
  };

  return (
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
        {isLoading ? (
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
              selected={selectedConversation?.$id === conv.$id}
              onClick={() => onSelectConversation(conv)}
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
  );
}

