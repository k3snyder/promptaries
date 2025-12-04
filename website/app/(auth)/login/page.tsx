/**
 * Login Page
 *
 * Server Component that wraps LoginContent with Suspense boundary.
 * Provides streaming SSR with loading skeleton for better UX.
 *
 * Route: /login
 */

import { Suspense } from 'react';
import { Metadata } from 'next';
import { LoginContent } from '@/components/auth/login-content';
import { LoginSkeleton } from '@/components/auth/login-skeleton';

export const metadata: Metadata = {
  title: 'Sign In | Promptaries',
  description: 'Sign in to Promptaries with your Webex account',
};

export default function LoginPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-background to-muted">
      <Suspense fallback={<LoginSkeleton />}>
        <LoginContent />
      </Suspense>
    </div>
  );
}
