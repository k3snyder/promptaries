import PromptCard from './prompt-card'
import { getPublicPrompts } from '@/lib/db/models/prompt'
import type { PromptFilters } from '@/types/prompt'

interface PromptGridProps {
  search?: string
  category?: string
  sort?: string
}

export default async function PromptGrid({ search, category, sort }: PromptGridProps) {
  const filters: PromptFilters = {
    search,
    category: category as any,
    sort: (sort as any) || 'newest',
    limit: 20,
  }

  const prompts = await getPublicPrompts(filters)

  if (prompts.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">No prompts found</p>
          <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {prompts.map((prompt) => (
        <PromptCard key={prompt._id.toString()} prompt={prompt} />
      ))}
    </div>
  )
}
