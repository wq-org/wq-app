'use client'

import { Tree, TreeItem, TreeItemLabel } from '@/components/ui/tree'
import { FileIcon, FolderIcon, FolderOpenIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

import { crmTreeIndentGuideClassName } from './crm-tree-indent-guide'
import type { CrmHeadlessTreeLayoutProps } from './crm-tree.types'
import { useCrmHeadlessTree } from './useCrmHeadlessTree'

export type TreeCustomIndentProps = CrmHeadlessTreeLayoutProps

export function TreeCustomIndent({
  items,
  rootItemId,
  initialExpandedItemIds,
  indent = 20,
  className,
  treeClassName,
  toggleIconType,
}: TreeCustomIndentProps) {
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
            <TreeItemLabel className="before:bg-background relative before:absolute before:inset-x-0 before:-inset-y-0.5 before:-z-10">
              <span className="flex items-center gap-2">
                {item.isFolder() ? (
                  item.isExpanded() ? (
                    <FolderOpenIcon className="text-muted-foreground pointer-events-none size-4" />
                  ) : (
                    <FolderIcon className="text-muted-foreground pointer-events-none size-4" />
                  )
                ) : (
                  <FileIcon className="text-muted-foreground pointer-events-none size-4" />
                )}
                {item.getItemName()}
              </span>
            </TreeItemLabel>
          </TreeItem>
        ))}
      </Tree>
    </div>
  )
}
