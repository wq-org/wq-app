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
import { evaluateMathEquation } from '../utils/evaluateMathEquation'

export type MathTokenCommitPayload = MathEquationCommitPayload

export type UseMathDropNodeEditorArgs = {
  value: string
  expression?: string
  mathShell?: MathTokenShellState
  onCommit: (payload: MathTokenCommitPayload) => void
  disabled?: boolean
  onRemove?: () => void
  /** Blue/red shell on Enter when evaluation succeeds or fails. Default: true. */
  instantColorFeedback?: boolean
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

/** Re-edit shows stored raw input; falls back to display value for legacy rows. */
function resolveEditText(value: string, expression: string | undefined): string {
  if (expression && expression.length > 0) return expression
  return value
}

function resolveActiveMathShell(
  persisted: MathTokenShellState,
  instant: MathTokenShellState | null,
  instantColorFeedback: boolean,
): MathTokenShellState {
  if (!instantColorFeedback) return persisted
  return instant ?? persisted
}

export function useMathDropNodeEditor({
  value,
  expression,
  mathShell = 'default',
  onCommit,
  disabled = false,
  onRemove,
  instantColorFeedback = true,
}: UseMathDropNodeEditorArgs): UseMathDropNodeEditorResult {
  const nodeRef = useRef<HTMLSpanElement>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [instantShell, setInstantShell] = useState<MathTokenShellState | null>(null)
  const canEdit = !disabled

  const activeMathShell = resolveActiveMathShell(mathShell, instantShell, instantColorFeedback)

  const visualState = resolveDropNodeVisualState({
    disabled,
    isEditing,
    mathShell: activeMathShell,
  })

  const displayText = value

  useEffect(() => {
    setInstantShell(null)
  }, [mathShell, value, expression])

  useEffect(() => {
    if (isEditing || !nodeRef.current) return
    nodeRef.current.textContent = displayText.length > 0 ? displayText : '\u00a0'
  }, [displayText, isEditing])

  const commitEquation = useCallback(
    (raw: string) => {
      const trimmed = raw.trim()
      if (trimmed.length === 0) {
        if (instantColorFeedback) setInstantShell(null)
        if (onRemove) {
          onRemove()
          return
        }
        onCommit({ kind: 'empty' })
        return
      }

      const outcome = evaluateMathEquation(trimmed)
      if (!outcome.ok) {
        if (instantColorFeedback) setInstantShell('error')
        onCommit({ kind: 'error', raw: trimmed })
        return
      }

      if (instantColorFeedback) setInstantShell('success')
      onCommit({
        kind: 'success',
        raw: trimmed,
        expression: outcome.expression,
        display: outcome.display,
        equationShell: instantColorFeedback ? 'success' : 'default',
      })
    },
    [instantColorFeedback, onCommit, onRemove],
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
    setInstantShell(null)
    setIsEditing(true)
    const editText = resolveEditText(value, expression)

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
  }, [canEdit, expression, isEditing, value])

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
        setInstantShell(null)
        if (nodeRef.current) {
          const revert = resolveEditText(value, expression)
          nodeRef.current.textContent = revert.length > 0 ? revert : '\u00a0'
        }
        setIsEditing(false)
        nodeRef.current?.blur()
      }
    },
    [commitEquation, expression, value],
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
