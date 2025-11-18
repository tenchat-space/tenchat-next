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
import { Avatar, Box, Divider, IconButton, Stack, Tooltip } from "@mui/material";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const communicationItems: SidebarItem[] = [
  { id: "chats", label: "Chats", icon: <ChatBubbleOutline /> },
  { id: "calls", label: "Calls", icon: <NotificationsNone /> },
  { id: "contacts", label: "Contacts", icon: <PersonAddOutlined /> },
];

const contentItems: SidebarItem[] = [
  { id: "stories", label: "Stories", icon: <BookmarkOutlined /> },
  { id: "channels", label: "Channels", icon: <GroupsOutlined /> },
];

const bottomItems: SidebarItem[] = [
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
  const renderItem = (item: SidebarItem, isActive: boolean, onClick: () => void) => (
    <Tooltip key={item.id} title={item.label} placement="right" arrow>
      <IconButton
        onClick={onClick}
        size="large"
        sx={{
          color: isActive ? "primary.main" : "text.secondary",
          bgcolor: isActive ? "rgba(124, 58, 237, 0.15)" : "transparent",
          "&:hover": {
            bgcolor: "rgba(124, 58, 237, 0.08)",
            color: "primary.light",
          },
          borderRadius: 3,
          width: 48,
          height: 48,
        }}
      >
        {item.icon}
      </IconButton>
    </Tooltip>
  );

  return (
    <Stack
      component="nav"
      sx={{
        width: 80,
        bgcolor: "background.paper",
        borderRight: 1,
        borderColor: "divider",
        px: 1.5,
        py: 3,
        alignItems: "center",
        justifyContent: "space-between",
        backgroundImage: "linear-gradient(180deg, rgba(250,204,21,0.05), transparent)",
        zIndex: 1200, // Ensure it's above other layers if needed
      }}
    >
      {/* Top Section: Logo & Main Nav */}
      <Stack spacing={3} alignItems="center">
        {/* Brand Icon */}
        <Box
            sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 16px rgba(124, 58, 237, 0.4)",
                mb: 1
            }}
        >
            <Typography variant="h6" fontWeight="bold" color="white">T</Typography>
        </Box>

        <Stack spacing={1.5}>
          {communicationItems.map((item) =>
            renderItem(item, activeLeftId === item.id, () => setActiveLeftId(item.id))
          )}
        </Stack>

        <Divider flexItem sx={{ width: "60%", mx: "auto !important" }} />

        <Stack spacing={1.5}>
          {contentItems.map((item) =>
            renderItem(item, activeLeftId === item.id, () => setActiveLeftId(item.id))
          )}
        </Stack>
      </Stack>

      {/* Bottom Section: User & Settings */}
      <Stack spacing={1.5} alignItems="center">
         {bottomItems.map((item) =>
            renderItem(item, activeRightId === item.id, () => setActiveRightId(item.id))
         )}
         <IconButton onClick={() => setActiveRightId('profile')} sx={{ p: 0, mt: 1 }}>
             <Avatar sx={{ width: 40, height: 40, border: activeRightId === 'profile' ? '2px solid #facc15' : 'none' }} />
         </IconButton>
      </Stack>
    </Stack>
  );
}
