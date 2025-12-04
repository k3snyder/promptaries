import Link from 'next/link'
import { Plus } from 'lucide-react'
import { ObjectId } from 'mongodb'
import { Button } from '@/components/ui/button'
import { getUserPrompts, getStarredPrompts } from '@/lib/db/models/prompt'
import LibraryTabs from '@/components/library/library-tabs'

export default async function LibraryPage() {
  // TODO: Get actual user ID from session
  // For now, we'll get all prompts by Anonymous User
  const mockUserId = new ObjectId().toString()

  const myPrompts = await getUserPrompts(mockUserId)
  const starredPrompts = await getStarredPrompts(mockUserId)

  // Serialize prompts for client component
  const serializedMyPrompts = myPrompts.map((prompt) => ({
    ...prompt,
    _id: prompt._id.toString(),
    authorId: prompt.authorId.toString(),
    parentPromptId: prompt.parentPromptId?.toString() || null,
    starredBy: prompt.starredBy.map((id) => id.toString()),
    createdAt: prompt.createdAt.toISOString(),
    updatedAt: prompt.updatedAt.toISOString(),
  }))

  const serializedStarredPrompts = starredPrompts.map((prompt) => ({
    ...prompt,
    _id: prompt._id.toString(),
    authorId: prompt.authorId.toString(),
    parentPromptId: prompt.parentPromptId?.toString() || null,
    starredBy: prompt.starredBy.map((id) => id.toString()),
    createdAt: prompt.createdAt.toISOString(),
    updatedAt: prompt.updatedAt.toISOString(),
  }))

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-4xl font-bold">My Library</h1>
          <p className="text-lg text-muted-foreground">
            Manage your prompts and starred favorites
          </p>
        </div>
        <Link href="/prompts/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Prompt
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <LibraryTabs
        myPrompts={serializedMyPrompts}
        starredPrompts={serializedStarredPrompts}
      />
    </div>
  )
}
