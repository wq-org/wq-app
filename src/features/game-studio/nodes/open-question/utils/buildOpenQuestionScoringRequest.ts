import type { ScoringRequest } from '../types/scoring.types'

export type BuildOpenQuestionScoringRequestArgs = {
  /** Learner text from the preview composer (current exercise only). */
  studentAnswer: string
  /** Reference answer from `OpenQuestionAuthoredQuestion.answer` — never the Lexical description. */
  referenceAnswer: string
  pointsPerQuestion: number
  institutionId: string
  sessionParticipantId: string
}

/**
 * Maps preview state to the scoring worker payload.
 *
 * Intentionally excludes `descriptionContent`, exercise `question` prompts, titles,
 * and any Lexical/HTML — only the reference answer and learner reply are compared.
 */
export function buildOpenQuestionScoringRequest(
  args: BuildOpenQuestionScoringRequestArgs,
): ScoringRequest {
  return {
    studentAnswer: args.studentAnswer.trim(),
    teacherSolution: args.referenceAnswer.trim(),
    totalPoints: args.pointsPerQuestion > 0 ? args.pointsPerQuestion : 1,
    institutionId: args.institutionId,
    sessionParticipantId: args.sessionParticipantId,
  }
}
