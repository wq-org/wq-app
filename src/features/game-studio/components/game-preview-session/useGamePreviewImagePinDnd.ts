'use client'

import { useEffect } from 'react'

import type { GamePreviewDndSession } from './GamePreviewSessionContext'
import { useGamePreviewSession } from './GamePreviewSessionContext'

export function useGamePreviewImagePinDnd(
  session: GamePreviewDndSession | null,
  enabled: boolean,
): void {
  const previewSession = useGamePreviewSession()

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

export const useIfElsePreviewImagePinDnd = useGamePreviewImagePinDnd
