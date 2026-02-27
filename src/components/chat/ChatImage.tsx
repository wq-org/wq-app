import { AspectRatio } from '@/components/ui/aspect-ratio'
import { cn } from '@/lib/utils'

type ChatImageProps = {
  src: string
  alt: string
  ratio?: number
  className?: string
}

export function ChatImage({ src, alt, ratio = 4 / 3, className }: ChatImageProps) {
  return (
    <div
      className={cn(
        'w-60 max-w-full overflow-hidden rounded-2xl border border-neutral-200 shadow-sm',
        className,
      )}
    >
      <AspectRatio ratio={ratio}>
        <img
          src={src}
          alt={alt}
          crossOrigin="anonymous"
          className="h-full w-full object-cover"
          draggable={false}
        />
      </AspectRatio>
    </div>
  )
}
