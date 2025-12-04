'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { CATEGORIES } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Filter } from 'lucide-react'

interface CategoryFilterProps {
  selectedCategory?: string
}

export default function CategoryFilter({ selectedCategory }: CategoryFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleCategoryChange = (category: string | null) => {
    const params = new URLSearchParams(searchParams.toString())

    if (category) {
      params.set('category', category)
    } else {
      params.delete('category')
    }

    router.push(`/?${params.toString()}`)
  }

  return (
    <div className="relative">
      <select
        value={selectedCategory || ''}
        onChange={(e) => handleCategoryChange(e.target.value || null)}
        className="flex h-10 w-full appearance-none rounded-md border border-border bg-background px-10 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <option value="">All Categories</option>
        {CATEGORIES.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
      <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  )
}
