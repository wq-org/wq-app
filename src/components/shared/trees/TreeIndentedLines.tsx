'use client'

import { Tree, TreeItem, TreeItemLabel } from '@/components/ui/tree'
import { cn } from '@/lib/utils'

import { crmTreeIndentGuideClassName } from './crm-tree-indent-guide'
import type { CrmHeadlessTreeLayoutProps } from './crm-tree.types'
import { useCrmHeadlessTree } from './useCrmHeadlessTree'

export type TreeIndentedLinesProps = CrmHeadlessTreeLayoutProps

export function TreeIndentedLines({
  items,
  rootItemId,
  initialExpandedItemIds,
  indent = 20,
  className,
  treeClassName,
  toggleIconType,
}: TreeIndentedLinesProps) {
  const tree = useCrmHeadlessTree({
    items,
    rootItemId,
    initialExpandedItemIds,
    indent,
  })

  const wrapperClassName = cn('mx-auto h-fit w-full shrink-0 self-start lg:w-xs', className)
  const mergedTreeClassName = cn(crmTreeIndentGuideClassName, treeClassName)

  return (
    <div className={wrapperClassName}>
      <Tree
        className={mergedTreeClassName}
        indent={indent}
        tree={tree}
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
