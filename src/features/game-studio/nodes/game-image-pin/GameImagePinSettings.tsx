import { useState } from 'react'
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
import { FieldTextarea } from '@/components/ui/field-textarea'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Text } from '@/components/ui/text'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  AnimatedBeamHub,
  BeamHubBadge,
  QuantityStepper,
  SliderSyncedNumberInput,
} from '@/components/shared'
import { cn } from '@/lib/utils'
import type { GameImagePinNodeData } from './game-image-pin.schema'

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
  if (!type) return MapPin
  return NODE_TYPE_ICONS[type] ?? FileQuestionMark
}

const LEARNING_FIELD_OPTIONS = [
  { id: 'lf-1', label: 'LF-1' },
  { id: 'lf-2', label: 'LF-2' },
  { id: 'lf-3', label: 'LF-3' },
  { id: 'lf-4', label: 'LF-4' },
  { id: 'lf-5', label: 'LF-5' },
  { id: 'lf-6', label: 'LF-6' },
  { id: 'lf-7', label: 'LF-7' },
] as const

type LearningFieldId = (typeof LEARNING_FIELD_OPTIONS)[number]['id']

const imagePinSettingsEnterLift =
  'animate-in fade-in-0 slide-in-from-bottom-4 motion-safe:duration-300' as const
const imagePinSettingsEnterSubtle =
  'animate-in fade-in-0 slide-in-from-bottom-2 motion-safe:duration-300' as const

export type GameImagePinSettingsProps = {
  nodeId: string
  onDelete: () => void
  onClose: () => void
  onNavigateToNode?: (nodeId: string) => void
  onPatchNodeData: (patch: Partial<GameImagePinNodeData>) => void
  nodeData: GameImagePinNodeData
  prevNode?: AdjacentNodeInfo
  nextNode?: AdjacentNodeInfo
}

export function GameImagePinSettings({
  onDelete,
  onClose,
  onNavigateToNode,
  onPatchNodeData,
  nodeData,
  prevNode,
  nextNode,
}: GameImagePinSettingsProps) {
  const { description = '', imagePreview } = nodeData
  const { t } = useTranslation('features.gameStudio')

  const [qualityOpacity, setQualityOpacity] = useState(50)
  const [exclusionOpacity, setExclusionOpacity] = useState(0)
  const [timeLimitEnabled, setTimeLimitEnabled] = useState(false)
  const [isLearningFieldPopoverOpen, setIsLearningFieldPopoverOpen] = useState(false)
  const [selectedLearningFieldIds, setSelectedLearningFieldIds] = useState<LearningFieldId[]>([])

  const selectedLearningFields = LEARNING_FIELD_OPTIONS.filter((option) =>
    selectedLearningFieldIds.includes(option.id),
  )

  function handleLearningFieldSelect(id: LearningFieldId) {
    setSelectedLearningFieldIds((currentIds) =>
      currentIds.includes(id) ? currentIds : [...currentIds, id],
    )
    setIsLearningFieldPopoverOpen(false)
  }

  function handleLearningFieldRemove(id: LearningFieldId) {
    setSelectedLearningFieldIds((currentIds) => currentIds.filter((currentId) => currentId !== id))
  }

  function handleDescriptionChange(value: string) {
    onPatchNodeData({ description: value })
  }

  function handleNavigate(targetNodeId: string) {
    onClose()
    onNavigateToNode?.(targetNodeId)
  }

  return (
    <div className={cn('flex flex-col gap-6', imagePinSettingsEnterLift)}>
      <Text
        as="p"
        bold
      >
        {t('imagePinSettings.pedagogicalTitle')}
      </Text>

      <div className={cn('flex flex-col gap-2', imagePinSettingsEnterSubtle)}>
        <Label>{t('imagePinSettings.learningFieldLabel')}</Label>
        <div className="flex flex-col items-start gap-2">
          <Popover
            open={isLearningFieldPopoverOpen}
            onOpenChange={setIsLearningFieldPopoverOpen}
          >
            <PopoverTrigger asChild>
              <Button
                className="self-start"
                variant="outline"
              >
                {t('imagePinSettings.learningFieldButton')}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start">
              <PopoverHeader>
                <PopoverTitle>{t('imagePinSettings.learningFieldPopoverTitle')}</PopoverTitle>
                <PopoverDescription>
                  {t('imagePinSettings.learningFieldPopoverDescription')}
                </PopoverDescription>
              </PopoverHeader>
              <div className="mt-2 flex flex-col gap-1">
                {LEARNING_FIELD_OPTIONS.map((option) => {
                  const isSelected = selectedLearningFieldIds.includes(option.id)

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleLearningFieldSelect(option.id)}
                      aria-pressed={isSelected}
                      className={cn(
                        'flex w-full flex-col items-start rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        isSelected && 'bg-primary/10',
                      )}
                    >
                      <span className="font-medium text-foreground">{option.label}</span>
                    </button>
                  )
                })}
              </div>
            </PopoverContent>
          </Popover>

          {selectedLearningFields.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {selectedLearningFields.map((field) => (
                <Badge
                  key={field.id}
                  variant="darkblue"
                  size="sm"
                  className="gap-1 pr-0.5"
                >
                  <span>{field.label}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => handleLearningFieldRemove(field.id)}
                    className="size-5 rounded-full hover:bg-[oklch(var(--oklch-darkblue)/0.12)]"
                    aria-label={`Remove ${field.label}`}
                  >
                    <X
                      aria-hidden="true"
                      className="size-3"
                    />
                  </Button>
                </Badge>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <FieldTextarea
        value={description}
        rows={5}
        placeholder={t('imagePinSettings.gameDescriptionPlaceholder')}
        onValueChange={handleDescriptionChange}
        label={t('imagePinSettings.gameDescriptionLabel')}
      />

      <Separator />

      <Text
        as="p"
        bold
      >
        {t('imagePinSettings.gameSettingsTitle')}
      </Text>

      <div className={cn('flex items-center gap-4', imagePinSettingsEnterSubtle)}>
        <Label className="flex-1">{t('imagePinSettings.maxPointsLabel')}</Label>
        <QuantityStepper
          className="w-44"
          value={100}
          min={0}
          max={999}
          step={1}
          onChange={() => {}}
          label={t('imagePinSettings.maxPointsLabel')}
        />
      </div>

      <div className={cn('flex items-center gap-4', imagePinSettingsEnterSubtle)}>
        <Label className="flex-1">{t('imagePinSettings.pointDeductionLabel')}</Label>
        <QuantityStepper
          className="w-44"
          value={10}
          min={0}
          max={50}
          step={1}
          onChange={() => {}}
          label={t('imagePinSettings.pointDeductionLabel')}
        />
      </div>

      <div className={cn('flex items-center justify-between gap-4', imagePinSettingsEnterSubtle)}>
        <Text
          as="p"
          variant="small"
          className="flex-1"
        >
          {t('imagePinSettings.timeLimitLabel')}
        </Text>
        <Switch
          checked={timeLimitEnabled}
          onCheckedChange={setTimeLimitEnabled}
        />
      </div>

      <Separator />

      <div className={cn('w-full', imagePinSettingsEnterSubtle)}>
        <AnimatedBeamHub
          className="h-40 w-full"
          center={
            <BeamHubBadge
              Icon={MapPin}
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

      <Text
        as="p"
        bold
      >
        {t('imagePinSettings.adaptiveTitle')}
      </Text>

      <div className={cn('flex gap-4', imagePinSettingsEnterSubtle)}>
        <div className="flex flex-col gap-4 flex-1">
          <Text
            as="p"
            variant="small"
          >
            {t('imagePinSettings.qualityReductionLabel')}
          </Text>
          <SliderSyncedNumberInput
            label={t('imagePinSettings.qualitySliderLabel')}
            inputId="quality-opacity-slider"
            value={qualityOpacity}
            onValueChange={setQualityOpacity}
            min={0}
            max={100}
            step={1}
            suffix="%"
          />
        </div>
        <div className="flex-1 flex justify-center items-start">
          <div className="w-32">
            <AspectRatio ratio={1}>
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt=""
                  className="w-full h-full object-cover rounded-md"
                  style={{ opacity: qualityOpacity / 100 }}
                />
              ) : (
                <div className="w-full h-full rounded-md bg-muted" />
              )}
            </AspectRatio>
          </div>
        </div>
      </div>

      <Separator />

      <div className={cn('flex gap-4', imagePinSettingsEnterSubtle)}>
        <div className="flex flex-col gap-4 flex-1">
          <Text
            as="p"
            variant="small"
          >
            {t('imagePinSettings.areaExclusionLabel')}
          </Text>
          <SliderSyncedNumberInput
            label={t('imagePinSettings.areaSliderLabel')}
            inputId="exclusion-opacity-slider"
            value={exclusionOpacity}
            onValueChange={setExclusionOpacity}
            min={0}
            max={100}
            step={1}
            suffix="%"
          />
        </div>
        <div className="flex-1 flex justify-center items-start">
          <div className="w-32">
            <AspectRatio ratio={1}>
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt=""
                  className="w-full h-full object-cover rounded-md"
                  style={{ opacity: (100 - exclusionOpacity) / 100 }}
                />
              ) : (
                <div className="w-full h-full rounded-md bg-muted" />
              )}
            </AspectRatio>
          </div>
        </div>
      </div>

      <Separator />

      <HoldToDeleteButton
        className="self-start"
        onDelete={onDelete}
      >
        {t('imagePinSettings.holdToDeleteNode')}
      </HoldToDeleteButton>
    </div>
  )
}
