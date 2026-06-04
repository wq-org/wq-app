'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { Edge, Node } from '@xyflow/react'
import { Calculator, MapPin, MessageCircleQuestion, Split, X, FileQuestionMark } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { HoldToDeleteButton } from '@/components/ui/HoldToDeleteButton'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Text } from '@/components/ui/text'
import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
  NumberFieldScrubArea,
} from '@/components/ui/number-field'
import { AnimatedBeamHub, BeamHubBadge } from '@/components/shared'
import { cn } from '@/lib/utils'

import type { GameIfElseNodeData } from './game-if-else.schema'
import {
  getDefaultIfElseScoreThreshold,
  getIncomingGameplayNode,
  getOutgoingBranchNode,
  resolveGameplayNodeMaxPoints,
} from './game-if-else.utils'
import { GameIfElsePreview } from './GameIfElsePreview'

const NODE_TYPE_ICONS: Record<string, LucideIcon> = {
  gameDragDropMath: Calculator,
  gameOpenQuestion: MessageCircleQuestion,
  gameImagePin: MapPin,
  gameIfElse: Split,
}

function getNodeIcon(type: string | undefined): LucideIcon {
  if (!type) return FileQuestionMark
  return NODE_TYPE_ICONS[type] ?? FileQuestionMark
}

type AdjacentNodeInfo = { id: string; nodeType: string | undefined }

export type GameIfElseSettingsProps = {
  nodeId: string
  onDelete: () => void
  onClose: () => void
  onNavigateToNode?: (nodeId: string) => void
  onPatchNodeData: (patch: Partial<GameIfElseNodeData>) => void
  nodeData: GameIfElseNodeData
  flowNodes?: Node[]
  flowEdges?: Edge[]
}

export function GameIfElseSettings({
  nodeId,
  onDelete,
  onClose,
  onNavigateToNode,
  onPatchNodeData,
  nodeData,
  flowNodes = [],
  flowEdges = [],
}: GameIfElseSettingsProps) {
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

  const branchANode = useMemo(
    () => getOutgoingBranchNode(nodeId, 'A', flowNodes, flowEdges),
    [flowEdges, flowNodes, nodeId],
  )
  const branchBNode = useMemo(
    () => getOutgoingBranchNode(nodeId, 'B', flowNodes, flowEdges),
    [flowEdges, flowNodes, nodeId],
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

  function handleThresholdChange(value: number | null) {
    const next = Math.max(0, Math.floor(value ?? 0))
    if (next === scoreThreshold) return
    onPatchNodeData({ scoreThreshold: next })
  }

  function handleNavigate(target: AdjacentNodeInfo) {
    onClose()
    onNavigateToNode?.(target.id)
  }

  const thresholdMax = Math.max(incomingMaxPoints, scoreThreshold, 999)

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <Text
        as="p"
        bold
      >
        {t('ifElseSettings.title')}
      </Text>

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

      <div className="flex flex-col gap-2">
        <Label htmlFor={`if-else-threshold-${nodeId}`}>
          {t('ifElseSettings.scoreThresholdLabel')}
        </Label>
        <NumberField
          id={`if-else-threshold-${nodeId}`}
          className="max-w-xs"
          value={scoreThreshold}
          onValueChange={handleThresholdChange}
          min={0}
          max={thresholdMax}
          step={1}
          disabled={!incomingNode}
        >
          <NumberFieldScrubArea label={t('ifElseSettings.scoreThresholdLabel')} />
          <NumberFieldGroup className="rounded-lg">
            <NumberFieldDecrement />
            <NumberFieldInput />
            <NumberFieldIncrement />
          </NumberFieldGroup>
        </NumberField>
        <Text
          as="p"
          variant="small"
          muted
        >
          {t('ifElseSettings.scoreThresholdHint')}
        </Text>
      </div>

      <Separator />

      <div className="w-full">
        <AnimatedBeamHub
          className="h-56 w-full"
          center={
            <BeamHubBadge
              Icon={Split}
              theme="orange"
            />
          }
          nodes={[
            {
              direction: 'left',
              content: (
                <BeamHubBadge
                  Icon={incomingNode ? getNodeIcon(incomingNode.type) : X}
                  theme="default"
                  onClick={
                    incomingNode
                      ? () => handleNavigate({ id: incomingNode.id, nodeType: incomingNode.type })
                      : undefined
                  }
                  className={!incomingNode ? 'text-red-500 border-red-500/20' : undefined}
                />
              ),
              gradientStartColor: 'darkblue',
              gradientStopColor: 'violet',
            },
            {
              direction: 'top-right',
              content: (
                <BeamHubBadge
                  Icon={branchANode ? getNodeIcon(branchANode.nodeType) : X}
                  theme="lime"
                  onClick={branchANode ? () => handleNavigate(branchANode) : undefined}
                  className={cn(!branchANode && 'text-red-500 border-red-500/20')}
                />
              ),
              gradientStartColor: 'lime',
              gradientStopColor: 'teal',
            },
            {
              direction: 'bottom-right',
              content: (
                <BeamHubBadge
                  Icon={branchBNode ? getNodeIcon(branchBNode.nodeType) : X}
                  theme="pink"
                  onClick={branchBNode ? () => handleNavigate(branchBNode) : undefined}
                  className={cn(!branchBNode && 'text-red-500 border-red-500/20')}
                />
              ),
              gradientStartColor: 'orange',
              gradientStopColor: 'pink',
              reverse: true,
            },
          ]}
        />
        <div className="mt-3 flex justify-between gap-4 px-2 text-center">
          <Text
            as="p"
            variant="small"
            muted
            className="max-w-[5rem]"
          >
            {t('ifElseSettings.branchIncoming')}
          </Text>
          <Text
            as="p"
            variant="small"
            muted
            className="max-w-[5rem]"
          >
            {t('ifElseSettings.branchA')}
          </Text>
          <Text
            as="p"
            variant="small"
            muted
            className="max-w-[5rem]"
          >
            {t('ifElseSettings.branchB')}
          </Text>
        </div>
      </div>

      <Separator />

      <GameIfElsePreview
        nodeId={nodeId}
        nodeData={nodeData}
        flowNodes={flowNodes}
        flowEdges={flowEdges}
      />

      <Separator />

      <HoldToDeleteButton
        className="self-start"
        onDelete={onDelete}
      >
        {t('ifElseDialog.deleteHint')}
      </HoldToDeleteButton>
    </div>
  )
}
