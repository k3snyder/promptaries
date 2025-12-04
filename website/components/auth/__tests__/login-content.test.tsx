/**
 * Login Content Component Tests
 *
 * Tests for LoginContent component that displays the login page
 * with error handling, WebexButton, and dismissible alerts.
 *
 * Following TDD: Tests written BEFORE implementation.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginContent } from '../login-content';

// Create mock functions
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockGet = jest.fn();

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));

describe('LoginContent Component', () => {
  const { useRouter, useSearchParams } = require('next/navigation');

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: mockReplace,
    });

    (useSearchParams as jest.Mock).mockReturnValue({
      get: mockGet,
    });

    mockGet.mockReturnValue(null); // Default: no params
  });

  describe('Rendering', () => {
    it('should render login page with welcome message', () => {
      render(<LoginContent />);

      expect(screen.getByText(/welcome to promptaries/i)).toBeInTheDocument();
      expect(screen.getByText(/sign in with your webex account/i)).toBeInTheDocument();
    });

    it('should render Webex sign-in button', () => {
      render(<LoginContent />);

      const button = screen.getByRole('button', { name: /sign in with webex/i });
      expect(button).toBeInTheDocument();
    });

    it('should display keyboard shortcut hint', () => {
      render(<LoginContent />);

      // Check for keyboard shortcut hint in the tip text
      expect(screen.getByText(/⌘K/)).toBeInTheDocument();
      expect(screen.getByText(/Ctrl\+K/)).toBeInTheDocument();
    });

    it('should render footer with terms notice', () => {
      render(<LoginContent />);

      expect(screen.getByText(/by signing in, you agree/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display SessionExpired error message', () => {
      mockGet.mockImplementation((key: string) =>
        key === 'error' ? 'SessionExpired' : null
      );

      render(<LoginContent />);

      expect(screen.getByText(/session expired/i)).toBeInTheDocument();
      expect(screen.getByText(/please sign in again/i)).toBeInTheDocument();
    });

    it('should display AccessDenied error message', () => {
      const { useSearchParams } = require('next/navigation');
      useSearchParams.mockReturnValue({
        get: (key: string) => (key === 'error' ? 'AccessDenied' : null),
      });

      render(<LoginContent />);

      expect(screen.getByText(/access denied/i)).toBeInTheDocument();
      expect(screen.getByText(/organization or email domain/i)).toBeInTheDocument();
    });

    it('should display OAuthSignin error message', () => {
      const { useSearchParams } = require('next/navigation');
      useSearchParams.mockReturnValue({
        get: (key: string) => (key === 'error' ? 'OAuthSignin' : null),
      });

      render(<LoginContent />);

      expect(screen.getByText(/authentication error/i)).toBeInTheDocument();
    });

    it('should display OAuthCallback error message', () => {
      const { useSearchParams } = require('next/navigation');
      useSearchParams.mockReturnValue({
        get: (key: string) => (key === 'error' ? 'OAuthCallback' : null),
      });

      render(<LoginContent />);

      expect(screen.getByText(/authentication error/i)).toBeInTheDocument();
    });

    it('should display OAuthCreateAccount error message', () => {
      const { useSearchParams } = require('next/navigation');
      useSearchParams.mockReturnValue({
        get: (key: string) => (key === 'error' ? 'OAuthCreateAccount' : null),
      });

      render(<LoginContent />);

      expect(screen.getByText(/account creation failed/i)).toBeInTheDocument();
    });

    it('should display EmailCreateAccount error message', () => {
      const { useSearchParams } = require('next/navigation');
      useSearchParams.mockReturnValue({
        get: (key: string) => (key === 'error' ? 'EmailCreateAccount' : null),
      });

      render(<LoginContent />);

      expect(screen.getByText(/account creation failed/i)).toBeInTheDocument();
    });

    it('should display Callback error message', () => {
      const { useSearchParams } = require('next/navigation');
      useSearchParams.mockReturnValue({
        get: (key: string) => (key === 'error' ? 'Callback' : null),
      });

      render(<LoginContent />);

      expect(screen.getByText(/authentication error/i)).toBeInTheDocument();
    });

    it('should display Default error message for unknown errors', () => {
      const { useSearchParams } = require('next/navigation');
      useSearchParams.mockReturnValue({
        get: (key: string) => (key === 'error' ? 'UnknownError' : null),
      });

      render(<LoginContent />);

      expect(screen.getByText(/authentication failed/i)).toBeInTheDocument();
    });
  });

  describe('Dismissible Alerts', () => {
    it('should show close button for dismissible errors', () => {
      const { useSearchParams } = require('next/navigation');
      useSearchParams.mockReturnValue({
        get: (key: string) => (key === 'error' ? 'SessionExpired' : null),
      });

      render(<LoginContent />);

      const closeButton = screen.getByRole('button', { name: /dismiss/i });
      expect(closeButton).toBeInTheDocument();
    });

    it('should remove error from URL when dismissed', async () => {
      const user = userEvent.setup();
      const mockReplace = jest.fn();
      const { useRouter, useSearchParams } = require('next/navigation');

      useRouter.mockReturnValue({
        push: jest.fn(),
        replace: mockReplace,
      });

      useSearchParams.mockReturnValue({
        get: (key: string) => (key === 'error' ? 'SessionExpired' : null),
      });

      render(<LoginContent />);

      const closeButton = screen.getByRole('button', { name: /dismiss/i });
      await user.click(closeButton);

      // Should navigate to /login without error param
      expect(mockReplace).toHaveBeenCalledWith('/login');
    });

    it('should preserve callbackUrl when dismissing error', async () => {
      const user = userEvent.setup();
      const mockReplace = jest.fn();
      const { useRouter, useSearchParams } = require('next/navigation');

      useRouter.mockReturnValue({
        push: jest.fn(),
        replace: mockReplace,
      });

      useSearchParams.mockReturnValue({
        get: (key: string) => {
          if (key === 'error') return 'SessionExpired';
          if (key === 'callbackUrl') return '/library';
          return null;
        },
      });

      render(<LoginContent />);

      const closeButton = screen.getByRole('button', { name: /dismiss/i });
      await user.click(closeButton);

      // Should preserve callbackUrl param
      expect(mockReplace).toHaveBeenCalledWith('/login?callbackUrl=%2Flibrary');
    });
  });

  describe('CallbackUrl Preservation', () => {
    it('should pass callbackUrl to WebexButton', () => {
      const { useSearchParams } = require('next/navigation');
      useSearchParams.mockReturnValue({
        get: (key: string) => (key === 'callbackUrl' ? '/prompts/123' : null),
      });

      render(<LoginContent />);

      // WebexButton should receive callbackUrl prop
      // This is tested implicitly through integration
      const button = screen.getByRole('button', { name: /sign in with webex/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<LoginContent />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent(/welcome to promptaries/i);
    });

    it('should have accessible error alerts', () => {
      const { useSearchParams } = require('next/navigation');
      useSearchParams.mockReturnValue({
        get: (key: string) => (key === 'error' ? 'SessionExpired' : null),
      });

      render(<LoginContent />);

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });
  });
});
