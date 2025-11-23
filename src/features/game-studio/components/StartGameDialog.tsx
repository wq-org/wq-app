import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { StartGameDialogProps } from '../types/game-studio.types'
import GameNodeLayout from './GameNodeLayout'

export default function StartGameDialog({
  open,
  onOpenChange,
  onSave,
  nodeId,
}: StartGameDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [rounds, setRounds] = useState('')

  const handleSave = () => {
    if (title.trim() && description.trim() && rounds.trim()) {
      onSave?.({ title, description, rounds })
      handleCancel()
    }
  }

  const handleCancel = () => {
    setTitle('')
    setDescription('')
    setRounds('')
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto !w-[90vw] !max-w-[1080px] [&_button[data-slot='dialog-close']]:text-blue-500 [&_button[data-slot='dialog-close']]:hover:text-blue-600">
        <DialogHeader>
          <DialogTitle>Configure Start Node</DialogTitle>
          <DialogDescription className="sr-only">
            Configure the start node with title, description, and number of rounds
          </DialogDescription>
        </DialogHeader>
        <GameNodeLayout
          nodeId={nodeId}
          overviewContent={
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="description">Description</Label>
                  <span className="text-xs text-muted-foreground">{description.length}/1000</span>
                </div>
                <Textarea
                  id="description"
                  placeholder="Describe how the game is going to work"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={1000}
                  rows={4}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="rounds">Rounds</Label>
                <Input
                  id="rounds"
                  type="number"
                  placeholder="Enter number of rounds"
                  value={rounds}
                  onChange={(e) => setRounds(e.target.value)}
                />
              </div>
            </div>
          }
        />
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!title.trim() || !description.trim() || !rounds.trim()}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
