// No math. No constants. Dumb receiver of Python output.

export type ScoringBranch = 'hard_zero' | 'full_marks' | 'near_full' | 'partial'

/** `coming_soon` — placeholder until the production scoring worker is live. */
export type ScoringAvailability = 'live' | 'coming_soon'

export type ScoringRequest = {
  studentAnswer: string
  teacherSolution: string
  totalPoints: number
  institutionId: string
  sessionParticipantId: string
}

export type ScoringResponse = {
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
  availability: ScoringAvailability
}

/** Shape written to game_session_participants.scores_detail JSONB */
export type ScoringRow = ScoringResponse & {
  scoredAt: string // ISO timestamp added by frontend before write
  sessionParticipantId: string
}
