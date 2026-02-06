import type { ComponentType } from 'react'
import ParagraphLineSelectGame from '@/features/games/paragraph-line-select/ParagraphLineSelectGame'
import ImageTermMatchGame from '@/features/games/image-term-match/ImageTermMatchGame'
import ImagePinMarkGame from '@/features/games/image-pin-mark/ImagePinMarkGame'

export const NODE_TYPE_TO_GAME: Record<
  string,
  ComponentType<{ initialData?: unknown; previewOnly?: boolean }>
> = {
  gameParagraph: ParagraphLineSelectGame,
  gameImageTerms: ImageTermMatchGame,
  gameImagePin: ImagePinMarkGame,
}
