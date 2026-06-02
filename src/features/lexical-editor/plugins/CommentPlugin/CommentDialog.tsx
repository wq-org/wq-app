import { useEffect, useState, type ChangeEvent } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

type CommentDialogProps = {
  open: boolean
  quote: string
  onCancel: () => void
  onSubmit: (body: string) => void
}

export function CommentDialog({ open, quote, onCancel, onSubmit }: CommentDialogProps) {
  const [body, setBody] = useState('')

  useEffect(() => {
    if (open) {
      setBody('')
    }
  }, [open])

  const trimmedBody = body.trim()
  const isSubmitDisabled = trimmedBody.length === 0

  const handleOpenChange = (next: boolean) => {
    if (!next) onCancel()
  }

  const handleBodyChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setBody(event.target.value)
  }

  const handleSubmit = () => {
    if (isSubmitDisabled) return
    onSubmit(trimmedBody)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add comment</DialogTitle>
          <DialogDescription>Leave a note for the selected text.</DialogDescription>
        </DialogHeader>
        {quote ? (
          <p className="rounded-md border bg-muted/40 px-3 py-2 text-sm italic text-muted-foreground">
            “{quote}”
          </p>
        ) : null}
        <Textarea
          autoFocus
          value={body}
          onChange={handleBodyChange}
          placeholder="Write a comment…"
          rows={4}
          aria-label="Comment body"
        />
        <DialogFooter>
          <Button
            variant="ghost"
            type="button"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
