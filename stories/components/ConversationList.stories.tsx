import type { Meta, StoryObj } from '@storybook/react';
import { ConversationList } from '@/components/chat/sidebar/ConversationList';

// Mock data with required Appwrite Document fields
const MOCK_CONVERSATIONS = [
  {
    $id: '1',
    $collectionId: 'conversations',
    $databaseId: 'chat',
    $createdAt: new Date().toISOString(),
    $updatedAt: new Date().toISOString(),
    $permissions: [],
    $sequence: 1,
    name: 'Alice Chen',
    type: 'direct' as const,
    participantIds: ['curr-user', 'alice-id'],
    lastMessageText: 'Hey, are you free for a call?',
    creatorId: 'curr-user',
    adminIds: [],
    moderatorIds: [],
    participantCount: 2,
    maxParticipants: 2,
    isEncrypted: true,
    encryptionVersion: null,
    isPinned: [],
    isMuted: [],
    isArchived: [],
    lastMessageId: null,
    lastMessageAt: null,
    lastMessageSenderId: null,
    unreadCount: null,
    settings: null,
    isPublic: false,
    inviteLink: null,
    inviteLinkExpiry: null,
    category: null,
    tags: [],
    description: null,
    avatarUrl: null,
    avatarFileId: null,
    createdAt: null,
    updatedAt: null,
  },
  {
    $id: '2',
    $collectionId: 'conversations',
    $databaseId: 'chat',
    $createdAt: new Date().toISOString(),
    $updatedAt: new Date().toISOString(),
    $permissions: [],
    $sequence: 2,
    name: 'Ten Protocol Team',
    type: 'group' as const,
    participantIds: ['curr-user', 'bob', 'charlie'],
    lastMessageText: 'New update released!',
    creatorId: 'curr-user',
    adminIds: [],
    moderatorIds: [],
    participantCount: 3,
    maxParticipants: 100,
    isEncrypted: true,
    encryptionVersion: null,
    isPinned: [],
    isMuted: [],
    isArchived: [],
    lastMessageId: null,
    lastMessageAt: null,
    lastMessageSenderId: null,
    unreadCount: null,
    settings: null,
    isPublic: false,
    inviteLink: null,
    inviteLinkExpiry: null,
    category: null,
    tags: [],
    description: null,
    avatarUrl: null,
    avatarFileId: null,
    createdAt: null,
    updatedAt: null,
  },
  {
    $id: '3',
    $collectionId: 'conversations',
    $databaseId: 'chat',
    $createdAt: new Date().toISOString(),
    $updatedAt: new Date().toISOString(),
    $permissions: [],
    $sequence: 3,
    name: null,
    type: 'direct' as const,
    participantIds: ['curr-user', 'david'],
    lastMessageText: 'Sent you a sticker',
    creatorId: 'curr-user',
    adminIds: [],
    moderatorIds: [],
    participantCount: 2,
    maxParticipants: 2,
    isEncrypted: true,
    encryptionVersion: null,
    isPinned: [],
    isMuted: [],
    isArchived: [],
    lastMessageId: null,
    lastMessageAt: null,
    lastMessageSenderId: null,
    unreadCount: null,
    settings: null,
    isPublic: false,
    inviteLink: null,
    inviteLinkExpiry: null,
    category: null,
    tags: [],
    description: null,
    avatarUrl: null,
    avatarFileId: null,
    createdAt: null,
    updatedAt: null,
  },
] as const;

const meta: Meta<typeof ConversationList> = {
  title: 'Chat/Sidebar/ConversationList',
  component: ConversationList,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
        <div style={{ display: 'flex', height: '100vh' }}>
            <Story />
        </div>
    )
  ]
};

export default meta;
type Story = StoryObj<typeof ConversationList>;

export const Loading: Story = {
  args: {
    conversations: [],
    isLoading: true,
    selectedConversation: null,
    onSelectConversation: () => {},
    legacyUserId: 'curr-user',
    isAuthenticated: true,
    onConnect: () => {},
  },
};

export const Empty: Story = {
  args: {
    conversations: [],
    isLoading: false,
    selectedConversation: null,
    onSelectConversation: () => {},
    legacyUserId: 'curr-user',
    isAuthenticated: true,
    onConnect: () => {},
  },
};

export const WithData: Story = {
  args: {
    conversations: MOCK_CONVERSATIONS as any,
    isLoading: false,
    selectedConversation: MOCK_CONVERSATIONS[0] as any,
    onSelectConversation: (conv) => console.log('Selected:', conv),
    legacyUserId: 'curr-user',
    isAuthenticated: true,
    onConnect: () => console.log('Connect'),
  },
};

