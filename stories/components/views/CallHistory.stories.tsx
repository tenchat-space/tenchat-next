import type { Meta, StoryObj } from '@storybook/react';
import { CallHistory } from '@/components/chat/sidebar/views/CallHistory';

const meta: Meta<typeof CallHistory> = {
  title: 'Chat/Sidebar/Views/CallHistory',
  component: CallHistory,
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
type Story = StoryObj<typeof CallHistory>;

export const Default: Story = {};

