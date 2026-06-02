import type { Node, Edge } from '@xyflow/react'
import type { ThemeId } from '@/lib/themes'

// ========== Drawer Props ==========
export interface SettingsDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId?: string
  title?: string
  description?: string
  themeId?: ThemeId
  version?: number
  rollbackVersions?: { id: string; version: number }[]
  onSave?: (payload: {
    title: string
    description: string
    theme_id: ThemeId
  }) => void | Promise<void>
  onRollback?: (versionId: string) => void | Promise<void>
  onDelete?: () => void
  /** Whether the game is published (visible to students). */
  isPublished?: boolean
  /** Called when user unpublishes the game (switch off). */
  onUnpublish?: () => void | Promise<void>
}

export interface PreviewDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  nodes?: Node[]
  edges?: Edge[]
}

export interface PublishDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  nodes?: Node[]
  edges?: Edge[]
  gameTitle?: string
  /** Called when user clicks Publish (after validation). Should save then publish. */
  onPublish?: () => Promise<void>
}

// ========== Card Types ==========
export interface GameProjectCardProps {
  id?: string
  title?: string
  description?: string
  themeId?: ThemeId
  version?: number
  status?: 'draft' | 'published'
  onOpen?: () => void
}

export interface GameProjectCardCompactProps {
  id: string
  title?: string
  description?: string
  themeId?: ThemeId
  status?: 'draft' | 'published'
  className?: string
  onView?: (id: string) => void
}

export interface GameCardProps {
  id: string
  title: string
  description: string
  route?: string
  /** Button label (e.g. "Play"); optional for cards that use a default. */
  button?: string
  onPlay?: () => void
  /** Optional image URL for the top of the card. */
  imageUrl?: string
  themeId?: ThemeId
  version?: number
  status?: 'draft' | 'published'
}

export interface GameCardListProps {
  games: GameCardProps[]
  onGamePlay?: (route?: string) => void
}

export type GameProjectCardListVariant = 'default' | 'compact'

export interface GameProjectCardListProps {
  projects: readonly {
    id: string
    title?: string
    description?: string
    themeId?: ThemeId
    version?: number
    status?: 'draft' | 'published'
  }[]
  onOpen?: (projectId: string) => void
  variant?: GameProjectCardListVariant
  className?: string
  scrollAreaClassName?: string
}

// ========== Flow game config (persisted in games.game_content) ==========
/** Serializable node for persistence (no functions in data). */
export interface SerializableNode {
  id: string
  type: string
  position: { x: number; y: number }
  data: Record<string, unknown>
}

/** Serializable edge for persistence. */
export interface SerializableEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string | null
}

/** Shape stored in games.game_content for flow/canvas projects. */
export interface FlowGameConfig {
  projectVersion: string
  nodes: SerializableNode[]
  edges: SerializableEdge[]
}
