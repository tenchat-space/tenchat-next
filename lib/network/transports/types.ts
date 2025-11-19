
export interface Transport {
  name: string;
  isSupported(): boolean;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  send(data: Uint8Array, recipientId: string): Promise<void>;
  onMessage(callback: (data: Uint8Array, senderId: string) => void): void;
  discoverPeers(): Promise<string[]>;
}
