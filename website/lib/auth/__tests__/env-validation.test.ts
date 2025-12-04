/**
 * Environment Validation Tests
 *
 * Tests for validateAuthEnv() function that validates required
 * environment variables for NextAuth.js + Webex OAuth integration.
 *
 * Following TDD: Tests written BEFORE implementation.
 */

describe('validateAuthEnv', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('Required variables validation', () => {
    it('should pass validation when all required variables are present', () => {
      // Arrange: Set all required environment variables
      process.env.AUTH_SECRET = 'test-secret-key-at-least-32-characters-long';
      process.env.NEXTAUTH_URL = 'http://localhost:3000';
      process.env.AUTH_WEBEX_ID = 'test-webex-client-id';
      process.env.AUTH_WEBEX_SECRET = 'test-webex-client-secret';
      process.env.MONGODB_URI = 'mongodb://localhost:27017/test';

      // Act & Assert: Should not throw
      const { validateAuthEnv } = require('../env-validation');
      expect(() => validateAuthEnv()).not.toThrow();
    });

    it('should throw error when AUTH_SECRET is missing', () => {
      // Arrange: Set all except AUTH_SECRET
      delete process.env.AUTH_SECRET;
      process.env.NEXTAUTH_URL = 'http://localhost:3000';
      process.env.AUTH_WEBEX_ID = 'test-webex-client-id';
      process.env.AUTH_WEBEX_SECRET = 'test-webex-client-secret';
      process.env.MONGODB_URI = 'mongodb://localhost:27017/test';

      // Act & Assert
      const { validateAuthEnv } = require('../env-validation');
      expect(() => validateAuthEnv()).toThrow(/AUTH_SECRET/);
      expect(() => validateAuthEnv()).toThrow(/Missing required environment variables/);
    });

    it('should throw error when NEXTAUTH_URL is missing', () => {
      // Arrange
      process.env.AUTH_SECRET = 'test-secret-key-at-least-32-characters-long';
      delete process.env.NEXTAUTH_URL;
      process.env.AUTH_WEBEX_ID = 'test-webex-client-id';
      process.env.AUTH_WEBEX_SECRET = 'test-webex-client-secret';
      process.env.MONGODB_URI = 'mongodb://localhost:27017/test';

      // Act & Assert
      const { validateAuthEnv } = require('../env-validation');
      expect(() => validateAuthEnv()).toThrow(/NEXTAUTH_URL/);
      expect(() => validateAuthEnv()).toThrow(/Missing required environment variables/);
    });

    it('should throw error when AUTH_WEBEX_ID is missing', () => {
      // Arrange
      process.env.AUTH_SECRET = 'test-secret-key-at-least-32-characters-long';
      process.env.NEXTAUTH_URL = 'http://localhost:3000';
      delete process.env.AUTH_WEBEX_ID;
      process.env.AUTH_WEBEX_SECRET = 'test-webex-client-secret';
      process.env.MONGODB_URI = 'mongodb://localhost:27017/test';

      // Act & Assert
      const { validateAuthEnv } = require('../env-validation');
      expect(() => validateAuthEnv()).toThrow(/AUTH_WEBEX_ID/);
      expect(() => validateAuthEnv()).toThrow(/Missing required environment variables/);
    });

    it('should throw error when AUTH_WEBEX_SECRET is missing', () => {
      // Arrange
      process.env.AUTH_SECRET = 'test-secret-key-at-least-32-characters-long';
      process.env.NEXTAUTH_URL = 'http://localhost:3000';
      process.env.AUTH_WEBEX_ID = 'test-webex-client-id';
      delete process.env.AUTH_WEBEX_SECRET;
      process.env.MONGODB_URI = 'mongodb://localhost:27017/test';

      // Act & Assert
      const { validateAuthEnv } = require('../env-validation');
      expect(() => validateAuthEnv()).toThrow(/AUTH_WEBEX_SECRET/);
      expect(() => validateAuthEnv()).toThrow(/Missing required environment variables/);
    });

    it('should throw error when MONGODB_URI is missing', () => {
      // Arrange
      process.env.AUTH_SECRET = 'test-secret-key-at-least-32-characters-long';
      process.env.NEXTAUTH_URL = 'http://localhost:3000';
      process.env.AUTH_WEBEX_ID = 'test-webex-client-id';
      process.env.AUTH_WEBEX_SECRET = 'test-webex-client-secret';
      delete process.env.MONGODB_URI;

      // Act & Assert
      const { validateAuthEnv } = require('../env-validation');
      expect(() => validateAuthEnv()).toThrow(/MONGODB_URI/);
      expect(() => validateAuthEnv()).toThrow(/Missing required environment variables/);
    });

    it('should list all missing variables in error message', () => {
      // Arrange: Remove multiple required variables
      delete process.env.AUTH_SECRET;
      delete process.env.AUTH_WEBEX_ID;
      delete process.env.MONGODB_URI;
      process.env.NEXTAUTH_URL = 'http://localhost:3000';
      process.env.AUTH_WEBEX_SECRET = 'test-webex-client-secret';

      // Act & Assert
      const { validateAuthEnv } = require('../env-validation');
      expect(() => validateAuthEnv()).toThrow(/AUTH_SECRET/);
      expect(() => validateAuthEnv()).toThrow(/AUTH_WEBEX_ID/);
      expect(() => validateAuthEnv()).toThrow(/MONGODB_URI/);
    });
  });

  describe('Optional access control validation', () => {
    it('should warn when no access control is configured', () => {
      // Arrange: Set required vars but no access control
      process.env.AUTH_SECRET = 'test-secret-key-at-least-32-characters-long';
      process.env.NEXTAUTH_URL = 'http://localhost:3000';
      process.env.AUTH_WEBEX_ID = 'test-webex-client-id';
      process.env.AUTH_WEBEX_SECRET = 'test-webex-client-secret';
      process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
      delete process.env.ALLOWED_WEBEX_ORG_IDS;
      delete process.env.ALLOWED_EMAIL_DOMAINS;

      // Mock console.warn
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Act
      const { validateAuthEnv } = require('../env-validation');
      validateAuthEnv();

      // Assert
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('No access control configured')
      );

      consoleWarnSpy.mockRestore();
    });

    it('should not warn when ALLOWED_WEBEX_ORG_IDS is set', () => {
      // Arrange
      process.env.AUTH_SECRET = 'test-secret-key-at-least-32-characters-long';
      process.env.NEXTAUTH_URL = 'http://localhost:3000';
      process.env.AUTH_WEBEX_ID = 'test-webex-client-id';
      process.env.AUTH_WEBEX_SECRET = 'test-webex-client-secret';
      process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
      process.env.ALLOWED_WEBEX_ORG_IDS = 'org1,org2';
      delete process.env.ALLOWED_EMAIL_DOMAINS;

      // Mock console.warn
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Act
      const { validateAuthEnv } = require('../env-validation');
      validateAuthEnv();

      // Assert
      expect(consoleWarnSpy).not.toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });

    it('should not warn when ALLOWED_EMAIL_DOMAINS is set', () => {
      // Arrange
      process.env.AUTH_SECRET = 'test-secret-key-at-least-32-characters-long';
      process.env.NEXTAUTH_URL = 'http://localhost:3000';
      process.env.AUTH_WEBEX_ID = 'test-webex-client-id';
      process.env.AUTH_WEBEX_SECRET = 'test-webex-client-secret';
      process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
      delete process.env.ALLOWED_WEBEX_ORG_IDS;
      process.env.ALLOWED_EMAIL_DOMAINS = 'example.com,test.com';

      // Mock console.warn
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Act
      const { validateAuthEnv } = require('../env-validation');
      validateAuthEnv();

      // Assert
      expect(consoleWarnSpy).not.toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });
  });

  describe('Environment variable format validation', () => {
    it('should validate AUTH_SECRET has minimum length', () => {
      // Arrange: AUTH_SECRET too short (less than 32 chars recommended)
      process.env.AUTH_SECRET = 'short';
      process.env.NEXTAUTH_URL = 'http://localhost:3000';
      process.env.AUTH_WEBEX_ID = 'test-webex-client-id';
      process.env.AUTH_WEBEX_SECRET = 'test-webex-client-secret';
      process.env.MONGODB_URI = 'mongodb://localhost:27017/test';

      // Mock console.warn for weak secret warning
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Act
      const { validateAuthEnv } = require('../env-validation');
      validateAuthEnv();

      // Assert: Should warn about weak secret
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('AUTH_SECRET should be at least 32 characters')
      );

      consoleWarnSpy.mockRestore();
    });

    it('should validate NEXTAUTH_URL format', () => {
      // Arrange: Invalid URL format
      process.env.AUTH_SECRET = 'test-secret-key-at-least-32-characters-long';
      process.env.NEXTAUTH_URL = 'not-a-valid-url';
      process.env.AUTH_WEBEX_ID = 'test-webex-client-id';
      process.env.AUTH_WEBEX_SECRET = 'test-webex-client-secret';
      process.env.MONGODB_URI = 'mongodb://localhost:27017/test';

      // Act & Assert
      const { validateAuthEnv } = require('../env-validation');
      expect(() => validateAuthEnv()).toThrow(/NEXTAUTH_URL must be a valid URL/);
    });

    it('should validate MONGODB_URI format', () => {
      // Arrange: Invalid MongoDB URI
      process.env.AUTH_SECRET = 'test-secret-key-at-least-32-characters-long';
      process.env.NEXTAUTH_URL = 'http://localhost:3000';
      process.env.AUTH_WEBEX_ID = 'test-webex-client-id';
      process.env.AUTH_WEBEX_SECRET = 'test-webex-client-secret';
      process.env.MONGODB_URI = 'invalid-mongodb-uri';

      // Act & Assert
      const { validateAuthEnv } = require('../env-validation');
      expect(() => validateAuthEnv()).toThrow(/MONGODB_URI must start with mongodb/);
    });
  });
});
