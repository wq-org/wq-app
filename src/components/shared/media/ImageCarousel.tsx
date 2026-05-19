'use client'

import { useRef } from 'react'
import { cn } from '@/lib/utils'
import { Text } from '@/components/ui/text'
import { Spinner } from '@/components/ui/spinner'

export type ImageCarouselImage = {
  url: string
  title: string
  /** Optional storage path for selecting from fetched files; passed to onSelect. */
  storagePath?: string
}

export type ImageCarouselItem = string | ImageCarouselImage

export type ImageCarouselProps = {
  /** Array of image URLs (strings) or objects with url and title. */
  images: ImageCarouselItem[]
  /** Called when an image is clicked. */
  onSelect?: (image: ImageCarouselImage) => void
  /** Optional class name for the root container. */
  className?: string
  /** Max length for title truncation (character count). Default 40. */
  titleMaxLength?: number
  /** Show loading spinner while fetching images. */
  isLoading?: boolean
}

function normalizeImages(images: ImageCarouselItem[]): ImageCarouselImage[] {
  return images.map((item) =>
    typeof item === 'string'
      ? { url: item, title: '' }
      : { url: item.url, title: item.title ?? '', storagePath: item.storagePath },
  )
}

function truncateTitle(title: string, maxLength: number): string {
  if (!title.trim()) return ''
  if (title.length <= maxLength) return title
  return `${title.slice(0, maxLength).trim()}…`
}

export function ImageCarousel({
  images,
  onSelect,
  className,
  titleMaxLength = 40,
  isLoading = false,
}: ImageCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const normalized = normalizeImages(images)

  // Show spinner while loading
  if (isLoading) {
    return (
      <div
        className={cn(
          'flex items-center justify-center py-6 animate-in fade-in-0 slide-in-from-bottom-2',
          className,
        )}
      >
        <Spinner
          size="sm"
          speed={1500}
        />
      </div>
    )
  }

  if (normalized.length === 0) {
    return null
  }

  return (
    <div
      className={cn(
        'w-full min-w-0 max-w-[700px] overflow-hidden animate-in fade-in-0 slide-in-from-bottom-4',
        className,
      )}
    >
      <div
        ref={scrollRef}
        className="flex -ml-2 overflow-x-auto scroll-smooth [scrollbar-width:none] [ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {normalized.map((image, index) => (
          <button
            key={`${image.url}-${index}`}
            type="button"
            onClick={() => onSelect?.(image)}
            className="shrink-0 pl-2 w-[calc(25%-6px)] min-w-[calc(25%-6px)] sm:w-[calc(20%-6px)] sm:min-w-[calc(20%-6px)] md:w-[calc(16.666%-6px)] md:min-w-[calc(16.666%-6px)] lg:w-[calc(12.5%-6px)] lg:min-w-[calc(12.5%-6px)] text-left cursor-pointer group"
          >
            <div className="overflow-hidden rounded-md">
              <img
                src={image.url || '/placeholder.svg'}
                alt={image.title || 'Gallery image'}
                className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            {image.title ? (
              <Text
                as="p"
                variant="body"
                className="mt-1 text-xs font-medium text-foreground truncate min-w-0 max-w-full"
                title={image.title}
              >
                {truncateTitle(image.title, titleMaxLength)}
              </Text>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  )
}
