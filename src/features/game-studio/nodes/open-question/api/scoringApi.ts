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

const LOCAL_WORKER_HOST_PATTERN = /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?/i

/** Ensures POST targets `/auto-score/` whether the env URL is the host root or full prefix. */
function normalizeConfiguredWorkerBaseUrl(raw: string): string {
  const trimmed = raw.trim().replace(/\/$/, '')
  if (trimmed.endsWith('/auto-score')) return trimmed
  return `${trimmed}/auto-score`
}

/**
 * In dev, route local worker calls through the Vite proxy (`/api/scoring` → `/auto-score`)
 * so the browser avoids CORS failures from direct `127.0.0.1:8000` requests.
 */
function resolveScoringWorkerBaseUrl(): string {
  const configured =
    import.meta.env.VITE_SCORING_WORKER_URL?.trim() ||
    import.meta.env.VITE_GRADING_WORKER_URL?.trim()

  if (configured) {
    const normalized = normalizeConfiguredWorkerBaseUrl(configured)
    if (import.meta.env.DEV && LOCAL_WORKER_HOST_PATTERN.test(normalized)) {
      return '/api/scoring'
    }
    return normalized
  }

  return '/api/scoring'
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
  }
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

export async function scoreOpenQuestionAnswer(request: ScoringRequest): Promise<ScoringResponse> {
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
