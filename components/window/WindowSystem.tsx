"use client";

import React from 'react';
import { WindowProvider } from '@/contexts/WindowContext';
import { PerformanceProvider } from '@/contexts/PerformanceContext';
import { KernelProvider } from '@/contexts/KernelContext';
import { WindowContainer } from './WindowContainer';
import { WindowPocket } from './WindowPocket';

export function WindowSystem({ children }: { children: React.ReactNode }) {
  return (
    <WindowProvider>
      <PerformanceProvider>
        <KernelProvider>
          {children}
          <WindowContainer />
          <WindowPocket />
        </KernelProvider>
      </PerformanceProvider>
    </WindowProvider>
  );
}
