import type { GameResultTableRow } from './GameResultTable'

export type GameSimulationStatus = 'correct' | 'wrong' | 'mixed'

export interface GameSimulationResponseData {
  summaryText: string
  timeLabel: string
  rows: GameResultTableRow[]
  totalEarned: number
  totalMax: number
  status: GameSimulationStatus
  correctCount: number
  wrongCount: number
}

type BuildGameSimulationSummaryInput = Omit<
  GameSimulationResponseData,
  'summaryText' | 'timeLabel'
> & {
  timeLabel?: string
}

function getDefaultTimeLabel() {
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date())
}

function createSummaryText({
  status,
  totalEarned,
  totalMax,
  correctCount,
  wrongCount,
}: Omit<GameSimulationResponseData, 'summaryText' | 'timeLabel' | 'rows'>) {
  const scoreText = `${totalEarned}/${totalMax} points`

  if (status === 'correct') {
    return `Nice work. You earned ${scoreText}. Open details for the full row-by-row breakdown.`
  }

  if (status === 'wrong') {
    return `That attempt missed the target. You earned ${scoreText}. Open details to review what needs to change.`
  }

  return `Partially correct: ${correctCount} correct and ${wrongCount} wrong for ${scoreText}. Open details for the full breakdown.`
}

export function buildGameSimulationSummary(
  input: BuildGameSimulationSummaryInput,
): GameSimulationResponseData {
  return {
    ...input,
    timeLabel: input.timeLabel ?? getDefaultTimeLabel(),
    summaryText: createSummaryText(input),
  }
}
