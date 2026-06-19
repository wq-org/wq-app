import { resolveScoringWorkerFetchBaseUrl } from '@/lib/scoringWorkerEnv'
import type { ScoringBranch, ScoringRequest, ScoringResponse } from '../types/scoring.types'

type ScoringResponseRow = {
  jaccard_score: number
  inverted_edit_score: number
  cosine_score: number
  normalized_word_count: number
  semantic_score: number
  base_score: number
  confidence_score: number
  final_score: number
  marks_awarded: number
  total_points: number
  scoring_branch: ScoringBranch
  requires_teacher_attention: boolean
}

type ScoringRequestBody = {
  student_answer: string
  teacher_solution: string
  total_points: number
  institution_id: string
  session_participant_id: string
}

function resolveScoringWorkerBaseUrl(): string {
  return resolveScoringWorkerFetchBaseUrl({
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SCORING_WORKER_URL: import.meta.env.VITE_SCORING_WORKER_URL,
    VITE_GRADING_WORKER_URL: import.meta.env.VITE_GRADING_WORKER_URL,
    VITE_SCORING_WORKER_PORT: import.meta.env.VITE_SCORING_WORKER_PORT,
    DEV: import.meta.env.DEV,
  })
}

/** Worker schema: `total_points: int` with `gt=0` — UI may show one-decimal splits (e.g. 3.3). */
function toScoringApiTotalPoints(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 1
  return Math.max(1, Math.round(value))
}

/** POST body — only five fields; no exercise description or Lexical content. */
function toScoringRequestBody(request: ScoringRequest): ScoringRequestBody {
  return {
    student_answer: request.studentAnswer.trim(),
    teacher_solution: request.teacherSolution.trim(),
    total_points: toScoringApiTotalPoints(request.totalPoints),
    institution_id: request.institutionId,
    session_participant_id: request.sessionParticipantId,
  }
}

function toScoringResponse(row: ScoringResponseRow): ScoringResponse {
  return {
    jaccardScore: row.jaccard_score,
    invertedEditScore: row.inverted_edit_score,
    cosineScore: row.cosine_score,
    normalizedWordCount: row.normalized_word_count,
    semanticScore: row.semantic_score,
    baseScore: row.base_score,
    confidenceScore: row.confidence_score,
    finalScore: row.final_score,
    marksAwarded: row.marks_awarded,
    totalPoints: row.total_points,
    scoringBranch: row.scoring_branch,
    requiresTeacherAttention: row.requires_teacher_attention,
    availability: 'live',
  }
}

/** Where scoring is invoked — preview defaults to the PSCA coming-soon placeholder. */
export type ScoringClientContext = 'default' | 'game-studio-preview'

/**
 * `default` — live worker in dev unless `VITE_SCORING_WORKER_ENABLED=false`; production needs `=true`.
 * `game-studio-preview` — placeholder unless `VITE_SCORING_WORKER_ENABLED=true` (author preview UX).
 */
export function isLiveScoringEnabled(context: ScoringClientContext = 'default'): boolean {
  const explicit = import.meta.env.VITE_SCORING_WORKER_ENABLED?.trim().toLowerCase()
  if (explicit === 'true') return true
  if (explicit === 'false') return false
  if (context === 'game-studio-preview') return false
  return import.meta.env.DEV
}

/**
 * Instant placeholder for production until the scoring worker is deployed.
 * No network call — preview can continue with a clear “coming soon” message.
 */
export function buildScoringComingSoonResponse(request: ScoringRequest): ScoringResponse {
  const totalPoints = toScoringApiTotalPoints(request.totalPoints)

  return {
    jaccardScore: 0,
    invertedEditScore: 0,
    cosineScore: 0,
    normalizedWordCount: 0,
    semanticScore: 0,
    baseScore: 0,
    confidenceScore: 0,
    finalScore: 0,
    marksAwarded: 0,
    totalPoints,
    scoringBranch: 'partial',
    requiresTeacherAttention: false,
    availability: 'coming_soon',
  }
}

async function fetchScoreFromWorker(request: ScoringRequest): Promise<ScoringResponse> {
  const baseUrl = resolveScoringWorkerBaseUrl()
  const response = await fetch(`${baseUrl}/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toScoringRequestBody(request)),
  })

  if (!response.ok) {
    const detail = import.meta.env.DEV ? await response.text().catch(() => '') : ''
    throw new Error(
      detail
        ? `Scoring request failed (${response.status}): ${detail}`
        : `Scoring request failed (${response.status})`,
    )
  }

  const row = (await response.json()) as ScoringResponseRow
  return toScoringResponse(row)
}

export async function scoreOpenQuestionAnswer(
  request: ScoringRequest,
  context: ScoringClientContext = 'default',
): Promise<ScoringResponse> {
  if (!isLiveScoringEnabled(context)) {
    return buildScoringComingSoonResponse(request)
  }

  return fetchScoreFromWorker(request)
}
