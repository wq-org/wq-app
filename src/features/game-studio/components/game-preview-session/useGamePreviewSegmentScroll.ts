'use client'

import { useLayoutEffect, useRef, type RefObject } from 'react'

import { GAME_PREVIEW_SEGMENT_ANCHOR_ATTR } from './gamePreviewSession.constants'
import { useGamePreviewSession } from './GamePreviewSessionContext'

export function useGamePreviewSegmentScroll(
  segmentKey: string,
  enabled: boolean,
): RefObject<HTMLDivElement | null> {
  const ref = useRef<HTMLDivElement | null>(null)
  const session = useGamePreviewSession()

  useLayoutEffect(() => {
    if (!enabled || !session) return
    const element = ref.current
    if (!element) return
    session.scrollToSegment(element)
  }, [enabled, segmentKey, session])

  return ref
}

export const ifElseSegmentAnchorProps = {
  [GAME_PREVIEW_SEGMENT_ANCHOR_ATTR]: '',
} as const

export const useIfElsePreviewSegmentScroll = useGamePreviewSegmentScroll
