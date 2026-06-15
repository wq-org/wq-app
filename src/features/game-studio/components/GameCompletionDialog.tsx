'use client'

import { useState, type ReactNode } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Rating } from '@/components/ui/rating'
import { cn } from '@/lib/utils'

export type GameCompletionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  /** Optional leading icon rendered above the title. */
  icon?: ReactNode
  /** Primary action label (caller passes a translated string). */
  submitLabel: string
  /**
   * Students may rate the run: when provided the stars are interactive and the
   * value is persisted on submit. Teachers/preview omit this, so the stars are
   * hidden and submit just exits.
   */
  onSubmitRating?: (rating: number) => Promise<void>
  /** Toast copy shown to students on persist success / failure. */
  ratingSuccessMessage?: string
  ratingErrorMessage?: string
  /** Fires after submit (or skip) resolves; the caller returns to the previous view. */
  onExit: () => void
  className?: string
}

/**
 * End-of-game dialog: icon + title + description, an optional star rating, and a
 * single submit action. Rating is never required — submitting with no stars just
 * exits. `accent-isolate` keeps the accent picker from tinting the dialog.
 */
export function GameCompletionDialog({
  open,
  onOpenChange,
  title,
  description,
  icon,
  submitLabel,
  onSubmitRating,
  ratingSuccessMessage,
  ratingErrorMessage,
  onExit,
  className,
}: GameCompletionDialogProps) {
  const [rating, setRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const canRate = Boolean(onSubmitRating)

  const handleSubmit = async () => {
    // Rating is optional: 0 stars means "skip" — just exit without persisting.
    if (canRate && rating > 0 && onSubmitRating) {
      setIsSubmitting(true)
      try {
        await onSubmitRating(rating)
        if (ratingSuccessMessage) toast.success(ratingSuccessMessage)
      } catch {
        if (ratingErrorMessage) toast.error(ratingErrorMessage)
      } finally {
        setIsSubmitting(false)
      }
    }

    onExit()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className={cn('accent-isolate rounded-2xl sm:max-w-md', className)}>
        <DialogHeader className="items-center text-center sm:text-center">
          {icon ? (
            <div className="mb-2 flex size-12 items-center justify-center rounded-2xl bg-muted text-foreground">
              {icon}
            </div>
          ) : null}
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>

        {canRate ? (
          <div className="flex justify-center py-2">
            <Rating
              rating={rating}
              onRatingChange={setRating}
              editable
              size="lg"
              maxRating={5}
            />
          </div>
        ) : null}

        <DialogFooter className="sm:justify-center">
          <Button
            type="button"
            variant="darkblue"
            disabled={isSubmitting}
            onClick={handleSubmit}
          >
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
