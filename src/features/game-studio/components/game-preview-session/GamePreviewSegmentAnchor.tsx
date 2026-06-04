'use client'

import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

import {
  ifElseSegmentAnchorProps,
  useGamePreviewSegmentScroll,
} from './useGamePreviewSegmentScroll'

export type GamePreviewSegmentAnchorProps = {
  segmentKey: string
  children: ReactNode
  className?: string
  enabled?: boolean
}

export function GamePreviewSegmentAnchor({
  segmentKey,
  children,
  className,
  enabled = true,
}: GamePreviewSegmentAnchorProps) {
  const ref = useGamePreviewSegmentScroll(segmentKey, enabled)

  return (
    <div
      ref={ref}
      className={cn('flex flex-col gap-3', className)}
      {...ifElseSegmentAnchorProps}
      data-segment-key={segmentKey}
    >
      {children}
    </div>
  )
}

export const IfElsePreviewSegmentAnchor = GamePreviewSegmentAnchor
export type IfElsePreviewSegmentAnchorProps = GamePreviewSegmentAnchorProps
