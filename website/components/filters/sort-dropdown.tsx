'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { SORT_OPTIONS } from '@/lib/constants'
import { ArrowUpDown } from 'lucide-react'

interface SortDropdownProps {
  selectedSort?: string
}

export default function SortDropdown({ selectedSort = 'newest' }: SortDropdownProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSortChange = (sort: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', sort)
    router.push(`/?${params.toString()}`)
  }

  const currentLabel =
    SORT_OPTIONS.find((opt) => opt.value === selectedSort)?.label || 'Newest'

  return (
    <div className="relative">
      <select
        value={selectedSort}
        onChange={(e) => handleSortChange(e.target.value)}
        className="flex h-10 w-full appearance-none rounded-md border border-border bg-background px-10 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  )
}
