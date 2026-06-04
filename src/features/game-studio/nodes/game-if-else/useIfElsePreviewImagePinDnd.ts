'use client'

import { useEffect } from 'react'

import type { IfElsePreviewDndSession } from './IfElsePreviewSessionContext'
import { useIfElsePreviewSession } from './IfElsePreviewSessionContext'

/** Registers shell-level DndContext props while an Image Pin segment is active in If/Else preview. */
export function useIfElsePreviewImagePinDnd(
  session: IfElsePreviewDndSession | null,
  enabled: boolean,
): void {
  const previewSession = useIfElsePreviewSession()

  useEffect(() => {
    if (!previewSession) return
    if (!enabled || !session) {
      previewSession.registerDndSession(null)
      return
    }
    previewSession.registerDndSession(session)
    return () => previewSession.registerDndSession(null)
  }, [enabled, previewSession, session])
}
