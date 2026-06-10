import type { ThemeId } from '@/lib/themes'

export type ClassroomDeliveredGame = {
  id: string
  title: string
  description: string
  themeId: ThemeId
  version: number
}

export type GameRunParticipantSummary = {
  id: string
  userId: string
  displayName: string
  score: number
  completedAt: string | null
  sessionPayload: unknown
}

export type GameRunAnalyticsItem = {
  id: string
  mode: string
  status: string
  startedAt: string | null
  endedAt: string | null
  participants: readonly GameRunParticipantSummary[]
}

export type GameComponentScore = {
  nodeId: string
  label: string
  score: number
  maxScore: number
}

export type GameRunParticipantDetail = GameRunParticipantSummary & {
  componentScores: readonly GameComponentScore[]
  totalScore: number
  maxTotalScore: number
}

export type GameRunAnalyticsDetail = GameRunAnalyticsItem & {
  participantDetails: readonly GameRunParticipantDetail[]
}
