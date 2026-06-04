'use client'

import { useEffect, type ReactNode } from 'react'

import { useIfElsePreviewSession } from './IfElsePreviewSessionContext'

/** Registers sticky footer content while this segment is the active If/Else preview turn. */
export function useIfElsePreviewFooter(content: ReactNode | null, enabled: boolean): void {
  const session = useIfElsePreviewSession()

  useEffect(() => {
    if (!session) return
    if (!enabled) {
      session.registerFooter(null)
      return
    }
    session.registerFooter(content)
    return () => session.registerFooter(null)
  }, [content, enabled, session])
}
