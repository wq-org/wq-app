import {
  $createTableCellNode,
  $createTableRowNode,
  $isTableCellNode,
  $isTableNode,
  $isTableRowNode,
  TableCellHeaderStates,
  type TableCellNode,
  type TableNode,
  type TableRowNode,
} from '@lexical/table'
import { $createParagraphNode, $getNodeByKey, type LexicalEditor, type NodeKey } from 'lexical'

function $getTable(tableKey: NodeKey): TableNode | null {
  const node = $getNodeByKey(tableKey)
  return $isTableNode(node) ? node : null
}

function $getRows(tableNode: TableNode): TableRowNode[] {
  return tableNode.getChildren().filter($isTableRowNode)
}

function $createCell(headerState: number): TableCellNode {
  const cell = $createTableCellNode(headerState)
  cell.append($createParagraphNode())
  return cell
}

function $createRowWithCells(columnCount: number, headerState: number): TableRowNode {
  const row = $createTableRowNode()
  for (let index = 0; index < columnCount; index += 1) {
    row.append($createCell(headerState))
  }
  return row
}

function $isHeaderRow(row: TableRowNode): boolean {
  const firstCell = row.getFirstChild()
  return (
    $isTableCellNode(firstCell) &&
    (firstCell.getHeaderStyles() & TableCellHeaderStates.ROW) === TableCellHeaderStates.ROW
  )
}

function $isHeaderColumn(tableNode: TableNode, columnIndex: number): boolean {
  const firstRow = tableNode.getFirstChild()
  if (!$isTableRowNode(firstRow)) {
    return false
  }

  const cells = firstRow.getChildren() as TableCellNode[]
  const referenceCell = cells[columnIndex]
  return (
    !!referenceCell &&
    (referenceCell.getHeaderStyles() & TableCellHeaderStates.COLUMN) ===
      TableCellHeaderStates.COLUMN
  )
}

function $isRowEmpty(row: TableRowNode): boolean {
  return row.getChildren().every((child) => {
    if (!$isTableCellNode(child)) {
      return false
    }
    return child.getTextContentSize() === 0
  })
}

function $isColumnEmpty(tableNode: TableNode, columnIndex: number): boolean {
  const rows = $getRows(tableNode)
  return rows.every((row) => {
    const cells = row.getChildren() as TableCellNode[]
    const cell = cells[columnIndex]
    return !!cell && cell.getTextContentSize() === 0
  })
}

function $getHeaderStateForCell(
  row: TableRowNode,
  referenceCell: TableCellNode | undefined,
): number {
  const rowHeader = $isHeaderRow(row)
  const columnHeader =
    !!referenceCell &&
    (referenceCell.getHeaderStyles() & TableCellHeaderStates.COLUMN) ===
      TableCellHeaderStates.COLUMN

  if (rowHeader && columnHeader) {
    return TableCellHeaderStates.BOTH
  }
  if (rowHeader) {
    return TableCellHeaderStates.ROW
  }
  if (columnHeader) {
    return TableCellHeaderStates.COLUMN
  }
  return TableCellHeaderStates.NO_STATUS
}

export function computeDropIndex(
  positions: number[],
  currentPos: number,
  fromIndex: number,
): number {
  void fromIndex
  if (positions.length === 0) {
    return 0
  }

  for (let index = 0; index < positions.length; index += 1) {
    if (currentPos < positions[index]) {
      return index
    }
  }

  return positions.length - 1
}

export function smartInsertRow(
  editor: LexicalEditor,
  tableKey: NodeKey,
  rowKey: NodeKey,
  position: 'before' | 'after',
  force = false,
): void {
  editor.update(() => {
    const tableNode = $getTable(tableKey)
    if (!tableNode) {
      return
    }

    const referenceRow = $getNodeByKey(rowKey)
    if (!$isTableRowNode(referenceRow)) {
      return
    }

    const rows = $getRows(tableNode)
    const firstRow = rows[0]
    if (!firstRow) {
      return
    }

    const columnCount = firstRow.getChildrenSize()
    if (columnCount === 0) {
      return
    }

    const shouldInsertAfter =
      force ? position === 'after' : position === 'after' || ($isHeaderRow(referenceRow) && rows[0] === referenceRow && position === 'before')

    const newRow = $createRowWithCells(columnCount, TableCellHeaderStates.NO_STATUS)
    if (shouldInsertAfter) {
      referenceRow.insertAfter(newRow)
    } else {
      referenceRow.insertBefore(newRow)
    }
  })
}

export function smartInsertCol(
  editor: LexicalEditor,
  tableKey: NodeKey,
  colIndex: number,
  position: 'before' | 'after',
  force = false,
): void {
  editor.update(() => {
    const tableNode = $getTable(tableKey)
    if (!tableNode) {
      return
    }

    const rows = $getRows(tableNode)
    const firstRow = rows[0]
    if (!firstRow) {
      return
    }

    const columnCount = firstRow.getChildrenSize()
    if (columnCount === 0) {
      return
    }

    const referenceIndex = Math.max(0, Math.min(colIndex, columnCount - 1))
    const shouldInsertAfter =
      force
        ? position === 'after'
        : position === 'after' ||
          (referenceIndex === 0 && $isHeaderColumn(tableNode, referenceIndex) && position === 'before')

    rows.forEach((row) => {
      const cells = row.getChildren() as TableCellNode[]
      const referenceCell = cells[referenceIndex] ?? cells[cells.length - 1]
      if (!referenceCell) {
        return
      }

      const headerState = $getHeaderStateForCell(row, referenceCell)
      const newCell = $createCell(headerState)
      if (shouldInsertAfter) {
        referenceCell.insertAfter(newCell)
      } else {
        referenceCell.insertBefore(newCell)
      }
    })
  })
}

export function deleteLastEmptyRow(editor: LexicalEditor, tableKey: NodeKey): boolean {
  let didRemove = false
  editor.update(() => {
    const tableNode = $getTable(tableKey)
    if (!tableNode) {
      return
    }

    const rows = $getRows(tableNode)
    if (rows.length <= 1) {
      return
    }

    const lastRow = rows[rows.length - 1]
    if (!$isTableRowNode(lastRow) || $isHeaderRow(lastRow) || !$isRowEmpty(lastRow)) {
      return
    }

    lastRow.remove()
    didRemove = true
  })
  return didRemove
}

export function deleteLastEmptyColumn(editor: LexicalEditor, tableKey: NodeKey): boolean {
  let didRemove = false
  editor.update(() => {
    const tableNode = $getTable(tableKey)
    if (!tableNode) {
      return
    }

    const rows = $getRows(tableNode)
    if (rows.length === 0) {
      return
    }

    const columnCount = rows[0].getChildrenSize()
    if (columnCount <= 1) {
      return
    }

    const lastColumnIndex = columnCount - 1
    if ($isHeaderColumn(tableNode, lastColumnIndex) || !$isColumnEmpty(tableNode, lastColumnIndex)) {
      return
    }

    rows.forEach((row) => {
      const cells = row.getChildren() as TableCellNode[]
      cells[lastColumnIndex]?.remove()
    })
    didRemove = true
  })
  return didRemove
}

export function isTableRowHeader(editor: LexicalEditor, tableKey: NodeKey, rowIndex: number): boolean {
  return editor.getEditorState().read(() => {
    const tableNode = $getTable(tableKey)
    if (!tableNode) {
      return false
    }
    const rows = $getRows(tableNode)
    const row = rows[rowIndex]
    return !!row && $isHeaderRow(row)
  })
}

export function isTableColumnHeader(
  editor: LexicalEditor,
  tableKey: NodeKey,
  columnIndex: number,
): boolean {
  return editor.getEditorState().read(() => {
    const tableNode = $getTable(tableKey)
    if (!tableNode) {
      return false
    }
    return $isHeaderColumn(tableNode, columnIndex)
  })
}
