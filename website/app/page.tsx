import { Suspense } from 'react'
import SearchBar from '@/components/filters/search-bar'
import CategoryFilter from '@/components/filters/category-filter'
import SortDropdown from '@/components/filters/sort-dropdown'
import PromptGrid from '@/components/prompts/prompt-grid'

// Mark as dynamic since we use searchParams
export const dynamic = 'force-dynamic'

interface SearchParams {
  q?: string
  category?: string
  sort?: string
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-4xl font-bold">Browse Prompts</h1>
        <p className="text-lg text-muted-foreground">
          Discover and copy AI prompts to use in ChatGPT, Claude, or Circuit
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1 md:max-w-md">
          <SearchBar defaultValue={params.q} />
        </div>
        <div className="flex gap-4">
          <CategoryFilter selectedCategory={params.category} />
          <SortDropdown selectedSort={params.sort} />
        </div>
      </div>

      {/* Prompt Grid */}
      <Suspense fallback={<PromptGridSkeleton />}>
        <PromptGrid
          search={params.q}
          category={params.category}
          sort={params.sort}
        />
      </Suspense>
    </div>
  )
}

function PromptGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-lg border border-border bg-white p-6">
          <div className="mb-3">
            <div className="mb-2 h-6 w-3/4 rounded bg-muted" />
            <div className="flex gap-4">
              <div className="h-4 w-12 rounded bg-muted" />
              <div className="h-4 w-12 rounded bg-muted" />
              <div className="h-4 w-12 rounded bg-muted" />
            </div>
          </div>
          <div className="mb-4 space-y-2">
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-5/6 rounded bg-muted" />
          </div>
          <div className="flex justify-between">
            <div className="h-6 w-20 rounded-full bg-muted" />
            <div className="h-4 w-32 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}
