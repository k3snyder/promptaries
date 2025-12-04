import { ObjectId } from 'mongodb'
import { getDb } from '@/lib/db/mongodb'
import type { Prompt, PromptFilters, PromptFormData } from '@/types/prompt'

/**
 * Get public prompts with filtering and sorting
 */
export async function getPublicPrompts(filters: PromptFilters = {}): Promise<Prompt[]> {
  const db = await getDb()
  const collection = db.collection<Prompt>('prompts')

  const {
    search,
    category,
    tags,
    sort = 'newest',
    limit = 20,
    skip = 0,
  } = filters

  // Build query
  const query: any = { isPublic: true }

  if (category) {
    query.category = category
  }

  if (tags && tags.length > 0) {
    query.tags = { $in: tags }
  }

  if (search) {
    query.$text = { $search: search }
  }

  // Build sort options
  let sortOptions: any = { createdAt: -1 }
  if (sort === 'popular') {
    sortOptions = { forkCount: -1 }
  } else if (sort === 'views') {
    sortOptions = { viewCount: -1 }
  }

  // Add text score for search relevance
  const projection = search
    ? { score: { $meta: 'textScore' } }
    : {}

  if (search) {
    sortOptions = { score: { $meta: 'textScore' }, ...sortOptions }
  }

  return await collection
    .find(query, { projection })
    .sort(sortOptions)
    .skip(skip)
    .limit(limit)
    .toArray()
}

/**
 * Get a single prompt by ID
 */
export async function getPromptById(id: string): Promise<Prompt | null> {
  const db = await getDb()
  const collection = db.collection<Prompt>('prompts')

  const prompt = await collection.findOne({ _id: new ObjectId(id) })

  if (prompt) {
    // Increment view count
    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $inc: { viewCount: 1 } }
    )
  }

  return prompt
}

/**
 * Get prompts created by a user
 */
export async function getUserPrompts(userId: string): Promise<Prompt[]> {
  const db = await getDb()
  const collection = db.collection<Prompt>('prompts')

  return await collection
    .find({ authorId: new ObjectId(userId) })
    .sort({ createdAt: -1 })
    .toArray()
}

/**
 * Get prompts starred by a user
 */
export async function getStarredPrompts(userId: string): Promise<Prompt[]> {
  const db = await getDb()
  const collection = db.collection<Prompt>('prompts')

  return await collection
    .find({ starredBy: new ObjectId(userId) })
    .sort({ createdAt: -1 })
    .toArray()
}

/**
 * Get leaderboard prompts with engagement score
 * Score = (stars * 10) + (forks * 5) + (views * 0.1)
 */
export async function getLeaderboard(filters: {
  timePeriod?: 'all' | 'month' | 'week'
  limit?: number
}): Promise<(Prompt & { score: number })[]> {
  const db = await getDb()
  const collection = db.collection<Prompt>('prompts')

  const { timePeriod = 'all', limit = 50 } = filters

  // Calculate date filter
  let dateFilter: any = {}
  if (timePeriod === 'month') {
    const monthAgo = new Date()
    monthAgo.setMonth(monthAgo.getMonth() - 1)
    dateFilter = { createdAt: { $gte: monthAgo } }
  } else if (timePeriod === 'week') {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    dateFilter = { createdAt: { $gte: weekAgo } }
  }

  // Aggregate with calculated score
  const results = await collection
    .aggregate([
      {
        $match: {
          isPublic: true,
          ...dateFilter,
        },
      },
      {
        $addFields: {
          score: {
            $add: [
              { $multiply: ['$starCount', 10] },
              { $multiply: ['$forkCount', 5] },
              { $multiply: ['$viewCount', 0.1] },
            ],
          },
        },
      },
      {
        $sort: { score: -1 },
      },
      {
        $limit: limit,
      },
    ])
    .toArray()

  return results as (Prompt & { score: number })[]
}

/**
 * Create a new prompt
 */
export async function createPrompt(
  userId: string,
  userName: string,
  data: PromptFormData
): Promise<string> {
  const db = await getDb()
  const collection = db.collection<Prompt>('prompts')

  const result = await collection.insertOne({
    ...data,
    _id: new ObjectId(),
    authorId: new ObjectId(userId),
    authorName: userName,
    parentPromptId: null,
    forkCount: 0,
    viewCount: 0,
    starCount: 0,
    starredBy: [],
    versionNumber: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any)

  return result.insertedId.toString()
}

/**
 * Fork a prompt (create a copy)
 */
export async function forkPrompt(
  promptId: string,
  userId: string,
  userName: string
): Promise<string> {
  const db = await getDb()
  const collection = db.collection<Prompt>('prompts')

  const original = await collection.findOne({ _id: new ObjectId(promptId) })
  if (!original) {
    throw new Error('Prompt not found')
  }

  // Create forked prompt
  const result = await collection.insertOne({
    ...original,
    _id: new ObjectId(),
    authorId: new ObjectId(userId),
    authorName: userName,
    parentPromptId: new ObjectId(promptId),
    isPublic: false,
    forkCount: 0,
    viewCount: 0,
    starCount: 0,
    starredBy: [],
    versionNumber: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any)

  // Increment fork count on original
  await collection.updateOne(
    { _id: new ObjectId(promptId) },
    { $inc: { forkCount: 1 } }
  )

  return result.insertedId.toString()
}

/**
 * Update an existing prompt
 */
export async function updatePrompt(
  promptId: string,
  data: PromptFormData
): Promise<void> {
  const db = await getDb()
  const collection = db.collection<Prompt>('prompts')

  const result = await collection.updateOne(
    { _id: new ObjectId(promptId) },
    {
      $set: {
        ...data,
        updatedAt: new Date(),
      },
    }
  )

  if (result.matchedCount === 0) {
    throw new Error('Prompt not found')
  }
}

/**
 * Delete a prompt
 */
export async function deletePrompt(promptId: string): Promise<void> {
  const db = await getDb()
  const collection = db.collection<Prompt>('prompts')

  const result = await collection.deleteOne({ _id: new ObjectId(promptId) })

  if (result.deletedCount === 0) {
    throw new Error('Prompt not found')
  }
}

/**
 * Toggle star on a prompt
 */
export async function toggleStar(promptId: string, userId: string): Promise<boolean> {
  const db = await getDb()
  const collection = db.collection<Prompt>('prompts')

  const prompt = await collection.findOne({ _id: new ObjectId(promptId) })
  if (!prompt) {
    throw new Error('Prompt not found')
  }

  const userObjectId = new ObjectId(userId)
  const isStarred = prompt.starredBy.some((id) => id.equals(userObjectId))

  if (isStarred) {
    // Unstar
    await collection.updateOne(
      { _id: new ObjectId(promptId) },
      {
        $pull: { starredBy: userObjectId },
        $inc: { starCount: -1 },
      }
    )
    return false
  } else {
    // Star
    await collection.updateOne(
      { _id: new ObjectId(promptId) },
      {
        $push: { starredBy: userObjectId },
        $inc: { starCount: 1 },
      }
    )
    return true
  }
}
