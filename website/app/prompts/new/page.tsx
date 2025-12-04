import PromptForm from '@/components/prompts/prompt-form'

export default function NewPromptPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold">Create New Prompt</h1>
        <p className="text-muted-foreground">
          Share a reusable AI prompt with your team
        </p>
      </div>
      <PromptForm />
    </div>
  )
}
