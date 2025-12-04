/**
 * Token Refresh Tests
 *
 * Tests for token expiration checking and Webex OAuth token refresh functionality.
 *
 * Following TDD: Tests written BEFORE implementation.
 */

describe('isTokenExpiringSoon', () => {
  beforeEach(() => {
    // Mock Date.now() to control current time in tests
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return true when token expires in less than 5 minutes', () => {
    // Current time: 2025-01-01 12:00:00
    const currentTime = new Date('2025-01-01T12:00:00Z').getTime();
    jest.setSystemTime(currentTime);

    // Token expires in 4 minutes (< 5 minute buffer)
    const expiresAt = Math.floor(currentTime / 1000) + 240; // 4 minutes = 240 seconds

    const { isTokenExpiringSoon } = require('../token-refresh');
    const result = isTokenExpiringSoon(expiresAt);

    expect(result).toBe(true);
  });

  it('should return true when token has already expired', () => {
    const currentTime = new Date('2025-01-01T12:00:00Z').getTime();
    jest.setSystemTime(currentTime);

    // Token expired 1 minute ago
    const expiresAt = Math.floor(currentTime / 1000) - 60;

    const { isTokenExpiringSoon } = require('../token-refresh');
    const result = isTokenExpiringSoon(expiresAt);

    expect(result).toBe(true);
  });

  it('should return false when token expires in exactly 5 minutes', () => {
    const currentTime = new Date('2025-01-01T12:00:00Z').getTime();
    jest.setSystemTime(currentTime);

    // Token expires in exactly 5 minutes (300 seconds)
    const expiresAt = Math.floor(currentTime / 1000) + 300;

    const { isTokenExpiringSoon } = require('../token-refresh');
    const result = isTokenExpiringSoon(expiresAt);

    expect(result).toBe(false);
  });

  it('should return false when token expires in more than 5 minutes', () => {
    const currentTime = new Date('2025-01-01T12:00:00Z').getTime();
    jest.setSystemTime(currentTime);

    // Token expires in 10 minutes
    const expiresAt = Math.floor(currentTime / 1000) + 600;

    const { isTokenExpiringSoon } = require('../token-refresh');
    const result = isTokenExpiringSoon(expiresAt);

    expect(result).toBe(false);
  });

  it('should return false when token expires in 14 days (fresh token)', () => {
    const currentTime = new Date('2025-01-01T12:00:00Z').getTime();
    jest.setSystemTime(currentTime);

    // Token expires in 14 days (Webex default)
    const expiresAt = Math.floor(currentTime / 1000) + 14 * 24 * 60 * 60;

    const { isTokenExpiringSoon } = require('../token-refresh');
    const result = isTokenExpiringSoon(expiresAt);

    expect(result).toBe(false);
  });

  it('should handle undefined expiresAt gracefully', () => {
    const { isTokenExpiringSoon } = require('../token-refresh');
    const result = isTokenExpiringSoon(undefined);

    // Should treat as expired
    expect(result).toBe(true);
  });

  it('should handle invalid expiresAt (negative) gracefully', () => {
    const { isTokenExpiringSoon } = require('../token-refresh');
    const result = isTokenExpiringSoon(-1);

    expect(result).toBe(true);
  });
});

describe('refreshWebexAccessToken', () => {
  let fetchMock: jest.Mock;

  beforeEach(() => {
    // Mock global fetch
    fetchMock = jest.fn();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should successfully refresh token with valid response', async () => {
    const mockResponse = {
      access_token: 'new-access-token-xyz',
      refresh_token: 'new-refresh-token-abc',
      expires_in: 1209600, // 14 days in seconds
    };

    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    const { refreshWebexAccessToken } = require('../token-refresh');
    const result = await refreshWebexAccessToken(
      'old-refresh-token',
      'client-id',
      'client-secret'
    );

    expect(result.success).toBe(true);
    expect(result.accessToken).toBe('new-access-token-xyz');
    expect(result.refreshToken).toBe('new-refresh-token-abc');
    expect(result.expiresIn).toBe(1209600);
    expect(result.error).toBeUndefined();
  });

  it('should call Webex token endpoint with correct parameters', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        access_token: 'new-token',
        expires_in: 1209600,
      }),
    });

    const { refreshWebexAccessToken } = require('../token-refresh');
    await refreshWebexAccessToken('refresh-token-123', 'client-id-456', 'client-secret-789');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://webexapis.com/v1/access_token',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: expect.any(String),
      })
    );

    // Verify body contains required parameters
    const callArgs = fetchMock.mock.calls[0];
    const body = callArgs[1].body;
    expect(body).toContain('grant_type=refresh_token');
    expect(body).toContain('refresh_token=refresh-token-123');
    expect(body).toContain('client_id=client-id-456');
    expect(body).toContain('client_secret=client-secret-789');
  });

  it('should handle Webex API returning new refresh token', async () => {
    const mockResponse = {
      access_token: 'new-access-token',
      refresh_token: 'updated-refresh-token', // Webex may rotate refresh token
      expires_in: 1209600,
    };

    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    const { refreshWebexAccessToken } = require('../token-refresh');
    const result = await refreshWebexAccessToken('old-token', 'client-id', 'client-secret');

    expect(result.success).toBe(true);
    expect(result.refreshToken).toBe('updated-refresh-token');
  });

  it('should use old refresh token when Webex does not return new one', async () => {
    const mockResponse = {
      access_token: 'new-access-token',
      // No refresh_token in response
      expires_in: 1209600,
    };

    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    const oldRefreshToken = 'old-refresh-token';
    const { refreshWebexAccessToken } = require('../token-refresh');
    const result = await refreshWebexAccessToken(
      oldRefreshToken,
      'client-id',
      'client-secret'
    );

    expect(result.success).toBe(true);
    expect(result.refreshToken).toBe(oldRefreshToken); // Should keep old token
  });

  it('should handle 401 Unauthorized error (invalid refresh token)', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: async () => ({
        message: 'Invalid refresh token',
      }),
    });

    const { refreshWebexAccessToken } = require('../token-refresh');
    const result = await refreshWebexAccessToken('invalid-token', 'client-id', 'client-secret');

    expect(result.success).toBe(false);
    expect(result.error).toBe('RefreshAccessTokenError');
    expect(result.message).toContain('401');
    expect(result.accessToken).toBeUndefined();
    expect(result.refreshToken).toBeUndefined();
  });

  it('should handle 400 Bad Request error', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: async () => ({
        message: 'Invalid grant_type',
      }),
    });

    const { refreshWebexAccessToken } = require('../token-refresh');
    const result = await refreshWebexAccessToken('token', 'client-id', 'client-secret');

    expect(result.success).toBe(false);
    expect(result.error).toBe('RefreshAccessTokenError');
    expect(result.message).toContain('400');
  });

  it('should handle network errors', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Network error: Failed to fetch'));

    const { refreshWebexAccessToken } = require('../token-refresh');
    const result = await refreshWebexAccessToken('token', 'client-id', 'client-secret');

    expect(result.success).toBe(false);
    expect(result.error).toBe('RefreshAccessTokenError');
    expect(result.message).toContain('Network error');
  });

  it('should handle timeout errors', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Request timeout'));

    const { refreshWebexAccessToken } = require('../token-refresh');
    const result = await refreshWebexAccessToken('token', 'client-id', 'client-secret');

    expect(result.success).toBe(false);
    expect(result.error).toBe('RefreshAccessTokenError');
  });

  it('should handle malformed JSON response', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => {
        throw new Error('Invalid JSON');
      },
    });

    const { refreshWebexAccessToken } = require('../token-refresh');
    const result = await refreshWebexAccessToken('token', 'client-id', 'client-secret');

    expect(result.success).toBe(false);
    expect(result.error).toBe('RefreshAccessTokenError');
    expect(result.message).toContain('Invalid JSON');
  });

  it('should handle missing access_token in response', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        // Missing access_token
        expires_in: 1209600,
      }),
    });

    const { refreshWebexAccessToken } = require('../token-refresh');
    const result = await refreshWebexAccessToken('token', 'client-id', 'client-secret');

    expect(result.success).toBe(false);
    expect(result.error).toBe('RefreshAccessTokenError');
    expect(result.message).toContain('access_token');
  });

  it('should handle missing expires_in in response', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        access_token: 'new-token',
        // Missing expires_in
      }),
    });

    const { refreshWebexAccessToken } = require('../token-refresh');
    const result = await refreshWebexAccessToken('token', 'client-id', 'client-secret');

    expect(result.success).toBe(false);
    expect(result.error).toBe('RefreshAccessTokenError');
    expect(result.message).toContain('expires_in');
  });

  it('should handle empty string parameters gracefully', async () => {
    const { refreshWebexAccessToken } = require('../token-refresh');
    const result = await refreshWebexAccessToken('', '', '');

    expect(result.success).toBe(false);
    expect(result.error).toBe('RefreshAccessTokenError');
  });
});

describe('calculateTokenExpiry', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should calculate correct expiry timestamp from expires_in', () => {
    const currentTime = new Date('2025-01-01T12:00:00Z').getTime();
    jest.setSystemTime(currentTime);

    const expiresIn = 1209600; // 14 days in seconds

    const { calculateTokenExpiry } = require('../token-refresh');
    const expiresAt = calculateTokenExpiry(expiresIn);

    const expectedExpiry = Math.floor(currentTime / 1000) + expiresIn;
    expect(expiresAt).toBe(expectedExpiry);
  });

  it('should handle expires_in of 1 hour', () => {
    const currentTime = new Date('2025-01-01T12:00:00Z').getTime();
    jest.setSystemTime(currentTime);

    const expiresIn = 3600; // 1 hour

    const { calculateTokenExpiry } = require('../token-refresh');
    const expiresAt = calculateTokenExpiry(expiresIn);

    const expectedExpiry = Math.floor(currentTime / 1000) + 3600;
    expect(expiresAt).toBe(expectedExpiry);
  });

  it('should handle very short expiry (60 seconds)', () => {
    const currentTime = new Date('2025-01-01T12:00:00Z').getTime();
    jest.setSystemTime(currentTime);

    const { calculateTokenExpiry } = require('../token-refresh');
    const expiresAt = calculateTokenExpiry(60);

    const expectedExpiry = Math.floor(currentTime / 1000) + 60;
    expect(expiresAt).toBe(expectedExpiry);
  });
});
