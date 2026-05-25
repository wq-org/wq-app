import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type RefObject,
} from 'react'

import type { MathTokenShellState } from '../types/math-token-shell.types'
import { resolveDropNodeVisualState, type DropNodeVisualState } from '../types/drop-node.types'
import type { MathEquationCommitPayload } from '../utils/mathEquationRow'
import { evaluateMathExpression } from '../utils/evaluateMathExpression'

export type MathTokenCommitPayload = MathEquationCommitPayload

export type UseMathDropNodeEditorArgs = {
  value: string
  expression?: string
  mathShell?: MathTokenShellState
  onCommit: (payload: MathTokenCommitPayload) => void
  disabled?: boolean
  onRemove?: () => void
}

export type UseMathDropNodeEditorResult = {
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

function resolveEditText(
  value: string,
  expression: string | undefined,
  mathShell: MathTokenShellState,
): string {
  if (mathShell === 'error' && expression) return expression
  return expression ?? value
}

export function useMathDropNodeEditor({
  value,
  expression,
  mathShell = 'default',
  onCommit,
  disabled = false,
  onRemove,
}: UseMathDropNodeEditorArgs): UseMathDropNodeEditorResult {
  const nodeRef = useRef<HTMLSpanElement>(null)
  const [isEditing, setIsEditing] = useState(false)
  const canEdit = !disabled

  const visualState = resolveDropNodeVisualState({
    disabled,
    isEditing,
    mathShell,
  })

  const displayText = value

  useEffect(() => {
    if (isEditing || !nodeRef.current) return
    nodeRef.current.textContent = displayText.length > 0 ? displayText : '\u00a0'
  }, [displayText, isEditing])

  const commitEquation = useCallback(
    (raw: string) => {
      const trimmed = raw.trim()
      if (trimmed.length === 0) {
        if (onRemove) {
          onRemove()
          return
        }
        onCommit({ kind: 'empty' })
        return
      }

      const outcome = evaluateMathExpression(trimmed)
      if (!outcome.ok) {
        onCommit({ kind: 'error', raw: trimmed })
        return
      }

      onCommit({
        kind: 'success',
        expression: outcome.expression,
        display: outcome.display,
      })
    },
    [onCommit, onRemove],
  )

  const cancelEditing = useCallback(() => {
    setIsEditing(false)
    const element = nodeRef.current
    if (!element) return
    element.textContent = displayText.length > 0 ? displayText : '\u00a0'
    element.blur()
  }, [displayText])

  const beginEditing = useCallback(() => {
    if (!canEdit || isEditing) return
    setIsEditing(true)
    const editText = resolveEditText(value, expression, mathShell)

    requestAnimationFrame(() => {
      const element = nodeRef.current
      if (!element) return
      element.textContent = editText.length > 0 ? editText : '\u00a0'
      element.focus()
      const selection = window.getSelection()
      const range = document.createRange()
      range.selectNodeContents(element)
      selection?.removeAllRanges()
      selection?.addRange(range)
    })
  }, [canEdit, expression, isEditing, mathShell, value])

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
        const element = nodeRef.current
        if (!element) return
        const raw = readContentEditableText(element)
        setIsEditing(false)
        element.blur()
        commitEquation(raw)
        return
      }
      if (event.key === 'Escape') {
        event.preventDefault()
        if (nodeRef.current) {
          const revert = resolveEditText(value, expression, mathShell)
          nodeRef.current.textContent = revert.length > 0 ? revert : '\u00a0'
        }
        setIsEditing(false)
        nodeRef.current?.blur()
      }
    },
    [commitEquation, expression, mathShell, value],
  )

  return {
    nodeRef,
    visualState,
    isEditing,
    canEdit,
    handleClick,
    handleFocus,
    handleBlur: isEditing ? cancelEditing : undefined,
    handleKeyDown: isEditing ? handleKeyDown : undefined,
  }
}
