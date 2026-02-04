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
import { Separator } from '@/components/ui/separator'
import { HoldToDeleteButton } from '@/components/ui/HoldToDeleteButton'
import type { EndGameDialogProps } from '../types/game-studio.types'

interface EndGameDialogPropsWithDelete extends EndGameDialogProps {
  onDelete?: () => void
}

function getTitleFromData(initialData: EndGameDialogProps['initialData']): string {
  if (!initialData) return ''
  if (typeof initialData.title === 'string' && initialData.title.trim()) return initialData.title
  if (typeof initialData.label === 'string' && initialData.label.trim()) return initialData.label
  return ''
}

function getDescriptionFromData(initialData: EndGameDialogProps['initialData']): string {
  if (!initialData || typeof initialData.description !== 'string') return ''
  return initialData.description
}

export default function EndGameDialog({
  open,
  onOpenChange,
  onSave,
  initialData,
  onDelete,
}: EndGameDialogPropsWithDelete) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const prevOpenRef = useRef(false)

  // Sync from node data only when dialog opens (open: false -> true) so we show persisted values and don't overwrite in-progress edits
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

        <div className="mt-4 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="end-node-title">Title</Label>
            <Input
              id="end-node-title"
              placeholder="Enter node title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="end-node-description">Description</Label>
            <Textarea
              id="end-node-description"
              placeholder="Enter node description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <Separator />

          {onDelete && (
            <div>
              <p className="text-muted-foreground text-sm mb-3">
                Hold the button below for 3 seconds to delete this node.
              </p>
              <HoldToDeleteButton
                onDelete={handleDelete}
                holdDuration={3000}
              />
            </div>
          )}
        </div>

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
