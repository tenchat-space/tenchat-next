import type { Meta, StoryObj } from '@storybook/react';
import { MainSidebar } from '@/components/navigation/MainSidebar';

const meta: Meta<typeof MainSidebar> = {
  title: 'Navigation/MainSidebar',
  component: MainSidebar,
  tags: ['autodocs'],
  argTypes: {
    activeLeftId: { control: 'select', options: ['chats', 'stories', 'channels', 'contacts', 'calls'] },
    activeRightId: { control: 'select', options: ['profile', 'wallet', 'settings'] },
  },
};

export default meta;
type Story = StoryObj<typeof MainSidebar>;

export const Default: Story = {
  args: {
    activeLeftId: 'chats',
    activeRightId: 'profile',
    setActiveLeftId: (id) => console.log('Left:', id),
    setActiveRightId: (id) => console.log('Right:', id),
  },
};

