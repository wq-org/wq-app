import type { ThemeId } from '@/lib/themes'

import { getGameForStudio } from './gameStudioApi'
import {
  countArchivedDeliveriesForGame,
  countPublishedDeliveriesForGame,
  getLatestPublishedGameVersionId,
  getPublishedGameVersion,
} from './gameVersionApi'
import type { FlowGameConfig } from '../types/game-studio.types'
import type { PublishedGameVersion } from '../types/game-version.types'

export type GameDraftSnapshot = {
  gameId: string
  title: string
  description: string | null
  themeId: ThemeId
  content: FlowGameConfig | null
  courseId: string | null
  currentPublishedVersionId: string | null
  archivedAt: string | null
}

export async function fetchGameDraftSnapshot(gameId: string): Promise<GameDraftSnapshot | null> {
  const game = await getGameForStudio(gameId)
  if (!game) return null

  return {
    gameId: game.id,
    title: game.title,
    description: game.description,
    themeId: game.theme_id,
    content: game.game_content,
    courseId: game.course_id,
    currentPublishedVersionId: game.current_published_version_id,
    archivedAt: game.archived_at,
  }
}

export async function fetchLatestPublishedGameSnapshot(gameId: string): Promise<{
  live: PublishedGameVersion | null
  deliveryCount: number
  offlineDeliveryCount: number
}> {
  const versionId = await getLatestPublishedGameVersionId(gameId)
  if (!versionId) {
    return { live: null, deliveryCount: 0, offlineDeliveryCount: 0 }
  }

  const [live, deliveryCount, offlineDeliveryCount] = await Promise.all([
    getPublishedGameVersion(versionId),
    countPublishedDeliveriesForGame(gameId),
    countArchivedDeliveriesForGame(gameId),
  ])

  return { live, deliveryCount, offlineDeliveryCount }
}
