import { countStudentVisibleDeliveriesForCourse } from '@/features/course'
import { supabase } from '@/lib/supabase'
import type { ThemeId } from '@/lib/themes'

import { publishGameDraft } from './gamePublishApi'
import {
  getDeliveredGamesForCourse,
  getLatestPublishedGameVersionId,
  getPublishedGameVersion,
} from './gameVersionApi'
import { stripNulChars } from '../utils/stripNulChars'
import type {
  FlowGameConfig,
  GameCardProps,
  GameCatalogInstitutionProfile,
  GameCatalogItem,
  GameCatalogStatus,
  GameCatalogTeacherProfile,
} from '../types/game-studio.types'
import type { PublishedGameVersion } from '../types/game-version.types'
import { resolveGameLinkedCourseIds } from '../utils/gameCourseLink.utils'
import { getDefaultFlowGameConfig } from '../utils/gameConfigSerialization'

const GAME_CATALOG_SELECT = `
  id,
  title,
  description,
  teacher_id,
  institution_id,
  course_id,
  game_type,
  theme_id,
  status,
  version,
  published_version,
  current_published_version_id,
  archived_at,
  created_at,
  updated_at,
  teacher:profiles!games_teacher_id_fkey(display_name, avatar_url),
  institution:institutions!games_institution_id_fkey(id, name),
  game_course_links(course_id)
` as const

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
  game_course_links?: { course_id: string }[]
}

type GameCatalogRow = {
  id: string
  title: string
  description: string | null
  teacher_id: string
  institution_id: string | null
  course_id: string | null
  game_type: string
  theme_id: ThemeId
  status: string | null
  version: number | null
  published_version: number | null
  current_published_version_id: string | null
  archived_at: string | null
  created_at: string
  updated_at: string
  teacher: GameCatalogTeacherProfile | GameCatalogTeacherProfile[] | null
  institution: GameCatalogInstitutionProfile | GameCatalogInstitutionProfile[] | null
  game_course_links?: { course_id: string }[] | null
}

type GameCatalogFilters = {
  institutionId?: string
}

function normalizeGameCatalogRelation<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null
  return Array.isArray(value) ? (value[0] ?? null) : value
}

function resolveGameCatalogStatus(row: GameCatalogRow): GameCatalogStatus {
  if (row.archived_at) return 'archived'
  return row.status === 'published' ? 'published' : 'draft'
}

function mapGameCatalogRow(row: GameCatalogRow): GameCatalogItem {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    teacherId: row.teacher_id,
    institutionId: row.institution_id,
    gameType: row.game_type,
    themeId: row.theme_id,
    status: resolveGameCatalogStatus(row),
    version: row.version,
    publishedVersion: row.published_version,
    currentPublishedVersionId: row.current_published_version_id,
    archivedAt: row.archived_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    teacherProfile: normalizeGameCatalogRelation(row.teacher),
    institution: normalizeGameCatalogRelation(row.institution),
    linkedCourseIds: (row.game_course_links ?? []).map((link) => link.course_id),
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
  // PDF text extraction can sneak NUL bytes into pasted content; PostgreSQL
  // rejects them on JSONB writes (22P05). Sanitize once at the API boundary.
  const sanitized = stripNulChars(payload)
  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }
  if (sanitized.title !== undefined) updates.title = sanitized.title
  if (sanitized.description !== undefined) updates.description = sanitized.description
  if (sanitized.theme_id !== undefined) updates.theme_id = sanitized.theme_id
  if (sanitized.game_content !== undefined) updates.game_content = sanitized.game_content
  if (sanitized.course_id !== undefined) updates.course_id = sanitized.course_id

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
 * Publish a game: snapshot draft into an immutable version and optionally deliver
 * to active course deliveries. Caller must save the draft first.
 */
export async function publishGame(
  gameId: string,
  courseId?: string | null,
): Promise<GameForStudio> {
  await publishGameDraft(gameId, courseId)

  const game = await getGameForStudio(gameId)
  if (!game) throw new Error('Game not found after publish')
  return game
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
      'id, title, description, teacher_id, institution_id, course_id, game_type, theme_id, game_content, status, version, published_version, is_draft, published_at, current_published_version_id, archived_at, created_at, updated_at, game_course_links(course_id)',
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
  const versionId = await getLatestPublishedGameVersionId(gameId)
  if (!versionId) return null
  return getPublishedGameVersion(versionId)
}

export const COURSE_NOT_LIVE_FOR_GAME_LINK = 'COURSE_NOT_LIVE_FOR_GAME_LINK'

/**
 * Link a published game to an additional course (junction table).
 * Idempotent — silently ignores if the link already exists.
 */
export async function linkGameToCourse(gameId: string, courseId: string): Promise<void> {
  const visibleDeliveryCount = await countStudentVisibleDeliveriesForCourse(courseId)
  if (visibleDeliveryCount === 0) {
    throw new Error(COURSE_NOT_LIVE_FOR_GAME_LINK)
  }

  const { error } = await supabase
    .from('game_course_links')
    .upsert(
      { game_id: gameId, course_id: courseId },
      { onConflict: 'game_id,course_id', ignoreDuplicates: true },
    )

  if (error) throw new Error(error.message)
}

/**
 * Remove a course link for a game.
 */
export async function unlinkGameFromCourse(gameId: string, courseId: string): Promise<void> {
  const { error } = await supabase
    .from('game_course_links')
    .delete()
    .eq('game_id', gameId)
    .eq('course_id', courseId)

  if (error) throw new Error(error.message)

  const game = await getGameForStudio(gameId)
  if (game?.course_id === courseId) {
    await updateGameForStudio(gameId, { course_id: null })
  }
}

/**
 * Get all course IDs linked to a game via the junction table.
 */
export async function getGameLinkedCourseIds(gameId: string): Promise<string[]> {
  const game = await getGameForStudio(gameId)
  if (!game) return []
  return resolveGameLinkedCourseIds(game)
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

/** Hides live game deliveries from students by archiving published rows. */
export async function takeGameDeliveriesOffline(gameId: string): Promise<number> {
  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('game_deliveries')
    .update({
      status: 'archived',
      archived_at: now,
      updated_at: now,
    })
    .eq('game_id', gameId)
    .eq('status', 'published')
    .select('id')

  if (error) throw new Error(error.message)
  return data?.length ?? 0
}

/**
 * Published flow games delivered to a course via game_deliveries.
 * Reads immutable version snapshots — draft edits on games do not affect this list.
 */
export async function getPublishedGamesForCourse(courseId: string): Promise<GameCardProps[]> {
  const rows = await getDeliveredGamesForCourse(courseId)

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    themeId: row.themeId as ThemeId,
    version: row.version,
    status: 'published' as const,
  }))
}

/**
 * Get all flow games for a teacher (for Game Studio list).
 */
export async function getTeacherFlowGames(teacherId: string): Promise<GameForStudio[]> {
  const { data, error } = await supabase
    .from('games')
    .select(
      'id, title, description, teacher_id, institution_id, course_id, game_type, theme_id, status, version, published_version, current_published_version_id, archived_at, created_at, updated_at, game_course_links(course_id)',
    )
    .eq('teacher_id', teacherId)
    .eq('game_type', 'flow')
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })

  if (error) throw new Error(error.message)

  return (data ?? []) as GameForStudio[]
}

export async function listGameCatalog(
  filters: GameCatalogFilters = {},
): Promise<GameCatalogItem[]> {
  let query = supabase
    .from('games')
    .select(GAME_CATALOG_SELECT)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })

  if (filters.institutionId) {
    query = query.eq('institution_id', filters.institutionId)
  }

  const { data, error } = await query

  if (error) throw new Error(error.message)

  return ((data ?? []) as unknown as GameCatalogRow[]).map(mapGameCatalogRow)
}
