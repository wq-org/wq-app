'use client'

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Edge, Node } from '@xyflow/react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'

import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'

import { getFlowGraphNodeDisplayLabel } from '../../constants/flowGraphNodeTypes'
import { getRegistryEntry } from '../_registry/GameNodeRegistry'
import type { GameIfElseNodeData } from './game-if-else.schema'
import {
  getIncomingGameplayNode,
  getOutgoingBranchNode,
  resolveIfElseBranchFromScore,
} from './game-if-else.utils'

export type GameIfElsePreviewProps = {
  nodeId: string
  nodeData: GameIfElseNodeData
  flowNodes?: Node[]
  flowEdges?: Edge[]
}

export function GameIfElsePreview({
  nodeId,
  nodeData,
  flowNodes = [],
  flowEdges = [],
}: GameIfElsePreviewProps) {
  const { t } = useTranslation('features.gameStudio')
  const [sessionScore, setSessionScore] = useState<number | null>(null)

  const incomingNode = useMemo(
    () => getIncomingGameplayNode(nodeId, flowNodes, flowEdges),
    [flowEdges, flowNodes, nodeId],
  )

  const scoreThreshold =
    typeof nodeData.scoreThreshold === 'number' && Number.isFinite(nodeData.scoreThreshold)
      ? Math.max(0, Math.floor(nodeData.scoreThreshold))
      : 0

  const branch =
    sessionScore === null ? null : resolveIfElseBranchFromScore(sessionScore, scoreThreshold)

  const branchANode = useMemo(
    () => getOutgoingBranchNode(nodeId, 'A', flowNodes, flowEdges),
    [flowEdges, flowNodes, nodeId],
  )
  const branchBNode = useMemo(
    () => getOutgoingBranchNode(nodeId, 'B', flowNodes, flowEdges),
    [flowEdges, flowNodes, nodeId],
  )

  const incomingEntry = incomingNode?.type ? getRegistryEntry(incomingNode.type) : undefined
  const IncomingPreview = incomingEntry?.PreviewComponent ?? null
  const incomingLabel = incomingNode
    ? getFlowGraphNodeDisplayLabel(
        incomingNode.type,
        (incomingNode.data ?? {}) as Record<string, unknown>,
      )
    : ''

  const activeTarget = branch === 'A' ? branchANode : branch === 'B' ? branchBNode : undefined
  const activeTargetLabel = activeTarget
    ? getFlowGraphNodeDisplayLabel(activeTarget.nodeType, {})
    : t('ifElsePreview.branchNotConnected')

  return (
    <div className="flex flex-col gap-4">
      <Text
        as="p"
        bold
      >
        {t('ifElsePreview.title')}
      </Text>
      <Text
        as="p"
        variant="small"
        muted
      >
        {t('ifElsePreview.playIncomingHint')}
      </Text>

      {!incomingNode || !IncomingPreview ? (
        <Text
          as="p"
          variant="small"
          className="text-amber-700 dark:text-amber-400"
        >
          {t('ifElsePreview.noIncoming')}
        </Text>
      ) : (
        <>
          <Text
            as="p"
            variant="small"
            bold
          >
            {incomingLabel}
          </Text>
          <div className="h-[50vh] min-h-[20rem] rounded-xl border bg-muted/20">
            <IncomingPreview
              nodeId={incomingNode.id}
              nodeData={(incomingNode.data ?? {}) as Record<string, unknown>}
              onSessionScoreChange={setSessionScore}
            />
          </div>
        </>
      )}

      {sessionScore !== null ? (
        <div className="flex flex-col gap-3 rounded-xl border bg-card p-4">
          <Text
            as="p"
            variant="small"
          >
            {t('ifElsePreview.yourScore', { score: sessionScore })}
          </Text>
          <Text
            as="p"
            variant="small"
            muted
          >
            {t('ifElsePreview.threshold', { value: scoreThreshold })}
          </Text>

          <div
            className={cn(
              'flex items-start gap-3 rounded-lg border p-3',
              branch === 'A'
                ? 'border-lime-500/40 bg-lime-500/10'
                : 'border-muted bg-muted/30 opacity-60',
            )}
          >
            <ArrowUpRight className="mt-0.5 size-5 shrink-0 text-lime-600" />
            <div className="flex min-w-0 flex-col gap-0.5">
              <Text
                as="p"
                variant="small"
                bold
              >
                {t('ifElsePreview.branchResultA')}
              </Text>
              {branch === 'A' ? (
                <Text
                  as="p"
                  variant="small"
                >
                  {t('ifElsePreview.routesTo', { node: activeTargetLabel })}
                </Text>
              ) : null}
            </div>
          </div>

          <div
            className={cn(
              'flex items-start gap-3 rounded-lg border p-3',
              branch === 'B'
                ? 'border-pink-500/40 bg-pink-500/10'
                : 'border-muted bg-muted/30 opacity-60',
            )}
          >
            <ArrowDownRight className="mt-0.5 size-5 shrink-0 text-pink-600" />
            <div className="flex min-w-0 flex-col gap-0.5">
              <Text
                as="p"
                variant="small"
                bold
              >
                {t('ifElsePreview.branchResultB')}
              </Text>
              {branch === 'B' ? (
                <Text
                  as="p"
                  variant="small"
                >
                  {t('ifElsePreview.routesTo', { node: activeTargetLabel })}
                </Text>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
