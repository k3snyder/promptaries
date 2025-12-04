/**
 * Middleware Integration Tests
 *
 * Tests for Next.js 15 middleware that protects routes globally.
 * Tests authentication checking, redirect logic, public paths, and
 * session expiration handling.
 *
 * Following TDD: Tests written BEFORE implementation.
 *
 * @jest-environment node
 */

import { NextRequest, NextResponse } from 'next/server';
import middleware from '../middleware';

// Mock the auth() function from auth.ts
jest.mock('../auth', () => ({
  auth: jest.fn(),
}));

describe('Middleware Route Protection', () => {
  const mockAuth = require('../auth').auth;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Public Routes', () => {
    it('should allow access to home page without authentication', async () => {
      // Arrange: No session (unauthenticated)
      mockAuth.mockResolvedValue(null);

      const request = new NextRequest(new URL('http://localhost:3000/'));

      // Act
      const response = await middleware(request);

      // Assert: Should proceed without redirect (no auth check needed for public path)
      expect(response).toBeDefined();
      expect(response?.status).toBe(200); // NextResponse.next() returns 200
      expect(mockAuth).not.toHaveBeenCalled(); // Optimization: skip auth for public paths
    });

    it('should allow access to login page without authentication', async () => {
      // Arrange: No session
      mockAuth.mockResolvedValue(null);

      const request = new NextRequest(new URL('http://localhost:3000/login'));

      // Act
      const response = await middleware(request);

      // Assert: Should proceed without redirect (no auth check needed for public path)
      expect(response).toBeDefined();
      expect(response?.status).toBe(200);
      expect(mockAuth).not.toHaveBeenCalled(); // Optimization: skip auth for public paths
    });

    it('should allow access to NextAuth API routes without authentication', async () => {
      // Arrange: No session
      mockAuth.mockResolvedValue(null);

      const request = new NextRequest(
        new URL('http://localhost:3000/api/auth/signin')
      );

      // Act
      const response = await middleware(request);

      // Assert: Should proceed without redirect (no auth check needed for public path)
      expect(response).toBeDefined();
      expect(response?.status).toBe(200);
      expect(mockAuth).not.toHaveBeenCalled(); // Optimization: skip auth for public paths
    });
  });

  describe('Protected Routes', () => {
    it('should redirect unauthenticated users to login with callbackUrl', async () => {
      // Arrange: No session (unauthenticated)
      mockAuth.mockResolvedValue(null);

      const protectedUrl = 'http://localhost:3000/library';
      const request = new NextRequest(new URL(protectedUrl));

      // Act
      const response = await middleware(request);

      // Assert: Should redirect to login with encoded callbackUrl
      expect(response).toBeInstanceOf(NextResponse);
      expect(response?.status).toBe(307); // Temporary redirect
      const location = response?.headers.get('location');
      expect(location).toContain('/login?callbackUrl=%2Flibrary');
    });

    it('should redirect unauthenticated users to login for /create route', async () => {
      // Arrange: No session
      mockAuth.mockResolvedValue(null);

      const request = new NextRequest(new URL('http://localhost:3000/create'));

      // Act
      const response = await middleware(request);

      // Assert: Should redirect to login
      expect(response).toBeInstanceOf(NextResponse);
      expect(response?.status).toBe(307);
      const location = response?.headers.get('location');
      expect(location).toContain('/login?callbackUrl=%2Fcreate');
    });

    it('should redirect unauthenticated users for nested protected routes', async () => {
      // Arrange: No session
      mockAuth.mockResolvedValue(null);

      const request = new NextRequest(
        new URL('http://localhost:3000/prompts/123/edit')
      );

      // Act
      const response = await middleware(request);

      // Assert: Should redirect with encoded nested path
      expect(response).toBeInstanceOf(NextResponse);
      expect(response?.status).toBe(307);
      const location = response?.headers.get('location');
      expect(location).toContain('/login?callbackUrl=%2Fprompts%2F123%2Fedit');
    });

    it('should allow authenticated users to access protected routes', async () => {
      // Arrange: Valid session
      mockAuth.mockResolvedValue({
        user: {
          id: 'user-123',
          email: 'user@example.com',
          name: 'Test User',
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      const request = new NextRequest(new URL('http://localhost:3000/library'));

      // Act
      const response = await middleware(request);

      // Assert: Should proceed without redirect
      expect(response).toBeDefined();
      expect(response?.status).toBe(200);
      expect(mockAuth).toHaveBeenCalled();
    });
  });

  describe('Session Expiration Handling', () => {
    it('should redirect to login with error when session has RefreshTokenError', async () => {
      // Arrange: Session with refresh token error
      mockAuth.mockResolvedValue({
        user: {
          id: 'user-123',
          email: 'user@example.com',
        },
        error: 'RefreshTokenError',
        expires: new Date(Date.now() + 1000).toISOString(),
      });

      const request = new NextRequest(new URL('http://localhost:3000/library'));

      // Act
      const response = await middleware(request);

      // Assert: Should redirect to login with error and callbackUrl
      expect(response).toBeInstanceOf(NextResponse);
      expect(response?.status).toBe(307);
      const location = response?.headers.get('location');
      expect(location).toContain('/login');
      expect(location).toContain('error=SessionExpired');
      expect(location).toContain('callbackUrl=%2Flibrary');
    });
  });

  describe('URL Encoding', () => {
    it('should properly encode callbackUrl with query parameters', async () => {
      // Arrange: No session
      mockAuth.mockResolvedValue(null);

      const request = new NextRequest(
        new URL('http://localhost:3000/prompts/123?view=detail&tab=history')
      );

      // Act
      const response = await middleware(request);

      // Assert: Should encode full path including query params
      expect(response).toBeInstanceOf(NextResponse);
      const location = response?.headers.get('location');
      expect(location).toContain('/login?callbackUrl=');
      // Query params should be encoded
      expect(location).toContain('%2Fprompts%2F123');
      expect(location).toContain('view%3Ddetail');
      expect(location).toContain('tab%3Dhistory');
    });
  });

  describe('Matcher Configuration', () => {
    // Note: Matcher configuration is tested by ensuring middleware
    // is NOT called for static assets. In production, Next.js handles
    // this automatically based on the config.matcher export.
    // These tests verify the middleware logic for paths that would
    // reach the middleware after matcher filtering.

    it('should handle root path correctly', async () => {
      // Arrange: No session
      mockAuth.mockResolvedValue(null);

      const request = new NextRequest(new URL('http://localhost:3000/'));

      // Act
      const response = await middleware(request);

      // Assert: Root is public, should not redirect
      expect(response).toBeDefined();
      expect(response?.status).toBe(200);
    });

    it('should handle paths with trailing slashes', async () => {
      // Arrange: No session
      mockAuth.mockResolvedValue(null);

      const request = new NextRequest(new URL('http://localhost:3000/library/'));

      // Act
      const response = await middleware(request);

      // Assert: Should redirect (protected route)
      expect(response).toBeInstanceOf(NextResponse);
      expect(response?.headers.get('location')).toContain('/login');
    });
  });
});
