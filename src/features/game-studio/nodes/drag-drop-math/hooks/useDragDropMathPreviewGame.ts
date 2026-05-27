import { useEffect, useMemo, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import { useTranslation } from 'react-i18next'

import { DEFAULT_SCORING_CONFIG } from '../constants/scoring.defaults'
import type { DragDropMathCanvasRow } from '../types/drag-drop-math.schema'
import {
  buildStudentAnswers,
  buildTeacherStepTree,
  pscaScore,
  resolveFailedStepTokenIds,
} from '../utils/scoring'

const POINTS_REVEAL_DELAY_MS = 500

export type DragDropMathPreviewGameMessage = {
  id: string
  direction: 'sending' | 'receiving'
  kind: 'text' | 'loading' | 'math'
  text?: string
  rows?: DragDropMathCanvasRow[]
  /** When true, bubble text is rendered bold (used for score feedback). */
  bold?: boolean
}

type UseDragDropMathPreviewGameArgs = {
  nodeId: string
  submitPrompt: string
  maxScore: number
  teacherRows: readonly DragDropMathCanvasRow[]
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
 * Uses full PSCA weights on every committed result chip (per row), aligned by row id.
 */
export function useDragDropMathPreviewGame({
  nodeId,
  submitPrompt,
  maxScore,
  teacherRows,
  studentRows,
  hasSubmittableCanvas = true,
}: UseDragDropMathPreviewGameArgs) {
  const { t } = useTranslation('features.gameStudio')
  const [messages, setMessages] = useState<DragDropMathPreviewGameMessage[]>([])
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false)
  const [submissionLocked, setSubmissionLocked] = useState(false)
  const [earnedScore, setEarnedScore] = useState(0)
  const [errorTokenIds, setErrorTokenIds] = useState<string[]>([])
  const seqRef = useRef(0)
  const revealTimeoutRef = useRef<number | null>(null)

  const canSubmit = useMemo(
    () => !submissionLocked && hasSubmittableCanvas,
    [hasSubmittableCanvas, submissionLocked],
  )

  useEffect(() => {
    return () => {
      if (revealTimeoutRef.current !== null) {
        window.clearTimeout(revealTimeoutRef.current)
        revealTimeoutRef.current = null
      }
    }
  }, [])

  const openSubmitDialog = () => {
    if (!canSubmit) return
    setSubmitDialogOpen(true)
  }

  const handleConfirmSubmit = () => {
    if (!canSubmit) return

    const submitSeq = ++seqRef.current
    setMessages((prev) => [
      ...prev,
      {
        id: `${nodeId}-submit-prompt-${submitSeq}`,
        direction: 'sending',
        kind: 'text',
        text: submitPrompt,
      },
      {
        id: `${nodeId}-submit-loading-${submitSeq}`,
        direction: 'receiving',
        kind: 'loading',
      },
    ])

    const teacher = buildTeacherStepTree(teacherRows)
    const student =
      teacher && buildStudentAnswers(studentRows, teacher.steps, DEFAULT_SCORING_CONFIG.tolerance)

    const result =
      teacher && student
        ? pscaScore(teacher.tree, student.answers, DEFAULT_SCORING_CONFIG, maxScore)
        : null

    const nextScore = result?.awardedPoints ?? 0
    const isMax = (result?.score ?? 0) >= 1
    setEarnedScore(nextScore)

    if (result && student) {
      setErrorTokenIds(resolveFailedStepTokenIds(result.perStep, student.studentTokenIdByStepId))
    } else {
      setErrorTokenIds([])
    }

    setSubmissionLocked(true)
    setSubmitDialogOpen(false)

    if (revealTimeoutRef.current !== null) {
      window.clearTimeout(revealTimeoutRef.current)
      revealTimeoutRef.current = null
    }

    revealTimeoutRef.current = window.setTimeout(() => {
      const revealSeq = ++seqRef.current
      setMessages((prev) => {
        const withoutLoading = prev.filter((message) => message.kind !== 'loading')
        const pointsMessage: DragDropMathPreviewGameMessage = {
          id: `${nodeId}-submit-points-${revealSeq}`,
          direction: 'receiving',
          kind: 'text',
          bold: true,
          text: t('dragDropMathGamePreview.pointsEarnedMessage', {
            points: Number(nextScore.toFixed(1)),
          }),
        }
        const submissionRowsMessage: DragDropMathPreviewGameMessage = {
          id: `${nodeId}-submit-rows-${revealSeq}`,
          direction: 'sending',
          kind: 'math',
          rows: studentRows.map((row) => ({ ...row })),
        }
        const maxScoreMessage: DragDropMathPreviewGameMessage = {
          id: `${nodeId}-submit-max-score-${revealSeq}`,
          direction: 'receiving',
          kind: 'text',
          text: t('dragDropMathGamePreview.maxScoreAchievedMessage'),
        }
        return isMax
          ? [...withoutLoading, submissionRowsMessage, pointsMessage, maxScoreMessage]
          : [...withoutLoading, submissionRowsMessage, pointsMessage]
      })

      if (isMax) fireCorrectConfetti()
      revealTimeoutRef.current = null
    }, POINTS_REVEAL_DELAY_MS)
  }

  return {
    messages,
    submitDialogOpen,
    setSubmitDialogOpen,
    openSubmitDialog,
    handleConfirmSubmit,
    submissionLocked,
    earnedScore,
    errorTokenIds,
  }
}
