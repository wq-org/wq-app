import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { StartGameDialogProps } from '../types/game-studio.types'
import GameNodeLayout from './GameNodeLayout'

export default function StartGameDialog({
  open,
  onOpenChange,
  onSave,
  nodeId,
  initialData,
}: StartGameDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  // Sync from initialData only when dialog opens, so parent re-renders don't overwrite user input
  useEffect(() => {
    if (!open) return
    const d = initialData as { title?: string; description?: string; label?: string } | undefined
    setTitle(d?.title ?? d?.label ?? '')
    setDescription(d?.description ?? '')
  }, [open, initialData])

  const handleSave = () => {
    if (title.trim() && description.trim()) {
      onSave?.({ title, description })
      handleCancel()
    }
  }

  const handleCancel = () => {
    setTitle('')
    setDescription('')
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto w-[90vw]! max-w-[1080px]! [&_button[data-slot='dialog-close']]:text-blue-500 [&_button[data-slot='dialog-close']]:hover:text-blue-600">
        <DialogHeader>
          <DialogTitle>Configure Start Node</DialogTitle>
          <DialogDescription className="sr-only">
            Configure the start node with title and description
          </DialogDescription>
        </DialogHeader>
        <GameNodeLayout nodeId={nodeId} />
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!title.trim() || !description.trim()}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
