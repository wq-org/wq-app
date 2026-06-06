import { cva, type VariantProps } from 'class-variance-authority'

export const statusSummaryCardVariants = cva('', {
  variants: {
    variant: {
      default:
        '[--status-summary-accent:oklch(0.72_0_0)] [--status-summary-header:oklch(0.92_0_0/0.12)] [--status-summary-glow:oklch(1_0_0/0.08)]',
      violet:
        '[--status-summary-accent:oklch(var(--oklch-violet))] [--status-summary-header:oklch(var(--oklch-violet)/0.16)] [--status-summary-glow:oklch(var(--oklch-violet)/0.14)]',
      indigo:
        '[--status-summary-accent:oklch(var(--oklch-indigo))] [--status-summary-header:oklch(var(--oklch-indigo)/0.16)] [--status-summary-glow:oklch(var(--oklch-indigo)/0.14)]',
      blue: '[--status-summary-accent:oklch(var(--oklch-blue))] [--status-summary-header:oklch(var(--oklch-blue)/0.16)] [--status-summary-glow:oklch(var(--oklch-blue)/0.14)]',
      cyan: '[--status-summary-accent:oklch(var(--oklch-cyan))] [--status-summary-header:oklch(var(--oklch-cyan)/0.16)] [--status-summary-glow:oklch(var(--oklch-cyan)/0.14)]',
      teal: '[--status-summary-accent:oklch(var(--oklch-teal))] [--status-summary-header:oklch(var(--oklch-teal)/0.16)] [--status-summary-glow:oklch(var(--oklch-teal)/0.14)]',
      green:
        '[--status-summary-accent:oklch(var(--oklch-green))] [--status-summary-header:oklch(var(--oklch-green)/0.16)] [--status-summary-glow:oklch(var(--oklch-green)/0.14)]',
      lime: '[--status-summary-accent:oklch(var(--oklch-lime))] [--status-summary-header:oklch(var(--oklch-lime)/0.16)] [--status-summary-glow:oklch(var(--oklch-lime)/0.14)]',
      orange:
        '[--status-summary-accent:oklch(var(--oklch-orange))] [--status-summary-header:oklch(var(--oklch-orange)/0.16)] [--status-summary-glow:oklch(var(--oklch-orange)/0.14)]',
      pink: '[--status-summary-accent:oklch(var(--oklch-pink))] [--status-summary-header:oklch(var(--oklch-pink)/0.16)] [--status-summary-glow:oklch(var(--oklch-pink)/0.14)]',
      darkblue:
        '[--status-summary-accent:oklch(var(--oklch-darkblue))] [--status-summary-header:oklch(var(--oklch-darkblue)/0.16)] [--status-summary-glow:oklch(var(--oklch-darkblue)/0.14)]',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export type StatusSummaryCardVariant = NonNullable<
  VariantProps<typeof statusSummaryCardVariants>['variant']
>
