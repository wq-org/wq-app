import { useCallback, useRef } from 'react'
import { GameEditorContext } from './game-editor-context'
import type { GetGameDataRef, GameNodeField } from './game-editor-context'

interface GameEditorProviderProps {
  children: React.ReactNode
  getGameDataRef: GetGameDataRef
  onReady?: () => void
  activeNodeId?: string | null
}

export function GameEditorProvider({
  children,
  getGameDataRef,
  onReady,
  activeNodeId = null,
}: GameEditorProviderProps) {
  const readyRef = useRef(false)
  const nodeFieldsRef = useRef<Map<string, GameNodeField[]>>(new Map())

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

  const registerNodeFields = useCallback((fields: GameNodeField[]) => {
    if (fields.length === 0) return
    nodeFieldsRef.current.set(fields[0].nodeId, fields)
  }, [])

  const unregisterNodeFields = useCallback((nodeId: string) => {
    nodeFieldsRef.current.delete(nodeId)
  }, [])

  const getActiveNodeFields = useCallback((): GameNodeField[] => {
    return nodeFieldsRef.current.get(activeNodeId ?? '') ?? []
  }, [activeNodeId])

  return (
    <GameEditorContext.Provider
      value={{
        registerGetGameData,
        registerNodeFields,
        unregisterNodeFields,
        getActiveNodeFields,
        activeNodeId,
      }}
    >
      {children}
    </GameEditorContext.Provider>
  )
}
