import type {
  GameRunAnalyticsItem,
  GameRunStudentAttempt,
  GameRunStudentGroup,
} from '../types/classroom-game.types'

function toTimestamp(value: string | null): number {
  if (!value) return 0
  const time = new Date(value).getTime()
  return Number.isNaN(time) ? 0 : time
}

/**
 * Regroups run-centric analytics rows into one group per student with their
 * attempts (newest first), best score, and last played timestamp.
 */
export function groupGameRunsByStudent(
  runs: readonly GameRunAnalyticsItem[],
): GameRunStudentGroup[] {
  const attemptsByUser = new Map<
    string,
    { displayName: string; attempts: GameRunStudentAttempt[] }
  >()

  for (const run of runs) {
    for (const participant of run.participants) {
      const attempt: GameRunStudentAttempt = {
        runId: run.id,
        participantId: participant.id,
        playedAt: participant.completedAt ?? run.startedAt ?? run.endedAt,
        score: participant.score,
        sessionPayload: participant.sessionPayload,
      }

      const existing = attemptsByUser.get(participant.userId)
      if (existing) {
        existing.attempts.push(attempt)
      } else {
        attemptsByUser.set(participant.userId, {
          displayName: participant.displayName,
          attempts: [attempt],
        })
      }
    }
  }

  const groups: GameRunStudentGroup[] = []

  for (const [userId, entry] of attemptsByUser) {
    const attempts = [...entry.attempts].sort(
      (a, b) => toTimestamp(b.playedAt) - toTimestamp(a.playedAt),
    )

    groups.push({
      userId,
      displayName: entry.displayName,
      attemptCount: attempts.length,
      bestScore: attempts.reduce((max, row) => Math.max(max, row.score), 0),
      lastPlayedAt: attempts[0]?.playedAt ?? null,
      attempts,
    })
  }

  return groups.sort((a, b) => a.displayName.localeCompare(b.displayName))
}
