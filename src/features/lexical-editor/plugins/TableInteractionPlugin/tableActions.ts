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

function $createEmptyCell(isHeader: boolean): TableCellNode {
  const cell = $createTableCellNode(
    isHeader ? TableCellHeaderStates.ROW : TableCellHeaderStates.NO_STATUS,
  )
  cell.append($createParagraphNode())
  return cell
}

function $createRowWithCells(columnCount: number, headerState: number): TableRowNode {
  const row = $createTableRowNode()
  for (let i = 0; i < columnCount; i++) {
    const cell = $createTableCellNode(headerState)
    cell.append($createParagraphNode())
    row.append(cell)
  }
  return row
}

export function insertRowAt(
  editor: LexicalEditor,
  tableKey: NodeKey,
  rowIndex: number,
  position: 'above' | 'below',
): void {
  editor.update(() => {
    const tableNode = $getTable(tableKey)
    if (!tableNode) return
    const rows = $getRows(tableNode)
    if (rows.length === 0) return
    const referenceIndex = Math.max(0, Math.min(rowIndex, rows.length - 1))
    const referenceRow = rows[referenceIndex]
    const columnCount = referenceRow.getChildrenSize()
    const newRow = $createRowWithCells(columnCount, TableCellHeaderStates.NO_STATUS)
    if (position === 'above') {
      referenceRow.insertBefore(newRow)
    } else {
      referenceRow.insertAfter(newRow)
    }
  })
}

export function appendRow(editor: LexicalEditor, tableKey: NodeKey): void {
  editor.update(() => {
    const tableNode = $getTable(tableKey)
    if (!tableNode) return
    const rows = $getRows(tableNode)
    if (rows.length === 0) return
    const columnCount = rows[0].getChildrenSize()
    const newRow = $createRowWithCells(columnCount, TableCellHeaderStates.NO_STATUS)
    tableNode.append(newRow)
  })
}

export function deleteRow(editor: LexicalEditor, tableKey: NodeKey, rowIndex: number): void {
  editor.update(() => {
    const tableNode = $getTable(tableKey)
    if (!tableNode) return
    const rows = $getRows(tableNode)
    if (rows.length <= 1) return
    const row = rows[rowIndex]
    if (row) row.remove()
  })
}

export function duplicateRow(editor: LexicalEditor, tableKey: NodeKey, rowIndex: number): void {
  editor.update(() => {
    const tableNode = $getTable(tableKey)
    if (!tableNode) return
    const rows = $getRows(tableNode)
    const row = rows[rowIndex]
    if (!row) return
    const columnCount = row.getChildrenSize()
    const newRow = $createRowWithCells(columnCount, TableCellHeaderStates.NO_STATUS)
    row.insertAfter(newRow)
  })
}

export function clearRowContents(editor: LexicalEditor, tableKey: NodeKey, rowIndex: number): void {
  editor.update(() => {
    const tableNode = $getTable(tableKey)
    if (!tableNode) return
    const rows = $getRows(tableNode)
    const row = rows[rowIndex]
    if (!row) return
    row.getChildren().forEach((child) => {
      if (!('clear' in child)) return
      const cell = child as TableCellNode
      cell.clear()
      cell.append($createParagraphNode())
    })
  })
}

export function toggleHeaderRow(editor: LexicalEditor, tableKey: NodeKey, rowIndex: number): void {
  editor.update(() => {
    const tableNode = $getTable(tableKey)
    if (!tableNode) return
    const rows = $getRows(tableNode)
    const row = rows[rowIndex]
    if (!row) return
    const firstCell = row.getFirstChild() as TableCellNode | null
    const currentlyHeader =
      (firstCell?.getHeaderStyles() ?? 0) & TableCellHeaderStates.ROW ? true : false
    row.getChildren().forEach((child) => {
      const cell = child as TableCellNode
      const currentStyles = cell.getHeaderStyles()
      const nextStyles = currentlyHeader
        ? currentStyles & ~TableCellHeaderStates.ROW
        : currentStyles | TableCellHeaderStates.ROW
      cell.setHeaderStyles(nextStyles, TableCellHeaderStates.ROW)
    })
  })
}

export function moveRow(
  editor: LexicalEditor,
  tableKey: NodeKey,
  fromKey: NodeKey,
  toKey: NodeKey,
  position: 'before' | 'after',
): void {
  editor.update(() => {
    if (!$getTable(tableKey)) return
    if (fromKey === toKey) return
    const movingRow = $getNodeByKey(fromKey)
    const targetRow = $getNodeByKey(toKey)
    if (!$isTableRowNode(movingRow) || !$isTableRowNode(targetRow)) return
    const clone = movingRow.getWritable()
    movingRow.remove()
    const freshTarget = $getNodeByKey(toKey)
    if (!$isTableRowNode(freshTarget)) return
    if (position === 'before') {
      freshTarget.insertBefore(clone)
      return
    }
    freshTarget.insertAfter(clone)
  })
}

export function insertColumnAt(
  editor: LexicalEditor,
  tableKey: NodeKey,
  columnIndex: number,
  position: 'left' | 'right',
): void {
  editor.update(() => {
    const tableNode = $getTable(tableKey)
    if (!tableNode) return
    const rows = $getRows(tableNode)
    rows.forEach((row) => {
      const cells = row.getChildren() as TableCellNode[]
      const referenceCell = cells[Math.min(columnIndex, cells.length - 1)]
      if (!referenceCell) return
      const isHeader =
        (referenceCell.getHeaderStyles() & TableCellHeaderStates.COLUMN) ===
        TableCellHeaderStates.COLUMN
      const newCell = $createEmptyCell(false)
      if (isHeader) {
        newCell.setHeaderStyles(TableCellHeaderStates.COLUMN, TableCellHeaderStates.COLUMN)
      }
      if (position === 'left') {
        referenceCell.insertBefore(newCell)
      } else {
        referenceCell.insertAfter(newCell)
      }
    })
  })
}

export function appendColumn(editor: LexicalEditor, tableKey: NodeKey): void {
  editor.update(() => {
    const tableNode = $getTable(tableKey)
    if (!tableNode) return
    const rows = $getRows(tableNode)
    rows.forEach((row) => {
      const cell = $createEmptyCell(false)
      row.append(cell)
    })
  })
}

export function deleteColumn(editor: LexicalEditor, tableKey: NodeKey, columnIndex: number): void {
  editor.update(() => {
    const tableNode = $getTable(tableKey)
    if (!tableNode) return
    const rows = $getRows(tableNode)
    if (rows.length === 0) return
    if (rows[0].getChildrenSize() <= 1) return
    rows.forEach((row) => {
      const cells = row.getChildren() as TableCellNode[]
      const cell = cells[columnIndex]
      if (cell) cell.remove()
    })
  })
}

export function duplicateColumn(
  editor: LexicalEditor,
  tableKey: NodeKey,
  columnIndex: number,
): void {
  editor.update(() => {
    const tableNode = $getTable(tableKey)
    if (!tableNode) return
    const rows = $getRows(tableNode)
    rows.forEach((row) => {
      const cells = row.getChildren() as TableCellNode[]
      const cell = cells[columnIndex]
      if (!cell) return
      const newCell = $createEmptyCell(false)
      const headerStyles = cell.getHeaderStyles()
      if (headerStyles) newCell.setHeaderStyles(headerStyles, headerStyles)
      cell.insertAfter(newCell)
    })
  })
}

export function clearColumnContents(
  editor: LexicalEditor,
  tableKey: NodeKey,
  columnIndex: number,
): void {
  editor.update(() => {
    const tableNode = $getTable(tableKey)
    if (!tableNode) return
    const rows = $getRows(tableNode)
    rows.forEach((row) => {
      const cells = row.getChildren() as TableCellNode[]
      const cell = cells[columnIndex]
      if (!cell) return
      cell.clear()
      cell.append($createParagraphNode())
    })
  })
}

export function toggleHeaderColumn(
  editor: LexicalEditor,
  tableKey: NodeKey,
  columnIndex: number,
): void {
  editor.update(() => {
    const tableNode = $getTable(tableKey)
    if (!tableNode) return
    const rows = $getRows(tableNode)
    if (rows.length === 0) return
    const firstRowCells = rows[0].getChildren() as TableCellNode[]
    const probeCell = firstRowCells[columnIndex]
    if (!probeCell) return
    const currentlyHeader =
      (probeCell.getHeaderStyles() & TableCellHeaderStates.COLUMN) === TableCellHeaderStates.COLUMN
    rows.forEach((row) => {
      const cells = row.getChildren() as TableCellNode[]
      const cell = cells[columnIndex]
      if (!cell) return
      const currentStyles = cell.getHeaderStyles()
      const nextStyles = currentlyHeader
        ? currentStyles & ~TableCellHeaderStates.COLUMN
        : currentStyles | TableCellHeaderStates.COLUMN
      cell.setHeaderStyles(nextStyles, TableCellHeaderStates.COLUMN)
    })
  })
}

export function moveColumn(
  editor: LexicalEditor,
  tableKey: NodeKey,
  fromIndex: number,
  toIndex: number,
  position: 'before' | 'after',
): void {
  editor.update(() => {
    const tableNode = $getTable(tableKey)
    if (!tableNode) return
    const rows = $getRows(tableNode)
    if (rows.length === 0) return
    const columnCount = rows[0].getChildrenSize()
    if (fromIndex < 0 || fromIndex >= columnCount) return
    if (toIndex < 0 || toIndex >= columnCount) return
    if (fromIndex === toIndex) return
    rows.forEach((row) => {
      const cells = row.getChildren() as TableCellNode[]
      const movingCell = cells[fromIndex]
      const targetCell = cells[toIndex]
      if (!movingCell || !targetCell) return
      const targetKey = targetCell.getKey()
      const writable = movingCell.getWritable()
      movingCell.remove()
      const freshTarget = $getNodeByKey(targetKey)
      if (!$isTableCellNode(freshTarget)) return
      if (position === 'before') {
        freshTarget.insertBefore(writable)
        return
      }
      freshTarget.insertAfter(writable)
    })
  })
}
