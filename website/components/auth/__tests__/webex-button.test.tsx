/**
 * Webex Button Component Tests
 *
 * Tests for WebexButton component that handles Webex OAuth sign-in
 * with loading states, keyboard shortcuts, and focus management.
 *
 * Following TDD: Tests written BEFORE implementation.
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WebexButton } from '../webex-button';
import { signIn } from 'next-auth/react';

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));

describe('WebexButton Component', () => {
  const mockSignIn = signIn as jest.MockedFunction<typeof signIn>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render sign-in button with Webex text', () => {
      render(<WebexButton />);

      const button = screen.getByRole('button', { name: /sign in with webex/i });
      expect(button).toBeInTheDocument();
    });

    it('should display Webex logo SVG', () => {
      render(<WebexButton />);

      // Check for SVG element
      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Sign-In Functionality', () => {
    it('should call signIn with webex provider when clicked', async () => {
      const user = userEvent.setup();
      render(<WebexButton />);

      const button = screen.getByRole('button', { name: /sign in with webex/i });
      await user.click(button);

      expect(mockSignIn).toHaveBeenCalledWith('webex', {
        redirect: true,
        callbackUrl: '/',
      });
    });

    it('should preserve callbackUrl from props', async () => {
      const user = userEvent.setup();
      render(<WebexButton callbackUrl="/library" />);

      const button = screen.getByRole('button', { name: /sign in with webex/i });
      await user.click(button);

      expect(mockSignIn).toHaveBeenCalledWith('webex', {
        redirect: true,
        callbackUrl: '/library',
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner when isLoading is true', () => {
      render(<WebexButton />);

      const button = screen.getByRole('button', { name: /sign in with webex/i });

      // Click to trigger loading
      userEvent.click(button);

      // Button should be disabled during loading
      waitFor(() => {
        expect(button).toBeDisabled();
      });
    });

    it('should have aria-busy attribute when loading', async () => {
      const user = userEvent.setup();
      render(<WebexButton />);

      const button = screen.getByRole('button', { name: /sign in with webex/i });
      await user.click(button);

      await waitFor(() => {
        expect(button).toHaveAttribute('aria-busy', 'true');
      });
    });

    it('should display loader icon when loading', async () => {
      const user = userEvent.setup();
      render(<WebexButton />);

      const button = screen.getByRole('button', { name: /sign in with webex/i });
      await user.click(button);

      await waitFor(() => {
        const loader = document.querySelector('.animate-spin');
        expect(loader).toBeInTheDocument();
      });
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should trigger sign-in on Cmd+K (Mac)', async () => {
      render(<WebexButton />);

      // Simulate Cmd+K
      const event = new KeyboardEvent('keydown', {
        key: 'k',
        metaKey: true,
        bubbles: true,
      });
      document.dispatchEvent(event);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('webex', {
          redirect: true,
          callbackUrl: '/',
        });
      });
    });

    it('should trigger sign-in on Ctrl+K (Windows/Linux)', async () => {
      render(<WebexButton />);

      // Simulate Ctrl+K
      const event = new KeyboardEvent('keydown', {
        key: 'k',
        ctrlKey: true,
        bubbles: true,
      });
      document.dispatchEvent(event);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('webex', {
          redirect: true,
          callbackUrl: '/',
        });
      });
    });

    it('should not trigger on K without modifier key', () => {
      render(<WebexButton />);

      // Simulate plain K key
      const event = new KeyboardEvent('keydown', {
        key: 'k',
        bubbles: true,
      });
      document.dispatchEvent(event);

      expect(mockSignIn).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible name', () => {
      render(<WebexButton />);

      const button = screen.getByRole('button', { name: /sign in with webex/i });
      expect(button).toBeInTheDocument();
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      render(<WebexButton />);

      const button = screen.getByRole('button', { name: /sign in with webex/i });

      // Tab to button
      await user.tab();
      expect(button).toHaveFocus();

      // Press Enter to activate
      await user.keyboard('{Enter}');
      expect(mockSignIn).toHaveBeenCalled();
    });
  });

  describe('Focus Management', () => {
    it('should blur button before redirect', async () => {
      const user = userEvent.setup();
      render(<WebexButton />);

      const button = screen.getByRole('button', { name: /sign in with webex/i });

      // Focus and click button
      button.focus();
      expect(button).toHaveFocus();

      await user.click(button);

      // Button should be blurred during redirect
      await waitFor(() => {
        expect(button).not.toHaveFocus();
      });
    });
  });
});
