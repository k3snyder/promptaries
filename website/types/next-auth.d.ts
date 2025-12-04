/**
 * TypeScript Type Augmentations for NextAuth.js v5
 *
 * Extends NextAuth's default types to include Webex OAuth specific fields.
 * This provides full TypeScript IntelliSense and type safety for auth throughout the app.
 *
 * Custom Fields Added:
 * - Session.user: id, provider, orgId, webexId
 * - Session: accessToken, error
 * - JWT: provider, userId, accessToken, refreshToken, expiresAt, orgId, webexId, error
 *
 * Usage:
 * ```typescript
 * import { auth } from '@/lib/auth/auth'
 *
 * const session = await auth()
 * session.user.id        // ✅ Type-safe
 * session.user.webexId   // ✅ Type-safe
 * session.accessToken    // ✅ Type-safe
 * ```
 */

import { DefaultSession, DefaultUser } from 'next-auth'
import { DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  /**
   * Extended Session interface with Webex OAuth fields
   */
  interface Session {
    user: {
      /** Database user ID (MongoDB ObjectId as string) */
      id: string
      /** OAuth provider name (always 'webex' for this app) */
      provider: 'webex'
      /** Webex organization ID (for access control) */
      orgId: string
      /** Webex user ID (unique identifier from Webex API) */
      webexId: string
    } & DefaultSession['user']

    /** Webex OAuth access token (for API calls) */
    accessToken: string

    /** Error state for session (e.g., 'RefreshAccessTokenError') */
    error?: 'RefreshAccessTokenError'
  }

  /**
   * Extended User interface (used during sign-in callback)
   */
  interface User extends DefaultUser {
    /** Webex organization ID */
    orgId?: string
    /** Webex user ID */
    webexId?: string
  }
}

declare module 'next-auth/jwt' {
  /**
   * Extended JWT interface with Webex OAuth fields
   */
  interface JWT extends DefaultJWT {
    /** OAuth provider name (always 'webex' for this app) */
    provider: 'webex'
    /** Database user ID (MongoDB ObjectId as string) */
    userId: string
    /** Webex OAuth access token */
    accessToken: string
    /** Webex OAuth refresh token (for token renewal) */
    refreshToken: string
    /** Access token expiration timestamp (Unix time in seconds) */
    expiresAt: number
    /** Webex organization ID (for access control) */
    orgId: string
    /** Webex user ID (unique identifier from Webex API) */
    webexId: string
    /** Error state for JWT (e.g., 'RefreshAccessTokenError') */
    error?: 'RefreshAccessTokenError'
  }
}
