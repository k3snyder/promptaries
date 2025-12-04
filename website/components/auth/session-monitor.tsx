/**
 * Session Monitor Component
 *
 * Monitors session state and handles global session errors like
 * RefreshTokenError. Shows toast notifications for session-related
 * issues and automatically redirects to login when needed.
 *
 * Usage:
 * This component should be placed in the Providers component to
 * monitor session globally. It renders nothing but watches for errors.
 */

'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';

export function SessionMonitor() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const hasShownToast = useRef(false);

  useEffect(() => {
    // Only handle authenticated sessions with errors
    if (status !== 'authenticated' || !session) {
      return;
    }

    // Check for RefreshTokenError
    if (session.error === 'RefreshTokenError' && !hasShownToast.current) {
      hasShownToast.current = true;

      // Show toast notification
      toast.error('Your session has expired', {
        description: 'You will be redirected to sign in again.',
        duration: 3000,
      });

      // Redirect to login after 3 seconds, preserving current path
      setTimeout(() => {
        const callbackUrl = encodeURIComponent(pathname || '/');
        router.push(`/login?error=SessionExpired&callbackUrl=${callbackUrl}`);
      }, 3000);
    }
  }, [session, status, router, pathname]);

  // Reset toast flag when session becomes valid again
  useEffect(() => {
    if (status === 'authenticated' && session && !session.error) {
      hasShownToast.current = false;
    }
  }, [session, status]);

  return null; // This component doesn't render anything
}
