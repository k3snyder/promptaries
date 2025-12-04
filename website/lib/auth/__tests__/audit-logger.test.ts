/**
 * Audit Logger Tests
 *
 * Tests for authentication audit logging system that tracks all auth events
 * to MongoDB for compliance and security monitoring.
 *
 * Following TDD: Tests written BEFORE implementation.
 */

import { AuthAuditLog, AuthAction } from '../audit-logger';

describe('getRequestContext', () => {
  it('should extract IP address from x-forwarded-for header', () => {
    const mockRequest = {
      headers: {
        get: (name: string) => {
          if (name === 'x-forwarded-for') return '203.0.113.195, 70.41.3.18';
          return null;
        },
      },
    };

    const { getRequestContext } = require('../audit-logger');
    const context = getRequestContext(mockRequest as any);

    expect(context.ipAddress).toBe('203.0.113.195'); // First IP in chain
  });

  it('should extract IP address from x-real-ip header', () => {
    const mockRequest = {
      headers: {
        get: (name: string) => {
          if (name === 'x-real-ip') return '192.168.1.100';
          return null;
        },
      },
    };

    const { getRequestContext } = require('../audit-logger');
    const context = getRequestContext(mockRequest as any);

    expect(context.ipAddress).toBe('192.168.1.100');
  });

  it('should prefer x-forwarded-for over x-real-ip', () => {
    const mockRequest = {
      headers: {
        get: (name: string) => {
          if (name === 'x-forwarded-for') return '203.0.113.195';
          if (name === 'x-real-ip') return '192.168.1.100';
          return null;
        },
      },
    };

    const { getRequestContext } = require('../audit-logger');
    const context = getRequestContext(mockRequest as any);

    expect(context.ipAddress).toBe('203.0.113.195');
  });

  it('should handle missing IP address gracefully', () => {
    const mockRequest = {
      headers: {
        get: () => null,
      },
    };

    const { getRequestContext } = require('../audit-logger');
    const context = getRequestContext(mockRequest as any);

    expect(context.ipAddress).toBe('unknown');
  });

  it('should extract user agent', () => {
    const mockRequest = {
      headers: {
        get: (name: string) => {
          if (name === 'user-agent') return 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)';
          return null;
        },
      },
    };

    const { getRequestContext } = require('../audit-logger');
    const context = getRequestContext(mockRequest as any);

    expect(context.userAgent).toBe('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)');
  });

  it('should handle missing user agent gracefully', () => {
    const mockRequest = {
      headers: {
        get: () => null,
      },
    };

    const { getRequestContext } = require('../audit-logger');
    const context = getRequestContext(mockRequest as any);

    expect(context.userAgent).toBe('unknown');
  });

  it('should handle null request gracefully', () => {
    const { getRequestContext } = require('../audit-logger');
    const context = getRequestContext(null);

    expect(context.ipAddress).toBe('unknown');
    expect(context.userAgent).toBe('unknown');
  });

  it('should handle undefined request gracefully', () => {
    const { getRequestContext } = require('../audit-logger');
    const context = getRequestContext(undefined);

    expect(context.ipAddress).toBe('unknown');
    expect(context.userAgent).toBe('unknown');
  });
});

describe('createAuthAuditLog', () => {
  let mockDb: any;
  let mockInsertOne: jest.Mock;

  beforeEach(() => {
    // Mock insertOne function
    mockInsertOne = jest.fn().mockResolvedValue({ insertedId: 'mock-id' });

    // Mock MongoDB database
    mockDb = {
      collection: jest.fn(() => ({
        insertOne: mockInsertOne,
      })),
    };
  });

  it('should create audit log for successful sign-in', async () => {
    const { createAuthAuditLog } = require('../audit-logger');

    const result = await createAuthAuditLog(mockDb, {
      action: 'sign_in_success',
      userId: 'user-123',
      email: 'user@example.com',
      orgId: 'org-456',
      provider: 'webex',
      ipAddress: '203.0.113.195',
      userAgent: 'Mozilla/5.0',
    });

    expect(result.success).toBe(true);
    expect(mockDb.collection).toHaveBeenCalledWith('auth_audit_logs');

    const insertCall = mockInsertOne.mock.calls[0][0];
    expect(insertCall.action).toBe('sign_in_success');
    expect(insertCall.userId).toBe('user-123');
    expect(insertCall.email).toBe('user@example.com');
    expect(insertCall.timestamp).toBeInstanceOf(Date);
  });

  it('should create audit log for failed sign-in with reason', async () => {
    const { createAuthAuditLog } = require('../audit-logger');

    const result = await createAuthAuditLog(mockDb, {
      action: 'sign_in_failed',
      email: 'user@example.com',
      reason: 'UnauthorizedOrganization',
      ipAddress: '203.0.113.195',
      userAgent: 'Mozilla/5.0',
    });

    expect(result.success).toBe(true);

    const insertCall = mockInsertOne.mock.calls[0][0];
    expect(insertCall.action).toBe('sign_in_failed');
    expect(insertCall.reason).toBe('UnauthorizedOrganization');
    expect(insertCall.userId).toBeUndefined();
  });

  it('should create audit log for sign-out', async () => {
    const { createAuthAuditLog } = require('../audit-logger');

    const result = await createAuthAuditLog(mockDb, {
      action: 'sign_out',
      userId: 'user-123',
      email: 'user@example.com',
      ipAddress: '203.0.113.195',
      userAgent: 'Mozilla/5.0',
    });

    expect(result.success).toBe(true);

    const insertCall = mockInsertOne.mock.calls[0][0];
    expect(insertCall.action).toBe('sign_out');
  });

  it('should create audit log for token refresh success', async () => {
    const { createAuthAuditLog } = require('../audit-logger');

    const result = await createAuthAuditLog(mockDb, {
      action: 'token_refresh_success',
      userId: 'user-123',
      email: 'user@example.com',
      ipAddress: '203.0.113.195',
      userAgent: 'Mozilla/5.0',
    });

    expect(result.success).toBe(true);

    const insertCall = mockInsertOne.mock.calls[0][0];
    expect(insertCall.action).toBe('token_refresh_success');
  });

  it('should create audit log for token refresh failure', async () => {
    const { createAuthAuditLog } = require('../audit-logger');

    const result = await createAuthAuditLog(mockDb, {
      action: 'token_refresh_failed',
      userId: 'user-123',
      email: 'user@example.com',
      reason: 'InvalidRefreshToken',
      ipAddress: '203.0.113.195',
      userAgent: 'Mozilla/5.0',
    });

    expect(result.success).toBe(true);

    const insertCall = mockInsertOne.mock.calls[0][0];
    expect(insertCall.action).toBe('token_refresh_failed');
    expect(insertCall.reason).toBe('InvalidRefreshToken');
  });

  it('should create audit log for access denied', async () => {
    const { createAuthAuditLog } = require('../audit-logger');

    const result = await createAuthAuditLog(mockDb, {
      action: 'access_denied',
      email: 'external@gmail.com',
      orgId: 'unauthorized-org',
      reason: 'UnauthorizedDomain',
      ipAddress: '203.0.113.195',
      userAgent: 'Mozilla/5.0',
    });

    expect(result.success).toBe(true);

    const insertCall = mockInsertOne.mock.calls[0][0];
    expect(insertCall.action).toBe('access_denied');
    expect(insertCall.reason).toBe('UnauthorizedDomain');
  });

  it('should include metadata if provided', async () => {
    const { createAuthAuditLog } = require('../audit-logger');

    const result = await createAuthAuditLog(mockDb, {
      action: 'sign_in_success',
      userId: 'user-123',
      email: 'user@example.com',
      ipAddress: '203.0.113.195',
      userAgent: 'Mozilla/5.0',
      metadata: {
        callbackUrl: '/dashboard',
        sessionId: 'session-789',
      },
    });

    expect(result.success).toBe(true);

    const insertCall = mockInsertOne.mock.calls[0][0];
    expect(insertCall.metadata).toEqual({
      callbackUrl: '/dashboard',
      sessionId: 'session-789',
    });
  });

  it('should handle database errors gracefully', async () => {
    const errorDb = {
      collection: jest.fn(() => ({
        insertOne: jest.fn().mockRejectedValue(new Error('Database connection failed')),
      })),
    };

    const { createAuthAuditLog } = require('../audit-logger');

    const result = await createAuthAuditLog(errorDb, {
      action: 'sign_in_success',
      userId: 'user-123',
      email: 'user@example.com',
      ipAddress: '203.0.113.195',
      userAgent: 'Mozilla/5.0',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Database connection failed');
  });

  it('should require action field', async () => {
    const { createAuthAuditLog } = require('../audit-logger');

    const result = await createAuthAuditLog(mockDb, {
      userId: 'user-123',
      ipAddress: '203.0.113.195',
      userAgent: 'Mozilla/5.0',
    } as any);

    expect(result.success).toBe(false);
    expect(result.error).toContain('action');
  });

  it('should store timestamp as Date object', async () => {
    const { createAuthAuditLog } = require('../audit-logger');

    await createAuthAuditLog(mockDb, {
      action: 'sign_in_success',
      userId: 'user-123',
      email: 'user@example.com',
      ipAddress: '203.0.113.195',
      userAgent: 'Mozilla/5.0',
    });

    const insertCall = mockInsertOne.mock.calls[0][0];
    expect(insertCall.timestamp).toBeInstanceOf(Date);
  });
});

describe('AuthAction types', () => {
  it('should have all expected action types defined in TypeScript', () => {
    // AuthAction is a TypeScript type, not a runtime value
    // TypeScript will enforce usage at compile time
    // This test just verifies the module compiles
    const auditLogger = require('../audit-logger');
    expect(auditLogger).toBeDefined();
    expect(auditLogger.createAuthAuditLog).toBeDefined();
  });
});

describe('formatAuditLogMessage', () => {
  it('should format sign-in success message', () => {
    const { formatAuditLogMessage } = require('../audit-logger');

    const log: AuthAuditLog = {
      action: 'sign_in_success',
      userId: 'user-123',
      email: 'user@example.com',
      orgId: 'org-456',
      provider: 'webex',
      ipAddress: '203.0.113.195',
      userAgent: 'Mozilla/5.0',
      timestamp: new Date('2025-01-01T12:00:00Z'),
    };

    const message = formatAuditLogMessage(log);

    expect(message).toContain('✅ SIGN-IN SUCCESS');
    expect(message).toContain('user@example.com');
    expect(message).toContain('org-456');
    expect(message).toContain('203.0.113.195');
  });

  it('should format access denied message', () => {
    const { formatAuditLogMessage } = require('../audit-logger');

    const log: AuthAuditLog = {
      action: 'access_denied',
      email: 'external@gmail.com',
      reason: 'UnauthorizedDomain',
      ipAddress: '203.0.113.195',
      userAgent: 'Mozilla/5.0',
      timestamp: new Date('2025-01-01T12:00:00Z'),
    };

    const message = formatAuditLogMessage(log);

    expect(message).toContain('❌ ACCESS DENIED');
    expect(message).toContain('external@gmail.com');
    expect(message).toContain('UnauthorizedDomain');
  });

  it('should format sign-out message', () => {
    const { formatAuditLogMessage } = require('../audit-logger');

    const log: AuthAuditLog = {
      action: 'sign_out',
      userId: 'user-123',
      email: 'user@example.com',
      ipAddress: '203.0.113.195',
      userAgent: 'Mozilla/5.0',
      timestamp: new Date('2025-01-01T12:00:00Z'),
    };

    const message = formatAuditLogMessage(log);

    expect(message).toContain('🚪 SIGN-OUT');
    expect(message).toContain('user@example.com');
  });
});
