import type { ComponentType } from 'react'
import type { LucideIcon } from 'lucide-react'
import type { NodeProps } from '@xyflow/react'

export type GameNodeCategory = 'nodes' | 'logic'

export type GameNodeAccent = 'gray' | 'blue' | 'orange'

export type GameNodeDialogProps = {
  nodeId: string
  onClose: () => void
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
}
