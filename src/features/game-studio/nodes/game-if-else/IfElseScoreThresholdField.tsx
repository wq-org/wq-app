'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { Edge, Node } from '@xyflow/react'

import { QuantityStepper } from '@/components/shared'
import { Label } from '@/components/ui/label'
import { Text } from '@/components/ui/text'

import type { GameIfElseNodeData } from './game-if-else.schema'
import {
  getDefaultIfElseScoreThreshold,
  getIncomingGameplayNode,
  resolveGameplayNodeMaxPoints,
} from './game-if-else.utils'

export type IfElseScoreThresholdFieldProps = {
  nodeId: string
  nodeData: GameIfElseNodeData
  flowNodes: Node[]
  flowEdges: Edge[]
  onPatchNodeData: (patch: Partial<GameIfElseNodeData>) => void
}

export function IfElseScoreThresholdField({
  nodeId,
  nodeData,
  flowNodes,
  flowEdges,
  onPatchNodeData,
}: IfElseScoreThresholdFieldProps) {
  const { t } = useTranslation('features.gameStudio')
  const defaultsAppliedRef = useRef(false)

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

  useEffect(() => {
    if (defaultsAppliedRef.current) return
    if (typeof nodeData.scoreThreshold === 'number' && Number.isFinite(nodeData.scoreThreshold)) {
      defaultsAppliedRef.current = true
      return
    }
    defaultsAppliedRef.current = true
    onPatchNodeData({ scoreThreshold: getDefaultIfElseScoreThreshold(incomingMaxPoints) })
  }, [incomingMaxPoints, nodeData.scoreThreshold, onPatchNodeData])

  function handleThresholdChange(value: number) {
    const next = Math.max(0, Math.floor(value))
    if (next === scoreThreshold) return
    onPatchNodeData({ scoreThreshold: next })
  }

  const thresholdMax = Math.max(incomingMaxPoints, scoreThreshold, 999)

  return (
    <div className="flex flex-col gap-3">
      {!incomingNode ? (
        <Text
          as="p"
          variant="small"
          className="text-amber-700 dark:text-amber-400"
        >
          {t('ifElseSettings.noIncomingGameplay')}
        </Text>
      ) : (
        <Text
          as="p"
          variant="small"
          muted
        >
          {t('ifElseSettings.incomingMaxPoints', { points: incomingMaxPoints })}
        </Text>
      )}

      <div className="flex items-center gap-4">
        <Label className="shrink-0">{t('ifElseSettings.scoreThresholdLabel')}</Label>
        <QuantityStepper
          className="w-44 shrink-0"
          value={scoreThreshold}
          min={0}
          max={thresholdMax}
          step={1}
          disabled={!incomingNode}
          onChange={handleThresholdChange}
          label={t('ifElseSettings.scoreThresholdLabel')}
        />
      </div>

      <Text
        as="p"
        variant="small"
        muted
        className="leading-snug"
      >
        {t('ifElseSettings.scoreThresholdHint')}
      </Text>
    </div>
  )
}
