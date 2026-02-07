import type { ComponentType } from 'react'
import ParagraphLineSelectGame from '@/features/games/paragraph-line-select/ParagraphLineSelectGame'
import ImageTermMatchGame from '@/features/games/image-term-match/ImageTermMatchGame'
import ImagePinMarkGame from '@/features/games/image-pin-mark/ImagePinMarkGame'

export interface GameComponentProps {
  initialData?: unknown
  previewOnly?: boolean
  /** When true, game is played for real (no alert, no correct/incorrect icons on options). */
  playMode?: boolean
  onResultsRevealed?: (correct: number, wrong: number, score: number) => void
  lockSelectionAfterReveal?: boolean
}

export const NODE_TYPE_TO_GAME: Record<string, ComponentType<GameComponentProps>> = {
  gameParagraph: ParagraphLineSelectGame,
  gameImageTerms: ImageTermMatchGame,
  gameImagePin: ImagePinMarkGame,
}
