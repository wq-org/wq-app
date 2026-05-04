import { useCallback, useMemo, useState } from 'react'
import type { Node, Edge } from '@xyflow/react'
import {
  getSessionPath,
  type SessionNodeResult,
  type SessionResultsByNode,
} from '../utils/flowOrder'
import { GAME_END_TYPE } from '../nodes/game-end/game-end.schema'
import { GAME_START_TYPE } from '../nodes/game-start/game-start.schema'

export type GameChatRole = 'player' | 'system' | 'node'

export type GameChatTurn = {
  id: string
  role: GameChatRole
  text: string
  /** Originating node id, when relevant */
  nodeId?: string
  time: string
}

export type UseGameChatSessionInput = {
  nodes: Node[]
  edges: Edge[]
}

export type UseGameChatSessionResult = {
  /** Ordered conversation turns to render. */
  turns: GameChatTurn[]
  /** Per-node results for traversal (correct/wrong + score). */
  results: SessionResultsByNode
  /** The node currently waiting for a player answer; null when finished. */
  currentNode: Node | null
  /** Whether the session has reached the End node. */
  isComplete: boolean
  /** Submit a result for the current node and advance the session. */
  recordResult: (result: SessionNodeResult) => void
  /** Reset the session back to the Start node. */
  reset: () => void
}

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function getNodeTitle(node: Node | null): string {
  if (!node) return ''
  const data = node.data as Record<string, unknown> | undefined
  const title = (data?.title ?? data?.label ?? node.id) as string
  return typeof title === 'string' && title.trim() ? title : node.id
}

function getNodeDescription(node: Node | null): string {
  if (!node) return ''
  const data = node.data as Record<string, unknown> | undefined
  return (data?.description as string | undefined) ?? ''
}

/**
 * Drives the chat-style game playback. Wraps the existing flowOrder.getSessionPath
 * traversal so the chat UI can be a thin renderer over what's already proven.
 */
export function useGameChatSession({
  nodes,
  edges,
}: UseGameChatSessionInput): UseGameChatSessionResult {
  const [results, setResults] = useState<SessionResultsByNode>({})

  const startNode = useMemo(() => nodes.find((n) => n.type === GAME_START_TYPE) ?? null, [nodes])
  const endNode = useMemo(() => nodes.find((n) => n.type === GAME_END_TYPE) ?? null, [nodes])

  const path = useMemo(() => getSessionPath(nodes, edges, results), [nodes, edges, results])

  const currentNode = useMemo(() => {
    const next = path.pathNodes.find((n) => !(n.id in results)) ?? null
    return next
  }, [path.pathNodes, results])

  const isComplete = path.endNode != null && currentNode == null

  const turns = useMemo<GameChatTurn[]>(() => {
    const out: GameChatTurn[] = []
    if (startNode) {
      const title = getNodeTitle(startNode)
      const description = getNodeDescription(startNode)
      out.push({
        id: `${startNode.id}-intro`,
        role: 'system',
        text: description ? `${title}\n${description}` : title,
        nodeId: startNode.id,
        time: nowTime(),
      })
    }
    for (const node of path.pathNodes) {
      const recorded = results[node.id]
      out.push({
        id: `${node.id}-prompt`,
        role: 'node',
        text: getNodeTitle(node),
        nodeId: node.id,
        time: nowTime(),
      })
      if (recorded) {
        out.push({
          id: `${node.id}-result`,
          role: 'player',
          text: recorded.outcome === 'correct' ? 'Correct' : 'Wrong',
          nodeId: node.id,
          time: nowTime(),
        })
      }
    }
    if (isComplete && endNode) {
      out.push({
        id: `${endNode.id}-end`,
        role: 'system',
        text: getNodeTitle(endNode),
        nodeId: endNode.id,
        time: nowTime(),
      })
    }
    return out
  }, [startNode, endNode, path.pathNodes, results, isComplete])

  const recordResult = useCallback(
    (result: SessionNodeResult) => {
      if (!currentNode) return
      setResults((prev) => ({ ...prev, [currentNode.id]: result }))
    },
    [currentNode],
  )

  const reset = useCallback(() => setResults({}), [])

  return { turns, results, currentNode, isComplete, recordResult, reset }
}
