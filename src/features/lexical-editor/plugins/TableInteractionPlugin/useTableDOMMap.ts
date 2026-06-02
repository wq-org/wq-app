import { TableCellNode, TableNode, TableRowNode, $isTableNode } from '@lexical/table'
import { $getRoot, type LexicalEditor, type NodeKey } from 'lexical'
import { useEffect, useState } from 'react'

const DATASET_TABLE_KEY = 'tableNodeKey'
const DATASET_ROW_KEY = 'tableRowKey'
const DATASET_CELL_KEY = 'tableCellKey'

export function getTableKeyFromElement(el: HTMLElement | null): NodeKey | null {
  return el?.dataset[DATASET_TABLE_KEY] ?? null
}

export function getRowKeyFromElement(el: HTMLElement | null): NodeKey | null {
  return el?.dataset[DATASET_ROW_KEY] ?? null
}

export function getCellKeyFromElement(el: HTMLElement | null): NodeKey | null {
  return el?.dataset[DATASET_CELL_KEY] ?? null
}

export function useTableKeys(editor: LexicalEditor): Set<NodeKey> {
  const [keys, setKeys] = useState<Set<NodeKey>>(() => new Set())

  useEffect(() => {
    const initial = new Set<NodeKey>()
    editor.getEditorState().read(() => {
      $getRoot()
        .getChildren()
        .forEach((child) => {
          if ($isTableNode(child)) {
            initial.add(child.getKey())
          }
        })
    })
    setKeys(initial)

    const tagDom = (key: NodeKey, dataKey: string) => {
      const el = editor.getElementByKey(key) as HTMLElement | null
      if (el) {
        el.dataset[dataKey] = key
      }
    }

    const unregisterTable = editor.registerMutationListener(
      TableNode,
      (mutations) => {
        setKeys((prev) => {
          const next = new Set(prev)
          for (const [key, type] of mutations) {
            if (type === 'destroyed') {
              next.delete(key)
            } else {
              next.add(key)
              tagDom(key, DATASET_TABLE_KEY)
            }
          }
          return next
        })
      },
      { skipInitialization: false },
    )

    const unregisterRow = editor.registerMutationListener(
      TableRowNode,
      (mutations) => {
        for (const [key, type] of mutations) {
          if (type !== 'destroyed') {
            tagDom(key, DATASET_ROW_KEY)
          }
        }
      },
      { skipInitialization: false },
    )

    const unregisterCell = editor.registerMutationListener(
      TableCellNode,
      (mutations) => {
        for (const [key, type] of mutations) {
          if (type !== 'destroyed') {
            tagDom(key, DATASET_CELL_KEY)
          }
        }
      },
      { skipInitialization: false },
    )

    return () => {
      unregisterTable()
      unregisterRow()
      unregisterCell()
    }
  }, [editor])

  return keys
}
