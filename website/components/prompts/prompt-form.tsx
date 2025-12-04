'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { promptSchema, PromptFormData } from '@/lib/validations/prompt'
import { createPromptAction, updatePromptAction } from '@/app/actions/prompt-actions'
import { CATEGORIES } from '@/lib/constants'
import { toast } from 'sonner'

interface PromptFormProps {
  promptId?: string
  defaultValues?: PromptFormData
}

export default function PromptForm({ promptId, defaultValues }: PromptFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const isEditMode = !!promptId

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<PromptFormData>({
    resolver: zodResolver(promptSchema),
    defaultValues: defaultValues || {
      title: '',
      description: '',
      promptContent: '',
      category: 'MetaPrompting',
      tags: [],
      outputFormat: 'markdown',
      isPublic: true,
    },
  })

  const tags = watch('tags')
  const promptContent = watch('promptContent')

  const addTag = () => {
    const trimmedTag = tagInput.trim()
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 10) {
      setValue('tags', [...tags, trimmedTag])
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setValue(
      'tags',
      tags.filter((tag) => tag !== tagToRemove)
    )
  }

  const onSubmit = async (data: PromptFormData) => {
    setIsSubmitting(true)
    try {
      if (isEditMode && promptId) {
        // Update existing prompt
        const result = await updatePromptAction(promptId, data)

        if (result.success) {
          toast.success('Prompt updated successfully!')
          // Redirect back to the prompt detail page
          window.location.href = `/prompts/${promptId}`
        } else if (result.error) {
          toast.error(result.error)
          setIsSubmitting(false)
        }
      } else {
        // Create new prompt
        const result = await createPromptAction(data)

        if (result.success && result.promptId) {
          toast.success('Prompt created successfully!')
          // Redirect to the new prompt page
          window.location.href = `/prompts/${result.promptId}`
        } else if (result.error) {
          toast.error(result.error)
          setIsSubmitting(false)
        }
      }
    } catch (error) {
      toast.error(isEditMode ? 'Failed to update prompt' : 'Failed to create prompt')
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Title */}
      <div>
        <Label htmlFor="title">
          Title <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          {...register('title')}
          placeholder="e.g., Expert Code Reviewer"
          className="mt-1.5"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">
          Description <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Brief description of what this prompt does and when to use it"
          className="mt-1.5"
          rows={3}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-500">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Category */}
      <div>
        <Label htmlFor="category">
          Category <span className="text-red-500">*</span>
        </Label>
        <select
          id="category"
          {...register('category')}
          className="mt-1.5 w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="mt-1 text-sm text-red-500">{errors.category.message}</p>
        )}
      </div>

      {/* Output Format */}
      <div>
        <Label htmlFor="outputFormat">
          Output Format <span className="text-red-500">*</span>
        </Label>
        <select
          id="outputFormat"
          {...register('outputFormat')}
          className="mt-1.5 w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          <option value="markdown">Markdown</option>
          <option value="json">JSON</option>
        </select>
        {errors.outputFormat && (
          <p className="mt-1 text-sm text-red-500">{errors.outputFormat.message}</p>
        )}
      </div>

      {/* Tags */}
      <div>
        <Label htmlFor="tags">
          Tags <span className="text-red-500">*</span>
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            ({tags.length}/10)
          </span>
        </Label>
        <div className="mt-1.5 flex gap-2">
          <Input
            id="tags"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addTag()
              }
            }}
            placeholder="Add a tag (press Enter)"
            disabled={tags.length >= 10}
          />
          <Button
            type="button"
            onClick={addTag}
            variant="outline"
            disabled={tags.length >= 10 || !tagInput.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-sm text-primary"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-primary-dark"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        {errors.tags && (
          <p className="mt-1 text-sm text-red-500">{errors.tags.message}</p>
        )}
      </div>

      {/* Prompt Content */}
      <div>
        <Label htmlFor="promptContent">
          Prompt Content <span className="text-red-500">*</span>
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            ({promptContent?.length || 0}/10,000)
          </span>
        </Label>
        <Textarea
          id="promptContent"
          {...register('promptContent')}
          placeholder="Enter your prompt content here..."
          className="prompt-content mt-1.5"
          rows={15}
        />
        {errors.promptContent && (
          <p className="mt-1 text-sm text-red-500">
            {errors.promptContent.message}
          </p>
        )}
      </div>

      {/* Public/Private Toggle */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isPublic"
          {...register('isPublic')}
          className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
        />
        <Label htmlFor="isPublic" className="cursor-pointer">
          Make this prompt public (visible to all users)
        </Label>
      </div>

      {/* Submit Button */}
      <div className="flex gap-3 border-t border-border pt-6">
        <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
          {isSubmitting
            ? isEditMode
              ? 'Updating...'
              : 'Creating...'
            : isEditMode
              ? 'Update Prompt'
              : 'Create Prompt'}
        </Button>
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
