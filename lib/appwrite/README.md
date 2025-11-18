# Appwrite Integration Documentation

## Overview

This directory contains the complete Appwrite integration for Tenchat, implementing all features specified in `appwrite.config.json`.

## Directory Structure

```
src/lib/appwrite/
├── config/
│   ├── client.ts          # Appwrite client initialization
│   ├── constants.ts       # Database, collection, and bucket IDs
│   └── index.ts           # Config exports
├── services/
│   ├── auth.service.ts         # Authentication (JWT, Phone, Email, Magic URL, etc.)
│   ├── profile.service.ts      # User profiles management
│   ├── messaging.service.ts    # Direct messaging & conversations
│   ├── contacts.service.ts     # Contact management
│   ├── social.service.ts       # Posts, stories, comments, reactions
│   ├── web3.service.ts         # Wallets, NFTs, crypto transactions
│   ├── content.service.ts      # Stickers, GIFs, polls, AR filters
│   ├── storage.service.ts      # File uploads & storage
│   ├── realtime.service.ts     # Real-time subscriptions
│   ├── notifications.service.ts # Push notifications & activity
│   └── index.ts                # Service exports
└── index.ts                    # Main export
```

## Authentication Service (`auth.service.ts`)

Implements all authentication methods from appwrite.config.json:

### Available Methods

#### Wallet Authentication (Web3)
```typescript
await authService.loginWithWallet({
  email: 'user@example.com',
  address: '0x...',
  signature: '0x...',
  message: 'auth-timestamp'
});
```

#### Email & Password
```typescript
// Register
await authService.registerWithEmail(email, password, name);

// Login
await authService.loginWithEmail(email, password);
```

#### Email OTP
```typescript
// Send OTP
await authService.sendEmailOTP(email);

// Verify OTP
await authService.verifyEmailOTP(userId, secret);
```

#### Magic URL
```typescript
// Send magic link
await authService.sendMagicURL(email, redirectUrl);

// Verify (called from redirect)
await authService.verifyMagicURL(userId, secret);
```

#### Phone Authentication
```typescript
// Send OTP
await authService.sendPhoneOTP(phone);

// Verify OTP
await authService.verifyPhoneOTP(userId, secret);
```

#### Anonymous Session
```typescript
await authService.loginAnonymous();
```

#### JWT Token
```typescript
const jwt = await authService.createJWT();
```

### Session Management
```typescript
// Get current user
const user = await authService.getCurrentUser();

// Check authentication
const isAuth = await authService.isAuthenticated();

// List all sessions
const sessions = await authService.listSessions();

// Logout
await authService.logout();

// Logout from all devices
await authService.deleteAllSessions();
```

### Account Management
```typescript
// Update name
await authService.updateName('New Name');

// Update preferences
await authService.updatePreferences({ walletEth: '0x...' });

// Update email
await authService.updateEmail(newEmail, password);

// Update password
await authService.updatePassword(newPassword, oldPassword);

// Update phone
await authService.updatePhone(phone, password);
```

### Password Recovery
```typescript
// Send recovery email
await authService.sendPasswordRecovery(email, redirectUrl);

// Complete recovery
await authService.completePasswordRecovery(userId, secret, newPassword);
```

### Email/Phone Verification
```typescript
// Send verification
await authService.sendEmailVerification(redirectUrl);
await authService.sendPhoneVerification();

// Verify
await authService.verifyEmail(userId, secret);
await authService.verifyPhone(userId, secret);
```

## Profile Service (`profile.service.ts`)

User profile management in mainDB/profiles collection.

```typescript
// Get profile
const profile = await profileService.getProfile(userId);

// Create profile
const profile = await profileService.createProfile(userId, {
  username: 'username',
  displayName: 'Display Name',
  email: 'user@example.com',
  walletAddress: '0x...'
});

// Update profile
await profileService.updateProfile(profileId, {
  bio: 'New bio',
  displayName: 'New name'
});

// Update online status
await profileService.updateOnlineStatus(profileId, true);

// Search profiles
const results = await profileService.searchProfiles('query');
```

## Messaging Service (`messaging.service.ts`)

Direct messaging and conversations in mainDB.

```typescript
// Create conversation
const conversation = await messagingService.createConversation([userId1, userId2]);

// Get conversations
const conversations = await messagingService.getConversations(userId);

// Send message
const message = await messagingService.sendMessage(conversationId, {
  senderId: userId,
  content: 'Hello!',
  type: 'text'
});

// Get messages
const messages = await messagingService.getMessages(conversationId);

// Delete message
await messagingService.deleteMessage(messageId);

// Mark as read
await messagingService.markAsRead(conversationId, userId);
```

## Social Service (`social.service.ts`)

Social features in socialDB: posts, stories, comments, reactions.

```typescript
// Create post
const post = await socialService.createPost({
  userId: userId,
  content: 'Post content',
  mediaUrls: ['url1', 'url2']
});

// Get posts
const posts = await socialService.getPosts(userId);

// React to post
await socialService.reactToPost(postId, userId, 'like');

// Add comment
await socialService.addComment(postId, userId, 'Comment text');

// Create story
const story = await socialService.createStory({
  userId: userId,
  mediaUrl: 'url',
  mediaType: 'image'
});

// Follow user
await socialService.followUser(followerId, followingId);
```

## Web3 Service (`web3.service.ts`)

Web3 features in web3DB: wallets, NFTs, transactions.

```typescript
// Create wallet
const wallet = await web3Service.createWallet({
  userId: userId,
  address: '0x...',
  chainId: 1,
  isPrimary: true
});

// Get wallets
const wallets = await web3Service.getWallets(userId);

// Add NFT
const nft = await web3Service.addNFT({
  userId: userId,
  contractAddress: '0x...',
  tokenId: '123',
  chainId: 1
});

// Get NFTs
const nfts = await web3Service.getNFTs(userId);

// Record transaction
await web3Service.recordTransaction({
  userId: userId,
  type: 'send',
  amount: '1.5',
  currency: 'ETH',
  toAddress: '0x...'
});

// Send token gift
await web3Service.sendTokenGift({
  senderId: userId,
  recipientId: recipientId,
  amount: '10',
  tokenSymbol: 'ETH'
});
```

## Content Service (`content.service.ts`)

Content management in contentDB: stickers, GIFs, polls, AR filters.

```typescript
// Get sticker packs
const packs = await contentService.getStickerPacks();

// Get stickers from pack
const stickers = await contentService.getStickers(packId);

// Create poll
const poll = await contentService.createPoll({
  userId: userId,
  question: 'Question?',
  options: ['Option 1', 'Option 2'],
  expiresAt: new Date()
});

// Vote on poll
await contentService.votePoll(pollId, userId, optionIndex);

// Get AR filters
const filters = await contentService.getARFilters();
```

## Storage Service (`storage.service.ts`)

File upload and management.

```typescript
// Upload file
const file = await storageService.uploadFile(
  'avatars',  // bucket ID
  file,       // File object
  ['read("any")'] // permissions
);

// Get file URL
const url = storageService.getFileUrl('avatars', fileId);

// Get file preview
const previewUrl = storageService.getFilePreview('avatars', fileId, 200, 200);

// Delete file
await storageService.deleteFile('avatars', fileId);
```

## Realtime Service (`realtime.service.ts`)

Real-time subscriptions for live updates.

```typescript
// Subscribe to messages
const unsubscribe = realtimeService.subscribeToMessages(
  conversationId,
  (message) => {
    console.log('New message:', message);
  }
);

// Subscribe to presence
realtimeService.subscribeToPresence(userId, (status) => {
  console.log('User status:', status);
});

// Subscribe to typing indicators
realtimeService.subscribeToTyping(conversationId, (typing) => {
  console.log('User typing:', typing);
});

// Subscribe to stories
realtimeService.subscribeToStories((story) => {
  console.log('New story:', story);
});

// Unsubscribe
unsubscribe();
```

## Notifications Service (`notifications.service.ts`)

Push notifications and activity tracking in analyticsDB.

```typescript
// Get notifications
const notifications = await notificationsService.getNotifications(userId);

// Mark as read
await notificationsService.markAsRead(notificationId);

// Mark all as read
await notificationsService.markAllAsRead(userId);

// Delete notification
await notificationsService.deleteNotification(notificationId);
```

## Contacts Service (`contacts.service.ts`)

Contact management in mainDB.

```typescript
// Add contact
await contactsService.addContact(userId, contactUserId);

// Get contacts
const contacts = await contactsService.getContacts(userId);

// Remove contact
await contactsService.removeContact(contactId);

// Block user
await contactsService.blockUser(userId, blockedUserId);
```

## React Hooks

### useAuth Hook

Convenient hook for authentication throughout the app.

```typescript
import { useAuth } from '@/hooks/useAuth';

function Component() {
  const {
    currentUser,
    currentProfile,
    isAuthenticated,
    isLoading,
    loginWithWallet,
    loginWithEmail,
    logout,
    getDisplayName,
    getShortWalletAddress
  } = useAuth();

  // Use authentication state and methods
}
```

### useAppwrite Context

Direct access to Appwrite context.

```typescript
import { useAppwrite } from '@/contexts/AppwriteContext';

function Component() {
  const {
    currentAccount,
    currentProfile,
    isAuthenticated,
    isLoading,
    loginWithWallet,
    logout,
    refreshProfile,
    forceRefreshAuth
  } = useAppwrite();
}
```

## Environment Variables

Required environment variables in `.env`:

```env
# Appwrite Configuration
VITE_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=tenchat

# Database IDs
VITE_DATABASE_MAIN=mainDB
VITE_DATABASE_SOCIAL=socialDB
VITE_DATABASE_WEB3=web3DB
VITE_DATABASE_CONTENT=contentDB
VITE_DATABASE_ANALYTICS=analyticsDB

# Function IDs
VITE_WEB3_FUNCTION_ID=your-web3-function-id

# Collection IDs (optional, defaults match appwrite.config.json)
VITE_COLLECTION_PROFILES=profiles
VITE_COLLECTION_CONVERSATIONS=conversations
VITE_COLLECTION_MESSAGES=messages
# ... etc
```

## Database Schema

All databases and collections are defined in `appwrite.config.json`:

- **mainDB**: Profiles, Conversations, Messages, Contacts
- **socialDB**: Stories, Posts, Comments, Follows
- **web3DB**: Wallets, NFTs, Transactions, Token Gifts
- **contentDB**: Stickers, GIFs, Polls, AR Filters
- **analyticsDB**: Notifications, Activity, Logs

## Storage Buckets

All storage buckets defined in config:

- **avatars**: Profile avatars (20MB max)
- **covers**: Cover images (20MB max)
- **messages**: Message attachments (100MB max)
- **stories**: Story media (50MB max)
- **posts**: Post media (100MB max)
- **nfts**: NFT images (50MB max)
- **stickers**: Sticker images (5MB max)
- **filters**: AR filter data (20MB max)
- **gifs**: GIF files (10MB max)
- **voice**: Voice messages (50MB max)
- **video**: Video files (500MB max)
- **documents**: Documents (100MB max)

## Best Practices

1. **Error Handling**: All services return structured responses with success/error states
2. **Type Safety**: Full TypeScript support with Appwrite types
3. **Real-time**: Use realtime service for live updates
4. **Permissions**: All collections have proper row-level security
5. **Optimization**: Services use batching and caching where appropriate

## Usage Example

Complete authentication and messaging flow:

```typescript
import { useAuth } from '@/hooks/useAuth';
import { messagingService } from '@/lib/appwrite';

function ChatApp() {
  const { isAuthenticated, currentUser, loginWithWallet, logout } = useAuth();

  // Login with wallet
  const handleLogin = async () => {
    if (!window.ethereum) return;
    
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    const address = accounts[0];
    
    const message = `auth-${Date.now()}`;
    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [`Sign this message: ${message}`, address]
    });
    
    await loginWithWallet('user@example.com', address, signature, message);
  };

  // Send message
  const handleSendMessage = async (conversationId: string, content: string) => {
    await messagingService.sendMessage(conversationId, {
      senderId: currentUser!.$id,
      content,
      type: 'text'
    });
  };

  return (
    <div>
      {!isAuthenticated ? (
        <button onClick={handleLogin}>Login with Wallet</button>
      ) : (
        <div>
          <p>Welcome, {currentUser?.name}</p>
          <button onClick={logout}>Logout</button>
        </div>
      )}
    </div>
  );
}
```
