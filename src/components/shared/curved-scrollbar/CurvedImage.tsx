import { cn } from '@/lib/utils'

import type { CurvedImageProps } from './curved-scrollbar.types'

export function CurvedImage({
  placement = 'content',
  className,
  alt = '',
  ...props
}: CurvedImageProps) {
  const image = (
    <img
      data-slot="curved-image"
      data-placement={placement}
      alt={alt}
      className={cn('curved-scrollbar__image', className)}
      {...props}
    />
  )

  if (placement === 'hero') {
    return <div className="curved-scrollbar__hero">{image}</div>
  }

  return image
}
