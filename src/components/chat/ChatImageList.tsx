import { Stack } from '@/components/stack'
import { cn } from '@/lib/utils'
import { ChatImage } from '@/components/chat/ChatImage'
import type { ChatImageItem } from '@/components/chat/types'

type ChatImageListProps = {
  images?: ChatImageItem[]
  className?: string
}

function normalizeChatImage(image: ChatImageItem, index: number) {
  if (typeof image === 'string') {
    return {
      src: image,
      alt: `Shared photo ${index + 1}`,
      ratio: undefined as number | undefined,
    }
  }

  return {
    src: image.src,
    alt: image.alt || `Shared photo ${index + 1}`,
    ratio: image.ratio,
  }
}

export function ChatImageList({ images, className }: ChatImageListProps) {
  if (!images || images.length === 0) return null

  const normalizedImages = images.map((image, index) => normalizeChatImage(image, index))

  if (images.length === 1) {
    const image = normalizedImages[0]
    return (
      <div className={cn(className)}>
        <ChatImage
          src={image.src}
          alt={image.alt}
          ratio={image.ratio}
        />
      </div>
    )
  }

  return (
    <div className={cn(className)}>
      <Stack
        randomRotation
        sensitivity={170}
        sendToBackOnClick
        cards={normalizedImages.map((image, index) => (
          <img
            key={index}
            src={image.src}
            alt={image.alt}
            crossOrigin="anonymous"
            className="h-full w-full object-cover"
            draggable={false}
          />
        ))}
      />
    </div>
  )
}
