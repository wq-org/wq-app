import { cn } from '@/lib/utils'

import {
  canvasDropNodeCompactMathClass,
  dropNodeEditableVariants,
  mathNodeShellVariants,
} from './drop-node-variants'
import { MathNodeSingleLineShell } from './MathNodeSingleLineShell'
import type { MathTokenShellState } from './math-token-shell.types'
import { useMathDropNodeEditor, type MathTokenCommitPayload } from './useMathDropNodeEditor'

export type DropMathNodeProps = {
  value: string
  expression?: string
  mathShell?: MathTokenShellState
  onCommit: (payload: MathTokenCommitPayload) => void
  className?: string
  disabled?: boolean
  editAriaLabel?: string
  useGrabCursor?: boolean
  onRemove?: () => void
  /** Smaller padding when the canvas is in rest (non-drag) layout. */
  compact?: boolean
}

/** Canvas equation token — evaluates on Enter; row adds `=` + result badges. */
export function DropMathNode({
  value,
  expression,
  mathShell = 'default',
  onCommit,
  className,
  disabled = false,
  editAriaLabel = 'Edit math token on canvas',
  useGrabCursor = false,
  onRemove,
  compact = false,
}: DropMathNodeProps) {
  const editor = useMathDropNodeEditor({
    value,
    expression,
    mathShell,
    onCommit,
    disabled,
    onRemove,
  })

  const shellClassName = cn(
    mathNodeShellVariants({ state: editor.visualState }),
    compact && canvasDropNodeCompactMathClass,
    !editor.isEditing && !disabled && useGrabCursor && 'cursor-grab active:cursor-grabbing',
    !editor.isEditing && !disabled && !useGrabCursor && 'cursor-text',
    editor.isEditing && 'cursor-text',
    className,
  )

  return (
    <MathNodeSingleLineShell>
      <span
        className={shellClassName}
        data-node="math"
        data-state={editor.visualState}
        data-math-shell={mathShell}
        onClick={editor.canEdit && !editor.isEditing ? editor.handleClick : undefined}
      >
        <span
          ref={editor.nodeRef}
          role="textbox"
          tabIndex={editor.canEdit ? 0 : -1}
          contentEditable={editor.isEditing && editor.canEdit}
          suppressContentEditableWarning
          aria-label={editor.isEditing ? editAriaLabel : undefined}
          aria-readonly={!editor.isEditing}
          className={dropNodeEditableVariants({ state: editor.visualState })}
          onClick={editor.handleClick}
          onFocus={editor.handleFocus}
          onBlur={editor.handleBlur}
          onKeyDown={editor.handleKeyDown}
        />
      </span>
    </MathNodeSingleLineShell>
  )
}
