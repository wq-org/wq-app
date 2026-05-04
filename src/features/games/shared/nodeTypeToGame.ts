import type { ComponentType } from 'react'
import { ImagePinMarkGame } from '@/features/games/image-pin-mark'

export interface GameComponentProps {
  initialData?: unknown
  previewOnly?: boolean
  /** When true, game is played for real (no alert, no correct/incorrect icons on options). */
  playMode?: boolean
  onResultsRevealed?: (correct: number, wrong: number, score: number) => void
  lockSelectionAfterReveal?: boolean
}

export const NODE_TYPE_TO_GAME: Record<string, ComponentType<GameComponentProps>> = {
  gameImagePin: ImagePinMarkGame,
}
