import type { FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FieldInput } from '@/components/ui/field-input'
import { Text } from '@/components/ui/text'

export type AddYouTubeLinksDialogProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  url: string
  onUrlChange: (url: string) => void
  error: string | null
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onCancel: () => void
}

export function AddYouTubeLinksDialog({
  isOpen,
  onOpenChange,
  url,
  onUrlChange,
  error,
  onSubmit,
  onCancel,
}: AddYouTubeLinksDialogProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={onOpenChange}
    >
      <DialogContent
        showCloseButton
        className="rounded-4xl"
      >
        <DialogHeader>
          <DialogTitle>Add YouTube video</DialogTitle>
          <DialogDescription>
            Paste a YouTube video URL to embed it in your lesson.
          </DialogDescription>
        </DialogHeader>

        <form
          id="youtube-video-form"
          onSubmit={onSubmit}
          className="grid gap-4"
        >
          <FieldInput
            label="YouTube URL"
            placeholder="https://www.youtube.com/watch?v=..."
            value={url}
            onValueChange={onUrlChange}
            type="url"
            inputMode="url"
            autoComplete="url"
            required
          />

          {error ? (
            <Text
              variant="small"
              className="text-destructive"
              role="alert"
            >
              {error}
            </Text>
          ) : null}
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="youtube-video-form"
          >
            Add video
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
