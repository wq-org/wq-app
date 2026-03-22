'use client'

import { cva } from 'class-variance-authority'

export type EmojiRatingItem = {
  value: number
  emoji: string
  label: string
}

export const DEFAULT_EMOJIS = [
  { value: 1, emoji: '😞', label: 'Terrible' },
  { value: 2, emoji: '😕', label: 'Bad' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '😊', label: 'Good' },
  { value: 5, emoji: '🤩', label: 'Amazing' },
] as const satisfies readonly EmojiRatingItem[]

export const emojiButtonVariants = cva(
  [
    'inline-flex items-center justify-center',
    'rounded-xl border-2 text-2xl',
    'select-none',
    'cursor-pointer transition-all duration-150 ease-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
  ],
  {
    variants: {
      size: {
        sm: 'size-8 text-xl',
        default: 'size-10 text-2xl',
        lg: 'size-12 text-3xl',
      },
      selected: {
        true: 'border-border bg-muted scale-110 shadow-sm',
        false: 'border-transparent hover:bg-muted hover:scale-105',
      },
    },
    defaultVariants: {
      size: 'default',
      selected: false,
    },
  },
)
