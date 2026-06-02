import { cva, type VariantProps } from 'class-variance-authority'

import { dotWaveVariants } from '@/components/ui/dot-wave-loader-variant'

export const chatBubbleVariants = cva(
  'inline-block px-4 py-2.5 text-sm leading-relaxed transition-colors',
  {
    variants: {
      variant: {
        default:
          'bg-neutral-200 text-neutral-800 dark:bg-neutral-200 dark:text-neutral-800 [&_p]:text-inherit [&_.editor-contentEditable]:!text-inherit dark:[&_.editor-contentEditable]:!text-inherit [&_.editor-heading-h1]:text-inherit [&_.editor-heading-h2]:text-inherit [&_.editor-heading-h3]:text-inherit [&_.editor-heading-h4]:text-inherit [&_.editor-heading-h5]:text-inherit [&_.editor-heading-h6]:text-inherit',
        dark: 'bg-neutral-900 text-neutral-50',
        'blue-on-gray': 'bg-neutral-100 text-[oklch(var(--oklch-blue))]',
        'darkblue-on-blue':
          'bg-[oklch(var(--oklch-blue)/0.15)] text-[oklch(var(--oklch-darkblue))]',
        violet: 'bg-[oklch(var(--oklch-violet)/0.12)] text-[oklch(var(--oklch-violet))]',
        indigo: 'bg-[oklch(var(--oklch-indigo)/0.12)] text-[oklch(var(--oklch-indigo))]',
        blue: 'bg-[oklch(var(--oklch-blue)/0.12)] text-[oklch(var(--oklch-blue))]',
        cyan: 'bg-[oklch(var(--oklch-cyan)/0.12)] text-[oklch(var(--oklch-cyan))]',
        teal: 'bg-[oklch(var(--oklch-teal)/0.12)] text-[oklch(var(--oklch-teal))]',
        green: 'bg-[oklch(var(--oklch-green)/0.12)] text-[oklch(var(--oklch-green))]',
        lime: 'bg-[oklch(var(--oklch-lime)/0.12)] text-[oklch(var(--oklch-lime))]',
        orange: 'bg-[oklch(var(--oklch-orange)/0.12)] text-[oklch(var(--oklch-orange))]',
        pink: 'bg-[oklch(var(--oklch-pink)/0.12)] text-[oklch(var(--oklch-pink))]',
        darkblue: 'bg-[oklch(var(--oklch-darkblue)/0.12)] text-[oklch(var(--oklch-darkblue))]',
      },
      rounded: {
        sm: 'rounded-md',
        md: 'rounded-xl',
        lg: 'rounded-[1.25rem]',
        xl: 'rounded-[1.75rem]',
        pill: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      rounded: 'lg',
    },
  },
)

export type ChatBubbleVariants = VariantProps<typeof chatBubbleVariants>
export type ChatBubbleVariant = NonNullable<ChatBubbleVariants['variant']>
export type ChatBubbleRounded = NonNullable<ChatBubbleVariants['rounded']>

type DotWaveLoaderVariant = NonNullable<VariantProps<typeof dotWaveVariants>['variant']>

const CHAT_BUBBLE_DOT_WAVE_VARIANT: Record<ChatBubbleVariant, DotWaveLoaderVariant | undefined> = {
  default: undefined,
  dark: 'dark',
  'blue-on-gray': 'blue',
  'darkblue-on-blue': 'darkblue',
  violet: 'violet',
  indigo: 'indigo',
  blue: 'blue',
  cyan: 'cyan',
  teal: 'teal',
  green: 'green',
  lime: 'lime',
  orange: 'orange',
  pink: 'pink',
  darkblue: 'darkblue',
}

/** Maps chat bubble skin to a visible dot-wave variant (`undefined` → theme default on loader). */
export function resolveDotWaveLoaderVariant(
  bubbleVariant: ChatBubbleVariant = 'default',
): DotWaveLoaderVariant | undefined {
  return CHAT_BUBBLE_DOT_WAVE_VARIANT[bubbleVariant]
}

const tailReceivingByRounded: Record<ChatBubbleRounded, string> = {
  sm: 'rounded-bl-sm',
  md: 'rounded-bl-md',
  lg: 'rounded-bl-md',
  xl: 'rounded-bl-lg',
  pill: '',
}

const tailSendingByRounded: Record<ChatBubbleRounded, string> = {
  sm: 'rounded-br-sm',
  md: 'rounded-br-md',
  lg: 'rounded-br-md',
  xl: 'rounded-br-lg',
  pill: '',
}

export function getChatBubbleTailClass(
  direction: 'receiving' | 'sending',
  rounded: ChatBubbleRounded = 'lg',
) {
  return direction === 'receiving' ? tailReceivingByRounded[rounded] : tailSendingByRounded[rounded]
}

/** Subtle entrance when a bubble mounts or switches from loading to content. */
export const chatBubbleEnterAnimation =
  'animate-in fade-in-0 slide-in-from-bottom-4 motion-safe:duration-300' as const
