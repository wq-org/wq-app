'use client'

import { Tree, TreeItem, TreeItemLabel } from '@/components/ui/tree'
import { cn } from '@/lib/utils'

import type { CrmHeadlessTreeLayoutProps } from './crm-tree.types'
import { useCrmHeadlessTree } from './useCrmHeadlessTree'

export type BasicTreeProps = CrmHeadlessTreeLayoutProps

export function BasicTree({
  items,
  rootItemId,
  initialExpandedItemIds,
  indent = 20,
  className,
  treeClassName,
  toggleIconType,
}: BasicTreeProps) {
  const tree = useCrmHeadlessTree({
    items,
    rootItemId,
    initialExpandedItemIds,
    indent,
  })

  const wrapperClassName = cn('mx-auto w-full grow place-self-start lg:w-xs', className)

  return (
    <div className={wrapperClassName}>
      <Tree
        indent={indent}
        tree={tree}
        className={treeClassName}
        toggleIconType={toggleIconType}
      >
        {tree.getItems().map((item) => (
          <TreeItem
            key={item.getId()}
            item={item}
          >
            <TreeItemLabel />
          </TreeItem>
        ))}
      </Tree>
    </div>
  )
}
