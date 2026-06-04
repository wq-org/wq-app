'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { DragEndEvent, DragStartEvent, Modifier } from '@dnd-kit/core'

export type IfElsePreviewDndSession = {
  modifiers?: Modifier[]
  onDragStart: (event: DragStartEvent) => void
  onDragEnd: (event: DragEndEvent) => void
  onDragCancel: () => void
  overlay: ReactNode
}

export type IfElsePreviewSessionContextValue = {
  registerFooter: (content: ReactNode | null) => void
  registerDndSession: (session: IfElsePreviewDndSession | null) => void
  /** Scrolls the session viewport so the given segment element is visible. */
  scrollToSegment: (element: HTMLElement) => void
}

export const IfElsePreviewSessionContext = createContext<IfElsePreviewSessionContextValue | null>(
  null,
)

export function useIfElsePreviewSession(): IfElsePreviewSessionContextValue | null {
  return useContext(IfElsePreviewSessionContext)
}
