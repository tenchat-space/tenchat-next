import type { Meta, StoryObj } from '@storybook/react';
import { ConversationList } from '@/components/chat/sidebar/ConversationList';

// Mock data
const MOCK_CONVERSATIONS = [
  {
    $id: '1',
    name: 'Alice Chen',
    participantIds: ['curr-user', 'alice-id'],
    lastMessageText: 'Hey, are you free for a call?',
  },
  {
    $id: '2',
    name: 'Ten Protocol Team',
    participantIds: ['curr-user', 'bob', 'charlie'],
    lastMessageText: 'New update released!',
  },
  {
    $id: '3',
    participantIds: ['curr-user', 'david'],
    lastMessageText: 'Sent you a sticker',
  },
];

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
    conversations: MOCK_CONVERSATIONS,
    isLoading: false,
    selectedConversation: MOCK_CONVERSATIONS[0],
    onSelectConversation: (conv) => console.log('Selected:', conv),
    legacyUserId: 'curr-user',
    isAuthenticated: true,
    onConnect: () => console.log('Connect'),
  },
};

