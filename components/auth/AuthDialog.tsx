"use client";

import { useEffect, useRef } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";

interface AuthDialogProps {
  open: boolean;
  onClose: () => void;
}
const buildAuthUrl = () => {
  const subdomain = (process.env.NEXT_PUBLIC_AUTH_SUBDOMAIN || "accounts")
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");
  const domain = (process.env.NEXT_PUBLIC_DOMAIN || "tenchat.space")
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");
  return `https://${subdomain}.${domain}`;
};

export function AuthDialog({ open, onClose }: AuthDialogProps) {
  const windowRef = useRef<Window | null>(null);

  const openWindow = () => {
    const url = buildAuthUrl();
    windowRef.current = window.open(url, "tenchat-auth", "width=520,height=720");
    if (!windowRef.current) {
      console.error("Failed to open auth window");
    }
  };

  useEffect(() => {
    if (!open) {
      windowRef.current?.close();
      windowRef.current = null;
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const checkInterval = setInterval(() => {
      if (windowRef.current?.closed) {
        clearInterval(checkInterval);
        windowRef.current = null;
        onClose();
      }
    }, 500);
    return () => clearInterval(checkInterval);
  }, [open, onClose]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Connect to Tenchat</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Typography>
            Authenticate with Appwrite to unlock encrypted chats, send gifts, and manage your wallet.
          </Typography>
          <Box
            sx={{
              borderRadius: 2,
              border: (theme) => `1px dashed ${theme.palette.divider}`,
              p: 2,
              bgcolor: "background.paper",
            }}
          >
            <Typography variant="subtitle2" color="text.secondary">
              The connection modal will open and close automatically once the login is complete.
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Pop-up blockers must be disabled for this to work.
            </Typography>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={openWindow} variant="contained">
          Open Connection Window
        </Button>
        <Button onClick={onClose} variant="text">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

