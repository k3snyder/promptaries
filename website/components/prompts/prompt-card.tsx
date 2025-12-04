import Link from 'next/link'
import { Star, GitFork, Eye } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { Prompt } from '@/types/prompt'
import type { Category } from '@/lib/constants'

// Serialized version for client components
type SerializedPrompt = Omit<Prompt, '_id' | 'authorId' | 'parentPromptId' | 'starredBy' | 'createdAt' | 'updatedAt'> & {
  _id: string
  authorId: string
  parentPromptId: string | null
  starredBy: string[]
  createdAt: string
  updatedAt: string
}
import { cn } from '@/lib/utils/cn'

interface PromptCardProps {
  prompt: Prompt | SerializedPrompt
  className?: string
}

export default function PromptCard({ prompt, className }: PromptCardProps) {
  return (
    <Link
      href={`/prompts/${typeof prompt._id === 'string' ? prompt._id : prompt._id.toString()}`}
      className={cn(
        'group block rounded-lg border border-border bg-white p-6 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg',
        className
      )}
    >
      {/* Header */}
      <div className="mb-3">
        <h3 className="mb-2 line-clamp-2 text-xl font-semibold text-foreground group-hover:text-primary">
          {prompt.title}
        </h3>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Star className="h-4 w-4" />
            {prompt.starCount}
          </span>
          <span className="flex items-center gap-1">
            <GitFork className="h-4 w-4" />
            {prompt.forkCount}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {prompt.viewCount}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">
        {prompt.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        {/* Category */}
        <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          {prompt.category}
        </span>

        {/* Author & Date */}
        <div className="text-xs text-muted-foreground">
          <span className="font-medium">{prompt.authorName}</span>
          {' • '}
          <span>{formatDistanceToNow(new Date(prompt.createdAt), { addSuffix: true })}</span>
        </div>
      </div>

      {/* Tags */}
      {prompt.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {prompt.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground"
            >
              {tag}
            </span>
          ))}
          {prompt.tags.length > 3 && (
            <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
              +{prompt.tags.length - 3} more
            </span>
          )}
        </div>
      )}
    </Link>
  )
}
