import { useCallback } from 'react'
import type { Node, Edge } from '@xyflow/react'
import type { HistoryState } from '../types/game-studio.types'
import { getGameForStudio, updateGameForStudio } from '../api/gameStudioApi'
import { serializeFlowGameConfig } from '../utils/gameConfigSerialization'
import { useUser } from '@/contexts/user'

export interface UseGamePersistenceOptions {
  projectId: string | undefined
  getNodes: () => Node[]
  getEdges: () => Edge[]
  getGameTitle: () => string
}

/**
 * Hook for game project persistence. When projectId is set, save/load call the game studio API.
 * The canvas uses this logic inline; this hook is available for other consumers.
 */
export default function useGamePersistence(options: UseGamePersistenceOptions): {
  save: () => Promise<void>
  load: () => Promise<HistoryState | null>
} {
  const { projectId, getNodes, getEdges, getGameTitle } = options
  const { getUserId } = useUser()

  const save = useCallback(async () => {
    if (!projectId || !getUserId()) return
    const nodes = getNodes()
    const edges = getEdges()
    const gameTitle = getGameTitle()
    const gameConfig = serializeFlowGameConfig(nodes, edges)
    const description =
      (nodes.find((n) => n.type === 'gameStart')?.data as { description?: string } | undefined)
        ?.description ?? ''
    await updateGameForStudio(projectId, {
      title: gameTitle,
      description,
      game_config: gameConfig,
    })
  }, [projectId, getUserId, getNodes, getEdges, getGameTitle])

  const load = useCallback(async (): Promise<HistoryState | null> => {
    if (!projectId) return null
    const game = await getGameForStudio(projectId)
    if (!game?.game_config?.nodes?.length) return null
    const config = game.game_config
    const nodes: Node[] = config.nodes.map((n) => ({
      id: n.id,
      type: n.type,
      position: n.position,
      data: { ...n.data },
    }))
    const edges: Edge[] = (config.edges ?? []).map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle ?? undefined,
    }))
    return { nodes, edges }
  }, [projectId])

  return { save, load }
}
