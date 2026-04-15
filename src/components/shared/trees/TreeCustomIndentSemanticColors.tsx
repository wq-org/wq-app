'use client'

import { Tree, TreeItem, TreeItemLabel } from '@/components/ui/tree'
import type { TreeFileIconColor, TreeFolderIconColor } from '@/components/ui/tree-variants'
import {
  treeFileIconColorVariants,
  treeFolderIconColorVariants,
} from '@/components/ui/tree-variants'
import { FileIcon, FolderIcon, FolderOpenIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

import { crmTreeIndentGuideClassName } from './crm-tree-indent-guide'
import type { CrmHeadlessTreeLayoutProps } from './crm-tree.types'
import { useCrmHeadlessTree } from './useCrmHeadlessTree'

export type TreeCustomIndentSemanticColorsProps = CrmHeadlessTreeLayoutProps & {
  folderColor?: TreeFolderIconColor
  fileColor?: TreeFileIconColor
}

export function TreeCustomIndentSemanticColors({
  items,
  rootItemId,
  initialExpandedItemIds,
  indent = 20,
  className,
  treeClassName,
  toggleIconType,
  folderColor,
  fileColor,
}: TreeCustomIndentSemanticColorsProps) {
  const tree = useCrmHeadlessTree({
    items,
    rootItemId,
    initialExpandedItemIds,
    indent,
  })

  const wrapperClassName = cn('mx-auto h-fit w-full shrink-0 self-start lg:w-xs', className)
  const mergedTreeClassName = cn(crmTreeIndentGuideClassName, treeClassName)

  const folderIconClassName = cn(
    treeFolderIconColorVariants({ folderColor: folderColor ?? 'default' }),
    'pointer-events-none size-4',
  )
  const fileIconClassName = cn(
    treeFileIconColorVariants({ fileColor: fileColor ?? 'default' }),
    'pointer-events-none size-4',
  )

  return (
    <div className={wrapperClassName}>
      <Tree
        className={mergedTreeClassName}
        folderColor={folderColor}
        fileColor={fileColor}
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
                    <FolderOpenIcon className={folderIconClassName} />
                  ) : (
                    <FolderIcon className={folderIconClassName} />
                  )
                ) : (
                  <FileIcon className={fileIconClassName} />
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
