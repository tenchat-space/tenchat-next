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
import { Divider, IconButton, Stack } from "@mui/material";

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

interface MainSidebarProps {
  activeLeftId: string;
  setActiveLeftId: (id: string) => void;
  activeRightId: string;
  setActiveRightId: (id: string) => void;
}

export function MainSidebar({
  activeLeftId,
  setActiveLeftId,
  activeRightId,
  setActiveRightId,
}: MainSidebarProps) {
  return (
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
  );
}

