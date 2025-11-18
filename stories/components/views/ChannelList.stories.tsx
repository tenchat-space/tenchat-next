import type { Meta, StoryObj } from '@storybook/react';
import { ChannelList } from '@/components/chat/sidebar/views/ChannelList';

const meta: Meta<typeof ChannelList> = {
  title: 'Chat/Sidebar/Views/ChannelList',
  component: ChannelList,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 320, height: '100vh' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ChannelList>;

export const Default: Story = {};

