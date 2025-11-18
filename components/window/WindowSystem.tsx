"use client";

import React from 'react';
import { WindowProvider } from '@/contexts/WindowContext';
import { WindowContainer } from './WindowContainer';
import { WindowPocket } from './WindowPocket';

export function WindowSystem({ children }: { children: React.ReactNode }) {
  return (
    <WindowProvider>
      {children}
      <WindowContainer />
      <WindowPocket />
    </WindowProvider>
  );
}
