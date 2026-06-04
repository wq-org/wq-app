'use client'

import { useLayoutEffect } from 'react'

import { useGamePreviewSession } from './GamePreviewSessionContext'

/** Scrolls the session viewport when chat content grows (flat history, new bubbles). */
export function useGamePreviewFollowContent(scrollKey: string | number, enabled: boolean): void {
  const session = useGamePreviewSession()

  useLayoutEffect(() => {
    if (!enabled || !session) return
    session.scrollToLatestContent()
  }, [enabled, scrollKey, session])
}

export const useIfElsePreviewFollowContent = useGamePreviewFollowContent
