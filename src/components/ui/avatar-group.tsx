import { Children, cloneElement, forwardRef, isValidElement } from 'react'

import { cn } from '@/lib/utils'

import type { CSSProperties, ElementRef, HTMLAttributes, ReactElement } from 'react'

// ================================== //

type TAvatarGroupRef = ElementRef<'div'>
type TAvatarGroupProps = HTMLAttributes<HTMLDivElement> & { max?: number; spacing?: number }
type AvatarGroupChildProps = {
  className?: string
  style?: CSSProperties
}

const AvatarGroup = forwardRef<TAvatarGroupRef, TAvatarGroupProps>(
  ({ className, children, max = 1, spacing = 10, ...props }, ref) => {
    const avatarItems = Children.toArray(children).filter(
      (child): child is ReactElement<AvatarGroupChildProps> =>
        isValidElement<AvatarGroupChildProps>(child),
    )
    const firstAvatarClassName = avatarItems[0]?.props.className

    return (
      <div
        ref={ref}
        className={cn('relative flex', className)}
        {...props}
      >
        {avatarItems.slice(0, max).map((child, index) =>
          cloneElement(child, {
            className: cn(child.props.className, 'border-2 border-background'),
            style: { marginLeft: index === 0 ? 0 : -spacing, ...child.props.style },
          }),
        )}

        {avatarItems.length > max && (
          <div
            className={cn(
              'relative flex items-center justify-center rounded-full border-2 border-background bg-muted',
              firstAvatarClassName,
            )}
            style={{ marginLeft: -spacing }}
          >
            <p>+{avatarItems.length - max}</p>
          </div>
        )}
      </div>
    )
  },
)

AvatarGroup.displayName = 'AvatarGroup'

// ================================== //

export { AvatarGroup }
