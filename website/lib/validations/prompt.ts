import { z } from 'zod'
import { CATEGORIES } from '@/lib/constants'

export const promptSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters'),
  promptContent: z
    .string()
    .min(20, 'Prompt content must be at least 20 characters')
    .max(10000, 'Prompt content must be less than 10,000 characters'),
  category: z.enum(CATEGORIES, {
    errorMap: () => ({ message: 'Please select a valid category' }),
  }),
  tags: z
    .array(z.string().min(2).max(30))
    .min(1, 'Add at least one tag')
    .max(10, 'Maximum 10 tags allowed'),
  outputFormat: z.enum(['markdown', 'json'], {
    errorMap: () => ({ message: 'Please select an output format' }),
  }),
  isPublic: z.boolean().default(true),
})

export type PromptFormData = z.infer<typeof promptSchema>
