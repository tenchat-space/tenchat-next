
"use client";

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { Box, IconButton, Stack } from '@mui/material';
import { Mic, MicOff, Videocam, VideocamOff, CallEnd } from '@mui/icons-material';
import { meetingService } from '@/services/meeting.service';

export default function MeetingPage() {
  const { meetId } = useParams();
  const [joined, setJoined] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (meetId && !joined) {
      meetingService.joinMeeting(meetId as string).then(() => {
        setJoined(true);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = meetingService.getLocalStream();
        }
        // Poll for remote stream (simple hack for MVP)
        const interval = setInterval(() => {
          const remote = meetingService.getRemoteStream();
          if (remote && remoteVideoRef.current && remoteVideoRef.current.srcObject !== remote) {
            remoteVideoRef.current.srcObject = remote;
            clearInterval(interval);
          }
        }, 1000);
      });
    }
    return () => {
      meetingService.leave();
    };
  }, [meetId, joined]);

  const toggleMic = () => {
    meetingService.toggleAudio(!micOn);
    setMicOn(!micOn);
  };

  const toggleCam = () => {
    meetingService.toggleVideo(!camOn);
    setCamOn(!camOn);
  };

  return (
    <Box sx={{ height: '100vh', bgcolor: 'black', position: 'relative', overflow: 'hidden' }}>
      {/* Remote Video (Full Screen) */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
      
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
        boxShadow: 3
      }}>
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </Box>

      {/* Controls */}
      <Box sx={{ 
        position: 'absolute', 
        bottom: 40, 
        left: '50%', 
        transform: 'translateX(-50%)',
        bgcolor: 'rgba(0,0,0,0.6)',
        borderRadius: 4,
        p: 2
      }}>
        <Stack direction="row" spacing={2}>
          <IconButton onClick={toggleMic} color={micOn ? 'primary' : 'error'}>
            {micOn ? <Mic /> : <MicOff />}
          </IconButton>
          <IconButton onClick={toggleCam} color={camOn ? 'primary' : 'error'}>
            {camOn ? <Videocam /> : <VideocamOff />}
          </IconButton>
          <IconButton color="error" onClick={() => window.close()}>
            <CallEnd />
          </IconButton>
        </Stack>
      </Box>
    </Box>
  );
}
