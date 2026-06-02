import { Loader2, Repeat } from 'lucide-react'
import type { MouseEvent } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const controlButtonClassName =
  'rounded-full text-white mix-blend-difference hover:bg-transparent hover:text-white'

const controlIconClassName = 'size-4 text-white mix-blend-difference'

export type ImageNodeControlsProps = {
  onReplaceClick: (event: MouseEvent<HTMLButtonElement>) => void
  isUploading: boolean
  replaceAriaLabel: string
  uploadingAriaLabel: string
  isSelected?: boolean
}

export function ImageNodeControls({
  onReplaceClick,
  isUploading,
  replaceAriaLabel,
  uploadingAriaLabel,
  isSelected = false,
}: ImageNodeControlsProps) {
  return (
    <div
      className={cn(
        'absolute top-2 right-2 z-10 flex items-center gap-1 mix-blend-difference',
        'opacity-0 transition-opacity duration-150 group-hover/image:opacity-100',
        isSelected && 'opacity-100',
      )}
    >
      {isUploading ? (
        <span
          role="status"
          aria-label={uploadingAriaLabel}
          className={cn(controlButtonClassName, 'flex size-9 items-center justify-center')}
        >
          <Loader2
            className={cn(controlIconClassName, 'animate-spin')}
            aria-hidden
          />
        </span>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onMouseDown={(event) => event.preventDefault()}
          onClick={onReplaceClick}
          className={controlButtonClassName}
          aria-label={replaceAriaLabel}
        >
          <Repeat
            className={controlIconClassName}
            aria-hidden
          />
        </Button>
      )}
    </div>
  )
}
