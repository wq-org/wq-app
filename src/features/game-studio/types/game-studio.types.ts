import type { LucideIcon } from 'lucide-react'
import type { Node, Edge } from '@xyflow/react'
import type { ThemeId } from '@/lib/themes'

// ========== Core Types ==========
export interface GameNodeTemplate {
  id: string
  label: string
  type: string
}

export interface GameOption {
  id: string
  icon: LucideIcon
  title: string
  description: string
  component: React.ComponentType
}

// ========== History Types ==========
export interface HistoryState {
  nodes: Node[]
  edges: Edge[]
}

// ========== Node Data Types ==========
export interface GameNodeData {
  label?: string
  onClick?: () => void
  title?: string
  description?: string
  condition?: string
  correctMessage?: string
  wrongMessage?: string
  correctPath?: 'A' | 'B'
  gameType?: string
}

// ========== Node Component Props ==========
export interface GameStartNodeProps {
  data?: {
    onClick?: () => void
    title?: string
    label?: string
  }
  selected?: boolean
}

export interface GameEndNodeProps {
  data?: {
    label?: string
    onClick?: () => void
  }
  selected?: boolean
}

export interface GameIfElseNodeProps {
  data?: {
    label?: string
    title?: string
    onClick?: () => void
    condition?: string
    correctMessage?: string
    wrongMessage?: string
    correctPath?: 'A' | 'B'
  }
  selected?: boolean
}

export interface GameParagraphNodeProps {
  data?: {
    label?: string
    onClick?: () => void
    gameType?: string
  }
  selected?: boolean
}

export interface GameImageTermsNodeProps {
  data?: {
    label?: string
    onClick?: () => void
    gameType?: string
  }
  selected?: boolean
}

export interface GameImagePinNodeProps {
  data?: {
    label?: string
    onClick?: () => void
    gameType?: string
  }
  selected?: boolean
}

// ========== Dialog Props ==========
export interface StartGameDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: (data: { title: string; description: string; theme_id: ThemeId }) => void
  nodeId?: string
  initialData?: { title?: string; label?: string; description?: string; theme_id?: ThemeId }
}

export interface EndGameDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: (data: { title: string; description: string }) => void
  initialData?: { title?: string; label?: string; description?: string }
  nodeId?: string
}

export interface IfElseGameDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: (
    data: {
      title?: string
      description?: string
      condition?: string
      correctMessage?: string
      wrongMessage?: string
      correctPath?: 'A' | 'B'
    },
    nodeId?: string,
  ) => void
  initialData?: {
    title?: string
    label?: string
    description?: string
    condition?: string
    correctMessage?: string
    wrongMessage?: string
    correctPath?: 'A' | 'B'
  }
  nodeId?: string
  onDelete?: () => void
  nodes?: Node[]
  edges?: Edge[]
}

export interface GameNodeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  nodeType?: string
  nodeId?: string
  initialData?: unknown
  onSave?: (
    data: {
      points?: number
      paragraphGameData?: unknown
      imageTermGameData?: unknown
      imagePinGameData?: unknown
    },
    nodeId?: string,
  ) => void
  onDelete?: () => void
  /** Upload image for game node; returns storage path and public URL or null. Used when saving image-term or image-pin nodes. */
  onUploadImage?: (
    file: File,
    nodeId: string,
  ) => Promise<{ path: string; publicUrl: string | null } | null>
  /** Remove image from storage when user clears the image in editor. Called with storage path. */
  onRemoveImage?: (path: string) => void | Promise<void>
}

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

// ========== Sidebar Types ==========
export interface SidebarItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  category: 'node' | 'logic'
  nodeType: string
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
  projects: Array<{
    id: string
    title?: string
    description?: string
    themeId?: ThemeId
    version?: number
    status?: 'draft' | 'published'
  }>
  onOpen?: (projectId: string) => void
  variant?: GameProjectCardListVariant
  className?: string
  scrollAreaClassName?: string
}

// ========== Settings Types ==========
export interface GameNodeSettingsProps {
  nodeId?: string
}

// ========== Flow game config (persisted in games.game_config) ==========
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

/** Shape stored in games.game_config for flow/canvas projects. */
export interface FlowGameConfig {
  projectVersion: string
  nodes: SerializableNode[]
  edges: SerializableEdge[]
}
