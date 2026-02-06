import type { ReactNode } from 'react'
import { GamePlayContext, useGamePlayState } from './GamePlayContext'

export function GamePlayProvider({ children }: { children: ReactNode }) {
  const value = useGamePlayState()
  return <GamePlayContext.Provider value={value}>{children}</GamePlayContext.Provider>
}
