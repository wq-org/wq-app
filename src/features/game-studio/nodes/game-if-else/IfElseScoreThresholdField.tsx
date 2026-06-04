'use client'

import { useCallback, useEffect } from 'react'
import { Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Edge, Node } from '@xyflow/react'

import { QuantityStepper } from '@/components/shared'
import { Button } from '@/components/ui/button'
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

function isScoreThresholdMissing(nodeData: GameIfElseNodeData): boolean {
  return typeof nodeData.scoreThreshold !== 'number' || !Number.isFinite(nodeData.scoreThreshold)
}

export function IfElseScoreThresholdField({
  nodeId,
  nodeData,
  flowNodes,
  flowEdges,
  onPatchNodeData,
}: IfElseScoreThresholdFieldProps) {
  const { t } = useTranslation('features.gameStudio')

  const incomingNode = getIncomingGameplayNode(nodeId, flowNodes, flowEdges)
  const incomingMaxPoints = resolveGameplayNodeMaxPoints(incomingNode)
  const smartSetThreshold = getDefaultIfElseScoreThreshold(incomingMaxPoints)

  const storedThreshold = nodeData.scoreThreshold
  const scoreThreshold =
    typeof storedThreshold === 'number' && Number.isFinite(storedThreshold)
      ? Math.max(0, Math.floor(storedThreshold))
      : 0

  useEffect(() => {
    if (!incomingNode || !isScoreThresholdMissing(nodeData)) return
    onPatchNodeData({ scoreThreshold: smartSetThreshold })
  }, [incomingNode, nodeId, nodeData.scoreThreshold, onPatchNodeData, smartSetThreshold])

  const handleThresholdChange = useCallback(
    (value: number) => {
      const next = Math.max(0, Math.floor(value))
      if (next === scoreThreshold) return
      onPatchNodeData({ scoreThreshold: next })
    },
    [onPatchNodeData, scoreThreshold],
  )

  const handleSmartSet = useCallback(() => {
    if (!incomingNode) return
    onPatchNodeData({ scoreThreshold: smartSetThreshold })
  }, [incomingNode, onPatchNodeData, smartSetThreshold])

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

      <div className="flex flex-wrap items-center gap-3">
        <Label className="shrink-0">{t('ifElseSettings.scoreThresholdLabel')}</Label>
        <QuantityStepper
          className="w-44 shrink-0"
          value={scoreThreshold}
          min={0}
          max={thresholdMax}
          step={1}
          disabled={!incomingNode}
          onChange={handleThresholdChange}
          label={t('ifElseSettings.scoreThresholdValueLabel')}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!incomingNode}
          onClick={handleSmartSet}
        >
          <Sparkles
            className="size-4"
            aria-hidden
          />
          {t('ifElseSettings.smartSet')}
        </Button>
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
