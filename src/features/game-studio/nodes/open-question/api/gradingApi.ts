import type { GradingRequest, GradingResponse, ScoringBranch } from '../types/grading.types'

type GradeResponseRow = {
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

type GradeRequestBody = {
  student_answer: string
  teacher_solution: string
  total_points: number
  institution_id: string
  session_participant_id: string
}

function resolveGradingWorkerBaseUrl(): string {
  const configured = import.meta.env.VITE_GRADING_WORKER_URL?.trim()
  if (configured) {
    return configured.replace(/\/$/, '')
  }
  return '/api/grading'
}

function toGradingResponse(row: GradeResponseRow): GradingResponse {
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
function toGradingApiTotalPoints(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 1
  return Math.max(1, Math.round(value))
}

/** POST body — only five fields; no exercise description or Lexical content. */
function toGradeRequestBody(request: GradingRequest): GradeRequestBody {
  return {
    student_answer: request.studentAnswer.trim(),
    teacher_solution: request.teacherSolution.trim(),
    total_points: toGradingApiTotalPoints(request.totalPoints),
    institution_id: request.institutionId,
    session_participant_id: request.sessionParticipantId,
  }
}

export async function gradeOpenQuestionAnswer(request: GradingRequest): Promise<GradingResponse> {
  const baseUrl = resolveGradingWorkerBaseUrl()
  const response = await fetch(`${baseUrl}/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toGradeRequestBody(request)),
  })

  if (!response.ok) {
    throw new Error(`Grading request failed (${response.status})`)
  }

  const row = (await response.json()) as GradeResponseRow
  return toGradingResponse(row)
}
