import { notFound } from 'next/navigation'
import { ObjectId } from 'mongodb'
import { getPromptById } from '@/lib/db/models/prompt'
import PromptForm from '@/components/prompts/prompt-form'

interface EditPromptPageProps {
  params: Promise<{ id: string }>
}

export default async function EditPromptPage({ params }: EditPromptPageProps) {
  const { id } = await params

  // Validate ObjectId format
  if (!ObjectId.isValid(id)) {
    notFound()
  }

  const prompt = await getPromptById(id)

  if (!prompt) {
    notFound()
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold">Edit Prompt</h1>
        <p className="text-muted-foreground">
          Update your prompt details
        </p>
      </div>
      <PromptForm
        promptId={id}
        defaultValues={{
          title: prompt.title,
          description: prompt.description,
          promptContent: prompt.promptContent,
          category: prompt.category,
          tags: prompt.tags,
          outputFormat: prompt.outputFormat,
          isPublic: prompt.isPublic,
        }}
      />
    </div>
  )
}
