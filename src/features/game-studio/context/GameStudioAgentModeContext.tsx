import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'

import { GAME_AGENT_MODE_CHANGED_EVENT } from './gameAgentModeEvents'

const COMMAND_ACTION_EVENT = 'command-action'

type GameStudioAgentModeContextValue = {
  isAgentMode: boolean
  setAgentMode: (enabled: boolean) => void
}

const GameStudioAgentModeContext = createContext<GameStudioAgentModeContextValue | null>(null)

export { GameStudioAgentModeContext }

type GameStudioAgentModeProviderProps = {
  children: ReactNode
}

export function GameStudioAgentModeProvider({ children }: GameStudioAgentModeProviderProps) {
  const [isAgentMode, setIsAgentMode] = useState(false)

  const setAgentMode = useCallback((enabled: boolean) => {
    setIsAgentMode(enabled)
    window.dispatchEvent(new CustomEvent(GAME_AGENT_MODE_CHANGED_EVENT, { detail: { enabled } }))
  }, [])

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ actionId?: string }>).detail
      if (detail?.actionId === 'agent') {
        setAgentMode(true)
      } else if (detail?.actionId === 'pan' || detail?.actionId === 'select') {
        setAgentMode(false)
      }
    }
    window.addEventListener(COMMAND_ACTION_EVENT, handler)
    return () => window.removeEventListener(COMMAND_ACTION_EVENT, handler)
  }, [setAgentMode])

  const value = useMemo(() => ({ isAgentMode, setAgentMode }), [isAgentMode, setAgentMode])

  return (
    <GameStudioAgentModeContext.Provider value={value}>
      {children}
    </GameStudioAgentModeContext.Provider>
  )
}
