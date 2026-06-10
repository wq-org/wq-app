'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
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
import { IF_ELSE_GAMEPLAY_ANCHOR_ATTR } from '../../game-if-else/ifElsePreview.constants'
import { useIfElsePreviewFollowContent } from '../../game-if-else/useIfElsePreviewFollowContent'
import { useIfElsePreviewFooter } from '../../game-if-else/useIfElsePreviewFooter'
import { useIfElsePreviewImagePinDnd } from '../../game-if-else/useIfElsePreviewImagePinDnd'
import { PIN_DRAGGABLE_ID } from '../constants/imagePinPreviewDnd.constants'
import {
  resolveGameImagePinDescription,
  resolveGameImagePinPoints,
  type GameImagePinNodeData,
} from '../image-pin.schema'
import type { ImagePinSubmissionVariant, NormalizedPinPoint } from '../imagePinValidation'
import { resolvePlayPreviewFooterMaxScore } from '../../../utils/playPreviewSessionScore'
import { useImagePinGame } from '../hooks/useImagePinGame'
import { useResolvedGameImagePinPreviewSrc } from '../hooks/useResolvedGameImagePinPreviewSrc'
import { ImagePin } from './ImagePin'
import { ImagePinChatInput } from './ImagePinChatInput'

export type ImagePinPreviewProps = {
  nodeId: string
  nodeData: GameImagePinNodeData
  onSessionScoreChange?: (score: number) => void
  onSessionResolved?: (payload: { score: number }) => void
  onSessionComplete?: (payload: { score: number }) => void
  embedded?: boolean
  continuousSession?: boolean
  sessionActive?: boolean
  sessionScoreBaseline?: number
  sessionMaxScore?: number
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

export function ImagePinPreview({
  nodeId,
  nodeData,
  onSessionScoreChange,
  onSessionResolved,
  onSessionComplete,
  embedded = false,
  continuousSession = false,
  sessionActive = true,
  sessionScoreBaseline = 0,
  sessionMaxScore,
}: ImagePinPreviewProps) {
  const { t } = useTranslation('features.gameStudio')
  const { profile } = useUser()
  const { url: userAvatarUrl } = useAvatarUrl(profile?.avatar_url ?? null)
  const description = resolveGameImagePinDescription(nodeData)
  const resolvedImagePreview = useResolvedGameImagePinPreviewSrc(nodeData)
  const previewNodeData = useMemo(
    () => ({ ...nodeData, description, imagePreview: resolvedImagePreview }),
    [description, nodeData, resolvedImagePreview],
  )
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
    resolvedSession,
    isSessionComplete,
  } = useImagePinGame({
    nodeId,
    nodeData: previewNodeData,
    suppressPerAnswerConfetti: embedded && !continuousSession,
  })

  const nodeMaxScore = resolveGameImagePinPoints(nodeData.points)
  const footerMaxScore = resolvePlayPreviewFooterMaxScore(
    nodeMaxScore,
    continuousSession,
    sessionMaxScore,
  )
  const sessionCompleteReportedRef = useRef(false)
  const sessionResolvedReportedRef = useRef(false)

  const displayScore = sessionScoreBaseline + earnedScore

  useEffect(() => {
    onSessionScoreChange?.(displayScore)
  }, [displayScore, onSessionScoreChange])

  useEffect(() => {
    sessionCompleteReportedRef.current = false
    sessionResolvedReportedRef.current = false
  }, [nodeId])

  useEffect(() => {
    if (continuousSession) return
    if (!resolvedSession || sessionResolvedReportedRef.current) return
    sessionResolvedReportedRef.current = true
    onSessionResolved?.({ score: resolvedSession.score })
  }, [continuousSession, onSessionResolved, resolvedSession])

  useEffect(() => {
    if (!isSessionComplete || sessionCompleteReportedRef.current) return
    sessionCompleteReportedRef.current = true
    onSessionComplete?.({ score: earnedScore })
  }, [continuousSession, earnedScore, isSessionComplete, onSessionComplete])

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
      disabled: embedded,
    },
  ] as const satisfies readonly Ai02PromptSuggestion[]

  const [activeDragId, setActiveDragId] = useState<string | null>(null)

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveDragId(String(event.active.id))
  }, [])

  const handleDragEndWrapped = useCallback(
    (event: DragEndEvent) => {
      setActiveDragId(null)
      handleDragEnd(event)
    },
    [handleDragEnd],
  )

  const handleDragCancel = useCallback(() => {
    setActiveDragId(null)
  }, [])

  const useShellSession = continuousSession
  const shellSegmentActive = useShellSession && sessionActive

  const footerChrome = useMemo(
    () => (
      <>
        <AiPromptBadgeList
          prompts={prompts}
          onPromptClick={handlePromptClick}
        />
        <ImagePinChatInput
          score={displayScore}
          maxScore={footerMaxScore}
          pinAtSource={pinAtSource}
          scoreVariant={useShellSession ? 'default' : 'orange'}
        />
      </>
    ),
    [displayScore, footerMaxScore, handlePromptClick, pinAtSource, prompts, useShellSession],
  )

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

  useIfElsePreviewFollowContent(displayMessages.length, shellSegmentActive)

  useIfElsePreviewFooter(footerChrome, shellSegmentActive)

  const shellDndSession = useMemo(
    () =>
      shellSegmentActive
        ? {
            modifiers: [snapCenterToCursor] as Modifier[],
            onDragStart: handleDragStart,
            onDragEnd: handleDragEndWrapped,
            onDragCancel: handleDragCancel,
            overlay: (
              <DragOverlay dropAnimation={null}>
                {activeDragId === PIN_DRAGGABLE_ID ? <ImagePin /> : null}
              </DragOverlay>
            ),
          }
        : null,
    [activeDragId, handleDragCancel, handleDragEndWrapped, handleDragStart, shellSegmentActive],
  )

  useIfElsePreviewImagePinDnd(shellDndSession, shellSegmentActive)

  const showInlineChrome = !useShellSession

  const chatHistory = (
    <div
      {...(shellSegmentActive ? { [IF_ELSE_GAMEPLAY_ANCHOR_ATTR]: '' } : {})}
      className={cn('flex flex-col gap-3', !useShellSession && 'min-h-0 flex-1')}
    >
      <GameChatHistory
        messages={displayMessages}
        flat={useShellSession}
        className={useShellSession ? undefined : 'min-h-0 flex-1'}
        showUserAvatar
        incomingAvatarUrl={userAvatarUrl ?? undefined}
        incomingBubbleVariant="default"
        receivingBubbleVariant={useShellSession ? 'dark' : 'orange'}
        renderImageChildren={renderImageChildren}
      />
      {showInlineChrome ? footerChrome : null}
    </div>
  )

  return (
    <div className={cn('flex flex-col gap-3', useShellSession ? 'min-h-0' : 'h-full')}>
      {!embedded ? (
        <Text
          as="p"
          variant="small"
          color="orange"
        >
          {t('imagePinGamePreview.previewNotice')}
        </Text>
      ) : null}

      {useShellSession ? (
        chatHistory
      ) : (
        <DndContext
          modifiers={[snapCenterToCursor]}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEndWrapped}
          onDragCancel={handleDragCancel}
        >
          {chatHistory}
          <DragOverlay dropAnimation={null}>
            {activeDragId === PIN_DRAGGABLE_ID ? <ImagePin /> : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  )
}
