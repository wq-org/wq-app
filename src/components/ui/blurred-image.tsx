import type { ImgHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type BlurredImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  isBlurred?: boolean
  containerClassName?: string
  backdropClassName?: string
}

export function BlurredImage({
  src,
  alt = '',
  isBlurred = false,
  className,
  containerClassName,
  backdropClassName,
  ...props
}: BlurredImageProps) {
  const imageClassName = cn('h-full w-full object-cover', className)

  if (!isBlurred) {
    return (
      <img
        src={src}
        alt={alt}
        className={imageClassName}
        {...props}
      />
    )
  }

  return (
    <div
      className={cn('relative isolate block h-full w-full overflow-visible', containerClassName)}
    >
      <img
        src={src}
        alt=""
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0 z-0 h-full w-full scale-105 object-cover blur-2xl saturate-150 opacity-50',
          imageClassName,
          backdropClassName,
        )}
      />
      <img
        src={src}
        alt={alt}
        className={cn('relative z-10', imageClassName)}
        {...props}
      />
    </div>
  )
}
