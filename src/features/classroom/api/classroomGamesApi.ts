import type { Edge, Node } from '@xyflow/react'

import { supabase } from '@/lib/supabase'
import { isThemeId } from '@/lib/themes'

import type {
  ClassroomDeliveredGame,
  ClassroomGamePlayContent,
  GameRunAnalyticsDetail,
  GameRunAnalyticsItem,
  GameRunParticipantDetail,
  RecordClassroomGameRunInput,
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

type GameVersionSnapshot = {
  title?: string | null
  version_no?: number
  content?: { nodes?: Node[]; edges?: Edge[] } | null
}

type GameRunRow = {
  id: string
  mode: string
  status: string
  started_at: string | null
  ended_at: string | null
  game_versions?: GameVersionSnapshot | GameVersionSnapshot[] | null
  game_sessions: Array<{
    id: string
    game_session_participants: Array<{
      id: string
      user_id: string
      score: number
      session_payload: unknown
      completed_at: string | null
      profiles: {
        display_name: string | null
        username: string | null
        avatar_url: string | null
      } | null
    }>
  }> | null
}

function readGameVersionContent(
  gameVersions: GameVersionSnapshot | GameVersionSnapshot[] | null | undefined,
): { nodes?: Node[]; edges?: Edge[] } | null | undefined {
  return firstRelation(gameVersions)?.content ?? undefined
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
    const versionMeta = firstRelation(row.game_versions)
    const participants = (row.game_sessions ?? []).flatMap((session) =>
      (session.game_session_participants ?? []).map((participant) => ({
        id: participant.id,
        userId: participant.user_id,
        displayName: resolveDisplayName(participant.profiles),
        avatarUrl: participant.profiles?.avatar_url?.trim() || null,
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
      versionNo: versionMeta?.version_no ?? null,
      versionTitle: versionMeta?.title?.trim() || null,
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
      game_versions (
        title,
        version_no
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
            username,
            avatar_url
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
        title,
        version_no,
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
            username,
            avatar_url
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

  const row = versionRow as unknown as GameRunRow
  const versionContent = readGameVersionContent(row.game_versions)
  const base = mapGameRunRows([row])[0]
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
    versionContent: versionContent
      ? { nodes: versionContent.nodes ?? [], edges: versionContent.edges ?? [] }
      : null,
  }
}

export async function getClassroomDeliveredGame(
  classroomId: string,
  gameId: string,
): Promise<ClassroomDeliveredGame | null> {
  const games = await listClassroomDeliveredGames(classroomId)
  return games.find((game) => game.id === gameId) ?? null
}

type PlayContentDeliveryRow = {
  id: string
  game_id: string
  game_version_id: string
  game_versions: DeliveredGameVersionSnapshot | DeliveredGameVersionSnapshot[] | null
}

const PLAY_CONTENT_SELECT = `
  id,
  game_id,
  game_version_id,
  game_versions!inner (
    title,
    description,
    theme_id,
    version_no,
    content
  )
` as const

function mapPlayContentRow(
  row: PlayContentDeliveryRow,
  classroomId: string,
): ClassroomGamePlayContent | null {
  const version = firstRelation(row.game_versions)
  if (!version) return null

  const themeId = version.theme_id && isThemeId(version.theme_id) ? version.theme_id : 'blue'

  return {
    gameId: row.game_id,
    gameDeliveryId: row.id,
    gameVersionId: row.game_version_id,
    classroomId,
    title: version.title?.trim() || 'Untitled Game',
    description: version.description?.trim() || '',
    themeId,
    versionNo: version.version_no,
    nodes: version.content?.nodes ?? [],
    edges: version.content?.edges ?? [],
  }
}

/**
 * Resolves the delivery-pinned playable content for a game delivered to a
 * classroom (directly or via one of its course deliveries). The version is the
 * delivery's `game_version_id`, so an assigned game does not change underneath
 * players when the teacher republishes.
 */
export async function getClassroomGamePlayContent(
  classroomId: string,
  gameId: string,
): Promise<ClassroomGamePlayContent | null> {
  const { data: directRows, error: directError } = await supabase
    .from('game_deliveries')
    .select(PLAY_CONTENT_SELECT)
    .eq('classroom_id', classroomId)
    .eq('game_id', gameId)
    .eq('status', 'published')
    .not('published_at', 'is', null)
    .limit(1)

  if (directError) throw new Error(directError.message)

  const directRow = (directRows ?? [])[0] as PlayContentDeliveryRow | undefined
  if (directRow) return mapPlayContentRow(directRow, classroomId)

  const { data: courseDeliveries, error: courseDeliveriesError } = await supabase
    .from('course_deliveries')
    .select('id')
    .eq('classroom_id', classroomId)
    .is('deleted_at', null)

  if (courseDeliveriesError) throw new Error(courseDeliveriesError.message)

  const courseDeliveryIds = (courseDeliveries ?? []).map((row: { id: string }) => row.id)
  if (courseDeliveryIds.length === 0) return null

  const { data: linkedRows, error: linkedError } = await supabase
    .from('game_deliveries')
    .select(PLAY_CONTENT_SELECT)
    .in('course_delivery_id', courseDeliveryIds)
    .eq('game_id', gameId)
    .eq('status', 'published')
    .not('published_at', 'is', null)
    .limit(1)

  if (linkedError) throw new Error(linkedError.message)

  const linkedRow = (linkedRows ?? [])[0] as PlayContentDeliveryRow | undefined
  return linkedRow ? mapPlayContentRow(linkedRow, classroomId) : null
}

/**
 * Persists one completed play-through as game_run → game_session →
 * game_session_participant. The full walkthrough (per-node results + chat
 * transcript) is stored in session_payload; RLS limits inserts to the caller's
 * own run/participation, and the bind_game_run_version trigger validates the
 * delivery/version pairing and fills institution_id and run_context.
 */
export async function recordClassroomGameRun(input: RecordClassroomGameRunInput): Promise<string> {
  const { data: auth, error: authError } = await supabase.auth.getUser()
  if (authError) throw new Error(authError.message)

  const userId = auth.user?.id
  if (!userId) throw new Error('Not authenticated')

  const endedAt = new Date().toISOString()
  const startedAt = input.startedAt ?? endedAt

  const { data: run, error: runError } = await supabase
    .from('game_runs')
    .insert({
      game_id: input.gameId,
      classroom_id: input.classroomId,
      game_delivery_id: input.gameDeliveryId,
      game_version_id: input.gameVersionId,
      mode: 'solo',
      status: 'completed',
      started_by: userId,
      started_at: startedAt,
      ended_at: endedAt,
    })
    .select('id, institution_id')
    .single()

  if (runError) throw new Error(runError.message)

  const runRow = run as { id: string; institution_id: string }

  const { data: session, error: sessionError } = await supabase
    .from('game_sessions')
    .insert({
      game_run_id: runRow.id,
      institution_id: runRow.institution_id,
      started_at: startedAt,
      ended_at: endedAt,
    })
    .select('id')
    .single()

  if (sessionError) throw new Error(sessionError.message)

  const sessionPayload = {
    schemaVersion: 1,
    totalScore: input.score,
    maxScore: input.maxScore,
    resultsByNode: input.resultsByNode,
    chatHistory: input.chatHistory,
    ...(input.nodeChatHistories && Object.keys(input.nodeChatHistories).length > 0
      ? { nodeChatHistories: input.nodeChatHistories }
      : {}),
  }

  const { error: participantError } = await supabase.from('game_session_participants').insert({
    game_session_id: (session as { id: string }).id,
    institution_id: runRow.institution_id,
    user_id: userId,
    score: input.score,
    session_payload: sessionPayload,
    started_at: startedAt,
    completed_at: endedAt,
  })

  if (participantError) throw new Error(participantError.message)

  return runRow.id
}
