import { notFound } from 'next/navigation'
import { ObjectId } from 'mongodb'
import { getPromptById } from '@/lib/db/models/prompt'
import PromptDetailView from '@/components/prompts/prompt-detail-view'

interface PromptPageProps {
  params: Promise<{ id: string }>
}

export default async function PromptPage({ params }: PromptPageProps) {
  const { id } = await params

  // Validate ObjectId format
  if (!ObjectId.isValid(id)) {
    notFound()
  }

  const prompt = await getPromptById(id)

  if (!prompt) {
    notFound()
  }

  // Serialize ObjectIds to strings for Client Component
  const serializedPrompt = {
    ...prompt,
    _id: prompt._id.toString(),
    authorId: prompt.authorId.toString(),
    parentPromptId: prompt.parentPromptId?.toString() || null,
    starredBy: prompt.starredBy.map((id) => id.toString()),
    createdAt: prompt.createdAt.toISOString(),
    updatedAt: prompt.updatedAt.toISOString(),
  }

  return <PromptDetailView prompt={serializedPrompt} />
}
