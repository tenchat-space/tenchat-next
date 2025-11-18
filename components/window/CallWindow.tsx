"use client";

import { Box, Avatar, Stack, Typography, Button, useTheme } from '@mui/material';
import { Call, CallEnd, Videocam } from '@mui/icons-material';

export interface CallWindowProps {
  participant: string;
  status: string;
  type: 'voice' | 'video';
  onHangUp?: () => void;
}

export function CallWindow({ participant, status, type, onHangUp }: CallWindowProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        p: 3,
        bgcolor: 'background.default',
        color: 'text.primary',
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2}>
        <Avatar sx={{ width: 56, height: 56, bgcolor: theme.palette.secondary.main }}>
          {participant[0]}
        </Avatar>
        <Stack>
          <Typography variant="h6">{participant}</Typography>
          <Typography variant="body2" color="text.secondary">
            {type === 'video' ? 'Video session' : 'Voice session'} • {status}
          </Typography>
        </Stack>
      </Stack>

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 4 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          {type === 'video' ? <Videocam fontSize="small" /> : <Call fontSize="small" />}
          <Typography variant="caption" color="text.secondary">
            Streaming securely over Tenchat’s encrypted mesh.
          </Typography>
        </Stack>

        <Button
          variant="contained"
          color="error"
          startIcon={<CallEnd />}
          onClick={onHangUp}
        >
          Hang Up
        </Button>
      </Stack>
    </Box>
  );
}
