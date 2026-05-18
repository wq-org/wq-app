import { cva, type VariantProps } from 'class-variance-authority'

export const CHARACTER_COUNTER_WARNING_AT = 20

export const characterCounterVariants = cva(
  'relative inline-flex shrink-0 items-center justify-center',
  {
    variants: {
      variant: {
        default:
          '[--character-counter-ring:oklch(var(--oklch-blue))] [--character-counter-warning:oklch(var(--oklch-orange))] [--character-counter-exceed:hsl(var(--destructive))]',
        darkblue:
          '[--character-counter-ring:oklch(var(--oklch-darkblue))] [--character-counter-warning:oklch(var(--oklch-orange))] [--character-counter-exceed:hsl(var(--destructive))]',
        violet:
          '[--character-counter-ring:oklch(var(--oklch-violet))] [--character-counter-warning:oklch(var(--oklch-orange))] [--character-counter-exceed:hsl(var(--destructive))]',
        indigo:
          '[--character-counter-ring:oklch(var(--oklch-indigo))] [--character-counter-warning:oklch(var(--oklch-orange))] [--character-counter-exceed:hsl(var(--destructive))]',
        blue: '[--character-counter-ring:oklch(var(--oklch-blue))] [--character-counter-warning:oklch(var(--oklch-orange))] [--character-counter-exceed:hsl(var(--destructive))]',
        cyan: '[--character-counter-ring:oklch(var(--oklch-cyan))] [--character-counter-warning:oklch(var(--oklch-orange))] [--character-counter-exceed:hsl(var(--destructive))]',
        teal: '[--character-counter-ring:oklch(var(--oklch-teal))] [--character-counter-warning:oklch(var(--oklch-orange))] [--character-counter-exceed:hsl(var(--destructive))]',
        green:
          '[--character-counter-ring:oklch(var(--oklch-green))] [--character-counter-warning:oklch(var(--oklch-orange))] [--character-counter-exceed:hsl(var(--destructive))]',
        lime: '[--character-counter-ring:oklch(var(--oklch-lime))] [--character-counter-warning:oklch(var(--oklch-orange))] [--character-counter-exceed:hsl(var(--destructive))]',
        orange:
          '[--character-counter-ring:oklch(var(--oklch-orange))] [--character-counter-warning:oklch(var(--oklch-orange))] [--character-counter-exceed:hsl(var(--destructive))]',
        pink: '[--character-counter-ring:oklch(var(--oklch-pink))] [--character-counter-warning:oklch(var(--oklch-orange))] [--character-counter-exceed:hsl(var(--destructive))]',
      },
      size: {
        sm: '',
        md: '',
        lg: '',
        xl: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
)

export type CharacterCounterVariantProps = VariantProps<typeof characterCounterVariants>
export type CharacterCounterVariant = NonNullable<CharacterCounterVariantProps['variant']>
export type CharacterCounterSize = NonNullable<CharacterCounterVariantProps['size']>

type CharacterCounterSizeTokens = {
  containerSize: number
  strokeWidth: number
  fontSize: number
  minLabelWidth: number
}

type CharacterCounterColorTokens = {
  ringColor: string
  warningColor: string
  exceedColor: string
  trackColor: string
}

export const CHARACTER_COUNTER_SIZE_TOKENS = {
  sm: { containerSize: 16, strokeWidth: 2, fontSize: 9, minLabelWidth: 16 },
  md: { containerSize: 20, strokeWidth: 2.4, fontSize: 11, minLabelWidth: 18 },
  lg: { containerSize: 24, strokeWidth: 2.8, fontSize: 12, minLabelWidth: 20 },
  xl: { containerSize: 26, strokeWidth: 3, fontSize: 14, minLabelWidth: 24 },
} as const satisfies Record<CharacterCounterSize, CharacterCounterSizeTokens>

const TRACK_COLOR = 'hsl(var(--border))'
const WARNING_COLOR = 'oklch(var(--oklch-orange))'
const EXCEED_COLOR = 'hsl(var(--destructive))'

export const CHARACTER_COUNTER_COLOR_TOKENS = {
  default: {
    ringColor: 'oklch(var(--oklch-blue))',
    warningColor: WARNING_COLOR,
    exceedColor: EXCEED_COLOR,
    trackColor: TRACK_COLOR,
  },
  darkblue: {
    ringColor: 'oklch(var(--oklch-darkblue))',
    warningColor: WARNING_COLOR,
    exceedColor: EXCEED_COLOR,
    trackColor: TRACK_COLOR,
  },
  violet: {
    ringColor: 'oklch(var(--oklch-violet))',
    warningColor: WARNING_COLOR,
    exceedColor: EXCEED_COLOR,
    trackColor: TRACK_COLOR,
  },
  indigo: {
    ringColor: 'oklch(var(--oklch-indigo))',
    warningColor: WARNING_COLOR,
    exceedColor: EXCEED_COLOR,
    trackColor: TRACK_COLOR,
  },
  blue: {
    ringColor: 'oklch(var(--oklch-blue))',
    warningColor: WARNING_COLOR,
    exceedColor: EXCEED_COLOR,
    trackColor: TRACK_COLOR,
  },
  cyan: {
    ringColor: 'oklch(var(--oklch-cyan))',
    warningColor: WARNING_COLOR,
    exceedColor: EXCEED_COLOR,
    trackColor: TRACK_COLOR,
  },
  teal: {
    ringColor: 'oklch(var(--oklch-teal))',
    warningColor: WARNING_COLOR,
    exceedColor: EXCEED_COLOR,
    trackColor: TRACK_COLOR,
  },
  green: {
    ringColor: 'oklch(var(--oklch-green))',
    warningColor: WARNING_COLOR,
    exceedColor: EXCEED_COLOR,
    trackColor: TRACK_COLOR,
  },
  lime: {
    ringColor: 'oklch(var(--oklch-lime))',
    warningColor: WARNING_COLOR,
    exceedColor: EXCEED_COLOR,
    trackColor: TRACK_COLOR,
  },
  orange: {
    ringColor: 'oklch(var(--oklch-orange))',
    warningColor: WARNING_COLOR,
    exceedColor: EXCEED_COLOR,
    trackColor: TRACK_COLOR,
  },
  pink: {
    ringColor: 'oklch(var(--oklch-pink))',
    warningColor: WARNING_COLOR,
    exceedColor: EXCEED_COLOR,
    trackColor: TRACK_COLOR,
  },
} as const satisfies Record<CharacterCounterVariant, CharacterCounterColorTokens>

export function getCharacterCounterSizeTokens(
  size: CharacterCounterSize,
): CharacterCounterSizeTokens {
  return CHARACTER_COUNTER_SIZE_TOKENS[size]
}

export function getCharacterCounterColorTokens(
  variant: CharacterCounterVariant,
): CharacterCounterColorTokens {
  return CHARACTER_COUNTER_COLOR_TOKENS[variant]
}
