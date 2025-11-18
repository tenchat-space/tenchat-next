import type { User } from '../types';

export class GiftingService {
  async sendGift(sender: User, recipientId: string, amount: number): Promise<void> {
    console.log(`Simulating sending gift of $${amount} from ${sender.displayName} to ${recipientId}`);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    console.log('Gift sent successfully!');
  }
}

export const giftingService = new GiftingService();
