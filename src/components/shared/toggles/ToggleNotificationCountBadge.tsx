'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Toggle } from '@/components/ui/toggle'
import { cn } from '@/lib/utils'
import { BellIcon } from 'lucide-react'

export type ToggleNotificationCountBadgeProps = {
  pressed?: boolean
  defaultPressed?: boolean
  onPressedChange?: (pressed: boolean) => void
  notificationCount?: number
  ariaLabel?: string
  className?: string
}

export function ToggleNotificationCountBadge({
  pressed,
  defaultPressed = false,
  onPressedChange,
  notificationCount = 3,
  ariaLabel = 'Toggle notifications',
  className,
}: ToggleNotificationCountBadgeProps) {
  const [internalPressed, setInternalPressed] = useState(defaultPressed)
  const resolvedPressed = pressed ?? internalPressed

  const handlePressedChange = (nextPressed: boolean) => {
    if (pressed === undefined) {
      setInternalPressed(nextPressed)
    }
    onPressedChange?.(nextPressed)
  }

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <Toggle
        aria-label={ariaLabel}
        pressed={resolvedPressed}
        onPressedChange={handlePressedChange}
      >
        <div className="relative">
          <BellIcon />
          {!resolvedPressed && notificationCount > 0 && (
            <Badge
              variant="destructive"
              size="xs"
              className="absolute -top-2 -right-2 rounded-full!"
            >
              {notificationCount}
            </Badge>
          )}
        </div>
      </Toggle>
    </div>
  )
}
