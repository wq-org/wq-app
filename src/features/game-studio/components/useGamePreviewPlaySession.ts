'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Edge, Node } from '@xyflow/react'

import { getRegistryEntry } from '../nodes/_registry/GameNodeRegistry'
import { formatPublishIssueFallback } from '../utils/formatPublishIssue'
import { resolveGameplayNodeMaxPoints } from '../nodes/game-if-else/game-if-else.utils'
import { GAME_START_TYPE } from '../nodes/game-start/game-start.schema'
import type { SessionResultsByNode } from '../utils/flowOrder'
import type {
  NodeChatHistoriesByNodeId,
  GamePlayChatMessage,
} from '../utils/buildPlaySessionChatHistory'
import {
  getFirstPlayPreviewSegment,
  resolveNextPlayPreviewSegment,
  toSessionNodeResult,
  type PlayPreviewSegment,
} from './resolvePlayPreviewAdvance'

export type UseGamePreviewPlaySessionArgs = {
  nodes: Node[]
  edges: Edge[]
}

/**
 * In-memory full-game preview session. Does not persist scores or patch canvas data.
 */
export function useGamePreviewPlaySession({ nodes, edges }: UseGamePreviewPlaySessionArgs) {
  const graphKey = useMemo(
    () => `${nodes.map((n) => n.id).join(',')}:${edges.map((e) => e.id).join(',')}`,
    [edges, nodes],
  )

  const [revealedSegments, setRevealedSegments] = useState<PlayPreviewSegment[]>([])
  const [resultsByNode, setResultsByNode] = useState<SessionResultsByNode>({})
  const [nodeChatHistories, setNodeChatHistories] = useState<NodeChatHistoriesByNodeId>({})
  const [cumulativeScore, setCumulativeScore] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    const first = getFirstPlayPreviewSegment(nodes, edges)
    setRevealedSegments(first ? [first] : [])
    setResultsByNode({})
    setNodeChatHistories({})
    setCumulativeScore(0)
    setIsComplete(false)
  }, [graphKey, nodes, edges])

  const startNode = useMemo(() => nodes.find((n) => n.type === GAME_START_TYPE) ?? null, [nodes])

  const activeSegmentId = useMemo(() => {
    if (isComplete) return null
    for (let i = revealedSegments.length - 1; i >= 0; i--) {
      const seg = revealedSegments[i]
      if (!(seg.id in resultsByNode)) return seg.id
    }
    return null
  }, [isComplete, revealedSegments, resultsByNode])

  const hasPlayableGraph =
    revealedSegments.length > 0 || getFirstPlayPreviewSegment(nodes, edges) !== null

  const revealNext = useCallback(
    (completedId: string, nextResults: SessionResultsByNode) => {
      const next = resolveNextPlayPreviewSegment(completedId, nodes, edges, nextResults)
      if (next === 'end' || next === null) {
        setIsComplete(true)
        return
      }
      setRevealedSegments((prev) => {
        if (prev.some((s) => s.id === next.id)) return prev
        return [...prev, next]
      })
    },
    [edges, nodes],
  )

  const handleSegmentComplete = useCallback(
    (
      nodeId: string,
      payload: {
        score: number
        ifElseBranch?: 'A' | 'B'
        isTotalScore?: boolean
        chatMessages?: GamePlayChatMessage[]
      },
    ) => {
      const node = nodes.find((n) => n.id === nodeId)
      if (!node) return

      const priorTotal = Object.values(resultsByNode).reduce((sum, row) => sum + row.score, 0)
      const sessionTotal = payload.isTotalScore ? payload.score : priorTotal + payload.score
      const nodeScore = payload.isTotalScore ? sessionTotal - priorTotal : payload.score

      const maxPoints = resolveGameplayNodeMaxPoints(node)
      const result = toSessionNodeResult(nodeScore, maxPoints, payload.ifElseBranch)
      const nextResults = { ...resultsByNode, [nodeId]: result }
      setResultsByNode(nextResults)
      if (payload.chatMessages?.length) {
        setNodeChatHistories((prev) => ({ ...prev, [nodeId]: payload.chatMessages! }))
      }
      setCumulativeScore(sessionTotal)
      revealNext(nodeId, nextResults)
    },
    [nodes, resultsByNode, revealNext],
  )

  const handleSessionScoreChange = useCallback((totalScore: number) => {
    setCumulativeScore(totalScore)
  }, [])

  const getSegmentValidationErrors = useCallback((node: Node): string[] => {
    const entry = node.type ? getRegistryEntry(node.type) : null
    const issues = entry?.validateConfig(node.data) ?? []
    return issues.filter((i) => i.severity === 'error').map((i) => formatPublishIssueFallback(i))
  }, [])

  return {
    startNode,
    revealedSegments,
    resultsByNode,
    nodeChatHistories,
    cumulativeScore,
    isComplete,
    activeSegmentId,
    hasPlayableGraph,
    handleSegmentComplete,
    handleSessionScoreChange,
    getSegmentValidationErrors,
  }
}
