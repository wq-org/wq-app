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
  onSave?: (payload: {
    title: string
    description: string
    theme_id: ThemeId
  }) => void | Promise<void>
  onDelete?: () => void
}

export type PublishGameOptions = {
  /** When set, links this game to the course on publish (optional). */
  courseId?: string | null
}

export interface PublishDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  nodes?: Node[]
  edges?: Edge[]
  teacherId?: string
  linkedCourseId?: string | null
  onPublish?: (options?: PublishGameOptions) => Promise<void>
  onFocusNode?: (nodeId: string) => void
}

// ========== Card Types ==========
export interface GameProjectCardProps {
  id: string
  title?: string
  description?: string
  themeId?: ThemeId
  version?: number
  status?: 'draft' | 'published'
  linkedCourseIds?: string[]
  onOpen?: () => void
  onCourseLinkChanged?: () => void
}

export interface GameProjectCardCompactProps {
  id: string
  title?: string
  description?: string
  themeId?: ThemeId
  status?: 'draft' | 'published'
  className?: string
  onView?: (id: string) => void
  /** When provided, shows the card menu with a "view analytics" action. */
  onViewAnalytics?: (id: string) => void
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
    linkedCourseIds?: string[]
  }[]
  onOpen?: (projectId: string) => void
  onCourseLinkChanged?: () => void
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
