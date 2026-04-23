export type FileExplorerNodeKind = 'folder' | 'ts' | 'tsx' | 'css' | 'json' | 'md' | 'config'

export type FileExplorerTreeNode = {
  name: string
  children?: string[]
  type?: FileExplorerNodeKind
}

export type FileExplorerTreeTypeIconsProps = {
  items: Record<string, FileExplorerTreeNode>
  rootItemId: string
  initialExpandedItemIds: readonly string[]
  indent?: number
  className?: string
  treeClassName?: string
  toggleIconType?: 'chevron' | 'plus-minus'
}
