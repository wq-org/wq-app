import {
  $getTableCellNodeFromLexicalNode,
  $isTableCellNode,
  $isTableNode,
  $isTableRowNode,
} from '@lexical/table'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $getSelection,
  $getNodeByKey,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  SELECTION_CHANGE_COMMAND,
  type LexicalEditor,
  type NodeKey,
} from 'lexical'
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Copy,
  TableProperties,
  Trash2,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { AddColButton } from './AddColButton'
import { AddRowButton } from './AddRowButton'
import { ColGripOverlay } from './ColGripOverlay'
import { RowGripOverlay } from './RowGripOverlay'
import {
  TableActionPopover,
  type TableActionSection,
  type TableActionToggle,
} from './TableActionPopover'
import {
  clearColumnContents,
  clearRowContents,
  deleteColumn,
  deleteRow,
  duplicateColumn,
  duplicateRow,
  toggleHeaderColumn,
  toggleHeaderRow,
} from './tableActions'
import {
  isTableColumnHeader,
  isTableRowHeader,
  smartInsertCol,
  smartInsertRow,
} from './tableInteractionUtils'
import { useTableKeys } from './useTableDOMMap'

const FOCUSED_CELL_CLASS = 'editor-tableCell--focused'
const SELECTED_ROW_CLASS = 'editor-tableRow--selected'
const SELECTED_COL_CLASS = 'editor-tableCol--selected'
const EDGE_PROXIMITY_PX = 20
const ZONE_BUFFER_PX = 40
const LEAVE_DELAY_MS = 120

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

type OpenMenu =
  | { kind: 'row'; tableKey: NodeKey; rowIndex: number; rowKey: NodeKey; anchorRect: DOMRect }
  | { kind: 'col'; tableKey: NodeKey; colIndex: number; anchorRect: DOMRect }
  | null

export function TableInteractionPlugin({ anchorElem }: { anchorElem: HTMLElement }) {
  const [editor] = useLexicalComposerContext()
  const tableKeys = useTableKeys(editor)
  const [openPopoverKey, setOpenPopoverKey] = useState<string | null>(null)
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null)

  useFocusRing(editor)

  const handleCloseMenu = useCallback(() => {
    setOpenPopoverKey(null)
    setOpenMenu(null)
  }, [])

  const handleOpenRowMenu = useCallback(
    (tableKey: NodeKey, rowIndex: number, rowKey: NodeKey, anchorRect: DOMRect) => {
      const nextKey = `row:${tableKey}:${rowKey}`
      if (openPopoverKey === nextKey) {
        handleCloseMenu()
        return
      }

      setOpenPopoverKey(nextKey)
      setOpenMenu({ kind: 'row', tableKey, rowIndex, rowKey, anchorRect })
    },
    [handleCloseMenu, openPopoverKey],
  )

  const handleOpenColMenu = useCallback(
    (tableKey: NodeKey, colIndex: number, anchorRect: DOMRect) => {
      const nextKey = `col:${tableKey}:${colIndex}`
      if (openPopoverKey === nextKey) {
        handleCloseMenu()
        return
      }

      setOpenPopoverKey(nextKey)
      setOpenMenu({ kind: 'col', tableKey, colIndex, anchorRect })
    },
    [handleCloseMenu, openPopoverKey],
  )

  return (
    <>
      {Array.from(tableKeys).map((tableKey) => (
        <TableOverlay
          key={tableKey}
          editor={editor}
          tableKey={tableKey}
          anchorElem={anchorElem}
          openMenu={openMenu?.tableKey === tableKey ? openMenu : null}
          onOpenRowMenu={handleOpenRowMenu}
          onOpenColMenu={handleOpenColMenu}
        />
      ))}
      <TableMenuPortal
        editor={editor}
        openMenu={openMenu}
        onClose={handleCloseMenu}
      />
    </>
  )
}

function useFocusRing(editor: LexicalEditor): void {
  useEffect(() => {
    let currentCellKey: NodeKey | null = null

    const applyClass = (key: NodeKey | null) => {
      if (currentCellKey && currentCellKey !== key) {
        const prev = editor.getElementByKey(currentCellKey) as HTMLElement | null
        prev?.classList.remove(FOCUSED_CELL_CLASS)
      }
      if (key) {
        const next = editor.getElementByKey(key) as HTMLElement | null
        next?.classList.add(FOCUSED_CELL_CLASS)
      }
      currentCellKey = key
    }

    const update = () => {
      editor.getEditorState().read(() => {
        const selection = $getSelection()
        if (!$isRangeSelection(selection)) {
          applyClass(null)
          return
        }
        const cell = $getTableCellNodeFromLexicalNode(selection.anchor.getNode())
        applyClass($isTableCellNode(cell) ? cell.getKey() : null)
      })
    }

    update()

    const unregisterCommand = editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        update()
        return false
      },
      COMMAND_PRIORITY_LOW,
    )
    const unregisterUpdate = editor.registerUpdateListener(update)

    return () => {
      applyClass(null)
      unregisterCommand()
      unregisterUpdate()
    }
  }, [editor])
}

type TableOverlayProps = {
  editor: LexicalEditor
  tableKey: NodeKey
  anchorElem: HTMLElement
  openMenu: OpenMenu
  onOpenRowMenu: (tableKey: NodeKey, rowIndex: number, rowKey: NodeKey, anchorRect: DOMRect) => void
  onOpenColMenu: (tableKey: NodeKey, colIndex: number, anchorRect: DOMRect) => void
}

type TableLayout = {
  wrapperEl: HTMLElement
  tableEl: HTMLTableElement
  rowEls: HTMLTableRowElement[]
  firstRowCellEls: HTMLTableCellElement[]
}

function getTableLayout(editor: LexicalEditor, tableKey: NodeKey): TableLayout | null {
  const wrapperEl = editor.getElementByKey(tableKey) as HTMLElement | null
  if (!wrapperEl) return null
  const tableEl = wrapperEl.querySelector('table')
  if (!tableEl) return null
  const rowEls = Array.from(tableEl.querySelectorAll('tr')) as HTMLTableRowElement[]
  if (rowEls.length === 0) return null
  const firstRowCellEls = Array.from(rowEls[0].children).filter(
    (child): child is HTMLTableCellElement => child instanceof HTMLTableCellElement,
  )
  return { wrapperEl, tableEl, rowEls, firstRowCellEls }
}

function TableOverlay({
  editor,
  tableKey,
  anchorElem,
  openMenu,
  onOpenRowMenu,
  onOpenColMenu,
}: TableOverlayProps) {
  const [tick, setTick] = useState(0)
  const [hoveredRowIndex, setHoveredRowIndex] = useState<number | null>(null)
  const [hoveredColIndex, setHoveredColIndex] = useState<number | null>(null)
  const [showAddRow, setShowAddRow] = useState(false)
  const [showAddCol, setShowAddCol] = useState(false)

  useEffect(() => {
    const handleUpdate = () => setTick((t) => t + 1)
    const u1 = editor.registerUpdateListener(handleUpdate)
    window.addEventListener('resize', handleUpdate)
    window.addEventListener('scroll', handleUpdate, true)
    return () => {
      u1()
      window.removeEventListener('resize', handleUpdate)
      window.removeEventListener('scroll', handleUpdate, true)
    }
  }, [editor])

  const layout = useMemo(
    () => getTableLayout(editor, tableKey),
    // tick forces re-query of DOM when editor or layout changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editor, tableKey, tick],
  )

  const leaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rafIdRef = useRef<number | null>(null)

  useEffect(() => {
    if (!layout) return
    const { wrapperEl, tableEl, rowEls, firstRowCellEls } = layout

    const dismissAll = () => {
      setHoveredRowIndex(null)
      setHoveredColIndex(null)
      setShowAddRow(false)
      setShowAddCol(false)
    }

    const scheduleDismiss = () => {
      if (leaveTimeoutRef.current !== null) return
      const delay = prefersReducedMotion() ? 0 : LEAVE_DELAY_MS
      leaveTimeoutRef.current = setTimeout(() => {
        leaveTimeoutRef.current = null
        dismissAll()
      }, delay)
    }

    const cancelDismiss = () => {
      if (leaveTimeoutRef.current !== null) {
        clearTimeout(leaveTimeoutRef.current)
        leaveTimeoutRef.current = null
      }
    }

    const computeFromPointer = (clientX: number, clientY: number) => {
      const wrapperRect = wrapperEl.getBoundingClientRect()
      const tableRect = tableEl.getBoundingClientRect()
      const zone = {
        left: wrapperRect.left - ZONE_BUFFER_PX,
        top: wrapperRect.top - ZONE_BUFFER_PX,
        right: wrapperRect.right,
        bottom: wrapperRect.bottom,
      }
      const inZone =
        clientX >= zone.left &&
        clientX <= zone.right &&
        clientY >= zone.top &&
        clientY <= zone.bottom

      if (!inZone) {
        scheduleDismiss()
        return
      }

      cancelDismiss()

      const horizontallyAligned =
        clientX >= tableRect.left - ZONE_BUFFER_PX && clientX <= tableRect.right + EDGE_PROXIMITY_PX
      const verticallyAligned =
        clientY >= tableRect.top - ZONE_BUFFER_PX && clientY <= tableRect.bottom + EDGE_PROXIMITY_PX

      const nearBottom =
        horizontallyAligned && Math.abs(clientY - tableRect.bottom) <= EDGE_PROXIMITY_PX
      const nearRight =
        verticallyAligned && Math.abs(clientX - tableRect.right) <= EDGE_PROXIMITY_PX

      setShowAddRow(nearBottom)
      setShowAddCol(nearRight)

      let rowIndex: number | null = null
      for (let i = 0; i < rowEls.length; i++) {
        const r = rowEls[i].getBoundingClientRect()
        if (clientY >= r.top && clientY <= r.bottom) {
          rowIndex = i
          break
        }
      }
      let colIndex: number | null = null
      for (let i = 0; i < firstRowCellEls.length; i++) {
        const c = firstRowCellEls[i].getBoundingClientRect()
        if (clientX >= c.left && clientX <= c.right) {
          colIndex = i
          break
        }
      }
      setHoveredRowIndex(rowIndex)
      setHoveredColIndex(colIndex)
    }

    const onMove = (e: PointerEvent) => {
      if (rafIdRef.current !== null) return
      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null
        computeFromPointer(e.clientX, e.clientY)
      })
    }

    document.addEventListener('pointermove', onMove)
    return () => {
      document.removeEventListener('pointermove', onMove)
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = null
      }
      cancelDismiss()
    }
  }, [layout])

  useEffect(() => {
    if (!layout) return
    const { rowEls } = layout
    rowEls.forEach((row, index) => {
      const selected = openMenu?.kind === 'row' && openMenu.rowIndex === index
      row.classList.toggle(SELECTED_ROW_CLASS, selected)
    })
    return () => {
      if (!editor.getElementByKey(tableKey)) return
      rowEls.forEach((row) => {
        if (row.isConnected) row.classList.remove(SELECTED_ROW_CLASS)
      })
    }
  }, [editor, layout, openMenu, tableKey])

  useEffect(() => {
    if (!layout) return
    const { rowEls } = layout
    const colIndex = openMenu?.kind === 'col' ? openMenu.colIndex : -1
    rowEls.forEach((row) => {
      Array.from(row.children).forEach((cell, idx) => {
        ;(cell as HTMLElement).classList.toggle(SELECTED_COL_CLASS, idx === colIndex)
      })
    })
    return () => {
      if (!editor.getElementByKey(tableKey)) return
      rowEls.forEach((row) => {
        if (!row.isConnected) return
        Array.from(row.children).forEach((cell) =>
          (cell as HTMLElement).classList.remove(SELECTED_COL_CLASS),
        )
      })
    }
  }, [editor, layout, openMenu, tableKey])

  const getColumnCount = useCallback(() => {
    return editor.getEditorState().read(() => {
      const node = $getNodeByKey(tableKey)
      if (!$isTableNode(node)) {
        return 0
      }
      return node.getColumnCount()
    })
  }, [editor, tableKey])

  const getLastRowKey = useCallback(() => {
    return editor.getEditorState().read(() => {
      const node = $getNodeByKey(tableKey)
      if (!$isTableNode(node)) {
        return null
      }
      const row = node.getLastChild()
      return $isTableRowNode(row) ? row.getKey() : null
    })
  }, [editor, tableKey])

  const handleOpenRowMenu = useCallback(
    (rowIndex: number, rowKey: NodeKey, anchorRect: DOMRect) => {
      onOpenRowMenu(tableKey, rowIndex, rowKey, anchorRect)
    },
    [onOpenRowMenu, tableKey],
  )

  const handleOpenColMenu = useCallback(
    (colIndex: number, anchorRect: DOMRect) => {
      onOpenColMenu(tableKey, colIndex, anchorRect)
    },
    [onOpenColMenu, tableKey],
  )

  if (!layout) return null

  return createPortal(
    <>
      <RowGripOverlay
        editor={editor}
        tableKey={tableKey}
        anchorElem={anchorElem}
        wrapperEl={layout.wrapperEl}
        rowEls={layout.rowEls}
        hoveredRowIndex={openMenu ? null : hoveredRowIndex}
        highlightedRowIndex={openMenu?.kind === 'row' ? openMenu.rowIndex : null}
        onOpenMenu={handleOpenRowMenu}
      />
      <ColGripOverlay
        editor={editor}
        tableKey={tableKey}
        anchorElem={anchorElem}
        wrapperEl={layout.wrapperEl}
        firstRowCellEls={layout.firstRowCellEls}
        hoveredColIndex={openMenu ? null : hoveredColIndex}
        highlightedColIndex={openMenu?.kind === 'col' ? openMenu.colIndex : null}
        onOpenMenu={handleOpenColMenu}
      />
      <AddRowButton
        editor={editor}
        tableKey={tableKey}
        anchorElem={anchorElem}
        tableEl={layout.tableEl}
        visible={showAddRow && openMenu === null}
        getLastRowKey={getLastRowKey}
      />
      <AddColButton
        editor={editor}
        tableKey={tableKey}
        anchorElem={anchorElem}
        tableEl={layout.tableEl}
        visible={showAddCol && openMenu === null}
        getColumnCount={getColumnCount}
      />
    </>,
    anchorElem,
  )
}

type TableMenuPortalProps = {
  editor: LexicalEditor
  openMenu: OpenMenu
  onClose: () => void
}

function TableMenuPortal({ editor, openMenu, onClose }: TableMenuPortalProps) {
  const [headerChecked, setHeaderChecked] = useState(false)

  useEffect(() => {
    if (!openMenu) {
      setHeaderChecked(false)
      return
    }

    const nextChecked =
      openMenu.kind === 'row'
        ? isTableRowHeader(editor, openMenu.tableKey, openMenu.rowIndex)
        : isTableColumnHeader(editor, openMenu.tableKey, openMenu.colIndex)
    setHeaderChecked(nextChecked)
  }, [editor, openMenu])

  const headerToggle = useMemo<TableActionToggle | undefined>(() => {
    if (!openMenu) {
      return undefined
    }

    const label = openMenu.kind === 'row' ? 'Header Row' : 'Header Column'
    return {
      label,
      icon: <TableProperties className="size-3.5" />,
      checked: headerChecked,
      onCheckedChange: (nextChecked) => {
        setHeaderChecked(nextChecked)
        if (openMenu.kind === 'row') {
          toggleHeaderRow(editor, openMenu.tableKey, openMenu.rowIndex)
          return
        }
        toggleHeaderColumn(editor, openMenu.tableKey, openMenu.colIndex)
      },
    }
  }, [editor, headerChecked, openMenu])

  const sections = useMemo<TableActionSection[]>(() => {
    if (!openMenu) {
      return []
    }

    if (openMenu.kind === 'row') {
      const { tableKey, rowIndex, rowKey } = openMenu
      return [
        {
          id: 'row-duplicate',
          items: [
            {
              id: 'duplicate',
              label: 'Duplicate',
              icon: <Copy className="size-3.5" />,
              shortcut: '⌘D',
              onSelect: () => duplicateRow(editor, tableKey, rowIndex),
            },
          ],
        },
        {
          id: 'row-insert',
          items: [
            {
              id: 'insert-above',
              label: 'Insert above',
              icon: <ArrowUp className="size-3.5" />,
              onSelect: () => smartInsertRow(editor, tableKey, rowKey, 'before'),
            },
            {
              id: 'insert-below',
              label: 'Insert below',
              icon: <ArrowDown className="size-3.5" />,
              onSelect: () => smartInsertRow(editor, tableKey, rowKey, 'after'),
            },
          ],
        },
        {
          id: 'row-danger',
          items: [
            {
              id: 'clear',
              label: 'Clear contents',
              icon: <X className="size-3.5" />,
              onSelect: () => clearRowContents(editor, tableKey, rowIndex),
            },
            {
              id: 'delete',
              label: 'Delete',
              icon: <Trash2 className="size-3.5" />,
              variant: 'danger',
              onSelect: () => deleteRow(editor, tableKey, rowIndex),
            },
          ],
        },
      ]
    }

    const { tableKey, colIndex } = openMenu
    return [
      {
        id: 'col-duplicate',
        items: [
          {
            id: 'duplicate',
            label: 'Duplicate',
            icon: <Copy className="size-3.5" />,
            shortcut: '⌘D',
            onSelect: () => duplicateColumn(editor, tableKey, colIndex),
          },
        ],
      },
      {
        id: 'col-insert',
        items: [
          {
            id: 'insert-left',
            label: 'Insert left',
            icon: <ArrowLeft className="size-3.5" />,
            onSelect: () => smartInsertCol(editor, tableKey, colIndex, 'before'),
          },
          {
            id: 'insert-right',
            label: 'Insert right',
            icon: <ArrowRight className="size-3.5" />,
            onSelect: () => smartInsertCol(editor, tableKey, colIndex, 'after'),
          },
        ],
      },
      {
        id: 'col-danger',
        items: [
          {
            id: 'clear',
            label: 'Clear contents',
            icon: <X className="size-3.5" />,
            onSelect: () => clearColumnContents(editor, tableKey, colIndex),
          },
          {
            id: 'delete',
            label: 'Delete',
            icon: <Trash2 className="size-3.5" />,
            variant: 'danger',
            onSelect: () => deleteColumn(editor, tableKey, colIndex),
          },
        ],
      },
    ]
  }, [editor, openMenu])

  return (
    <TableActionPopover
      open={openMenu !== null}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      anchorRect={openMenu?.anchorRect ?? null}
      headerToggle={headerToggle}
      sections={sections}
      side={openMenu?.kind === 'row' ? 'right' : 'bottom'}
    />
  )
}
