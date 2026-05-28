import { useTranslation } from 'react-i18next'
import {
  Calculator,
  MapPin,
  MessageCircleQuestion,
  Play,
  Square,
  Split,
  X,
  FileQuestionMark,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { HoldToDeleteButton } from '@/components/ui/HoldToDeleteButton'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { Text } from '@/components/ui/text'
import { AnimatedBeamHub, BeamHubBadge, QuantityStepper } from '@/components/shared'
import { cn } from '@/lib/utils'
import type { GameOpenQuestionNodeData } from '../types/open-question.schema'
import { buildOpenQuestionScoreBreakdown, resolveGameOpenQuestionPoints } from '../utils'

type AdjacentNodeInfo = { id: string; nodeType: string | undefined }

const NODE_TYPE_ICONS: Record<string, LucideIcon> = {
  gameStart: Play,
  gameEnd: Square,
  gameIfElse: Split,
  gameDragDropMath: Calculator,
  gameOpenQuestion: MessageCircleQuestion,
  gameImagePin: MapPin,
}

function getNodeIcon(type: string | undefined): LucideIcon {
  if (!type) return MessageCircleQuestion
  return NODE_TYPE_ICONS[type] ?? FileQuestionMark
}

const openQuestionSettingsEnterLift =
  'animate-in fade-in-0 slide-in-from-bottom-4 motion-safe:duration-300' as const
const openQuestionSettingsEnterSubtle =
  'animate-in fade-in-0 slide-in-from-bottom-2 motion-safe:duration-300' as const

export type OpenQuestionSettingsProps = {
  nodeId: string
  onDelete: () => void
  onClose: () => void
  onNavigateToNode?: (nodeId: string) => void
  onPatchNodeData: (patch: Partial<GameOpenQuestionNodeData>) => void
  nodeData: GameOpenQuestionNodeData
  prevNode?: AdjacentNodeInfo
  nextNode?: AdjacentNodeInfo
}

export function OpenQuestionSettings({
  onDelete,
  onClose,
  onNavigateToNode,
  onPatchNodeData,
  nodeData,
  prevNode,
  nextNode,
}: OpenQuestionSettingsProps) {
  const { t } = useTranslation('features.gameStudio')
  const maxPoints = resolveGameOpenQuestionPoints(nodeData.points)
  const scoreBreakdown = buildOpenQuestionScoreBreakdown(nodeData)

  function handleMaxPointsChange(value: number) {
    const next = Math.max(0, Math.floor(value))
    if (next === maxPoints) return
    onPatchNodeData({ points: next })
  }

  function handleNavigate(targetNodeId: string) {
    onClose()
    onNavigateToNode?.(targetNodeId)
  }

  return (
    <div className={cn('flex flex-col gap-6', openQuestionSettingsEnterLift)}>
      <Text
        as="p"
        bold
      >
        {t('openQuestionSettings.gameSettingsTitle')}
      </Text>

      <div className={cn('flex items-center gap-4', openQuestionSettingsEnterSubtle)}>
        <Label className="flex-1">{t('openQuestionSettings.maxPointsLabel')}</Label>
        <QuantityStepper
          className="w-44"
          value={maxPoints}
          min={0}
          max={999}
          step={1}
          onChange={handleMaxPointsChange}
          label={t('openQuestionSettings.maxPointsLabel')}
        />
      </div>

      <Accordion
        type="single"
        collapsible
        defaultValue="score-breakdown"
      >
        <AccordionItem
          value="score-breakdown"
          className="border-b-0"
        >
          <AccordionTrigger className="py-3">
            <span className="flex items-center gap-2">
              <Calculator className="size-4" />
              <Text
                variant="small"
                as="p"
                muted
              >
                {t('openQuestionSettings.scoreAccordionTitle')}
              </Text>
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/20 p-4">
              <Text
                as="p"
                variant="small"
                muted
              >
                {t('openQuestionSettings.scoreAccordionHint')}
              </Text>

              {scoreBreakdown.isCalculated ? (
                <Text
                  as="p"
                  variant="small"
                  muted
                >
                  {t('openQuestionSettings.scoreAccordionBulletPerQuestion', {
                    maxPoints: scoreBreakdown.maxPoints,
                    questionCount: scoreBreakdown.filledQuestionCount,
                    pointsPerQuestion: scoreBreakdown.pointsPerQuestion,
                  })}
                </Text>
              ) : (
                <Text
                  as="p"
                  variant="small"
                  muted
                >
                  {t('openQuestionSettings.scoreAccordionPending', {
                    maxPoints: scoreBreakdown.maxPoints,
                  })}
                </Text>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Separator />

      <div className={cn('w-full', openQuestionSettingsEnterSubtle)}>
        <AnimatedBeamHub
          className="h-40 w-full"
          center={
            <BeamHubBadge
              Icon={MessageCircleQuestion}
              theme="blue"
            />
          }
          nodes={[
            {
              direction: 'left',
              content: (
                <BeamHubBadge
                  Icon={prevNode ? getNodeIcon(prevNode.nodeType) : X}
                  theme="default"
                  onClick={prevNode ? () => handleNavigate(prevNode.id) : undefined}
                  className={!prevNode ? 'text-red-500 border-red-500/20' : undefined}
                />
              ),
              gradientStartColor: 'darkblue',
              gradientStopColor: 'violet',
            },
            {
              direction: 'right',
              content: (
                <BeamHubBadge
                  Icon={nextNode ? getNodeIcon(nextNode.nodeType) : X}
                  theme="default"
                  onClick={nextNode ? () => handleNavigate(nextNode.id) : undefined}
                  className={!nextNode ? 'text-red-500 border-red-500/20' : undefined}
                />
              ),
              gradientStartColor: 'pink',
              gradientStopColor: 'darkblue',
              reverse: true,
            },
          ]}
        />
      </div>

      <Separator />

      <HoldToDeleteButton
        className="self-start"
        onDelete={onDelete}
      >
        {t('openQuestionSettings.holdToDeleteNode')}
      </HoldToDeleteButton>
    </div>
  )
}
