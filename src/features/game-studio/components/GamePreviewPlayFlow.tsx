'use client'

import { Fragment, useEffect, useMemo, useRef } from 'react'
import { Flag } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Edge, Node } from '@xyflow/react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'

import { getIncomingGameplayNode } from '../nodes/game-if-else/game-if-else.utils'
import { GameIfElsePreview } from '../nodes/game-if-else/GameIfElsePreview'
import type { GameIfElseNodeData } from '../nodes/game-if-else/game-if-else.schema'
import { IfElseEmbeddedNodePreview } from '../nodes/game-if-else/IfElseEmbeddedNodePreview'
import type { SessionResultsByNode } from '../utils/flowOrder'
import {
  buildPlaySessionChatHistory,
  type GamePlayChatMessage,
  type NodeChatHistoriesByNodeId,
} from '../utils/buildPlaySessionChatHistory'
import { GamePreviewSegmentAnchor } from './game-preview-session/GamePreviewSegmentAnchor'
import { GamePreviewSessionShell } from './game-preview-session/GamePreviewSessionShell'
import { useGamePreviewPlaySession } from './useGamePreviewPlaySession'

export type GamePlaySessionResult = {
  score: number
  maxScore: number
  resultsByNode: SessionResultsByNode
  chatHistory: GamePlayChatMessage[]
  nodeChatHistories: NodeChatHistoriesByNodeId
}

export type GamePlaySessionSnapshot = {
  score: number
  maxScore: number
  resultsByNode: SessionResultsByNode
  nodeChatHistories: NodeChatHistoriesByNodeId
  isComplete: boolean
}

export type GamePreviewPlayFlowProps = {
  nodes: Node[]
  edges: Edge[]
  sessionMaxScore: number
  /** Fired once when the session reaches the End node. Absent = pure in-memory preview. */
  onSessionComplete?: (result: GamePlaySessionResult) => void
  /** Live session state for leave/save guards. */
  onSessionSnapshot?: (snapshot: GamePlaySessionSnapshot) => void
}

export function GamePreviewPlayFlow({
  nodes,
  edges,
  sessionMaxScore,
  onSessionComplete,
  onSessionSnapshot,
}: GamePreviewPlayFlowProps) {
  const { t } = useTranslation('features.gameStudio')
  const {
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
  } = useGamePreviewPlaySession({ nodes, edges })

  const completedScoreBaseline = useMemo(
    () => Object.values(resultsByNode).reduce((sum, row) => sum + row.score, 0),
    [resultsByNode],
  )

  const liveScore = cumulativeScore > 0 ? cumulativeScore : completedScoreBaseline

  useEffect(() => {
    onSessionSnapshot?.({
      score: liveScore,
      maxScore: sessionMaxScore,
      resultsByNode,
      nodeChatHistories,
      isComplete,
    })
  }, [isComplete, liveScore, nodeChatHistories, onSessionSnapshot, resultsByNode, sessionMaxScore])

  const hasFiredCompleteRef = useRef(false)

  useEffect(() => {
    if (!isComplete || hasFiredCompleteRef.current || !onSessionComplete) return
    hasFiredCompleteRef.current = true
    onSessionComplete({
      score: completedScoreBaseline,
      maxScore: sessionMaxScore,
      resultsByNode,
      nodeChatHistories,
      chatHistory: buildPlaySessionChatHistory(nodes, edges, resultsByNode, nodeChatHistories),
    })
  }, [
    isComplete,
    onSessionComplete,
    completedScoreBaseline,
    sessionMaxScore,
    resultsByNode,
    nodeChatHistories,
    nodes,
    edges,
  ])

  if (!hasPlayableGraph) {
    return (
      <Alert variant="destructive">
        <AlertTitle>{t('previewDrawer.title')}</AlertTitle>
        <AlertDescription>
          <p>{t('previewDrawer.emptyHint')}</p>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <GamePreviewSessionShell
      className="h-full min-h-0 flex-1"
      scrollContentClassName="pb-2"
    >
      {revealedSegments.map((segment, index) => {
        const isActive = activeSegmentId === segment.id
        const validationErrors = getSegmentValidationErrors(segment.node)
        const showSeparator = index > 0
        const segmentBaseline = completedScoreBaseline

        const incomingForIfElse = getIncomingGameplayNode(segment.node.id, nodes, edges)
        const seededIncomingScore =
          segment.kind === 'ifElse' && incomingForIfElse && resultsByNode[incomingForIfElse.id]
            ? resultsByNode[incomingForIfElse.id].score
            : undefined

        return (
          <Fragment key={segment.id}>
            {showSeparator ? <Separator className="my-1" /> : null}
            <GamePreviewSegmentAnchor
              segmentKey={`play-${segment.id}-${index}`}
              enabled={isActive || isComplete}
            >
              {validationErrors.length > 0 ? (
                <Alert
                  variant="destructive"
                  className="border-amber-200 bg-amber-50/70 dark:border-amber-900/50 dark:bg-amber-950/40"
                >
                  <AlertDescription>
                    <ul className="list-disc pl-4">
                      {validationErrors.map((error) => (
                        <li key={error}>
                          <Text
                            as="span"
                            variant="small"
                          >
                            {error}
                          </Text>
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              ) : segment.kind === 'ifElse' ? (
                <div className={cn('min-h-[20rem]', !isActive && 'opacity-90')}>
                  <GameIfElsePreview
                    nodeId={segment.node.id}
                    nodeData={(segment.node.data ?? {}) as GameIfElseNodeData}
                    flowNodes={nodes}
                    flowEdges={edges}
                    playMode="flow"
                    seededIncomingScore={seededIncomingScore}
                    sessionScoreBaseline={segmentBaseline}
                    sessionMaxScore={sessionMaxScore}
                    onSessionScoreChange={isActive ? handleSessionScoreChange : undefined}
                    onFlowComplete={
                      isActive
                        ? (payload) =>
                            handleSegmentComplete(segment.node.id, {
                              score: payload.score,
                              ifElseBranch: payload.branch,
                              isTotalScore: true,
                            })
                        : undefined
                    }
                  />
                </div>
              ) : (
                <div className={cn('min-h-[20rem]', !isActive && 'opacity-90')}>
                  <IfElseEmbeddedNodePreview
                    flowNode={segment.node}
                    sessionActive={isActive}
                    playKey={segment.id}
                    missingLabel={t('previewDrawer.invalidNodeTitle')}
                    sessionScoreBaseline={segmentBaseline}
                    sessionMaxScore={sessionMaxScore}
                    onSessionComplete={
                      isActive
                        ? (payload) =>
                            handleSegmentComplete(segment.node.id, {
                              score: payload.score,
                              chatMessages: payload.chatMessages,
                            })
                        : undefined
                    }
                    onSessionScoreChange={isActive ? handleSessionScoreChange : undefined}
                  />
                </div>
              )}
            </GamePreviewSegmentAnchor>
          </Fragment>
        )
      })}

      {isComplete ? (
        <>
          <Separator className="my-1" />
          <section className="flex items-center gap-3 rounded-xl bg-muted/30 p-4">
            <Flag className="size-5 shrink-0 text-muted-foreground" />
            <div className="flex flex-col gap-0.5">
              <Text
                as="p"
                variant="small"
                bold
              >
                {t('previewDrawer.completeTitle')}
              </Text>
              <Text
                as="p"
                variant="small"
                muted
              >
                {t('previewDrawer.completeHint')}
              </Text>
            </div>
          </section>
        </>
      ) : null}
    </GamePreviewSessionShell>
  )
}
