import emojiList from './emoji-list'

export type EmojiPickerItem = {
  emoji: string
  description: string
  searchText: string
  category: string
}

type RawEmojiEntry = {
  emoji: string
  description: string
  category: string
  aliases: string[]
  tags: string[]
}

function toPickerItem(entry: RawEmojiEntry): EmojiPickerItem {
  return {
    emoji: entry.emoji,
    description: entry.description,
    category: entry.category,
    searchText: [entry.description, ...entry.aliases, ...entry.tags].join(' ').toLowerCase(),
  }
}

export const EMOJI_PICKER_ITEMS: EmojiPickerItem[] = (emojiList as RawEmojiEntry[]).map(
  toPickerItem,
)

export const DEFAULT_EMOJI_PICKER_ITEMS: EmojiPickerItem[] = (emojiList as RawEmojiEntry[])
  .filter((entry) => entry.category === 'Smileys & Emotion')
  .slice(0, 64)
  .map(toPickerItem)

export const EMOJI_PICKER_DEFAULT_LIMIT = 64
export const EMOJI_PICKER_SEARCH_LIMIT = 80

export function getVisibleEmojiPickerItems(
  query: string,
  filtered: readonly EmojiPickerItem[],
): EmojiPickerItem[] {
  if (!query.trim()) {
    return DEFAULT_EMOJI_PICKER_ITEMS
  }

  return filtered.slice(0, EMOJI_PICKER_SEARCH_LIMIT)
}

export function shouldShowEmojiPickerDefaultHint(query: string, visibleCount: number): boolean {
  return !query.trim() && visibleCount === EMOJI_PICKER_DEFAULT_LIMIT
}
