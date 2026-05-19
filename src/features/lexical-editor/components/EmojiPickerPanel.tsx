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

const searchInputClassName =
  'mb-2 cursor-text bg-background text-foreground caret-foreground placeholder:text-muted-foreground'

export type EmojiPickerPanelProps = {
  onSelect: (emoji: string) => void
  className?: string
}

export function EmojiPickerPanel({ onSelect, className }: EmojiPickerPanelProps) {
  const { t } = useTranslation('features.lesson')
  const [query, setQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)

  const filtered = useSearchFilter(EMOJI_PICKER_ITEMS, query, [
    'description',
    'emoji',
    'searchText',
    'category',
  ] as const)

  const visibleItems = getVisibleEmojiPickerItems(query, filtered)
  const showDefaultHint = shouldShowEmojiPickerDefaultHint(query, visibleItems.length)

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

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && visibleItems.length > 0) {
      event.preventDefault()
      onSelect(visibleItems[0].emoji)
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
        onKeyDown={handleKeyDown}
        placeholder={t('editor.emojiPicker.searchPlaceholder')}
        autoComplete="off"
        spellCheck={false}
        className={searchInputClassName}
        aria-label={t('editor.emojiPicker.searchAria')}
      />
      <div className="grid max-h-60 grid-cols-8 gap-1 overflow-y-auto">
        {visibleItems.map((item) => (
          <EmojiPickerButton
            key={`${item.emoji}-${item.description}`}
            description={item.description}
            emoji={item.emoji}
            onSelect={onSelect}
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
  onSelect,
}: {
  description: string
  emoji: string
  onSelect: (emoji: string) => void
}) {
  const handleClick = () => {
    onSelect(emoji)
  }

  return (
    <button
      type="button"
      title={description}
      aria-label={description}
      onClick={handleClick}
      className={emojiButtonVariants({ size: 'sm', selected: false })}
    >
      {emoji}
    </button>
  )
}
