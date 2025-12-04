/**
 * Authentication Audit Logger
 *
 * Comprehensive audit logging system for tracking all authentication events
 * to MongoDB for compliance, security monitoring, and troubleshooting.
 *
 * All authentication actions (sign-in, sign-out, access denied, token refresh)
 * are logged with timestamps, IP addresses, user agents, and detailed metadata.
 *
 * Usage:
 * ```typescript
 * import { createAuthAuditLog, getRequestContext } from '@/lib/auth/audit-logger'
 * import { getDb } from '@/lib/db/mongodb'
 *
 * const db = await getDb()
 * const context = getRequestContext(request)
 *
 * await createAuthAuditLog(db, {
 *   action: 'sign_in_success',
 *   userId: user.id,
 *   email: user.email,
 *   ...context,
 * })
 * ```
 */

import { Db } from 'mongodb';

/**
 * Authentication action types for audit logging
 */
export type AuthAction =
  | 'sign_in_success'
  | 'sign_in_failed'
  | 'sign_out'
  | 'access_denied'
  | 'token_refresh_success'
  | 'token_refresh_failed'
  | 'session_expired'
  | 'user_created';

/**
 * Audit log document structure
 */
export interface AuthAuditLog {
  /** Action type */
  action: AuthAction;

  /** User ID (if authenticated) */
  userId?: string;

  /** User email */
  email?: string;

  /** Webex organization ID */
  orgId?: string;

  /** OAuth provider */
  provider?: 'webex';

  /** Failure/denial reason */
  reason?: string;

  /** Client IP address */
  ipAddress: string;

  /** Client user agent */
  userAgent: string;

  /** Event timestamp */
  timestamp: Date;

  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Request context extracted from HTTP request
 */
export interface RequestContext {
  /** Client IP address */
  ipAddress: string;

  /** Client user agent */
  userAgent: string;
}

/**
 * Result of audit log creation
 */
export interface AuditLogResult {
  /** Whether the log was successfully created */
  success: boolean;

  /** Error message if failed */
  error?: string;

  /** Inserted document ID if successful */
  insertedId?: string;
}

/**
 * Extracts request context (IP address, user agent) from HTTP request.
 * Handles various proxy headers for IP address detection.
 *
 * @param request - HTTP request object
 * @returns Request context with IP and user agent
 */
export function getRequestContext(request: any): RequestContext {
  if (!request || !request.headers) {
    return {
      ipAddress: 'unknown',
      userAgent: 'unknown',
    };
  }

  // Extract IP address (prioritize x-forwarded-for for proxied requests)
  let ipAddress = 'unknown';

  const forwardedFor = request.headers.get?.('x-forwarded-for');
  const realIp = request.headers.get?.('x-real-ip');

  if (forwardedFor) {
    // x-forwarded-for may contain multiple IPs, take the first (client IP)
    ipAddress = forwardedFor.split(',')[0].trim();
  } else if (realIp) {
    ipAddress = realIp;
  }

  // Extract user agent
  const userAgent = request.headers.get?.('user-agent') || 'unknown';

  return {
    ipAddress,
    userAgent,
  };
}

/**
 * Creates an authentication audit log entry in MongoDB.
 * Logs all authentication events with full context for compliance and security.
 *
 * @param db - MongoDB database instance
 * @param data - Audit log data
 * @returns Result indicating success or failure
 */
export async function createAuthAuditLog(
  db: Db,
  data: Omit<AuthAuditLog, 'timestamp'> & { timestamp?: Date }
): Promise<AuditLogResult> {
  try {
    // Validate required fields
    if (!data.action) {
      return {
        success: false,
        error: 'Missing required field: action',
      };
    }

    // Create audit log document
    const auditLog: AuthAuditLog = {
      ...data,
      timestamp: data.timestamp || new Date(),
    };

    // Insert into auth_audit_logs collection
    const result = await db.collection('auth_audit_logs').insertOne(auditLog);

    // Log to console for immediate visibility
    const message = formatAuditLogMessage(auditLog);
    console.log(message);

    return {
      success: true,
      insertedId: result.insertedId.toString(),
    };
  } catch (error) {
    console.error('[AUDIT LOG ERROR]', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Formats audit log as human-readable console message.
 *
 * @param log - Audit log document
 * @returns Formatted log message
 */
export function formatAuditLogMessage(log: AuthAuditLog): string {
  const timestamp = log.timestamp.toISOString();
  const email = log.email || 'N/A';
  const orgId = log.orgId || 'N/A';
  const ip = log.ipAddress;

  switch (log.action) {
    case 'sign_in_success':
      return `[AUTH ${timestamp}] ✅ SIGN-IN SUCCESS: ${email} | Org: ${orgId} | IP: ${ip}`;

    case 'sign_in_failed':
      return `[AUTH ${timestamp}] ❌ SIGN-IN FAILED: ${email} | Reason: ${log.reason || 'Unknown'} | IP: ${ip}`;

    case 'sign_out':
      return `[AUTH ${timestamp}] 🚪 SIGN-OUT: ${email} | IP: ${ip}`;

    case 'access_denied':
      return `[AUTH ${timestamp}] ❌ ACCESS DENIED: ${email} | Org: ${orgId} | Reason: ${log.reason || 'Unknown'} | IP: ${ip}`;

    case 'token_refresh_success':
      return `[AUTH ${timestamp}] 🔄 TOKEN REFRESH SUCCESS: ${email} | IP: ${ip}`;

    case 'token_refresh_failed':
      return `[AUTH ${timestamp}] ⚠️  TOKEN REFRESH FAILED: ${email} | Reason: ${log.reason || 'Unknown'} | IP: ${ip}`;

    case 'session_expired':
      return `[AUTH ${timestamp}] ⏰ SESSION EXPIRED: ${email} | IP: ${ip}`;

    case 'user_created':
      return `[AUTH ${timestamp}] 👤 USER CREATED: ${email} | Org: ${orgId} | IP: ${ip}`;

    default:
      return `[AUTH ${timestamp}] ${log.action}: ${email} | IP: ${ip}`;
  }
}

/**
 * Queries audit logs by user ID
 *
 * @param db - MongoDB database instance
 * @param userId - User ID to query
 * @param limit - Maximum number of logs to return (default: 100)
 * @returns Array of audit logs
 */
export async function getAuditLogsByUserId(
  db: Db,
  userId: string,
  limit: number = 100
): Promise<AuthAuditLog[]> {
  return db
    .collection<AuthAuditLog>('auth_audit_logs')
    .find({ userId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .toArray();
}

/**
 * Queries audit logs by email
 *
 * @param db - MongoDB database instance
 * @param email - Email address to query
 * @param limit - Maximum number of logs to return (default: 100)
 * @returns Array of audit logs
 */
export async function getAuditLogsByEmail(
  db: Db,
  email: string,
  limit: number = 100
): Promise<AuthAuditLog[]> {
  return db
    .collection<AuthAuditLog>('auth_audit_logs')
    .find({ email })
    .sort({ timestamp: -1 })
    .limit(limit)
    .toArray();
}

/**
 * Queries recent audit logs
 *
 * @param db - MongoDB database instance
 * @param limit - Maximum number of logs to return (default: 100)
 * @returns Array of audit logs
 */
export async function getRecentAuditLogs(
  db: Db,
  limit: number = 100
): Promise<AuthAuditLog[]> {
  return db
    .collection<AuthAuditLog>('auth_audit_logs')
    .find({})
    .sort({ timestamp: -1 })
    .limit(limit)
    .toArray();
}
