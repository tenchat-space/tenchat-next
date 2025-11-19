"use client";

import { useEffect, useRef } from 'react';
import { Box, Avatar, Typography, Button, IconButton, useTheme, CircularProgress } from '@mui/material';
import { CallEnd, Videocam, VideocamOff, Mic, MicOff } from '@mui/icons-material';
import { useMeeting } from '@/hooks/useMeeting';

export interface CallWindowProps {
  meetId: string;
  participant: string;
  type: 'voice' | 'video';
  onHangUp?: () => void;
}

export function CallWindow({ meetId, participant, type = 'video', onHangUp }: CallWindowProps) {
  const theme = useTheme();
  const { 
    state, 
    error, 
    localStream, 
    remoteStream, 
    isMicOn, 
    isCamOn, 
    join, 
    leave, 
    toggleMic, 
    toggleCam 
  } = useMeeting(meetId);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Auto-join when window opens
    join({ video: type === 'video', audio: true });
    return () => {
      leave();
    };
  }, [join, leave, type]);

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const handleHangUp = () => {
    leave();
    onHangUp?.();
  };

  if (state === 'connecting' || state === 'idle') {
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Avatar sx={{ width: 80, height: 80, mb: 2, bgcolor: theme.palette.secondary.main }}>
          {participant[0]}
        </Avatar>
        <Typography variant="h6" gutterBottom>Calling {participant}...</Typography>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (state === 'failed') {
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Typography color="error" gutterBottom>Call Failed</Typography>
        <Typography variant="caption" color="text.secondary" align="center" sx={{ mb: 2 }}>{error}</Typography>
        <Button variant="outlined" color="error" onClick={handleHangUp}>Close</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', bgcolor: 'black', position: 'relative', overflow: 'hidden' }}>
      {/* Remote Video */}
      {remoteStream ? (
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <Avatar sx={{ width: 80, height: 80, mb: 2, bgcolor: theme.palette.secondary.main }}>
            {participant[0]}
          </Avatar>
          <Typography color="white">Waiting for answer...</Typography>
        </Box>
      )}

      {/* Local Video (PIP) */}
      <Box sx={{ 
        position: 'absolute', 
        top: 16, 
        right: 16, 
        width: 100, 
        height: 75, 
        bgcolor: '#333',
        borderRadius: 1,
        overflow: 'hidden',
        boxShadow: 3,
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
        />
      </Box>

      {/* Controls Overlay */}
      <Box sx={{ 
        position: 'absolute', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        p: 2,
        background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
        display: 'flex',
        justifyContent: 'center',
        gap: 2
      }}>
        <IconButton 
          onClick={toggleMic} 
          sx={{ bgcolor: isMicOn ? 'rgba(255,255,255,0.2)' : 'error.main', color: 'white', '&:hover': { bgcolor: isMicOn ? 'rgba(255,255,255,0.3)' : 'error.dark' } }}
        >
          {isMicOn ? <Mic /> : <MicOff />}
        </IconButton>
        <IconButton 
          onClick={toggleCam} 
          sx={{ bgcolor: isCamOn ? 'rgba(255,255,255,0.2)' : 'error.main', color: 'white', '&:hover': { bgcolor: isCamOn ? 'rgba(255,255,255,0.3)' : 'error.dark' } }}
        >
          {isCamOn ? <Videocam /> : <VideocamOff />}
        </IconButton>
        <IconButton 
          onClick={handleHangUp}
          sx={{ bgcolor: 'error.main', color: 'white', '&:hover': { bgcolor: 'error.dark' } }}
        >
          <CallEnd />
        </IconButton>
      </Box>
    </Box>
  );
}
