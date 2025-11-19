import { useEffect, useState, useCallback } from 'react';
import { meetingService } from '@/services/meeting.service';

export type MeetingState = 'idle' | 'connecting' | 'connected' | 'failed';

export function useMeeting(meetId: string) {
  const [state, setState] = useState<MeetingState>('idle');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const join = useCallback(async (options?: { video?: boolean; audio?: boolean }) => {
    try {
      setState('connecting');
      await meetingService.joinMeeting(meetId, options?.video ?? true, options?.audio ?? true);
      setLocalStream(meetingService.getLocalStream());
      setState('connected');
      
      // Sync state with options
      if (options?.video === false) setIsCamOn(false);
      if (options?.audio === false) setIsMicOn(false);
    } catch (err) {
      console.error("Failed to join meeting:", err);
      setError(err instanceof Error ? err.message : 'Failed to join meeting');
      setState('failed');
    }
  }, [meetId]);

  const leave = useCallback(() => {
    meetingService.leave();
    setLocalStream(null);
    setRemoteStream(null);
    setState('idle');
  }, []);

  const toggleMic = useCallback(() => {
    const newState = !isMicOn;
    meetingService.toggleAudio(newState);
    setIsMicOn(newState);
  }, [isMicOn]);

  const toggleCam = useCallback(() => {
    const newState = !isCamOn;
    meetingService.toggleVideo(newState);
    setIsCamOn(newState);
  }, [isCamOn]);

  // Subscribe to remote stream changes
  useEffect(() => {
    if (state !== 'connected') return;

    const handleRemoteStream = (stream: MediaStream) => {
      setRemoteStream(stream);
    };

    meetingService.on('remote-stream', handleRemoteStream);

    // Check if stream already exists
    const currentRemote = meetingService.getRemoteStream();
    if (currentRemote) {
      setRemoteStream(currentRemote);
    }

    return () => {
      meetingService.off('remote-stream', handleRemoteStream);
    };
  }, [state]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // We don't check state here to ensure cleanup always happens if component unmounts
      meetingService.leave();
    };
  }, []); // Empty dependency array is intentional for unmount cleanup

  return {
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
  };
}
