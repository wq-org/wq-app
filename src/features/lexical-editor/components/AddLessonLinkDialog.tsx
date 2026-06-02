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

export type AddLessonLinkDialogProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  url: string
  onUrlChange: (url: string) => void
  error: string | null
  isEditMode: boolean
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onCancel: () => void
}

export function AddLessonLinkDialog({
  isOpen,
  onOpenChange,
  url,
  onUrlChange,
  error,
  isEditMode,
  onSubmit,
  onCancel,
}: AddLessonLinkDialogProps) {
  const title = isEditMode ? 'Edit link' : 'Add link'
  const description = isEditMode
    ? 'Update the URL for the selected link.'
    : 'Paste a web address to turn the selected text into a link.'

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
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form
          id="lesson-link-form"
          onSubmit={onSubmit}
          className="grid gap-4"
        >
          <FieldInput
            label="Link URL"
            placeholder="https://example.com"
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
            form="lesson-link-form"
          >
            {isEditMode ? 'Save link' : 'Add link'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
