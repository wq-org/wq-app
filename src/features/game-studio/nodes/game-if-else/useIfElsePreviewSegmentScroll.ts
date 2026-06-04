'use client'

import { useLayoutEffect, useRef, type RefObject } from 'react'

import { IF_ELSE_SEGMENT_ANCHOR_ATTR } from './ifElsePreview.constants'
import { useIfElsePreviewSession } from './IfElsePreviewSessionContext'

/**
 * Returns a ref for a segment wrapper; scrolls it into the shell viewport when `segmentKey` mounts or updates.
 */
export function useIfElsePreviewSegmentScroll(
  segmentKey: string,
  enabled: boolean,
): RefObject<HTMLDivElement | null> {
  const ref = useRef<HTMLDivElement | null>(null)
  const session = useIfElsePreviewSession()

  useLayoutEffect(() => {
    if (!enabled || !session) return
    const element = ref.current
    if (!element) return
    session.scrollToSegment(element)
  }, [enabled, segmentKey, session])

  return ref
}

export const ifElseSegmentAnchorProps = {
  [IF_ELSE_SEGMENT_ANCHOR_ATTR]: '',
} as const
