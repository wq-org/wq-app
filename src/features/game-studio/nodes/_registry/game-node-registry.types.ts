import type { ComponentType } from 'react'
import type { LucideIcon } from 'lucide-react'
import type { NodeProps } from '@xyflow/react'

export type GameNodeCategory = 'nodes' | 'logic' | 'games'

export type GameNodeAccent = 'gray' | 'blue' | 'orange'

export type GameNodeDialogProps = {
  nodeId: string
  /** Current flow node `data` from the canvas (updates when patched). */
  nodeData: Record<string, unknown>
  /** Shallow-merge `patch` into this node's `data`. */
  onPatchNodeData: (patch: Record<string, unknown>) => void
  onClose: () => void
  onDelete: () => void
  /**
   * De-duplicated image URLs from Image Pin nodes on the canvas (quick-select).
   * Editors that need it (e.g. Image Pin) read this; others ignore it.
   */
  projectImageGallery?: readonly { url: string; title: string; storagePath?: string }[]
}

export type GameNodeRegistryEntry = {
  /** XYFlow node type key e.g. 'gameImagePin' */
  type: string
  /** Human label shown on sidebar + canvas */
  label: string
  /** Sidebar bucket */
  category: GameNodeCategory
  /** Sidebar/canvas accent color */
  accent: GameNodeAccent
  /** Sidebar + canvas icon */
  Icon: LucideIcon
  /** Canvas visual component */
  NodeComponent: ComponentType<NodeProps>
  /** Editor dialog — null means clicking the node opens nothing */
  DialogComponent: ComponentType<GameNodeDialogProps> | null
  /** Default node.data when dragged onto canvas */
  defaultConfig: Record<string, unknown>
  /** Per-node validation; returns short missing-item labels */
  validateConfig: (data: unknown) => string[]
  /** Whether the user can delete this node */
  isDeletable: boolean
  /** Whether multiple instances are allowed on a single canvas */
  allowMultiple: boolean
  /** Whether this node may be dragged from the sidebar (false hides it from sidebar) */
  isDraggable: boolean
  /** Whether this node should render as disabled in the sidebar */
  disabled?: boolean
  /** When set, sidebar drag + canvas drop require this institution feature key. */
  featureKey?: string
}
