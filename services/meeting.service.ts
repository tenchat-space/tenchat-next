
import { SignalingService } from '@/lib/network/signaling';

export class MeetingService {
  private signaling: SignalingService;
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private roomId: string | null = null;
  private userId: string;

  constructor() {
    this.signaling = new SignalingService();
    this.userId = `user-${Math.random().toString(36).substr(2, 9)}`;
  }

  async joinMeeting(roomId: string, video: boolean = true, audio: boolean = true) {
    this.roomId = roomId;
    await this.signaling.connect(roomId, this.userId);
    
    // Get local media
    this.localStream = await navigator.mediaDevices.getUserMedia({ video, audio });
    
    // Setup WebRTC
    this.setupPeerConnection();

    // Add tracks
    this.localStream.getTracks().forEach(track => {
      if (this.localStream && this.peerConnection) {
        this.peerConnection.addTrack(track, this.localStream);
      }
    });

    // Listen for signaling
    this.signaling.on('offer', async (msg) => {
      if (!this.peerConnection) return;
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(msg.payload as RTCSessionDescriptionInit));
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      this.signaling.send({
        type: 'answer',
        payload: answer,
        senderId: this.userId,
        roomId: this.roomId!
      });
    });

    this.signaling.on('answer', async (msg) => {
      if (!this.peerConnection) return;
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(msg.payload as RTCSessionDescriptionInit));
    });

    this.signaling.on('candidate', async (msg) => {
      if (!this.peerConnection) return;
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(msg.payload as RTCIceCandidateInit));
    });

    // Announce join
    this.signaling.send({
      type: 'join',
      payload: {},
      senderId: this.userId,
      roomId: this.roomId
    });
  }

  private setupPeerConnection() {
    this.peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.roomId) {
        this.signaling.send({
          type: 'candidate',
          payload: event.candidate,
          senderId: this.userId,
          roomId: this.roomId
        });
      }
    };

    this.peerConnection.ontrack = (event) => {
      this.remoteStream = event.streams[0];
      // Notify UI to update
      // In a real service, we'd use an event emitter or observable
    };
  }

  toggleVideo(enabled: boolean) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => track.enabled = enabled);
    }
  }

  toggleAudio(enabled: boolean) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => track.enabled = enabled);
    }
  }

  leave() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
    }
    if (this.peerConnection) {
      this.peerConnection.close();
    }
    this.signaling.disconnect();
  }

  getLocalStream() { return this.localStream; }
  getRemoteStream() { return this.remoteStream; }
}

export const meetingService = new MeetingService();
