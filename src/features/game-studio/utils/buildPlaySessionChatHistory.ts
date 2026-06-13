import type { Edge, Node } from '@xyflow/react'

import { resolveGameplayNodeMaxPoints } from '../nodes/game-if-else/game-if-else.utils'
import type { GameChatImageDescriptor } from '../components/game-chat.types'
import { getSessionPath, type SessionResultsByNode } from './flowOrder'

/**
 * JSON-safe chat transcript entry persisted in game_session_participants.session_payload.
 * `direction` mirrors game-chat.types: 'incoming' = game prompt, 'receiving' = player answer.
 */
export type GamePlayChatMessage = {
  id: string
  direction: 'incoming' | 'receiving'
  text: string
  nodeId?: string
  score?: number
  maxScore?: number
  /** Image attachment (e.g. an Image Pin question), rendered in the chat replay when present. */
  image?: GameChatImageDescriptor
  /** ISO timestamp. */
  time: string
  bold?: boolean
}

export type NodeChatHistoriesByNodeId = Record<string, GamePlayChatMessage[]>

function getNodeTitle(node: Node): string {
  const data = node.data as Record<string, unknown> | undefined
  const title = (data?.title ?? data?.label ?? node.id) as string
  return typeof title === 'string' && title.trim() ? title : node.id
}

function getNodeDescription(node: Node): string {
  const data = node.data as Record<string, unknown> | undefined
  const description = data?.description
  return typeof description === 'string' ? description : ''
}

function toPromptText(node: Node): string {
  const title = getNodeTitle(node)
  const description = getNodeDescription(node)
  return description ? `${title}\n${description}` : title
}

/**
 * Builds the full play-session walkthrough as a chat transcript: Start intro,
 * each played node's prompt, the player's outcome per node, and the End message.
 * Pure — derives everything from the graph plus the recorded session results.
 */
export function buildPlaySessionChatHistory(
  nodes: Node[],
  edges: Edge[],
  resultsByNode: SessionResultsByNode,
  nodeChatHistories?: NodeChatHistoriesByNodeId,
): GamePlayChatMessage[] {
  const time = new Date().toISOString()
  const path = getSessionPath(nodes, edges, resultsByNode)
  const messages: GamePlayChatMessage[] = []

  if (path.startNode) {
    messages.push({
      id: `${path.startNode.id}-intro`,
      direction: 'incoming',
      text: toPromptText(path.startNode),
      nodeId: path.startNode.id,
      time,
    })
  }

  for (const node of path.pathNodes) {
    const result = resultsByNode[node.id]
    if (!result || result.played === false) continue

    const nodeChat = nodeChatHistories?.[node.id]
    if (nodeChat?.length) {
      messages.push(...nodeChat)
      continue
    }

    messages.push({
      id: `${node.id}-prompt`,
      direction: 'incoming',
      text: toPromptText(node),
      nodeId: node.id,
      time,
    })

    messages.push({
      id: `${node.id}-answer`,
      direction: 'receiving',
      text: result.outcome === 'correct' ? 'Correct' : 'Wrong',
      nodeId: node.id,
      score: result.score,
      maxScore: resolveGameplayNodeMaxPoints(node),
      time,
    })
  }

  if (path.endNode) {
    messages.push({
      id: `${path.endNode.id}-end`,
      direction: 'incoming',
      text: getNodeTitle(path.endNode),
      nodeId: path.endNode.id,
      time,
    })
  }

  return messages
}
