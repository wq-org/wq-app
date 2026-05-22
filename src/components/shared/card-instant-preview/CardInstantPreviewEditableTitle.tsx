import { useEffect, useRef, type KeyboardEvent } from 'react'
import { useDisclosure } from '@/hooks/use-disclosure'
import { cn } from '@/lib/utils'
import { cardInstantPreviewTitleId } from './card-instant-preview.utils'

export type CardInstantPreviewEditableTitleProps = {
  cardId: string
  value: string
  onChange: (value: string) => void
  className?: string
}

const editableTitleFieldClassName = cn(
  'w-full min-w-0 rounded border border-blue-500 bg-transparent px-1 -mx-1',
  'font-bold leading-[1.12] tracking-tight text-neutral-900 outline-none',
  'focus-visible:ring-2 focus-visible:ring-blue-500/30',
)

const editableTitleDisplayClassName = cn(
  'cursor-text rounded border border-transparent px-1 -mx-1 transition-colors',
  'hover:border-blue-500',
)

export function CardInstantPreviewEditableTitle({
  cardId,
  value,
  onChange,
  className,
}: CardInstantPreviewEditableTitleProps) {
  const titleId = cardInstantPreviewTitleId(cardId)
  const inputRef = useRef<HTMLInputElement>(null)
  const { isOpen: isEditing, onOpen: startEditing, onClose: stopEditing } = useDisclosure()

  useEffect(() => {
    if (!isEditing) return
    const input = inputRef.current
    input?.focus()
    input?.select()
  }, [isEditing])

  const commitEdit = () => {
    const trimmed = inputRef.current?.value.trim() ?? ''
    onChange(trimmed || value)
    stopEditing()
  }

  const cancelEdit = () => {
    if (inputRef.current) {
      inputRef.current.value = value
    }
    stopEditing()
  }

  const handleDisplayKeyDown = (event: KeyboardEvent<HTMLHeadingElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      startEditing()
    }
  }

  const handleFieldKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    event.stopPropagation()

    if (event.key === 'Enter') {
      event.preventDefault()
      commitEdit()
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      cancelEdit()
    }
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        id={titleId}
        type="text"
        defaultValue={value}
        aria-label="Edit title"
        className={cn(editableTitleFieldClassName, className)}
        onBlur={commitEdit}
        onKeyDown={handleFieldKeyDown}
        onClick={(event) => event.stopPropagation()}
      />
    )
  }

  return (
    <h2
      id={titleId}
      role="button"
      tabIndex={0}
      className={cn(editableTitleDisplayClassName, 'break-words', className)}
      onClick={(event) => {
        event.stopPropagation()
        startEditing()
      }}
      onKeyDown={handleDisplayKeyDown}
    >
      {value}
    </h2>
  )
}
