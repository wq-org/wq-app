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
import type { EndGameDialogProps } from '../types/game-studio.types'
import GameNodeLayout from './GameNodeLayout'

interface EndGameDialogPropsWithDelete extends EndGameDialogProps {
  onDelete?: () => void
}

export default function EndGameDialog({
  open,
  onOpenChange,
  onSave,
  initialData,
  nodeId,
  onDelete,
}: EndGameDialogPropsWithDelete) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '')
      setDescription(initialData.description || '')
    }
  }, [initialData, open])

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

  const handleDelete = () => {
    onDelete?.()
    handleCancel()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto w-[90vw]! max-w-[1080px]!">
        <DialogHeader>
          <DialogTitle>Configure End Node</DialogTitle>
          <DialogDescription className="sr-only">
            Configure the end node with title and description
          </DialogDescription>
        </DialogHeader>
        <GameNodeLayout
          nodeId={nodeId}
          onDelete={onDelete ? handleDelete : undefined}
        />
        <DialogFooter className="flex items-center border-t border-gray-200 pt-4 gap-2 justify-end">
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
