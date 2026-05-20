import { $getTableCellNodeFromLexicalNode, $isTableCellNode } from '@lexical/table'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  SELECTION_CHANGE_COMMAND,
  type LexicalEditor,
  type NodeKey,
} from 'lexical'
import { Eraser, Palette, Plus, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

import { AddColButton } from './AddColButton'
import { AddRowButton } from './AddRowButton'
import { ColGripOverlay } from './ColGripOverlay'
import { RowGripOverlay } from './RowGripOverlay'
import { TableActionPopover, type PopoverAction } from './TableActionPopover'
import {
  clearColumnContents,
  clearRowContents,
  deleteColumn,
  deleteRow,
  duplicateColumn,
  duplicateRow,
  insertColumnAt,
  insertRowAt,
  toggleHeaderColumn,
  toggleHeaderRow,
} from './tableActions'
import { useTableKeys } from './useTableDOMMap'

const FOCUSED_CELL_CLASS = 'editor-tableCell--focused'
const SELECTED_ROW_CLASS = 'editor-tableRow--selected'
const SELECTED_COL_CLASS = 'editor-tableCol--selected'
const EDGE_REVEAL_DISTANCE = 12

type OpenMenu =
  | { kind: 'row'; tableKey: NodeKey; rowIndex: number; anchorRect: DOMRect }
  | { kind: 'col'; tableKey: NodeKey; colIndex: number; anchorRect: DOMRect }
  | null

export function TableInteractionPlugin({ anchorElem }: { anchorElem: HTMLElement }) {
  const [editor] = useLexicalComposerContext()
  const tableKeys = useTableKeys(editor)
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null)

  useFocusRing(editor)

  const handleCloseMenu = useCallback(() => setOpenMenu(null), [])

  return (
    <>
      {Array.from(tableKeys).map((tableKey) => (
        <TableOverlay
          key={tableKey}
          editor={editor}
          tableKey={tableKey}
          anchorElem={anchorElem}
          openMenu={openMenu?.tableKey === tableKey ? openMenu : null}
          setOpenMenu={setOpenMenu}
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
  setOpenMenu: (menu: OpenMenu) => void
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

function TableOverlay({ editor, tableKey, anchorElem, openMenu, setOpenMenu }: TableOverlayProps) {
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

  useEffect(() => {
    if (!layout) return
    const { wrapperEl, rowEls, firstRowCellEls } = layout

    const onMove = (e: PointerEvent) => {
      const rect = wrapperEl.getBoundingClientRect()
      const insideY = e.clientY >= rect.top && e.clientY <= rect.bottom
      const insideX = e.clientX >= rect.left && e.clientX <= rect.right
      const inside = insideX && insideY

      const nearBottom =
        e.clientY >= rect.bottom &&
        e.clientY <= rect.bottom + EDGE_REVEAL_DISTANCE &&
        e.clientX >= rect.left &&
        e.clientX <= rect.right
      const nearRight =
        e.clientX >= rect.right &&
        e.clientX <= rect.right + EDGE_REVEAL_DISTANCE &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom

      setShowAddRow(inside || nearBottom)
      setShowAddCol(inside || nearRight)

      if (!inside) {
        setHoveredRowIndex(null)
        setHoveredColIndex(null)
        return
      }

      let rowIndex: number | null = null
      for (let i = 0; i < rowEls.length; i++) {
        const r = rowEls[i].getBoundingClientRect()
        if (e.clientY >= r.top && e.clientY <= r.bottom) {
          rowIndex = i
          break
        }
      }
      let colIndex: number | null = null
      for (let i = 0; i < firstRowCellEls.length; i++) {
        const c = firstRowCellEls[i].getBoundingClientRect()
        if (e.clientX >= c.left && e.clientX <= c.right) {
          colIndex = i
          break
        }
      }
      setHoveredRowIndex(rowIndex)
      setHoveredColIndex(colIndex)
    }

    const onLeave = (e: PointerEvent) => {
      const rect = wrapperEl.getBoundingClientRect()
      const within =
        e.clientX >= rect.left - EDGE_REVEAL_DISTANCE &&
        e.clientX <= rect.right + EDGE_REVEAL_DISTANCE &&
        e.clientY >= rect.top - EDGE_REVEAL_DISTANCE &&
        e.clientY <= rect.bottom + EDGE_REVEAL_DISTANCE
      if (!within) {
        setHoveredRowIndex(null)
        setHoveredColIndex(null)
        setShowAddRow(false)
        setShowAddCol(false)
      }
    }

    document.addEventListener('pointermove', onMove)
    document.addEventListener('pointerleave', onLeave)
    return () => {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
    }
  }, [layout])

  useEffect(() => {
    if (!layout) return
    layout.rowEls.forEach((row, index) => {
      const selected = openMenu?.kind === 'row' && openMenu.rowIndex === index
      row.classList.toggle(SELECTED_ROW_CLASS, selected)
    })
    return () => {
      layout.rowEls.forEach((row) => row.classList.remove(SELECTED_ROW_CLASS))
    }
  }, [layout, openMenu])

  useEffect(() => {
    if (!layout) return
    const colIndex = openMenu?.kind === 'col' ? openMenu.colIndex : -1
    layout.rowEls.forEach((row) => {
      Array.from(row.children).forEach((cell, idx) => {
        ;(cell as HTMLElement).classList.toggle(SELECTED_COL_CLASS, idx === colIndex)
      })
    })
    return () => {
      layout.rowEls.forEach((row) => {
        Array.from(row.children).forEach((cell) =>
          (cell as HTMLElement).classList.remove(SELECTED_COL_CLASS),
        )
      })
    }
  }, [layout, openMenu])

  const getRowCount = useCallback(() => layout?.rowEls.length ?? 0, [layout])
  const getColumnCount = useCallback(() => layout?.firstRowCellEls.length ?? 0, [layout])

  const onOpenRowMenu = useCallback(
    (rowIndex: number, anchorRect: DOMRect) => {
      setOpenMenu({ kind: 'row', tableKey, rowIndex, anchorRect })
    },
    [setOpenMenu, tableKey],
  )

  const onOpenColMenu = useCallback(
    (colIndex: number, anchorRect: DOMRect) => {
      setOpenMenu({ kind: 'col', tableKey, colIndex, anchorRect })
    },
    [setOpenMenu, tableKey],
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
        onOpenMenu={onOpenRowMenu}
      />
      <ColGripOverlay
        editor={editor}
        tableKey={tableKey}
        anchorElem={anchorElem}
        wrapperEl={layout.wrapperEl}
        firstRowCellEls={layout.firstRowCellEls}
        hoveredColIndex={openMenu ? null : hoveredColIndex}
        highlightedColIndex={openMenu?.kind === 'col' ? openMenu.colIndex : null}
        onOpenMenu={onOpenColMenu}
      />
      <AddRowButton
        editor={editor}
        tableKey={tableKey}
        anchorElem={anchorElem}
        wrapperEl={layout.wrapperEl}
        visible={showAddRow && openMenu === null}
        getRowCount={getRowCount}
      />
      <AddColButton
        editor={editor}
        tableKey={tableKey}
        anchorElem={anchorElem}
        wrapperEl={layout.wrapperEl}
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
  const actions = useMemo<PopoverAction[]>(() => {
    if (!openMenu) return []
    if (openMenu.kind === 'row') {
      const { tableKey, rowIndex } = openMenu
      return [
        {
          id: 'toggle-header-row',
          label: 'Header row',
          icon: <Palette className="size-3.5" />,
          onSelect: () => toggleHeaderRow(editor, tableKey, rowIndex),
        },
        {
          id: 'insert-above',
          label: 'Insert above',
          icon: <Plus className="size-3.5" />,
          onSelect: () => insertRowAt(editor, tableKey, rowIndex, 'above'),
        },
        {
          id: 'insert-below',
          label: 'Insert below',
          icon: <Plus className="size-3.5" />,
          onSelect: () => insertRowAt(editor, tableKey, rowIndex, 'below'),
        },
        {
          id: 'duplicate',
          label: 'Duplicate',
          shortcut: '⌘D',
          onSelect: () => duplicateRow(editor, tableKey, rowIndex),
        },
        {
          id: 'clear',
          label: 'Clear contents',
          icon: <Eraser className="size-3.5" />,
          onSelect: () => clearRowContents(editor, tableKey, rowIndex),
        },
        {
          id: 'delete',
          label: 'Delete',
          icon: <Trash2 className="size-3.5" />,
          variant: 'danger',
          onSelect: () => deleteRow(editor, tableKey, rowIndex),
        },
      ]
    }
    const { tableKey, colIndex } = openMenu
    return [
      {
        id: 'toggle-header-col',
        label: 'Header column',
        icon: <Palette className="size-3.5" />,
        onSelect: () => toggleHeaderColumn(editor, tableKey, colIndex),
      },
      {
        id: 'color',
        label: 'Color',
        icon: <Palette className="size-3.5" />,
        hasSubmenu: true,
        onSelect: () => {
          // TODO: open color submenu
        },
      },
      {
        id: 'insert-left',
        label: 'Insert left',
        icon: <Plus className="size-3.5" />,
        onSelect: () => insertColumnAt(editor, tableKey, colIndex, 'left'),
      },
      {
        id: 'insert-right',
        label: 'Insert right',
        icon: <Plus className="size-3.5" />,
        onSelect: () => insertColumnAt(editor, tableKey, colIndex, 'right'),
      },
      {
        id: 'duplicate',
        label: 'Duplicate',
        shortcut: '⌘D',
        onSelect: () => duplicateColumn(editor, tableKey, colIndex),
      },
      {
        id: 'clear',
        label: 'Clear contents',
        icon: <Eraser className="size-3.5" />,
        onSelect: () => clearColumnContents(editor, tableKey, colIndex),
      },
      {
        id: 'delete',
        label: 'Delete',
        icon: <Trash2 className="size-3.5" />,
        variant: 'danger',
        onSelect: () => deleteColumn(editor, tableKey, colIndex),
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
      actions={actions}
      side={openMenu?.kind === 'row' ? 'right' : 'bottom'}
    />
  )
}
