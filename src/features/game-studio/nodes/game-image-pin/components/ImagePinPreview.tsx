'use client'

import { useState, type ReactNode } from 'react'
import {
  DndContext,
  DragOverlay,
  useDraggable,
  type DragEndEvent,
  type DragStartEvent,
  type Modifier,
} from '@dnd-kit/core'
import { AiPromptBadgeList, type Ai02PromptSuggestion } from '@/components/shared/ai-components'
import { Text } from '@/components/ui/text'
import { Check, CircleQuestionMark, HandHelping } from 'lucide-react'
import { useUser } from '@/contexts/user'
import { useAvatarUrl } from '@/hooks/useAvatarUrl'
import { useTranslation } from 'react-i18next'

import { GameChatHistory } from '../../../components/GameChatHistory'
import type { GameChatHistoryMessage } from '../../../components/game-chat.types'
import { PIN_DRAGGABLE_ID } from '../constants/imagePinPreviewDnd.constants'
import { resolveGameImagePinPoints, type GameImagePinNodeData } from '../image-pin.schema'
import type { ImagePinSubmissionVariant, NormalizedPinPoint } from '../imagePinValidation'
import { useImagePinGame } from '../hooks/useImagePinGame'
import { ImagePin } from './ImagePin'
import { ImagePinChatInput } from './ImagePinChatInput'

export type ImagePinPreviewProps = {
  nodeId: string
  nodeData: GameImagePinNodeData
}

/**
 * Anchors the overlay's centre to the cursor regardless of where on the pin
 * the user pressed down. Mirrors `snapCenterToCursor` from `@dnd-kit/modifiers`
 * — inlined to avoid pulling in a second dnd-kit package just for one modifier.
 */
const snapCenterToCursor: Modifier = ({ activatorEvent, draggingNodeRect, transform }) => {
  if (!activatorEvent || !draggingNodeRect) return transform
  const point = getPointerCoordinates(activatorEvent)
  if (!point) return transform
  const offsetX = point.x - draggingNodeRect.left
  const offsetY = point.y - draggingNodeRect.top
  return {
    ...transform,
    x: transform.x + offsetX - draggingNodeRect.width / 2,
    y: transform.y + offsetY - draggingNodeRect.height / 2,
  }
}

function getPointerCoordinates(event: Event): { x: number; y: number } | null {
  if ('clientX' in event && typeof (event as MouseEvent).clientX === 'number') {
    const mouseLike = event as MouseEvent
    return { x: mouseLike.clientX, y: mouseLike.clientY }
  }
  if ('touches' in event) {
    const touch = (event as TouchEvent).touches[0]
    if (touch) return { x: touch.clientX, y: touch.clientY }
  }
  return null
}

function DraggablePin() {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: PIN_DRAGGABLE_ID,
  })

  return (
    <ImagePin
      ref={setNodeRef}
      style={{ opacity: isDragging ? 0 : 1 }}
      {...listeners}
      {...attributes}
    />
  )
}

function LockedPin({ variant }: { variant: ImagePinSubmissionVariant }) {
  return <ImagePin variant={variant} />
}

function PositionedPin({ drop, children }: { drop: NormalizedPinPoint; children: ReactNode }) {
  return (
    <div
      className="absolute"
      style={{
        left: `${drop.x * 100}%`,
        top: `${drop.y * 100}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {children}
    </div>
  )
}

export function ImagePinPreview({ nodeId, nodeData }: ImagePinPreviewProps) {
  const { t } = useTranslation('features.gameStudio')
  const { profile } = useUser()
  const { url: userAvatarUrl } = useAvatarUrl(profile?.avatar_url ?? null)
  const {
    displayMessages,
    handleDragEnd,
    handlePromptClick,
    pinAtSource,
    currentPin,
    hasActiveQuestion,
    getSubmissionForMessage,
    latestQuestionMessageId,
    submitAnswerPrompt,
    howToPlayPrompt,
    earnedScore,
  } = useImagePinGame({ nodeId, nodeData })

  const maxScore = resolveGameImagePinPoints(nodeData.points)

  const prompts = [
    {
      icon: Check,
      text: t('imagePinGamePreview.badgeSubmitAnswer'),
      prompt: submitAnswerPrompt,
    },
    {
      icon: HandHelping,
      text: t('imagePinGamePreview.badgeHint'),
      prompt: t('imagePinGamePreview.hintPrompt'),
      disabled: true,
    },
    {
      icon: CircleQuestionMark,
      text: t('imagePinGamePreview.badgeHowToPlay'),
      prompt: howToPlayPrompt,
    },
  ] as const satisfies readonly Ai02PromptSuggestion[]

  const [activeDragId, setActiveDragId] = useState<string | null>(null)

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(String(event.active.id))
  }

  const handleDragEndWrapped = (event: DragEndEvent) => {
    setActiveDragId(null)
    handleDragEnd(event)
  }

  const handleDragCancel = () => {
    setActiveDragId(null)
  }

  const renderImageChildren = (message: GameChatHistoryMessage) => {
    const submission = getSubmissionForMessage(message)
    if (submission) {
      return (
        <PositionedPin drop={submission.drop}>
          <LockedPin variant={submission.variant} />
        </PositionedPin>
      )
    }
    if (message.id === latestQuestionMessageId && currentPin && hasActiveQuestion) {
      return (
        <PositionedPin drop={currentPin.drop}>
          <DraggablePin />
        </PositionedPin>
      )
    }
    return null
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <Text
        as="p"
        variant="small"
        color="orange"
      >
        {t('imagePinGamePreview.previewNotice')}
      </Text>

      <DndContext
        modifiers={[snapCenterToCursor]}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEndWrapped}
        onDragCancel={handleDragCancel}
      >
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <GameChatHistory
            messages={displayMessages}
            className="min-h-0 flex-1"
            showUserAvatar
            incomingAvatarUrl={userAvatarUrl ?? undefined}
            incomingBubbleVariant="default"
            receivingBubbleVariant="orange"
            renderImageChildren={renderImageChildren}
          />

          <AiPromptBadgeList
            prompts={prompts}
            onPromptClick={handlePromptClick}
          />

          <ImagePinChatInput
            score={earnedScore}
            maxScore={maxScore}
            pinAtSource={pinAtSource}
          />
        </div>

        <DragOverlay dropAnimation={null}>
          {activeDragId === PIN_DRAGGABLE_ID ? <ImagePin /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
