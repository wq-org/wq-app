'use client'

import { Tree, TreeItem, TreeItemLabel } from '@/components/ui/tree'
import {
  BracesIcon,
  FileCodeIcon,
  FileIcon,
  FileTextIcon,
  FolderIcon,
  FolderOpenIcon,
  PaletteIcon,
} from 'lucide-react'

import { cn } from '@/lib/utils'

import type { FileExplorerTreeTypeIconsProps } from './file-explorer-tree.types'
import { useFileExplorerHeadlessTree } from './useFileExplorerHeadlessTree'

function getFileTypeIcon(type: string | undefined, isExpanded: boolean) {
  if (!type || type === 'folder') {
    return isExpanded ? (
      <FolderOpenIcon className="pointer-events-none size-4 text-amber-500" />
    ) : (
      <FolderIcon className="pointer-events-none size-4 text-amber-500" />
    )
  }
  if (type === 'tsx' || type === 'ts') {
    return <FileCodeIcon className="pointer-events-none size-4 text-blue-500" />
  }
  if (type === 'css') {
    return <PaletteIcon className="pointer-events-none size-4 text-purple-500" />
  }
  if (type === 'json') {
    return <BracesIcon className="pointer-events-none size-4 text-yellow-500" />
  }
  if (type === 'md') {
    return <FileTextIcon className="text-muted-foreground pointer-events-none size-4" />
  }
  return <FileIcon className="text-muted-foreground pointer-events-none size-4" />
}

export function FileExplorerTreeTypeIcons({
  items,
  rootItemId,
  initialExpandedItemIds,
  indent = 20,
  className,
  treeClassName,
  toggleIconType,
}: FileExplorerTreeTypeIconsProps) {
  const tree = useFileExplorerHeadlessTree({
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
        {tree.getItems().map((item) => {
          const nodeType = item.getItemData().type
          const icon = getFileTypeIcon(nodeType, item.isExpanded())

          return (
            <TreeItem
              key={item.getId()}
              item={item}
            >
              <TreeItemLabel className="before:bg-background relative before:absolute before:inset-x-0 before:-inset-y-0.5 before:-z-10">
                <span className="flex items-center gap-2">
                  {icon}
                  {item.getItemName()}
                </span>
              </TreeItemLabel>
            </TreeItem>
          )
        })}
      </Tree>
    </div>
  )
}
