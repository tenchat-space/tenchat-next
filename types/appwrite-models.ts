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
    WalletsChain,
    WalletsWalletType
};

// Base Row type
type Row = Models.Document;

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
