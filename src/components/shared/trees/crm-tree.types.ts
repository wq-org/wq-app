export type CrmTreeNode = {
  name: string
  children?: string[]
}

export type CrmHeadlessTreeLayoutProps = {
  items: Record<string, CrmTreeNode>
  rootItemId: string
  initialExpandedItemIds: readonly string[]
  indent?: number
  className?: string
  treeClassName?: string
  toggleIconType?: 'chevron' | 'plus-minus'
}
