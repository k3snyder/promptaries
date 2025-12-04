/**
 * Token Refresh Module for Webex OAuth
 *
 * Handles automatic token refresh for Webex OAuth access tokens.
 * Implements a 5-minute buffer before expiration to prevent race conditions.
 *
 * Usage in NextAuth.js jwt callback:
 * ```typescript
 * import { isTokenExpiringSoon, refreshWebexAccessToken } from '@/lib/auth/token-refresh'
 *
 * // Check if token needs refresh
 * if (isTokenExpiringSoon(token.expiresAt)) {
 *   const result = await refreshWebexAccessToken(
 *     token.refreshToken,
 *     process.env.AUTH_WEBEX_ID!,
 *     process.env.AUTH_WEBEX_SECRET!
 *   )
 *
 *   if (result.success) {
 *     token.accessToken = result.accessToken
 *     token.refreshToken = result.refreshToken
 *     token.expiresAt = calculateTokenExpiry(result.expiresIn)
 *   } else {
 *     token.error = result.error
 *   }
 * }
 * ```
 */

/**
 * Result of token refresh operation
 */
export interface TokenRefreshResult {
  /** Whether the refresh was successful */
  success: boolean;
  /** New access token (if successful) */
  accessToken?: string;
  /** New or existing refresh token (if successful) */
  refreshToken?: string;
  /** Token expiration duration in seconds (if successful) */
  expiresIn?: number;
  /** Error code if refresh failed */
  error?: 'RefreshAccessTokenError';
  /** Human-readable error message */
  message?: string;
}

/**
 * Webex token refresh API response
 */
interface WebexTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type?: string;
}

/**
 * Token expiration buffer in seconds (5 minutes)
 * Triggers refresh when token expires within this window
 */
const TOKEN_EXPIRY_BUFFER_SECONDS = 300; // 5 minutes

/**
 * Checks if an access token is expiring soon and needs to be refreshed.
 * Uses a 5-minute buffer to prevent race conditions.
 *
 * @param expiresAt - Token expiration timestamp (Unix time in seconds)
 * @returns true if token expires within 5 minutes or has already expired
 */
export function isTokenExpiringSoon(expiresAt: number | undefined): boolean {
  if (!expiresAt || expiresAt < 0) {
    return true; // Treat invalid/missing expiry as expired
  }

  const currentTimeSeconds = Math.floor(Date.now() / 1000);
  const expiryThreshold = currentTimeSeconds + TOKEN_EXPIRY_BUFFER_SECONDS;

  return expiresAt < expiryThreshold;
}

/**
 * Calculates token expiration timestamp from expires_in duration.
 *
 * @param expiresIn - Token lifetime in seconds (e.g., 1209600 for 14 days)
 * @returns Token expiration timestamp (Unix time in seconds)
 */
export function calculateTokenExpiry(expiresIn: number): number {
  const currentTimeSeconds = Math.floor(Date.now() / 1000);
  return currentTimeSeconds + expiresIn;
}

/**
 * Refreshes a Webex OAuth access token using a refresh token.
 * Makes a POST request to Webex token endpoint with grant_type=refresh_token.
 *
 * @param refreshToken - Current refresh token
 * @param clientId - Webex OAuth client ID
 * @param clientSecret - Webex OAuth client secret
 * @returns Token refresh result with new tokens or error details
 */
export async function refreshWebexAccessToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string
): Promise<TokenRefreshResult> {
  // Validate inputs
  if (!refreshToken || !clientId || !clientSecret) {
    return {
      success: false,
      error: 'RefreshAccessTokenError',
      message: 'Missing required parameters for token refresh',
    };
  }

  try {
    // Prepare request body (URL-encoded form data)
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    });

    // Call Webex token endpoint
    const response = await fetch('https://webexapis.com/v1/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    // Handle HTTP errors
    if (!response.ok) {
      return {
        success: false,
        error: 'RefreshAccessTokenError',
        message: `Webex token refresh failed with status ${response.status}: ${response.statusText}`,
      };
    }

    // Parse response JSON
    let data: WebexTokenResponse;
    try {
      data = await response.json();
    } catch (jsonError) {
      return {
        success: false,
        error: 'RefreshAccessTokenError',
        message: `Invalid JSON response from Webex: ${
          jsonError instanceof Error ? jsonError.message : 'Unknown error'
        }`,
      };
    }

    // Validate required fields
    if (!data.access_token) {
      return {
        success: false,
        error: 'RefreshAccessTokenError',
        message: 'Webex response missing access_token',
      };
    }

    if (!data.expires_in) {
      return {
        success: false,
        error: 'RefreshAccessTokenError',
        message: 'Webex response missing expires_in',
      };
    }

    // Return successful result
    return {
      success: true,
      accessToken: data.access_token,
      // Webex may return a new refresh token, or we keep the old one
      refreshToken: data.refresh_token || refreshToken,
      expiresIn: data.expires_in,
    };
  } catch (error) {
    // Handle network errors, timeouts, etc.
    return {
      success: false,
      error: 'RefreshAccessTokenError',
      message: `Token refresh failed: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    };
  }
}
