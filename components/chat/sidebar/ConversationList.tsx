import {
  ListItemButton,
  ListItemText,
  Typography,
  Fab,
  IconButton,
  Stack,
} from "@mui/material";
import { Edit, OpenInNew } from "@mui/icons-material";
import { Conversation } from "@/hooks/useMessaging";
import { SidebarPanel } from "./views/SidebarPanel";
import { useWindowBridge } from "@/hooks/useWindowBridge";

interface ConversationListProps {
  conversations: Conversation[];
  isLoading: boolean;
  selectedConversation: Conversation | null;
  onSelectConversation: (conv: Conversation) => void;
  legacyUserId?: string;
  isAuthenticated: boolean;
  onConnect: () => void;
}

export function ConversationList({
  conversations,
  isLoading,
  selectedConversation,
  onSelectConversation,
  legacyUserId,
  isAuthenticated,
  onConnect,
}: ConversationListProps) {
  const formatConversationLabel = (conv: Conversation) => {
    if (conv.name) return conv.name;
    if (conv.participantIds?.length === 2) {
      const other = conv.participantIds.find((id) => id !== legacyUserId);
      return other || "Direct chat";
    }
    return "Tenchat room";
  };
  const { openChatWindow } = useWindowBridge();

  return (
    <SidebarPanel
      title="Conversations"
      subtitle={`${conversations.length} chats`}
      actions={
        <Fab size="small" color="secondary" aria-label="new chat">
          <Edit fontSize="small" />
        </Fab>
      }
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
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ width: '100%' }}>
                    <ListItemText
                      primary={formatConversationLabel(conv)}
                      secondary={conv.lastMessageText || "No messages yet"}
                      secondaryTypographyProps={{
                        noWrap: true,
                        color: selectedConversation?.$id === conv.$id ? 'primary.light' : 'text.secondary'
                      }}
                      sx={{ flex: 1 }}
                    />
                    <IconButton
                      size="small"
                      edge="end"
                      onClick={(event) => {
                        event.stopPropagation();
                        openChatWindow({
                          conversation: conv,
                          currentUserId: legacyUserId || '',
                          isAuthenticated,
                          onConnect,
                        });
                      }}
                      aria-label="Open in window"
                    >
                      <OpenInNew fontSize="small" />
                    </IconButton>
                  </Stack>
          </ListItemButton>
        ))
      )}
    </SidebarPanel>
  );
}
