import type { Meta, StoryObj } from '@storybook/react';
import { StoriesList } from '@/components/chat/sidebar/views/StoriesList';

const meta: Meta<typeof StoriesList> = {
  title: 'Chat/Sidebar/Views/StoriesList',
  component: StoriesList,
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
type Story = StoryObj<typeof StoriesList>;

export const Default: Story = {};

