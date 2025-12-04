/**
 * Providers Component
 *
 * Client-side providers wrapper for the application.
 * Includes NextAuth.js SessionProvider and toast notifications.
 *
 * This component wraps all client-side providers and must be
 * placed inside the root layout.
 */

'use client';

import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'sonner';
import { SessionMonitor } from '@/components/auth/session-monitor';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      // Refetch session every 5 minutes to keep it fresh
      refetchInterval={5 * 60}
      // Refetch on window focus
      refetchOnWindowFocus={true}
    >
      <SessionMonitor />
      {children}
      <Toaster position="bottom-right" />
    </SessionProvider>
  );
}
