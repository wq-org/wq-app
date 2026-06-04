'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Edge, Node } from '@xyflow/react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Text } from '@/components/ui/text'

import { getFlowGraphNodeDisplayLabel } from '../../constants/flowGraphNodeTypes'
import type { GameImagePinNodeData } from '../game-image-pin/image-pin.schema'
import { isImagePinPreviewPlayable } from '../game-image-pin/utils/imagePinPreviewPlayable'
import type { GameIfElseCorrectPath } from './game-if-else.schema'
import type { GameIfElseNodeData } from './game-if-else.schema'
import {
  getIncomingGameplayNode,
  getOutgoingBranchNode,
  resolveIfElseBranchFromScore,
} from './game-if-else.utils'
import { IfElseBranchDivider } from './IfElseBranchDivider'
import { IfElseEmbeddedNodePreview } from './IfElseEmbeddedNodePreview'
import { IfElsePreviewSegmentAnchor } from './IfElsePreviewSegmentAnchor'
import { IfElsePreviewSessionShell } from './IfElsePreviewSessionShell'

export type GameIfElsePreviewProps = {
  nodeId: string
  nodeData: GameIfElseNodeData
  flowNodes?: Node[]
  flowEdges?: Edge[]
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
}: GameIfElsePreviewProps) {
  const { t } = useTranslation('features.gameStudio')
  const [branchResult, setBranchResult] = useState<BranchResult | null>(null)
  const [incomingPlayKey, setIncomingPlayKey] = useState(0)
  const [branchPlayKey, setBranchPlayKey] = useState(0)
  const incomingCompleteRef = useRef(false)

  const incomingNode = useMemo(
    () => getIncomingGameplayNode(nodeId, flowNodes, flowEdges),
    [flowEdges, flowNodes, nodeId],
  )

  const scoreThreshold =
    typeof nodeData.scoreThreshold === 'number' && Number.isFinite(nodeData.scoreThreshold)
      ? Math.max(0, Math.floor(nodeData.scoreThreshold))
      : 0

  const incomingNodeId = incomingNode?.id ?? ''
  const resetKey = `${incomingNodeId}:${scoreThreshold}`

  useEffect(() => {
    setBranchResult(null)
    incomingCompleteRef.current = false
    setIncomingPlayKey((key) => key + 1)
    setBranchPlayKey(0)
  }, [resetKey, nodeId])

  const handleIncomingComplete = useCallback(
    (payload: { score: number }) => {
      if (incomingCompleteRef.current) return
      incomingCompleteRef.current = true
      const branch = resolveIfElseBranchFromScore(payload.score, scoreThreshold)
      setBranchResult({ branch, score: payload.score })
      setBranchPlayKey((key) => key + 1)
    },
    [scoreThreshold],
  )

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

  const incomingSessionActive = branchResult === null
  const branchSessionActive = branchResult !== null

  const hint = (
    <Text
      as="p"
      variant="small"
      muted
      className="shrink-0"
    >
      {t('ifElsePreview.playIncomingHint')}
    </Text>
  )

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

  return (
    <IfElsePreviewSessionShell
      header={hint}
      className="min-h-[28rem] flex-1"
    >
      <IfElseEmbeddedNodePreview
        flowNode={incomingNode}
        sessionActive={incomingSessionActive}
        playKey={String(incomingPlayKey)}
        missingLabel={t('ifElsePreview.noIncoming')}
        onSessionComplete={handleIncomingComplete}
      />

      {branchResult ? (
        <IfElsePreviewSegmentAnchor
          segmentKey={`branch-routing-${branchResult.branch}-${branchResult.score}`}
          className="gap-6"
        >
          <IfElseBranchDivider
            score={branchResult.score}
            threshold={scoreThreshold}
            nextNodeLabel={branchNodeLabel}
          />
          {branchFlowNode && branchSegmentKey ? (
            <IfElsePreviewSegmentAnchor segmentKey={branchSegmentKey}>
              {branchGameplayReady ? (
                <>
                  <Text
                    as="p"
                    variant="small"
                    bold
                  >
                    {branchResult.branch === 'A'
                      ? t('ifElseSettings.branchA')
                      : t('ifElseSettings.branchB')}
                    {branchNodeLabel ? ` · ${branchNodeLabel}` : null}
                  </Text>
                  <IfElseEmbeddedNodePreview
                    flowNode={branchFlowNode}
                    sessionActive={branchSessionActive}
                    playKey={`${branchResult.branch}-${branchPlayKey}`}
                    missingLabel={t('ifElsePreview.branchNotConnected')}
                  />
                </>
              ) : (
                <Alert
                  variant="destructive"
                  className="border-amber-200 bg-amber-50/70 dark:border-amber-900/50 dark:bg-amber-950/40"
                >
                  <AlertTitle>
                    {branchResult.branch === 'A'
                      ? t('ifElseSettings.branchA')
                      : t('ifElseSettings.branchB')}
                    {branchNodeLabel ? ` · ${branchNodeLabel}` : null}
                  </AlertTitle>
                  <AlertDescription>
                    <p>{t('ifElsePreview.branchGameplayNotReady')}</p>
                  </AlertDescription>
                </Alert>
              )}
            </IfElsePreviewSegmentAnchor>
          ) : null}
        </IfElsePreviewSegmentAnchor>
      ) : null}
    </IfElsePreviewSessionShell>
  )
}
