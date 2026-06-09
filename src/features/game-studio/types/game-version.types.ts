import type { ThemeId } from '@/lib/themes'
import type { FlowGameConfig } from './game-studio.types'

export type GameVersionStatus = 'draft' | 'published' | 'archived'

export type GameVersionRow = {
  id: string
  institution_id: string | null
  game_id: string
  version_no: number
  status: GameVersionStatus
  content: FlowGameConfig | null
  title: string | null
  description: string | null
  theme_id: ThemeId | null
  content_schema_version: number | null
  change_note: string | null
  published_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

/** Fields selected when mapping a published game_versions row to UI state. */
export type PublishedGameVersionSource = Pick<
  GameVersionRow,
  | 'id'
  | 'game_id'
  | 'version_no'
  | 'status'
  | 'content'
  | 'title'
  | 'description'
  | 'theme_id'
  | 'published_at'
  | 'created_at'
>

export type PublishedGameVersion = {
  id: string
  gameId: string
  versionNo: number
  status: GameVersionStatus
  content: FlowGameConfig | null
  publishedAt: Date | null
  createdAt: Date
  gameTitle: string
  gameDescription: string | null
  themeId: ThemeId
}

export type GameLifecycleState =
  | 'draftOnly'
  | 'publishedClean'
  | 'publishedWithDraftChanges'
  | 'archived'

export type GameDraftDiffSummary = {
  totalChanges: number
  nodesAdded: number
  nodesRemoved: number
  nodesModified: number
  metadataChanged: boolean
}

export type GameDraftDiff = {
  summary: GameDraftDiffSummary
  statusLineKeys: Array<{ key: string; count?: number }>
  recommendedReleaseType: 'none' | 'patch' | 'minor' | 'major'
}
