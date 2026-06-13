import type { GamePlayChatMessage } from '@/features/game-studio'

export type AttemptNodeBreakdown = {
  nodeId: string
  /** Registry node type (e.g. `gameImagePin`), derived from the node id — drives the icon. */
  nodeType: string
  /** First line of the node prompt — used as the jump-button tooltip. */
  label: string
  /** Message id of the node's prompt bubble, used to scroll the chat to this node. */
  messageId: string
  score: number
  maxScore: number
}

function firstLine(text: string, fallback: string): string {
  const line = text.split('\n')[0]?.trim()
  return line ? line : fallback
}

/** Node ids are `<type>-<timestamp>`; strip the trailing numeric suffix to get the registry type. */
function nodeTypeFromId(nodeId: string): string {
  return nodeId.replace(/-\d+$/, '')
}

/**
 * Derives the chronological list of scored nodes for one attempt from its stored chat
 * transcript. A node counts as a scored component when the player produced an answer
 * (a `receiving` message); the matching `incoming` prompt supplies the label and the
 * scroll target. Start/End prompts (no answer) are excluded. Pure.
 */
export function buildAttemptNodeBreakdown(
  messages: readonly GamePlayChatMessage[],
): AttemptNodeBreakdown[] {
  const order: string[] = []
  const byNode = new Map<string, AttemptNodeBreakdown & { answered: boolean }>()

  for (const message of messages) {
    const { nodeId } = message
    if (!nodeId) continue

    let entry = byNode.get(nodeId)
    if (!entry) {
      entry = {
        nodeId,
        nodeType: nodeTypeFromId(nodeId),
        label: firstLine(message.text, nodeId),
        messageId: message.id,
        score: 0,
        maxScore: 0,
        answered: false,
      }
      byNode.set(nodeId, entry)
      order.push(nodeId)
    }

    if (message.direction === 'incoming') {
      entry.label = firstLine(message.text, nodeId)
      entry.messageId = message.id
    } else {
      entry.answered = true
      if (typeof message.score === 'number') entry.score = message.score
      if (typeof message.maxScore === 'number') entry.maxScore = message.maxScore
    }
  }

  return order
    .map((nodeId) => byNode.get(nodeId)!)
    .filter((entry) => entry.answered)
    .map(({ nodeId, nodeType, label, messageId, score, maxScore }) => ({
      nodeId,
      nodeType,
      label,
      messageId,
      score,
      maxScore,
    }))
}
