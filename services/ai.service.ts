/**
 * AI Service
 * Provides AI-powered features across the platform
 */

import type { Gift } from '@/lib/appwrite/services/gifting.service';

export interface GiftRecommendation {
  gift: Gift;
  confidence: number;
  reason: string;
  occasion?: string;
  timing?: 'now' | 'scheduled';
  suggestedMessage?: string;
}

export interface ConversationInsight {
  sentiment: 'positive' | 'neutral' | 'negative' | 'celebratory';
  topics: string[];
  suggestedGifts: string[];
  emotionalTone: number; // 0-100
  urgency: 'low' | 'medium' | 'high';
}

export interface UserProfile {
  id: string;
  preferences: {
    giftCategories: string[];
    priceRange: [number, number];
    occasions: string[];
  };
  history: {
    sentGifts: number;
    receivedGifts: number;
    favoriteGifts: string[];
    avgGiftValue: number;
  };
  relationships: {
    [userId: string]: {
      closeness: number; // 0-100
      lastGiftDate?: Date;
      giftFrequency: number;
    };
  };
}

export interface SmartSuggestion {
  type: 'occasion' | 'milestone' | 'gratitude' | 'celebration' | 'random_kindness';
  recipient: {
    userId: string;
    username: string;
    reason: string;
  };
  gifts: GiftRecommendation[];
  timing: Date;
  priority: number; // 0-100
}

export interface TrendingInsight {
  giftId: string;
  trendScore: number; // 0-100
  velocity: 'rising' | 'stable' | 'falling';
  predictedPopularity: number;
  optimalPricing: number;
  demographics: {
    ageRange: string;
    topLocations: string[];
    peakHours: number[];
  };
}

export interface MessageEnhancement {
  originalMessage: string;
  suggestions: {
    enhanced: string;
    tone: 'friendly' | 'formal' | 'playful' | 'heartfelt' | 'humorous';
    emoji: string[];
    confidence: number;
  }[];
}

export interface OccasionDetection {
  type: 'birthday' | 'anniversary' | 'achievement' | 'milestone' | 'holiday' | 'custom';
  date: Date;
  confidence: number;
  recipient: string;
  suggestedActions: {
    reminderTime: Date;
    giftSuggestions: string[];
    messageSuggestions: string[];
  };
}

export interface GiftComposition {
  theme: string;
  gifts: {
    giftId: string;
    position: { x: number; y: number; z: number };
    scale: number;
    rotation: number;
  }[];
  totalValue: number;
  rarity: string;
  name: string;
  description: string;
}

export class AIService {
  private readonly API_ENDPOINT =
    process.env.NEXT_PUBLIC_AI_SERVICE_ENDPOINT || 'http://localhost:3001/ai';
  private readonly ENABLE_AI = process.env.NEXT_PUBLIC_ENABLE_AI !== 'false';

  // Cache for performance
  private recommendationCache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Get personalized gift recommendations based on context
   */
  async getGiftRecommendations(
    userId: string,
    recipientId: string,
    context?: {
      occasion?: string;
      budget?: [number, number];
      recentConversation?: string[];
      relationship?: string;
    }
  ): Promise<GiftRecommendation[]> {
    if (!this.ENABLE_AI) {
      return this.getFallbackRecommendations();
    }

    const cacheKey = `recommendations:${userId}:${recipientId}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      // In production, this would call an actual AI service
      // For now, return intelligent mock data
      const recommendations = await this.generateSmartRecommendations(
        userId,
        recipientId,
        context
      );

      this.setCached(cacheKey, recommendations);
      return recommendations;
    } catch (error) {
      console.error('AI recommendation error:', error);
      return this.getFallbackRecommendations();
    }
  }

  /**
   * Analyze conversation sentiment and suggest appropriate gifts
   */
  async analyzeConversation(
    messages: Array<{ content: string; senderId: string; timestamp: Date }>
  ): Promise<ConversationInsight> {
    if (!this.ENABLE_AI) {
      return this.getBasicSentiment(messages);
    }

    try {
      // Analyze message patterns, keywords, and sentiment
      const sentiment = this.detectSentiment(messages);
      const topics = this.extractTopics(messages);
      const emotionalTone = this.calculateEmotionalTone(messages);

      return {
        sentiment,
        topics,
        suggestedGifts: this.mapTopicsToGifts(topics, sentiment),
        emotionalTone,
        urgency: this.determineUrgency(messages),
      };
    } catch (error) {
      console.error('Conversation analysis error:', error);
      return this.getBasicSentiment(messages);
    }
  }

  /**
   * Detect upcoming occasions for automated reminders
   */
  async detectOccasions(userId: string): Promise<OccasionDetection[]> {
    if (!this.ENABLE_AI) {
      return [];
    }

    try {
      // Analyze user data, calendar, and patterns
      const occasions = await this.scanForOccasions(userId);
      return occasions.map(occasion => ({
        ...occasion,
        suggestedActions: this.generateOccasionActions(occasion),
      }));
    } catch (error) {
      console.error('Occasion detection error:', error);
      return [];
    }
  }

  /**
   * Generate smart gift suggestions based on user behavior
   */
  async getSmartSuggestions(userId: string): Promise<SmartSuggestion[]> {
    if (!this.ENABLE_AI) {
      return [];
    }

    try {
      const userProfile = await this.buildUserProfile(userId);
      const suggestions: SmartSuggestion[] = [];

      // Check for overdue gifts to close friends
      const overdueGifts = this.findOverdueGifts(userProfile);
      suggestions.push(...overdueGifts);

      // Find opportunities for random acts of kindness
      const kindnessSuggestions = this.generateKindnessSuggestions(userProfile);
      suggestions.push(...kindnessSuggestions);

      // Milestone-based suggestions
      const milestoneSuggestions = this.generateMilestoneSuggestions(userProfile);
      suggestions.push(...milestoneSuggestions);

      return suggestions.sort((a, b) => b.priority - a.priority);
    } catch (error) {
      console.error('Smart suggestions error:', error);
      return [];
    }
  }

  /**
   * Enhance gift messages with AI
   */
  async enhanceMessage(
    message: string,
    context: {
      giftType: string;
      recipient: string;
      occasion?: string;
      tone?: string;
    }
  ): Promise<MessageEnhancement> {
    if (!this.ENABLE_AI || !message.trim()) {
      return this.getBasicEnhancement(message);
    }

    try {
      // Generate multiple enhanced versions with different tones
      const suggestions = [
        this.enhanceForTone(message, 'friendly', context),
        this.enhanceForTone(message, 'heartfelt', context),
        this.enhanceForTone(message, 'playful', context),
        this.enhanceForTone(message, 'humorous', context),
      ];

      return {
        originalMessage: message,
        suggestions: suggestions.filter(s => s.confidence > 0.5),
      };
    } catch (error) {
      console.error('Message enhancement error:', error);
      return this.getBasicEnhancement(message);
    }
  }

  /**
   * Analyze gift trends and predict popularity
   */
  async analyzeTrends(
    giftId: string,
    timeRange: 'hour' | 'day' | 'week' | 'month'
  ): Promise<TrendingInsight> {
    if (!this.ENABLE_AI) {
      return this.getBasicTrend(giftId);
    }

    try {
      const historicalData = await this.fetchGiftHistory(giftId, timeRange);
      const trendScore = this.calculateTrendScore(historicalData);
      const velocity = this.calculateVelocity(historicalData);
      const prediction = this.predictFuturePopularity(historicalData);

      return {
        giftId,
        trendScore,
        velocity,
        predictedPopularity: prediction,
        optimalPricing: this.calculateOptimalPrice(historicalData, prediction),
        demographics: this.analyzeDemographics(historicalData),
      };
    } catch (error) {
      console.error('Trend analysis error:', error);
      return this.getBasicTrend(giftId);
    }
  }

  /**
   * Create composite gifts with AI composition
   */
  async composeGift(
    theme: string,
    budget: number,
    availableGifts: Gift[]
  ): Promise<GiftComposition> {
    if (!this.ENABLE_AI) {
      return this.createBasicComposition(theme, budget, availableGifts);
    }

    try {
      // Select gifts that match the theme and budget
      const selectedGifts = this.selectGiftsForTheme(theme, budget, availableGifts);

      // Arrange in 3D space for visual appeal
      const arrangement = this.create3DArrangement(selectedGifts);

      // Generate metadata
      const composition: GiftComposition = {
        theme,
        gifts: arrangement,
        totalValue: selectedGifts.reduce((sum, g) => sum + g.value, 0),
        rarity: this.determineCompositeRarity(selectedGifts),
        name: this.generateCompositionName(theme, selectedGifts),
        description: this.generateCompositionDescription(theme, selectedGifts),
      };

      return composition;
    } catch (error) {
      console.error('Gift composition error:', error);
      return this.createBasicComposition(theme, budget, availableGifts);
    }
  }

  /**
   * Predict optimal timing for gift sending
   */
  async predictOptimalTiming(
    recipientId: string,
    giftType: string
  ): Promise<{
    suggestedTime: Date;
    confidence: number;
    reason: string;
  }> {
    if (!this.ENABLE_AI) {
      return {
        suggestedTime: new Date(),
        confidence: 0.5,
        reason: 'Send now',
      };
    }

    try {
      // Analyze recipient's activity patterns
      const activityPattern = await this.analyzeActivityPattern(recipientId);

      // Find best time based on engagement
      const optimalTime = this.findPeakEngagementTime(activityPattern);

      return {
        suggestedTime: optimalTime,
        confidence: 0.85,
        reason: this.explainTimingChoice(activityPattern, optimalTime),
      };
    } catch (error) {
      console.error('Timing prediction error:', error);
      return {
        suggestedTime: new Date(),
        confidence: 0.5,
        reason: 'Send now',
      };
    }
  }

  /**
   * Generate personalized gift descriptions
   */
  async generateGiftDescription(
    gift: Gift,
    context: {
      sender: string;
      recipient: string;
      occasion?: string;
    }
  ): Promise<string> {
    if (!this.ENABLE_AI) {
      return `${gift.name} - ${gift.description || 'A thoughtful gift'}`;
    }

    try {
      // Generate contextual description
      const templates = [
        `${context.sender} is sending you ${gift.emoji} ${gift.name}! ${this.getOccasionText(context.occasion)}`,
        `A special ${gift.name} ${gift.emoji} from ${context.sender} to brighten your day!`,
        `${gift.emoji} ${gift.name}: Because you deserve something special!`,
      ];

      return templates[Math.floor(Math.random() * templates.length)];
    } catch (error) {
      console.error('Description generation error:', error);
      return gift.name;
    }
  }

  /**
   * Analyze user gifting patterns for insights
   */
  async analyzeUserBehavior(userId: string): Promise<{
    giftingPersonality: string;
    topCategories: string[];
    averageValue: number;
    frequency: string;
    insights: string[];
    recommendations: string[];
  }> {
    if (!this.ENABLE_AI) {
      return this.getBasicBehaviorAnalysis();
    }

    try {
      const profile = await this.buildUserProfile(userId);
      
      return {
        giftingPersonality: this.determinePersonality(profile),
        topCategories: this.extractTopCategories(profile),
        averageValue: profile.history.avgGiftValue,
        frequency: this.determineFrequency(profile),
        insights: this.generateInsights(profile),
        recommendations: this.generateBehaviorRecommendations(profile),
      };
    } catch (error) {
      console.error('Behavior analysis error:', error);
      return this.getBasicBehaviorAnalysis();
    }
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private async generateSmartRecommendations(
    userId: string,
    recipientId: string,
    context?: any
  ): Promise<GiftRecommendation[]> {
    // Mock implementation - in production, this would use ML models
    const recommendations: GiftRecommendation[] = [
      {
        gift: {
          id: 'heart',
          name: 'Heart',
          emoji: '❤️',
          value: 5,
          category: 'emoji',
          rarity: 'common',
        },
        confidence: 0.9,
        reason: 'Shows appreciation and care',
        suggestedMessage: 'Thinking of you! ❤️',
      },
      {
        gift: {
          id: 'trophy',
          name: 'Trophy',
          emoji: '🏆',
          value: 10,
          category: 'emoji',
          rarity: 'rare',
        },
        confidence: 0.85,
        reason: 'Perfect for celebrating achievements',
        occasion: 'achievement',
        suggestedMessage: 'You earned this! 🏆',
      },
    ];

    return recommendations;
  }

  private getFallbackRecommendations(): GiftRecommendation[] {
    return [
      {
        gift: {
          id: 'heart',
          name: 'Heart',
          emoji: '❤️',
          value: 5,
          category: 'emoji',
          rarity: 'common',
        },
        confidence: 0.7,
        reason: 'Popular choice',
      },
    ];
  }

  private getBasicSentiment(messages: any[]): ConversationInsight {
    return {
      sentiment: 'neutral',
      topics: [],
      suggestedGifts: ['heart', 'star'],
      emotionalTone: 50,
      urgency: 'low',
    };
  }

  private detectSentiment(messages: any[]): 'positive' | 'neutral' | 'negative' | 'celebratory' {
    // Simple keyword-based sentiment
    const text = messages.map(m => m.content.toLowerCase()).join(' ');
    
    if (/congratulations|amazing|awesome|great|excellent|love|happy|celebration/i.test(text)) {
      return 'celebratory';
    }
    if (/good|nice|thanks|thank you/i.test(text)) {
      return 'positive';
    }
    if (/sad|sorry|unfortunately|problem/i.test(text)) {
      return 'negative';
    }
    return 'neutral';
  }

  private extractTopics(messages: any[]): string[] {
    const text = messages.map(m => m.content.toLowerCase()).join(' ');
    const topics: string[] = [];

    if (/birthday|bday/i.test(text)) topics.push('birthday');
    if (/anniversary/i.test(text)) topics.push('anniversary');
    if (/work|job|promotion/i.test(text)) topics.push('career');
    if (/game|gaming|play/i.test(text)) topics.push('gaming');
    if (/crypto|bitcoin|eth/i.test(text)) topics.push('crypto');

    return topics;
  }

  private calculateEmotionalTone(messages: any[]): number {
    // 0-100 scale
    return 65; // Default mid-positive
  }

  private determineUrgency(messages: any[]): 'low' | 'medium' | 'high' {
    const recentMessages = messages.slice(-5);
    if (recentMessages.length > 3) return 'high';
    if (recentMessages.length > 1) return 'medium';
    return 'low';
  }

  private mapTopicsToGifts(topics: string[], sentiment: string): string[] {
    const giftMap: Record<string, string[]> = {
      birthday: ['cake', 'party', 'balloon'],
      anniversary: ['rose', 'heart', 'champagne'],
      career: ['trophy', 'rocket', 'crown'],
      gaming: ['trophy', 'fire', 'lightning'],
      crypto: ['moon', 'rocket', 'money_bag'],
    };

    const gifts = topics.flatMap(topic => giftMap[topic] || []);
    
    if (sentiment === 'celebratory') {
      gifts.push('confetti', 'champagne', 'trophy');
    }

    return [...new Set(gifts)];
  }

  private async scanForOccasions(userId: string): Promise<OccasionDetection[]> {
    // Mock implementation
    return [];
  }

  private generateOccasionActions(occasion: any): any {
    const reminderDate = new Date(occasion.date);
    reminderDate.setDate(reminderDate.getDate() - 1);

    return {
      reminderTime: reminderDate,
      giftSuggestions: ['cake', 'party', 'champagne'],
      messageSuggestions: [
        'Happy Birthday! 🎂',
        'Wishing you an amazing day! 🎉',
        'Celebrate in style! 🥂',
      ],
    };
  }

  private async buildUserProfile(userId: string): Promise<UserProfile> {
    // Mock implementation
    return {
      id: userId,
      preferences: {
        giftCategories: ['emoji', 'crypto'],
        priceRange: [5, 50],
        occasions: ['birthday', 'achievement'],
      },
      history: {
        sentGifts: 10,
        receivedGifts: 8,
        favoriteGifts: ['heart', 'rocket', 'trophy'],
        avgGiftValue: 15,
      },
      relationships: {},
    };
  }

  private findOverdueGifts(profile: UserProfile): SmartSuggestion[] {
    return [];
  }

  private generateKindnessSuggestions(profile: UserProfile): SmartSuggestion[] {
    return [];
  }

  private generateMilestoneSuggestions(profile: UserProfile): SmartSuggestion[] {
    return [];
  }

  private getBasicEnhancement(message: string): MessageEnhancement {
    return {
      originalMessage: message,
      suggestions: [
        {
          enhanced: message + ' 💝',
          tone: 'friendly',
          emoji: ['💝', '✨'],
          confidence: 0.8,
        },
      ],
    };
  }

  private enhanceForTone(message: string, tone: any, context: any): any {
    const enhancements: Record<string, string> = {
      friendly: message + ' 😊',
      heartfelt: message + ' ❤️',
      playful: message + ' 🎉',
      humorous: message + ' 😄',
    };

    return {
      enhanced: enhancements[tone] || message,
      tone,
      emoji: this.suggestEmojis(tone),
      confidence: 0.75,
    };
  }

  private suggestEmojis(tone: string): string[] {
    const emojiMap: Record<string, string[]> = {
      friendly: ['😊', '👋', '💙'],
      heartfelt: ['❤️', '💕', '🥰'],
      playful: ['🎉', '🎊', '🎈'],
      humorous: ['😄', '🤣', '😂'],
      formal: ['🙏', '👍', '✨'],
    };

    return emojiMap[tone] || ['😊'];
  }

  private getBasicTrend(giftId: string): TrendingInsight {
    return {
      giftId,
      trendScore: 50,
      velocity: 'stable',
      predictedPopularity: 50,
      optimalPricing: 10,
      demographics: {
        ageRange: '18-35',
        topLocations: ['Global'],
        peakHours: [12, 18, 20],
      },
    };
  }

  private async fetchGiftHistory(giftId: string, timeRange: string): Promise<any[]> {
    return [];
  }

  private calculateTrendScore(data: any[]): number {
    return 65;
  }

  private calculateVelocity(data: any[]): 'rising' | 'stable' | 'falling' {
    return 'stable';
  }

  private predictFuturePopularity(data: any[]): number {
    return 70;
  }

  private calculateOptimalPrice(data: any[], prediction: number): number {
    return 10;
  }

  private analyzeDemographics(data: any[]): any {
    return {
      ageRange: '18-35',
      topLocations: ['US', 'UK', 'Canada'],
      peakHours: [12, 18, 20],
    };
  }

  private createBasicComposition(theme: string, budget: number, gifts: Gift[]): GiftComposition {
    const selectedGifts = gifts.slice(0, 3);
    
    return {
      theme,
      gifts: selectedGifts.map((gift, i) => ({
        giftId: gift.id,
        position: { x: i * 2, y: 0, z: 0 },
        scale: 1,
        rotation: 0,
      })),
      totalValue: selectedGifts.reduce((sum, g) => sum + g.value, 0),
      rarity: 'rare',
      name: `${theme} Collection`,
      description: `A special ${theme} gift bundle`,
    };
  }

  private selectGiftsForTheme(theme: string, budget: number, gifts: Gift[]): Gift[] {
    return gifts.filter(g => g.value <= budget / 3).slice(0, 5);
  }

  private create3DArrangement(gifts: Gift[]): any[] {
    return gifts.map((gift, i) => ({
      giftId: gift.id,
      position: {
        x: Math.cos((i * Math.PI * 2) / gifts.length) * 3,
        y: Math.sin((i * Math.PI) / 4),
        z: Math.sin((i * Math.PI * 2) / gifts.length) * 3,
      },
      scale: 1 + (gift.value / 100),
      rotation: (i * 360) / gifts.length,
    }));
  }

  private determineCompositeRarity(gifts: Gift[]): string {
    const rarityScores = { common: 1, rare: 2, epic: 3, legendary: 4, mythic: 5 };
    const avgScore = gifts.reduce((sum, g) => sum + (rarityScores[g.rarity || 'common'] || 1), 0) / gifts.length;
    
    if (avgScore >= 4) return 'legendary';
    if (avgScore >= 3) return 'epic';
    if (avgScore >= 2) return 'rare';
    return 'common';
  }

  private generateCompositionName(theme: string, gifts: Gift[]): string {
    return `${theme} Bundle (${gifts.length} gifts)`;
  }

  private generateCompositionDescription(theme: string, gifts: Gift[]): string {
    return `A ${theme}-themed collection featuring ${gifts.map(g => g.emoji).join(' ')}`;
  }

  private async analyzeActivityPattern(recipientId: string): Promise<any> {
    return {
      peakHours: [9, 12, 18, 20],
      timezone: 'UTC',
      avgResponseTime: 300, // seconds
    };
  }

  private findPeakEngagementTime(pattern: any): Date {
    const now = new Date();
    const nextPeakHour = pattern.peakHours.find((h: number) => h > now.getHours()) || pattern.peakHours[0];
    
    const nextPeak = new Date(now);
    nextPeak.setHours(nextPeakHour, 0, 0, 0);
    
    if (nextPeak < now) {
      nextPeak.setDate(nextPeak.getDate() + 1);
    }
    
    return nextPeak;
  }

  private explainTimingChoice(pattern: any, time: Date): string {
    return `Best time based on recipient's typical activity at ${time.getHours()}:00`;
  }

  private getOccasionText(occasion?: string): string {
    const texts: Record<string, string> = {
      birthday: 'Happy Birthday!',
      anniversary: 'Happy Anniversary!',
      achievement: 'Congratulations!',
      holiday: 'Happy Holidays!',
    };

    return occasion ? texts[occasion] || '' : '';
  }

  private getBasicBehaviorAnalysis(): any {
    return {
      giftingPersonality: 'Balanced Giver',
      topCategories: ['emoji', 'celebration'],
      averageValue: 10,
      frequency: 'weekly',
      insights: ['You enjoy celebrating special moments'],
      recommendations: ['Try seasonal gifts', 'Explore rare collections'],
    };
  }

  private determinePersonality(profile: UserProfile): string {
    const avgValue = profile.history.avgGiftValue;
    const frequency = profile.history.sentGifts;

    if (avgValue > 50 && frequency > 20) return 'Generous Benefactor';
    if (frequency > 30) return 'Social Butterfly';
    if (avgValue > 100) return 'Luxury Patron';
    if (frequency < 5) return 'Thoughtful Occasional Giver';
    return 'Balanced Giver';
  }

  private extractTopCategories(profile: UserProfile): string[] {
    return profile.preferences.giftCategories.slice(0, 3);
  }

  private determineFrequency(profile: UserProfile): string {
    const giftsPerMonth = profile.history.sentGifts / 12;
    
    if (giftsPerMonth > 20) return 'daily';
    if (giftsPerMonth > 4) return 'weekly';
    if (giftsPerMonth > 1) return 'monthly';
    return 'occasional';
  }

  private generateInsights(profile: UserProfile): string[] {
    return [
      'You have a consistent gifting pattern',
      'Your friends appreciate your thoughtfulness',
      'You\'re in the top 20% of gifters this month',
    ];
  }

  private generateBehaviorRecommendations(profile: UserProfile): string[] {
    return [
      'Try gifting during peak hours for better engagement',
      'Explore new gift categories to surprise friends',
      'Consider group gifts for bigger impact',
    ];
  }

  private getCached(key: string): any {
    const cached = this.recommendationCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    return null;
  }

  private setCached(key: string, data: any): void {
    this.recommendationCache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }
}

export const aiService = new AIService();
