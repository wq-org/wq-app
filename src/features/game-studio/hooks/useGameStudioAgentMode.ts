import { useContext } from 'react'

import { GameStudioAgentModeContext } from '../context/GameStudioAgentModeContext'

export function useGameStudioAgentMode() {
  const context = useContext(GameStudioAgentModeContext)
  if (!context) {
    throw new Error('useGameStudioAgentMode must be used within GameStudioAgentModeProvider')
  }
  return context
}
