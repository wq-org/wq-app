import type { ChangeEvent, KeyboardEvent as ReactKeyboardEvent } from 'react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { emojiButtonVariants } from '@/components/ui/emoji-rating-variants'
import { Input } from '@/components/ui/input'
import { useSearchFilter } from '@/hooks/useSearchFilter'
import { cn } from '@/lib/utils'

import {
  EMOJI_PICKER_ITEMS,
  getVisibleEmojiPickerItems,
  shouldShowEmojiPickerDefaultHint,
} from '../utils/emojiPickerItems'

const GRID_COLUMNS = 8
const searchInputClassName =
  'mb-2 cursor-text bg-background text-foreground caret-foreground placeholder:text-muted-foreground'

export type EmojiPickerPanelProps = {
  onSelect: (emoji: string) => void
  className?: string
}

type EmojiPickerButtonProps = {
  description: string
  emoji: string
  index: number
  isFocused: boolean
  buttonRef: (el: HTMLButtonElement | null) => void
  onSelect: (emoji: string) => void
  onKeyDown: (event: ReactKeyboardEvent<HTMLButtonElement>, index: number) => void
}

export function EmojiPickerPanel({ onSelect, className }: EmojiPickerPanelProps) {
  const { t } = useTranslation('features.lesson')
  const [query, setQuery] = useState('')
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([])

  const filtered = useSearchFilter(EMOJI_PICKER_ITEMS, query, [
    'description',
    'emoji',
    'searchText',
    'category',
  ] as const)

  const visibleItems = getVisibleEmojiPickerItems(query, filtered)
  const showDefaultHint = shouldShowEmojiPickerDefaultHint(query, visibleItems.length)

  buttonRefs.current.length = visibleItems.length

  useEffect(() => {
    const input = searchInputRef.current
    if (!input) {
      return
    }

    requestAnimationFrame(() => {
      input.focus({ preventScroll: true })
      input.select()
    })
  }, [])

  const focusButton = (index: number) => {
    if (visibleItems.length === 0) {
      return
    }
    const clamped = Math.max(0, Math.min(index, visibleItems.length - 1))
    setFocusedIndex(clamped)
    buttonRefs.current[clamped]?.focus({ preventScroll: true })
  }

  const returnToInput = () => {
    setFocusedIndex(null)
    searchInputRef.current?.focus({ preventScroll: true })
  }

  const handleQueryChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value)
    setFocusedIndex(null)
  }

  const handleInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && visibleItems.length > 0) {
      event.preventDefault()
      onSelect(visibleItems[0].emoji)
      return
    }
    if (
      (event.key === 'ArrowRight' || event.key === 'ArrowDown') &&
      visibleItems.length > 0
    ) {
      event.preventDefault()
      focusButton(0)
    }
  }

  const handleButtonKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    switch (event.key) {
      case 'ArrowRight': {
        event.preventDefault()
        const next = index + 1 < visibleItems.length ? index + 1 : 0
        focusButton(next)
        return
      }
      case 'ArrowLeft': {
        event.preventDefault()
        const prev = index - 1 >= 0 ? index - 1 : visibleItems.length - 1
        focusButton(prev)
        return
      }
      case 'ArrowDown': {
        event.preventDefault()
        focusButton(Math.min(index + GRID_COLUMNS, visibleItems.length - 1))
        return
      }
      case 'ArrowUp': {
        event.preventDefault()
        if (index - GRID_COLUMNS < 0) {
          returnToInput()
          return
        }
        focusButton(index - GRID_COLUMNS)
        return
      }
      case 'Escape':
      case 'Backspace': {
        event.preventDefault()
        returnToInput()
        return
      }
      case 'Enter':
      case ' ': {
        event.preventDefault()
        onSelect(visibleItems[index].emoji)
        return
      }
    }
  }

  return (
    <div
      className={cn(
        'w-[280px] rounded-2xl border border-border bg-popover p-2 text-popover-foreground shadow-xl backdrop-blur-xl supports-backdrop-filter:bg-popover/90',
        className,
      )}
    >
      <Input
        ref={searchInputRef}
        type="text"
        value={query}
        onChange={handleQueryChange}
        onKeyDown={handleInputKeyDown}
        placeholder={t('editor.emojiPicker.searchPlaceholder')}
        autoComplete="off"
        spellCheck={false}
        className={searchInputClassName}
        aria-label={t('editor.emojiPicker.searchAria')}
      />
      <div
        role="grid"
        aria-colcount={GRID_COLUMNS}
        className="grid max-h-60 grid-cols-8 gap-1 overflow-y-auto"
      >
        {visibleItems.map((item, index) => (
          <EmojiPickerButton
            key={`${item.emoji}-${item.description}`}
            description={item.description}
            emoji={item.emoji}
            index={index}
            isFocused={focusedIndex === index}
            buttonRef={(el) => {
              buttonRefs.current[index] = el
            }}
            onSelect={onSelect}
            onKeyDown={handleButtonKeyDown}
          />
        ))}
      </div>
      {showDefaultHint ? (
        <p className="mt-2 px-1 text-xs text-muted-foreground">
          {t('editor.emojiPicker.searchHint')}
        </p>
      ) : null}
    </div>
  )
}

function EmojiPickerButton({
  description,
  emoji,
  index,
  isFocused,
  buttonRef,
  onSelect,
  onKeyDown,
}: EmojiPickerButtonProps) {
  const handleClick = () => {
    onSelect(emoji)
  }

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    onKeyDown(event, index)
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      role="gridcell"
      title={description}
      aria-label={description}
      aria-selected={isFocused}
      tabIndex={-1}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={emojiButtonVariants({ size: 'sm', selected: false })}
    >
      {emoji}
    </button>
  )
}
