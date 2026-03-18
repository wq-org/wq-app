import { cva } from 'class-variance-authority'

export const messageBubbleVariants = cva(
  [
    'inline-block',
    'rounded-[20px]',
    'px-4 py-2.5',
    'text-[15px] leading-snug font-normal',
    'max-w-[280px] sm:max-w-xs',
    'select-text',
  ],
  {
    variants: {
      variant: {
        // Design-system oklch tokens (aligned with badge-variants)
        violet: 'bg-[oklch(var(--oklch-violet))] text-white',
        indigo: 'bg-[oklch(var(--oklch-indigo))] text-white',
        blue: 'bg-[oklch(var(--oklch-blue))] text-white',
        darkblue: 'bg-[oklch(var(--oklch-darkblue))] text-white',
        cyan: 'bg-[oklch(var(--oklch-cyan))] text-white',
        green: 'bg-[oklch(var(--oklch-green))] text-white',
        lime: 'bg-[oklch(var(--oklch-lime))] text-white',
        orange: 'bg-[oklch(var(--oklch-orange))] text-white',
        pink: 'bg-[oklch(var(--oklch-pink))] text-white',
        // Neutrals (no token)
        black: 'bg-[oklch(0.18_0.00_0)] text-white',
        gray: 'bg-[oklch(0.93_0.00_0)] text-[oklch(0.15_0.00_0)]',
      },
      tail: {
        left: 'mb-tail-left',
        right: 'mb-tail-right',
        none: '',
      },
    },
    defaultVariants: {
      variant: 'blue',
      tail: 'none',
    },
  },
)

export type MessageBubbleVariant =
  | 'violet'
  | 'indigo'
  | 'blue'
  | 'darkblue'
  | 'cyan'
  | 'green'
  | 'lime'
  | 'orange'
  | 'pink'
  | 'black'
  | 'gray'
export type MessageBubbleTail = 'left' | 'right' | 'none'

/** @deprecated Use messageBubbleVariants from message-bubble-variants.ts */
export const bubbleVariants = messageBubbleVariants
