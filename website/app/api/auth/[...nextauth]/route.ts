/**
 * NextAuth.js API Route Handler
 *
 * This catch-all route handles all NextAuth.js OAuth endpoints:
 * - GET/POST /api/auth/signin - Sign in page and provider selection
 * - GET/POST /api/auth/callback/:provider - OAuth callback handler
 * - GET/POST /api/auth/signout - Sign out handler
 * - GET /api/auth/session - Get current session
 * - GET /api/auth/csrf - Get CSRF token
 * - GET /api/auth/providers - List configured providers
 *
 * NextAuth.js v5 uses Web Standard Request/Response APIs.
 */

import { handlers } from '@/auth';

export const { GET, POST } = handlers;
