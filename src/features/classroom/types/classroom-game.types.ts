import type { Edge, Node } from '@xyflow/react'

import type { ThemeId } from '@/lib/themes'
import type { GamePlayChatMessage, SessionResultsByNode } from '@/features/game-studio'

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

/** Delivery-pinned playable content for a game delivered to a classroom. */
export type ClassroomGamePlayContent = {
  gameId: string
  gameDeliveryId: string
  gameVersionId: string
  classroomId: string
  title: string
  themeId: ThemeId
  versionNo: number
  nodes: Node[]
  edges: Edge[]
}

export type RecordClassroomGameRunInput = {
  gameId: string
  classroomId: string
  gameDeliveryId: string
  gameVersionId: string
  score: number
  maxScore: number
  resultsByNode: SessionResultsByNode
  chatHistory: GamePlayChatMessage[]
  /** ISO timestamp when play began; defaults to save time. */
  startedAt?: string
}

export type GameRunStudentAttempt = {
  runId: string
  participantId: string
  playedAt: string | null
  score: number
  sessionPayload: unknown
}

export type GameRunStudentGroup = {
  userId: string
  displayName: string
  attemptCount: number
  bestScore: number
  lastPlayedAt: string | null
  attempts: readonly GameRunStudentAttempt[]
}
