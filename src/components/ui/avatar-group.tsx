import * as React from 'react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

type AvatarElement = React.ReactElement<React.ComponentProps<typeof Avatar>>

interface AvatarGroupProps extends React.ComponentProps<'div'> {
  children: AvatarElement | AvatarElement[]
  max?: number
}

export function AvatarGroup({ children, max, className, ...props }: AvatarGroupProps) {
  const childArray = React.Children.toArray(children).filter(
    React.isValidElement,
  ) as AvatarElement[]
  const totalAvatars = childArray.length
  const displayedAvatars = childArray.slice(0, max).reverse()
  const remainingAvatars = max ? Math.max(totalAvatars - max, 0) : 0

  return (
    <div
      className={cn('flex flex-row-reverse items-center', className)}
      {...props}
    >
      {remainingAvatars > 0 ? (
        <Avatar className="relative -ml-2 ring-2 ring-background hover:z-10">
          <AvatarFallback className="bg-muted-foreground text-white">
            +{remainingAvatars}
          </AvatarFallback>
        </Avatar>
      ) : null}
      {displayedAvatars.map((avatar, index) => (
        <div
          className="relative -ml-2 hover:z-10"
          key={avatar.key ?? index}
        >
          {React.cloneElement(avatar, {
            className: cn('ring-2 ring-background', avatar.props.className),
          })}
        </div>
      ))}
    </div>
  )
}
