import { useCallback } from 'react'
import { GameEditorContext } from './game-editor-context'
import type { GetGameDataRef } from './game-editor-context'

interface GameEditorProviderProps {
  children: React.ReactNode
  getGameDataRef: GetGameDataRef
}

export function GameEditorProvider({ children, getGameDataRef }: GameEditorProviderProps) {
  const registerGetGameData = useCallback(
    (getData: () => unknown) => {
      getGameDataRef.current = getData
    },
    [getGameDataRef],
  )

  return (
    <GameEditorContext.Provider value={{ registerGetGameData }}>
      {children}
    </GameEditorContext.Provider>
  )
}
