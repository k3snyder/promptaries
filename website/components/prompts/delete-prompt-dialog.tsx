'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deletePromptAction } from '@/app/actions/prompt-actions'
import { toast } from 'sonner'

interface DeletePromptDialogProps {
  promptId: string
  promptTitle: string
}

export default function DeletePromptDialog({
  promptId,
  promptTitle,
}: DeletePromptDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deletePromptAction(promptId)

      if (result.success) {
        toast.success('Prompt deleted successfully')
        // Redirect to home page
        window.location.href = '/'
      } else if (result.error) {
        toast.error(result.error)
        setIsDeleting(false)
      }
    } catch (error) {
      toast.error('Failed to delete prompt')
      setIsDeleting(false)
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
      >
        <Trash2 className="h-4 w-4" />
        Delete
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-2 text-xl font-semibold text-foreground">
          Delete Prompt?
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Are you sure you want to delete{' '}
          <span className="font-medium text-foreground">&quot;{promptTitle}&quot;</span>?
          This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>
    </div>
  )
}
