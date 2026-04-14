'use client'

import * as React from 'react'

export interface TreeContextType {
  expandedIds: Set<string>
  selectedIds: string[]
  toggleExpanded: (nodeId: string) => void
  handleSelection: (nodeId: string, ctrlKey?: boolean) => void
  showLines: boolean
  showIcons: boolean
  selectable: boolean
  multiSelect: boolean
  animateExpand: boolean
  indent: number
  onNodeClick?: (nodeId: string, data?: unknown) => void
  onNodeExpand?: (nodeId: string, expanded: boolean) => void
}

export const TreeContext = React.createContext<TreeContextType | null>(null)

export function useTree() {
  const context = React.useContext(TreeContext)
  if (!context) {
    throw new Error('Tree components must be used within a TreeProvider')
  }

  return context
}
