import type { Edge, Node } from '@xyflow/react'

import { supabase } from '@/lib/supabase'
import { isThemeId } from '@/lib/themes'

import type {
  ClassroomDeliveredGame,
  GameRunAnalyticsDetail,
  GameRunAnalyticsItem,
  GameRunParticipantDetail,
} from '../types/classroom-game.types'
import {
  parseGameRunComponentScores,
  sumComponentScores,
} from '../utils/parseGameRunComponentScores'

type DeliveredGameVersionSnapshot = {
  title: string | null
  description: string | null
  theme_id: string | null
  version_no: number
  content: { nodes?: Node[]; edges?: Edge[] } | null
}

type DeliveredGameRow = {
  game_id: string
  game_versions: DeliveredGameVersionSnapshot | DeliveredGameVersionSnapshot[] | null
  course_deliveries: { classroom_id: string } | { classroom_id: string }[] | null
}

type GameRunRow = {
  id: string
  mode: string
  status: string
  started_at: string | null
  ended_at: string | null
  game_sessions: Array<{
    id: string
    game_session_participants: Array<{
      id: string
      user_id: string
      score: number
      session_payload: unknown
      completed_at: string | null
      profiles: { display_name: string | null; username: string | null } | null
    }>
  }> | null
}

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null
  return Array.isArray(value) ? (value[0] ?? null) : value
}

function resolveDisplayName(
  profile: { display_name: string | null; username: string | null } | null | undefined,
): string {
  const displayName = profile?.display_name?.trim()
  if (displayName) return displayName
  const username = profile?.username?.trim()
  if (username) return username
  return 'Student'
}

function mapDeliveredGameRow(row: DeliveredGameRow): ClassroomDeliveredGame | null {
  const version = firstRelation(row.game_versions)
  if (!version) return null

  const themeId = version.theme_id && isThemeId(version.theme_id) ? version.theme_id : 'blue'

  return {
    id: row.game_id,
    title: version.title?.trim() || 'Untitled Game',
    description: version.description?.trim() || '',
    themeId,
    version: version.version_no,
  }
}

function mergeDeliveredGames(rows: DeliveredGameRow[]): ClassroomDeliveredGame[] {
  const seen = new Set<string>()
  const games: ClassroomDeliveredGame[] = []

  for (const row of rows) {
    if (seen.has(row.game_id)) continue
    seen.add(row.game_id)

    const mapped = mapDeliveredGameRow(row)
    if (mapped) games.push(mapped)
  }

  return games
}

const DELIVERED_GAME_SELECT = `
  game_id,
  game_versions!inner (
    title,
    description,
    theme_id,
    version_no
  )
` as const

export async function listClassroomDeliveredGames(
  classroomId: string,
): Promise<ClassroomDeliveredGame[]> {
  const { data: courseDeliveries, error: courseDeliveriesError } = await supabase
    .from('course_deliveries')
    .select('id')
    .eq('classroom_id', classroomId)
    .is('deleted_at', null)

  if (courseDeliveriesError) throw new Error(courseDeliveriesError.message)

  const courseDeliveryIds = (courseDeliveries ?? []).map((row: { id: string }) => row.id)

  const [directResult, courseLinkedResult] = await Promise.all([
    supabase
      .from('game_deliveries')
      .select(DELIVERED_GAME_SELECT)
      .eq('classroom_id', classroomId)
      .eq('status', 'published')
      .not('published_at', 'is', null),
    courseDeliveryIds.length > 0
      ? supabase
          .from('game_deliveries')
          .select(DELIVERED_GAME_SELECT)
          .in('course_delivery_id', courseDeliveryIds)
          .eq('status', 'published')
          .not('published_at', 'is', null)
      : Promise.resolve({ data: [], error: null }),
  ])

  if (directResult.error) throw new Error(directResult.error.message)
  if (courseLinkedResult.error) throw new Error(courseLinkedResult.error.message)

  return mergeDeliveredGames([
    ...((directResult.data ?? []) as DeliveredGameRow[]),
    ...((courseLinkedResult.data ?? []) as DeliveredGameRow[]),
  ])
}

function mapGameRunRows(rows: GameRunRow[]): GameRunAnalyticsItem[] {
  return rows.map((row) => {
    const participants = (row.game_sessions ?? []).flatMap((session) =>
      (session.game_session_participants ?? []).map((participant) => ({
        id: participant.id,
        userId: participant.user_id,
        displayName: resolveDisplayName(participant.profiles),
        score: participant.score,
        completedAt: participant.completed_at,
        sessionPayload: participant.session_payload,
      })),
    )

    return {
      id: row.id,
      mode: row.mode,
      status: row.status,
      startedAt: row.started_at,
      endedAt: row.ended_at,
      participants,
    }
  })
}

export async function listGameRunAnalytics(
  classroomId: string,
  gameId: string,
): Promise<GameRunAnalyticsItem[]> {
  const { data, error } = await supabase
    .from('game_runs')
    .select(
      `
      id,
      mode,
      status,
      started_at,
      ended_at,
      game_sessions (
        id,
        game_session_participants (
          id,
          user_id,
          score,
          session_payload,
          completed_at,
          profiles (
            display_name,
            username
          )
        )
      )
    `,
    )
    .eq('classroom_id', classroomId)
    .eq('game_id', gameId)
    .order('started_at', { ascending: false, nullsFirst: false })

  if (error) throw new Error(error.message)

  return mapGameRunRows((data ?? []) as GameRunRow[])
}

export async function getGameRunAnalyticsDetail(
  classroomId: string,
  gameId: string,
  runId: string,
): Promise<GameRunAnalyticsDetail | null> {
  const { data: versionRow, error: versionError } = await supabase
    .from('game_runs')
    .select(
      `
      id,
      mode,
      status,
      started_at,
      ended_at,
      game_version_id,
      game_versions (
        content
      ),
      game_sessions (
        id,
        game_session_participants (
          id,
          user_id,
          score,
          session_payload,
          completed_at,
          profiles (
            display_name,
            username
          )
        )
      )
    `,
    )
    .eq('id', runId)
    .eq('classroom_id', classroomId)
    .eq('game_id', gameId)
    .maybeSingle()

  if (versionError) throw new Error(versionError.message)
  if (!versionRow) return null

  const versionContent = firstRelation(
    (versionRow as { game_versions: DeliveredGameVersionSnapshot | DeliveredGameVersionSnapshot[] })
      .game_versions,
  )?.content

  const base = mapGameRunRows([versionRow as GameRunRow])[0]
  if (!base) return null

  const participantDetails: GameRunParticipantDetail[] = base.participants.map((participant) => {
    const componentScores = parseGameRunComponentScores(participant.sessionPayload, versionContent)
    const totals = sumComponentScores(componentScores)

    return {
      ...participant,
      componentScores,
      totalScore: totals.totalScore > 0 ? totals.totalScore : participant.score,
      maxTotalScore: totals.maxTotalScore,
    }
  })

  return {
    ...base,
    participantDetails,
  }
}

export async function getClassroomDeliveredGame(
  classroomId: string,
  gameId: string,
): Promise<ClassroomDeliveredGame | null> {
  const games = await listClassroomDeliveredGames(classroomId)
  return games.find((game) => game.id === gameId) ?? null
}
