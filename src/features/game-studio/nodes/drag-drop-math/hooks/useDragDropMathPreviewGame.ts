import { useEffect, useMemo, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import { useTranslation } from 'react-i18next'

import { R_ONLY_SCORING_CONFIG } from '../constants/scoring.defaults'
import type { DragDropMathCanvasRow } from '../types/drag-drop-math.schema'
import { buildStudentAnswers, buildTeacherStepTree, pscaScore } from '../utils/scoring'

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
 * Responsibilities:
 * - submit confirmation workflow
 * - single-step PSCA scoring (R-only config for MVP)
 * - message-thread updates (prompt, loading, points, optional max-score congrats)
 * - submission lock and error-token highlighting metadata
 */
export function useDragDropMathPreviewGame({
  nodeId,
  submitPrompt,
  maxScore,
  teacherRows,
  studentRows,
}: UseDragDropMathPreviewGameArgs) {
  const { t } = useTranslation('features.gameStudio')
  const [messages, setMessages] = useState<DragDropMathPreviewGameMessage[]>([])
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false)
  const [submissionLocked, setSubmissionLocked] = useState(false)
  const [earnedScore, setEarnedScore] = useState(0)
  const [errorTokenIds, setErrorTokenIds] = useState<string[]>([])
  const seqRef = useRef(0)
  const revealTimeoutRef = useRef<number | null>(null)

  const canSubmit = useMemo(() => !submissionLocked, [submissionLocked])

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
    const student = buildStudentAnswers(studentRows)

    const result =
      teacher && student
        ? pscaScore(teacher.tree, student.answers, R_ONLY_SCORING_CONFIG, maxScore)
        : null

    const nextScore = result?.awardedPoints ?? 0
    const isMax = (result?.score ?? 0) >= 1
    setEarnedScore(nextScore)

    if (result && student && result.perStep.some((step) => step.s === 0)) {
      setErrorTokenIds([student.sourceTokenId])
    } else {
      setErrorTokenIds([])
    }

    if (revealTimeoutRef.current !== null) {
      window.clearTimeout(revealTimeoutRef.current)
      revealTimeoutRef.current = null
    }

    revealTimeoutRef.current = window.setTimeout(() => {
      const revealSeq = ++seqRef.current
      setMessages((prev) => {
        const withoutLoading = prev.filter((message) => message.kind !== 'loading')
        // Points appear once in chat (`pointsEarnedMessage`). Max-score congrats has no number
        // (avoids duplicate "10 pts" style copy). `nextScore` is capped by PSCA: score ∈ [0,1] → awarded ≤ maxScore.
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
      setSubmissionLocked(true)
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
