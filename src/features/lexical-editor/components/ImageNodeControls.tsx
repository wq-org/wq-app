import { Loader2, Repeat } from 'lucide-react'
import type { ChangeEvent, RefObject } from 'react'

import { Button } from '@/components/ui/button'
import { ALLOWED_IMAGE_TYPES } from '@/components/shared/upload-files/types/upload.types'
import { cn } from '@/lib/utils'

const controlButtonClassName =
  'rounded-full text-white mix-blend-difference hover:bg-transparent hover:text-white'

const controlIconClassName = 'size-4 text-white mix-blend-difference'

export type ImageNodeControlsProps = {
  replaceImageInputRef: RefObject<HTMLInputElement | null>
  onReplaceInputChange: (event: ChangeEvent<HTMLInputElement>) => void
  isUploading: boolean
  replaceAriaLabel: string
  uploadingAriaLabel: string
  isSelected?: boolean
}

export function ImageNodeControls({
  replaceImageInputRef,
  onReplaceInputChange,
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
      <input
        ref={replaceImageInputRef}
        type="file"
        accept={ALLOWED_IMAGE_TYPES.join(',')}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={onReplaceInputChange}
      />
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
          onClick={() => replaceImageInputRef.current?.click()}
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
