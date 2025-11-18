import {
  Avatar,
  Box,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Typography,
  Fab,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { SidebarPanel } from "./SidebarPanel";

const MOCK_STORIES = [
  { id: "1", name: "Your Story", time: "Tap to add", isUser: true },
  { id: "2", name: "Alice Chen", time: "2m ago", viewed: false },
  { id: "3", name: "Bob Smith", time: "1h ago", viewed: false },
  { id: "4", name: "Charlie Da", time: "5h ago", viewed: true },
];

interface StoriesListProps {
  onViewStory: (id: string) => void;
}

export function StoriesList({ onViewStory }: StoriesListProps) {
  return (
    <SidebarPanel
      title="Stories"
      subtitle="Share moments securely"
      actions={
        <Fab size="small" color="secondary" aria-label="add story">
          <Add />
        </Fab>
      }
    >
      <List>
        {MOCK_STORIES.map((story) => (
          <ListItemButton key={story.id} onClick={() => !story.isUser && onViewStory(story.id)}>
            <ListItemAvatar>
              <Box sx={{ position: "relative" }}>
                <Avatar
                  src=""
                  sx={{
                    border: story.isUser
                      ? "2px dashed"
                      : story.viewed
                      ? "2px solid gray"
                      : "2px solid #facc15",
                    borderColor: story.isUser ? "text.secondary" : undefined,
                  }}
                >
                  {story.name[0]}
                </Avatar>
                {story.isUser && (
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: -2,
                      right: -2,
                      bgcolor: "secondary.main",
                      borderRadius: "50%",
                      width: 16,
                      height: 16,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "2px solid",
                      borderColor: "background.paper",
                    }}
                  >
                    <Add sx={{ fontSize: 12, color: "black" }} />
                  </Box>
                )}
              </Box>
            </ListItemAvatar>
            <ListItemText
              primary={story.name}
              secondary={story.time}
              primaryTypographyProps={{ fontWeight: 500 }}
            />
          </ListItemButton>
        ))}
      </List>
      
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography variant="caption" color="text.secondary">
          Stories are encrypted and disappear after 24h.
        </Typography>
      </Box>
    </SidebarPanel>
  );
}
