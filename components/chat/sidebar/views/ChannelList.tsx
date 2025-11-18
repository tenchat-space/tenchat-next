import {
  Avatar,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Button,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { SidebarPanel } from "./SidebarPanel";

const MOCK_CHANNELS = [
  { id: "1", name: "Ten Protocol Updates", subscribers: "12.5K", description: "Official updates" },
  { id: "2", name: "Crypto News", subscribers: "5.2K", description: "Daily crypto digest" },
  { id: "3", name: "AI Research", subscribers: "8.9K", description: "Latest in LLMs" },
];

export function ChannelList() {
  return (
    <SidebarPanel
      title="Channels"
      subtitle="Broadcasts & Communities"
      actions={
        <Button startIcon={<Add />} size="small" variant="text" color="secondary">
          New
        </Button>
      }
    >
      <List>
        {MOCK_CHANNELS.map((channel) => (
          <ListItemButton key={channel.id}>
            <ListItemAvatar>
              <Avatar variant="rounded" sx={{ bgcolor: "primary.main" }}>
                {channel.name[0]}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={channel.name}
              secondary={`${channel.subscribers} subs • ${channel.description}`}
              secondaryTypographyProps={{ noWrap: true }}
            />
          </ListItemButton>
        ))}
      </List>
    </SidebarPanel>
  );
}

