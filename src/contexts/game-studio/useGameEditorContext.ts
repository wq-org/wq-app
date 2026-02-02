import { useContext } from 'react'
import { GameEditorContext } from './game-editor-context'
import type { GameEditorContextValue } from './game-editor-context'

export function useGameEditorContext(): GameEditorContextValue | null {
  return useContext(GameEditorContext)
}
