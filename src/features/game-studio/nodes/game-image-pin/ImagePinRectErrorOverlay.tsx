import { StickyNoteOff } from 'lucide-react'

type ImagePinRectErrorOverlayProps = {
  title?: string
  description?: string
}

export function ImagePinRectErrorOverlay({
  title = 'Image failed to load',
  description = 'Try refreshing the image or re-uploading it.',
}: ImagePinRectErrorOverlayProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-destructive/10">
      <div className="flex max-w-[18rem] flex-col items-center gap-3 rounded-md border border-destructive bg-background px-4 py-3 text-center shadow-sm">
        <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <StickyNoteOff
            className="size-6"
            aria-hidden="true"
          />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-destructive">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  )
}
