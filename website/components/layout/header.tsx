'use client';

import Link from 'next/link'
import { Library, Home, Trophy, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserMenu } from './user-menu'

export default function Header() {
  return (
    <header className="border-b border-border bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-auto items-center justify-center rounded-lg bg-primary px-2 text-white">
            <span className="text-lg font-bold tracking-tight">CPO</span>
          </div>
          <span className="text-xl font-bold text-foreground">Prompt Library</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <Home className="h-4 w-4" />
            Browse
          </Link>
          <Link
            href="/leaderboard"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <Trophy className="h-4 w-4" />
            Leaderboard
          </Link>
          <Link
            href="/library"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <Library className="h-4 w-4" />
            My Library
          </Link>
          <Link href="/prompts/new">
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              New Prompt
            </Button>
          </Link>

          {/* User Menu */}
          <UserMenu />
        </nav>
      </div>
    </header>
  )
}
