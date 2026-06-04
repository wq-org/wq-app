import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import { useTranslation } from 'react-i18next'

import { DEFAULT_SCORING_CONFIG } from '../constants/scoring.defaults'
import type { DragDropMathCanvasRow } from '../types/drag-drop-math.schema'
import type { DragDropMathExerciseTab } from '../types/exercise-tab.types'
import {
  buildStudentAnswers,
  buildTeacherStepTree,
  pscaScore,
  resolveFailedStepTokenIds,
} from '../utils/scoring'
import {
  formatDnDMathScore,
  resolveDnDMathExerciseScoreShares,
} from '../utils/exerciseScoreDistribution'

const ITERATION_ADVANCE_DELAY_MS = 1200

export type DnDMathPreviewGameMessage = {
  id: string
  direction: 'sending' | 'receiving'
  kind: 'text' | 'loading' | 'math'
  text?: string
  rows?: DragDropMathCanvasRow[]
  /** When true, bubble text is rendered bold (used for score feedback and tab summaries). */
  bold?: boolean
}

function buildExerciseTitleMessage(
  nodeId: string,
  tabIndex: number,
  title: string,
  seq: number,
): DnDMathPreviewGameMessage | null {
  const text = title.trim()
  if (text.length === 0) return null
  return {
    id: `${nodeId}-tab-title-${tabIndex}-${seq}`,
    direction: 'receiving',
    kind: 'text',
    text,
    bold: true,
  }
}

function buildInitialMessages(
  nodeId: string,
  tabs: readonly DragDropMathExerciseTab[],
): DnDMathPreviewGameMessage[] {
  const firstTitle = buildExerciseTitleMessage(nodeId, 0, tabs[0]?.title ?? '', 0)
  return firstTitle ? [firstTitle] : []
}

type UseDnDMathPreviewGameArgs = {
  nodeId: string
  submitPrompt: string
  /** Total points budget for the whole node — distributed evenly across tabs. */
  totalMaxScore: number
  /** Authored exercise tabs. Each tab is one iteration step in the preview. */
  tabs: readonly DragDropMathExerciseTab[]
  studentRows: readonly DragDropMathCanvasRow[]
  /** When false, submit dialog and confirm are no-ops (e.g. empty canvas). */
  hasSubmittableCanvas?: boolean
}

function fireCorrectConfetti(): void {
  confetti({
    particleCount: 150,
    spread: 70,
    origin: { y: 0.6 },
  })
}

/**
 * Coordinates submit-flow state for drag-drop-math preview.
 *
 * Each exercise tab is one isolated step: PSCA scores against its
 * distributed share of the node's max score. Points and feedback reveal
 * as soon as scoring finishes. After a non-final tab, the hook waits
 * {@link ITERATION_ADVANCE_DELAY_MS} ms, advances the
 * current tab index, unlocks the canvas, and pushes the next tab's
 * title into the chat stream so the parent can react to a single
 * `currentTabIndex` change.
 */
export function useDnDMathPreviewGame({
  nodeId,
  submitPrompt,
  totalMaxScore,
  tabs,
  studentRows,
  hasSubmittableCanvas = true,
}: UseDnDMathPreviewGameArgs) {
  const { t } = useTranslation('features.gameStudio')
  const [messages, setMessages] = useState<DnDMathPreviewGameMessage[]>(() =>
    buildInitialMessages(nodeId, tabs),
  )
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false)
  const [submissionLocked, setSubmissionLocked] = useState(false)
  const [runningEarnedScore, setRunningEarnedScore] = useState(0)
  const [errorTokenIds, setErrorTokenIds] = useState<string[]>([])
  const [currentTabIndex, setCurrentTabIndex] = useState(0)
  const seqRef = useRef(0)
  const advanceTimeoutRef = useRef<number | null>(null)

  const tabCount = tabs.length
  const safeTabIndex = tabCount > 0 ? Math.min(currentTabIndex, tabCount - 1) : 0
  const isFinalTab = safeTabIndex >= tabCount - 1

  const exerciseScoreShares = useMemo(
    () => resolveDnDMathExerciseScoreShares(totalMaxScore, tabCount),
    [tabCount, totalMaxScore],
  )
  const perTabMaxScore = exerciseScoreShares[safeTabIndex]?.maxScore ?? 0

  const allTabsCompleted = submissionLocked && isFinalTab
  const canSubmit = !submissionLocked && hasSubmittableCanvas

  const clearTimers = useCallback(() => {
    if (advanceTimeoutRef.current !== null) {
      window.clearTimeout(advanceTimeoutRef.current)
      advanceTimeoutRef.current = null
    }
  }, [])

  useEffect(() => {
    return clearTimers
  }, [clearTimers])

  useEffect(() => {
    clearTimers()
    seqRef.current = 0
    setMessages(buildInitialMessages(nodeId, tabs))
    setSubmitDialogOpen(false)
    setSubmissionLocked(false)
    setRunningEarnedScore(0)
    setErrorTokenIds([])
    setCurrentTabIndex(0)
  }, [clearTimers, nodeId, tabs, totalMaxScore])

  useEffect(() => {
    if (tabCount === 0) return
    if (currentTabIndex >= tabCount) setCurrentTabIndex(0)
  }, [currentTabIndex, tabCount])

  const openSubmitDialog = () => {
    if (!canSubmit) return
    setSubmitDialogOpen(true)
  }

  const handleConfirmSubmit = () => {
    if (!canSubmit) return
    const activeTab = tabs[safeTabIndex]
    if (!activeTab) return

    const submitSeq = ++seqRef.current
    setMessages((prev) => [
      ...prev,
      {
        id: `${nodeId}-submit-prompt-${safeTabIndex}-${submitSeq}`,
        direction: 'sending',
        kind: 'text',
        text: submitPrompt,
      },
      {
        id: `${nodeId}-submit-loading-${safeTabIndex}-${submitSeq}`,
        direction: 'receiving',
        kind: 'loading',
      },
    ])

    const teacher = buildTeacherStepTree(activeTab.canvasRows)
    const student =
      teacher && buildStudentAnswers(studentRows, teacher.steps, DEFAULT_SCORING_CONFIG.tolerance)

    const result =
      teacher && student
        ? pscaScore(teacher.tree, student.answers, DEFAULT_SCORING_CONFIG, perTabMaxScore)
        : null

    const perTabEarned = result?.awardedPoints ?? 0
    const perTabScore = result?.score ?? 0
    const isPerTabMax = perTabScore >= 1
    const cappedRunning = Math.min(runningEarnedScore + perTabEarned, totalMaxScore)
    const submittedRows = studentRows.map((row) => ({ ...row }))

    setRunningEarnedScore(cappedRunning)
    setErrorTokenIds(
      result && student
        ? resolveFailedStepTokenIds(result.perStep, student.studentTokenIdByStepId)
        : [],
    )
    setSubmissionLocked(true)
    setSubmitDialogOpen(false)

    clearTimers()

    const revealSeq = ++seqRef.current
    const tabIsFinal = safeTabIndex >= tabCount - 1
    const hasMultipleTabs = tabCount > 1
    const totalMaxReached = cappedRunning >= totalMaxScore && totalMaxScore > 0

    setMessages((prev) => {
      const withoutLoading = prev.filter((message) => message.kind !== 'loading')
      const next: DnDMathPreviewGameMessage[] = [
        ...withoutLoading,
        {
          id: `${nodeId}-submit-rows-${safeTabIndex}-${revealSeq}`,
          direction: 'sending',
          kind: 'math',
          rows: submittedRows,
        },
        {
          id: `${nodeId}-submit-points-${safeTabIndex}-${revealSeq}`,
          direction: 'receiving',
          kind: 'text',
          bold: true,
          text: t('dragDropMathGamePreview.pointsEarnedMessage', {
            points: formatDnDMathScore(perTabEarned),
          }),
        },
      ]
      if (isPerTabMax && tabIsFinal) {
        next.push({
          id: `${nodeId}-submit-max-score-${safeTabIndex}-${revealSeq}`,
          direction: 'receiving',
          kind: 'text',
          text: t('dragDropMathGamePreview.maxScoreAchievedMessage'),
        })
      }
      if (tabIsFinal && hasMultipleTabs) {
        next.push({
          id: `${nodeId}-submit-final-summary-${revealSeq}`,
          direction: 'receiving',
          kind: 'text',
          bold: true,
          text: t('dragDropMathGamePreview.iterationFinalSummary', {
            earned: formatDnDMathScore(cappedRunning),
            total: formatDnDMathScore(totalMaxScore),
          }),
        })
      }
      return next
    })

    if (tabIsFinal && totalMaxReached) fireCorrectConfetti()

    if (tabIsFinal) return

    advanceTimeoutRef.current = window.setTimeout(() => {
      const advanceSeq = ++seqRef.current
      const nextIndex = safeTabIndex + 1
      const nextTab = tabs[nextIndex]
      const nextTitle = nextTab?.title?.trim() ?? ''
      setCurrentTabIndex(nextIndex)
      setSubmissionLocked(false)
      setErrorTokenIds([])
      const nextTitleMessage = buildExerciseTitleMessage(nodeId, nextIndex, nextTitle, advanceSeq)
      if (nextTitleMessage) {
        setMessages((prev) => [...prev, nextTitleMessage])
      }
      advanceTimeoutRef.current = null
    }, ITERATION_ADVANCE_DELAY_MS)
  }

  return {
    messages,
    submitDialogOpen,
    setSubmitDialogOpen,
    openSubmitDialog,
    handleConfirmSubmit,
    submissionLocked,
    runningEarnedScore,
    perTabMaxScore,
    errorTokenIds,
    currentTabIndex: safeTabIndex,
    allTabsCompleted,
    exerciseScoreShares,
  }
}
