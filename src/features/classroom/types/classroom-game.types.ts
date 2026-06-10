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
  avatarUrl: string | null
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
  versionNo: number | null
  versionTitle: string | null
  participants: readonly GameRunParticipantSummary[]
}

export type GameComponentScore = {
  nodeId: string
  nodeType: string
  label: string
  score: number
  maxScore: number
  /** Signed or public preview URL when the node is an Image Pin. */
  imagePreview?: string
  /** Storage path for re-signing expired Image Pin previews. */
  imageFilepath?: string
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
  description: string
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
  versionNo: number | null
  sessionPayload: unknown
}

export type GameRunStudentGroup = {
  userId: string
  displayName: string
  avatarUrl: string | null
  attemptCount: number
  bestScore: number
  lastPlayedAt: string | null
  attempts: readonly GameRunStudentAttempt[]
}
