import type { Meta, StoryObj } from '@storybook/react';
import { ProfilePanel } from '@/components/chat/info/ProfilePanel';
import { Models } from 'appwrite';

const mockAccount = {
    $id: 'user-1',
    name: 'Nathan Favour',
    email: 'nathan@tenchat.space',
    prefs: {},
} as Models.User<Models.Preferences>;

const meta: Meta<typeof ProfilePanel> = {
  title: 'Chat/Info/ProfilePanel',
  component: ProfilePanel,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
        <div style={{ display: 'flex', height: '100vh', justifyContent: 'flex-end' }}>
            <Story />
        </div>
    )
  ]
};

export default meta;
type Story = StoryObj<typeof ProfilePanel>;

export const Authenticated: Story = {
  args: {
    currentAccount: mockAccount,
    logout: async () => console.log('Logout clicked'),
    onOpenSettings: () => console.log('Open Settings clicked'),
  },
};

export const Guest: Story = {
  args: {
    currentAccount: null,
    logout: async () => {},
    onOpenSettings: () => console.log('Open Settings clicked'),
  },
};
