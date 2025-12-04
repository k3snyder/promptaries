'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Trophy, Star, GitFork, Eye, Medal, Award } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Category } from '@/lib/constants'

interface LeaderboardPrompt {
  _id: string
  title: string
  description: string
  promptContent: string
  category: Category
  tags: string[]
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
  score: number
}

interface LeaderboardViewProps {
  prompts: LeaderboardPrompt[]
  currentPeriod: 'all' | 'month' | 'week'
}

export default function LeaderboardView({ prompts, currentPeriod }: LeaderboardViewProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const periods = [
    { value: 'all', label: 'All Time' },
    { value: 'month', label: 'This Month' },
    { value: 'week', label: 'This Week' },
  ]

  const handlePeriodChange = (period: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (period === 'all') {
      params.delete('period')
    } else {
      params.set('period', period)
    }
    router.push(`/leaderboard?${params.toString()}`)
  }

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-6 w-6 text-yellow-500" />
    if (index === 1) return <Medal className="h-6 w-6 text-gray-400" />
    if (index === 2) return <Award className="h-6 w-6 text-amber-600" />
    return <span className="text-lg font-semibold text-muted-foreground">#{index + 1}</span>
  }

  return (
    <div>
      {/* Period Filter */}
      <div className="mb-6 flex gap-2">
        {periods.map((period) => (
          <button
            key={period.value}
            onClick={() => handlePeriodChange(period.value)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              currentPeriod === period.value
                ? 'bg-primary text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {period.label}
          </button>
        ))}
      </div>

      {/* Leaderboard Table */}
      <div className="overflow-hidden rounded-lg border border-border bg-white">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                Rank
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                Prompt
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                Author
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">
                <Star className="mx-auto h-4 w-4" />
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">
                <GitFork className="mx-auto h-4 w-4" />
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">
                <Eye className="mx-auto h-4 w-4" />
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">
                Score
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {prompts.map((prompt, index) => (
              <tr
                key={prompt._id}
                className={`transition-colors hover:bg-muted/30 ${
                  index < 3 ? 'bg-primary/5' : ''
                }`}
              >
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center w-12">
                    {getRankIcon(index)}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <Link
                    href={`/prompts/${prompt._id}`}
                    className="group"
                  >
                    <div className="font-medium text-foreground group-hover:text-primary">
                      {prompt.title}
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {prompt.category}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(prompt.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-4 text-sm text-muted-foreground">
                  {prompt.authorName}
                </td>
                <td className="px-4 py-4 text-center text-sm text-muted-foreground">
                  {prompt.starCount}
                </td>
                <td className="px-4 py-4 text-center text-sm text-muted-foreground">
                  {prompt.forkCount}
                </td>
                <td className="px-4 py-4 text-center text-sm text-muted-foreground">
                  {prompt.viewCount}
                </td>
                <td className="px-4 py-4 text-right">
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                    {Math.round(prompt.score)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {prompts.length === 0 && (
          <div className="py-12 text-center">
            <Trophy className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              No prompts yet
            </h3>
            <p className="text-sm text-muted-foreground">
              Be the first to create a prompt and top the leaderboard!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
