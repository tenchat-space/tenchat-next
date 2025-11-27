/**
 * Appwrite Model Types
 * 
 * This file provides TypeScript types for Appwrite models.
 * Use this for type annotations. For runtime enum values, import from appwrite-enums.ts.
 */

import type { Models } from 'appwrite';
import type {
    MessagesContentType,
    MessagesStatus,
    ConversationsType,
    StoriesContentType,
    StoriesPrivacy,
    PresenceStatus,
    ContactsRelationship,
    PostsContentType,
    PostsPrivacy,
    FollowsStatus,
    WalletsChain,
    WalletsWalletType
} from './appwrite-enums';

// Re-export enums for convenience
export type {
    MessagesContentType,
    MessagesStatus,
    ConversationsType,
    StoriesContentType,
    StoriesPrivacy,
    PresenceStatus,
    ContactsRelationship,
    PostsContentType,
    PostsPrivacy,
    FollowsStatus,
    WalletsChain,
    WalletsWalletType
};

// Base Row type
type Row = Models.Row;

export type Messages = Row & {
    conversationId: string;
    senderId: string;
    content: string;
    contentType: MessagesContentType;
    plainText: string | null;
    mediaUrls: string[];
    mediaFileIds: string[];
    thumbnailUrl: string | null;
    thumbnailFileId: string | null;
    metadata: string | null;
    replyToMessageId: string | null;
    forwardedFromMessageId: string | null;
    forwardedFromConversationId: string | null;
    editedAt: string | null;
    deletedAt: string | null;
    deletedFor: string[];
    isSystemMessage: boolean;
    isPinned: boolean;
    pinnedAt: string | null;
    reactions: string | null;
    mentions: string[];
    links: string[];
    readBy: string[];
    deliveredTo: string[];
    status: MessagesStatus;
    expiresAt: string | null;
    createdAt: string | null;
    updatedAt: string | null;
};

export type Conversations = Row & {
    type: ConversationsType;
    name: string | null;
    description: string | null;
    avatarUrl: string | null;
    avatarFileId: string | null;
    creatorId: string;
    participantIds: string[];
    adminIds: string[];
    moderatorIds: string[];
    participantCount: number;
    maxParticipants: number;
    isEncrypted: boolean;
    encryptionVersion: string | null;
    isPinned: string[];
    isMuted: string[];
    isArchived: string[];
    lastMessageId: string | null;
    lastMessageText: string | null;
    lastMessageAt: string | null;
    lastMessageSenderId: string | null;
    unreadCount: string | null;
    settings: string | null;
    isPublic: boolean;
    inviteLink: string | null;
    inviteLinkExpiry: string | null;
    category: string | null;
    tags: string[];
    createdAt: string | null;
    updatedAt: string | null;
};

export type Stories = Row & {
    userId: string;
    contentType: StoriesContentType;
    mediaUrl: string | null;
    mediaFileId: string | null;
    thumbnailUrl: string | null;
    text: string | null;
    backgroundColor: string | null;
    duration: number;
    filters: string | null;
    stickers: string | null;
    music: string | null;
    location: string | null;
    mentions: string[];
    viewerIds: string[];
    viewCount: number;
    reactionCount: number;
    replyCount: number;
    shareCount: number;
    privacy: StoriesPrivacy;
    allowReplies: boolean;
    expiresAt: string;
    createdAt: string | null;
};

export type Presence = Row & {
    userId: string;
    status: PresenceStatus;
    device: string | null;
    lastSeen: string;
    expiresAt: string;
};

export type Contacts = Row & {
    userId: string;
    contactUserId: string;
    nickname: string | null;
    relationship: ContactsRelationship;
    isBlocked: boolean;
    isFavorite: boolean;
    notes: string | null;
    tags: string[];
    lastInteraction: string | null;
    addedAt: string | null;
    updatedAt: string | null;
};

export type Posts = Row & {
    userId: string;
    content: string | null;
    contentType: PostsContentType;
    mediaUrls: string[];
    mediaFileIds: string[];
    thumbnails: string | null;
    mentions: string[];
    hashtags: string[];
    location: string | null;
    privacy: PostsPrivacy;
    allowComments: boolean;
    allowShares: boolean;
    likeCount: number;
    commentCount: number;
    shareCount: number;
    viewCount: number;
    isPinned: boolean;
    isSponsored: boolean;
    createdAt: string | null;
    updatedAt: string | null;
};

export type Wallets = Row & {
    userId: string;
    address: string;
    chain: WalletsChain;
    walletType: WalletsWalletType;
    isPrimary: boolean;
    nickname: string | null;
    balance: string | null;
    nftsCount: number;
    lastSynced: string | null;
    isVerified: boolean;
    verifiedAt: string | null;
    addedAt: string | null;
};

export type TypingIndicators = Row & {
    conversationId: string;
    userId: string;
    isTyping: boolean;
    expiresAt: string;
};

export type TokenHoldings = Row & {
    userId: string;
    walletAddress: string;
    chain: string;
    tokenAddress: string;
    tokenSymbol: string | null;
    tokenName: string | null;
    balance: string | null;
    decimals: number;
    usdValue: number | null;
    pricePerToken: number | null;
    lastSynced: string | null;
};

export type StickerPacks = Row & {
    name: string;
    description: string | null;
    creatorId: string | null;
    coverImageUrl: string | null;
    coverImageFileId: string | null;
    stickerCount: number;
    isPremium: boolean;
    price: number;
    currency: string | null;
    downloadCount: number;
    isPublic: boolean;
    tags: string[];
    createdAt: string | null;
    updatedAt: string | null;
};

export type Stickers = Row & {
    name: string;
    description: string | null;
    creatorId: string | null;
    packId: string | null;
    imageUrl: string;
    imageFileId: string | null;
    animatedUrl: string | null;
    animatedFileId: string | null;
    tags: string[];
    category: string | null;
    isPremium: boolean;
    isAnimated: boolean;
    usageCount: number;
    isPublic: boolean;
    createdAt: string | null;
};

export type UserStickers = Row & {
    userId: string;
    stickerPackId: string;
    isPurchased: boolean;
    isFavorite: boolean;
    addedAt: string | null;
};

export type GiFs = Row & {
    title: string;
    url: string;
    fileId: string | null;
    thumbnailUrl: string | null;
    source: string | null;
    externalId: string | null;
    tags: string[];
    category: string | null;
    width: number | null;
    height: number | null;
    usageCount: number;
    createdAt: string | null;
};

export type Polls = Row & {
    creatorId: string;
    conversationId: string | null;
    messageId: string | null;
    question: string;
    options: string;
    votes: string | null;
    totalVotes: number;
    allowMultiple: boolean;
    isAnonymous: boolean;
    expiresAt: string | null;
    createdAt: string | null;
};

export type ArFilters = Row & {
    name: string;
    description: string | null;
    creatorId: string | null;
    thumbnailUrl: string;
    thumbnailFileId: string | null;
    filterDataUrl: string;
    filterDataFileId: string | null;
    // category: ArFiltersCategory; // Enum not imported yet
    tags: string[];
    isPremium: boolean;
    usageCount: number;
    isPublic: boolean;
    createdAt: string | null;
};

export type MediaLibrary = Row & {
    userId: string;
    fileId: string;
    fileName: string;
    fileType: string;
    mimeType: string | null;
    fileSize: number | null;
    width: number | null;
    height: number | null;
    duration: number | null;
    thumbnailFileId: string | null;
    url: string | null;
    metadata: string | null;
    tags: string[];
    album: string | null;
    isPublic: boolean;
    uploadedAt: string | null;
};

export type StoryViews = Row & {
    storyId: string;
    viewerId: string;
    watchDuration: number;
    completedView: boolean;
    viewedAt: string | null;
};

export type Follows = Row & {
    followerId: string;
    followingId: string;
    status: FollowsStatus;
    isCloseFriend: boolean;
    notificationsEnabled: boolean;
    createdAt: string | null;
};

// Types for proposed/missing collections
export type Nfts = Row & Record<string, any>;
export type CryptoTransactions = Row & Record<string, any>;
export type TokenGifts = Row & Record<string, any>;
export type Notifications = Row & Record<string, any>;
export type Profiles = Row & Record<string, any>;

