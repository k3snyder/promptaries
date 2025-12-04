/**
 * User Menu Component Tests
 *
 * Tests for UserMenu component that displays user avatar, name,
 * and dropdown menu with sign-out functionality.
 *
 * Following TDD: Tests written BEFORE implementation.
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserMenu } from '../user-menu';
import { signOut } from 'next-auth/react';
import { toast } from 'sonner';

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  signOut: jest.fn(),
}));

// Mock sonner
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('UserMenu Component', () => {
  const { useSession } = require('next-auth/react');
  const mockSignOut = signOut as jest.MockedFunction<typeof signOut>;
  const mockToast = toast as jest.Mocked<typeof toast>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should display loading skeleton when session is loading', () => {
      useSession.mockReturnValue({
        data: null,
        status: 'loading',
      });

      render(<UserMenu />);

      // Check for skeleton elements
      const skeleton = document.querySelector('.animate-pulse');
      expect(skeleton).toBeInTheDocument();
    });
  });

  describe('Unauthenticated State', () => {
    it('should return null when user is not authenticated', () => {
      useSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });

      const { container } = render(<UserMenu />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Authenticated State', () => {
    const mockSession = {
      user: {
        id: 'user-123',
        name: 'John Doe',
        email: 'john.doe@example.com',
        image: 'https://example.com/avatar.jpg',
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    it('should display user avatar', () => {
      useSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated',
      });

      render(<UserMenu />);

      const avatar = screen.getByAltText('John Doe');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute('src');
    });

    it('should display user name', () => {
      useSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated',
      });

      render(<UserMenu />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should display fallback initials when avatar is missing', () => {
      useSession.mockReturnValue({
        data: {
          ...mockSession,
          user: { ...mockSession.user, image: null },
        },
        status: 'authenticated',
      });

      render(<UserMenu />);

      // Check for initials circle
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should calculate correct initials from name', () => {
      useSession.mockReturnValue({
        data: {
          ...mockSession,
          user: { ...mockSession.user, name: 'Alice Bob Charlie', image: null },
        },
        status: 'authenticated',
      });

      render(<UserMenu />);

      // Should use first two initials
      expect(screen.getByText('AB')).toBeInTheDocument();
    });
  });

  describe('Dropdown Menu', () => {
    const mockSession = {
      user: {
        id: 'user-123',
        name: 'John Doe',
        email: 'john.doe@example.com',
        image: 'https://example.com/avatar.jpg',
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    it('should open dropdown menu on trigger click', async () => {
      const user = userEvent.setup();
      useSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated',
      });

      render(<UserMenu />);

      const trigger = screen.getByRole('button', { name: /john doe/i });
      await user.click(trigger);

      // Menu items should be visible
      await waitFor(() => {
        expect(screen.getByText('Library')).toBeInTheDocument();
        expect(screen.getByText('Settings')).toBeInTheDocument();
        expect(screen.getByText('Sign Out')).toBeInTheDocument();
      });
    });

    it('should display user email in dropdown menu', async () => {
      const user = userEvent.setup();
      useSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated',
      });

      render(<UserMenu />);

      const trigger = screen.getByRole('button', { name: /john doe/i });
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
      });
    });
  });

  describe('Sign Out Functionality', () => {
    const mockSession = {
      user: {
        id: 'user-123',
        name: 'John Doe',
        email: 'john.doe@example.com',
        image: 'https://example.com/avatar.jpg',
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    it('should call signOut when Sign Out is clicked', async () => {
      const user = userEvent.setup();
      useSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated',
      });
      mockSignOut.mockResolvedValue(undefined as any);

      render(<UserMenu />);

      // Open dropdown
      const trigger = screen.getByRole('button', { name: /john doe/i });
      await user.click(trigger);

      // Click Sign Out
      const signOutButton = await screen.findByText('Sign Out');
      await user.click(signOutButton);

      expect(mockSignOut).toHaveBeenCalledWith({ callbackUrl: '/login' });
    });

    it('should show success toast on successful sign out', async () => {
      const user = userEvent.setup();
      useSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated',
      });
      mockSignOut.mockResolvedValue(undefined as any);

      render(<UserMenu />);

      // Open dropdown
      const trigger = screen.getByRole('button', { name: /john doe/i });
      await user.click(trigger);

      // Click Sign Out
      const signOutButton = await screen.findByText('Sign Out');
      await user.click(signOutButton);

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith(
          'Signed out successfully'
        );
      });
    });

    it('should show error toast on sign out failure', async () => {
      const user = userEvent.setup();
      useSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated',
      });
      mockSignOut.mockRejectedValue(new Error('Sign out failed'));

      render(<UserMenu />);

      // Open dropdown
      const trigger = screen.getByRole('button', { name: /john doe/i });
      await user.click(trigger);

      // Click Sign Out
      const signOutButton = await screen.findByText('Sign Out');
      await user.click(signOutButton);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          'Failed to sign out. Please try again.'
        );
      });
    });

    it('should use optimistic UI with useTransition', async () => {
      const user = userEvent.setup();
      useSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated',
      });

      // Make signOut take some time
      mockSignOut.mockImplementation(
        () =>
          new Promise((resolve) => setTimeout(() => resolve(undefined as any), 100))
      );

      render(<UserMenu />);

      // Open dropdown
      const trigger = screen.getByRole('button', { name: /john doe/i });
      await user.click(trigger);

      // Click Sign Out
      const signOutButton = await screen.findByText('Sign Out');
      await user.click(signOutButton);

      // Button should show pending state
      await waitFor(() => {
        expect(signOutButton).toHaveTextContent('Signing out...');
      });
    });
  });

  describe('Session Error State', () => {
    it('should display error indicator when session has RefreshTokenError', () => {
      useSession.mockReturnValue({
        data: {
          user: {
            id: 'user-123',
            name: 'John Doe',
            email: 'john.doe@example.com',
          },
          error: 'RefreshTokenError',
          expires: new Date(Date.now() + 1000).toISOString(),
        },
        status: 'authenticated',
      });

      render(<UserMenu />);

      // Check for error visual indicator (e.g., red border or badge)
      const errorIndicator = screen.getByRole('status');
      expect(errorIndicator).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    const mockSession = {
      user: {
        id: 'user-123',
        name: 'John Doe',
        email: 'john.doe@example.com',
        image: 'https://example.com/avatar.jpg',
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    it('should navigate through menu items with arrow keys', async () => {
      const user = userEvent.setup();
      useSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated',
      });

      render(<UserMenu />);

      // Open dropdown with Enter key
      const trigger = screen.getByRole('button', { name: /john doe/i });
      trigger.focus();
      await user.keyboard('{Enter}');

      // Menu should be open
      await waitFor(() => {
        expect(screen.getByText('Library')).toBeInTheDocument();
      });

      // Arrow down to navigate
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');

      // Should be able to activate with Enter
      await user.keyboard('{Enter}');
    });

    it('should close menu with Escape key', async () => {
      const user = userEvent.setup();
      useSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated',
      });

      render(<UserMenu />);

      // Open dropdown
      const trigger = screen.getByRole('button', { name: /john doe/i });
      await user.click(trigger);

      // Menu is open
      await waitFor(() => {
        expect(screen.getByText('Library')).toBeInTheDocument();
      });

      // Press Escape
      await user.keyboard('{Escape}');

      // Menu should close
      await waitFor(() => {
        expect(screen.queryByText('Library')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    const mockSession = {
      user: {
        id: 'user-123',
        name: 'John Doe',
        email: 'john.doe@example.com',
        image: 'https://example.com/avatar.jpg',
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    it('should have accessible button with aria-label', () => {
      useSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated',
      });

      render(<UserMenu />);

      const trigger = screen.getByRole('button', { name: /john doe/i });
      expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    });

    it('should have alt text for avatar image', () => {
      useSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated',
      });

      render(<UserMenu />);

      const avatar = screen.getByAltText('John Doe');
      expect(avatar).toBeInTheDocument();
    });
  });
});
