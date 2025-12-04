/**
 * Environment Variable Validation for NextAuth.js + Webex OAuth
 *
 * Validates that all required environment variables are present and properly formatted
 * before the application starts. Throws descriptive errors for missing/invalid config.
 *
 * Required Variables:
 * - AUTH_SECRET: Secret key for encrypting cookies and tokens (min 32 chars)
 * - NEXTAUTH_URL: Base URL of the application
 * - AUTH_WEBEX_ID: Webex OAuth client ID
 * - AUTH_WEBEX_SECRET: Webex OAuth client secret
 * - MONGODB_URI: MongoDB connection string
 *
 * Optional Variables (Access Control):
 * - ALLOWED_WEBEX_ORG_IDS: Comma-separated list of allowed Webex organization IDs
 * - ALLOWED_EMAIL_DOMAINS: Comma-separated list of allowed email domains
 * - ACCESS_CONTROL_MODE: 'AND' | 'OR' (default: 'AND')
 */

export interface AuthEnvConfig {
  AUTH_SECRET: string;
  NEXTAUTH_URL: string;
  AUTH_WEBEX_ID: string;
  AUTH_WEBEX_SECRET: string;
  MONGODB_URI: string;
  ALLOWED_WEBEX_ORG_IDS?: string;
  ALLOWED_EMAIL_DOMAINS?: string;
  ACCESS_CONTROL_MODE?: 'AND' | 'OR';
}

/**
 * Validates all required environment variables for authentication.
 * Throws an error if any required variables are missing or invalid.
 *
 * @throws {Error} If required environment variables are missing or invalid
 */
export function validateAuthEnv(): void {
  const missingVars: string[] = [];
  const invalidFormats: string[] = [];

  // Check required variables
  const requiredVars = [
    'AUTH_SECRET',
    'NEXTAUTH_URL',
    'AUTH_WEBEX_ID',
    'AUTH_WEBEX_SECRET',
    'MONGODB_URI',
  ] as const;

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  }

  // If any required vars are missing, throw immediately
  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables for authentication:\n` +
        missingVars.map((v) => `  - ${v}`).join('\n') +
        `\n\nPlease check your .env.local file and ensure all required variables are set.`
    );
  }

  // Validate AUTH_SECRET length (should be at least 32 characters)
  const authSecret = process.env.AUTH_SECRET!;
  if (authSecret.length < 32) {
    console.warn(
      `⚠️  AUTH_SECRET should be at least 32 characters long for security. ` +
        `Current length: ${authSecret.length} characters. ` +
        `Generate a secure secret with: openssl rand -base64 32`
    );
  }

  // Validate NEXTAUTH_URL format
  const nextAuthUrl = process.env.NEXTAUTH_URL!;
  try {
    new URL(nextAuthUrl);
  } catch {
    invalidFormats.push('NEXTAUTH_URL must be a valid URL (e.g., http://localhost:3000)');
  }

  // Validate MONGODB_URI format
  const mongoUri = process.env.MONGODB_URI!;
  if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
    invalidFormats.push(
      'MONGODB_URI must start with mongodb:// or mongodb+srv://'
    );
  }

  // If any format validations failed, throw
  if (invalidFormats.length > 0) {
    throw new Error(
      `Invalid environment variable formats:\n` +
        invalidFormats.map((msg) => `  - ${msg}`).join('\n')
    );
  }

  // Check access control configuration
  const hasOrgIds = !!process.env.ALLOWED_WEBEX_ORG_IDS;
  const hasEmailDomains = !!process.env.ALLOWED_EMAIL_DOMAINS;

  if (!hasOrgIds && !hasEmailDomains) {
    console.warn(
      `⚠️  No access control configured. Set ALLOWED_WEBEX_ORG_IDS or ALLOWED_EMAIL_DOMAINS ` +
        `to restrict who can sign in. Without these, any Webex user can authenticate.`
    );
  }

  // Validate ACCESS_CONTROL_MODE if provided
  const accessControlMode = process.env.ACCESS_CONTROL_MODE;
  if (accessControlMode && accessControlMode !== 'AND' && accessControlMode !== 'OR') {
    console.warn(
      `⚠️  ACCESS_CONTROL_MODE must be either 'AND' or 'OR'. ` +
        `Got: ${accessControlMode}. Defaulting to 'AND'.`
    );
  }
}

/**
 * Returns validated environment configuration.
 * Call validateAuthEnv() first to ensure all variables are present.
 */
export function getAuthEnvConfig(): AuthEnvConfig {
  return {
    AUTH_SECRET: process.env.AUTH_SECRET!,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL!,
    AUTH_WEBEX_ID: process.env.AUTH_WEBEX_ID!,
    AUTH_WEBEX_SECRET: process.env.AUTH_WEBEX_SECRET!,
    MONGODB_URI: process.env.MONGODB_URI!,
    ALLOWED_WEBEX_ORG_IDS: process.env.ALLOWED_WEBEX_ORG_IDS,
    ALLOWED_EMAIL_DOMAINS: process.env.ALLOWED_EMAIL_DOMAINS,
    ACCESS_CONTROL_MODE: (process.env.ACCESS_CONTROL_MODE as 'AND' | 'OR') || 'AND',
  };
}
