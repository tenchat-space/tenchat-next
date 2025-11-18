import type { Meta, StoryObj } from '@storybook/react';
import { ContactList } from '@/components/chat/sidebar/views/ContactList';

const meta: Meta<typeof ContactList> = {
  title: 'Chat/Sidebar/Views/ContactList',
  component: ContactList,
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
type Story = StoryObj<typeof ContactList>;

export const Default: Story = {};

