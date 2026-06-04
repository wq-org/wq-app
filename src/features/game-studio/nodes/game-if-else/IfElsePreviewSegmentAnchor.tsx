'use client'

import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

import {
  ifElseSegmentAnchorProps,
  useIfElsePreviewSegmentScroll,
} from './useIfElsePreviewSegmentScroll'

export type IfElsePreviewSegmentAnchorProps = {
  segmentKey: string
  children: ReactNode
  className?: string
  enabled?: boolean
}

export function IfElsePreviewSegmentAnchor({
  segmentKey,
  children,
  className,
  enabled = true,
}: IfElsePreviewSegmentAnchorProps) {
  const ref = useIfElsePreviewSegmentScroll(segmentKey, enabled)

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
