import { supabase } from '@/lib/supabase'

import type { PublishedGameVersion, PublishedGameVersionSource } from '../types/game-version.types'
import { toPublishedGameVersion } from '../utils/gameVersion.utils'

const VERSION_COLUMNS =
  'id, game_id, version_no, status, content, title, description, theme_id, published_at, created_at, updated_at' as const

type DeliveredGameVersionSnapshot = {
  title: string | null
  description: string | null
  theme_id: string | null
  version_no: number
}

type DeliveredGameRow = {
  game_id: string
  game_versions: DeliveredGameVersionSnapshot | DeliveredGameVersionSnapshot[] | null
}

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null
  return Array.isArray(value) ? (value[0] ?? null) : value
}

export async function getLatestPublishedGameVersionId(gameId: string): Promise<string | null> {
  const { data: game, error } = await supabase
    .from('games')
    .select('current_published_version_id')
    .eq('id', gameId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return (
    (game as { current_published_version_id: string | null } | null)
      ?.current_published_version_id ?? null
  )
}

export async function getPublishedGameVersion(
  versionId: string,
): Promise<PublishedGameVersion | null> {
  const { data, error } = await supabase
    .from('game_versions')
    .select(VERSION_COLUMNS)
    .eq('id', versionId)
    .eq('status', 'published')
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) return null

  return toPublishedGameVersion(data as PublishedGameVersionSource)
}

export async function countPublishedDeliveriesForGame(gameId: string): Promise<number> {
  const { count, error } = await supabase
    .from('game_deliveries')
    .select('id', { count: 'exact', head: true })
    .eq('game_id', gameId)
    .eq('status', 'published')
    .not('published_at', 'is', null)

  if (error) throw new Error(error.message)
  return count ?? 0
}

export async function countArchivedDeliveriesForGame(gameId: string): Promise<number> {
  const { count, error } = await supabase
    .from('game_deliveries')
    .select('id', { count: 'exact', head: true })
    .eq('game_id', gameId)
    .eq('status', 'archived')

  if (error) throw new Error(error.message)
  return count ?? 0
}

export async function getDeliveredGamesForCourse(courseId: string) {
  const { data, error } = await supabase
    .from('game_deliveries')
    .select(
      `
      game_id,
      game_versions!inner (
        title,
        description,
        theme_id,
        version_no
      ),
      course_deliveries!inner (
        course_id
      )
    `,
    )
    .eq('course_deliveries.course_id', courseId)
    .eq('status', 'published')
    .not('published_at', 'is', null)

  if (error) throw new Error(error.message)

  const seen = new Set<string>()
  const games: Array<{
    id: string
    title: string
    description: string
    themeId: string
    version: number
  }> = []

  for (const row of (data ?? []) as DeliveredGameRow[]) {
    if (seen.has(row.game_id)) continue
    seen.add(row.game_id)

    const version = firstRelation(row.game_versions)
    if (!version) continue

    games.push({
      id: row.game_id,
      title: version.title?.trim() || 'Untitled Game',
      description: version.description?.trim() || 'No description available',
      themeId: version.theme_id ?? 'blue',
      version: version.version_no,
    })
  }

  return games
}
