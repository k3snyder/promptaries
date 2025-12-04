/**
 * User Menu Component
 *
 * Displays authenticated user's avatar, name, and dropdown menu with:
 * - User profile information
 * - Navigation links (Library, Settings)
 * - Sign out functionality with optimistic UI
 * - Session error indicator
 * - Loading skeleton
 * - Fallback initials circle
 *
 * Usage:
 * ```tsx
 * <UserMenu />
 * ```
 */

'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { User, Library, Settings, LogOut, AlertCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export function UserMenu() {
  const { data: session, status } = useSession();
  const [isPending, startTransition] = useTransition();

  // Loading state
  if (status === 'loading') {
    return (
      <div className="flex items-center gap-2 animate-pulse">
        <div className="h-8 w-8 rounded-full bg-muted" />
        <div className="h-4 w-20 rounded bg-muted hidden sm:block" />
      </div>
    );
  }

  // Unauthenticated state
  if (status === 'unauthenticated' || !session?.user) {
    return null;
  }

  const user = session.user;
  const hasError = session.error === 'RefreshTokenError';

  // Calculate initials from name
  const getInitials = (name: string | null | undefined): string => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  };

  const initials = getInitials(user.name);

  const handleSignOut = () => {
    startTransition(async () => {
      try {
        await signOut({ callbackUrl: '/login' });
        toast.success('Signed out successfully');
      } catch (error) {
        toast.error('Failed to sign out. Please try again.');
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative flex items-center gap-2 rounded-full"
          aria-haspopup="menu"
        >
          {/* Avatar or Initials */}
          <div className="relative h-8 w-8 rounded-full overflow-hidden bg-primary text-primary-foreground flex items-center justify-center">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name || 'User avatar'}
                width={32}
                height={32}
                className="object-cover"
                unoptimized // Webex avatars from external source
              />
            ) : (
              <span className="text-sm font-medium">{initials}</span>
            )}
            {/* Session Error Indicator */}
            {hasError && (
              <div
                className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-destructive border-2 border-background"
                role="status"
                aria-label="Session error"
              />
            )}
          </div>

          {/* User Name (hidden on mobile) */}
          <span className="hidden sm:inline-block text-sm font-medium">
            {user.name || user.email}
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        {/* User Info Header */}
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.name || 'User'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Session Error Warning */}
        {hasError && (
          <>
            <DropdownMenuItem disabled className="text-destructive">
              <AlertCircle className="mr-2 h-4 w-4" />
              Session expired
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Menu Items */}
        <DropdownMenuItem asChild>
          <Link href="/library" className="cursor-pointer">
            <Library className="mr-2 h-4 w-4" />
            Library
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/settings" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Sign Out */}
        <DropdownMenuItem
          onClick={handleSignOut}
          disabled={isPending}
          className="cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {isPending ? 'Signing out...' : 'Sign Out'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
