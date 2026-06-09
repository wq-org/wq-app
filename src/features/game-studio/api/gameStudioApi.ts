import { supabase } from '@/lib/supabase'
import type { FlowGameConfig, GameCardProps } from '../types/game-studio.types'
import type { GameVersionRow, PublishedGameVersion } from '../types/game-version.types'
import { getDefaultFlowGameConfig } from '../utils/gameConfigSerialization'
import type { ThemeId } from '@/lib/themes'

export interface GameForStudio {
  id: string
  title: string
  description: string | null
  teacher_id: string
  institution_id: string | null
  course_id: string | null
  game_type: string
  theme_id: ThemeId
  game_content: FlowGameConfig | null
  status: string | null
  version: number | null
  published_version: number | null
  is_draft: boolean | null
  published_at: string | null
  current_published_version_id: string | null
  archived_at: string | null
  created_at: string
  updated_at: string
}

type GameVersionJoinRow = {
  title: string
  description: string | null
  theme_id: ThemeId
}

function toPublishedGameVersion(
  row: GameVersionRow,
  game: GameVersionJoinRow,
): PublishedGameVersion {
  return {
    id: row.id,
    gameId: row.game_id,
    versionNo: row.version_no,
    status: row.status,
    content: row.content,
    publishedAt: row.published_at ? new Date(row.published_at) : null,
    createdAt: new Date(row.created_at),
    gameTitle: game.title,
    gameDescription: game.description,
    themeId: game.theme_id,
  }
}

/**
 * Create a new flow game for the studio (canvas). Inserts with game_type 'flow'
 * and default game_content (single Start node).
 */
export async function createGameForStudio(
  teacherId: string,
  payload: { title?: string; description?: string; theme_id?: ThemeId } = {},
): Promise<GameForStudio> {
  const title = payload.title?.trim() || 'Untitled Game'
  const description = payload.description?.trim() || ''
  const gameConfig = getDefaultFlowGameConfig()

  const { data, error } = await supabase
    .from('games')
    .insert({
      title,
      description,
      teacher_id: teacherId,
      game_type: 'flow',
      game_content: gameConfig,
      status: 'draft',
      is_draft: true,
      version: 1,
      ...(payload.theme_id ? { theme_id: payload.theme_id } : {}),
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating game for studio:', error)
    throw error
  }

  return data as GameForStudio
}

export interface UpdateGameForStudioPayload {
  title?: string
  description?: string
  theme_id?: ThemeId
  game_content?: FlowGameConfig
  course_id?: string | null
}

/**
 * Update an existing game (Save). Overwrites game_content, title, description.
 * Does not create a new version or change status.
 */
export async function updateGameForStudio(
  gameId: string,
  payload: UpdateGameForStudioPayload,
): Promise<GameForStudio> {
  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }
  if (payload.title !== undefined) updates.title = payload.title
  if (payload.description !== undefined) updates.description = payload.description
  if (payload.theme_id !== undefined) updates.theme_id = payload.theme_id
  if (payload.game_content !== undefined) updates.game_content = payload.game_content
  if (payload.course_id !== undefined) updates.course_id = payload.course_id

  const { data, error } = await supabase
    .from('games')
    .update(updates)
    .eq('id', gameId)
    .select()
    .single()

  if (error) {
    console.error('Error updating game for studio:', error)
    throw error
  }

  return data as GameForStudio
}

/**
 * Publish a game: set status to published. Caller must save the game first
 * (e.g. updateGameForStudio) before calling. Does not create a new version.
 */
export async function publishGame(gameId: string): Promise<GameForStudio> {
  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('games')
    .update({
      status: 'published',
      is_draft: false,
      published_at: now,
      updated_at: now,
    })
    .eq('id', gameId)
    .select()
    .single()

  if (error) {
    console.error('Error publishing game:', error)
    throw error
  }

  return data as GameForStudio
}

/**
 * Unpublish a game: set status back to draft so it is hidden from students.
 */
export async function unpublishGame(gameId: string): Promise<GameForStudio> {
  const { data, error } = await supabase
    .from('games')
    .update({
      status: 'draft',
      is_draft: true,
      published_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', gameId)
    .select()
    .single()

  if (error) {
    console.error('Error unpublishing game:', error)
    throw error
  }

  return data as GameForStudio
}

/**
 * Get a single game by ID (full row including game_content for loading canvas).
 */
/**
 * Draft row for `cloud_file_links` (`link_entity_type = 'game_version'`).
 * Studio saves `games.game_content`; the DB trigger mirrors content onto this draft version.
 */
export async function getCurrentGameDraftVersionId(gameId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('game_versions')
    .select('id')
    .eq('game_id', gameId)
    .eq('status', 'draft')
    .order('version_no', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('[getCurrentGameDraftVersionId] lookup failed', error)
    return null
  }

  return (data?.id as string | undefined) ?? null
}

export async function getGameForStudio(gameId: string): Promise<GameForStudio | null> {
  const { data, error } = await supabase
    .from('games')
    .select(
      'id, title, description, teacher_id, institution_id, course_id, game_type, theme_id, game_content, status, version, published_version, is_draft, published_at, current_published_version_id, archived_at, created_at, updated_at',
    )
    .eq('id', gameId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    console.error('Error fetching game for studio:', error)
    throw error
  }

  return data as GameForStudio
}

export async function getLatestPublishedGameVersion(
  gameId: string,
): Promise<PublishedGameVersion | null> {
  const { data: game, error: gameError } = await supabase
    .from('games')
    .select('current_published_version_id, title, description, theme_id')
    .eq('id', gameId)
    .single()

  if (gameError) throw new Error(gameError.message)

  const versionId = (game as { current_published_version_id: string | null })
    .current_published_version_id
  if (!versionId) return null

  const { data: version, error: versionError } = await supabase
    .from('game_versions')
    .select('id, game_id, version_no, status, content, published_at, created_at, updated_at')
    .eq('id', versionId)
    .single()

  if (versionError) throw new Error(versionError.message)

  return toPublishedGameVersion(version as unknown as GameVersionRow, game as GameVersionJoinRow)
}

export async function archiveGame(gameId: string): Promise<void> {
  const { error } = await supabase
    .from('games')
    .update({ archived_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', gameId)

  if (error) throw new Error(error.message)
}

export async function softDeleteGame(gameId: string): Promise<void> {
  const { error } = await supabase
    .from('games')
    .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', gameId)

  if (error) throw new Error(error.message)
}

/**
 * Published flow games linked to a course (`games.course_id`).
 * Used on published course overview — same games students see when the course is linked at publish time.
 */
export async function getPublishedGamesForCourse(courseId: string): Promise<GameCardProps[]> {
  const { data, error } = await supabase
    .from('games')
    .select('id, title, description, version, status, theme_id')
    .eq('course_id', courseId)
    .eq('game_type', 'flow')
    .eq('status', 'published')
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching published games for course:', error)
    throw error
  }

  return (data || []).map(
    (row: {
      id: string
      title: string
      description: string | null
      version: number | null
      status: string | null
      theme_id: ThemeId
    }) => ({
      id: row.id,
      title: row.title || 'Untitled Game',
      description: row.description ?? 'No description available',
      themeId: row.theme_id,
      version: row.version ?? undefined,
      status: 'published' as const,
    }),
  )
}

/**
 * Get all flow games for a teacher (for Game Studio list).
 */
export async function getTeacherFlowGames(teacherId: string): Promise<GameForStudio[]> {
  const { data, error } = await supabase
    .from('games')
    .select(
      'id, title, description, teacher_id, institution_id, course_id, game_type, theme_id, status, version, published_version, current_published_version_id, archived_at, created_at, updated_at',
    )
    .eq('teacher_id', teacherId)
    .eq('game_type', 'flow')
    .order('updated_at', { ascending: false })

  if (error) throw new Error(error.message)

  return (data ?? []) as GameForStudio[]
}

async function getFollowedTeacherIdsForCurrentUser(): Promise<string[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const studentId = user?.id
  if (!studentId) return []

  const { data, error } = await supabase
    .from('teacher_followers')
    .select('teacher_id')
    .eq('student_id', studentId)

  if (error) {
    console.error('Error fetching followed teachers:', error)
    return []
  }

  return (data || []).map((row: { teacher_id: string }) => row.teacher_id)
}

/**
 * Get published games from teachers the current user (student) follows.
 * For use on the student dashboard Games tab. Card entries omit `route` until
 * a dedicated play URL is reintroduced (e.g. embed or player under game-studio).
 */
export async function getPublishedGamesFromFollowedTeachers(): Promise<GameCardProps[]> {
  const followedIds = await getFollowedTeacherIdsForCurrentUser()
  if (followedIds.length === 0) return []

  const { data, error } = await supabase
    .from('games')
    .select('id, title, description, version, status, theme_id')
    .in('teacher_id', followedIds)
    .eq('status', 'published')
    .order('updated_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching published games from followed teachers:', error)
    throw error
  }

  return (data || []).map(
    (row: {
      id: string
      title: string
      description: string | null
      version: number | null
      status: string | null
      theme_id: ThemeId
    }) => ({
      id: row.id,
      title: row.title || 'Untitled Game',
      description: row.description ?? 'No description available',
      themeId: row.theme_id,
      version: row.version ?? undefined,
      status: (row.status === 'published' ? 'published' : 'draft') as 'draft' | 'published',
    }),
  )
}
