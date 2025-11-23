import type { LucideIcon } from 'lucide-react'
import type { Node, Edge } from '@xyflow/react'

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
  rounds?: string
  condition?: string
  gameType?: string
}

// ========== Node Component Props ==========
export interface GameStartNodeProps {
  data?: {
    onClick?: () => void
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
    onClick?: () => void
    condition?: string
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
  onSave?: (data: { title: string; description: string; rounds: string }) => void
  nodeId?: string
}

export interface EndGameDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: (data: { title: string; description: string }) => void
  initialData?: { title?: string; description?: string }
  nodeId?: string
}

export interface IfElseGameDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: (data: {
    title: string
    description: string
    condition?: string
    correctPath?: 'A' | 'B'
  }) => void
  initialData?: {
    title?: string
    description?: string
    condition?: string
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
  onSave?: (data: { points?: number }) => void
}

// ========== Drawer Props ==========
export interface SettingsDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export interface PreviewDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export interface PublishDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  nodes?: Node[]
  gameTitle?: string
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
export interface GameCardProps {
  id: string
  title: string
  description: string
  route?: string
  onPlay?: () => void
}

export interface GameCardListProps {
  games: GameCardProps[]
  onGamePlay?: (route?: string) => void
}

// ========== Settings Types ==========
export interface GameNodeSettingsProps {
  nodeId?: string
}
