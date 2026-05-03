import { BlurredImage } from '@/components/ui/blurred-image'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

export type ChatImageCarouselImage = {
  src: string
  alt?: string
}

type RoundedKey = 'sm' | 'md' | 'lg' | 'xl' | '2xl'

const roundedClassMap: Record<RoundedKey, string> = {
  sm: 'rounded-md',
  md: 'rounded-lg',
  lg: 'rounded-xl',
  xl: 'rounded-2xl',
  '2xl': 'rounded-3xl',
}

type CommonProps = {
  images: ChatImageCarouselImage[]
  className?: string
  itemClassName?: string
  rounded?: RoundedKey
  blurredBackdrop?: boolean
  onSelect?: (image: ChatImageCarouselImage, index: number) => void
}

type HorizontalProps = CommonProps & {
  orientation?: 'horizontal'
  itemWidth?: number
  itemHeight?: number
  gap?: number
  snap?: boolean
}

type VerticalProps = CommonProps & {
  orientation: 'vertical'
  itemHeight?: number
  viewportHeight?: number
  gap?: number
}

export type ChatImageCarouselProps = HorizontalProps | VerticalProps

export function ChatImageCarousel(props: ChatImageCarouselProps) {
  if (props.orientation === 'vertical') {
    return <VerticalCarousel {...props} />
  }
  return <HorizontalCarousel {...props} />
}

function HorizontalCarousel({
  images,
  className,
  itemClassName,
  rounded = 'lg',
  blurredBackdrop = true,
  onSelect,
  itemWidth = 180,
  itemHeight = 220,
  gap = 12,
  snap = true,
}: HorizontalProps) {
  if (images.length === 0) return null
  const radius = roundedClassMap[rounded]

  return (
    <div
      className={cn(
        'flex w-full max-w-full overflow-x-auto overflow-y-visible scroll-smooth',
        '[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden',
        snap && 'snap-x snap-mandatory',
        className,
      )}
      style={{ gap }}
    >
      {images.map((image, index) => {
        const content = (
          <BlurredImage
            src={image.src}
            alt={image.alt ?? `Image ${index + 1}`}
            isBlurred={blurredBackdrop}
            containerClassName={cn(radius, 'shadow-sm')}
            className={cn(radius, 'object-cover')}
          />
        )

        const wrapperStyle = { width: itemWidth, height: itemHeight, flex: `0 0 ${itemWidth}px` }
        const wrapperClass = cn(
          'relative isolate overflow-visible',
          radius,
          snap && 'snap-start',
          itemClassName,
        )

        if (onSelect) {
          return (
            <button
              key={`${image.src}-${index}`}
              type="button"
              onClick={() => onSelect(image, index)}
              className={cn(
                wrapperClass,
                'cursor-pointer transition-transform duration-200 hover:scale-[1.02]',
              )}
              style={wrapperStyle}
            >
              {content}
            </button>
          )
        }

        return (
          <div
            key={`${image.src}-${index}`}
            className={wrapperClass}
            style={wrapperStyle}
          >
            {content}
          </div>
        )
      })}
    </div>
  )
}

function VerticalCarousel({
  images,
  className,
  itemClassName,
  rounded = 'lg',
  onSelect,
  itemHeight = 200,
  viewportHeight = 360,
  gap = 12,
}: VerticalProps) {
  if (images.length === 0) return null
  const radius = roundedClassMap[rounded]

  return (
    <ScrollArea
      className={cn('w-full max-w-full', className)}
      style={{ height: viewportHeight }}
    >
      <div
        className="flex flex-col"
        style={{ gap }}
      >
        {images.map((image, index) => {
          const content = (
            <img
              src={image.src}
              alt={image.alt ?? `Image ${index + 1}`}
              crossOrigin="anonymous"
              className={cn('h-full w-full object-cover', radius)}
              draggable={false}
            />
          )

          const wrapperStyle = { height: itemHeight }
          const wrapperClass = cn(
            'relative w-full overflow-hidden shadow-sm',
            radius,
            itemClassName,
          )

          if (onSelect) {
            return (
              <button
                key={`${image.src}-${index}`}
                type="button"
                onClick={() => onSelect(image, index)}
                className={cn(
                  wrapperClass,
                  'cursor-pointer transition-transform duration-200 hover:scale-[1.01]',
                )}
                style={wrapperStyle}
              >
                {content}
              </button>
            )
          }

          return (
            <div
              key={`${image.src}-${index}`}
              className={wrapperClass}
              style={wrapperStyle}
            >
              {content}
            </div>
          )
        })}
      </div>
    </ScrollArea>
  )
}
