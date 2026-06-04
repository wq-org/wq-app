'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Edge, Node } from '@xyflow/react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Text } from '@/components/ui/text'

import { getFlowGraphNodeDisplayLabel } from '../../constants/flowGraphNodeTypes'
import type { GameImagePinNodeData } from '../game-image-pin/image-pin.schema'
import { isImagePinPreviewPlayable } from '../game-image-pin/utils/imagePinPreviewPlayable'
import type { GameIfElseCorrectPath } from './game-if-else.schema'
import type { GameIfElseNodeData } from './game-if-else.schema'
import {
  getIfElseRoutingScoreContribution,
  getIncomingGameplayNode,
  getOutgoingBranchNode,
  resolveIfElseBranchFromScore,
} from './game-if-else.utils'
import { IfElseBranchDivider } from './IfElseBranchDivider'
import { IfElseEmbeddedNodePreview } from './IfElseEmbeddedNodePreview'
import { IfElsePreviewSegmentAnchor } from './IfElsePreviewSegmentAnchor'
import { IfElsePreviewSessionShell } from './IfElsePreviewSessionShell'

export type GameIfElsePreviewPlayMode = 'dialog' | 'flow'

export type GameIfElsePreviewProps = {
  nodeId: string
  nodeData: GameIfElseNodeData
  flowNodes?: Node[]
  flowEdges?: Edge[]
  /** Dialog preview shows routing hints; full-game flow shows gameplay only. */
  playMode?: GameIfElsePreviewPlayMode
  /** Skip replaying incoming when score is already known (full-game preview). */
  seededIncomingScore?: number
  sessionScoreBaseline?: number
  sessionMaxScore?: number
  onSessionScoreChange?: (score: number) => void
  /** Fired when branch gameplay finishes (full-game advance). */
  onFlowComplete?: (payload: { score: number; branch: GameIfElseCorrectPath }) => void
}

type BranchResult = {
  branch: GameIfElseCorrectPath
  score: number
}

export function GameIfElsePreview({
  nodeId,
  nodeData,
  flowNodes = [],
  flowEdges = [],
  playMode = 'dialog',
  seededIncomingScore,
  sessionScoreBaseline = 0,
  sessionMaxScore,
  onSessionScoreChange,
  onFlowComplete,
}: GameIfElsePreviewProps) {
  const { t } = useTranslation('features.gameStudio')
  const isFlowPlay = playMode === 'flow'
  const scoreThreshold =
    typeof nodeData.scoreThreshold === 'number' && Number.isFinite(nodeData.scoreThreshold)
      ? Math.max(0, Math.floor(nodeData.scoreThreshold))
      : 0

  const incomingNode = useMemo(
    () => getIncomingGameplayNode(nodeId, flowNodes, flowEdges),
    [flowEdges, flowNodes, nodeId],
  )

  const initialBranch = useMemo(() => {
    if (seededIncomingScore == null || !Number.isFinite(seededIncomingScore)) return null
    return {
      branch: resolveIfElseBranchFromScore(seededIncomingScore, scoreThreshold),
      score: seededIncomingScore,
    }
  }, [scoreThreshold, seededIncomingScore])

  const [branchResult, setBranchResult] = useState<BranchResult | null>(initialBranch)
  const [incomingPlayKey, setIncomingPlayKey] = useState(0)
  const [branchPlayKey, setBranchPlayKey] = useState(initialBranch ? 1 : 0)
  const incomingCompleteRef = useRef(initialBranch !== null)
  const flowCompleteReportedRef = useRef(false)
  const branchEarnedRef = useRef(0)

  const incomingNodeId = incomingNode?.id ?? ''
  const resetKey = `${incomingNodeId}:${scoreThreshold}:${seededIncomingScore ?? 'play'}`

  useEffect(() => {
    setBranchResult(initialBranch)
    incomingCompleteRef.current = initialBranch !== null
    flowCompleteReportedRef.current = false
    branchEarnedRef.current = 0
    setIncomingPlayKey((key) => key + 1)
    setBranchPlayKey(initialBranch ? 1 : 0)
  }, [initialBranch, resetKey, nodeId])

  const handleIncomingComplete = useCallback(
    (payload: { score: number }) => {
      if (incomingCompleteRef.current) return
      incomingCompleteRef.current = true
      const branch = resolveIfElseBranchFromScore(payload.score, scoreThreshold)
      setBranchResult({ branch, score: payload.score })
      setBranchPlayKey((key) => key + 1)
      onSessionScoreChange?.(sessionScoreBaseline + payload.score)
    },
    [onSessionScoreChange, scoreThreshold, sessionScoreBaseline],
  )

  const routingScore = branchResult?.score ?? 0
  const routingScoreContribution = getIfElseRoutingScoreContribution(
    routingScore,
    seededIncomingScore,
  )

  const handleBranchComplete = useCallback(
    (payload: { score: number }) => {
      if (flowCompleteReportedRef.current || !branchResult) return
      flowCompleteReportedRef.current = true
      branchEarnedRef.current = payload.score
      const total = sessionScoreBaseline + routingScoreContribution + payload.score
      onSessionScoreChange?.(total)
      onFlowComplete?.({ score: total, branch: branchResult.branch })
    },
    [
      branchResult,
      onFlowComplete,
      onSessionScoreChange,
      routingScoreContribution,
      sessionScoreBaseline,
    ],
  )

  const branchScoreBaseline = sessionScoreBaseline + routingScoreContribution

  const branchTarget = useMemo(() => {
    if (!branchResult) return undefined
    return getOutgoingBranchNode(nodeId, branchResult.branch, flowNodes, flowEdges)
  }, [branchResult, flowEdges, flowNodes, nodeId])

  const branchFlowNode = useMemo(() => {
    if (!branchTarget) return undefined
    return flowNodes.find((node) => node.id === branchTarget.id)
  }, [branchTarget, flowNodes])

  const branchNodeLabel = useMemo(() => {
    if (!branchFlowNode) return null
    return getFlowGraphNodeDisplayLabel(
      branchFlowNode.type,
      (branchFlowNode.data ?? {}) as Record<string, unknown>,
    )
  }, [branchFlowNode])

  const branchGameplayReady = useMemo(() => {
    if (!branchFlowNode) return false
    if (branchFlowNode.type !== 'gameImagePin') return true
    return isImagePinPreviewPlayable((branchFlowNode.data ?? {}) as GameImagePinNodeData)
  }, [branchFlowNode])

  const branchSegmentKey = branchFlowNode
    ? `${branchResult?.branch ?? ''}-${branchFlowNode.id}-${branchPlayKey}`
    : null

  const skipIncomingPlay = seededIncomingScore != null
  const incomingSessionActive = !skipIncomingPlay && branchResult === null
  const branchSessionActive = branchResult !== null && !flowCompleteReportedRef.current

  const hint = !isFlowPlay ? (
    <Text
      as="p"
      variant="small"
      muted
      className="shrink-0"
    >
      {t('ifElsePreview.playIncomingHint')}
    </Text>
  ) : null

  if (!incomingNode) {
    return (
      <div className="flex h-full min-h-0 flex-col gap-4">
        {hint}
        <Text
          as="p"
          variant="small"
          className="text-amber-700 dark:text-amber-400"
        >
          {t('ifElsePreview.noIncoming')}
        </Text>
      </div>
    )
  }

  const branchGameplay = branchResult ? (
    branchFlowNode && branchSegmentKey ? (
      <IfElsePreviewSegmentAnchor
        segmentKey={branchSegmentKey}
        enabled={branchSessionActive}
      >
        {branchGameplayReady ? (
          <IfElseEmbeddedNodePreview
            flowNode={branchFlowNode}
            sessionActive={branchSessionActive}
            playKey={`${branchResult.branch}-${branchPlayKey}`}
            missingLabel={t('ifElsePreview.branchNotConnected')}
            sessionScoreBaseline={branchScoreBaseline}
            sessionMaxScore={sessionMaxScore}
            onSessionComplete={handleBranchComplete}
            onSessionScoreChange={branchSessionActive ? onSessionScoreChange : undefined}
          />
        ) : (
          <Alert
            variant="destructive"
            className="border-amber-200 bg-amber-50/70 dark:border-amber-900/50 dark:bg-amber-950/40"
          >
            <AlertDescription>
              <p>{t('ifElsePreview.branchGameplayNotReady')}</p>
            </AlertDescription>
          </Alert>
        )}
      </IfElsePreviewSegmentAnchor>
    ) : isFlowPlay ? null : (
      <Text
        as="p"
        variant="small"
        className="text-amber-700 dark:text-amber-400"
      >
        {t('ifElsePreview.branchNotConnected')}
      </Text>
    )
  ) : null

  const playContent = (
    <>
      {!skipIncomingPlay ? (
        <IfElseEmbeddedNodePreview
          flowNode={incomingNode}
          sessionActive={incomingSessionActive}
          playKey={String(incomingPlayKey)}
          missingLabel={t('ifElsePreview.noIncoming')}
          sessionScoreBaseline={sessionScoreBaseline}
          sessionMaxScore={sessionMaxScore}
          onSessionComplete={handleIncomingComplete}
          onSessionScoreChange={incomingSessionActive ? onSessionScoreChange : undefined}
        />
      ) : null}

      {branchResult ? (
        isFlowPlay ? (
          branchGameplay
        ) : (
          <IfElsePreviewSegmentAnchor
            segmentKey={`branch-routing-${branchResult.branch}-${branchResult.score}`}
            className="gap-6"
          >
            <IfElseBranchDivider
              score={branchResult.score}
              threshold={scoreThreshold}
              nextNodeLabel={branchNodeLabel}
            />
            {branchGameplay}
          </IfElsePreviewSegmentAnchor>
        )
      ) : null}
    </>
  )

  if (isFlowPlay) {
    return <div className="flex min-h-0 flex-1 flex-col gap-3">{playContent}</div>
  }

  return (
    <IfElsePreviewSessionShell
      header={hint}
      className="min-h-[28rem] flex-1"
    >
      {playContent}
    </IfElsePreviewSessionShell>
  )
}
