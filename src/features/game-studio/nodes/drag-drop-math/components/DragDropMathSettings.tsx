import {
  Calculator,
  FileQuestionMark,
  MapPin,
  MessageCircleQuestion,
  Play,
  Sigma,
  Split,
  Square,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { HoldToDeleteButton } from '@/components/ui/HoldToDeleteButton'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Text } from '@/components/ui/text'
import { AnimatedBeamHub, BeamHubBadge, QuantityStepper } from '@/components/shared'
import { cn } from '@/lib/utils'

import {
  resolveGameDragDropMathPoints,
  type GameDragDropMathNodeData,
} from '../types/drag-drop-math.schema'

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
  if (!type) return Calculator
  return NODE_TYPE_ICONS[type] ?? FileQuestionMark
}

const dragDropMathSettingsEnterSubtle =
  'animate-in fade-in-0 slide-in-from-bottom-2 motion-safe:duration-300' as const

export type DragDropMathSettingsProps = {
  nodeId: string
  onDelete: () => void
  onClose: () => void
  onNavigateToNode?: (nodeId: string) => void
  onPatchNodeData: (patch: Partial<GameDragDropMathNodeData>) => void
  nodeData: GameDragDropMathNodeData
  prevNode?: AdjacentNodeInfo
  nextNode?: AdjacentNodeInfo
}

export function DragDropMathSettings({
  onDelete,
  onClose,
  onNavigateToNode,
  onPatchNodeData,
  nodeData,
  prevNode,
  nextNode,
}: DragDropMathSettingsProps) {
  const maxPoints = resolveGameDragDropMathPoints(nodeData.points)
  const instantColorFeedback = nodeData.instantColorFeedback !== false

  function handleNavigate(targetNodeId: string) {
    onClose()
    onNavigateToNode?.(targetNodeId)
  }

  function handleMaxPointsChange(value: number) {
    const next = Math.max(0, Math.floor(value))
    if (next === maxPoints) return
    onPatchNodeData({ points: next })
  }

  function handleInstantColorFeedbackChange(checked: boolean) {
    onPatchNodeData({ instantColorFeedback: checked })
  }

  return (
    <div className="flex flex-col gap-6">
      <Text
        as="p"
        bold
      >
        Game settings
      </Text>

      <div className={cn('flex items-center gap-4', dragDropMathSettingsEnterSubtle)}>
        <Label className="flex-1">Maximum score</Label>
        <QuantityStepper
          className="w-44"
          value={maxPoints}
          min={0}
          max={999}
          step={1}
          onChange={handleMaxPointsChange}
          label="Maximum score"
        />
      </div>

      <div
        className={cn(
          'flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/20 px-4 py-3',
          dragDropMathSettingsEnterSubtle,
        )}
      >
        <div className="flex flex-col gap-0.5">
          <Label htmlFor="drag-drop-math-instant-color-feedback">Instant color feedback</Label>
          <Text
            as="p"
            variant="small"
            muted
          >
            Blue on valid Enter, red on invalid (per row).
          </Text>
        </div>
        <Switch
          id="drag-drop-math-instant-color-feedback"
          checked={instantColorFeedback}
          onCheckedChange={handleInstantColorFeedbackChange}
          aria-label="Instant color feedback on Enter"
        />
      </div>

      <Accordion
        type="single"
        collapsible
      >
        <AccordionItem
          value="score-calculation"
          className="border-b-0"
        >
          <AccordionTrigger className="py-3">
            <span className="flex items-center gap-2">
              <Sigma className="size-4" />
              <Text
                variant="small"
                as="p"
                muted
              >
                How the score is calculated
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
                {/* Calculation rules are still being designed. */}
                Calculation rules will be defined here once the scoring model for drag-and-drop math
                is finalized.
              </Text>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Separator />

      <div className={cn('w-full', dragDropMathSettingsEnterSubtle)}>
        <AnimatedBeamHub
          className="h-40 w-full"
          center={
            <BeamHubBadge
              Icon={Calculator}
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
        Hold to delete node
      </HoldToDeleteButton>
    </div>
  )
}
