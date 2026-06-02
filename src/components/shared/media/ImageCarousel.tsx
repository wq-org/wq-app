'use client'

import { BlurredScrollArea } from '@/components/ui/blurred-scroll-area'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'

import {
  imageCarouselItemVariants,
  imageCarouselTitleVariants,
  type ImageCarouselSize,
} from './image-carousel-variants'

export type ImageCarouselImage = {
  url: string
  title: string
  /** Optional storage path for selecting from fetched files; passed to onSelect. */
  storagePath?: string
  /** `cloud_files.id` when the image comes from teacher cloud. */
  cloudFileId?: string | null
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
  /** Thumbnail size. Defaults to `md`. */
  size?: ImageCarouselSize
}

function normalizeImages(images: ImageCarouselItem[]): ImageCarouselImage[] {
  return images.map((item) =>
    typeof item === 'string'
      ? { url: item, title: '' }
      : {
          url: item.url,
          title: item.title ?? '',
          storagePath: item.storagePath,
          cloudFileId: item.cloudFileId,
        },
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
  size = 'md',
}: ImageCarouselProps) {
  const normalized = normalizeImages(images)
  const itemClassName = imageCarouselItemVariants({ size })
  const titleClassName = imageCarouselTitleVariants({ size })

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
    <BlurredScrollArea
      scrollbars="horizontal"
      className={cn(
        'w-full min-w-0 max-w-[700px] animate-in fade-in-0 slide-in-from-bottom-4',
        className,
      )}
      viewportClassName="scroll-smooth"
    >
      <div className="flex -ml-2">
        {normalized.map((image, index) => (
          <button
            key={`${image.url}-${index}`}
            type="button"
            onClick={() => onSelect?.(image)}
            className={itemClassName}
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
                className={titleClassName}
                title={image.title}
              >
                {truncateTitle(image.title, titleMaxLength)}
              </Text>
            ) : null}
          </button>
        ))}
      </div>
    </BlurredScrollArea>
  )
}
