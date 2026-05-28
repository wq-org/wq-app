// src/features/grading/types/grading.types.ts
// No math. No constants. Dumb receiver of Python output.

export type ScoringBranch = 'hard_zero' | 'full_marks' | 'partial'

export interface GradingRequest {
  studentAnswer: string
  teacherSolution: string
  totalPoints: number
  institutionId: string
  sessionParticipantId: string
}

export interface GradingResponse {
  // 6 radar chart axes — sent back as-is from the worker
  jaccardScore: number
  invertedEditScore: number
  cosineScore: number
  normalizedWordCount: number // may exceed 1.0 — cap to 1.0 in chart render only
  semanticScore: number

  // Pipeline outputs
  baseScore: number
  confidenceScore: number
  finalScore: number

  // Derived
  marksAwarded: number
  totalPoints: number
  scoringBranch: ScoringBranch
  requiresTeacherAttention: boolean
}

/** Shape written to game_session_participants.scores_detail JSONB */
export type GradingRow = GradingResponse & {
  gradedAt: string // ISO timestamp added by frontend before write
  sessionParticipantId: string
}
