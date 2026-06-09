import type { ThemeId } from '@/lib/themes'

import type { PublishedGameVersion, PublishedGameVersionSource } from '../types/game-version.types'

export function toPublishedGameVersion(row: PublishedGameVersionSource): PublishedGameVersion {
  return {
    id: row.id,
    gameId: row.game_id,
    versionNo: row.version_no,
    status: row.status,
    content: row.content,
    publishedAt: row.published_at ? new Date(row.published_at) : null,
    createdAt: new Date(row.created_at),
    gameTitle: row.title?.trim() || 'Untitled Game',
    gameDescription: row.description?.trim() || null,
    themeId: (row.theme_id ?? 'blue') as ThemeId,
  }
}
