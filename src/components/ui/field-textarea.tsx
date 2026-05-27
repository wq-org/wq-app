// components/ui/field-textarea.tsx
import { useId, useState, type ChangeEvent, type CSSProperties } from 'react'

import { CharacterCounter } from '@/components/ui/character-counter'
import { Label } from '@/components/ui/label'
import { Separator } from './separator'
import { cn } from '@/lib/utils'

const TEXTAREA_BODY =
  'placeholder:text-muted-foreground disabled:opacity-50 min-h-16 w-full resize-none whitespace-pre-wrap break-words py-2 text-base leading-normal outline-none'

/** Scrollbar colors follow theme tokens (native UA scrollbars are often illegible on dark surfaces). */
const TEXTAREA_SCROLLBAR =
  '[scrollbar-width:thin] [scrollbar-color:var(--primary)_var(--muted)] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-muted [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-primary'

export type FieldTextareaLengthDetail = {
  length: number
  maxLength: number
}

export type FieldTextareaOverLimitDetail = FieldTextareaLengthDetail & {
  excess: number
}

type FieldTextareaProps = {
  value: string
  onValueChange: (value: string) => void
  /** When omitted, no visible label is rendered; `placeholder` is used for `aria-label`. */
  label?: string
  placeholder?: string
  id?: string
  rows?: number
  /** When omitted, there is no character limit (unbounded input). */
  maxLength?: number
  /**
   * When `maxLength` is set, defaults to `true`. When unbounded, defaults to `false`.
   * Pass explicitly to override.
   */
  showCounter?: boolean
  /** Hide the bottom separator line. Defaults to true since textarea are typically inside cards or bordered containers. */
  hideSeparator?: boolean
  disabled?: boolean
  /** When true, the textarea is not editable and stays visually normal (unlike `disabled`). */
  readOnly?: boolean
  className?: string
  /**
   * Fires once when the value grows to exactly `maxLength` (previous length was below the limit).
   * Only used when `maxLength` is set.
   */
  onReachMaxLength?: (detail: FieldTextareaLengthDetail) => void
  /**
   * Fires on every change while `value.length` is greater than `maxLength`.
   * Only used when `maxLength` is set; allows parents to flag validation or block submit.
   */
  onOverMaxLength?: (detail: FieldTextareaOverLimitDetail) => void
}

export const FieldTextarea = ({
  value,
  onValueChange,
  label,
  placeholder = label,
  id,
  rows = 4,
  maxLength: maxLengthProp,
  showCounter: showCounterProp,
  hideSeparator = false,
  disabled = false,
  readOnly = false,
  className,
  onReachMaxLength,
  onOverMaxLength,
}: FieldTextareaProps) => {
  const generatedId = useId()
  const resolvedId = id ?? generatedId
  const [scrollTop, setScrollTop] = useState(0)
  const [isTextareaHovered, setIsTextareaHovered] = useState(false)
  const [isTextareaFocused, setIsTextareaFocused] = useState(false)

  const hasLimit = maxLengthProp !== undefined && maxLengthProp > 0
  const maxLength = hasLimit ? maxLengthProp! : 0
  const resolvedPlaceholder = placeholder ?? label ?? ''
  const textareaAriaLabel = label?.trim() ? label : resolvedPlaceholder || undefined

  const showCounter = showCounterProp !== undefined ? showCounterProp : hasLimit

  const remaining = hasLimit ? maxLength - value.length : 0

  const useHighlightOverlay = hasLimit && value.length > 0

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const next = event.target.value
    const prevLen = value.length

    if (hasLimit) {
      if (prevLen < maxLength && next.length === maxLength) {
        onReachMaxLength?.({ length: next.length, maxLength })
      }
      if (next.length > maxLength) {
        onOverMaxLength?.({
          length: next.length,
          maxLength,
          excess: next.length - maxLength,
        })
      }
    }

    onValueChange(next)
  }

  const handleScroll = (event: React.UIEvent<HTMLTextAreaElement>) => {
    setScrollTop(event.currentTarget.scrollTop)
  }

  const textareaShared = cn(
    TEXTAREA_BODY,
    'bg-transparent',
    useHighlightOverlay && 'text-transparent caret-foreground [text-shadow:none]',
  )

  const separatorClassName = cn(
    'transition-colors duration-200',
    isTextareaFocused ? 'bg-primary' : isTextareaHovered ? 'bg-muted-foreground/45' : undefined,
  )

  return (
    <div className={cn('w-full pb-2', className)}>
      {label?.trim() ? <Label htmlFor={resolvedId}>{label}</Label> : null}

      <div className={cn('relative w-full', label?.trim() ? 'my-4' : '')}>
        {useHighlightOverlay ? (
          <div
            className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
            aria-hidden
          >
            <div
              className={cn(TEXTAREA_BODY, 'text-foreground')}
              style={{ transform: `translateY(-${scrollTop}px)` }}
            >
              <span className="text-foreground">{value.slice(0, maxLength)}</span>
              {value.length > maxLength ? (
                <span className="rounded-sm bg-destructive text-destructive-foreground">
                  {value.slice(maxLength)}
                </span>
              ) : null}
            </div>
          </div>
        ) : null}

        <textarea
          id={resolvedId}
          data-slot="textarea"
          className={cn(textareaShared, 'relative z-10', TEXTAREA_SCROLLBAR)}
          style={
            useHighlightOverlay
              ? ({ WebkitTextFillColor: 'transparent' } satisfies CSSProperties)
              : undefined
          }
          placeholder={resolvedPlaceholder || undefined}
          aria-label={textareaAriaLabel}
          rows={rows}
          value={value}
          onChange={readOnly ? undefined : handleChange}
          onScroll={useHighlightOverlay ? handleScroll : undefined}
          onMouseEnter={() => setIsTextareaHovered(true)}
          onMouseLeave={() => setIsTextareaHovered(false)}
          onFocus={() => setIsTextareaFocused(true)}
          onBlur={() => setIsTextareaFocused(false)}
          disabled={disabled && !readOnly}
          readOnly={readOnly}
        />
      </div>

      <div className="flex flex-col justify-end gap-2">
        {!hideSeparator ? (
          <Separator
            orientation="horizontal"
            decorative
            className={separatorClassName}
          />
        ) : null}
        {showCounter && hasLimit ? (
          <div className="mr-4 flex justify-end">
            <CharacterCounter
              count={remaining}
              max={maxLength}
              size="md"
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}
