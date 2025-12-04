/**
 * Access Control Validation Tests
 *
 * Tests for validateWebexAccess() function that implements dual-layer
 * access control with organization ID and email domain validation.
 *
 * Following TDD: Tests written BEFORE implementation.
 */

import { AccessControlConfig, AccessValidationResult } from '../access-control';

describe('validateWebexAccess', () => {
  describe('Email validation', () => {
    it('should deny access when email is missing', () => {
      const config: AccessControlConfig = {
        allowedOrgIds: [],
        allowedDomains: [],
        mode: 'AND',
      };

      const { validateWebexAccess } = require('../access-control');
      const result: AccessValidationResult = validateWebexAccess(
        undefined,
        undefined,
        config
      );

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('NoEmail');
      expect(result.message).toContain('Email address is required');
    });

    it('should deny access when email is empty string', () => {
      const config: AccessControlConfig = {
        allowedOrgIds: [],
        allowedDomains: [],
        mode: 'AND',
      };

      const { validateWebexAccess } = require('../access-control');
      const result: AccessValidationResult = validateWebexAccess('', undefined, config);

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('NoEmail');
    });
  });

  describe('No access control configured (allow all)', () => {
    it('should allow access when no restrictions are configured', () => {
      const config: AccessControlConfig = {
        allowedOrgIds: [],
        allowedDomains: [],
        mode: 'AND',
      };

      const { validateWebexAccess } = require('../access-control');
      const result: AccessValidationResult = validateWebexAccess(
        'user@example.com',
        'org-123',
        config
      );

      expect(result.allowed).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should allow access even without orgId when no restrictions', () => {
      const config: AccessControlConfig = {
        allowedOrgIds: [],
        allowedDomains: [],
        mode: 'AND',
      };

      const { validateWebexAccess } = require('../access-control');
      const result: AccessValidationResult = validateWebexAccess(
        'user@example.com',
        undefined,
        config
      );

      expect(result.allowed).toBe(true);
    });
  });

  describe('Organization ID validation only', () => {
    it('should allow access when orgId matches whitelist', () => {
      const config: AccessControlConfig = {
        allowedOrgIds: ['org-123', 'org-456'],
        allowedDomains: [],
        mode: 'AND',
      };

      const { validateWebexAccess } = require('../access-control');
      const result: AccessValidationResult = validateWebexAccess(
        'user@example.com',
        'org-123',
        config
      );

      expect(result.allowed).toBe(true);
    });

    it('should deny access when orgId does not match whitelist', () => {
      const config: AccessControlConfig = {
        allowedOrgIds: ['org-123', 'org-456'],
        allowedDomains: [],
        mode: 'AND',
      };

      const { validateWebexAccess } = require('../access-control');
      const result: AccessValidationResult = validateWebexAccess(
        'user@example.com',
        'org-999',
        config
      );

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('UnauthorizedOrganization');
      expect(result.message).toContain('organization');
    });

    it('should deny access when orgId is missing and org validation required', () => {
      const config: AccessControlConfig = {
        allowedOrgIds: ['org-123'],
        allowedDomains: [],
        mode: 'AND',
      };

      const { validateWebexAccess } = require('../access-control');
      const result: AccessValidationResult = validateWebexAccess(
        'user@example.com',
        undefined,
        config
      );

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('UnauthorizedOrganization');
    });
  });

  describe('Email domain validation only', () => {
    it('should allow access when email domain matches whitelist', () => {
      const config: AccessControlConfig = {
        allowedOrgIds: [],
        allowedDomains: ['example.com', 'company.com'],
        mode: 'AND',
      };

      const { validateWebexAccess } = require('../access-control');
      const result: AccessValidationResult = validateWebexAccess(
        'user@example.com',
        undefined,
        config
      );

      expect(result.allowed).toBe(true);
    });

    it('should handle email domain case-insensitively', () => {
      const config: AccessControlConfig = {
        allowedOrgIds: [],
        allowedDomains: ['example.com'], // lowercase
        mode: 'AND',
      };

      const { validateWebexAccess } = require('../access-control');
      const result: AccessValidationResult = validateWebexAccess(
        'user@EXAMPLE.COM', // uppercase
        undefined,
        config
      );

      expect(result.allowed).toBe(true);
    });

    it('should deny access when email domain does not match whitelist', () => {
      const config: AccessControlConfig = {
        allowedOrgIds: [],
        allowedDomains: ['example.com', 'company.com'],
        mode: 'AND',
      };

      const { validateWebexAccess } = require('../access-control');
      const result: AccessValidationResult = validateWebexAccess(
        'user@gmail.com',
        undefined,
        config
      );

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('UnauthorizedDomain');
      expect(result.message).toContain('email domain');
    });

    it('should handle emails with subdomains correctly', () => {
      const config: AccessControlConfig = {
        allowedOrgIds: [],
        allowedDomains: ['company.com'],
        mode: 'AND',
      };

      const { validateWebexAccess } = require('../access-control');

      // Should NOT match subdomain
      const result1 = validateWebexAccess('user@subdomain.company.com', undefined, config);
      expect(result1.allowed).toBe(false);
      expect(result1.reason).toBe('UnauthorizedDomain');
    });
  });

  describe('AND mode - both layers must pass', () => {
    it('should allow access when both orgId and email domain match', () => {
      const config: AccessControlConfig = {
        allowedOrgIds: ['org-123'],
        allowedDomains: ['example.com'],
        mode: 'AND',
      };

      const { validateWebexAccess } = require('../access-control');
      const result: AccessValidationResult = validateWebexAccess(
        'user@example.com',
        'org-123',
        config
      );

      expect(result.allowed).toBe(true);
    });

    it('should deny access when orgId matches but email domain does not', () => {
      const config: AccessControlConfig = {
        allowedOrgIds: ['org-123'],
        allowedDomains: ['example.com'],
        mode: 'AND',
      };

      const { validateWebexAccess } = require('../access-control');
      const result: AccessValidationResult = validateWebexAccess(
        'user@gmail.com',
        'org-123',
        config
      );

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('UnauthorizedDomain');
    });

    it('should deny access when email domain matches but orgId does not', () => {
      const config: AccessControlConfig = {
        allowedOrgIds: ['org-123'],
        allowedDomains: ['example.com'],
        mode: 'AND',
      };

      const { validateWebexAccess } = require('../access-control');
      const result: AccessValidationResult = validateWebexAccess(
        'user@example.com',
        'org-999',
        config
      );

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('UnauthorizedOrganization');
    });

    it('should deny access when neither orgId nor email domain match', () => {
      const config: AccessControlConfig = {
        allowedOrgIds: ['org-123'],
        allowedDomains: ['example.com'],
        mode: 'AND',
      };

      const { validateWebexAccess } = require('../access-control');
      const result: AccessValidationResult = validateWebexAccess(
        'user@gmail.com',
        'org-999',
        config
      );

      expect(result.allowed).toBe(false);
      // Should fail on first check (orgId)
      expect(result.reason).toBe('UnauthorizedOrganization');
    });
  });

  describe('OR mode - either layer can pass', () => {
    it('should allow access when both orgId and email domain match', () => {
      const config: AccessControlConfig = {
        allowedOrgIds: ['org-123'],
        allowedDomains: ['example.com'],
        mode: 'OR',
      };

      const { validateWebexAccess } = require('../access-control');
      const result: AccessValidationResult = validateWebexAccess(
        'user@example.com',
        'org-123',
        config
      );

      expect(result.allowed).toBe(true);
    });

    it('should allow access when only orgId matches', () => {
      const config: AccessControlConfig = {
        allowedOrgIds: ['org-123'],
        allowedDomains: ['example.com'],
        mode: 'OR',
      };

      const { validateWebexAccess } = require('../access-control');
      const result: AccessValidationResult = validateWebexAccess(
        'user@gmail.com',
        'org-123',
        config
      );

      expect(result.allowed).toBe(true);
    });

    it('should allow access when only email domain matches', () => {
      const config: AccessControlConfig = {
        allowedOrgIds: ['org-123'],
        allowedDomains: ['example.com'],
        mode: 'OR',
      };

      const { validateWebexAccess } = require('../access-control');
      const result: AccessValidationResult = validateWebexAccess(
        'user@example.com',
        'org-999',
        config
      );

      expect(result.allowed).toBe(true);
    });

    it('should deny access when neither orgId nor email domain match', () => {
      const config: AccessControlConfig = {
        allowedOrgIds: ['org-123'],
        allowedDomains: ['example.com'],
        mode: 'OR',
      };

      const { validateWebexAccess } = require('../access-control');
      const result: AccessValidationResult = validateWebexAccess(
        'user@gmail.com',
        'org-999',
        config
      );

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('AccessDenied');
      expect(result.message).toContain('not authorized');
    });

    it('should allow access when orgId matches even if email domain check would fail', () => {
      const config: AccessControlConfig = {
        allowedOrgIds: ['org-123'],
        allowedDomains: ['example.com'],
        mode: 'OR',
      };

      const { validateWebexAccess } = require('../access-control');
      const result: AccessValidationResult = validateWebexAccess(
        'contractor@external.com',
        'org-123',
        config
      );

      expect(result.allowed).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle email without @ symbol gracefully', () => {
      const config: AccessControlConfig = {
        allowedOrgIds: [],
        allowedDomains: ['example.com'],
        mode: 'AND',
      };

      const { validateWebexAccess } = require('../access-control');
      const result: AccessValidationResult = validateWebexAccess(
        'invalid-email',
        undefined,
        config
      );

      expect(result.allowed).toBe(false);
    });

    it('should handle email with multiple @ symbols', () => {
      const config: AccessControlConfig = {
        allowedOrgIds: [],
        allowedDomains: ['example.com'],
        mode: 'AND',
      };

      const { validateWebexAccess } = require('../access-control');
      const result: AccessValidationResult = validateWebexAccess(
        'user@@example.com',
        undefined,
        config
      );

      // Should extract domain after last @
      expect(result.allowed).toBe(true);
    });

    it('should trim whitespace from email', () => {
      const config: AccessControlConfig = {
        allowedOrgIds: [],
        allowedDomains: ['example.com'],
        mode: 'AND',
      };

      const { validateWebexAccess } = require('../access-control');
      const result: AccessValidationResult = validateWebexAccess(
        '  user@example.com  ',
        undefined,
        config
      );

      expect(result.allowed).toBe(true);
    });

    it('should handle empty allowedOrgIds array gracefully', () => {
      const config: AccessControlConfig = {
        allowedOrgIds: [],
        allowedDomains: ['example.com'],
        mode: 'AND',
      };

      const { validateWebexAccess } = require('../access-control');
      const result: AccessValidationResult = validateWebexAccess(
        'user@example.com',
        'any-org',
        config
      );

      // Should pass because no org restrictions
      expect(result.allowed).toBe(true);
    });
  });
});

describe('parseAccessControlConfig', () => {
  it('should parse comma-separated organization IDs', () => {
    process.env.ALLOWED_WEBEX_ORG_IDS = 'org-1,org-2,org-3';
    process.env.ALLOWED_EMAIL_DOMAINS = '';
    process.env.ACCESS_CONTROL_MODE = 'AND';

    const { parseAccessControlConfig } = require('../access-control');
    const config = parseAccessControlConfig();

    expect(config.allowedOrgIds).toEqual(['org-1', 'org-2', 'org-3']);
    expect(config.allowedDomains).toEqual([]);
    expect(config.mode).toBe('AND');
  });

  it('should parse comma-separated email domains and lowercase them', () => {
    process.env.ALLOWED_WEBEX_ORG_IDS = '';
    process.env.ALLOWED_EMAIL_DOMAINS = 'Example.com,Company.COM,test.org';
    process.env.ACCESS_CONTROL_MODE = 'OR';

    const { parseAccessControlConfig } = require('../access-control');
    const config = parseAccessControlConfig();

    expect(config.allowedOrgIds).toEqual([]);
    expect(config.allowedDomains).toEqual(['example.com', 'company.com', 'test.org']);
    expect(config.mode).toBe('OR');
  });

  it('should trim whitespace from configuration values', () => {
    process.env.ALLOWED_WEBEX_ORG_IDS = ' org-1 , org-2 , org-3 ';
    process.env.ALLOWED_EMAIL_DOMAINS = ' example.com , company.com ';

    const { parseAccessControlConfig } = require('../access-control');
    const config = parseAccessControlConfig();

    expect(config.allowedOrgIds).toEqual(['org-1', 'org-2', 'org-3']);
    expect(config.allowedDomains).toEqual(['example.com', 'company.com']);
  });

  it('should default to AND mode when ACCESS_CONTROL_MODE not set', () => {
    process.env.ALLOWED_WEBEX_ORG_IDS = 'org-1';
    delete process.env.ACCESS_CONTROL_MODE;

    const { parseAccessControlConfig } = require('../access-control');
    const config = parseAccessControlConfig();

    expect(config.mode).toBe('AND');
  });

  it('should handle empty environment variables', () => {
    delete process.env.ALLOWED_WEBEX_ORG_IDS;
    delete process.env.ALLOWED_EMAIL_DOMAINS;

    const { parseAccessControlConfig } = require('../access-control');
    const config = parseAccessControlConfig();

    expect(config.allowedOrgIds).toEqual([]);
    expect(config.allowedDomains).toEqual([]);
  });

  it('should filter out empty strings from comma-separated values', () => {
    process.env.ALLOWED_WEBEX_ORG_IDS = 'org-1,,org-2,,,org-3';

    const { parseAccessControlConfig } = require('../access-control');
    const config = parseAccessControlConfig();

    expect(config.allowedOrgIds).toEqual(['org-1', 'org-2', 'org-3']);
  });
});
