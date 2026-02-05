import { useState, useEffect, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import type { StartGameDialogProps } from '../types/game-studio.types'

function getTitleFromData(initialData: StartGameDialogProps['initialData']): string {
  if (!initialData) return ''
  if (typeof initialData.title === 'string' && initialData.title.trim()) return initialData.title
  if (typeof initialData.label === 'string' && initialData.label.trim()) return initialData.label
  return ''
}

function getDescriptionFromData(initialData: StartGameDialogProps['initialData']): string {
  if (!initialData || typeof initialData.description !== 'string') return ''
  return initialData.description
}

export default function StartGameDialog({
  open,
  onOpenChange,
  onSave,
  initialData,
}: StartGameDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const prevOpenRef = useRef(false)

  // Sync from node data only when dialog opens so we show persisted values and don't overwrite edits
  useEffect(() => {
    const justOpened = open && !prevOpenRef.current
    prevOpenRef.current = open

    if (open) {
      if (justOpened && initialData) {
        setTitle(getTitleFromData(initialData))
        setDescription(getDescriptionFromData(initialData))
      }
    } else {
      setTitle('')
      setDescription('')
    }
  }, [open, initialData])

  const handleSave = () => {
    if (!title.trim() || !description.trim()) return
    onSave?.({ title: title.trim(), description: description.trim() })
    onOpenChange(false)
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

        <div className="mt-4 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="start-node-title">Title</Label>
            <Input
              id="start-node-title"
              placeholder="Enter game title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="start-node-description">Description</Label>
            <Textarea
              id="start-node-description"
              placeholder="Enter game description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
        </div>

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
