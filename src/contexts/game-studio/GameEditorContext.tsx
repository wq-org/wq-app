import { useCallback, useMemo, useRef, useState } from 'react'
import { GameEditorContext } from './game-editor-context'
import type { GameNodeField, GetGameDataRef } from './game-editor-context'

interface GameEditorProviderProps {
  children: React.ReactNode
  getGameDataRef: GetGameDataRef
  onReady?: () => void
  activeNodeId?: string | null
}

const EMPTY_FIELDS: GameNodeField[] = []

function buildFieldSignature(fields: readonly GameNodeField[]): string {
  return fields.map((field) => field.fieldKey).join('|')
}

export function GameEditorProvider({
  children,
  getGameDataRef,
  onReady,
  activeNodeId = null,
}: GameEditorProviderProps) {
  const readyRef = useRef(false)
  // State (not a ref) so consumers (e.g. AgentPanel) re-render when a Dialog
  // re-registers fields after a rect/exercise add/remove. Using a ref caused
  // the agent menu to keep showing the previously-memoized field list.
  const [nodeFieldsByNode, setNodeFieldsByNode] = useState<Map<string, GameNodeField[]>>(
    () => new Map(),
  )

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
    const nodeId = fields[0].nodeId
    const signature = buildFieldSignature(fields)
    setNodeFieldsByNode((previous) => {
      const existing = previous.get(nodeId)
      if (existing && buildFieldSignature(existing) === signature) {
        return previous
      }
      const next = new Map(previous)
      next.set(nodeId, fields)
      return next
    })
  }, [])

  const unregisterNodeFields = useCallback((nodeId: string) => {
    setNodeFieldsByNode((previous) => {
      if (!previous.has(nodeId)) return previous
      const next = new Map(previous)
      next.delete(nodeId)
      return next
    })
  }, [])

  const activeNodeFields = useMemo(
    () => nodeFieldsByNode.get(activeNodeId ?? '') ?? EMPTY_FIELDS,
    [nodeFieldsByNode, activeNodeId],
  )

  const getActiveNodeFields = useCallback(() => activeNodeFields, [activeNodeFields])

  const contextValue = useMemo(
    () => ({
      registerGetGameData,
      registerNodeFields,
      unregisterNodeFields,
      getActiveNodeFields,
      activeNodeId,
    }),
    [
      registerGetGameData,
      registerNodeFields,
      unregisterNodeFields,
      getActiveNodeFields,
      activeNodeId,
    ],
  )

  return <GameEditorContext.Provider value={contextValue}>{children}</GameEditorContext.Provider>
}
