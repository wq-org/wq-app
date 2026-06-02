import { cva, type VariantProps } from 'class-variance-authority'

export const scoreVariants = cva('relative inline-flex shrink-0 items-center justify-center', {
  variants: {
    variant: {
      default:
        '[--score-ring:var(--primary)] [--score-track:var(--border)] [--score-label:var(--primary)]',
      darkblue:
        '[--score-ring:oklch(var(--oklch-darkblue))] [--score-track:hsl(var(--border))] [--score-label:oklch(var(--oklch-darkblue))]',
      violet:
        '[--score-ring:oklch(var(--oklch-violet))] [--score-track:hsl(var(--border))] [--score-label:oklch(var(--oklch-violet))]',
      indigo:
        '[--score-ring:oklch(var(--oklch-indigo))] [--score-track:hsl(var(--border))] [--score-label:oklch(var(--oklch-indigo))]',
      blue: '[--score-ring:oklch(var(--oklch-blue))] [--score-track:hsl(var(--border))] [--score-label:oklch(var(--oklch-blue))]',
      cyan: '[--score-ring:oklch(var(--oklch-cyan))] [--score-track:hsl(var(--border))] [--score-label:oklch(var(--oklch-cyan))]',
      teal: '[--score-ring:oklch(var(--oklch-teal))] [--score-track:hsl(var(--border))] [--score-label:oklch(var(--oklch-teal))]',
      green:
        '[--score-ring:oklch(var(--oklch-green))] [--score-track:hsl(var(--border))] [--score-label:oklch(var(--oklch-green))]',
      lime: '[--score-ring:oklch(var(--oklch-lime))] [--score-track:hsl(var(--border))] [--score-label:oklch(var(--oklch-lime))]',
      orange:
        '[--score-ring:oklch(var(--oklch-orange))] [--score-track:hsl(var(--border))] [--score-label:oklch(var(--oklch-orange))]',
      pink: '[--score-ring:oklch(var(--oklch-pink))] [--score-track:hsl(var(--border))] [--score-label:oklch(var(--oklch-pink))]',
    },
    size: {
      xxs: '',
      xs: '',
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
})

export type ScoreVariantProps = VariantProps<typeof scoreVariants>
export type ScoreVariant = NonNullable<ScoreVariantProps['variant']>
export type ScoreSize = NonNullable<ScoreVariantProps['size']>

type ScoreSizeTokens = {
  containerSize: number
  strokeWidth: number
  fontSize: number
  minLabelWidth: number
}

type ScoreColorTokens = {
  ringColor: string
  trackColor: string
  labelColor: string
}

export const SCORE_SIZE_TOKENS = {
  xxs: { containerSize: 18, strokeWidth: 1.75, fontSize: 8, minLabelWidth: 14 },
  xs: { containerSize: 22, strokeWidth: 2, fontSize: 9, minLabelWidth: 18 },
  sm: { containerSize: 28, strokeWidth: 2.25, fontSize: 10, minLabelWidth: 22 },
  md: { containerSize: 36, strokeWidth: 2.75, fontSize: 12, minLabelWidth: 28 },
  lg: { containerSize: 48, strokeWidth: 3.25, fontSize: 15, minLabelWidth: 36 },
  xl: { containerSize: 64, strokeWidth: 4, fontSize: 18, minLabelWidth: 48 },
} as const satisfies Record<ScoreSize, ScoreSizeTokens>

const TRACK_COLOR = 'var(--border)'
export const SCORE_COLOR_TOKENS = {
  default: {
    ringColor: 'var(--primary)',
    trackColor: TRACK_COLOR,
    labelColor: 'var(--primary)',
  },
  darkblue: {
    ringColor: 'oklch(var(--oklch-darkblue))',
    trackColor: TRACK_COLOR,
    labelColor: 'oklch(var(--oklch-darkblue))',
  },
  violet: {
    ringColor: 'oklch(var(--oklch-violet))',
    trackColor: TRACK_COLOR,
    labelColor: 'oklch(var(--oklch-violet))',
  },
  indigo: {
    ringColor: 'oklch(var(--oklch-indigo))',
    trackColor: TRACK_COLOR,
    labelColor: 'oklch(var(--oklch-indigo))',
  },
  blue: {
    ringColor: 'oklch(var(--oklch-blue))',
    trackColor: TRACK_COLOR,
    labelColor: 'oklch(var(--oklch-blue))',
  },
  cyan: {
    ringColor: 'oklch(var(--oklch-cyan))',
    trackColor: TRACK_COLOR,
    labelColor: 'oklch(var(--oklch-cyan))',
  },
  teal: {
    ringColor: 'oklch(var(--oklch-teal))',
    trackColor: TRACK_COLOR,
    labelColor: 'oklch(var(--oklch-teal))',
  },
  green: {
    ringColor: 'oklch(var(--oklch-green))',
    trackColor: TRACK_COLOR,
    labelColor: 'oklch(var(--oklch-green))',
  },
  lime: {
    ringColor: 'oklch(var(--oklch-lime))',
    trackColor: TRACK_COLOR,
    labelColor: 'oklch(var(--oklch-lime))',
  },
  orange: {
    ringColor: 'oklch(var(--oklch-orange))',
    trackColor: TRACK_COLOR,
    labelColor: 'oklch(var(--oklch-orange))',
  },
  pink: {
    ringColor: 'oklch(var(--oklch-pink))',
    trackColor: TRACK_COLOR,
    labelColor: 'oklch(var(--oklch-pink))',
  },
} as const satisfies Record<ScoreVariant, ScoreColorTokens>

export function getScoreSizeTokens(size: ScoreSize): ScoreSizeTokens {
  return SCORE_SIZE_TOKENS[size]
}

export function getScoreColorTokens(variant: ScoreVariant): ScoreColorTokens {
  return SCORE_COLOR_TOKENS[variant]
}
