import { useEffect, useState } from 'react'
import { ChevronsRightLeft, Maximize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { cn } from '@/lib/utils'

type ChatImageProps = {
  src: string
  alt: string
  ratio?: number
  className?: string
  centered?: boolean
}

export function ChatImage({
  src,
  alt,
  ratio = 4 / 3,
  className,
  centered = false,
}: ChatImageProps) {
  const [isCentered, setIsCentered] = useState(centered)

  useEffect(() => {
    setIsCentered(centered)
  }, [centered, src])

  const handleToggleCentered = () => {
    setIsCentered((prev) => !prev)
  }

  return (
    <div
      className={cn(
        'relative max-w-full overflow-hidden rounded-2xl shadow-sm',
        isCentered ? 'w-full bg-muted/20' : 'w-60',
        className,
      )}
    >
      <div className={cn('absolute right-2 top-2 z-10', isCentered && 'right-4 top-6')}>
        <Button
          type="button"
          variant="secondary"
          size="icon-sm"
          className="rounded-full bg-background/95 shadow-sm backdrop-blur hover:bg-background"
          onClick={handleToggleCentered}
          aria-label={isCentered ? 'Use original image width' : 'Center image'}
          title={isCentered ? 'Use original image width' : 'Center image'}
        >
          {isCentered ? <ChevronsRightLeft className="size-4" /> : <Maximize2 className="size-4" />}
        </Button>
      </div>

      {isCentered ? (
        <div className="flex w-full justify-center p-3">
          <img
            src={src}
            alt={alt}
            crossOrigin="anonymous"
            className="h-auto w-auto max-w-full rounded-2xl object-contain"
            draggable={false}
          />
        </div>
      ) : (
        <AspectRatio ratio={ratio}>
          <img
            src={src}
            alt={alt}
            crossOrigin="anonymous"
            className="h-full w-full object-cover"
            draggable={false}
          />
        </AspectRatio>
      )}
    </div>
  )
}
