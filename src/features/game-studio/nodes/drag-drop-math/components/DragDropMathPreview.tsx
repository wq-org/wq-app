'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
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
  useDragDropMathCanvasRows,
} from './canvas'
import { useDragDropMathPreviewGame } from '../hooks'
import { DropMathNode } from './DropMathNode'
import { DropMathStaticNode } from './DropMathStaticNode'
import { DropTextNode } from './DropTextNode'
import { SigmaNode } from './SigmaNode'
import { DnDMathChatInput } from './DnDMathChatInput'
import { DragDropMathPreviewChatHistory } from './DragDropMathPreviewChatHistory'
import { DragDropMathSubmitConfirmDialog } from './DragDropMathSubmitConfirmDialog'
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

export type DragDropMathPreviewProps = {
  nodeId: string
  nodeData?: GameDragDropMathNodeData
}

export function DragDropMathPreview({ nodeId, nodeData }: DragDropMathPreviewProps) {
  const { t } = useTranslation('features.gameStudio')
  const { profile } = useUser()
  const { url: userAvatarUrl } = useAvatarUrl(profile?.avatar_url ?? null)

  const defaultTabTitle = t('dragDropMathEditor.newExerciseTabLabel')
  const pin = useMemo(() => nodeData ?? {}, [nodeData])
  const instantColorFeedback = pin.instantColorFeedback !== false
  const maxScore = resolveGameDragDropMathPoints(pin.points)

  const { tabs } = useMemo(
    () => resolveExerciseTabsState(pin, defaultTabTitle),
    [pin, defaultTabTitle],
  )

  const [canvasRows, setCanvasRows] = useState<DragDropMathCanvasRow[]>([])
  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  const [howToPlayMessages, setHowToPlayMessages] = useState<
    ReturnType<typeof useDragDropMathPreviewGame>['messages']
  >([])

  const howToPlayPrompt = t('dragDropMathGamePreview.howToPlayPrompt')
  const howToPlayResponse = useMemo(
    () =>
      buildDragDropMathHowToPlayResponse(
        t('dragDropMathGamePreview.howToPlayScoringResponse', { maxPoints: maxScore }),
        t('dragDropMathGamePreview.howToPlayResponse'),
      ),
    [maxScore, t],
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
  } = useDragDropMathCanvasRows({
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
  } = useDragDropMathPreviewGame({
    nodeId,
    submitPrompt: t('dragDropMathGamePreview.submitAnswerPrompt'),
    totalMaxScore: maxScore,
    tabs,
    studentRows: canvasRows,
    hasSubmittableCanvas: !isCanvasEmpty,
  })

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
        },
      ] as const satisfies readonly Ai02PromptSuggestion[],
    [allTabsCompleted, howToPlayPrompt, isCanvasEmpty, submissionLocked, t],
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

  return (
    <div className="flex h-full flex-col gap-3">
      <Text
        as="p"
        variant="small"
        color="orange"
        className="shrink-0"
      >
        {t('dragDropMathGamePreview.previewNotice')}
      </Text>

      {hasMultipleTabs ? (
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

      <DragDropMathPreviewChatHistory
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
        className="min-h-0 flex-1"
      />

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
          interactionLocked={submissionLocked}
          instantColorFeedback={instantColorFeedback}
          onRowsReorder={submissionLocked ? () => {} : reorderRows}
          onTokenValueChange={submissionLocked ? () => {} : updateTokenValue}
          onMathTokenCommit={submissionLocked ? () => {} : commitMathEquation}
          onTokenRemove={submissionLocked ? () => {} : removeToken}
          onSigmaRemove={submissionLocked ? () => {} : removeSigmaRow}
          score={runningEarnedScore}
          maxScore={maxScore}
        />

        <DragOverlay
          dropAnimation={null}
          modifiers={[snapCenterToCursor]}
        >
          {activeDragPreview}
        </DragOverlay>
      </DndContext>
      <DragDropMathSubmitConfirmDialog
        open={submitDialogOpen}
        onOpenChange={setSubmitDialogOpen}
        onConfirm={handleConfirmSubmit}
      />
    </div>
  )
}
