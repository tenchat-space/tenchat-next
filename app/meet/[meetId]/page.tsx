
"use client";

import { useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, IconButton, Stack, Typography, CircularProgress, Button } from '@mui/material';
import { Mic, MicOff, Videocam, VideocamOff, CallEnd } from '@mui/icons-material';
import { useMeeting } from '@/hooks/useMeeting';

export default function MeetingPage() {
  const { meetId } = useParams();
  const router = useRouter();
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
  } = useMeeting(meetId as string);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

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

  if (state === 'idle' || state === 'connecting') {
    return (
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: 'black', color: 'white' }}>
        {state === 'connecting' ? (
          <>
            <CircularProgress color="primary" />
            <Typography sx={{ mt: 2 }}>Connecting to secure channel...</Typography>
          </>
        ) : (
          <Stack spacing={3} alignItems="center">
            <Typography variant="h4">Ready to join?</Typography>
            <Button variant="contained" size="large" onClick={() => join()}>
              Join Meeting
            </Button>
            <Button variant="text" color="error" onClick={() => router.back()}>
              Cancel
            </Button>
          </Stack>
        )}
      </Box>
    );
  }

  if (state === 'failed') {
    return (
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: 'black', color: 'white' }}>
        <Typography color="error" variant="h5" gutterBottom>Connection Failed</Typography>
        <Typography>{error}</Typography>
        <Button sx={{ mt: 2 }} variant="outlined" onClick={() => router.back()}>
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', bgcolor: 'black', position: 'relative', overflow: 'hidden' }}>
      {/* Remote Video (Full Screen) */}
      {remoteStream ? (
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography color="text.secondary">Waiting for others to join...</Typography>
        </Box>
      )}
      
      {/* Local Video (PIP) */}
      <Box sx={{ 
        position: 'absolute', 
        top: 20, 
        right: 20, 
        width: 200, 
        height: 150, 
        bgcolor: '#333',
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: 3,
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
        />
        {!isCamOn && (
          <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#222' }}>
            <VideocamOff sx={{ color: 'text.secondary' }} />
          </Box>
        )}
      </Box>

      {/* Controls */}
      <Box sx={{ 
        position: 'absolute', 
        bottom: 40, 
        left: '50%', 
        transform: 'translateX(-50%)',
        bgcolor: 'rgba(20,20,20,0.8)',
        backdropFilter: 'blur(10px)',
        borderRadius: 8,
        p: 2,
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <Stack direction="row" spacing={2}>
          <IconButton onClick={toggleMic} sx={{ bgcolor: isMicOn ? 'rgba(255,255,255,0.1)' : 'error.main', '&:hover': { bgcolor: isMicOn ? 'rgba(255,255,255,0.2)' : 'error.dark' } }}>
            {isMicOn ? <Mic /> : <MicOff />}
          </IconButton>
          <IconButton onClick={toggleCam} sx={{ bgcolor: isCamOn ? 'rgba(255,255,255,0.1)' : 'error.main', '&:hover': { bgcolor: isCamOn ? 'rgba(255,255,255,0.2)' : 'error.dark' } }}>
            {isCamOn ? <Videocam /> : <VideocamOff />}
          </IconButton>
          <IconButton color="error" sx={{ bgcolor: 'error.main', '&:hover': { bgcolor: 'error.dark' } }} onClick={() => { leave(); router.back(); }}>
            <CallEnd />
          </IconButton>
        </Stack>
      </Box>
    </Box>
  );
}
