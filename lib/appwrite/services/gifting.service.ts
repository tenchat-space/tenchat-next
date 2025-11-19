/**
 * Gifting Service
 * Handles gift sending and crypto transfers
 */

import { chatService } from './chat';
import { MessagesContentType } from '@/types/appwrite.d';

export interface Gift {
  id: string;
  name: string;
  emoji: string;
  value: number;
  category: 'emoji' | 'sticker' | 'crypto' | 'nft';
  description?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface CryptoPaymentRequest {
  recipientAddress: string;
  amount?: string;
  token: string;
  chain: string;
  message?: string;
  recipientUsername?: string;
}

export class GiftingService {
  // Comprehensive gift catalog
  private readonly giftCatalog: Gift[] = [
    // Emoji Gifts - Common
    { id: 'heart', name: 'Heart', emoji: '❤️', value: 1, category: 'emoji', rarity: 'common' },
    { id: 'rose', name: 'Rose', emoji: '🌹', value: 2, category: 'emoji', rarity: 'common' },
    { id: 'star', name: 'Star', emoji: '⭐', value: 2, category: 'emoji', rarity: 'common' },
    { id: 'fire', name: 'Fire', emoji: '🔥', value: 3, category: 'emoji', rarity: 'common' },
    { id: 'sparkles', name: 'Sparkles', emoji: '✨', value: 3, category: 'emoji', rarity: 'common' },
    { id: 'gem', name: 'Gem', emoji: '💎', value: 5, category: 'emoji', rarity: 'rare' },
    { id: 'crown', name: 'Crown', emoji: '👑', value: 10, category: 'emoji', rarity: 'rare' },
    { id: 'trophy', name: 'Trophy', emoji: '🏆', value: 10, category: 'emoji', rarity: 'rare' },
    
    // Celebration Gifts
    { id: 'party', name: 'Party', emoji: '🎉', value: 5, category: 'emoji', rarity: 'common' },
    { id: 'confetti', name: 'Confetti', emoji: '🎊', value: 5, category: 'emoji', rarity: 'common' },
    { id: 'balloon', name: 'Balloon', emoji: '🎈', value: 3, category: 'emoji', rarity: 'common' },
    { id: 'cake', name: 'Cake', emoji: '🎂', value: 8, category: 'emoji', rarity: 'rare' },
    { id: 'champagne', name: 'Champagne', emoji: '🍾', value: 15, category: 'emoji', rarity: 'rare' },
    
    // Nature & Food Gifts
    { id: 'rainbow', name: 'Rainbow', emoji: '🌈', value: 7, category: 'emoji', rarity: 'rare' },
    { id: 'sunflower', name: 'Sunflower', emoji: '🌻', value: 4, category: 'emoji', rarity: 'common' },
    { id: 'cherry', name: 'Cherry', emoji: '🍒', value: 3, category: 'emoji', rarity: 'common' },
    { id: 'chocolate', name: 'Chocolate', emoji: '🍫', value: 5, category: 'emoji', rarity: 'common' },
    { id: 'coffee', name: 'Coffee', emoji: '☕', value: 3, category: 'emoji', rarity: 'common' },
    
    // Animals
    { id: 'cat', name: 'Cat', emoji: '🐱', value: 5, category: 'emoji', rarity: 'common' },
    { id: 'dog', name: 'Dog', emoji: '🐶', value: 5, category: 'emoji', rarity: 'common' },
    { id: 'unicorn', name: 'Unicorn', emoji: '🦄', value: 20, category: 'emoji', rarity: 'epic' },
    { id: 'dragon', name: 'Dragon', emoji: '🐉', value: 25, category: 'emoji', rarity: 'epic' },
    { id: 'phoenix', name: 'Phoenix', emoji: '🔥🦅', value: 50, category: 'emoji', rarity: 'legendary' },
    
    // Special Items
    { id: 'rocket', name: 'Rocket', emoji: '🚀', value: 15, category: 'emoji', rarity: 'rare' },
    { id: 'diamond_ring', name: 'Diamond Ring', emoji: '💍', value: 100, category: 'emoji', rarity: 'legendary' },
    { id: 'gift_box', name: 'Gift Box', emoji: '🎁', value: 10, category: 'emoji', rarity: 'rare' },
    { id: 'magic', name: 'Magic', emoji: '🪄', value: 12, category: 'emoji', rarity: 'rare' },
    { id: 'crystal_ball', name: 'Crystal Ball', emoji: '🔮', value: 18, category: 'emoji', rarity: 'epic' },
    
    // Crypto-themed
    { id: 'money_wings', name: 'Money with Wings', emoji: '💸', value: 25, category: 'crypto', rarity: 'epic' },
    { id: 'money_bag', name: 'Money Bag', emoji: '💰', value: 50, category: 'crypto', rarity: 'epic' },
    { id: 'chart_up', name: 'Chart Up', emoji: '📈', value: 20, category: 'crypto', rarity: 'rare' },
    { id: 'lightning', name: 'Lightning', emoji: '⚡', value: 30, category: 'crypto', rarity: 'epic' },
    { id: 'moon', name: 'To the Moon', emoji: '🌙', value: 40, category: 'crypto', rarity: 'epic' },
  ];

  /**
   * Get all available gifts
   */
  getAvailableGifts(): Gift[] {
    return this.giftCatalog;
  }

  /**
   * Get gifts by category
   */
  getGiftsByCategory(category: Gift['category']): Gift[] {
    return this.giftCatalog.filter(gift => gift.category === category);
  }

  /**
   * Get gifts by rarity
   */
  getGiftsByRarity(rarity: Gift['rarity']): Gift[] {
    return this.giftCatalog.filter(gift => gift.rarity === rarity);
  }

  /**
   * Get gift by ID
   */
  getGiftById(giftId: string): Gift | undefined {
    return this.giftCatalog.find(gift => gift.id === giftId);
  }

  /**
   * Send a gift
   */
  async sendGift(
    conversationId: string,
    senderId: string,
    giftId: string,
    message?: string
  ): Promise<void> {
    const gift = this.getGiftById(giftId);
    if (!gift) {
      throw new Error('Gift not found');
    }

    const giftData = {
      giftId: gift.id,
      name: gift.name,
      value: gift.value,
      currency: 'GIFT_TOKEN',
      message: message || `Sent you a ${gift.name} ${gift.emoji}`
    };

    await chatService.sendMessage(
      conversationId,
      JSON.stringify(giftData),
      MessagesContentType.TOKEN_GIFT
    );
  }

  /**
   * Generate crypto payment QR code data
   */
  generatePaymentQRCode(request: CryptoPaymentRequest): string {
    const data = {
      type: 'payment',
      recipientAddress: request.recipientAddress,
      amount: request.amount,
      token: request.token,
      chain: request.chain,
      message: request.message,
      recipientUsername: request.recipientUsername,
      timestamp: Date.now(),
    };
    return JSON.stringify(data);
  }

  /**
   * Generate payment request link
   */
  generatePaymentLink(request: CryptoPaymentRequest): string {
    const baseUrl = window.location.origin;
    const params = new URLSearchParams({
      to: request.recipientAddress,
      ...(request.amount && { amount: request.amount }),
      token: request.token,
      chain: request.chain,
      ...(request.message && { message: request.message }),
      ...(request.recipientUsername && { username: request.recipientUsername }),
    });
    return `${baseUrl}/pay?${params.toString()}`;
  }

  /**
   * Parse payment QR code data
   */
  parsePaymentQRCode(qrData: string): CryptoPaymentRequest | null {
    try {
      const data = JSON.parse(qrData);
      if (data.type === 'payment') {
        return {
          recipientAddress: data.recipientAddress,
          amount: data.amount,
          token: data.token,
          chain: data.chain,
          message: data.message,
          recipientUsername: data.recipientUsername,
        };
      }
      return null;
    } catch (error) {
      console.error('Error parsing payment QR code:', error);
      return null;
    }
  }

  /**
   * Get supported chains
   */
  getSupportedChains(): Array<{ id: string; name: string; symbol: string }> {
    return [
      { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
      { id: 'polygon', name: 'Polygon', symbol: 'MATIC' },
      { id: 'bsc', name: 'BNB Chain', symbol: 'BNB' },
      { id: 'arbitrum', name: 'Arbitrum', symbol: 'ETH' },
      { id: 'optimism', name: 'Optimism', symbol: 'ETH' },
      { id: 'base', name: 'Base', symbol: 'ETH' },
      { id: 'avalanche', name: 'Avalanche', symbol: 'AVAX' },
      { id: 'solana', name: 'Solana', symbol: 'SOL' },
    ];
  }

  /**
   * Get popular tokens
   */
  getPopularTokens(chain: string): Array<{ symbol: string; name: string; address?: string }> {
    const tokens: Record<string, Array<{ symbol: string; name: string; address?: string }>> = {
      ethereum: [
        { symbol: 'ETH', name: 'Ethereum' },
        { symbol: 'USDC', name: 'USD Coin', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' },
        { symbol: 'USDT', name: 'Tether', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' },
        { symbol: 'DAI', name: 'Dai', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F' },
      ],
      polygon: [
        { symbol: 'MATIC', name: 'Polygon' },
        { symbol: 'USDC', name: 'USD Coin', address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174' },
        { symbol: 'USDT', name: 'Tether', address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F' },
      ],
      bsc: [
        { symbol: 'BNB', name: 'BNB' },
        { symbol: 'USDC', name: 'USD Coin' },
        { symbol: 'USDT', name: 'Tether' },
      ],
      solana: [
        { symbol: 'SOL', name: 'Solana' },
        { symbol: 'USDC', name: 'USD Coin' },
        { symbol: 'USDT', name: 'Tether' },
      ],
    };

    return tokens[chain] || [{ symbol: chain.toUpperCase(), name: chain }];
  }
}

export const giftingService = new GiftingService();
