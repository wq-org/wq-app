'use client'

import { hotkeysCoreFeature, syncDataLoaderFeature } from '@headless-tree/core'
import { useTree } from '@headless-tree/react'

import type { CrmTreeNode } from './crm-tree.types'

type UseCrmHeadlessTreeArgs = {
  items: Record<string, CrmTreeNode>
  rootItemId: string
  initialExpandedItemIds: readonly string[]
  indent: number
}

export function useCrmHeadlessTree({
  items,
  rootItemId,
  initialExpandedItemIds,
  indent,
}: UseCrmHeadlessTreeArgs) {
  return useTree<CrmTreeNode>({
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
