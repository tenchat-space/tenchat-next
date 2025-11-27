/**
 * Runtime Enum Constants
 * 
 * This file provides runtime values for the enums defined in appwrite.d.ts.
 * The .d.ts file only provides type definitions (erased at compile time).
 * This file provides actual JavaScript values that can be used at runtime.
 * 
 * Keep this file in sync with appwrite.d.ts when regenerating types.
 */

export const MessagesContentType = {
    TEXT: "text",
    IMAGE: "image",
    VIDEO: "video",
    AUDIO: "audio",
    FILE: "file",
    GIF: "gif",
    STICKER: "sticker",
    LOCATION: "location",
    CONTACT: "contact",
    POLL: "poll",
    VOICE: "voice",
    CRYPTO_TX: "crypto_tx",
    NFT: "nft",
    TOKEN_GIFT: "token_gift",
    LINK: "link",
    REPLY: "reply",
    FORWARD: "forward",
    STORY_REPLY: "story_reply",
    GAME: "game",
    PREDICTION: "prediction"
} as const;

export type MessagesContentType = typeof MessagesContentType[keyof typeof MessagesContentType];

export const MessagesStatus = {
    SENDING: "sending",
    SENT: "sent",
    DELIVERED: "delivered",
    READ: "read",
    FAILED: "failed"
} as const;

export type MessagesStatus = typeof MessagesStatus[keyof typeof MessagesStatus];

export const ConversationsType = {
    DIRECT: "direct",
    GROUP: "group",
    CHANNEL: "channel",
    BROADCAST: "broadcast",
    COMMUNITY: "community"
} as const;

export type ConversationsType = typeof ConversationsType[keyof typeof ConversationsType];

export const StoriesContentType = {
    IMAGE: "image",
    VIDEO: "video",
    TEXT: "text",
    AUDIO: "audio"
} as const;

export type StoriesContentType = typeof StoriesContentType[keyof typeof StoriesContentType];

export const StoriesPrivacy = {
    PUBLIC: "public",
    FRIENDS: "friends",
    CLOSE_FRIENDS: "close_friends",
    PRIVATE: "private"
} as const;

export type StoriesPrivacy = typeof StoriesPrivacy[keyof typeof StoriesPrivacy];

export const PresenceStatus = {
    ONLINE: "online",
    AWAY: "away",
    BUSY: "busy",
    OFFLINE: "offline"
} as const;

export type PresenceStatus = typeof PresenceStatus[keyof typeof PresenceStatus];

export const ContactsRelationship = {
    FRIEND: "friend",
    FAMILY: "family",
    COLLEAGUE: "colleague",
    ACQUAINTANCE: "acquaintance",
    BLOCKED: "blocked",
    FAVORITE: "favorite"
} as const;

export type ContactsRelationship = typeof ContactsRelationship[keyof typeof ContactsRelationship];

export const PostsContentType = {
    TEXT: "text",
    IMAGE: "image",
    VIDEO: "video",
    AUDIO: "audio",
    POLL: "poll",
    ARTICLE: "article"
} as const;

export type PostsContentType = typeof PostsContentType[keyof typeof PostsContentType];

export const PostsPrivacy = {
    PUBLIC: "public",
    FRIENDS: "friends",
    PRIVATE: "private",
    CUSTOM: "custom"
} as const;

export type PostsPrivacy = typeof PostsPrivacy[keyof typeof PostsPrivacy];

export const FollowsStatus = {
    PENDING: "pending",
    ACCEPTED: "accepted",
    BLOCKED: "blocked"
} as const;

export type FollowsStatus = typeof FollowsStatus[keyof typeof FollowsStatus];

export const WalletsChain = {
    ETHEREUM: "ethereum",
    POLYGON: "polygon",
    BSC: "bsc",
    SOLANA: "solana",
    AVALANCHE: "avalanche",
    ARBITRUM: "arbitrum",
    OPTIMISM: "optimism",
    BASE: "base"
} as const;

export type WalletsChain = typeof WalletsChain[keyof typeof WalletsChain];

export const WalletsWalletType = {
    METAMASK: "metamask",
    WALLETCONNECT: "walletconnect",
    COINBASE: "coinbase",
    PHANTOM: "phantom",
    TRUST: "trust",
    OTHER: "other"
} as const;

export type WalletsWalletType = typeof WalletsWalletType[keyof typeof WalletsWalletType];
