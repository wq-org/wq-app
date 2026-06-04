'use client'

import { useEffect, type ReactNode } from 'react'

import { useGamePreviewSession } from './GamePreviewSessionContext'

export function useGamePreviewFooter(content: ReactNode | null, enabled: boolean): void {
  const session = useGamePreviewSession()

  useEffect(() => {
    if (!session || !enabled) return
    session.registerFooter(content)
  }, [content, enabled, session])

  useEffect(() => {
    if (!session) return
    return () => session.registerFooter(null)
  }, [session])
}

export const useIfElsePreviewFooter = useGamePreviewFooter
