'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { Check, CircleQuestionMark, HandHelping } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  AiPromptBadgeList,
  aiPromptBadgeListEnterAnimation,
  type Ai02PromptSuggestion,
} from '@/components/shared/ai-components'
import { hasLexicalEditorContent } from '@/components/shared/chat'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'
import { useUser } from '@/contexts/user'
import { useAvatarUrl } from '@/hooks/useAvatarUrl'

import {
  canvasCollisionDetection,
  getCanvasTokenIdFromSortableId,
  useDnDMathCanvasRows,
} from './canvas'
import { useDnDMathPreviewGame } from '../hooks'
import { DropMathNode } from './DropMathNode'
import { DropMathStaticNode } from './DropMathStaticNode'
import { DropTextNode } from './DropTextNode'
import { SigmaNode } from './SigmaNode'
import { DnDMathChatInput } from './DnDMathChatInput'
import { DnDMathPreviewChatHistory } from './DnDMathPreviewChatHistory'
import { DnDMathSubmitConfirmDialog } from './DnDMathSubmitConfirmDialog'
import { collectEquationGroupTokenIds, isFixedMathSuffixToken } from '../utils/mathEquationRow'
import {
  isTokenCanvasRow,
  resolveGameDragDropMathPoints,
  type DragDropMathCanvasRow,
  type DragDropMathCanvasToken,
  type GameDragDropMathNodeData,
} from '../types/drag-drop-math.schema'
import type { MathNodeVariant } from '../types/math-node.types'
import { MATH_NODE_PALETTE_DRAG_IDS } from '../constants/drag-drop-math-dnd.constants'
import { resolveDropNodeDefaultValue } from '../constants/math-node.defaults'
import { MATH_NODE_PALETTE_PRESETS } from '../constants/math-node-palette.constants'
import { resolveExerciseTabsState } from '../utils/exerciseTabs.utils'
import { buildDragDropMathHowToPlayResponse } from '../utils/dragDropMathPreviewMessages'
import {
  isDragDropMathCanvasEmpty,
  lockCanvasRowsForSubmission,
} from '../utils/canvasSubmissionLock'
import { snapCenterToCursor } from '../utils/snapCenterToCursor'
import { useIfElsePreviewFollowContent } from '../../game-if-else/useIfElsePreviewFollowContent'
import { useIfElsePreviewFooter } from '../../game-if-else/useIfElsePreviewFooter'
import { resolvePlayPreviewFooterMaxScore } from '../../../utils/playPreviewSessionScore'

function findTokenInRows(rows: readonly DragDropMathCanvasRow[], tokenId: string) {
  for (const row of rows) {
    if (!isTokenCanvasRow(row)) continue
    const token = row.tokens.find((candidate) => candidate.id === tokenId)
    if (token) return token
  }
  return null
}

function findRowForToken(rows: readonly DragDropMathCanvasRow[], tokenId: string) {
  return (
    rows.find(
      (row) => isTokenCanvasRow(row) && row.tokens.some((candidate) => candidate.id === tokenId),
    ) ?? null
  )
}

export type DnDMathPreviewProps = {
  nodeId: string
  nodeData?: GameDragDropMathNodeData
  onSessionScoreChange?: (score: number) => void
  onSessionComplete?: (payload: { score: number }) => void
  embedded?: boolean
  continuousSession?: boolean
  sessionActive?: boolean
  sessionScoreBaseline?: number
  sessionMaxScore?: number
}

export function DnDMathPreview({
  nodeId,
  nodeData,
  onSessionScoreChange,
  onSessionComplete,
  embedded = false,
  continuousSession = false,
  sessionActive = true,
  sessionScoreBaseline = 0,
  sessionMaxScore,
}: DnDMathPreviewProps) {
  const { t } = useTranslation('features.gameStudio')
  const { profile } = useUser()
  const { url: userAvatarUrl } = useAvatarUrl(profile?.avatar_url ?? null)

  const defaultTabTitle = t('dragDropMathEditor.newExerciseTabLabel')
  const pin = useMemo(() => nodeData ?? {}, [nodeData])
  const instantColorFeedback = pin.instantColorFeedback !== false
  const nodeMaxScore = resolveGameDragDropMathPoints(pin.points)
  const footerMaxScore = resolvePlayPreviewFooterMaxScore(
    nodeMaxScore,
    continuousSession,
    sessionMaxScore,
  )
  const footerScoreVariant = continuousSession ? 'default' : 'orange'

  const { tabs } = useMemo(
    () => resolveExerciseTabsState(pin, defaultTabTitle),
    [pin, defaultTabTitle],
  )

  const [canvasRows, setCanvasRows] = useState<DragDropMathCanvasRow[]>([])
  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  const [howToPlayMessages, setHowToPlayMessages] = useState<
    ReturnType<typeof useDnDMathPreviewGame>['messages']
  >([])

  const howToPlayPrompt = t('dragDropMathGamePreview.howToPlayPrompt')
  const howToPlayResponse = useMemo(
    () =>
      buildDragDropMathHowToPlayResponse(
        t('dragDropMathGamePreview.howToPlayScoringResponse', { maxPoints: nodeMaxScore }),
        t('dragDropMathGamePreview.howToPlayResponse'),
      ),
    [nodeMaxScore, t],
  )

  const descriptionContent = pin.descriptionContent ?? null
  const initialTabTitle = tabs[0]?.title?.trim() || pin.title?.trim() || ''
  const showDescription = hasLexicalEditorContent(descriptionContent)
  const showTitle = initialTabTitle.length > 0
  const hasMultipleTabs = tabs.length > 1

  const avatarFallback =
    profile?.display_name?.trim().charAt(0).toUpperCase() ??
    profile?.username?.trim().charAt(0).toUpperCase() ??
    profile?.email?.trim().charAt(0).toUpperCase() ??
    'U'

  const isCanvasEmpty = isDragDropMathCanvasEmpty(canvasRows)

  const handleHowToPlay = useCallback(() => {
    setHowToPlayMessages((prev) => {
      const seq = Math.floor(prev.length / 2) + 1
      return [
        ...prev,
        {
          id: `${nodeId}-how-to-play-prompt-${seq}`,
          direction: 'sending',
          kind: 'text',
          text: howToPlayPrompt,
        },
        {
          id: `${nodeId}-how-to-play-reply-${seq}`,
          direction: 'receiving',
          kind: 'text',
          text: howToPlayResponse,
        },
      ]
    })
  }, [howToPlayPrompt, howToPlayResponse, nodeId])

  const resolveDropValue = useCallback(
    (variant: MathNodeVariant, value: string) => resolveDropNodeDefaultValue(variant, value, t),
    [t],
  )

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 8 },
  })
  const dragSensors = useSensors(pointerSensor)

  const {
    handleDragEnd: handleCanvasDragEnd,
    reorderRows,
    updateTokenValue,
    commitMathEquation,
    removeToken,
    removeSigmaRow,
  } = useDnDMathCanvasRows({
    rows: canvasRows,
    onRowsChange: setCanvasRows,
    resolveDropValue,
  })

  const {
    messages: submitMessages,
    submitDialogOpen,
    setSubmitDialogOpen,
    openSubmitDialog,
    handleConfirmSubmit,
    submissionLocked,
    runningEarnedScore,
    errorTokenIds,
    currentTabIndex,
    allTabsCompleted,
  } = useDnDMathPreviewGame({
    nodeId,
    submitPrompt: t('dragDropMathGamePreview.submitAnswerPrompt'),
    totalMaxScore: nodeMaxScore,
    tabs,
    studentRows: canvasRows,
    hasSubmittableCanvas: !isCanvasEmpty,
  })

  const displayScore = sessionScoreBaseline + runningEarnedScore

  useEffect(() => {
    onSessionScoreChange?.(displayScore)
  }, [displayScore, onSessionScoreChange])

  const sessionCompleteReportedRef = useRef(false)

  useEffect(() => {
    sessionCompleteReportedRef.current = false
  }, [nodeId, tabs.length])

  useEffect(() => {
    if (!allTabsCompleted || sessionCompleteReportedRef.current) return
    sessionCompleteReportedRef.current = true
    onSessionComplete?.({ score: runningEarnedScore })
  }, [allTabsCompleted, onSessionComplete, runningEarnedScore])

  useEffect(() => {
    setCanvasRows([])
  }, [currentTabIndex])

  const prompts = useMemo(
    () =>
      [
        {
          icon: Check,
          text: t('dragDropMathGamePreview.badgeSubmitAnswer'),
          prompt: t('dragDropMathGamePreview.submitAnswerPrompt'),
          disabled: isCanvasEmpty || submissionLocked || allTabsCompleted,
        },
        {
          icon: HandHelping,
          text: t('dragDropMathGamePreview.badgeHint'),
          prompt: t('dragDropMathGamePreview.hintPrompt'),
          disabled: true,
        },
        {
          icon: CircleQuestionMark,
          text: t('dragDropMathGamePreview.badgeHowToPlay'),
          prompt: howToPlayPrompt,
          disabled: embedded,
        },
      ] as const satisfies readonly Ai02PromptSuggestion[],
    [allTabsCompleted, embedded, howToPlayPrompt, isCanvasEmpty, submissionLocked, t],
  )

  const previewMessages = useMemo(
    () => [...howToPlayMessages, ...submitMessages],
    [howToPlayMessages, submitMessages],
  )

  useEffect(() => {
    if (!submissionLocked) return
    setCanvasRows((rows) => lockCanvasRowsForSubmission(rows, errorTokenIds))
  }, [submissionLocked, errorTokenIds])

  const activeDragSensors = submissionLocked ? [] : dragSensors

  const handlePromptClick = useCallback(
    (message: string) => {
      if (message === t('dragDropMathGamePreview.submitAnswerPrompt')) {
        if (isCanvasEmpty || submissionLocked || allTabsCompleted) return
        openSubmitDialog()
        return
      }
      if (message === howToPlayPrompt) {
        handleHowToPlay()
      }
    },
    [
      allTabsCompleted,
      handleHowToPlay,
      howToPlayPrompt,
      isCanvasEmpty,
      openSubmitDialog,
      submissionLocked,
      t,
    ],
  )

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      if (submissionLocked) return
      setActiveDragId(String(event.active.id))
    },
    [submissionLocked],
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveDragId(null)
      if (submissionLocked) return
      handleCanvasDragEnd(event)
    },
    [handleCanvasDragEnd, submissionLocked],
  )

  const handleDragCancel = useCallback(() => {
    setActiveDragId(null)
  }, [])

  const activeDragPreview = useMemo(() => {
    if (!activeDragId) return null

    const palettePreset = MATH_NODE_PALETTE_PRESETS.find(
      (item) => MATH_NODE_PALETTE_DRAG_IDS[item.variant] === activeDragId,
    )
    if (palettePreset) {
      const dropValue = resolveDropValue(palettePreset.variant, palettePreset.value)
      if (palettePreset.variant === 'math') {
        return (
          <DropMathNode
            value={dropValue}
            onCommit={() => {}}
          />
        )
      }
      if (palettePreset.variant === 'sigma') {
        return (
          <SigmaNode
            paletteMode
            label={t('dragDropMathEditor.sigmaBlockLabel')}
          />
        )
      }
      return (
        <DropTextNode
          value={dropValue}
          onValueChange={() => {}}
        />
      )
    }

    const tokenId = getCanvasTokenIdFromSortableId(activeDragId)
    if (!tokenId) return null

    const sourceRow = findRowForToken(canvasRows, tokenId)
    const canvasToken = findTokenInRows(canvasRows, tokenId)
    if (!canvasToken || !sourceRow || !isTokenCanvasRow(sourceRow)) return null

    const renderCanvasToken = (token: DragDropMathCanvasToken) => {
      if (token.variant === 'math') {
        if (isFixedMathSuffixToken(token)) {
          return (
            <DropMathStaticNode
              key={token.id}
              value={token.value}
              mathShell={token.mathRole === 'equals' ? 'ghost' : token.mathShell}
              compact={token.mathRole === 'equals'}
            />
          )
        }
        return (
          <DropMathNode
            key={token.id}
            value={token.value}
            expression={token.expression}
            mathShell={token.mathShell}
            onCommit={() => {}}
            disabled={token.disabled}
            useGrabCursor={!token.disabled}
            instantColorFeedback={instantColorFeedback}
          />
        )
      }
      return (
        <DropTextNode
          key={token.id}
          value={token.value}
          onValueChange={() => {}}
          disabled={token.disabled}
          useGrabCursor={!token.disabled}
        />
      )
    }

    const groupIds = collectEquationGroupTokenIds(sourceRow, tokenId)
    if (groupIds.length > 1) {
      const groupTokens = groupIds
        .map((id) => sourceRow.tokens.find((candidate) => candidate.id === id))
        .filter((token): token is NonNullable<typeof token> => token != null)
      return (
        <div className="flex flex-wrap items-center gap-2">
          {groupTokens.map(renderCanvasToken)}
        </div>
      )
    }

    return renderCanvasToken(canvasToken)
  }, [activeDragId, canvasRows, instantColorFeedback, resolveDropValue, t])

  const footerChrome = useMemo(
    () => (
      <>
        <AiPromptBadgeList
          prompts={prompts}
          onPromptClick={handlePromptClick}
        />
        <DndContext
          sensors={activeDragSensors}
          collisionDetection={canvasCollisionDetection}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <DnDMathChatInput
            className={cn('shrink-0', aiPromptBadgeListEnterAnimation)}
            showPaletteLabel={false}
            rows={canvasRows}
            interactionLocked={submissionLocked || !sessionActive}
            instantColorFeedback={instantColorFeedback}
            onRowsReorder={submissionLocked || !sessionActive ? () => {} : reorderRows}
            onTokenValueChange={submissionLocked || !sessionActive ? () => {} : updateTokenValue}
            onMathTokenCommit={submissionLocked || !sessionActive ? () => {} : commitMathEquation}
            onTokenRemove={submissionLocked || !sessionActive ? () => {} : removeToken}
            onSigmaRemove={submissionLocked || !sessionActive ? () => {} : removeSigmaRow}
            score={displayScore}
            maxScore={footerMaxScore}
            scoreVariant={footerScoreVariant}
          />
          <DragOverlay
            dropAnimation={null}
            modifiers={[snapCenterToCursor]}
          >
            {activeDragPreview}
          </DragOverlay>
        </DndContext>
      </>
    ),
    [
      activeDragPreview,
      activeDragSensors,
      canvasRows,
      commitMathEquation,
      handleDragCancel,
      handleDragEnd,
      handleDragStart,
      handlePromptClick,
      instantColorFeedback,
      footerMaxScore,
      footerScoreVariant,
      prompts,
      removeSigmaRow,
      removeToken,
      reorderRows,
      displayScore,
      sessionActive,
      submissionLocked,
      updateTokenValue,
    ],
  )

  const shellSegmentActive = continuousSession && sessionActive

  useIfElsePreviewFollowContent(previewMessages.length, shellSegmentActive)

  useIfElsePreviewFooter(continuousSession ? footerChrome : null, shellSegmentActive)

  const showInlineChrome = !continuousSession

  return (
    <div className={cn('flex flex-col gap-3', continuousSession ? 'min-h-0' : 'h-full')}>
      {!embedded ? (
        <Text
          as="p"
          variant="small"
          color="orange"
          className="shrink-0"
        >
          {t('dragDropMathGamePreview.previewNotice')}
        </Text>
      ) : null}

      {hasMultipleTabs && !continuousSession ? (
        <Text
          as="p"
          variant="small"
          muted
          aria-live="polite"
          className="shrink-0"
        >
          {t('dragDropMathGamePreview.iterationProgressLabel', {
            current: currentTabIndex + 1,
            total: tabs.length,
          })}
        </Text>
      ) : null}

      <DnDMathPreviewChatHistory
        nodeId={nodeId}
        descriptionContent={descriptionContent}
        title={initialTabTitle}
        showDescription={showDescription}
        showTitle={showTitle}
        previewMessages={previewMessages}
        avatarUrl={userAvatarUrl ?? undefined}
        avatarFallback={avatarFallback}
        incomingBubbleVariant="default"
        receivingBubbleVariant="orange"
        flat={continuousSession}
        className={continuousSession ? undefined : 'min-h-0 flex-1'}
      />

      {showInlineChrome ? footerChrome : null}

      <DnDMathSubmitConfirmDialog
        open={submitDialogOpen}
        onOpenChange={setSubmitDialogOpen}
        onConfirm={handleConfirmSubmit}
      />
    </div>
  )
}
