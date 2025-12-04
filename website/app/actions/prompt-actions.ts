'use server'

import { ObjectId } from 'mongodb'
import { revalidatePath } from 'next/cache'
import { createPrompt, updatePrompt, deletePrompt } from '@/lib/db/models/prompt'
import { promptSchema, PromptFormData } from '@/lib/validations/prompt'

export async function createPromptAction(formData: PromptFormData) {
  try {
    // Validate input
    const validatedData = promptSchema.parse(formData)

    // Create prompt in database
    // For now, using a mock author ID until we have authentication
    const mockUserId = new ObjectId().toString()
    const mockUserName = 'Anonymous User'

    const promptId = await createPrompt(
      mockUserId, // TODO: Replace with actual user ID from session
      mockUserName, // TODO: Replace with actual user name from session
      validatedData
    )

    revalidatePath('/')
    // Return success with the new prompt ID
    return { success: true, promptId }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to create prompt' }
  }
}

export async function updatePromptAction(promptId: string, formData: PromptFormData) {
  try {
    // Validate input
    const validatedData = promptSchema.parse(formData)

    // Update prompt in database
    await updatePrompt(promptId, validatedData)

    revalidatePath('/')
    revalidatePath(`/prompts/${promptId}`)
    // Return success
    return { success: true }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to update prompt' }
  }
}

export async function deletePromptAction(promptId: string) {
  try {
    // Delete prompt from database
    await deletePrompt(promptId)

    revalidatePath('/')
    // Return success
    return { success: true }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to delete prompt' }
  }
}
