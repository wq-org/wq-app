import { ImageOff } from 'lucide-react'

import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

export type ImageNodeFrameVariant = 'loading' | 'error'

export type ImageNodeFrameProps = {
  variant: ImageNodeFrameVariant
  maxWidth?: number
  /** Shown below the icon when `variant` is `error`. */
  message?: string
  ariaLabel: string
  className?: string
}

const frameClassName = cn(
  'ImageNode__frame my-2 flex h-32 w-full flex-col items-center justify-center gap-2',
  'rounded-2xl border border-dashed border-border bg-muted/40 px-4 text-center',
)

export function ImageNodeFrame({
  variant,
  maxWidth = 720,
  message,
  ariaLabel,
  className,
}: ImageNodeFrameProps) {
  const isLoading = variant === 'loading'

  return (
    <div
      role={isLoading ? 'status' : 'alert'}
      aria-live="polite"
      aria-label={ariaLabel}
      className={cn(frameClassName, className)}
      style={{ maxWidth }}
    >
      {isLoading ? (
        <Spinner size="md" />
      ) : (
        <>
          <ImageOff
            className="size-6 shrink-0 text-muted-foreground"
            aria-hidden
          />
          {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
        </>
      )}
    </div>
  )
}
