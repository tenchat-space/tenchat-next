import {
  BookmarkOutlined,
  ChatBubbleOutline,
  GroupsOutlined,
  NotificationsNone,
  PersonAddOutlined,
  WalletOutlined,
} from "@mui/icons-material";
import { Avatar, Box, IconButton, Paper, Stack, Tooltip } from "@mui/material";
import { useTheme, alpha } from '@mui/material/styles';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const mainItems: SidebarItem[] = [
  { id: "chats", label: "Chats", icon: <ChatBubbleOutline /> },
  { id: "calls", label: "Calls", icon: <NotificationsNone /> },
  { id: "contacts", label: "Contacts", icon: <PersonAddOutlined /> },
  { id: "stories", label: "Stories", icon: <BookmarkOutlined /> },
  { id: "channels", label: "Channels", icon: <GroupsOutlined /> },
];

interface BottomNavProps {
  activeLeftId: string;
  setActiveLeftId: (id: string) => void;
  activeRightId: string;
  setActiveRightId: (id: string) => void;
}

export function BottomNav({
  activeLeftId,
  setActiveLeftId,
  activeRightId,
  setActiveRightId,
}: BottomNavProps) {
  const theme = useTheme();

  const renderItem = (item: SidebarItem, isActive: boolean, onClick: () => void) => (
    <Tooltip key={item.id} title={item.label} placement="top" arrow>
      <IconButton
        onClick={onClick}
        size="medium"
        sx={{
          color: isActive ? "primary.main" : "text.secondary",
          bgcolor: isActive ? alpha(theme.palette.primary.main, 0.15) : "transparent",
          "&:hover": {
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            color: "primary.light",
            transform: "translateY(-2px)",
          },
          borderRadius: 3,
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {item.icon}
      </IconButton>
    </Tooltip>
  );

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1200,
        width: "calc(100% - 32px)",
        maxWidth: 500,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          borderRadius: 4,
          p: 1,
          bgcolor: alpha(theme.palette.background.paper, 0.85),
          backdropFilter: "blur(20px) saturate(180%)",
          border: "1px solid",
          borderColor: alpha(theme.palette.divider, 0.1),
          boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.4)}`,
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          {mainItems.map((item) =>
            renderItem(item, activeLeftId === item.id, () => setActiveLeftId(item.id))
          )}
          
          <Box sx={{ width: 1, height: 24, bgcolor: "divider", mx: 0.5 }} />

          <IconButton
            onClick={() => setActiveRightId("wallet")}
            size="medium"
            sx={{
              color: activeRightId === "wallet" ? "secondary.main" : "text.secondary",
            }}
          >
            <WalletOutlined />
          </IconButton>

          <IconButton 
            onClick={() => setActiveRightId("profile")}
            sx={{ 
              p: 0.5,
              border: activeRightId === "profile" ? "2px solid" : "2px solid transparent",
              borderColor: "secondary.main",
            }}
          >
            <Avatar sx={{ width: 28, height: 28 }} />
          </IconButton>
        </Stack>
      </Paper>
    </Box>
  );
}
