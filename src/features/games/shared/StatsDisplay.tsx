'use client'

import { useEffect, useRef, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Heart from '@/components/ui/heart'
import { SlideCounter } from '@/components/ui/SlideCounter'
import { useUser } from '@/contexts/user'
import { useAvatarUrl } from '@/features/onboarding/hooks/useAvatarUrl'
import { DEFAULT_INSTITUTION_IMAGE } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface StatsDisplayProps {
  value: number
  className?: string
}

export function StatsDisplay({ value, className }: StatsDisplayProps) {
  const { profile } = useUser()
  const previousValue = useRef(value)
  const [heartAnimationTrigger, setHeartAnimationTrigger] = useState(0)
  const [avatarFailed, setAvatarFailed] = useState(false)
  const { url: signedAvatarUrl } = useAvatarUrl(profile?.avatar_url || '')

  useEffect(() => {
    if (value > previousValue.current) {
      setHeartAnimationTrigger((current) => current + 1)
    }

    previousValue.current = value
  }, [value])

  useEffect(() => {
    setAvatarFailed(false)
  }, [signedAvatarUrl, profile?.avatar_url])

  const avatarSrc = avatarFailed
    ? DEFAULT_INSTITUTION_IMAGE
    : signedAvatarUrl || profile?.avatar_url || DEFAULT_INSTITUTION_IMAGE
  const avatarFallback = profile?.display_name?.trim()?.charAt(0)?.toUpperCase() || 'U'

  return (
    <div
      className={cn(
        'inline-flex items-center gap-4 rounded-full border border-border bg-background px-3 py-2 shadow-sm',
        className,
      )}
    >
      <div className="relative shrink-0">
        <Avatar className="size-10 border border-border bg-muted/50">
          <AvatarImage
            src={avatarSrc}
            alt={profile?.display_name || 'User avatar'}
            className="object-cover"
            onError={() => setAvatarFailed(true)}
          />
          <AvatarFallback className="bg-transparent font-medium">{avatarFallback}</AvatarFallback>
        </Avatar>
        <div className="absolute -right-2 -bottom-2 flex size-7 items-center justify-center rounded-full border border-border bg-background shadow-sm">
          <Heart
            size="xl"
            variant="violet"
            triggerAnimation={heartAnimationTrigger}
          />
        </div>
      </div>
      <div className="min-w-[1.5rem]">
        <SlideCounter
          value={value}
          className="text-lg font-medium tracking-tight text-foreground"
        />
      </div>
    </div>
  )
}
