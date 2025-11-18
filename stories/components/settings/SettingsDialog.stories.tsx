import type { Meta, StoryObj } from '@storybook/react';
import { SettingsDialog } from '@/components/settings/SettingsDialog';
import { Models } from 'appwrite';

const mockUser = {
    $id: '123',
    name: 'Nathan Favour',
    email: 'nathan@tenchat.space',
    prefs: {}
} as Models.User<Models.Preferences>;

const meta: Meta<typeof SettingsDialog> = {
  title: 'Components/Settings/SettingsDialog',
  component: SettingsDialog,
  tags: ['autodocs'],
  argTypes: {
    open: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof SettingsDialog>;

export const Open: Story = {
  args: {
    open: true,
    onClose: () => console.log('Close'),
    currentUser: mockUser,
  },
};

export const Closed: Story = {
  args: {
    open: false,
    onClose: () => console.log('Close'),
    currentUser: mockUser,
  },
};

