'use client'

import { Calculator, MapPin, MessageCircleQuestion, Split, X, FileQuestionMark } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Edge, Node } from '@xyflow/react'
import { useMemo, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { AnimatedBeamHub, BeamHubBadge } from '@/components/shared'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'

import type { GameIfElseNodeData } from './game-if-else.schema'
import {
  getIfElseBranchPointRanges,
  getIncomingGameplayNode,
  getOutgoingBranchNode,
  resolveGameplayNodeMaxPoints,
} from './game-if-else.utils'
import type { ThemeClassId } from '@/lib/themes'

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

export type IfElseBeamMapProps = {
  nodeId: string
  nodeData: GameIfElseNodeData
  flowNodes: Node[]
  flowEdges: Edge[]
  onNavigate?: (target: AdjacentNodeInfo) => void
}

function BranchHubNode({
  badge,
  rangeLabel,
  rangeClassName,
}: {
  badge: ReactNode
  rangeLabel: string | null
  rangeClassName: string
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      {badge}
      {rangeLabel ? (
        <Text
          as="p"
          variant="small"
          className={cn('whitespace-nowrap text-xs font-semibold tabular-nums', rangeClassName)}
        >
          {rangeLabel}
        </Text>
      ) : null}
    </div>
  )
}

export function IfElseBeamMap({
  nodeId,
  nodeData,
  flowNodes,
  flowEdges,
  onNavigate,
}: IfElseBeamMapProps) {
  const { t } = useTranslation('features.gameStudio')

  const incomingNode = getIncomingGameplayNode(nodeId, flowNodes, flowEdges)
  const incomingMaxPoints = resolveGameplayNodeMaxPoints(incomingNode)
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

  const branchANode = getOutgoingBranchNode(nodeId, 'A', flowNodes, flowEdges)
  const branchBNode = getOutgoingBranchNode(nodeId, 'B', flowNodes, flowEdges)

  return (
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
              <div className="flex flex-col items-center gap-1.5">
                <BeamHubBadge
                  Icon={incomingNode ? getNodeIcon(incomingNode.type) : X}
                  theme={incomingNode ? 'blue' : ('red' as ThemeClassId)}
                  onClick={
                    incomingNode && onNavigate
                      ? () => onNavigate({ id: incomingNode.id, nodeType: incomingNode.type })
                      : undefined
                  }
                  className={cn(!incomingNode && 'text-red-500 border-red-500/20')}
                />
                <Text
                  as="p"
                  variant="small"
                  muted
                  className="max-w-[5rem] text-center text-xs"
                >
                  {t('ifElseSettings.branchIncoming')}
                </Text>
              </div>
            ),
            gradientStartColor: 'blue',
            gradientStopColor: 'cyan',
          },
          {
            direction: 'top-right',
            content: (
              <BranchHubNode
                rangeLabel={branchARangeLabel}
                rangeClassName="text-muted-foreground"
                badge={
                  <BeamHubBadge
                    Icon={branchANode ? getNodeIcon(branchANode.nodeType) : X}
                    theme={branchANode ? 'default' : ('red' as ThemeClassId)}
                    onClick={branchANode && onNavigate ? () => onNavigate(branchANode) : undefined}
                    className={cn(!branchANode && 'text-red-500 border-red-500/20')}
                  />
                }
              />
            ),
            gradientStartColor: 'blue',
            gradientStopColor: 'indigo',
          },
          {
            direction: 'bottom-right',
            content: (
              <BranchHubNode
                rangeLabel={branchBRangeLabel}
                rangeClassName="text-muted-foreground"
                badge={
                  <BeamHubBadge
                    Icon={branchBNode ? getNodeIcon(branchBNode.nodeType) : X}
                    theme={branchBNode ? 'default' : ('red' as ThemeClassId)}
                    onClick={branchBNode && onNavigate ? () => onNavigate(branchBNode) : undefined}
                    className={cn(!branchBNode && 'text-red-500 border-red-500/20')}
                  />
                }
              />
            ),
            gradientStartColor: 'indigo',
            gradientStopColor: 'blue',
            reverse: true,
          },
        ]}
      />
    </div>
  )
}
