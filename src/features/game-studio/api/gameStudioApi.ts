import { getFollowedTeacherIds } from '@/features/profile'
import { supabase } from '@/lib/supabase'
import type { FlowGameConfig, GameCardProps } from '../types/game-studio.types'
import { getDefaultFlowGameConfig } from '../utils/gameConfigSerialization'
import type { ThemeId } from '@/lib/themes'

export interface GameForStudio {
  id: string
  title: string
  description: string | null
  teacher_id: string
  topic_id: string | null
  game_type: string
  theme_id: ThemeId
  game_config: FlowGameConfig | null
  status: string | null
  version: number | null
  published_version: number | null
  is_draft: boolean | null
  published_at: string | null
  created_at: string
  updated_at: string
}

/**
 * Create a new flow game for the studio (canvas). Inserts with game_type 'flow'
 * and default game_config (single Start node).
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
      topic_id: null,
      game_type: 'flow',
      game_config: gameConfig,
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
  game_config?: FlowGameConfig
}

/**
 * Update an existing game (Save). Overwrites game_config, title, description.
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
  if (payload.game_config !== undefined) updates.game_config = payload.game_config

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
 * Get a single game by ID (full row including game_config for loading canvas).
 */
export async function getGameForStudio(gameId: string): Promise<GameForStudio | null> {
  const { data, error } = await supabase.from('games').select('*').eq('id', gameId).single()

  if (error) {
    if (error.code === 'PGRST116') return null
    console.error('Error fetching game for studio:', error)
    throw error
  }

  return data as GameForStudio
}

/**
 * Get all flow games for a teacher (for Game Studio list).
 */
export async function getTeacherFlowGames(teacherId: string): Promise<GameForStudio[]> {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('teacher_id', teacherId)
    .eq('game_type', 'flow')
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching teacher flow games:', error)
    throw error
  }

  return (data || []) as GameForStudio[]
}

/**
 * Get published games from teachers the current user (student) follows.
 * For use on the student dashboard Games tab.
 */
export async function getPublishedGamesFromFollowedTeachers(): Promise<GameCardProps[]> {
  const followedIds = await getFollowedTeacherIds()
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
      route: `/play/${row.id}`,
    }),
  )
}
