'use client'

import { useState } from 'react'

import { Toggle } from '@/components/ui/toggle'
import { cn } from '@/lib/utils'
import { BookmarkIcon, HeartIcon, Repeat2Icon, Share2Icon } from 'lucide-react'

type SocialReactionKey = 'liked' | 'retweeted' | 'shared' | 'bookmarked'

export type SocialMediaReactionCount = {
  off: number
  on: number
}

export type SocialMediaReactionCounts = Record<SocialReactionKey, SocialMediaReactionCount>
export type SocialMediaReactionValues = Record<SocialReactionKey, boolean>

const defaultCounts: SocialMediaReactionCounts = {
  liked: { off: 12, on: 13 },
  retweeted: { off: 5, on: 6 },
  shared: { off: 3, on: 4 },
  bookmarked: { off: 8, on: 9 },
}

const defaultValues: SocialMediaReactionValues = {
  liked: false,
  retweeted: false,
  shared: false,
  bookmarked: false,
}

export type SocialMediaReactionTogglesProps = {
  value?: SocialMediaReactionValues
  defaultValue?: SocialMediaReactionValues
  onValueChange?: (value: SocialMediaReactionValues) => void
  counts?: Partial<SocialMediaReactionCounts>
  className?: string
}

export function SocialMediaReactionToggles({
  value,
  defaultValue,
  onValueChange,
  counts,
  className,
}: SocialMediaReactionTogglesProps) {
  const [internalValue, setInternalValue] = useState<SocialMediaReactionValues>({
    ...defaultValues,
    ...defaultValue,
  })
  const resolvedValue = value ?? internalValue
  const resolvedCounts: SocialMediaReactionCounts = {
    liked: { ...defaultCounts.liked, ...counts?.liked },
    retweeted: { ...defaultCounts.retweeted, ...counts?.retweeted },
    shared: { ...defaultCounts.shared, ...counts?.shared },
    bookmarked: { ...defaultCounts.bookmarked, ...counts?.bookmarked },
  }

  const handleReactionChange = (key: SocialReactionKey, isPressed: boolean) => {
    const nextValue = { ...resolvedValue, [key]: isPressed }
    if (value === undefined) {
      setInternalValue(nextValue)
    }
    onValueChange?.(nextValue)
  }

  return (
    <div className={cn('flex flex-wrap items-center justify-center gap-2', className)}>
      <Toggle
        variant="outline"
        aria-label="Like"
        pressed={resolvedValue.liked}
        onPressedChange={(pressed) => handleReactionChange('liked', pressed)}
      >
        <HeartIcon />
        {resolvedValue.liked ? resolvedCounts.liked.on : resolvedCounts.liked.off}
      </Toggle>
      <Toggle
        variant="outline"
        aria-label="Retweet"
        pressed={resolvedValue.retweeted}
        onPressedChange={(pressed) => handleReactionChange('retweeted', pressed)}
      >
        <Repeat2Icon />
        {resolvedValue.retweeted ? resolvedCounts.retweeted.on : resolvedCounts.retweeted.off}
      </Toggle>
      <Toggle
        variant="outline"
        aria-label="Share"
        pressed={resolvedValue.shared}
        onPressedChange={(pressed) => handleReactionChange('shared', pressed)}
      >
        <Share2Icon />
        {resolvedValue.shared ? resolvedCounts.shared.on : resolvedCounts.shared.off}
      </Toggle>
      <Toggle
        variant="outline"
        aria-label="Bookmark"
        pressed={resolvedValue.bookmarked}
        onPressedChange={(pressed) => handleReactionChange('bookmarked', pressed)}
      >
        <BookmarkIcon />
        {resolvedValue.bookmarked ? resolvedCounts.bookmarked.on : resolvedCounts.bookmarked.off}
      </Toggle>
    </div>
  )
}
