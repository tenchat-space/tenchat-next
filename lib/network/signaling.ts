
export interface SignalingMessage {
  type: 'offer' | 'answer' | 'candidate' | 'join' | 'leave';
  payload: unknown;
  senderId: string;
  roomId: string;
}

export class SignalingService {
  private ws: WebSocket | null = null;
  private listeners: Map<string, ((msg: SignalingMessage) => void)[]> = new Map();
  private url: string;

  constructor(url: string = 'wss://signaling.tenchat.space') {
    this.url = url;
  }

  connect(roomId: string, userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(`${this.url}?room=${roomId}&user=${userId}`);
      
      this.ws.onopen = () => {
        console.log('[Signaling] Connected');
        resolve();
      };

      this.ws.onerror = (err) => {
        console.error('[Signaling] Error', err);
        reject(err);
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as SignalingMessage;
          this.notify(msg);
        } catch (e) {
          console.error('[Signaling] Parse error', e);
        }
      };
    });
  }

  send(msg: SignalingMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  on(type: string, callback: (msg: SignalingMessage) => void) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type)!.push(callback);
  }

  private notify(msg: SignalingMessage) {
    const callbacks = this.listeners.get(msg.type);
    if (callbacks) {
      callbacks.forEach(cb => cb(msg));
    }
  }

  disconnect() {
    if (this.ws) this.ws.close();
  }
}
