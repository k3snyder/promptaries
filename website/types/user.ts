import { ObjectId } from 'mongodb'

/**
 * User Document Schema for MongoDB
 *
 * This interface defines the structure of user documents in the `users` collection.
 * Users are created/updated automatically by NextAuth.js MongoDB adapter during OAuth.
 *
 * NextAuth.js Fields (managed automatically):
 * - _id, name, email, image, emailVerified
 *
 * Custom Webex OAuth Fields (added via adapter):
 * - webexId, orgId, provider
 */
export interface User {
  /** MongoDB ObjectId (primary key) */
  _id: ObjectId

  /** Display name from Webex profile */
  name: string

  /** Primary email address (unique) */
  email: string

  /** Avatar URL from Webex profile */
  image?: string

  /** Email verification timestamp (managed by NextAuth) */
  emailVerified?: Date

  /** Webex People ID (unique identifier from Webex API) */
  webexId: string

  /** Webex Organization ID (for access control) */
  orgId: string

  /** OAuth provider (always 'webex' for this app) */
  provider: 'webex'

  /** User creation timestamp */
  createdAt?: Date

  /** Last update timestamp */
  updatedAt?: Date
}

/**
 * Serialized User (for client-side use)
 *
 * ObjectId converted to string for JSON serialization.
 */
export interface SerializedUser {
  id: string
  name: string
  email: string
  image?: string
  webexId: string
  orgId: string
  provider: 'webex'
}

/**
 * User Session (exposed via NextAuth session)
 *
 * Minimal user data exposed to client components.
 */
export interface UserSession {
  id: string
  name: string
  email: string
  image?: string
  provider: 'webex'
  orgId: string
  webexId: string
}
