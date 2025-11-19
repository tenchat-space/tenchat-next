import {
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  Stack,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Chip,
} from "@mui/material";
import {
  SettingsOutlined,
  AccountBalanceWalletOutlined,
  SecurityOutlined,
  VerifiedUserOutlined,
} from "@mui/icons-material";
import { Models } from "appwrite";
import { useTheme, alpha } from '@mui/material/styles';

interface ProfilePanelProps {
  currentAccount: Models.User<Models.Preferences> | null;
  logout: () => Promise<void>;
  onOpenSettings: () => void;
}

export function ProfilePanel({ currentAccount, logout, onOpenSettings }: ProfilePanelProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        width: 280,
        bgcolor: "background.paper",
        borderLeft: 1,
        borderColor: "divider",
        p: 3,
        display: "flex",
        flexDirection: "column",
        gap: 3,
        backgroundImage:
          `linear-gradient(120deg, ${alpha(theme.palette.secondary.main, 0.1)}, ${alpha(theme.palette.primary.main, 0.05)})`,
        overflowY: "auto",
      }}
    >
      {/* User Profile Header */}
      <Stack direction="row" alignItems="center" spacing={1}>
        <Avatar
          src=""
          sx={{ width: 48, height: 48, border: "2px solid", borderColor: "secondary.main" }}
        >
          {currentAccount?.name?.[0] || "U"}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" fontWeight={600} noWrap>
            {currentAccount?.name || "Guest User"}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap display="block">
            {currentAccount?.email || "Sign in to sync"}
          </Typography>
        </Box>
        <IconButton onClick={onOpenSettings} size="small">
          <SettingsOutlined fontSize="small" />
        </IconButton>
      </Stack>

      <Button variant="outlined" size="small" onClick={logout} color="error" sx={{ borderRadius: 2 }}>
        Sign Out
      </Button>

      <Divider />

      {/* Wallet Summary */}
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="subtitle2" color="secondary.main">
            Wallet
          </Typography>
          <IconButton size="small">
            <AccountBalanceWalletOutlined fontSize="small" />
          </IconButton>
        </Stack>
        <Card variant="outlined" sx={{ bgcolor: "background.default", borderRadius: 3 }}>
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Typography variant="caption" color="text.secondary">
              Total Balance
            </Typography>
            <Typography variant="h5" fontWeight={700}>
              $0.00
            </Typography>
            <Stack direction="row" spacing={1} mt={1}>
              <Chip label="ETH" size="small" variant="outlined" />
              <Chip label="TEN" size="small" color="secondary" />
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {/* TEE / Security Status */}
      <Box>
        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
          <Typography variant="subtitle2" color="secondary.main">
            Security Status
          </Typography>
          <VerifiedUserOutlined fontSize="small" color="success" />
        </Stack>
        <Card variant="outlined" sx={{ bgcolor: alpha(theme.palette.success.main, 0.05), borderColor: alpha(theme.palette.success.main, 0.2) }}>
          <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
             <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                <SecurityOutlined fontSize="small" color="success" />
                <Typography variant="body2" fontWeight={600} color="success.main">
                   Encrypted (TEE)
                </Typography>
             </Stack>
             <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                Key rotation in 2 days
             </Typography>
             <LinearProgress variant="determinate" value={75} color="success" sx={{ height: 4, borderRadius: 2 }} />
          </CardContent>
        </Card>
      </Box>

      <Divider />

      {/* Quick Actions */}
      <Stack spacing={1}>
        <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>
          Quick Actions
        </Typography>
        <Button fullWidth variant="contained" color="secondary" sx={{ justifyContent: "flex-start" }}>
          New Channel
        </Button>
        <Button fullWidth variant="outlined" color="secondary" sx={{ justifyContent: "flex-start" }}>
          Mint Sticker Pack
        </Button>
        <Button fullWidth variant="text" color="inherit" sx={{ justifyContent: "flex-start", color: "text.secondary" }}>
          Saved Messages
        </Button>
      </Stack>
    </Box>
  );
}
