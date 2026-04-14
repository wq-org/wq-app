'use client'

import * as React from 'react'
import { type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { DEFAULT_EMOJIS, emojiButtonVariants, type EmojiRatingItem } from './emoji-rating-variants'

type EmojiRatingButtonSize = NonNullable<VariantProps<typeof emojiButtonVariants>['size']>

export type EmojiRatingProps = Omit<React.ComponentPropsWithoutRef<'div'>, 'onChange'> & {
  value?: number | null
  defaultValue?: number | null
  onValueChange?: (value: number | null) => void
  items?: readonly EmojiRatingItem[]
  showLabel?: boolean
  disabled?: boolean
  size?: EmojiRatingButtonSize
}

export const EmojiRating = React.forwardRef<HTMLDivElement, EmojiRatingProps>(
  (
    {
      value,
      defaultValue = null,
      onValueChange,
      items = DEFAULT_EMOJIS,
      showLabel = true,
      disabled = false,
      size = 'default',
      className,
      'aria-label': ariaLabel = 'Emoji rating',
      ...props
    },
    ref,
  ) => {
    const [internalValue, setInternalValue] = React.useState<number | null>(defaultValue)
    const isControlled = value !== undefined
    const selected = isControlled ? value : internalValue
    const activeItem = items.find((item) => item.value === selected) ?? null

    const handleSelect = (nextValue: number) => {
      if (disabled) return

      const nextSelected = selected === nextValue ? null : nextValue

      if (!isControlled) {
        setInternalValue(nextSelected)
      }

      onValueChange?.(nextSelected)
    }

    return (
      <div
        ref={ref}
        data-slot="emoji-rating"
        role="radiogroup"
        aria-label={ariaLabel}
        className={cn('flex flex-col items-center gap-2', className)}
        {...props}
      >
        <div className="flex items-center gap-1.5">
          {items.map((item) => {
            const isSelected = selected === item.value

            return (
              <button
                key={item.value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={item.label}
                disabled={disabled}
                onClick={() => handleSelect(item.value)}
                className={emojiButtonVariants({
                  size,
                  selected: isSelected,
                })}
              >
                {item.emoji}
              </button>
            )
          })}
        </div>

        {showLabel ? (
          <p
            aria-live="polite"
            aria-atomic="true"
            className={cn(
              'min-h-[1.25rem] text-sm text-muted-foreground transition-opacity duration-150',
              activeItem ? 'opacity-100' : 'opacity-0',
            )}
          >
            {activeItem?.label ?? ''}
          </p>
        ) : null}
      </div>
    )
  },
)

EmojiRating.displayName = 'EmojiRating'
