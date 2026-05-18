import { useState, type ReactNode } from 'react'
import {
  Ai01,
  AiPromptBadgeList,
  type Ai02PromptSuggestion,
} from '@/components/shared/ai-components'
import { Text } from '@/components/ui/text'
import { Check, HandHelping, CircleQuestionMark } from 'lucide-react'
import { useUser } from '@/contexts/user'
import { useAvatarUrl } from '@/hooks/useAvatarUrl'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { GameChatHistory } from '../../components/GameChatHistory'
import type { GameChatHistoryMessage } from '../../components/game-chat.types'
import type { GameImagePinNodeData } from './game-image-pin.schema'
import { ImagePin } from './ImagePin'
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
  type Modifier,
} from '@dnd-kit/core'
import {
  PIN_DRAGGABLE_ID,
  PIN_SOURCE_DROPPABLE_ID,
  useGameImagePinGame,
} from './useGameImagePinGame'
import type { ImagePinSubmissionVariant, NormalizedPinPoint } from './gameImagePinValidation'

export type GameImagePinPreviewProps = {
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

  // Hide the in-place pin while it's being dragged; the visible copy
  // is rendered in <DragOverlay> at the cursor so it isn't clipped by
  // chat-bubble or image overflow boundaries.
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

function PinSourceSlot({ pinAtSource }: { pinAtSource: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id: PIN_SOURCE_DROPPABLE_ID })

  return (
    <div className="w-full flex justify-center">
      <div
        ref={setNodeRef}
        className={cn(
          'w-[200px] h-20 flex items-center justify-center border rounded-2xl relative transition-shadow',
          isOver && 'ring-2 ring-[#0000FF] ring-offset-2 ring-offset-background',
        )}
      >
        {pinAtSource ? <DraggablePin /> : null}
      </div>
    </div>
  )
}

export function GameImagePinPreview({ nodeId, nodeData }: GameImagePinPreviewProps) {
  const { t } = useTranslation('features.gameStudio')
  const { profile } = useUser()
  const { url: userAvatarUrl } = useAvatarUrl(profile?.avatar_url ?? null)
  const {
    displayMessages,
    handleDragEnd,
    handlePromptClick,
    handleChatInput,
    pinAtSource,
    currentPin,
    getSubmissionForMessage,
    latestQuestionMessageId,
    submitAnswerPrompt,
    howToPlayPrompt,
  } = useGameImagePinGame({ nodeId, nodeData })

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
    if (message.id === latestQuestionMessageId && currentPin) {
      return (
        <PositionedPin drop={currentPin.drop}>
          <DraggablePin />
        </PositionedPin>
      )
    }
    return null
  }

  return (
    <div className="flex flex-col h-full gap-3">
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
        <GameChatHistory
          messages={displayMessages}
          className="flex-1 min-h-0"
          showUserAvatar
          incomingAvatarUrl={userAvatarUrl ?? undefined}
          incomingBubbleVariant="orange"
          receivingBubbleVariant="default"
          renderImageChildren={renderImageChildren}
        />

        <PinSourceSlot pinAtSource={pinAtSource} />

        <DragOverlay dropAnimation={null}>
          {activeDragId === PIN_DRAGGABLE_ID ? <ImagePin /> : null}
        </DragOverlay>
      </DndContext>

      <AiPromptBadgeList
        prompts={prompts}
        onPromptClick={handlePromptClick}
      />

      <Ai01
        placeholder="Submit your answer"
        showDropDown={false}
        showMic={false}
        onSubmit={handleChatInput}
      />
    </div>
  )
}
