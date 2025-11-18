import type { Preview } from '@storybook/react-vite';
import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { tenchatThemeOptions } from '../theme/mui-theme';
import { MockAppwriteProvider } from '../stories/mocks/AppwriteContextMock';
import '../app/globals.css'; // Import global styles including Tailwind/Geist if applicable

const theme = createTheme(tenchatThemeOptions);

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo'
    },
    layout: 'fullscreen', // Good for full-page layouts like ours
    backgrounds: {
        default: 'dark',
        values: [
            { name: 'dark', value: '#0c040b' },
            { name: 'light', value: '#ffffff' },
        ]
    }
  },
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <MockAppwriteProvider>
          <Story />
        </MockAppwriteProvider>
      </ThemeProvider>
    ),
  ],
};

export default preview;
