/**
 * Access Control Module for Webex OAuth
 *
 * Implements dual-layer access control with organization ID and email domain validation.
 * Supports two modes:
 * - AND mode: Both organization ID and email domain must match (most secure)
 * - OR mode: Either organization ID or email domain can match (more flexible)
 *
 * Usage:
 * ```typescript
 * const config = parseAccessControlConfig()
 * const result = validateWebexAccess(email, orgId, config)
 *
 * if (!result.allowed) {
 *   console.error(result.message)
 *   // Deny access with result.reason
 * }
 * ```
 */

/**
 * Access control configuration parsed from environment variables
 */
export interface AccessControlConfig {
  /** Allowed Webex organization IDs (whitelist) */
  allowedOrgIds: string[];
  /** Allowed email domains (whitelist, lowercase) */
  allowedDomains: string[];
  /** Access control mode: AND requires both, OR requires either */
  mode: 'AND' | 'OR';
}

/**
 * Result of access validation check
 */
export interface AccessValidationResult {
  /** Whether access is allowed */
  allowed: boolean;
  /** Reason code if access denied */
  reason?: 'NoEmail' | 'UnauthorizedOrganization' | 'UnauthorizedDomain' | 'AccessDenied';
  /** Human-readable message explaining the result */
  message?: string;
}

/**
 * Validates whether a user should be granted access based on their
 * email and Webex organization ID against configured whitelists.
 *
 * @param email - User's email address from Webex
 * @param orgId - User's Webex organization ID
 * @param config - Access control configuration
 * @returns Validation result with allowed flag and optional error details
 */
export function validateWebexAccess(
  email: string | undefined,
  orgId: string | undefined,
  config: AccessControlConfig
): AccessValidationResult {
  // 1. Check email exists and is not empty
  if (!email || email.trim() === '') {
    return {
      allowed: false,
      reason: 'NoEmail',
      message: 'Email address is required for access validation',
    };
  }

  // Trim and lowercase email for consistent comparison
  const normalizedEmail = email.trim().toLowerCase();

  // 2. Extract email domain (part after last @)
  const emailParts = normalizedEmail.split('@');
  const emailDomain = emailParts[emailParts.length - 1];

  // If no domain extracted, deny access
  if (!emailDomain || emailDomain === '') {
    return {
      allowed: false,
      reason: 'UnauthorizedDomain',
      message: 'Invalid email format: no domain found',
    };
  }

  // 3. Check if any access control is configured
  const hasOrgRestriction = config.allowedOrgIds.length > 0;
  const hasDomainRestriction = config.allowedDomains.length > 0;

  // If no restrictions configured, allow all
  if (!hasOrgRestriction && !hasDomainRestriction) {
    return { allowed: true };
  }

  // 4. Validate organization ID (if configured)
  const orgIdValid =
    !hasOrgRestriction || (!!orgId && config.allowedOrgIds.includes(orgId));

  // 5. Validate email domain (if configured)
  const domainValid =
    !hasDomainRestriction || config.allowedDomains.includes(emailDomain);

  // 6. Apply AND/OR logic
  if (config.mode === 'AND') {
    // AND mode: both must pass (if configured)
    if (hasOrgRestriction && !orgIdValid) {
      return {
        allowed: false,
        reason: 'UnauthorizedOrganization',
        message: `Access denied: Your Webex organization is not authorized. Organization ID: ${
          orgId || 'N/A'
        }`,
      };
    }

    if (hasDomainRestriction && !domainValid) {
      return {
        allowed: false,
        reason: 'UnauthorizedDomain',
        message: `Access denied: Your email domain (${emailDomain}) is not authorized. Allowed domains: ${config.allowedDomains.join(
          ', '
        )}`,
      };
    }

    return { allowed: true };
  } else {
    // OR mode: either can pass
    if (orgIdValid || domainValid) {
      return { allowed: true };
    }

    return {
      allowed: false,
      reason: 'AccessDenied',
      message: `Access denied: You are not authorized to access this application. Your organization (${
        orgId || 'N/A'
      }) and email domain (${emailDomain}) do not match any allowed values.`,
    };
  }
}

/**
 * Parses access control configuration from environment variables.
 *
 * Environment variables:
 * - ALLOWED_WEBEX_ORG_IDS: Comma-separated list of organization IDs
 * - ALLOWED_EMAIL_DOMAINS: Comma-separated list of email domains (case-insensitive)
 * - ACCESS_CONTROL_MODE: 'AND' or 'OR' (defaults to 'AND')
 *
 * @returns Parsed access control configuration
 */
export function parseAccessControlConfig(): AccessControlConfig {
  // Parse organization IDs
  const orgIdsRaw = process.env.ALLOWED_WEBEX_ORG_IDS || '';
  const allowedOrgIds = orgIdsRaw
    .split(',')
    .map((id) => id.trim())
    .filter((id) => id.length > 0);

  // Parse email domains (lowercase for case-insensitive comparison)
  const domainsRaw = process.env.ALLOWED_EMAIL_DOMAINS || '';
  const allowedDomains = domainsRaw
    .split(',')
    .map((domain) => domain.trim().toLowerCase())
    .filter((domain) => domain.length > 0);

  // Parse access control mode
  const modeRaw = process.env.ACCESS_CONTROL_MODE?.trim().toUpperCase();
  const mode: 'AND' | 'OR' = modeRaw === 'OR' ? 'OR' : 'AND';

  return {
    allowedOrgIds,
    allowedDomains,
    mode,
  };
}

/**
 * Logs access control validation result for audit purposes.
 *
 * @param email - User's email address
 * @param orgId - User's Webex organization ID
 * @param result - Validation result
 */
export function logAccessControl(
  email: string | undefined,
  orgId: string | undefined,
  result: AccessValidationResult
): void {
  const timestamp = new Date().toISOString();
  const emailDisplay = email || 'N/A';
  const orgDisplay = orgId || 'N/A';

  if (result.allowed) {
    console.log(
      `[AUTH ${timestamp}] ✅ ALLOWED: ${emailDisplay} | Org: ${orgDisplay} | OK`
    );
  } else {
    console.warn(
      `[AUTH ${timestamp}] ❌ DENIED: ${emailDisplay} | Org: ${orgDisplay} | ${result.reason} - ${result.message}`
    );
  }
}
