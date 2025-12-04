/**
 * NextAuth.js v5 Configuration for Webex OAuth
 *
 * This file configures NextAuth.js with Webex OAuth provider, including:
 * - Access control validation (organization ID + email domain)
 * - Automatic token refresh with 5-minute buffer
 * - User profile synchronization with MongoDB
 * - Audit logging for authentication events
 *
 * Usage:
 * ```typescript
 * import { auth, signIn, signOut } from '@/auth'
 *
 * // Get current session
 * const session = await auth()
 *
 * // Sign in with Webex
 * await signIn('webex')
 *
 * // Sign out
 * await signOut()
 * ```
 */

import NextAuth from 'next-auth';
import Webex from 'next-auth/providers/webex';
import type { NextAuthConfig } from 'next-auth';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import { MongoClient } from 'mongodb';
import { validateAuthEnv } from './lib/auth/env-validation';
import {
  parseAccessControlConfig,
  validateWebexAccess,
  logAccessControl,
} from './lib/auth/access-control';
import {
  isTokenExpiringSoon,
  refreshWebexAccessToken,
  calculateTokenExpiry,
} from './lib/auth/token-refresh';

// Validate environment variables on startup
validateAuthEnv();

// MongoDB client for adapter
const client = new MongoClient(process.env.MONGODB_URI!);
const clientPromise = client.connect();

/**
 * NextAuth.js v5 Configuration
 */
export const config: NextAuthConfig = {
  // MongoDB adapter for user/session storage
  adapter: MongoDBAdapter(clientPromise, {
    databaseName: 'promptaries',
  }),

  // Use Webex OAuth provider
  providers: [
    Webex({
      clientId: process.env.AUTH_WEBEX_ID!,
      clientSecret: process.env.AUTH_WEBEX_SECRET!,
      authorization: {
        params: {
          scope: 'spark:people_read spark:kms', // spark:kms auto-selected by Webex
        },
      },
    }),
  ],

  // Session configuration
  session: {
    strategy: 'jwt', // Stateless JWT sessions (no database sessions)
    maxAge: 24 * 60 * 60, // 24 hours
  },

  // Custom pages
  pages: {
    signIn: '/login',
    error: '/login', // Redirect errors to login page
  },

  // Callbacks for customizing authentication flow
  callbacks: {
    /**
     * signIn Callback - Access Control Validation
     *
     * Called after successful OAuth authentication with Webex.
     * Validates user's organization ID and email domain against whitelists.
     *
     * @returns true to allow sign-in, false to deny
     */
    async signIn({ user, account, profile }) {
      // Only validate for Webex provider
      if (account?.provider !== 'webex') {
        return true;
      }

      // Extract Webex-specific data from profile
      const webexProfile = profile as any;
      const email = user.email || webexProfile?.emails?.[0];
      const orgId = webexProfile?.orgId;

      // Parse access control configuration
      const accessConfig = parseAccessControlConfig();

      // Validate access
      const result = validateWebexAccess(email, orgId, accessConfig);

      // Log the validation result
      logAccessControl(email, orgId, result);

      if (!result.allowed) {
        // Deny access - user will be redirected to /login?error=AccessDenied
        console.warn(
          `Access denied for ${email} (${orgId}): ${result.reason}`
        );
        return false;
      }

      // Allow access
      return true;
    },

    /**
     * jwt Callback - Token Storage and Refresh
     *
     * Called whenever a JWT is created or updated.
     * Stores OAuth tokens and triggers automatic refresh when needed.
     *
     * @returns Updated JWT token
     */
    async jwt({ token, user, account, profile }) {
      // Initial sign-in: Store OAuth tokens and user data
      if (account && profile) {
        const webexProfile = profile as any;

        token.accessToken = account.access_token!;
        token.refreshToken = account.refresh_token!;
        token.expiresAt = calculateTokenExpiry(account.expires_in || 1209600); // 14 days default
        token.provider = 'webex';
        token.userId = user?.id || '';
        token.orgId = webexProfile.orgId;
        token.webexId = webexProfile.id;

        return token;
      }

      // Check if token needs refresh
      if (isTokenExpiringSoon(token.expiresAt as number)) {
        console.log('Access token expiring soon, refreshing...');

        const result = await refreshWebexAccessToken(
          token.refreshToken as string,
          process.env.AUTH_WEBEX_ID!,
          process.env.AUTH_WEBEX_SECRET!
        );

        if (result.success) {
          console.log('Token refresh successful');
          token.accessToken = result.accessToken!;
          token.refreshToken = result.refreshToken!;
          token.expiresAt = calculateTokenExpiry(result.expiresIn!);
          token.error = undefined; // Clear any previous errors
          return token;
        } else {
          console.error('Token refresh failed:', result.message);
          token.error = result.error;
          return token;
        }
      }

      // No refresh needed, return token as-is
      return token;
    },

    /**
     * session Callback - Expose Data to Client
     *
     * Called whenever session is checked on client.
     * Exposes safe user data and error states to client components.
     *
     * @returns Session object for client
     */
    async session({ session, token }) {
      // Populate session with user data and tokens
      return {
        ...session,
        user: {
          ...session.user,
          id: token.userId as string,
          provider: token.provider as 'webex',
          orgId: token.orgId as string,
          webexId: token.webexId as string,
        },
        accessToken: token.accessToken as string,
        error: token.error as 'RefreshTokenError' | undefined,
      };
    },
  },

  // Events for audit logging
  events: {
    /**
     * signIn Event - Log Successful Sign-In
     */
    async signIn({ user, account, profile }) {
      const webexProfile = profile as any;
      console.log(
        `[AUTH ${new Date().toISOString()}] ✅ SIGN-IN: ${user.email} (${
          webexProfile?.orgId || 'N/A'
        })`
      );

      // TODO: Write to audit_logs collection in MongoDB
      // await createAuthAuditLog({
      //   action: 'sign_in',
      //   userId: user.id,
      //   email: user.email,
      //   orgId: webexProfile?.orgId,
      //   provider: account?.provider,
      //   timestamp: new Date(),
      // });
    },

    /**
     * signOut Event - Log Sign-Out
     */
    async signOut(message) {
      const email = (message as any)?.token?.email || 'Unknown';
      console.log(`[AUTH ${new Date().toISOString()}] 🚪 SIGN-OUT: ${email}`);

      // TODO: Write to audit_logs collection
    },

    /**
     * createUser Event - Log New User Creation
     */
    async createUser({ user }) {
      console.log(
        `[AUTH ${new Date().toISOString()}] 👤 NEW USER: ${user.email}`
      );

      // TODO: Write to audit_logs collection
    },
  },
};

// Export NextAuth instance
export const { handlers, auth, signIn, signOut } = NextAuth(config);
