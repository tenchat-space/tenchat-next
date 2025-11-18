import {
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { SettingsOutlined } from "@mui/icons-material";
import { Models } from "appwrite";

interface ProfilePanelProps {
  currentAccount: Models.User<Models.Preferences> | null;
  logout: () => Promise<void>;
}

export function ProfilePanel({ currentAccount, logout }: ProfilePanelProps) {
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
        gap: 2,
        backgroundImage:
          "linear-gradient(120deg, rgba(250,204,21,0.2), rgba(124,58,237,0.1))",
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <Avatar src="">{currentAccount?.name?.[0] || "U"}</Avatar>
        <Box>
          <Typography variant="subtitle1">
            {currentAccount?.name || "Guest"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {currentAccount?.email || "Not signed in"}
          </Typography>
        </Box>
        <IconButton onClick={logout}>
          <SettingsOutlined />
        </IconButton>
      </Stack>

      <Button variant="outlined" onClick={logout}>
        Logout
      </Button>

      <Divider />

      <Stack spacing={1}>
        <Typography variant="subtitle2" sx={{ color: "secondary.main" }}>
          Right panel quick actions
        </Typography>
        <Button fullWidth variant="contained" color="secondary">
          Create channel
        </Button>
        <Button
          fullWidth
          variant="outlined"
          sx={{ borderColor: "secondary.main", color: "secondary.main" }}
        >
          Wallet / NFTs
        </Button>
      </Stack>
    </Box>
  );
}

