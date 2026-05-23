import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from 'react'
import type { VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

import { mathNodeVariants } from './math-node-variants'
import { MathNodeSingleLineShell } from './MathNodeSingleLineShell'

export type MathNodeVariant = NonNullable<VariantProps<typeof mathNodeVariants>['variant']>

export type MathNodeProps = {
  value: string
  onValueChange: (value: string) => void
  variant?: MathNodeVariant
  className?: string
  disabled?: boolean
  /** When false, skips inline edit (e.g. palette drag sources). Dragging still works via parent. */
  editable?: boolean
  /** Accessible label when the node is focused for editing. */
  editAriaLabel?: string
  /** Show grab cursor when idle (draggable tokens on the canvas). */
  useGrabCursor?: boolean
  /** Called when the user commits an empty value (e.g. Enter on blank canvas token). */
  onRemove?: () => void
}

function readContentEditableText(element: HTMLElement): string {
  return element.textContent?.replace(/\u00a0/g, ' ').trim() ?? ''
}

export function MathNode({
  value,
  onValueChange,
  variant = 'default',
  className,
  disabled = false,
  editable = true,
  editAriaLabel = 'Edit math node',
  useGrabCursor = false,
  onRemove,
}: MathNodeProps) {
  const nodeRef = useRef<HTMLSpanElement>(null)
  const [isEditing, setIsEditing] = useState(false)
  const canEdit = editable && !disabled

  useEffect(() => {
    if (isEditing || !nodeRef.current) return
    nodeRef.current.textContent = value.length > 0 ? value : '\u00a0'
  }, [isEditing, value])

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

  return (
    <MathNodeSingleLineShell>
      <span
        ref={nodeRef}
        role="textbox"
        tabIndex={canEdit ? 0 : -1}
        contentEditable={isEditing && canEdit}
        suppressContentEditableWarning
        aria-label={isEditing ? editAriaLabel : undefined}
        aria-readonly={!isEditing}
        data-variant={variant}
        data-editing={isEditing ? 'true' : 'false'}
        className={cn(
          mathNodeVariants({ variant, editing: isEditing }),
          useGrabCursor && !isEditing && 'cursor-grab active:cursor-grabbing',
          !useGrabCursor && !isEditing && 'cursor-text',
          disabled && 'cursor-not-allowed opacity-50',
          !canEdit && useGrabCursor && 'pointer-events-none',
          className,
        )}
        onClick={handleClick}
        onFocus={handleFocus}
        onBlur={isEditing ? commitEdit : undefined}
        onKeyDown={isEditing ? handleKeyDown : undefined}
      />
    </MathNodeSingleLineShell>
  )
}
