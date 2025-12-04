import { ObjectId } from 'mongodb'
import type { Category } from '@/lib/constants'

export interface Prompt {
  _id: ObjectId
  title: string
  description: string
  promptContent: string
  category: Category
  tags: string[]
  outputFormat: 'markdown' | 'json'
  authorId: ObjectId
  authorName: string
  isPublic: boolean
  parentPromptId: ObjectId | null
  forkCount: number
  viewCount: number
  starCount: number
  starredBy: ObjectId[]
  versionNumber: number
  createdAt: Date
  updatedAt: Date
}

export interface PromptFormData {
  title: string
  description: string
  promptContent: string
  category: Category
  tags: string[]
  outputFormat: 'markdown' | 'json'
  isPublic: boolean
}

export interface PromptFilters {
  search?: string
  category?: Category
  tags?: string[]
  sort?: 'newest' | 'popular' | 'views'
  limit?: number
  skip?: number
}
