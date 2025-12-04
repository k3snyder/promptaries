/**
 * Login Content Component
 *
 * Main login page content with:
 * - Error message handling (8 error types)
 * - Dismissible error alerts
 * - Webex sign-in button
 * - CallbackUrl preservation
 * - Keyboard shortcut hints
 *
 * Usage:
 * ```tsx
 * <LoginContent />
 * ```
 */

'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { WebexButton } from './webex-button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Error message mapping
const ERROR_MESSAGES: Record<
  string,
  { title: string; description: string; dismissible: boolean }
> = {
  SessionExpired: {
    title: 'Session Expired',
    description:
      'Your session has expired. Please sign in again to continue.',
    dismissible: true,
  },
  AccessDenied: {
    title: 'Access Denied',
    description:
      'Your Webex account is not authorized to access this application. Please contact your administrator if you believe you should have access. Access is restricted by organization or email domain.',
    dismissible: true,
  },
  OAuthSignin: {
    title: 'Authentication Error',
    description:
      'Failed to initiate sign-in with Webex. Please try again or contact support if the problem persists.',
    dismissible: true,
  },
  OAuthCallback: {
    title: 'Authentication Error',
    description:
      'Failed to complete sign-in with Webex. The authentication callback encountered an error. Please try again.',
    dismissible: true,
  },
  OAuthCreateAccount: {
    title: 'Account Creation Failed',
    description:
      'Failed to create your account after Webex authentication. Please try signing in again.',
    dismissible: true,
  },
  EmailCreateAccount: {
    title: 'Account Creation Failed',
    description:
      'Failed to create your account. Please try again or contact support.',
    dismissible: true,
  },
  Callback: {
    title: 'Authentication Error',
    description:
      'An error occurred during the authentication process. Please try signing in again.',
    dismissible: true,
  },
  Default: {
    title: 'Authentication Failed',
    description:
      'An unexpected error occurred during sign-in. Please try again or contact support if the problem persists.',
    dismissible: true,
  },
};

export function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const error = searchParams?.get('error');
  const callbackUrl = searchParams?.get('callbackUrl') || '/';

  const errorInfo = error ? ERROR_MESSAGES[error] || ERROR_MESSAGES.Default : null;

  const handleDismissError = () => {
    // Build new URL without error param
    const params = new URLSearchParams();
    if (callbackUrl && callbackUrl !== '/') {
      params.set('callbackUrl', callbackUrl);
    }

    const newUrl = params.toString() ? `/login?${params.toString()}` : '/login';
    router.replace(newUrl);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome to Promptaries
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in with your Webex account to access the prompt library
          </p>
        </div>

        {/* Error Alert */}
        {errorInfo && (
          <Alert variant="destructive" className="relative pr-12">
            <AlertTitle>{errorInfo.title}</AlertTitle>
            <AlertDescription>{errorInfo.description}</AlertDescription>
            {errorInfo.dismissible && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 h-6 w-6"
                onClick={handleDismissError}
                aria-label="Dismiss error"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </Alert>
        )}

        {/* Sign-In Button */}
        <div className="space-y-4">
          <WebexButton callbackUrl={callbackUrl} />

          {/* Keyboard Shortcut Hint */}
          <p className="text-center text-xs text-muted-foreground">
            Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">⌘K</kbd> or{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">Ctrl+K</kbd> to sign in
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          By signing in, you agree to our terms of service and privacy policy
        </p>
      </div>
    </div>
  );
}
