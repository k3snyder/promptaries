/**
 * Next.js 16 Proxy for Global Route Protection
 *
 * This proxy:
 * - Protects all routes except public paths (/login, /api/auth/*)
 * - Redirects unauthenticated users to /login with preserved callbackUrl
 * - Handles session expiration (RefreshTokenError) gracefully
 * - Excludes static assets and Next.js internals via matcher config
 *
 * Usage:
 * Proxy runs automatically on all routes matching the config.matcher
 * No manual invocation required.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from './auth';

/**
 * Public paths that don't require authentication
 */
const PUBLIC_PATHS = [
  '/login',
];

/**
 * Check if the given pathname is a public path
 */
function isPublicPath(pathname: string): boolean {
  // Exact match for root and login
  if (PUBLIC_PATHS.includes(pathname)) {
    return true;
  }

  // Allow all NextAuth API routes
  if (pathname.startsWith('/api/auth/')) {
    return true;
  }

  return false;
}

/**
 * Proxy function to protect routes
 */
export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths without authentication
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Check authentication status
  const session = await auth();

  // Handle session expiration (RefreshTokenError)
  if (session?.error === 'RefreshTokenError') {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'SessionExpired');
    loginUrl.searchParams.set(
      'callbackUrl',
      `${pathname}${request.nextUrl.search}`
    );
    return NextResponse.redirect(loginUrl);
  }

  // Redirect unauthenticated users to login
  if (!session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set(
      'callbackUrl',
      `${pathname}${request.nextUrl.search}`
    );
    return NextResponse.redirect(loginUrl);
  }

  // Allow authenticated users to proceed
  return NextResponse.next();
}

/**
 * Matcher configuration to exclude static assets and Next.js internals
 *
 * This prevents proxy from running on:
 * - Next.js internal routes (_next/*)
 * - Static files (images, fonts, etc.)
 * - API routes (except /api/auth/* which needs auth checking)
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - public folder files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot|js|css)$).*)',
  ],
};
