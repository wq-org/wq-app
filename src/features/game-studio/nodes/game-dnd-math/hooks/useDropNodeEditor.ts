import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type RefObject,
} from 'react'

import { resolveDropNodeVisualState, type DropNodeVisualState } from '../types/drop-node.types'

export type UseDropNodeEditorArgs = {
  value: string
  onValueChange: (value: string) => void
  editable?: boolean
  disabled?: boolean
  inactive?: boolean
  onRemove?: () => void
}

export type UseDropNodeEditorResult = {
  nodeRef: RefObject<HTMLSpanElement | null>
  visualState: DropNodeVisualState
  isEditing: boolean
  canEdit: boolean
  handleClick: (event: MouseEvent<HTMLSpanElement>) => void
  handleFocus: () => void
  handleBlur: (() => void) | undefined
  handleKeyDown: ((event: KeyboardEvent<HTMLSpanElement>) => void) | undefined
}

function readContentEditableText(element: HTMLElement): string {
  return element.textContent?.replace(/\u00a0/g, ' ').trim() ?? ''
}

export function useDropNodeEditor({
  value,
  onValueChange,
  editable = true,
  disabled = false,
  inactive = false,
  onRemove,
}: UseDropNodeEditorArgs): UseDropNodeEditorResult {
  const nodeRef = useRef<HTMLSpanElement>(null)
  const [isEditing, setIsEditing] = useState(false)
  const canEdit = editable && !disabled && !inactive

  const visualState = resolveDropNodeVisualState({
    disabled,
    isEditing,
    inactive: inactive && !isEditing,
  })

  useEffect(() => {
    if (isEditing || inactive || !nodeRef.current) return
    nodeRef.current.textContent = value.length > 0 ? value : '\u00a0'
  }, [inactive, isEditing, value])

  const commitEdit = useCallback(() => {
    const element = nodeRef.current
    if (!element) return

    const next = readContentEditableText(element)
    setIsEditing(false)
    element.blur()

    if (next.length === 0) {
      if (onRemove) {
        onRemove()
        return
      }
      element.textContent = '\u00a0'
      onValueChange('')
      return
    }

    element.textContent = next
    onValueChange(next)
  }, [onRemove, onValueChange])

  const beginEditing = useCallback(() => {
    if (!canEdit || isEditing) return
    setIsEditing(true)
    requestAnimationFrame(() => {
      const element = nodeRef.current
      if (!element) return
      element.focus()
      const selection = window.getSelection()
      const range = document.createRange()
      range.selectNodeContents(element)
      selection?.removeAllRanges()
      selection?.addRange(range)
    })
  }, [canEdit, isEditing])

  const handleClick = useCallback(
    (event: MouseEvent<HTMLSpanElement>) => {
      event.preventDefault()
      event.stopPropagation()
      beginEditing()
    },
    [beginEditing],
  )

  const handleFocus = useCallback(() => {
    if (!isEditing) beginEditing()
  }, [beginEditing, isEditing])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLSpanElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault()
        commitEdit()
        return
      }
      if (event.key === 'Escape') {
        event.preventDefault()
        if (nodeRef.current) {
          nodeRef.current.textContent = value.length > 0 ? value : '\u00a0'
        }
        setIsEditing(false)
        nodeRef.current?.blur()
      }
    },
    [commitEdit, value],
  )

  return {
    nodeRef,
    visualState,
    isEditing,
    canEdit,
    handleClick,
    handleFocus,
    handleBlur: isEditing ? commitEdit : undefined,
    handleKeyDown: isEditing ? handleKeyDown : undefined,
  }
}
