import { getLeaderboard } from '@/lib/db/models/prompt'
import LeaderboardView from '@/components/leaderboard/leaderboard-view'

export const dynamic = 'force-dynamic'

interface LeaderboardPageProps {
  searchParams: Promise<{ period?: string }>
}

export default async function LeaderboardPage({ searchParams }: LeaderboardPageProps) {
  const params = await searchParams
  const timePeriod = (params.period as 'all' | 'month' | 'week') || 'all'

  const leaderboard = await getLeaderboard({ timePeriod, limit: 50 })

  // Serialize prompts for client component
  const serializedLeaderboard = leaderboard.map((prompt) => ({
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
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold">Leaderboard</h1>
        <p className="text-lg text-muted-foreground">
          Top performing prompts ranked by engagement score
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Score = (Stars × 10) + (Forks × 5) + (Views × 0.1)
        </p>
      </div>

      <LeaderboardView prompts={serializedLeaderboard} currentPeriod={timePeriod} />
    </div>
  )
}
