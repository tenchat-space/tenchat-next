
// Stub types for Web Bluetooth API
interface BluetoothDevice extends EventTarget {
  id: string;
  gatt?: BluetoothRemoteGATTServer;
}

interface BluetoothRemoteGATTServer {
  connected: boolean;
  connect(): Promise<BluetoothRemoteGATTServer>;
  disconnect(): void;
  getPrimaryService(service: string): Promise<BluetoothRemoteGATTService>;
}

interface BluetoothRemoteGATTService {
  getCharacteristic(characteristic: string): Promise<BluetoothRemoteGATTCharacteristic>;
}

interface BluetoothRemoteGATTCharacteristic extends EventTarget {
  value?: DataView;
  startNotifications(): Promise<BluetoothRemoteGATTCharacteristic>;
  writeValue(value: BufferSource): Promise<void>;
}

// Extend Navigator
declare global {
  interface Navigator {
    bluetooth: {
      requestDevice(options: { filters: { services: string[] }[], optionalServices?: string[] }): Promise<BluetoothDevice>;
    }
  }
}

import { Transport } from './types';

export class BluetoothTransport implements Transport {
  name = 'bluetooth';
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private characteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private messageCallback: ((data: Uint8Array, senderId: string) => void) | null = null;

  // UUIDs for TenChat Service
  private readonly SERVICE_UUID = '0000180d-0000-1000-8000-00805f9b34fb'; // Example UUID
  private readonly CHAR_UUID = '00002a37-0000-1000-8000-00805f9b34fb'; // Example UUID

  isSupported(): boolean {
    return typeof navigator !== 'undefined' && !!navigator.bluetooth;
  }

  async connect(): Promise<void> {
    if (!this.isSupported()) throw new Error('Bluetooth not supported');

    try {
      console.log('[Bluetooth] Requesting device...');
      this.device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [this.SERVICE_UUID] }],
        optionalServices: [this.SERVICE_UUID] // Add other services if needed
      });

      if (!this.device) throw new Error('No device selected');

      this.device.addEventListener('gattserverdisconnected', this.onDisconnected.bind(this));

      console.log('[Bluetooth] Connecting to GATT Server...');
      this.server = await this.device.gatt!.connect();

      console.log('[Bluetooth] Getting Service...');
      const service = await this.server.getPrimaryService(this.SERVICE_UUID);

      console.log('[Bluetooth] Getting Characteristic...');
      this.characteristic = await service.getCharacteristic(this.CHAR_UUID);

      await this.characteristic.startNotifications();
      this.characteristic.addEventListener('characteristicvaluechanged', this.handleNotifications.bind(this));

      console.log('[Bluetooth] Connected!');
    } catch (error) {
      console.error('[Bluetooth] Connection failed', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.device && this.device.gatt?.connected) {
      this.device.gatt.disconnect();
    }
  }

  async send(data: Uint8Array, _recipientId: string): Promise<void> {
    if (!this.characteristic) throw new Error('Not connected');
    // Note: BLE has packet size limits (MTU). Real impl needs chunking.
    // This is a simplified write.
    console.log(`[Bluetooth] Sending ${data.byteLength} bytes to ${_recipientId}`);
    await this.characteristic.writeValue(data.buffer as ArrayBuffer);
  }

  onMessage(callback: (data: Uint8Array, senderId: string) => void): void {
    this.messageCallback = callback;
  }

  async discoverPeers(): Promise<string[]> {
    // Web Bluetooth scanning is limited. 
    // Usually requires user gesture to pick a device.
    // We can't passively scan in the browser easily without specific flags/permissions.
    // This method might trigger the picker in a real scenario or return cached devices.
    return [];
  }

  private handleNotifications(event: Event) {
    const value = (event.target as BluetoothRemoteGATTCharacteristic).value;
    if (value && this.messageCallback) {
      const buffer = new Uint8Array(value.buffer);
      // In a real scenario, we'd need to know WHO sent it. 
      // BLE is usually 1:1 central/peripheral in web.
      // We assume the connected device is the sender.
      this.messageCallback(buffer, this.device?.id || 'unknown');
    }
  }

  private onDisconnected() {
    console.log('[Bluetooth] Disconnected');
    // Reconnect logic could go here
  }
}
