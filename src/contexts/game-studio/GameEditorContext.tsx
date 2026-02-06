import { useCallback, useRef } from 'react'
import { GameEditorContext } from './game-editor-context'
import type { GetGameDataRef } from './game-editor-context'

interface GameEditorProviderProps {
  children: React.ReactNode
  getGameDataRef: GetGameDataRef
  onReady?: () => void
}

export function GameEditorProvider({
  children,
  getGameDataRef,
  onReady,
}: GameEditorProviderProps) {
  const readyRef = useRef(false)
  const registerGetGameData = useCallback(
    (getData: () => unknown) => {
      getGameDataRef.current = getData
      if (!readyRef.current) {
        readyRef.current = true
        onReady?.()
      }
    },
    [getGameDataRef, onReady],
  )

  return (
    <GameEditorContext.Provider value={{ registerGetGameData }}>
      {children}
    </GameEditorContext.Provider>
  )
}
