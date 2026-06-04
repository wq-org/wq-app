'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { DragEndEvent, DragStartEvent, Modifier } from '@dnd-kit/core'

export type GamePreviewDndSession = {
  modifiers?: Modifier[]
  onDragStart: (event: DragStartEvent) => void
  onDragEnd: (event: DragEndEvent) => void
  onDragCancel: () => void
  overlay: ReactNode
}

export type GamePreviewSessionContextValue = {
  registerFooter: (content: ReactNode | null) => void
  registerDndSession: (session: GamePreviewDndSession | null) => void
  scrollToSegment: (element: HTMLElement) => void
  scrollToLatestContent: () => void
}

export const GamePreviewSessionContext = createContext<GamePreviewSessionContextValue | null>(null)

export function useGamePreviewSession(): GamePreviewSessionContextValue | null {
  return useContext(GamePreviewSessionContext)
}

export type IfElsePreviewDndSession = GamePreviewDndSession
export type IfElsePreviewSessionContextValue = GamePreviewSessionContextValue
export const IfElsePreviewSessionContext = GamePreviewSessionContext
export const useIfElsePreviewSession = useGamePreviewSession
