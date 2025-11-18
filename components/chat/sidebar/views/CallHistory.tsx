import {
  Avatar,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Stack,
  Typography,
  Paper,
  MenuList,
  MenuItem,
  ListItemIcon,
} from "@mui/material";
import { Call, VideoCall, OpenInNew } from "@mui/icons-material";
import { SidebarPanel } from "./SidebarPanel";
import { useWindowBridge } from "@/hooks/useWindowBridge";
import { useContextMenu } from "@/contexts/ContextMenuContext";

const MOCK_CALLS = [
  { id: "1", name: "Alice Chen", time: "Today, 10:30 AM", type: "voice", status: "missed" },
  { id: "2", name: "Bob Smith", time: "Yesterday, 4:15 PM", type: "video", status: "outgoing" },
  { id: "3", name: "Alice Chen", time: "Mon, 9:00 AM", type: "voice", status: "incoming" },
];

export function CallHistory() {
  const { openCallWindow } = useWindowBridge();
  const { showMenu, hideMenu } = useContextMenu();

  const handleOpenCall = (call: (typeof MOCK_CALLS)[number]) => {
    openCallWindow({
      callId: call.id,
      participant: call.name,
      type: call.type as 'voice' | 'video',
      status: call.status,
    });
  };

  return (
    <SidebarPanel title="Calls" subtitle="Encrypted Voice & Video">
      <List>
        {MOCK_CALLS.map((call) => (
          <ListItemButton 
            key={call.id} 
            onClick={() => handleOpenCall(call)}
            onContextMenu={(e) => {
              e.preventDefault();
              showMenu(e.clientX, e.clientY, (
                <Paper sx={{ width: 220, maxWidth: '100%' }} elevation={4}>
                  <MenuList>
                    <MenuItem onClick={() => {
                      handleOpenCall(call);
                      hideMenu();
                    }}>
                      <ListItemIcon>
                        <OpenInNew fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Open in New Window</ListItemText>
                    </MenuItem>
                  </MenuList>
                </Paper>
              ));
            }}
          >
            <ListItemAvatar>
              <Avatar>{call.name[0]}</Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={call.name}
              secondary={
                <Stack direction="row" spacing={1} alignItems="center" sx={{ color: call.status === "missed" ? "#ef4444" : "inherit" }}>
                  <Typography variant="caption" component="span">
                    {call.status === "missed" ? "Missed call" : call.time}
                  </Typography>
                  <Typography variant="caption" component="span" color="text.secondary">
                    • {call.status}
                  </Typography>
                </Stack>
              }
            />
          </ListItemButton>
        ))}
      </List>
    </SidebarPanel>
  );
}

