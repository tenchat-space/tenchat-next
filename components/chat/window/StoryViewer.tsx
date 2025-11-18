import { Box, IconButton, Typography, Fade, Stack, Avatar } from "@mui/material";
import { Close, Favorite, Send } from "@mui/icons-material";

interface StoryViewerProps {
  open: boolean;
  onClose: () => void;
}

export function StoryViewer({ open, onClose }: StoryViewerProps) {
  return (
    <Fade in={open}>
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: "black",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", top: 20, right: 20, color: "white" }}
        >
          <Close />
        </IconButton>

        <Box
          sx={{
            width: "100%",
            maxWidth: 450,
            height: "85vh",
            bgcolor: "#1a1a1a",
            borderRadius: 4,
            position: "relative",
            overflow: "hidden",
            backgroundImage: "url('https://images.unsplash.com/photo-1516918656725-e9a58b156188?q=80&w=1000&auto=format&fit=crop')",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        >
          {/* Progress Bar */}
          <Stack direction="row" spacing={0.5} sx={{ p: 1, pt: 2 }}>
            <Box sx={{ flex: 1, height: 2, bgcolor: "white", borderRadius: 1 }} />
            <Box sx={{ flex: 1, height: 2, bgcolor: "rgba(255,255,255,0.3)", borderRadius: 1 }} />
          </Stack>

          {/* Header */}
          <Stack direction="row" alignItems="center" spacing={1} sx={{ p: 2, mt: -1 }}>
            <Avatar sx={{ width: 32, height: 32 }}>A</Avatar>
            <Typography variant="subtitle2" color="white">Alice Chen</Typography>
            <Typography variant="caption" color="rgba(255,255,255,0.7)">2h</Typography>
          </Stack>

          {/* Interactions */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              p: 2,
              background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
            }}
          >
            <Box
              sx={{
                flex: 1,
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: 20,
                px: 2,
                py: 1.5,
                color: "white",
                fontSize: "0.9rem"
              }}
            >
              Send a message...
            </Box>
            <IconButton sx={{ color: "white" }}>
              <Favorite />
            </IconButton>
            <IconButton sx={{ color: "white" }}>
              <Send />
            </IconButton>
          </Stack>
        </Box>
      </Box>
    </Fade>
  );
}

