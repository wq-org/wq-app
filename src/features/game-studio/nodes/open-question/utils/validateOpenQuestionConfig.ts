import type { PublishIssue } from '../../../types/publish-validation.types'
import { extractPlainTextFromLexicalState } from './extractPlainTextFromLexicalState'
import {
  collectGradableOpenQuestions,
  collectPreviewableOpenQuestions,
} from './openQuestionDistribution'
import { resolveGameOpenQuestionPoints } from './openQuestionPoints'
import type { GameOpenQuestionNodeData } from '../types/open-question.schema'

export function validateOpenQuestionConfig(data: unknown): PublishIssue[] {
  const issues: PublishIssue[] = []
  const d = (data ?? {}) as GameOpenQuestionNodeData

  const previewable = collectPreviewableOpenQuestions(d.questions)
  if (previewable.length === 0) {
    issues.push({ code: 'openQuestion.prompt.missing', severity: 'error' })
  }

  const gradable = collectGradableOpenQuestions(d.questions)
  if (previewable.length > 0 && gradable.length < previewable.length) {
    issues.push({
      code: 'openQuestion.answer.missing',
      severity: 'error',
      params: { count: previewable.length - gradable.length },
    })
  }

  const points = resolveGameOpenQuestionPoints(d.points)
  if (!Number.isFinite(points) || points <= 0) {
    issues.push({ code: 'openQuestion.points.invalid', severity: 'error' })
  }

  const descriptionText = extractPlainTextFromLexicalState(d.descriptionContent)
  if (!descriptionText.trim()) {
    issues.push({ code: 'openQuestion.meta.missingDescription', severity: 'warning' })
  }

  return issues
}
