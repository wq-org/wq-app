'use client'

import { hotkeysCoreFeature, syncDataLoaderFeature } from '@headless-tree/core'
import { useTree } from '@headless-tree/react'

import type { FileExplorerTreeNode } from './file-explorer-tree.types'

type UseFileExplorerHeadlessTreeArgs = {
  items: Record<string, FileExplorerTreeNode>
  rootItemId: string
  initialExpandedItemIds: readonly string[]
  indent: number
}

export function useFileExplorerHeadlessTree({
  items,
  rootItemId,
  initialExpandedItemIds,
  indent,
}: UseFileExplorerHeadlessTreeArgs) {
  return useTree<FileExplorerTreeNode>({
    initialState: {
      expandedItems: [...initialExpandedItemIds],
    },
    indent,
    rootItemId,
    getItemName: (item) => item.getItemData().name,
    isItemFolder: (item) => (item.getItemData()?.children?.length ?? 0) > 0,
    dataLoader: {
      getItem: (itemId) => items[itemId],
      getChildren: (itemId) => items[itemId].children ?? [],
    },
    features: [syncDataLoaderFeature, hotkeysCoreFeature],
  })
}
