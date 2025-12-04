'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Category } from '@/lib/constants'
import { formatDistanceToNow } from 'date-fns'
import { Copy, Star, GitFork, Eye, ExternalLink, Check, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LLM_PLATFORMS } from '@/lib/constants'
import { toast } from 'sonner'
import DeletePromptDialog from './delete-prompt-dialog'

// Serialized version of Prompt for Client Component
interface SerializedPrompt {
  _id: string
  title: string
  description: string
  promptContent: string
  category: Category
  tags: string[]
  outputFormat: 'markdown' | 'json'
  authorId: string
  authorName: string
  isPublic: boolean
  parentPromptId: string | null
  forkCount: number
  viewCount: number
  starCount: number
  starredBy: string[]
  versionNumber: number
  createdAt: string
  updatedAt: string
}

interface PromptDetailViewProps {
  prompt: SerializedPrompt
}

export default function PromptDetailView({ prompt }: PromptDetailViewProps) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(prompt.promptContent)
      setCopied(true)
      toast.success('Copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error('Failed to copy')
    }
  }

  const openInPlatform = (platformUrl: string) => {
    // Copy to clipboard first
    navigator.clipboard.writeText(prompt.promptContent)
    toast.success('Copied! Opening platform...')

    // Open platform in new tab
    window.open(platformUrl, '_blank')
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Back button and Actions */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to prompts
        </Link>
        <div className="flex gap-2">
          <Link href={`/prompts/${prompt._id}/edit`}>
            <Button variant="outline" className="gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </Link>
          <DeletePromptDialog promptId={prompt._id} promptTitle={prompt.title} />
        </div>
      </div>

      {/* Header */}
      <div className="mb-6">
        <div className="mb-3 flex items-start justify-between gap-4">
          <h1 className="text-3xl font-bold text-foreground">{prompt.title}</h1>
          <span className="inline-flex shrink-0 items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            {prompt.category}
          </span>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span>By {prompt.authorName}</span>
          <span>•</span>
          <span>{formatDistanceToNow(new Date(prompt.createdAt), { addSuffix: true })}</span>
          <span>•</span>
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

        {/* Tags */}
        {prompt.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {prompt.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Description */}
      {prompt.description && (
        <div className="mb-6">
          <h2 className="mb-2 text-lg font-semibold">Description</h2>
          <p className="text-muted-foreground">{prompt.description}</p>
        </div>
      )}

      {/* Prompt Content */}
      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Prompt</h2>
          <Button
            onClick={copyToClipboard}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy
              </>
            )}
          </Button>
        </div>
        <div className="rounded-lg border border-border bg-muted/30 p-6">
          <pre className="prompt-content overflow-x-auto whitespace-pre-wrap font-mono text-sm leading-relaxed text-foreground">
            {prompt.promptContent}
          </pre>
        </div>
      </div>

      {/* Copy & Go Actions */}
      <div className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Copy & Go</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {LLM_PLATFORMS.map((platform) => (
            <Button
              key={platform.id}
              onClick={() => openInPlatform(platform.url)}
              className="gap-2"
              variant="outline"
            >
              <ExternalLink className="h-4 w-4" />
              Open in {platform.name}
            </Button>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Click to copy the prompt and open your preferred AI platform
        </p>
      </div>

      {/* Engagement Actions */}
      <div className="flex gap-3 border-t border-border pt-6">
        <Button variant="outline" className="gap-2">
          <Star className="h-4 w-4" />
          Star ({prompt.starCount})
        </Button>
        <Button variant="outline" className="gap-2">
          <GitFork className="h-4 w-4" />
          Fork ({prompt.forkCount})
        </Button>
      </div>
    </div>
  )
}
