import {
  Avatar,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  IconButton,
} from "@mui/material";
import { Call, VideoCall } from "@mui/icons-material";
import { SidebarPanel } from "./SidebarPanel";

const MOCK_CALLS = [
  { id: "1", name: "Alice Chen", time: "Today, 10:30 AM", type: "voice", status: "missed" },
  { id: "2", name: "Bob Smith", time: "Yesterday, 4:15 PM", type: "video", status: "outgoing" },
  { id: "3", name: "Alice Chen", time: "Mon, 9:00 AM", type: "voice", status: "incoming" },
];

export function CallHistory() {
  return (
    <SidebarPanel title="Calls" subtitle="Encrypted Voice & Video">
      <List>
        {MOCK_CALLS.map((call) => (
          <ListItemButton key={call.id}>
            <ListItemAvatar>
              <Avatar>{call.name[0]}</Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={call.name}
              secondary={
                <span style={{ color: call.status === "missed" ? "#ef4444" : "inherit" }}>
                  {call.status === "missed" ? "Missed call" : call.time}
                </span>
              }
            />
            <IconButton size="small" color="secondary">
              {call.type === "video" ? <VideoCall /> : <Call />}
            </IconButton>
          </ListItemButton>
        ))}
      </List>
    </SidebarPanel>
  );
}

