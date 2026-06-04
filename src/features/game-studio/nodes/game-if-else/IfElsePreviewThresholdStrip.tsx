'use client'

import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { Edge, Node } from '@xyflow/react'

import { Text } from '@/components/ui/text'

import type { GameIfElseNodeData } from './game-if-else.schema'
import {
  getIfElseBranchPointRanges,
  getIncomingGameplayNode,
  resolveGameplayNodeMaxPoints,
} from './game-if-else.utils'

export type IfElsePreviewThresholdStripProps = {
  nodeId: string
  nodeData: GameIfElseNodeData
  flowNodes: Node[]
  flowEdges: Edge[]
}

export function IfElsePreviewThresholdStrip({
  nodeId,
  nodeData,
  flowNodes,
  flowEdges,
}: IfElsePreviewThresholdStripProps) {
  const { t } = useTranslation('features.gameStudio')

  const incomingNode = useMemo(
    () => getIncomingGameplayNode(nodeId, flowNodes, flowEdges),
    [flowEdges, flowNodes, nodeId],
  )
  const incomingMaxPoints = useMemo(
    () => resolveGameplayNodeMaxPoints(incomingNode),
    [incomingNode],
  )

  const scoreThreshold =
    typeof nodeData.scoreThreshold === 'number' && Number.isFinite(nodeData.scoreThreshold)
      ? Math.max(0, Math.floor(nodeData.scoreThreshold))
      : 0

  const { branchA, branchB } = useMemo(
    () => getIfElseBranchPointRanges(scoreThreshold, incomingMaxPoints),
    [incomingMaxPoints, scoreThreshold],
  )

  const formatRange = (range: { min: number; max: number } | null) => {
    if (!range) return null
    if (range.min === range.max) {
      return t('ifElseSettings.branchPointsSingle', { points: range.min })
    }
    return t('ifElseSettings.branchPointsRange', { min: range.min, max: range.max })
  }

  const branchARangeLabel = formatRange(branchA)
  const branchBRangeLabel = formatRange(branchB)

  if (!incomingNode) {
    return (
      <Text
        as="p"
        variant="small"
        className="text-amber-700 dark:text-amber-400"
      >
        {t('ifElseSettings.noIncomingGameplay')}
      </Text>
    )
  }

  return (
    <div className="flex flex-col gap-1.5 rounded-lg border bg-muted/30 px-3 py-2.5">
      <Text
        as="p"
        variant="small"
        muted
      >
        {t('ifElsePreview.thresholdStripMax', { points: incomingMaxPoints })}
      </Text>
      <Text
        as="p"
        variant="small"
      >
        {t('ifElsePreview.thresholdStripValue', { value: scoreThreshold })}
      </Text>
      <Text
        as="p"
        variant="small"
        muted
        className="leading-snug"
      >
        {t('ifElseSettings.scoreThresholdHint')}
      </Text>
      {branchARangeLabel || branchBRangeLabel ? (
        <div className="flex flex-wrap gap-x-4 gap-y-0.5 pt-0.5">
          {branchARangeLabel ? (
            <Text
              as="p"
              variant="small"
              muted
              className="tabular-nums"
            >
              {t('ifElsePreview.thresholdStripBranchA', { range: branchARangeLabel })}
            </Text>
          ) : null}
          {branchBRangeLabel ? (
            <Text
              as="p"
              variant="small"
              muted
              className="tabular-nums"
            >
              {t('ifElsePreview.thresholdStripBranchB', { range: branchBRangeLabel })}
            </Text>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
