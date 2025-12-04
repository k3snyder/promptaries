/**
 * Webex Sign-In Button Component
 *
 * Button for initiating Webex OAuth sign-in flow with:
 * - Loading states with spinner
 * - Keyboard shortcut (Cmd+K / Ctrl+K)
 * - Focus management
 * - WCAG AA compliant colors
 *
 * Usage:
 * ```tsx
 * <WebexButton callbackUrl="/library" />
 * ```
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface WebexButtonProps {
  callbackUrl?: string;
}

export function WebexButton({ callbackUrl = '/' }: WebexButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleSignIn = async () => {
    setIsLoading(true);

    // Blur the button before redirect to prevent focus issues
    if (buttonRef.current) {
      buttonRef.current.blur();
    }

    try {
      await signIn('webex', {
        redirect: true,
        callbackUrl,
      });
    } catch (error) {
      // If sign-in fails, restore button state
      setIsLoading(false);

      // Restore focus if sign-in failed
      if (buttonRef.current) {
        buttonRef.current.focus();
      }
    }
  };

  // Keyboard shortcut: Cmd+K (Mac) or Ctrl+K (Windows/Linux)
  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        handleSignIn();
      }
    };

    document.addEventListener('keydown', handleKeydown);

    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [callbackUrl]); // Re-bind if callbackUrl changes

  return (
    <Button
      ref={buttonRef}
      onClick={handleSignIn}
      disabled={isLoading}
      aria-busy={isLoading}
      className="w-full gap-2 bg-[#008577] hover:bg-[#006b61] text-white"
      size="lg"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Signing in...</span>
        </>
      ) : (
        <>
          <WebexLogo className="h-5 w-5" />
          <span>Sign in with Webex</span>
        </>
      )}
    </Button>
  );
}

/**
 * Webex Logo SVG Component
 */
function WebexLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M19.5 6c.8 0 1.5.7 1.5 1.5v9c0 .8-.7 1.5-1.5 1.5h-15c-.8 0-1.5-.7-1.5-1.5v-9c0-.8.7-1.5 1.5-1.5h15M19.5 4.5h-15C3.1 4.5 2 5.6 2 7v10c0 1.4 1.1 2.5 2.5 2.5h15c1.4 0 2.5-1.1 2.5-2.5V7c0-1.4-1.1-2.5-2.5-2.5zM8 14l2-2-2-2v4zm8 0V10l-2 2 2 2z" />
    </svg>
  );
}
